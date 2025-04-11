import time

instance_name = "llm_instance"
container_path = "/mnt/data/tim.mazhari/sif/qwq32b.sif"
model_path = "/mnt/data/tim.mazhari/models/qwq32b"
GPUs="5,6,7"


def check_server_status (ssh_conn):
    # Prüfe, ob die Apptainer-Instanz bereits läuft
    check_instance_command = f"apptainer instance list | grep {instance_name}"
    instance_output, instance_error = ssh_conn.run_command(check_instance_command)
    if instance_name not in instance_output:
        set_gpu_command = f"export APPTAINERENV_CUDA_VISIBLE_DEVICES={GPUs}"
        ssh_conn.run_command(set_gpu_command)
        start_instance_command = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={GPUs} apptainer instance start --nv {container_path} {instance_name}"
        ssh_conn.run_command(start_instance_command)

    
    # Prüfe, ob der LLM-Server auf Port 5000 läuft – ausführen innerhalb der Instanz
    check_server_command = f"apptainer exec instance://{instance_name} nc -z localhost 5000 && echo 'running' || echo 'not running'"
    server_status, server_error = ssh_conn.run_command(check_server_command)
    return server_status, server_error

def start_server(ssh_conn):
    
    if "not running" in check_server_status(ssh_conn):
        # Starte den LLM-Server innerhalb der Instanz (im Hintergrund mit nohup)
        start_server_command = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={GPUs} apptainer exec instance://{instance_name} nohup python3 /home/tim.mazhari/llm_server.py > /home/tim.mazhari/llm_server.log 2>&1 &"
        ssh_conn.run_command(start_server_command)
        # Warte, bis der Server bereit ist, mit Polling (maximal 180 Sekunden)
        timeout = 180
        poll_interval = 5
        elapsed = 0
        while elapsed < timeout:
            check_ready_cmd = f"apptainer exec instance://{instance_name} nc -z localhost 5000 && echo 'ready' || echo 'not ready'"
            ready_status, _ = ssh_conn.run_command(check_ready_cmd)
            if "ready" == ready_status:
                break
            time.sleep(poll_interval)
            elapsed += poll_interval
        if ready_status == "ready":
            return True
        else: 
            return False
    else:
        return True

def execute_prompt(ssh_conn, query):
    """
    Führt den Prompt aus, indem er die Anfrage an den persistenten LLM-Server weiterleitet.
    
    Falls die Apptainer-Instanz oder der LLM-Server (auf Port 5000) noch nicht läuft, werden
    diese automatisch gestartet. Dabei wird sichergestellt, dass nur die GPUs 0, 1 und 2 genutzt werden.
    
    Hinweis: Ersetze '/pfad/zu/llm_server.py' durch den tatsächlichen Pfad von llm_server.py
    innerhalb der Instanz.
    """
    # Escape einfache Anführungszeichen in der Query
    escaped_query = query.replace("'", "'\\''")
    if "_USE_RAG_" in escaped_query:
        print("TESTTESTTESTTEST")

        
    # Sende die Anfrage an den LLM-Server – führe den netcat-Befehl innerhalb der Instanz aus
    cmd = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={GPUs} apptainer exec instance://{instance_name} bash -c \"echo '{escaped_query}' | nc localhost 5000\""
    output, error = ssh_conn.run_command(cmd)
    return output, error

def process_pdf(ssh_conn, remote_pdf, remote_dir, filepath):

    ssh_conn.run_command(f"mkdir -p {remote_dir}")

    ssh_conn.upload_file(filepath, remote_pdf)
 
    process_cmd = f"""
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os

pdf_path = \\\"{remote_pdf}\\\"
index_dir = \\\"/mnt/data/tim.mazhari/rag/rag_index\\\"
print(\\\"testtest\\\")
loader = PyPDFLoader(pdf_path)
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
docs = loader.load_and_split(splitter)

embeddings = HuggingFaceEmbeddings(
    model_name=\\\"/mnt/data/tim.mazhari/models/sentence-transformers/all-mpnet-base-v2\\\",
    model_kwargs={{\\\"device\\\": \\\"cuda\\\"}}
)

if os.path.exists(index_dir):
    vectorstore = FAISS.load_local(index_dir, embeddings, allow_dangerous_deserialization=True)
    vectorstore.add_documents(docs)
else:
    vectorstore = FAISS.from_documents(docs, embeddings, allow_dangerous_deserialization=True)

vectorstore.save_local(index_dir)
print(\\\"PDF_SUCCESS\\\")
"""
    escaped_cmd = process_cmd.replace("'", "'\\''")
    cmd = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={GPUs} apptainer exec instance://{instance_name} python3 -c \"{escaped_cmd}\" | nc localhost 5000"
    output, error = ssh_conn.run_command(cmd)
    return output, error
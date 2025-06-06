#THIS SCRIPT IS TO BE RUN ON THE DGX-2! 
#It is the LLM server for the Arztbrief Generator.
#It is started as a service on the DGX-2.   
#It is in this project solely so that the code is complete on github.

import socket
import torch, time, os
from transformers import AutoTokenizer, AutoModelForCausalLM
import logging
from langchain_community.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")

# Modell einmalig laden
model_path = "/mnt/data/tim.mazhari/models/qwq32b"
torch.cuda.init()
assert torch.cuda.is_available(), "CUDA nicht verfügbar!"
tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    local_files_only=True,
    torch_dtype=torch.bfloat16,
    device_map="auto"
).eval()

index_path = "/mnt/data/tim.mazhari/rag/rag_index"
index_file = os.path.join(index_path, "index.faiss")
embedding_model_path = "/mnt/data/tim.mazhari/models/sentence-transformers/all-mpnet-base-v2"

# Globale Variablen zum Merken des Index-Status
retriever = None
_last_index_mtime = None
_last_index_size = None

def ensure_retriever():
    global retriever, _last_index_mtime, _last_index_size
    if not os.path.exists(index_file):
        retriever = None
        return
    stat = os.stat(index_file)
    mtime, size = stat.st_mtime, stat.st_size
    # Lade nur neu, wenn sich der Index verändert hat
    if retriever is None or mtime != _last_index_mtime or size != _last_index_size:
        logging.info("Lade FAISS-Index neu...")
        embeddings = HuggingFaceEmbeddings(model_name=embedding_model_path, model_kwargs={"device": "cuda"})
        vectorstore = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
        _last_index_mtime = mtime
        _last_index_size = size
    else:
        logging.debug("FAISS-Index unverändert, benutze bestehenden Retriever.")

def generate_answer(query, max_new_tokens=1024):
    stripAnswer = False
    if "_USE_RAG_" in query:
        query = query.replace("_USE_RAG_", "")
        stripAnswer = True


    inputs = tokenizer(query, return_tensors="pt").to("cuda")
    start_time = time.time()
    outputs = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
        do_sample=True,
        temperature=0.1,
        top_p=0.8,
        pad_token_id=tokenizer.eos_token_id
    )
    generation_time = time.time() - start_time
    answer = "ANTWORT:" + tokenizer.decode(outputs[0], skip_special_tokens=True)
    logging.debug("outputs0: %s", outputs[0])
    logging.debug("Answer in generate_answer: %s", answer)
    if stripAnswer:
        answer = answer.replace(query, "").strip()
    return answer, generation_time

HOST = "0.0.0.0"
PORT = 5000

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind((HOST, PORT))
server_socket.listen(5)
print("LLM Server gestartet, lauscht auf Port", PORT)

while True:
    conn, addr = server_socket.accept()
    data = conn.recv(8192)
    if not data:
        conn.close()
        continue
    query = data.decode("utf-8")  
    logging.debug("Received query: %s", query)

    # Prüfe und lade ggf. den Retriever (RAG-Index)

    if "_USE_RAG_" in query:
        ensure_retriever()
        try:
            if retriever is None:
                answer = "Kein RAG-Index vorhanden."
                generation_time = 0
            else:
                start_time = time.time()
                relevant_docs = retriever.invoke(query)
                relevant_passages = "\n".join([f"- {doc.page_content}" for doc in relevant_docs])
                logging.debug("relevant_passages: %s", relevant_passages)
                logging.debug("relevant_docs: %s", relevant_docs)
                extended_query = f"""- Generiere mir eine Zusammenfassung für einen Arztbrief. \n
- Orientiere dich dabei an dem gegebenen Beispiel. \n
- Gib als Ausgabe NUR EINE Zusammenfassung und NICHT den Arztbrief oder deine Gedanken. \n
- Die Zusammenfassung soll ein Fliesstext OHNE Stichpunkte sein. \n
- Erstelle NUR EINE Zusammenfassung welche ALLE ELEMENTE des Arztbriefes abdeckt. \n 
Arztbrief: \n
---\n
{query} \n
---\n
Beispiel: \n
--- \n
{relevant_passages} \n
---"""
                logging.debug("extended_query: %s", extended_query)
                answer, generation_time = generate_answer(extended_query)
        except Exception as e:
            logging.error(f"Fehler bei der RAG-Verarbeitung: {e}")
            answer = "Fehler bei der RAG-Verarbeitung"
            generation_time = 0
    elif "Processing PDF:" in query:
        logging.debug("Processing PDF without generate_answer")
        answer = "PDF_SUCCESS"
        generation_time = 0
    elif "_LOCAL_LLM_QUERY_" in query:
        query = query.replace("_LOCAL_LLM_QUERY_", "")
        answer, generation_time = generate_answer(query)
    else:
        answer, generation_time = generate_answer(query)
    
    response = answer + f"\n\n[Generation time: {generation_time:.2f}s]"
    logging.debug("response: %s", response)
    conn.sendall(response.encode("utf-8"))
    logging.debug("response sent")
    conn.close()
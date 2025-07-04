
from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import os
import paramiko
import tempfile
import json
import pdb;

app = Flask(__name__)
# Hier ändern wir CORS-Einstellungen: nur für API-Endpunkte, nicht für Frontend-Routen
CORS(app, resources={r"/api/*": {"origins": "*"}, 
                     r"/status": {"origins": "*"},
                     r"/start": {"origins": "*"},
                     r"/query": {"origins": "*"},
                     r"/poll-response": {"origins": "*"},
                     r"/process-pdf": {"origins": "*"}})

serverconfig = json.load(open("../src/services/serverconfig.json"))

host = serverconfig['host']
user = serverconfig['user']
password = serverconfig['password']
instanceName = serverconfig['instanceName']
containerPath = serverconfig['containerPath']
modelPath = serverconfig['modelPath']
ragModelPath = serverconfig['ragModelPath']
serverCodePath = serverconfig['serverCodePath']
logPath = serverconfig['logPath']
ragDirectory = serverconfig['ragDirectory']
ragIndexDirectory = serverconfig['ragIndexDirectory']
gpus = serverconfig['gpus']



# Global SSH client
ssh_client = None

# Response cache for delayed responses
response_cache = {}

def get_ssh_connection():
    """Establish SSH connection using provided config"""
    global ssh_client
    
    if ssh_client and ssh_client.get_transport() and ssh_client.get_transport().is_active():
        return ssh_client
    
    ssh_client = paramiko.SSHClient()
    ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh_client.connect(
            hostname=host,
            username=user,
            password=password
        )
        return ssh_client
    except Exception as e:
        print(f"SSH connection error: {str(e)}")
        return None

def run_ssh_command(ssh_client, command):
    """Run command via SSH and return output"""
    if not ssh_client:
        return "", "SSH connection not established"
    
    try:
        stdin, stdout, stderr = ssh_client.exec_command(command, timeout=600)
        # Warte, bis das Kommando fertig ist
        exit_status = stdout.channel.recv_exit_status()  # Blockiert, bis fertig
        output = stdout.read().decode("utf-8")
        error = stderr.read().decode("utf-8")
        return output, error    
    except Exception as e:
        return "", f"Command execution error: {str(e)}"

def check_server_status(ssh_client):
    """Check if the LLM server is running"""
    
    # Check if the Apptainer instance is running
    check_instance_command = f"apptainer instance list | grep {instanceName}"
    instance_output, instance_error = run_ssh_command(ssh_client, check_instance_command)
    
    # Check if the LLM server is running on port 5000
    check_server_command = f"apptainer exec instance://{instanceName} nc -z localhost 5000 && echo 'running' || echo 'not running'"
    server_status, server_error = run_ssh_command(ssh_client, check_server_command)
    
    return instance_output, server_status, server_error

def start_server(ssh_client):
    """Start the LLM server if it's not running"""
    
    # Check instance
    instance_output, server_status, server_error = check_server_status(ssh_client)
    # If instance is not running, start it
    if instanceName not in instance_output:
        set_gpu_command = f"export APPTAINERENV_CUDA_VISIBLE_DEVICES={gpus}"
        run_ssh_command(ssh_client, set_gpu_command)
        
        start_instance_command = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={gpus} apptainer instance start --nv {containerPath} {instanceName}"
        run_ssh_command(ssh_client, start_instance_command)
    
    # If server is not running, start it
    if "not running" in server_status:
        start_server_command = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={gpus} apptainer exec instance://{instanceName} nohup python3 {serverCodePath} > {logPath} 2>&1 &"
        run_ssh_command(ssh_client, start_server_command)
        
        # Poll until server is ready (max 180 seconds)
        timeout = 180
        poll_interval = 5
        elapsed = 0
        
        while elapsed < timeout:
            check_ready_cmd = f"apptainer exec instance://{instanceName} nc -z localhost 5000 && echo 'ready' || echo 'not ready'"
            ready_status, _ = run_ssh_command(ssh_client, check_ready_cmd)
            if ("ready" in ready_status) & ("not ready" not in ready_status):
                return True
                
            time.sleep(poll_interval)
            elapsed += poll_interval
            
        return False
    else:
        return True

def generate_cache_key(query):
    """Generate a cache key for a query"""
   
    return f"{query}_{instanceName}_{gpus}"

import uuid
import shutil
import pdb
from fpdf import FPDF

def execute_prompt(ssh_client, query, use_rag=False):
    """Execute prompt on the LLM server. Unterstützt _USE_RAG_ (persistenter Index) und _TEMP_RAG_ (temporärer Kontext direkt im Prompt)."""
    import tempfile
 
    # Normales Verhalten (inkl. persistentem RAG)
    escaped_query = query.replace("'", "'\\''")
    if use_rag and "_LOCAL_LLM_QUERY_" not in query:
        escaped_query = "_USE_RAG_ " + escaped_query
    
    cache_key = generate_cache_key(query)
    cmd = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={gpus} apptainer exec instance://{instanceName} bash -c \"echo '{escaped_query}' | nc localhost 5000\""
    output, error = run_ssh_command(ssh_client, cmd)
    response_cache[cache_key] = output
    return {"success": True, "response": output}
  

def poll_response(ssh_client, query):
    """Poll for a response that might have been delayed"""
    cache_key = generate_cache_key(query)
    
    # Check if we have a cached response
    if cache_key in response_cache:
        return {"success": True, "response": response_cache[cache_key]}
    
    # No cached response, try to get a fresh one
    # This could be modified to check logs or other sources
    
    # Try to check if there's an updated response available
    check_cmd = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={gpus} apptainer exec instance://{instanceName} bash -c \"cat {logPath} | grep -A 10 '{query}' | tail -1\""
    output, error = run_ssh_command(ssh_client, check_cmd)
    
    if output and not error:
        # Store in cache and return
        response_cache[cache_key] = output
        return {"success": True, "response": output}
    else:
        return {"success": False, "message": "No delayed response available"}

def process_pdf(ssh_client, file_path):
    """Process PDF for RAG capabilities"""
    # Upload file to remote
    file_name = os.path.basename(file_path)
    if "temp_rag" in file_path:
        remote_path = f"/mnt/data/tim.mazhari/rag/temp_rag/rag_docs/{file_name}"
        ragIndexDirectory = "/mnt/data/tim.mazhari/rag/temp_rag/rag_index"
    else:
        ragIndexDirectory = serverconfig['ragIndexDirectory']
        remote_path = f"{ragDirectory}/{file_name}"
         # Create directory
        run_ssh_command(ssh_client, f"mkdir -p {ragIndexDirectory}")
    
        # Upload file
        try:
            sftp = ssh_client.open_sftp()
            sftp.put(file_path, remote_path)
            sftp.close()
        except Exception as e:
            return {"success": False, "message": f"File upload error: {str(e)}"}
    # Process the PDF
    process_cmd = f"""
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os
import traceback

pdf_path = \\"{remote_path}\\"
index_dir = \\"{ragIndexDirectory}\\"
print(\\"Processing PDF: {file_name}\\")

try:
    loader = PyPDFLoader(pdf_path)
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = loader.load_and_split(splitter)
    print(\\"PDF geladen und gesplittet, Anzahl Chunks:\\", len(docs))
except Exception as e:
    print(\\"Fehler beim Laden/Splitten des PDFs:\\", e)
    traceback.print_exc()
    exit(1)

try:
    embeddings = HuggingFaceEmbeddings(
        model_name=\\"{ragModelPath}\\",
        model_kwargs={{\\\"device\\\": \\\"cuda\\\"}}
    )   
    print(\\"Embeddings geladen\\")

    if os.path.exists(f'\\\"index_dir/index.faiss\\\"'):
        vectorstore = FAISS.load_local(f'\\\"index_dir/index.faiss\\\"')
        print(\\"FAISS-Index geladen\\")
    else:
        vectorstore = FAISS.from_documents(docs, embeddings)
        print(\\"FAISS-Index erstellt\\")
        vectorstore.save_local(index_dir)
        print(\\"FAISS-Index gespeichert\\")
    print(\\"PDF_SUCCESS\\")
except Exception as e:
    print(\\"Fehler beim Index-Bau:\\", e)
    traceback.print_exc()
    exit(1)
"""
    escaped_cmd = process_cmd.replace("'", "'\\''")
    cmd = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={gpus} apptainer exec instance://{instanceName} python3 -c \"{escaped_cmd}\" | nc localhost 5000"
    output, error = run_ssh_command(ssh_client, cmd)
    
    if "PDF_SUCCESS" in output:
        return {"success": True, "message": "PDF processed successfully"}
    else:
        return {"success": False, "message": f"PDF processing error: {error or 'Unknown error'}"}


@app.route('/api')
@app.route('/api/')
def api_home():
    """Root API endpoint for testing"""
    return jsonify({
        "status": "running", 
        "message": "Flask backend API is operational",
        "endpoints": {
            "/status": "Check server status",
            "/start": "Start server",
            "/query": "Execute LLM query",
            "/poll-response": "Poll for delayed response",
            "/process-pdf": "Process PDF for RAG"
        }
    })

@app.route('/status')
def get_status():
    """Check server status"""
    try:
        ssh_client = get_ssh_connection()
        
        if not ssh_client:
            return jsonify({"running": False, "message": "Failed to establish SSH connection"})
                
        instance_output, server_status, server_error = check_server_status(ssh_client)
        running = not ("not running" in server_status)
        
        return jsonify({
            "running": running,
            "message": f"Server status: {'running' if running else 'not running'}"
        })
    except Exception as e:
        print(f"Error in status endpoint: {str(e)}")
        return jsonify({"running": False, "message": f"Error checking status: {str(e)}"})

@app.route('/start', methods=['POST'])
def start():
    """Start the server"""
    try:
        ssh_client = get_ssh_connection()
        
        if not ssh_client:
            return jsonify({
                "success": False,
                "message": "Failed to establish SSH connection"
            })
        
        success = start_server(ssh_client)
        return jsonify({
            "success": success,
            "message": f"Server {'started successfully' if success else 'failed to start'}"
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Error starting server: {str(e)}"})

@app.route('/query', methods=['POST'])
def query():
    """Execute a query on the LLM"""
    try:
        data = request.json
        query = data.get('query', '')
        use_rag = data.get('use_rag', False)
        
        ssh_client = get_ssh_connection()
        
        if not ssh_client:
            return jsonify({
                "success": False,
                "message": "Failed to establish SSH connection"
            })
        
        # Make sure server is running
        server_started = start_server(ssh_client)
        
        if not server_started:
            return jsonify({
                "success": False,
                "message": "Failed to start LLM server"
            })
        
        # Execute the query
        result = execute_prompt(ssh_client, query, use_rag)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": f"Error executing query: {str(e)}"})

@app.route('/poll-response', methods=['POST'])
def poll_response_endpoint():
    """Poll for a delayed response"""
    try:
        data = request.json
        query = data.get('query', '')
        
        ssh_client = get_ssh_connection()
        
        if not ssh_client:
            return jsonify({
                "success": False,
                "message": "Failed to establish SSH connection"
            })
        
        # Poll for response
        result = poll_response(ssh_client, query)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": f"Error polling for response: {str(e)}"})

@app.route('/process-pdf', methods=['POST'])
def process_pdf_endpoint():
    """Process multiple PDF files for RAG"""
    try:
        # Accept both 'file' (single) and 'files' (multiple)
        files = request.files.getlist('files')
        if not files or files == [None] or (len(files) == 1 and files[0].filename == ''):
            # Fallback: try single file for backward compatibility
            single_file = request.files.get('file')
            if not single_file or single_file.filename == '':
                return jsonify({"success": False, "message": "No files provided"})
            files = [single_file]

        temp_dir = tempfile.gettempdir()
        results = []
        ssh_client = get_ssh_connection()
        if not ssh_client:
            return jsonify({
                "success": False,
                "message": "Failed to establish SSH connection"
            })
        # Make sure server is running
        server_started = start_server(ssh_client)
        if not server_started:
            return jsonify({
                "success": False,
                "message": "Failed to start LLM server"
            })
        for file in files:
            if not file or file.filename == '':
                results.append({"success": False, "message": "Empty or invalid file", "filename": getattr(file, 'filename', None)})
                continue
            temp_file_path = os.path.join(temp_dir, file.filename)
            file.save(temp_file_path)
            try:
                result = process_pdf(ssh_client, temp_file_path)
                result["filename"] = file.filename
            except Exception as e:
                result = {"success": False, "message": f"Error processing {file.filename}: {str(e)}", "filename": file.filename}
            finally:
                try:
                    os.remove(temp_file_path)
                except Exception:
                    pass
            results.append(result)
        return jsonify({"results": results, "success": all(r.get("success") for r in results)})
    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing PDFs: {str(e)}"})

# Add an error handler for all exceptions
@app.errorhandler(Exception)
def handle_exception(e):
    """Return JSON instead of HTML for any other error"""
    # Start with the correct headers and status code
    response = jsonify({"success": False, "message": str(e)})
    response.status_code = 500
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

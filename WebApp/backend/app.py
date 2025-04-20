
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

# Global SSH client
ssh_client = None

# Response cache for delayed responses
response_cache = {}

def get_ssh_connection(config):
    """Establish SSH connection using provided config"""
    global ssh_client
    
    if ssh_client and ssh_client.get_transport() and ssh_client.get_transport().is_active():
        return ssh_client
    
    ssh_client = paramiko.SSHClient()
    ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh_client.connect(
            hostname=config.get('host'),
            username=config.get('user'),
            password=config.get('password')
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
        stdin, stdout, stderr = ssh_client.exec_command(command)
        output = stdout.read().decode().strip()
        error = stderr.read().decode().strip()
        return output, error
    except Exception as e:
        return "", f"Command execution error: {str(e)}"

def check_server_status(ssh_client, config):
    """Check if the LLM server is running"""
    instance_name = config.get('instanceName')
    
    # Check if the Apptainer instance is running
    check_instance_command = f"apptainer instance list | grep {instance_name}"
    instance_output, instance_error = run_ssh_command(ssh_client, check_instance_command)
    
    # Check if the LLM server is running on port 5000
    check_server_command = f"apptainer exec instance://{instance_name} nc -z localhost 5000 && echo 'running' || echo 'not running'"
    server_status, server_error = run_ssh_command(ssh_client, check_server_command)
    
    return instance_output, server_status, server_error

def start_server(ssh_client, config):
    """Start the LLM server if it's not running"""
    instance_name = config.get('instanceName')
    container_path = config.get('containerPath')
    gpus = config.get('gpus')
    
    # Check instance
    instance_output, server_status, server_error = check_server_status(ssh_client, config)
    # If instance is not running, start it
    if instance_name not in instance_output:
        set_gpu_command = f"export APPTAINERENV_CUDA_VISIBLE_DEVICES={gpus}"
        run_ssh_command(ssh_client, set_gpu_command)
        
        start_instance_command = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={gpus} apptainer instance start --nv {container_path} {instance_name}"
        run_ssh_command(ssh_client, start_instance_command)
    
    # If server is not running, start it
    if "not running" in server_status:
        start_server_command = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={gpus} apptainer exec instance://{instance_name} nohup python3 /home/tim.mazhari/llm_server.py > /home/tim.mazhari/llm_server.log 2>&1 &"
        run_ssh_command(ssh_client, start_server_command)
        
        # Poll until server is ready (max 180 seconds)
        timeout = 180
        poll_interval = 5
        elapsed = 0
        
        while elapsed < timeout:
            check_ready_cmd = f"apptainer exec instance://{instance_name} nc -z localhost 5000 && echo 'ready' || echo 'not ready'"
            ready_status, _ = run_ssh_command(ssh_client, check_ready_cmd)
            if "ready" == ready_status:
                return True
                
            time.sleep(poll_interval)
            elapsed += poll_interval
            
        return False
    else:
        return True

def generate_cache_key(query, config):
    """Generate a cache key for a query"""
    instance_name = config.get('instanceName', 'default')
    gpus = config.get('gpus', '0')
    return f"{query}_{instance_name}_{gpus}"

def execute_prompt(ssh_client, config, query, use_rag=False):
    """Execute prompt on the LLM server"""
    instance_name = config.get('instanceName')
    gpus = config.get('gpus')
    
    # Escape single quotes in the query
    escaped_query = query.replace("'", "'\\''")
    
    if use_rag:
        escaped_query = "_USE_RAG_ " + escaped_query
    
    # Generate a cache key for this query
    cache_key = generate_cache_key(query, config)
    
    # Send query to LLM server
    cmd = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={gpus} apptainer exec instance://{instance_name} bash -c \"echo '{escaped_query}' | nc localhost 5000\""
    output, error = run_ssh_command(ssh_client, cmd)
    
    # Store the response in the cache to be available for polling
    if output:
        response_cache[cache_key] = output
    return {"success": True, "response": output}
  

def poll_response(ssh_client, config, query):
    """Poll for a response that might have been delayed"""
    cache_key = generate_cache_key(query, config)
    
    # Check if we have a cached response
    if cache_key in response_cache:
        return {"success": True, "response": response_cache[cache_key]}
    
    # No cached response, try to get a fresh one
    # This could be modified to check logs or other sources
    instance_name = config.get('instanceName')
    gpus = config.get('gpus')
    
    # Try to check if there's an updated response available
    check_cmd = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={gpus} apptainer exec instance://{instance_name} bash -c \"cat /home/tim.mazhari/llm_server.log | grep -A 10 '{query}' | tail -1\""
    output, error = run_ssh_command(ssh_client, check_cmd)
    
    if output and not error:
        # Store in cache and return
        response_cache[cache_key] = output
        return {"success": True, "response": output}
    else:
        return {"success": False, "message": "No delayed response available"}

def process_pdf(ssh_client, config, file_path):
    """Process PDF for RAG capabilities"""
    instance_name = config.get('instanceName')
    gpus = config.get('gpus')
    
    # Upload file to remote
    remote_dir = "/mnt/data/tim.mazhari/rag/rag_docs"
    file_name = os.path.basename(file_path)
    remote_path = f"{remote_dir}/{file_name}"
    
    # Create directory
    run_ssh_command(ssh_client, f"mkdir -p {remote_dir}")
    
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

pdf_path = \\"{remote_path}\\"
index_dir = \\"/mnt/data/tim.mazhari/rag/rag_index\\"
print(\\"Processing PDF: {file_name}\\")
loader = PyPDFLoader(pdf_path)
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
docs = loader.load_and_split(splitter)

embeddings = HuggingFaceEmbeddings(
    model_name=\\"/mnt/data/tim.mazhari/models/sentence-transformers/all-mpnet-base-v2\\",
    model_kwargs={{\\\"device\\\": \\\"cuda\\\"}}
)

if os.path.exists(index_dir):
    vectorstore = FAISS.load_local(index_dir, embeddings, allow_dangerous_deserialization=True)
    vectorstore.add_documents(docs)
else:
    vectorstore = FAISS.from_documents(docs, embeddings, allow_dangerous_deserialization=True)

vectorstore.save_local(index_dir)
print(\\"PDF_SUCCESS\\")
"""
    escaped_cmd = process_cmd.replace("'", "'\\''")
    cmd = f"APPTAINERENV_CUDA_VISIBLE_DEVICES={gpus} apptainer exec instance://{instance_name} python3 -c \"{escaped_cmd}\" | nc localhost 5000"
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
        config = request.args.get('config', None)
        
        if not config:
            config = {
                "host": "sx-el-121920.ost.ch",
                "user": "tim.mazhari",
                "password": "REMOVED",
                "instanceName": "llm_instance",
                "containerPath": "/mnt/data/tim.mazhari/sif/qwq32b.sif",
                "modelPath": "/mnt/data/tim.mazhari/models/qwq32b",
                "gpus": "5,6,7"
            }
        
        ssh_client = get_ssh_connection(config)
        
        if not ssh_client:
            return jsonify({"running": False, "message": "Failed to establish SSH connection"})
                
        instance_output, server_status, server_error = check_server_status(ssh_client, config)
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
        config = request.json
        ssh_client = get_ssh_connection(config)
        
        if not ssh_client:
            return jsonify({
                "success": False,
                "message": "Failed to establish SSH connection"
            })
        
        success = start_server(ssh_client, config)
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
        config = data.get('config', {})
        
        ssh_client = get_ssh_connection(config)
        
        if not ssh_client:
            return jsonify({
                "success": False,
                "message": "Failed to establish SSH connection"
            })
        
        # Make sure server is running
        server_started = start_server(ssh_client, config)
        
        if not server_started:
            return jsonify({
                "success": False,
                "message": "Failed to start LLM server"
            })
        
        # Execute the query
        result = execute_prompt(ssh_client, config, query, use_rag)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": f"Error executing query: {str(e)}"})

@app.route('/poll-response', methods=['POST'])
def poll_response_endpoint():
    """Poll for a delayed response"""
    try:
        data = request.json
        query = data.get('query', '')
        config = data.get('config', {})
        
        ssh_client = get_ssh_connection(config)
        
        if not ssh_client:
            return jsonify({
                "success": False,
                "message": "Failed to establish SSH connection"
            })
        
        # Poll for response
        result = poll_response(ssh_client, config, query)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": f"Error polling for response: {str(e)}"})

@app.route('/process-pdf', methods=['POST'])
def process_pdf_endpoint():
    """Process a PDF file for RAG"""
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "message": "No file provided"})
        
        file = request.files['file']
        config_str = request.form.get('config', '{}')
        
        if file.filename == '':
            return jsonify({"success": False, "message": "No file selected"})
        
        # Save uploaded file temporarily
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, file.filename)
        file.save(temp_file_path)
        
        # Get config
        import json
        config = json.loads(config_str)
        
        # Process the PDF
        ssh_client = get_ssh_connection(config)
        
        if not ssh_client:
            return jsonify({
                "success": False,
                "message": "Failed to establish SSH connection"
            })
        
        # Make sure server is running
        server_started = start_server(ssh_client, config)
        
        if not server_started:
            return jsonify({
                "success": False,
                "message": "Failed to start LLM server"
            })
        
        # Process the PDF
        result = process_pdf(ssh_client, config, temp_file_path)
        
        # Clean up
        os.remove(temp_file_path)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing PDF: {str(e)}"})

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

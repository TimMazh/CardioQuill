
# CardioVista Python Backend

This is the Python backend for the CardioVista application. It handles connections to the remote SSH server and manages the LLM interactions.

## Setup

1. Create a virtual environment (recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the Flask application:
   ```
   python app.py
   ```

The backend will start at http://localhost:5000

## Endpoints

- `GET /status` - Check if the LLM server is running
- `POST /start` - Start the LLM server
- `POST /query` - Execute a query on the LLM
- `POST /process-pdf` - Process a PDF file for RAG capabilities

## Configuration

The default server configuration is:
- Host: sx-el-121920.ost.ch
- User: tim.mazhari
- Instance Name: llm_instance
- Container Path: /mnt/data/tim.mazhari/sif/qwq32b.sif
- Model Path: /mnt/data/tim.mazhari/models/qwq32b
- GPUs: dynamic (eg. 5,6,7)

You can modify these values in the frontend application or by passing a different configuration to the API endpoints.

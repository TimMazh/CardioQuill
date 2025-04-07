import tkinter as tk
from tkinter import scrolledtext, ttk, filedialog
from threading import Thread
import queue
import os
import time
from ssh_connection import SSHConnection
from prompt_executor import execute_prompt
from prompt_executor import start_server
from prompt_executor import check_server_status


class LLMClientGUI:
    def __init__(self, master):
        self.master = master
        master.title("DGX-2 LLM Client")
        
        # Konfiguration
        self.prompt = "Wer ist der Schweizer Nationalheld?"
        self.ssh_host = "sx-el-121920.ost.ch"
        self.ssh_user = "tim.mazhari"
        self.ssh_key_path = ""
        self.container_path = "/mnt/data/tim.mazhari/sif/qwq32b.sif"
        self.model_path = "/mnt/data/tim.mazhari/models/qwq32b"
        
        self.setup_gui()
        self.output_queue = queue.Queue()
        self.master.after(100, self.process_queue)
        self.rag_ssh_enabled = False
        self.uploaded_pdfs = []
        
        # Serverstatus initialisieren
        self.server_status = "not running"

    def setup_gui(self):
        self.notebook = ttk.Notebook(self.master)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        self.ssh_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.ssh_tab, text="DGX-2 SSH")
        self.setup_ssh_tab()

        # Status Bars
        self.status_var = tk.StringVar(value="Bereit")
        self.status_bar = tk.Label(self.master, textvariable=self.status_var, relief=tk.SUNKEN)
        self.status_bar.pack(fill=tk.X)

        self.server_status_var = tk.StringVar(value="Server Status: checking...")
        ssh_conn = SSHConnection(self.ssh_host, self.ssh_user, self.ssh_key_path)
        ssh_conn.connect()
        self.server_status, error = check_server_status(ssh_conn, self.container_path)
        if "running" == self.server_status:
            self.server_status_var.set("Server Status: running")
        else:
            self.server_status_var.set("Server Status: not running")
        ssh_conn.close()

        self.server_status_label = tk.Label(self.master, textvariable=self.server_status_var, relief=tk.RAISED)
        self.server_status_label.pack(fill=tk.X)

    def setup_ssh_tab(self):
        tk.Label(self.ssh_tab, text="SSH Anfrage:").pack()
        self.ssh_input = tk.Text(self.ssh_tab, height=5, width=80)
        self.ssh_input.insert("1.0", self.prompt)
        self.ssh_input.pack()
        
        tk.Button(self.ssh_tab, text="Anfrage senden", command=self.send_ssh_request).pack()
        
        tk.Label(self.ssh_tab, text="Antwort:").pack()
        self.ssh_output = scrolledtext.ScrolledText(self.ssh_tab, height=20, width=80, state='disabled')
        self.ssh_output.pack()

        rag_frame = ttk.Frame(self.ssh_tab)
        rag_frame.pack(fill=tk.X, pady=5)

        ttk.Button(rag_frame, 
                 text="PDF hochladen (DGX-2)", 
                 command=self.upload_pdf_to_dgx).pack(side=tk.LEFT, padx=5)
        
        self.rag_ssh_toggle = ttk.Button(
            rag_frame,
            text="RAG aktivieren",
            command=self.toggle_ssh_rag
        )
        self.rag_ssh_toggle.pack(side=tk.LEFT, padx=5)
        
        self.pdf_list_ssh = tk.Listbox(rag_frame, height=3, width=50)
        self.pdf_list_ssh.pack(side=tk.LEFT, padx=5)

    
    def upload_pdf_to_dgx(self):
        filepath = filedialog.askopenfilename(filetypes=[("PDF Files", "*.pdf")])
        if not filepath:
            return
        self.output_queue.put(("status", "Lade PDF auf DGX-2 hoch..."))
        Thread(target=self._process_remote_pdf, args=(filepath,), daemon=True).start()
    
    def _process_remote_pdf(self, filepath):
        try:
            ssh_conn = SSHConnection(self.ssh_host, self.ssh_user, self.ssh_key_path)
            ssh_conn.connect()
            self.output_queue.put(("status", "Verbunden mit DGX-2"))
    
            remote_dir = "/mnt/data/tim.mazhari/rag/rag_docs/"
            remote_pdf = remote_dir + os.path.basename(filepath)
    
            ssh_conn.run_command(f"mkdir -p {remote_dir}")
            self.output_queue.put(("status", "RAG Verzeichnis erstellt"))
    
            ssh_conn.upload_file(filepath, remote_pdf)
            self.output_queue.put(("status", "Dokument Hochgeladen"))
    
            process_cmd = f"""export APPTAINERENV_CUDA_VISIBLE_DEVICES=0,1,2 && apptainer exec --nv {self.container_path} python3 -c '
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
            self.output_queue.put(("status", "Dokument Splitten..."))
            output, error = ssh_conn.run_command(process_cmd)
    
            if "PDF_SUCCESS" in output:
                self.uploaded_pdfs.append(remote_pdf)
                self.pdf_list_ssh.insert(tk.END, os.path.basename(filepath))
                self.output_queue.put(("ssh", f"PDF verarbeitet: {os.path.basename(filepath)}"))
                self.output_queue.put(("status", "PDF Verarbeitet"))
            else:
                self.output_queue.put(("ssh", f"Fehler: {error}"))
    
            ssh_conn.close()
    
        except Exception as e:
            self.output_queue.put(("ssh", f"Upload-Fehler: {str(e)}"))
    
    def toggle_ssh_rag(self):
        self.rag_ssh_enabled = not self.rag_ssh_enabled
        status = "aktiviert" if self.rag_ssh_enabled else "deaktiviert"
        self.rag_ssh_toggle.config(
            text=f"RAG {status}",
            style="TButton" if not self.rag_ssh_enabled else "Accent.TButton"
        )
        self.output_queue.put(("ssh", f"RAG {status}"))
    
    def process_queue(self):
        while not self.output_queue.empty():
            tab, output = self.output_queue.get()
            if tab == "ssh":
                self.ssh_output.config(state='normal')
                self.ssh_output.insert(tk.END, output + "\n")
                self.ssh_output.config(state='disabled')
                self.ssh_output.see(tk.END)
            elif tab == "status":
                self.status_var.set(output)
        self.master.after(100, self.process_queue)
    

    def send_ssh_request(self):
        prompt = self.ssh_input.get("1.0", tk.END).strip()
        if not prompt:
            return
        Thread(target=self._execute_ssh_query, args=(prompt,), daemon=True).start()
    
    def _execute_ssh_query(self, query):
        # Serverstatus prüfen und ggf. starten
        if self.server_status != "running":
            self.server_status_var.set("Server Status: starting...")
            self.output_queue.put(("status", "Server starting..."))
            

            # Anfrage senden
            try:
                self.output_queue.put(("ssh", f">>> Ihre Anfrage: {query}"))
                ssh_conn = SSHConnection(self.ssh_host, self.ssh_user, self.ssh_key_path)
                ssh_conn.connect()
                
                start_server(ssh_conn=ssh_conn, container_path=self.container_path)                   
                self.server_status, error = check_server_status(ssh_conn, self.container_path)
                if "running" == self.server_status:
                    self.server_status_var.set("Server Status: running")
                else:
                    self.server_status_var.set("Server Status: not running")

                ssh_conn.close()
        
            except Exception as e:
                self.output_queue.put(("ssh", f"SSH Fehler: {str(e)}"))
                self.output_queue.put(("status", "Verbindungsfehler"))
                self.server_status_var.set("Server konnte nicht gestartet werden.")

            # Anfrage senden
        try:
            self.output_queue.put(("ssh", f">>> Ihre Anfrage: {query}"))
            ssh_conn = SSHConnection(self.ssh_host, self.ssh_user, self.ssh_key_path)
            ssh_conn.connect()
            
            self.output_queue.put(("status", "Frage LLM ab..."))
            output, error = execute_prompt(ssh_conn, query)
            
            if error:
                self.output_queue.put(("ssh", f"Fehler: {error}"))
            if output:
                self.output_queue.put(("ssh", f"<<< LLM Antwort:\n{output}"))
            
            self.output_queue.put(("status", "Antwort empfangen"))
            ssh_conn.close()
        except Exception as e:
            self.output_queue.put(("ssh", f"SSH Fehler: {str(e)}"))
            self.output_queue.put(("status", "Verbindungsfehler"))
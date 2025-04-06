import tkinter as tk
from tkinter import scrolledtext, messagebox, ttk, filedialog
import paramiko
from threading import Thread
import queue
import torch
import time
import sys
import os

class LLMClientGUI:
    def __init__(self, master):
        self.master = master
        master.title("DGX-2 LLM Client")
        
        # Konfiguration
        self.prompt = "Wann beginnt das Frühlingssemester? Nenne mir die Semesterdaten"
        self.ssh_host = "sx-el-121920.ost.ch"
        self.ssh_user = "tim.mazhari"
        self.ssh_key_path = ""
        self.container_path = "/mnt/data/tim.mazhari/sif/qwq32b.sif"
        self.model_path = "/mnt/data/tim.mazhari/models/qwq32b"
        
        # GUI Layout
        self.setup_gui()
        
        # Queue für Thread-Kommunikation
        self.output_queue = queue.Queue()
        self.master.after(100, self.process_queue)
        
        # Modellvariablen
        self.model = None
        self.tokenizer = None
        
        # RAG-Konfiguration für SSH
        self.rag_ssh_enabled = False
        self.uploaded_pdfs = []


    def setup_gui(self):
        # Notebook für Tabs
        self.notebook = ttk.Notebook(self.master)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # SSH Tab
        self.ssh_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.ssh_tab, text="DGX-2 SSH")
        
        # SSH GUI Elemente
        self.setup_ssh_tab()
        
        
        # Status Bar
        self.status_var = tk.StringVar()
        self.status_var.set("Bereit")
        self.status_bar = tk.Label(self.master, textvariable=self.status_var, relief=tk.SUNKEN)
        self.status_bar.pack(fill=tk.X)
    
    def setup_ssh_tab(self):
        # SSH Eingabe
        tk.Label(self.ssh_tab, text="SSH Anfrage:").pack()
        self.ssh_input = tk.Text(self.ssh_tab, height=5, width=80)
        self.ssh_input.insert("1.0", self.prompt)
        self.ssh_input.pack()
        
        # SSH Buttons
        tk.Button(self.ssh_tab, text="Anfrage senden", command=self.send_ssh_request).pack()
        
        # SSH Ausgabe
        tk.Label(self.ssh_tab, text="Antwort:").pack()
        self.ssh_output = scrolledtext.ScrolledText(self.ssh_tab, height=20, width=80, state='disabled')
        self.ssh_output.pack()

        # RAG-Controls für SSH hinzufügen
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
        """Lädt PDF auf DGX-2 hoch und verarbeitet sie"""
        filepath = filedialog.askopenfilename(filetypes=[("PDF Files", "*.pdf")])
        if not filepath:
            return

        self.output_queue.put(("status", "Lade PDF auf DGX-2 hoch..."))
        Thread(target=self._process_remote_pdf, args=(filepath,), daemon=True).start()
    
    def _process_remote_pdf(self, filepath):
        try:
            # SSH-Verbindung herstellen
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(self.ssh_host, username=self.ssh_user, password=self.ssh_key_path)
            self.output_queue.put(("status", "Verbunden mit DGX-2"))

            # SCP-Client erstellen
            scp = ssh.open_sftp()
            
            # Remote-Pfade definieren
            remote_dir = "/mnt/data/tim.mazhari/rag/rag_docs/"
            remote_pdf = remote_dir + os.path.basename(filepath)
            
            # Verzeichnis erstellen
            ssh.exec_command(f"mkdir -p {remote_dir}")
            self.output_queue.put(("status", "RAG Verzeichnis erstellt"))
            
            # PDF hochladen
            scp.put(filepath, remote_pdf)
            self.output_queue.put(("status", "Dokument Hochgeladen"))
            scp.close()
            
            # PDF verarbeiten
            process_cmd = f"""
export APPTAINERENV_CUDA_VISIBLE_DEVICES=0,1,2 && apptainer exec --nv {self.container_path} python3 -c '
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os

pdf_path = "{remote_pdf}"
index_dir = "/mnt/data/tim.mazhari/rag/rag_index"
print("testtest")
loader = PyPDFLoader(pdf_path)
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
docs = loader.load_and_split(splitter)

embeddings = HuggingFaceEmbeddings(
    model_name="/mnt/data/tim.mazhari/models/sentence-transformers/all-mpnet-base-v2",
    model_kwargs={{"device": "cuda"}}
)

if os.path.exists(index_dir):
    vectorstore = FAISS.load_local(index_dir, embeddings, allow_dangerous_deserialization=True)
    vectorstore.add_documents(docs)
else:
    vectorstore = FAISS.from_documents(docs, embeddings, allow_dangerous_deserialization=True)

vectorstore.save_local(index_dir)
print("PDF_SUCCESS")
'
            """
            self.output_queue.put(("status", "Dokument Splitten..."))
            stdin, stdout, stderr = ssh.exec_command(process_cmd)
            # Ergebnisse prüfen
            output = stdout.read().decode().strip()
            error = stderr.read().decode().strip()

            if "PDF_SUCCESS" in output:
                self.uploaded_pdfs.append(remote_pdf)
                self.pdf_list_ssh.insert(tk.END, os.path.basename(filepath))
                self.output_queue.put(("ssh", f"PDF verarbeitet: {os.path.basename(filepath)}"))
                self.output_queue.put(("status", "PDF Verarbeitet"))
            else:
                self.output_queue.put(("ssh", f"Fehler: {error}"))

            ssh.close()
            
        except Exception as e:
            self.output_queue.put(("ssh", f"Upload-Fehler: {str(e)}"))

    def toggle_ssh_rag(self):
        """Aktiviert RAG für SSH-Anfragen"""
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
            elif tab == "gpu_info":
                self.gpu_info.config(text=output)
        self.master.after(100, self.process_queue)
    
    def send_ssh_request(self):
        prompt = self.ssh_input.get("1.0", tk.END).strip()
        if not prompt:
            return
            
        self.output_queue.put(("status", "Verbinde mit DGX-2..."))
        Thread(target=self._execute_ssh_query, args=(prompt,), daemon=True).start()
    
    def _execute_ssh_query(self, query):
        try:
            self.output_queue.put(("ssh", f">>> Ihre Anfrage: {query}"))
            
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(self.ssh_host, username=self.ssh_user, password=self.ssh_key_path)
            self.output_queue.put(("status", "Verbunden"))
            
            # Escape-Anführungszeichen im Query
            escaped_query = query.replace("'", "'\"'\"'")
            
            # RAG-Code hinzufügen
            rag_code = ""
            if self.rag_ssh_enabled:
                rag_code = f"""
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import time

# Embeddings laden
embeddings = HuggingFaceEmbeddings(
    model_name="/mnt/data/tim.mazhari/models/sentence-transformers/all-mpnet-base-v2",
    model_kwargs={{"device": "cuda"}}
)

# VectorStore laden
vectorstore = FAISS.load_local(
    "/mnt/data/tim.mazhari/rag/rag_index",
    embeddings,
    allow_dangerous_deserialization=True
)

# Ähnlichkeitssuche durchführen
docs = vectorstore.similarity_search("{query}", k=3)
context = "\\n\\nKontextinformationen:\\n"
for i, doc in enumerate(docs, 1):
    context += f"\\n[{{i}}] {{doc.page_content[:200]}}...\\n"
    context += f"Quelle: {{os.path.basename(doc.metadata['source'])}}\\n"


print("QUERY: {query}")
print("KONTEXT: " + context)
query1 = context + "\\n\\nBeantworte folgende Frage basierend auf dem Kontext: " + "{query}"
query = "{query}"
query = query + "\\n\\nBeantworte folgende Frage basierend auf dem Kontext: " + context
print("KOMBINIERT: " + query)


model_path = '{self.model_path}'

# Initialisierung
torch.cuda.init()
assert torch.cuda.is_available(), "CUDA nicht verfügbar!"

# Modell laden
tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    local_files_only=True,
    torch_dtype=torch.bfloat16,
    device_map="auto"
).eval()

# Anfrage verarbeiten
inputs = tokenizer('{escaped_query}', return_tensors="pt").to("cuda")

start_time = time.time()
outputs = model.generate(
    **inputs,
    max_new_tokens=300,
    do_sample=True,
    temperature=0.7,
    top_p=0.9,
    pad_token_id=tokenizer.eos_token_id
)
generation_time = time.time() - start_time

print(tokenizer.decode(outputs[0], skip_special_tokens=True))
print(f"\\n\\n[Kontext verwendet: {self.rag_ssh_enabled}]")
print(f"[Generation time: {{generation_time:.2f}}s]")
            """
            
            self.output_queue.put(("status", "Starte Container und führe Abfrage aus..."))
            # Container starten und Code ausführen
            command = f"export APPTAINERENV_CUDA_VISIBLE_DEVICES=0,1,2 && apptainer exec --nv {self.container_path} python3 -c \"{rag_code.replace('\"', '\\\"')}\""
            
            stdin, stdout, stderr = ssh.exec_command(command)
            
            output = stdout.read().decode().strip()
            error = stderr.read().decode().strip()
          
            if error:
                self.output_queue.put(("ssh", f"Fehler: {error}"))
            else:
                self.output_queue.put(("ssh", f"<<< LLM Antwort:\n{output}"))

            
            self.output_queue.put(("status", "Antwort empfangen"))
            self.output_queue.put(("ssh", f"<<< LLM Antwort:\n{output}"))

            self.ssh_output.insert(tk.END, f"<<< LLM Antwort:\n{output}")
            
        except Exception as e:
            self.output_queue.put(("ssh", f"SSH Fehler: {str(e)}"))
            self.output_queue.put(("status", "Verbindungsfehler"))
        finally:
            ssh.close() if 'ssh' in locals() else None

if __name__ == "__main__":
    root = tk.Tk()
    gui = LLMClientGUI(root)
    root.mainloop()
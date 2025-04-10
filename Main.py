import tkinter as tk
from tkinter import scrolledtext, messagebox, ttk
import paramiko
from threading import Thread
import queue
import torch
import time
import sys

class LLMClientGUI:
    def __init__(self, master):
        self.master = master
        master.title("DGX-2 LLM Client")
        
        # Konfiguration
        self.prompt = "Wie heisst der Gründer der Migros Genossenschaft? "
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
        self.local_execution = False
        
    def setup_gui(self):
        # Notebook für Tabs
        self.notebook = ttk.Notebook(self.master)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # SSH Tab
        self.ssh_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.ssh_tab, text="DGX-2 SSH")
        
        # Local Tab
        self.local_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.local_tab, text="Local Execution")
        
        # SSH GUI Elemente
        self.setup_ssh_tab()
        
        # Local GUI Elemente
        self.setup_local_tab()
        
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
    
    def setup_local_tab(self):
        # Local Initialisierung
        tk.Button(self.local_tab, text="Modell initialisieren", command=self.initialize_model).pack()
        
        # Local Eingabe
        tk.Label(self.local_tab, text="Lokale Anfrage:").pack()
        self.local_input = tk.Text(self.local_tab, height=5, width=80)
        self.local_input.pack()
        
        # Local Buttons
        tk.Button(self.local_tab, text="Anfrage ausführen", command=self.send_local_request).pack()
        
        # Local Ausgabe
        tk.Label(self.local_tab, text="Antwort:").pack()
        self.local_output = scrolledtext.ScrolledText(self.local_tab, height=20, width=80, state='disabled')
        self.local_output.pack()
        
        # GPU Info
        self.gpu_info = tk.Label(self.local_tab, text="")
        self.gpu_info.pack()
    
    def process_queue(self):
        while not self.output_queue.empty():
            tab, output = self.output_queue.get()
            if tab == "ssh":
                self.ssh_output.config(state='normal')
                self.ssh_output.insert(tk.END, output + "\n")
                self.ssh_output.config(state='disabled')
                self.ssh_output.see(tk.END)
            elif tab == "local":
                self.local_output.config(state='normal')
                self.local_output.insert(tk.END, output + "\n")
                self.local_output.config(state='disabled')
                self.local_output.see(tk.END)
            elif tab == "status":
                self.status_var.set(output)
            elif tab == "gpu_info":
                self.gpu_info.config(text=output)
        self.master.after(100, self.process_queue)
    
    def initialize_model(self):
        if self.model is not None:
            self.output_queue.put(("local", "Modell bereits initialisiert"))
            return
            
        self.output_queue.put(("status", "Initialisiere lokales Modell..."))
        Thread(target=self._initialize_model, daemon=True).start()
    
    def _initialize_model(self):
        try:
            # CUDA Initialisierung
            torch.cuda.init()
            if not torch.cuda.is_available():
                self.output_queue.put(("local", "Fehler: CUDA nicht verfügbar"))
                return
                
            # GPU Info sammeln
            gpu_info = []
            for i in range(torch.cuda.device_count()):
                torch.cuda.empty_cache()
                free, total = torch.cuda.mem_get_info(i)
                gpu_info.append(f"GPU {i}: {torch.cuda.get_device_name(i)} | Freier Speicher: {free/1e9:.2f}GB/{total/1e9:.2f}GB")
            
            self.output_queue.put(("gpu_info", "\n".join(gpu_info)))
            self.output_queue.put(("local", "Lade Tokenizer..."))
            
            # Tokenizer laden
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path, local_files_only=True)
            
            # Modell laden
            self.output_queue.put(("local", "Lade Modell (dies kann mehrere Minuten dauern)..."))
            start_time = time.time()
            
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                local_files_only=True,
                torch_dtype=torch.bfloat16,
                device_map="auto",
            ).eval()
            
            load_time = time.time() - start_time
            self.output_queue.put(("local", f"Modell erfolgreich geladen in {load_time:.2f} Sekunden"))
            self.output_queue.put(("local", f"Modellverteilung: {self.model.hf_device_map}"))
            self.output_queue.put(("status", "Modell bereit"))
            self.local_execution = True
            
        except Exception as e:
            self.output_queue.put(("local", f"Fehler bei der Initialisierung: {str(e)}"))
            self.output_queue.put(("status", "Fehler beim Modellaufbau"))
    
    def send_local_request(self):
        if not self.local_execution:
            messagebox.showerror("Fehler", "Modell nicht initialisiert")
            return
            
        prompt = self.local_input.get("1.0", tk.END).strip()
        if not prompt:
            return
            
        self.output_queue.put(("status", "Verarbeite lokale Anfrage..."))
        Thread(target=self._process_local_request, args=(prompt,), daemon=True).start()
    
    def _process_local_request(self, prompt):
        try:
            self.output_queue.put(("local", f">>> Ihre Anfrage: {prompt}"))
            
            inputs = self.tokenizer(prompt, return_tensors="pt").to("cuda")
            
            with torch.inference_mode():
                start_time = time.time()
                
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=1000,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                    pad_token_id=self.tokenizer.eos_token_id
                )
                
                generation_time = time.time() - start_time
                response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
                
                self.output_queue.put(("local", f"<<< LLM Antwort (in {generation_time:.2f}s):\n{response}"))
                self.output_queue.put(("status", "Antwort empfangen"))
                
        except Exception as e:
            self.output_queue.put(("local", f"Fehler bei der Generierung: {str(e)}"))
            self.output_queue.put(("status", "Generierungsfehler"))
    
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
            
            # Escape-Anführungszeichen im Query
            escaped_query = query.replace("'", "'\"'\"'")
            
            # Python-Code für die Remote-Ausführung
            python_code = f"""
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import time

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
    max_new_tokens=100,
    do_sample=True,
    temperature=0.7,
    top_p=0.9,
    pad_token_id=tokenizer.eos_token_id
)
generation_time = time.time() - start_time

print(tokenizer.decode(outputs[0], skip_special_tokens=True))
print(f"\\n\\n[Generation time: {{generation_time:.2f}}s]")
    """
            # Container starten und Code ausführen
            #command = f"export APPTAINERENV_CUDA_VISIBLE_DEVICES=0,1,2 && apptainer exec --nv {self.container_path} python3 -c \"{python_code.replace('\"', '\\\"')}\""
            
            stdin, stdout, stderr = ssh.exec_command(command)
            
            output = stdout.read().decode().strip()
            error = stderr.read().decode().strip()
            
            

            if error:
                self.output_queue.put(("ssh", f"Fehler: {error}"))
            else:
                self.output_queue.put(("ssh", f"<<< LLM Antwort:\n{output}"))

            
            self.output_queue.put(("status", "Antwort empfangen"))
            self.output_queue.put(("ssh", f"<<< LLM Antwort:\n{output}"))
            self.output_queue.put(("ssh", f"<<< LLM Antwort:\n{output}"))

            self.ssh_output.insert(tk.END, f"<<< LLM Antwort:\n{output}")
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
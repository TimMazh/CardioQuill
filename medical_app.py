import tkinter as tk
from tkinter import ttk
from tkinter import messagebox, filedialog
import os
from datetime import datetime
from utils import generate_report, upload_pdf, clear_fields
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


class CardioVistaApp:
    def __init__(self, root):
        self.root = root
        self.root.title("CardioVista - Medical Scribe")
        self.root.geometry("1200x1200")
        self.root.resizable(True, True)
        
        # Set application theme colors
        self.colors = {
            "bg_color": "#f8fafc",
            "accent_color": "#0EA5E9",  # Light blue accent color
            "text_color": "#1e293b",
            "success_color": "#166534",
            "error_color": "#b91c1c"
        }
        
        # Apply colors to root
        self.root.configure(bg=self.colors["bg_color"])
        
        # Configure styles
        self.configure_styles()
        
        # Create the main UI
        self.create_widgets()
        
    def configure_styles(self):
        # Configure modern styling
        self.style = ttk.Style()
        
        # Frame styling
        self.style.configure("TFrame", background=self.colors["bg_color"])
        
        # Label styling
        self.style.configure("TLabel", 
                          background=self.colors["bg_color"], 
                          foreground=self.colors["text_color"], 
                          font=('Segoe UI', 10))
        
        # Header styling
        self.style.configure("Header.TLabel", 
                          font=('Segoe UI', 12, 'bold'), 
                          foreground="#0f172a",
                          background=self.colors["bg_color"])
        
        # Status label styling
        self.style.configure("Status.TLabel", 
                          font=('Segoe UI', 9), 
                          padding=5)
        
        # Success status
        self.style.configure("Success.TLabel", 
                          background="#dcfce7", 
                          foreground=self.colors["success_color"], 
                          padding=5,
                          relief="flat",
                          borderwidth=0)
        
        # Error status
        self.style.configure("Error.TLabel", 
                          background="#fee2e2", 
                          foreground=self.colors["error_color"], 
                          padding=5,
                          relief="flat",
                          borderwidth=0)
        
        # Button styling
        self.style.configure("TButton", 
                          font=('Segoe UI', 10),
                          background=self.colors["accent_color"],
                          foreground="white")
        
        # Primary button
        self.style.configure("Primary.TButton", 
                          background=self.colors["accent_color"],
                          foreground="white")
        
        # Secondary button
        self.style.configure("Secondary.TButton", 
                          background="#f1f5f9",
                          foreground=self.colors["text_color"])
        
        # Entry styling
        self.style.configure("TEntry", 
                          font=('Segoe UI', 10),
                          fieldbackground="#ffffff")
        
        # Combobox styling
        self.style.configure("TCombobox", 
                          font=('Segoe UI', 10))
        
        # Notebook styling (for tabs)
        self.style.configure("TNotebook", 
                          background=self.colors["bg_color"],
                          borderwidth=0)
        self.style.configure("TNotebook.Tab", 
                          font=('Segoe UI', 10),
                          padding=[10, 5],
                          background="#e2e8f0",
                          foreground=self.colors["text_color"])
        self.style.map("TNotebook.Tab",
                    background=[("selected", self.colors["accent_color"])],
                    foreground=[("selected", "white")])
        
        # LabelFrame styling
        self.style.configure("TLabelframe", 
                          background="white",
                          borderwidth=1,
                          relief="solid")
        self.style.configure("TLabelframe.Label", 
                          font=('Segoe UI', 11, 'bold'),
                          background="white",
                          foreground=self.colors["accent_color"])
        
        # Blue border style
        self.style.configure("BlueBorder.TFrame", background=self.colors["accent_color"])
    
    def create_widgets(self):
        # Main container
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # App header with light blue accent
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill=tk.X, pady=(0, 15))
        
        # Logo and title with light blue accent
        logo_label = ttk.Label(header_frame, text="♥", font=('Segoe UI', 22), foreground=self.colors["accent_color"])
        logo_label.pack(side=tk.LEFT, padx=(0, 5))
        
        app_title = ttk.Label(header_frame, text="CardioVista", style="Header.TLabel", font=('Segoe UI', 18, 'bold'))
        app_title.pack(side=tk.LEFT)
        
        # Subtitle with light blue
        subtitle = ttk.Label(header_frame, text="Medical Scribe", foreground=self.colors["accent_color"], font=('Segoe UI', 12))
        subtitle.pack(side=tk.LEFT, padx=10)
        
        # Create notebook for tabs
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # Create tabs with padding and clean design
        patient_tab = ttk.Frame(self.notebook, padding=10)
        doctor_tab = ttk.Frame(self.notebook, padding=10)
        medical_tab = ttk.Frame(self.notebook, padding=10)
        
        self.notebook.add(patient_tab, text="Patient Information")
        self.notebook.add(doctor_tab, text="Doctor Information")
        self.notebook.add(medical_tab, text="Medical Data")
        
        # Patient Information Tab
        self.create_patient_section(patient_tab)
        
        # Doctor Information Tab
        self.create_doctor_section(doctor_tab)
        
        # Medical Data Tab
        self.create_medical_section(medical_tab)
        
        # Bottom section for controls and status
        control_frame = ttk.Frame(main_frame)
        control_frame.pack(fill=tk.X, pady=15)
        
        # Action buttons with modern styling
        button_frame = ttk.Frame(control_frame)
        button_frame.pack(side=tk.TOP, fill=tk.X, pady=10)
        
        self.generate_btn = ttk.Button(button_frame, text="Generate Report", style="Primary.TButton", 
                                      command=lambda: self.send_ssh_request())
        self.generate_btn.pack(side=tk.LEFT, padx=5)
              
        self.upload_btn = ttk.Button(button_frame, text="Upload PDF", style="Secondary.TButton", 
                                    command=lambda: self.upload_pdf_to_dgx())
        self.upload_btn.pack(side=tk.LEFT, padx=5)
        
        self.clear_btn = ttk.Button(button_frame, text="Clear All Fields", style="Secondary.TButton", 
                                   command=lambda: clear_fields(self))
        self.clear_btn.pack(side=tk.LEFT, padx=5)
        
        # Status indicators with modern design
        status_frame = ttk.Frame(control_frame)
        status_frame.pack(side=tk.BOTTOM, fill=tk.X, pady=5)
        
        status_label = ttk.Label(status_frame, text="Application Status:", foreground="#64748b")
        status_label.grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        
        self.app_status = ttk.Label(status_frame, text="Ready", style="Success.TLabel")
        self.app_status.grid(row=0, column=1, padx=5, pady=5, sticky=tk.W)
        
        server_label = ttk.Label(status_frame, text="Server Status:", foreground="#64748b")
        server_label.grid(row=0, column=2, padx=15, pady=5, sticky=tk.W)
        
        self.server_status = ttk.Label(status_frame, text="Checking...", style="Error.TLabel")
        self.server_status.grid(row=0, column=3, padx=5, pady=5, sticky=tk.W)

        ssh_conn = SSHConnection()
        ssh_conn.connect()
        self.server_status_received, error = check_server_status(ssh_conn)
        if "running" == self.server_status_received:
            self.server_status.config(text="Server Status: Running")
        else:
            self.server_status.config(text="Server Status: Not running")
        ssh_conn.close()
        

    
    def create_patient_section(self, parent):
        # Patient section with modern card layout
        patient_frame = ttk.LabelFrame(parent, text="Patient Information", padding=15)
        patient_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Two-column layout with responsive design
        left_frame = ttk.Frame(patient_frame)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        right_frame = ttk.Frame(patient_frame)
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Left column fields with consistent spacing
        fields_left = [
            ("Gender", "patient_gender", ["Male", "Female", "Other"]),
            ("First Name", "patient_name", None),
            ("Last Name", "patient_lastname", None)
        ]
        
        self.patient_fields = {}
        
        for i, (label_text, attr_name, values) in enumerate(fields_left):
            ttk.Label(left_frame, text=label_text + ":", font=('Segoe UI', 10, 'bold')).grid(row=i, column=0, padx=10, pady=12, sticky=tk.W)
            
            if values:
                widget = ttk.Combobox(left_frame, values=values, width=25)
                widget.state(["!disabled", "readonly"])  # Make combobox readonly for better UX
            else:
                widget = ttk.Entry(left_frame, width=25)
            
            widget.grid(row=i, column=1, padx=10, pady=12, sticky=tk.W+tk.E)
            self.patient_fields[attr_name] = widget
            setattr(self, attr_name, widget)
        
        # Right column fields
        fields_right = [
            ("Date of Birth", "patient_dob", "YYYY-MM-DD"),
            ("Address", "patient_address", ""),
            ("Control Date", "patient_control_date", datetime.now().strftime("%Y-%m-%d"))
        ]
        
        for i, (label_text, attr_name, default) in enumerate(fields_right):
            ttk.Label(right_frame, text=label_text + ":", font=('Segoe UI', 10, 'bold')).grid(row=i, column=0, padx=10, pady=12, sticky=tk.W)
            widget = ttk.Entry(right_frame, width=25)
            widget.grid(row=i, column=1, padx=10, pady=12, sticky=tk.W+tk.E)
            
            if default:
                widget.insert(0, default)
            
            self.patient_fields[attr_name] = widget
            setattr(self, attr_name, widget)
    
    def create_doctor_section(self, parent):
        # Doctor section with modern card layout
        doctor_frame = ttk.LabelFrame(parent, text="Doctor Information", padding=15)
        doctor_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Two-column layout
        left_frame = ttk.Frame(doctor_frame)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        right_frame = ttk.Frame(doctor_frame)
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.doctor_fields = {}
        
        # Left column fields
        fields_left = [
            ("Gender", "doctor_gender", ["Male", "Female", "Other"]),
            ("Title", "doctor_title", "Dr."),
            ("Name", "doctor_name", "")
        ]
        
        for i, (label_text, attr_name, default) in enumerate(fields_left):
            ttk.Label(left_frame, text=label_text + ":", font=('Segoe UI', 10, 'bold')).grid(row=i, column=0, padx=10, pady=12, sticky=tk.W)
            
            if isinstance(default, list):
                widget = ttk.Combobox(left_frame, values=default, width=25)
                widget.state(["!disabled", "readonly"])  # Make combobox readonly
            else:
                widget = ttk.Entry(left_frame, width=25)
                if default:
                    widget.insert(0, default)
            
            widget.grid(row=i, column=1, padx=10, pady=12, sticky=tk.W+tk.E)
            self.doctor_fields[attr_name] = widget
            setattr(self, attr_name, widget)
        
        # Right column fields
        fields_right = [
            ("Clinic Name", "doctor_clinic", ""),
            ("Address", "doctor_address", "")
        ]
        
        for i, (label_text, attr_name, default) in enumerate(fields_right):
            ttk.Label(right_frame, text=label_text + ":", font=('Segoe UI', 10, 'bold')).grid(row=i, column=0, padx=10, pady=12, sticky=tk.W)
            widget = ttk.Entry(right_frame, width=25)
            widget.grid(row=i, column=1, padx=10, pady=12, sticky=tk.W+tk.E)
            
            if default:
                widget.insert(0, default)
            
            self.doctor_fields[attr_name] = widget
            setattr(self, attr_name, widget)
            
    def create_medical_section(self, parent):
        # Add a container for the medical data with padding
        container = ttk.Frame(parent, padding=10)
        container.pack(fill=tk.BOTH, expand=True)
        
        # Style for section headers
        section_header_style = {'font': ('Segoe UI', 11, 'bold'), 'foreground': self.colors["accent_color"]}
        
        # Use Grid layout to organize medical data sections better
        row = 0
        col = 0
        
        # Create text fields for medical data entry
        self.medical_fields = {}
        
        # Function to create a labeled text field
        def create_field(parent, row, col, label_text, attr_name, height=4, width=40):
            # Create a frame with blue accent border at the top
            field_frame = ttk.Frame(parent, padding=(0, 3, 0, 10))
            field_frame.grid(row=row, column=col, padx=5, pady=10, sticky=tk.NSEW)
            
            # Add blue accent line at top
            blue_line = ttk.Frame(field_frame, style="BlueBorder.TFrame", height=3)
            blue_line.pack(fill=tk.X, side=tk.TOP, pady=(0, 5))
            
            # Label with modern styling
            label = ttk.Label(field_frame, text=label_text, **section_header_style)
            label.pack(anchor=tk.W, pady=(0, 5))
            
            # Text widget for data entry
            text_widget = tk.Text(field_frame, height=height, width=width,
                                  font=('Segoe UI', 10), wrap=tk.WORD,
                                  borderwidth=1, relief=tk.SOLID)
            text_widget.pack(fill=tk.BOTH, expand=True)
            
            # Add scrollbar
            scrollbar = ttk.Scrollbar(text_widget, orient=tk.VERTICAL, command=text_widget.yview)
            scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
            text_widget.config(yscrollcommand=scrollbar.set)
            
            # Store reference
            self.medical_fields[attr_name] = text_widget
            setattr(self, attr_name, text_widget)
            
            return text_widget
            
        # Create the fields in a 2x3 grid layout
        fields = [
            ("Chief Complaint", "start_text"),
            ("Diagnosis", "diagnosis"),
            ("Cardiovascular Risk Factors", "cv_risk_factors"),
            ("Other Diagnoses", "side_diagnosis"),
            ("Procedures", "procedure"),
            ("Anamnesis", "anamnese"),
            ("Medication", "medication"),
            ("Physical Examination", "inspection"),
            ("ECG", "ekg"),
            ("Echocardiography", "echo"),
            ("Ergometry", "ergometrie"),
            ("Long-term ECG", "long_ekg"),
            ("Cardiac CT", "ct")
        ]
        
        # Arrange fields in 3 columns
        for i, (label, attr) in enumerate(fields):
            row = i % 5
            col = i // 5
            create_field(container, row, col, label, attr)
            
        # Configure grid weights for responsive layout
        for i in range(5):
            container.grid_rowconfigure(i, weight=1)
        for i in range(3):
            container.grid_columnconfigure(i, weight=1)
            
    def generate_report(self):
        try:
            self.app_status.configure(text="Generating report...", style="Status.TLabel")
            self.root.update()
            
            # Here you would implement the actual report generation
            # For demonstration, just show a message
            messagebox.showinfo("Report Generation", "Report generated successfully!")
            
            self.app_status.configure(text="Report generated", style="Success.TLabel")
        except Exception as e:
            self.app_status.configure(text="Error: " + str(e), style="Error.TLabel")
            messagebox.showerror("Error", f"Failed to generate report: {str(e)}")

    def upload_pdf(self):
        file_path = filedialog.askopenfilename(
            title="Select PDF file",
            filetypes=[("PDF files", "*.pdf"), ("All files", "*.*")]
        )
        
        if file_path:
            file_name = os.path.basename(file_path)
            self.app_status.configure(text=f"PDF uploaded: {file_name}", style="Success.TLabel")
            messagebox.showinfo("File Upload", f"File '{file_name}' uploaded successfully!")
        else:
            self.app_status.configure(text="PDF upload canceled", style="Status.TLabel")

    def clear_fields(self):
        # Clear all entry fields
        for widget in [self.patient_name, self.patient_lastname, self.patient_address,
                     self.doctor_title, self.doctor_name, self.doctor_clinic, self.doctor_address]:
            if hasattr(widget, 'delete'):
                widget.delete(0, tk.END)
        
        # Clear all text fields
        for attr_name in ["start_text", "diagnosis", "cv_risk_factors", "side_diagnosis", 
                         "procedure", "anamnese", "medication", "inspection", "ekg", 
                         "echo", "ergometrie", "long_ekg", "ct"]:
            if hasattr(self, attr_name):
                text_widget = getattr(self, attr_name)
                if hasattr(text_widget, 'delete'):
                    text_widget.delete("1.0", tk.END)
        
        # Reset comboboxes
        self.patient_gender.set("")
        self.doctor_gender.set("")
        
        # Reset dates to default
        self.patient_dob.delete(0, tk.END)
        self.patient_dob.insert(0, "YYYY-MM-DD")
        
        self.patient_control_date.delete(0, tk.END)
        self.patient_control_date.insert(0, datetime.now().strftime("%Y-%m-%d"))
        
        self.app_status.configure(text="All fields cleared", style="Status.TLabel")

    def start_generation(self):
            try:
                self.app_status.configure(text="Starting generation...", style="Status.TLabel")
                self.root.update()
                
                # Simulate generation process
                import time
                time.sleep(1)  # Simulate processing time
                
                # Update server status to show it's connected
                self.server_status.configure(text="Connected", style="Success.TLabel")
                
                # Show message that generation has started
                messagebox.showinfo("Generation", "Generation process has started!")
                
                self.app_status.configure(text="Generation in progress", style="Success.TLabel")
            except Exception as e:
                self.app_status.configure(text="Error: " + str(e), style="Error.TLabel")
                messagebox.showerror("Error", f"Failed to start generation: {str(e)}")

    def send_ssh_request(self):
            #prompt = self.ssh_input.get("1.0", tk.END).strip()
            prompt = "Wer ist der Präsident von Deutschland?"
            if not prompt:
                return
            Thread(target=self._execute_ssh_query, args=(prompt,), daemon=True).start()
        
    def _execute_ssh_query(self, query):
        # Serverstatus prüfen und ggf. starten
        if self.server_status != "running":
            self.app_status.config(text="Server Status: starting...")
            #self.output_queue.put(("status", "Server starting..."))
            

            # Anfrage senden
            try:
                #self.output_queue.put(("ssh", f">>> Überprüfe Serverstatus"))
                ssh_conn = SSHConnection()
                ssh_conn.connect()
                
                start_server(ssh_conn=ssh_conn)                   
                self.server_status_received, error = check_server_status(ssh_conn)
                if "running" == self.server_status_received:
                    self.server_status.config(text="Server Status: running")
                else:
                    #self.output_queue.put(("ssh", f">>> Starte Server"))
                    self.server_status.config(text="Server Status: not running")

                ssh_conn.close()
        
            except Exception as e:
                #self.output_queue.put(("ssh", f"SSH Fehler: {str(e)}"))
                #self.output_queue.put(("status", "Verbindungsfehler"))
                self.server_status.config(text="Server konnte nicht gestartet werden.")

            # Anfrage senden
        try:
            #self.output_queue.put(("ssh", f">>> Ihre Anfrage: {query}"))
            ssh_conn = SSHConnection()
            ssh_conn.connect()
            
            self.app_status.config(text="Frage LLM ab...")
            output, error = execute_prompt(ssh_conn, query)
            
            if error:
                print(output)
                #self.output_queue.put(("ssh", f"Fehler: {error}"))
            if output:
                #self.output_queue.put(("ssh", f"<<< LLM Antwort:\n{output}"))
                print(output)
            
            self.app_status.config(text="Antwort empfangen")
            ssh_conn.close()
        except Exception as e:
            #self.output_queue.put(("ssh", f"SSH Fehler: {str(e)}"))
            #self.output_queue.put(("status", "Verbindungsfehler"))
            self.app_status.config(text="Verbindungsfehler")


    def upload_pdf_to_dgx(self):
        filepath = filedialog.askopenfilename(filetypes=[("PDF Files", "*.pdf")])
        if not filepath:
            return
        self.output_queue.put(("status", "Lade PDF auf DGX-2 hoch..."))
        Thread(target=self._process_remote_pdf, args=(filepath,), daemon=True).start()
    
    def _process_remote_pdf(self, filepath):
        try:
            ssh_conn = SSHConnection()
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


if __name__ == "__main__":
    # Check if sv_ttk is installed, if yes use it
    try:
        import sv_ttk
        has_sv_ttk = True
    except ImportError:
        has_sv_ttk = False
        print("For the best experience, install the sv_ttk package:")
        print("pip install sv-ttk")
        print("Starting with basic theme...")
    
    root = tk.Tk()
    app = CardioVistaApp(root)
    
    # Apply sv_ttk theme if available
    if has_sv_ttk:
        sv_ttk.set_theme("light")
        
    root.mainloop()

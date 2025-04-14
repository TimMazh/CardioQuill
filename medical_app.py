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
from prompt_executor import *
from GUI.master_data_section import create_master_data_section
from GUI.intro_section import IntroSection
from GUI.diagnosis_section import DiagnosisSection

class CardioVistaApp:
    def __init__(self, root):
        self.root = root
        self.root.title("CardioVista - Medical Scribe")
        self.root.geometry("1200x1200")
        self.root.resizable(True, True)

        self.container_path = "/mnt/data/tim.mazhari/sif/qwq32b.sif"

        self.gpus = "5,6,7"

        self.rag_enabled = False

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
        
        # Create notebook for tabs
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # Create tabs with padding and clean design
        master_data_tab = ttk.Frame(self.notebook, padding=10)
        intro_tab = ttk.Frame(self.notebook, padding=10)
        diagnosis_tab = ttk.Frame(self.notebook, padding=10)

        
        self.notebook.add(master_data_tab, text="Patient Information")
        # Patient Information Tab
        self.doctors_letter = {}
        

        create_master_data_section(self, master_data_tab)
        
        # Intro Tab
        self.intro_section = IntroSection(self.notebook, intro_tab, self.doctors_letter)
        self.intro_section.create_intro_text_tab()
        # Bind the NotebookTabChanged event
        self.notebook.bind("<<NotebookTabChanged>>", self.on_tab_changed)

        #Diagnosis Tab
        self.diagnosis_section = DiagnosisSection(self.notebook, diagnosis_tab, self.doctors_letter)
        self.diagnosis_section.create_diagnosis_text_tab()
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
        
        self.activate_rag_btn = ttk.Button(button_frame, text="RAG deaktiviert", style="Secondary.TButton", 
                                    command=lambda: self.activate_rag())
        self.activate_rag_btn.pack(side=tk.LEFT, padx=5)

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
            self.server_status.config(text="Running")
        else:
            self.server_status.config(text="Not running")
        ssh_conn.close()

    def on_tab_changed(self, event):
        """
        Wird aufgerufen, wenn der Benutzer den Tab wechselt.
        """
        selected_tab = self.notebook.index(self.notebook.select())
        if selected_tab == 1:  # Index des "Einleitungstext"-Tabs
            self.intro_section.update_intro_text()
        
    def activate_rag(self):
        if self.activate_rag_btn.cget("text") == "RAG aktiviert":
            self.rag_enabled = False
            self.activate_rag_btn.config(text="RAG deaktiviert", style="Secondary.TButton")
        else:
            self.rag_enabled = True
            self.activate_rag_btn.config(text="RAG aktiviert", style="Success.TButton")

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
            prompt = "Wer ist Johnatan Michalis von der Testgeschichte?"
            if not prompt:
                return
            Thread(target=self._execute_ssh_query, args=(prompt,), daemon=True).start()
        
    def _execute_ssh_query(self, query):
        # Serverstatus prüfen und ggf. starten
        if self.server_status != "running":
            self.server_status.config(text="Starting...")
            #self.output_queue.put(("status", "Server starting..."))
            

            # Anfrage senden
            try:
                #self.output_queue.put(("ssh", f">>> Überprüfe Serverstatus"))
                ssh_conn = SSHConnection()
                ssh_conn.connect()
                
                start_server(ssh_conn=ssh_conn)                   
                self.server_status_received, error = check_server_status(ssh_conn)
                if "running" == self.server_status_received:
                    self.server_status.config(text="Running")
                else:
                    #self.output_queue.put(("ssh", f">>> Starte Server"))
                    self.server_status.config(text="Not running")

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
            if self.rag_enabled:
                query = query + "_USE_RAG_"
            output, error = execute_prompt(ssh_conn, query)
            
            if error:
                print(output)
                #self.output_queue.put(("ssh", f"Fehler: {error}"))
            if output:
                #self.output_queue.put(("ssh", f"<<< LLM Antwort:\n{output}"))
                print(output)
                self.llm_output.config(state='normal')
                self.llm_output.insert(tk.END, f"<<< LLM Antwort:\n{output}\n")
                self.llm_output.config(state='disabled')
                self.llm_output.see(tk.END)
            
            self.app_status.config(text="Antwort empfangen")
            ssh_conn.close()
        except Exception as e:
            #self.output_queue.put(("ssh", f"SSH Fehler: {str(e)}"))
            #self.output_queue.put(("status", "Verbindungsfehler"))
            self.app_status.config(text="Fehler")


    def upload_pdf_to_dgx(self):
        filepath = filedialog.askopenfilename(filetypes=[("PDF Files", "*.pdf")])
        if not filepath:
            return
        #self.output_queue.put(("status", "Lade PDF auf DGX-2 hoch..."))
        self.app_status.config(text="Lade PDF auf DGX-2 hoch...")

        Thread(target=self._process_remote_pdf, args=(filepath,), daemon=True).start()
    
    def _process_remote_pdf(self, filepath):
        try:
            ssh_conn = SSHConnection()
            ssh_conn.connect()
            #self.output_queue.put(("status", "Verbunden mit DGX-2"))
    
            remote_dir = "/mnt/data/tim.mazhari/rag/rag_docs/"
            remote_pdf = remote_dir + os.path.basename(filepath)
    
            ssh_conn.run_command(f"mkdir -p {remote_dir}")
            #self.output_queue.put(("status", "RAG Verzeichnis erstellt"))
            self.app_status.config(text="RAG Verzeichnis erstellt")

    
            ssh_conn.upload_file(filepath, remote_pdf)
            #self.output_queue.put(("status", "Dokument Hochgeladen"))
            self.app_status.config(text="Dokument Hochgeladen")
            
    
            output, error = process_pdf(ssh_conn, remote_pdf, remote_dir, filepath)
    
            if "PDF_SUCCESS" in output:
                self.uploaded_pdfs.append(remote_pdf)
                self.pdf_list_ssh.insert(tk.END, os.path.basename(filepath))
                #self.output_queue.put(("ssh", f"PDF verarbeitet: {os.path.basename(filepath)}"))
                #self.output_queue.put(("status", "PDF Verarbeitet"))
                self.app_status.config(text=f"PDF verarbeitet: {os.path.basename(filepath)}")

            else:
                #self.output_queue.put(("ssh", f"Fehler: {error}"))
                self.app_status.config(text="Fehler")

    
            ssh_conn.close()
    
        except Exception as e:
            #self.output_queue.put(("ssh", f"Upload-Fehler: {str(e)}"))
            self.app_status.config(text="Upload-Fehler: " + str(e))



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

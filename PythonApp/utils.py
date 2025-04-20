
import tkinter as tk
from tkinter import filedialog, messagebox
import os
from datetime import datetime

def generate_report(app):
    try:
        app.app_status.configure(text="Generating report...", style="Status.TLabel")
        app.root.update()
        
        # Here you would implement the actual report generation
        # For demonstration, just show a message
        messagebox.showinfo("Report Generation", "Report generated successfully!")
        
        app.app_status.configure(text="Report generated", style="Success.TLabel")
    except Exception as e:
        app.app_status.configure(text="Error: " + str(e), style="Error.TLabel")
        messagebox.showerror("Error", f"Failed to generate report: {str(e)}")

def upload_pdf(app):
    file_path = filedialog.askopenfilename(
        title="Select PDF file",
        filetypes=[("PDF files", "*.pdf"), ("All files", "*.*")]
    )
    
    if file_path:
        file_name = os.path.basename(file_path)
        app.app_status.configure(text=f"PDF uploaded: {file_name}", style="Success.TLabel")
        messagebox.showinfo("File Upload", f"File '{file_name}' uploaded successfully!")
    else:
        app.app_status.configure(text="PDF upload canceled", style="Status.TLabel")

def clear_fields(app):
    # Clear all entry fields
    for widget in [app.patient_name, app.patient_lastname, app.patient_address,
                 app.doctor_title, app.doctor_name, app.doctor_clinic, app.doctor_address]:
        if hasattr(widget, 'delete'):
            widget.delete(0, tk.END)
    
    # Clear all text fields
    for attr_name in ["start_text", "diagnosis", "cv_risk_factors", "side_diagnosis", 
                     "procedure", "anamnese", "medication", "inspection", "ekg", 
                     "echo", "ergometrie", "long_ekg", "ct"]:
        if hasattr(app, attr_name):
            text_widget = getattr(app, attr_name)
            if hasattr(text_widget, 'delete'):
                text_widget.delete("1.0", tk.END)
    
    # Reset comboboxes
    app.patient_gender.set("")
    app.doctor_gender.set("")
    
    # Reset dates to default
    app.patient_dob.delete(0, tk.END)
    app.patient_dob.insert(0, "YYYY-MM-DD")
    
    app.patient_control_date.delete(0, tk.END)
    app.patient_control_date.insert(0, datetime.now().strftime("%Y-%m-%d"))
    
    app.app_status.configure(text="All fields cleared", style="Status.TLabel")

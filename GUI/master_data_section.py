import tkinter as tk
from tkinter import ttk
from tkinter import scrolledtext
from datetime import datetime

def create_master_data_section(self, parent):
    # Haupt-Frame für Patient- und Doctor-Section
    main_frame = ttk.Frame(parent)
    main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    # Patient-Section oben
    patient_frame = ttk.LabelFrame(main_frame, text="Patient Information", padding=15)
    patient_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

    # Two-column layout für Patient-Section
    left_frame = ttk.Frame(patient_frame)
    left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)

    right_frame = ttk.Frame(patient_frame)
    right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=10, pady=10)

    # Left column fields für Patient-Section
    fields_left = [
        ("Gender", "patient_gender", ["Male", "Female"]),
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

        widget.grid(row=i, column=1, padx=10, pady=12, sticky=tk.W + tk.E)
        self.patient_fields[attr_name] = widget
        setattr(self, attr_name, widget)

    # Right column fields für Patient-Section
    fields_right = [
        ("Date of Birth", "patient_dob", "YYYY-MM-DD"),
        ("Address", "patient_address", ""),
        ("Control Date", "patient_control_date", datetime.now().strftime("%Y-%m-%d"))
    ]

    for i, (label_text, attr_name, default) in enumerate(fields_right):
        ttk.Label(right_frame, text=label_text + ":", font=('Segoe UI', 10, 'bold')).grid(row=i, column=0, padx=10, pady=12, sticky=tk.W)
        widget = ttk.Entry(right_frame, width=25)
        widget.grid(row=i, column=1, padx=10, pady=12, sticky=tk.W + tk.E)

        if default:
            widget.insert(0, default)

        self.patient_fields[attr_name] = widget
        setattr(self, attr_name, widget)

    # Doctor-Section unten
    doctor_frame = ttk.LabelFrame(main_frame, text="Doctor Information", padding=15)
    doctor_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

    # Two-column layout für Doctor-Section
    doctor_left_frame = ttk.Frame(doctor_frame)
    doctor_left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)

    doctor_right_frame = ttk.Frame(doctor_frame)
    doctor_right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=10, pady=10)

    # Left column fields für Doctor-Section
    doctor_fields_left = [
        ("Gender", "doctor_gender", ["Male", "Female"]),
        ("First Name", "doctor_firstname", None),
        ("Last Name", "doctor_lastname", None)
    ]

    self.doctor_fields = {}

    for i, (label_text, attr_name, values) in enumerate(doctor_fields_left):
        ttk.Label(doctor_left_frame, text=label_text + ":", font=('Segoe UI', 10, 'bold')).grid(row=i, column=0, padx=10, pady=12, sticky=tk.W)

        if values:
            widget = ttk.Combobox(doctor_left_frame, values=values, width=25)
            widget.state(["!disabled", "readonly"])  # Make combobox readonly for better UX
        else:
            widget = ttk.Entry(doctor_left_frame, width=25)

        widget.grid(row=i, column=1, padx=10, pady=12, sticky=tk.W + tk.E)
        self.doctor_fields[attr_name] = widget
        setattr(self, attr_name, widget)

    # Right column fields für Doctor-Section
    doctor_fields_right = [
        ("Title", "doctor_title", ["Dr.", "Prof.", "Mr.", "Ms."]),
        ("Clinic Name", "doctor_clinic_name", None),
        ("Address", "doctor_address", None)
    ]

    for i, (label_text, attr_name, _) in enumerate(doctor_fields_right):
        ttk.Label(doctor_right_frame, text=label_text + ":", font=('Segoe UI', 10, 'bold')).grid(row=i, column=0, padx=10, pady=12, sticky=tk.W)
        widget = ttk.Entry(doctor_right_frame, width=25)
        widget.grid(row=i, column=1, padx=10, pady=12, sticky=tk.W + tk.E)
        self.doctor_fields[attr_name] = widget
        setattr(self, attr_name, widget)

    # Add temporary output field for LLM response
    output_frame = ttk.LabelFrame(main_frame, text="LLM Output", padding=15)
    output_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

    self.llm_output = scrolledtext.ScrolledText(output_frame, height=10, wrap=tk.WORD, state='disabled')
    self.llm_output.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
import tkinter as tk
from tkinter import ttk
from tkinter import scrolledtext

class IntroSection:
    def __init__(self, notebook, intro_tab, patient_fields, doctor_fields):
        self.patient_fields = patient_fields
        self.doctor_fields = doctor_fields

        # Notebook für Tabs erstellen
        self.notebook = notebook
        self.intro_tab = intro_tab
        self.intro_tab.pack(fill=tk.BOTH, expand=True)

        # Einleitungstext Tab erstellen

    def create_intro_text_tab(self):
        # Tab für Einleitungstext erstellen
        self.notebook.add(self.intro_tab, text="Einleitungstext")

        # Radiobuttons für die Anrede
        anrede_frame = ttk.LabelFrame(self.intro_tab, text="Anrede", padding=10)
        anrede_frame.pack(fill=tk.X, padx=10, pady=10)

        # Setze den Standardwert auf "Sehr geehrte"
        self.anrede_var = tk.StringVar(value="Sehr geehrte")
        ttk.Radiobutton(anrede_frame, text="Liebe", variable=self.anrede_var, value="Liebe", command=self.update_intro_text).pack(side=tk.LEFT, padx=5, pady=5)
        ttk.Radiobutton(anrede_frame, text="Sehr geehrte", variable=self.anrede_var, value="Sehr geehrte", command=self.update_intro_text).pack(side=tk.LEFT, padx=5, pady=5)
        
        # Freitextfeld für den Einleitungstext
        text_frame = ttk.LabelFrame(self.intro_tab, text="Einleitungstext", padding=10)
        text_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.intro_text = scrolledtext.ScrolledText(text_frame, wrap=tk.WORD, height=10)
        self.intro_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Standardtext initialisieren
        self.update_intro_text()

    def update_intro_text(self):
        """
        Aktualisiert den Einleitungstext basierend auf der gewählten Anrede und den Geschlechtern.
        """
        # Beispielwerte für Patient und Arzt (diese sollten aus den Eingabefeldern kommen)
        patient_gender = self.patient_fields.get("patient_gender").get()  # "Male" oder "Female"
        doctor_gender = self.doctor_fields.get("doctor_gender").get()  # "Male" oder "Female"
        patient_lastname = self.patient_fields.get("patient_lastname").get() or "Patientnachname"
        doctor_firstname = self.doctor_fields.get("doctor_firstname").get() or "Arztvorname"
        doctor_lastname = self.doctor_fields.get("doctor_lastname").get() or "Arztnachname"
        doctor_title = self.doctor_fields.get("doctor_title").get() or ""
        consultation_date = self.patient_fields.get("patient_control_date").get() or "Konsultationsdatum"

        # Anrede basierend auf Radiobutton
        anrede = self.anrede_var.get()

        # Geschlechtsbasierte Formulierungen
        if patient_gender == "Female":
            patient_pronoun = "Frau"
            common_patient = "unserer gemeinsamen Patientin"
            patient_article = "die"
        else:
            patient_pronoun = "Herr"
            common_patient = "unseres gemeinsamen Patienten"
            patient_article = "der"

        if doctor_gender == "Female":
            doctor_pronoun = "Frau"
        else:
            doctor_pronoun = "Herr"

        if "liebe" in anrede.lower():
            if doctor_gender != "Female":
                anrede = anrede + "r"
        else:
            if doctor_gender != "Female":
                anrede = anrede + "r"
        # Text generieren
        intro_text = (
            f"{anrede} {doctor_firstname if 'liebe' in anrede.lower() else doctor_pronoun + (' ' + doctor_title if doctor_title else '') + ' ' + doctor_lastname},\n\n"
            f"Gerne berichte ich über die kardiologische Verlaufskontrolle {common_patient} "
            f"{patient_pronoun} {patient_lastname}, {patient_article} sich am {consultation_date} in meiner Praxis vorgestellt hatte.\n"
        )

        # Textfeld aktualisieren
        self.intro_text.delete("1.0", tk.END)
        self.intro_text.insert(tk.END, intro_text)
import tkinter as tk
from tkinter import ttk
from tkinter import scrolledtext

class RecommendedProcedureSection:
    def __init__(self, notebook, recommended_procedure_tab, doctors_letter):
        self.doctors_letter = doctors_letter
        # Notebook für Tabs erstellen
        self.notebook = notebook
        self.recommended_procedure_tab = recommended_procedure_tab
        self.recommended_procedure_tab.pack(fill=tk.BOTH, expand=True)


    def create_recommended_procedure_text_tab(self):
        # Tab für Nebendiagnosetext erstellen
        self.notebook.add(self.recommended_procedure_tab, text="Empfohlenes Procedere")

        # Freitextfeld für den Nebendiagnosetext
        text_frame = ttk.LabelFrame(self.recommended_procedure_tab, text="Empfohlenes Procedere", padding=10)
        text_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.diagnosis_text = scrolledtext.ScrolledText(text_frame, wrap=tk.WORD, height=10)
        self.diagnosis_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Binde das Event für Änderungen im Textfeld
        self.diagnosis_text.bind("<<Modified>>", self.on_text_change)

        # Standardtext initialisieren
        self.load_initial_text()

    def load_initial_text(self):
        """
        Lädt den initialen Text aus self.doctors_letter["diagnosis"] in das Textfeld.
        """
        initial_text = self.doctors_letter.get("recommended_procedure", "")
        self.diagnosis_text.insert(tk.END, initial_text)

    def on_text_change(self, event):
        """
        Wird aufgerufen, wenn der Text im Freitextfeld geändert wird.
        """
        # Entferne das Modified-Flag, um wiederholte Events zu vermeiden
        self.diagnosis_text.edit_modified(False)

        # Aktualisiere den Wert in self.doctors_letter["diagnosis"]
        new_text = self.diagnosis_text.get("1.0", tk.END).strip()
        self.doctors_letter["recommended_procedure"] = new_text
        print(self.doctors_letter["recommended_procedure"])  # Debug-Ausgabe


import tkinter as tk
from tkinter import ttk
from tkinter import scrolledtext

class CardiovascularRiskFactorsSection:
    def __init__(self, notebook, cardiovascular_risk_factors_tab, doctors_letter):
        self.doctors_letter = doctors_letter
        # Notebook für Tabs erstellen
        self.notebook = notebook
        self.cardiovascular_risk_factors_tab = cardiovascular_risk_factors_tab
        self.cardiovascular_risk_factors_tab.pack(fill=tk.BOTH, expand=True)


    def create_cardiovascular_risk_factors_text_tab(self):
        # Tab für Kardiovaskuläre Risikofaktoren erstellen
        self.notebook.add(self.cardiovascular_risk_factors_tab, text="Kardiovaskuläre Risikofaktoren")

        # Freitextfeld für die Kardiovaskulären Risikofaktoren
        text_frame = ttk.LabelFrame(self.cardiovascular_risk_factors_tab, text="Kardiovaskuläre Risikofaktoren", padding=10)
        text_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.cardiovascular_risk_factors_text = scrolledtext.ScrolledText(text_frame, wrap=tk.WORD, height=10)
        self.cardiovascular_risk_factors_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Binde das Event für Änderungen im Textfeld
        self.cardiovascular_risk_factors_text.bind("<<Modified>>", self.on_text_change)

        # Standardtext initialisieren
        self.load_initial_text()

    def load_initial_text(self):
        """
        Lädt den initialen Text aus self.doctors_letter["diagnosis"] in das Textfeld.
        """
        initial_text = self.doctors_letter.get("diagnosis", "")
        self.cardiovascular_risk_factors_text.insert(tk.END, initial_text)

    def on_text_change(self, event):
        """
        Wird aufgerufen, wenn der Text im Freitextfeld geändert wird.
        """
        # Entferne das Modified-Flag, um wiederholte Events zu vermeiden
        self.cardiovascular_risk_factors_text.edit_modified(False)

        # Aktualisiere den Wert in self.doctors_letter["diagnosis"]
        new_text = self.cardiovascular_risk_factors_text.get("1.0", tk.END).strip()
        self.doctors_letter["cardiovascular_risk_factors"] = new_text
        print(self.doctors_letter["cardiovascular_risk_factors"])  # Debug-Ausgabe


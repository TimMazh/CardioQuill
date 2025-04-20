import tkinter as tk
from tkinter import ttk
from tkinter import scrolledtext

class ECGAnalysisSection:
    def __init__(self, notebook, ecg_analysis_tab, doctors_letter):
        self.doctors_letter = doctors_letter
        self.notebook = notebook
        self.ecg_analysis_tab = ecg_analysis_tab
        self.ecg_analysis_tab.pack(fill=tk.BOTH, expand=True)

    def create_ecg_analysis_tab(self):
        # Tab hinzufügen
        self.notebook.add(self.ecg_analysis_tab, text="EKG-Analyse")

        # Haupt-Frame
        main_frame = ttk.Frame(self.ecg_analysis_tab)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Sinusrhythmus und Lagetyp
        rhythm_frame = ttk.LabelFrame(main_frame, text="Sinusrhythmus und Lagetyp", padding=10)
        rhythm_frame.pack(fill=tk.X, padx=5, pady=5)

        self.sinus_rate_var = tk.StringVar()
        self.sinus_rate_var.trace_add("write", lambda *args: self.update_ecg_analysis_text())
        ttk.Label(rhythm_frame, text="Sinusrhythmus (Schläge/Minute):").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Entry(rhythm_frame, textvariable=self.sinus_rate_var).grid(row=0, column=1, padx=5, pady=5)

        self.lagetyp_var = tk.StringVar(value="Indifferenztyp")
        self.lagetyp_var.trace_add("write", lambda *args: self.update_ecg_analysis_text())
        ttk.Label(rhythm_frame, text="Lagetyp:").grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Combobox(rhythm_frame, textvariable=self.lagetyp_var, values=[
            "Überdrehter Linkstyp", "Linkstyp", "Horizontaltyp", "Indifferenztyp", 
            "Steiltyp", "Rechtstyp", "Überdrehter Rechtstyp"
        ], state="readonly").grid(row=1, column=1, padx=5, pady=5)

        # PQ, QRS, QTc
        intervals_frame = ttk.LabelFrame(main_frame, text="Intervalle", padding=10)
        intervals_frame.pack(fill=tk.X, padx=5, pady=5)

        self.pq_var = tk.StringVar()
        self.pq_var.trace_add("write", lambda *args: self.update_ecg_analysis_text())
        ttk.Label(intervals_frame, text="PQ (ms):").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Entry(intervals_frame, textvariable=self.pq_var).grid(row=0, column=1, padx=5, pady=5)

        self.qrs_var = tk.StringVar()
        self.qrs_var.trace_add("write", lambda *args: self.update_ecg_analysis_text())
        ttk.Label(intervals_frame, text="QRS (ms):").grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Entry(intervals_frame, textvariable=self.qrs_var).grid(row=1, column=1, padx=5, pady=5)

        self.qtc_var = tk.StringVar()
        self.qtc_var.trace_add("write", lambda *args: self.update_ecg_analysis_text())
        ttk.Label(intervals_frame, text="QTc (ms):").grid(row=2, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Entry(intervals_frame, textvariable=self.qtc_var).grid(row=2, column=1, padx=5, pady=5)

        # Pathologisches Q
        q_wave_frame = ttk.LabelFrame(main_frame, text="Pathologisches Q", padding=10)
        q_wave_frame.pack(fill=tk.X, padx=5, pady=5)

        self.pathological_q_var = tk.StringVar(value="Nein")
        ttk.Label(q_wave_frame, text="Pathologisches Q?").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(q_wave_frame, text="Ja", variable=self.pathological_q_var, value="Ja", command=self.update_q_wave).grid(row=0, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(q_wave_frame, text="Nein", variable=self.pathological_q_var, value="Nein", command=self.update_q_wave).grid(row=0, column=2, padx=5, pady=5, sticky=tk.W)

        # Frame für Checkboxen (Ableitungen)
        self.q_wave_leads_frame = ttk.Frame(q_wave_frame)
        self.q_wave_leads_frame.grid(row=1, column=0, columnspan=3, padx=5, pady=5, sticky=tk.W)

        self.q_wave_leads_vars = {}
        leads = ["I", "II", "III", "aVF", "aVR", "aVL", "V1", "V2", "V3", "V4", "V5", "V6"]
        for i, lead in enumerate(leads):
            var = tk.BooleanVar(value=False)
            checkbox = ttk.Checkbutton(self.q_wave_leads_frame, text=lead, variable=var, command=self.update_q_wave)
            checkbox.grid(row=i // 4, column=i % 4, padx=5, pady=5, sticky=tk.W)
            self.q_wave_leads_vars[lead] = var

        # Standardmäßig den Frame ausblenden
        self.q_wave_leads_frame.grid_remove()

        # ST-Veränderungen
        st_frame = ttk.LabelFrame(main_frame, text="ST-Veränderungen", padding=10)
        st_frame.pack(fill=tk.X, padx=5, pady=5)

        self.st_changes_var = tk.StringVar(value="Nein")
        ttk.Label(st_frame, text="ST-Veränderungen?").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(st_frame, text="Ja", variable=self.st_changes_var, value="Ja", command=self.update_st_changes).grid(row=0, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(st_frame, text="Nein", variable=self.st_changes_var, value="Nein", command=self.update_st_changes).grid(row=0, column=2, padx=5, pady=5, sticky=tk.W)

        self.st_changes_text_var = tk.StringVar()
        self.st_changes_text_var.trace_add("write", lambda *args: self.update_st_changes())

        self.st_changes_text_entry = ttk.Entry(st_frame, textvariable=self.st_changes_text_var)
        self.st_changes_text_entry.grid(row=1, column=0, columnspan=3, padx=5, pady=5, sticky=tk.W)

        # Standardmäßig das Texteingabefeld ausblenden
        self.st_changes_text_entry.grid_remove()

        # Regelrechte R-Progression
        r_progression_frame = ttk.LabelFrame(main_frame, text="R-Progression", padding=10)
        r_progression_frame.pack(fill=tk.X, padx=5, pady=5)

        self.r_progression_var = tk.StringVar(value="Ja")

        ttk.Label(r_progression_frame, text="Regelrechte R-Progression?").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(r_progression_frame, text="Ja", variable=self.r_progression_var, value="Ja", command=self.update_r_progression).grid(row=0, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(r_progression_frame, text="Nein", variable=self.r_progression_var, value="Nein", command=self.update_r_progression).grid(row=0, column=2, padx=5, pady=5, sticky=tk.W)

        self.r_progression_text_var = tk.StringVar()
        self.r_progression_text_var.trace_add("write", lambda *args: self.update_r_progression())

        self.r_progression_text_entry = ttk.Entry(r_progression_frame, textvariable=self.r_progression_text_var)
        self.r_progression_text_entry.grid(row=1, column=0, columnspan=3, padx=5, pady=5, sticky=tk.W)

        # Standardmäßig das Texteingabefeld ausblenden
        self.r_progression_text_entry.grid_remove()

        # Rhythmusstreifen
        rhythm_strip_frame = ttk.LabelFrame(main_frame, text="Rhythmusstreifen", padding=10)
        rhythm_strip_frame.pack(fill=tk.X, padx=5, pady=5)

        self.rhythm_continuity_var = tk.StringVar(value="durchgehend")
        self.rhythm_continuity_var.trace_add("write", lambda *args: self.update_r_progression())
        self.rhythm_frequency_var = tk.StringVar(value="normofrequent")
        self.rhythm_frequency_var.trace_add("write", lambda *args: self.update_r_progression())

        ttk.Label(rhythm_strip_frame, text="Rhythmusstreifen:").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Combobox(rhythm_strip_frame, textvariable=self.rhythm_continuity_var, values=["durchgehend", "nicht durchgehend"], state="readonly").grid(row=0, column=1, padx=5, pady=5)
        ttk.Combobox(rhythm_strip_frame, textvariable=self.rhythm_frequency_var, values=["normofrequent", "tachikard", "bradikard"], state="readonly").grid(row=0, column=2, padx=5, pady=5)

        # Extrasystolen
        extrasystole_frame = ttk.LabelFrame(main_frame, text="Extrasystolen", padding=10)
        extrasystole_frame.pack(fill=tk.X, padx=5, pady=5)

        self.extrasystole_var = tk.StringVar(value="Nein")
        ttk.Label(extrasystole_frame, text="Extrasystolen?").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(extrasystole_frame, text="Ja", variable=self.extrasystole_var, value="Ja", command=self.update_extrasystole).grid(row=0, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(extrasystole_frame, text="Nein", variable=self.extrasystole_var, value="Nein", command=self.update_extrasystole).grid(row=0, column=2, padx=5, pady=5, sticky=tk.W)

        # Abfrage: Vereinzelt oder Regelmäßig
        self.extrasystole_frequency_var = tk.StringVar(value="Vereinzelt")
        self.extrasystole_frequency_frame = ttk.Frame(extrasystole_frame)
        self.extrasystole_frequency_frame.grid(row=1, column=0, columnspan=3, padx=5, pady=5, sticky=tk.W)
        ttk.Label(self.extrasystole_frequency_frame, text="Häufigkeit:").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(self.extrasystole_frequency_frame, text="Vereinzelt", variable=self.extrasystole_frequency_var, value="Vereinzelt", command=self.update_extrasystole).grid(row=0, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(self.extrasystole_frequency_frame, text="Regelmäßig", variable=self.extrasystole_frequency_var, value="Regelmäßig", command=self.update_extrasystole).grid(row=0, column=2, padx=5, pady=5, sticky=tk.W)

        # Checkboxen: Supra- und/oder Ventrikulär
        self.extrasystole_type_vars = {
            "supraventrikulär": tk.BooleanVar(value=False),
            "ventrikulär": tk.BooleanVar(value=False)
        }
        self.extrasystole_type_frame = ttk.Frame(extrasystole_frame)
        self.extrasystole_type_frame.grid(row=2, column=0, columnspan=3, padx=5, pady=5, sticky=tk.W)
        ttk.Label(self.extrasystole_type_frame, text="Typ:").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Checkbutton(self.extrasystole_type_frame, text="supraventrikulär", variable=self.extrasystole_type_vars["supraventrikulär"], command=self.update_extrasystole).grid(row=0, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Checkbutton(self.extrasystole_type_frame, text="ventrikulär", variable=self.extrasystole_type_vars["ventrikulär"], command=self.update_extrasystole).grid(row=0, column=2, padx=5, pady=5, sticky=tk.W)

        # Deaktiviere die zusätzlichen Optionen standardmäßig
        self.extrasystole_frequency_frame.grid_remove()
        self.extrasystole_type_frame.grid_remove()

        # Ausgabefeld für generierten Text
        output_frame = ttk.LabelFrame(main_frame, text="Generierter Text", padding=10)
        output_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.output_text = scrolledtext.ScrolledText(output_frame, wrap=tk.WORD, height=8)
        self.output_text.pack(fill=tk.BOTH, expand=True)

        # Aktualisiere den Text bei Änderungen
        self.update_ecg_analysis_text()

    def update_ecg_analysis_text(self):
        """
        Generiert den Text für die EKG-Analyse basierend auf den Eingaben.
        """
        # Sinusrhythmus und Lagetyp
        sinus_rate = self.sinus_rate_var.get()
        lagetyp = self.lagetyp_var.get()

        # Intervalle
        pq = self.pq_var.get()
        qrs = self.qrs_var.get()
        qtc = self.qtc_var.get()

        # Pathologisches Q
        if self.pathological_q_var.get() == "Ja":
            selected_leads = [lead for lead, var in self.q_wave_leads_vars.items() if var.get()]
            q_wave_text = f"Pathologische Q-Welle in {', '.join(selected_leads)}."
        else:
            q_wave_text = "Kein pathologisches Q."

        # ST-Veränderungen
        if self.st_changes_var.get() == "Ja":
            st_changes_text = self.st_changes_text_var.get()
            st_changes_text = st_changes_text + "."
        else:
            st_changes_text = "Keine spezifischen ST-Veränderungen."

        # Regelrechte R-Progression
        if self.r_progression_var.get() == "Ja":
            r_progression_text = "Regelrechte R-Progression."
        else:
            r_progression_text = self.r_progression_text_var.get()
            r_progression_text = r_progression_text + "."

        # Rhythmusstreifen
        rhythm_continuity = self.rhythm_continuity_var.get()
        rhythm_frequency = self.rhythm_frequency_var.get()
        rhythm_strip_text = f"Im Rhythmusstreifen {rhythm_continuity} {rhythm_frequency}er Sinusrhythmus."

        # Extrasystolen
        if self.extrasystole_var.get() == "Ja":
            frequency = self.extrasystole_frequency_var.get()
            types = [key for key, var in self.extrasystole_type_vars.items() if var.get()]
            types_text = " und ".join(types) if types else "unbestimmter Typ"
            extrasystole_text = f"{frequency} {types_text}e Extrasystolen."
        else:
            extrasystole_text = "Keine Extrasystolen."

        # Generiere den Text
        ecg_analysis_text = (
            f"Sinusrhythmus mit {sinus_rate}/Minute. {lagetyp}. PQ {pq}ms, QRS {qrs}ms, QTc {qtc}ms. "
            f"{q_wave_text} {st_changes_text} {r_progression_text} {rhythm_strip_text} {extrasystole_text}"
        )

        # Speichere den generierten Text
        self.doctors_letter["ecg_analysis"] = ecg_analysis_text

        # Aktualisiere das Ausgabefeld
        self.output_text.delete("1.0", tk.END)
        self.output_text.insert(tk.END, ecg_analysis_text)

    def update_q_wave(self):
        """
        Zeigt oder versteckt die Checkboxen für pathologische Q-Wellen basierend auf der Auswahl.
        """
        if self.pathological_q_var.get() == "Ja":
            self.q_wave_leads_frame.grid()  # Zeigt den Frame mit den Checkboxen an
        else:
            self.q_wave_leads_frame.grid_remove()  # Versteckt den Frame mit den Checkboxen
            for var in self.q_wave_leads_vars.values():
                var.set(False)  # Setzt alle Checkboxen zurück
        self.update_ecg_analysis_text()

    def update_st_changes(self):
        """
        Zeigt oder versteckt das Texteingabefeld für ST-Veränderungen basierend auf der Auswahl.
        """
        if self.st_changes_var.get() == "Ja":
            self.st_changes_text_entry.grid()  # Zeigt das Texteingabefeld an
        else:
            self.st_changes_text_entry.grid_remove()  # Versteckt das Texteingabefeld
            self.st_changes_text_var.set("")  # Setzt den Text zurück
        self.update_ecg_analysis_text()

    def update_r_progression(self):
        """
        Zeigt oder versteckt das Texteingabefeld für R-Progression basierend auf der Auswahl.
        """
        if self.r_progression_var.get() == "Nein":
            self.r_progression_text_entry.grid()  # Zeigt das Texteingabefeld an
        else:
            self.r_progression_text_entry.grid_remove()  # Versteckt das Texteingabefeld
            self.r_progression_text_var.set("")  # Setzt den Text zurück
        self.update_ecg_analysis_text()

    def update_extrasystole(self):
        """
        Aktiviert oder deaktiviert die zusätzlichen Optionen für Extrasystolen basierend auf der Auswahl.
        """
        if self.extrasystole_var.get() == "Ja":
            self.extrasystole_frequency_frame.grid()
            self.extrasystole_type_frame.grid()
        else:
            self.extrasystole_frequency_frame.grid_remove()
            self.extrasystole_type_frame.grid_remove()
            self.extrasystole_frequency_var.set("Vereinzelt")
            for var in self.extrasystole_type_vars.values():
                var.set(False)
        self.update_ecg_analysis_text()
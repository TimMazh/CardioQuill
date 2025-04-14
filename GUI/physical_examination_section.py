import tkinter as tk
from tkinter import ttk
from tkinter import scrolledtext

class PhysicalExaminationSection:
    def __init__(self, notebook, physical_examination_tab, doctors_letter):
        self.doctors_letter = doctors_letter
        self.notebook = notebook
        self.physical_examination_tab = physical_examination_tab
        self.physical_examination_tab.pack(fill=tk.BOTH, expand=True)

    def create_physical_examination_tab(self):
        # Tab hinzufügen
        self.notebook.add(self.physical_examination_tab, text="Körperliche Untersuchung")

        # Allgemeinzustand (AZ) und Ernährungszustand (EZ)
        az_ez_frame = ttk.LabelFrame(self.physical_examination_tab, text="Allgemein- und Ernährungszustand", padding=10)
        az_ez_frame.pack(fill=tk.X, padx=10, pady=10)

        ttk.Label(az_ez_frame, text="AZ:").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        self.az_var = tk.StringVar(value="Guter")
        ttk.Combobox(az_ez_frame, textvariable=self.az_var, values=["Guter", "Normaler", "Schlechter"], state="readonly").grid(row=0, column=1, padx=5, pady=5)

        ttk.Label(az_ez_frame, text="EZ:").grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
        self.ez_var = tk.StringVar(value="normaler")
        ttk.Combobox(az_ez_frame, textvariable=self.ez_var, values=["normaler", "übergewichtiger", "adipöser"], state="readonly").grid(row=1, column=1, padx=5, pady=5)

        # Körpermaße und Blutdruck
        measurements_frame = ttk.LabelFrame(self.physical_examination_tab, text="Körpermaße und Blutdruck", padding=10)
        measurements_frame.pack(fill=tk.X, padx=10, pady=10)

        self.height_var = tk.StringVar()
        self.weight_var = tk.StringVar()
        self.bmi_var = tk.StringVar()
        self.bp_left_sys_var = tk.StringVar()
        self.bp_left_dia_var = tk.StringVar()
        self.bp_right_sys_var = tk.StringVar()
        self.bp_right_dia_var = tk.StringVar()
        self.pulse_var = tk.StringVar()

        ttk.Label(measurements_frame, text="Körpergröße (cm):").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Entry(measurements_frame, textvariable=self.height_var).grid(row=0, column=1, padx=5, pady=5)

        ttk.Label(measurements_frame, text="Körpergewicht (kg):").grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Entry(measurements_frame, textvariable=self.weight_var).grid(row=1, column=1, padx=5, pady=5)

        ttk.Label(measurements_frame, text="BMI (kg/m²):").grid(row=2, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Entry(measurements_frame, textvariable=self.bmi_var).grid(row=2, column=1, padx=5, pady=5)

        ttk.Label(measurements_frame, text="Blutdruck links (systolisch/diastolisch):").grid(row=3, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Entry(measurements_frame, textvariable=self.bp_left_sys_var, width=10).grid(row=3, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Entry(measurements_frame, textvariable=self.bp_left_dia_var, width=10).grid(row=3, column=2, padx=5, pady=5, sticky=tk.W)

        ttk.Label(measurements_frame, text="Blutdruck rechts (systolisch/diastolisch):").grid(row=4, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Entry(measurements_frame, textvariable=self.bp_right_sys_var, width=10).grid(row=4, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Entry(measurements_frame, textvariable=self.bp_right_dia_var, width=10).grid(row=4, column=2, padx=5, pady=5, sticky=tk.W)

        ttk.Label(measurements_frame, text="Ruhepuls (min):").grid(row=5, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Entry(measurements_frame, textvariable=self.pulse_var).grid(row=5, column=1, padx=5, pady=5)
# Seitendifferenz
        self.side_difference_var = tk.StringVar(value="Nein")
        ttk.Label(measurements_frame, text="Seitendifferenz:").grid(row=6, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(measurements_frame, text="Ja", variable=self.side_difference_var, value="Ja", command=self.update_physical_examination_text).grid(row=6, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(measurements_frame, text="Nein", variable=self.side_difference_var, value="Nein", command=self.update_physical_examination_text).grid(row=6, column=2, padx=5, pady=5, sticky=tk.W)
        # Auskultation Lunge
        lung_frame = ttk.LabelFrame(self.physical_examination_tab, text="Auskultation Lunge", padding=10)
        lung_frame.pack(fill=tk.X, padx=10, pady=10)

        self.lung_abnormal_var = tk.StringVar(value="Nein")
        ttk.Label(lung_frame, text="Auskultation Lunge abnormal?").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(lung_frame, text="Ja", variable=self.lung_abnormal_var, value="Ja", command=self.update_lung_text).grid(row=0, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(lung_frame, text="Nein", variable=self.lung_abnormal_var, value="Nein", command=self.update_lung_text).grid(row=0, column=2, padx=5, pady=5, sticky=tk.W)

        self.lung_text_var = tk.StringVar()
        self.lung_text_entry = ttk.Entry(lung_frame, textvariable=self.lung_text_var, state="disabled")
        self.lung_text_entry.grid(row=1, column=0, columnspan=3, padx=5, pady=5, sticky=tk.W)
        
        # Auskultation Herz
        heart_frame = ttk.LabelFrame(self.physical_examination_tab, text="Auskultation Herz", padding=10)
        heart_frame.pack(fill=tk.X, padx=10, pady=10)

        self.heart_rhythm_var = tk.StringVar(value="Cor")
        ttk.Label(heart_frame, text="Herzrhythmus:").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(heart_frame, text="Cor", variable=self.heart_rhythm_var, value="Cor", command=self.update_physical_examination_text).grid(row=0, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(heart_frame, text="Arrhytmisch", variable=self.heart_rhythm_var, value="Arrhytmisch", command=self.update_physical_examination_text).grid(row=0, column=2, padx=5, pady=5, sticky=tk.W)

        self.heart_rhythm_text_var = tk.StringVar()
        self.heart_rhythm_text_entry = ttk.Entry(heart_frame, textvariable=self.heart_rhythm_text_var, state="disabled")
        self.heart_rhythm_text_entry.grid(row=1, column=0, columnspan=3, padx=5, pady=5, sticky=tk.W)

        self.heart_pathology_var = tk.StringVar(value="Nein")
        ttk.Label(heart_frame, text="Pathologische Nebentöne:").grid(row=2, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(heart_frame, text="Ja", variable=self.heart_pathology_var, value="Ja", command=self.update_heart_pathology).grid(row=2, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(heart_frame, text="Nein", variable=self.heart_pathology_var, value="Nein", command=self.update_heart_pathology).grid(row=2, column=2, padx=5, pady=5, sticky=tk.W)

        self.heart_pathology_text_var = tk.StringVar()
        self.heart_pathology_text_entry = ttk.Entry(heart_frame, textvariable=self.heart_pathology_text_var, state="disabled")
        self.heart_pathology_text_entry.grid(row=3, column=0, columnspan=3, padx=5, pady=5, sticky=tk.W)

        # Pulse
        pulse_frame = ttk.LabelFrame(self.physical_examination_tab, text="Pulse", padding=10)
        pulse_frame.pack(fill=tk.X, padx=10, pady=10)

        self.pulse_all_var = tk.StringVar(value="Ja")
        ttk.Label(pulse_frame, text="Pulse allseits gut tastbar:").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(pulse_frame, text="Ja", variable=self.pulse_all_var, value="Ja", command=self.update_physical_examination_text).grid(row=0, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(pulse_frame, text="Nein", variable=self.pulse_all_var, value="Nein", command=self.update_physical_examination_text).grid(row=0, column=2, padx=5, pady=5, sticky=tk.W)

        self.pulse_text_var = tk.StringVar()
        self.pulse_text_entry = ttk.Entry(pulse_frame, textvariable=self.pulse_text_var, state="disabled")
        self.pulse_text_entry.grid(row=1, column=0, columnspan=3, padx=5, pady=5, sticky=tk.W)

        self.flow_noise_var = tk.StringVar(value="Nein")
        ttk.Label(pulse_frame, text="Strömungsgeräusche:").grid(row=2, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(pulse_frame, text="Ja", variable=self.flow_noise_var, value="Ja", command=self.update_flow_noise).grid(row=2, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(pulse_frame, text="Nein", variable=self.flow_noise_var, value="Nein", command=self.update_flow_noise).grid(row=2, column=2, padx=5, pady=5, sticky=tk.W)

        self.flow_noise_text_var = tk.StringVar()
        self.flow_noise_text_entry = ttk.Entry(pulse_frame, textvariable=self.flow_noise_text_var, state="disabled")
        self.flow_noise_text_entry.grid(row=3, column=0, columnspan=3, padx=5, pady=5, sticky=tk.W)

        self.edema_var = tk.StringVar(value="Nein")
        ttk.Label(pulse_frame, text="Ödeme:").grid(row=4, column=0, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(pulse_frame, text="Ja", variable=self.edema_var, value="Ja", command=self.update_edema).grid(row=4, column=1, padx=5, pady=5, sticky=tk.W)
        ttk.Radiobutton(pulse_frame, text="Nein", variable=self.edema_var, value="Nein", command=self.update_edema).grid(row=4, column=2, padx=5, pady=5, sticky=tk.W)

        self.edema_text_var = tk.StringVar()
        self.edema_text_entry = ttk.Entry(pulse_frame, textvariable=self.edema_text_var, state="disabled")
        self.edema_text_entry.grid(row=5, column=0, columnspan=3, padx=5, pady=5, sticky=tk.W)


        # Ausgabefeld für generierten Text
        output_frame = ttk.LabelFrame(self.physical_examination_tab, text="Generierter Text", padding=10)
        output_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.output_text = scrolledtext.ScrolledText(output_frame, wrap=tk.WORD, height=10)
        self.output_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Aktualisiere den Text bei Änderungen
        self.update_physical_examination_text()

    def update_lung_text(self):
        """
        Aktiviert oder deaktiviert das Freitextfeld für die Lunge basierend auf der Auswahl.
        """
        if self.lung_abnormal_var.get() == "Ja":
            self.lung_text_entry.config(state="normal")
        else:
            self.lung_text_entry.config(state="disabled")
            self.lung_text_var.set("")
        self.update_physical_examination_text()

    def update_heart_pathology(self):
        """
        Aktiviert oder deaktiviert das Freitextfeld für pathologische Nebentöne basierend auf der Auswahl.
        """
        if self.heart_pathology_var.get() == "Ja":
            self.heart_pathology_text_entry.config(state="normal")
        else:
            self.heart_pathology_text_entry.config(state="disabled")
            self.heart_pathology_text_var.set("")
        self.update_physical_examination_text()

    def update_flow_noise(self):
        """
        Aktiviert oder deaktiviert das Freitextfeld für Strömungsgeräusche basierend auf der Auswahl.
        """
        if self.flow_noise_var.get() == "Ja":
            self.flow_noise_text_entry.config(state="normal")
        else:
            self.flow_noise_text_entry.config(state="disabled")
            self.flow_noise_text_var.set("")
        self.update_physical_examination_text()

    def update_edema(self):
        """
        Aktiviert oder deaktiviert das Freitextfeld für Ödeme basierend auf der Auswahl.
        """
        if self.edema_var.get() == "Ja":
            self.edema_text_entry.config(state="normal")
        else:
            self.edema_text_entry.config(state="disabled")
            self.edema_text_var.set("")
        self.update_physical_examination_text()

    def update_physical_examination_text(self):
        """
        Generiert den Text für die körperliche Untersuchung basierend auf den Eingaben.
        """
        # Allgemeinzustand und Ernährungszustand
        az = self.az_var.get()
        ez = self.ez_var.get()

        # Körpermaße und Blutdruck
        height = self.height_var.get()
        weight = self.weight_var.get()
        bmi = self.bmi_var.get()
        bp_left_sys = self.bp_left_sys_var.get()
        bp_left_dia = self.bp_left_dia_var.get()
        bp_right_sys = self.bp_right_sys_var.get()
        bp_right_dia = self.bp_right_dia_var.get()
        pulse = self.pulse_var.get()

        # Seitendifferenz
        if self.side_difference_var.get() == "Ja":
            systolic_diff = abs(int(bp_left_sys) - int(bp_right_sys))
            diastolic_diff = abs(int(bp_left_dia) - int(bp_right_dia))
            if int(bp_left_sys) > int(bp_right_sys):
                systolic_bigger_side = "links höher"
            elif int(bp_left_sys) < int(bp_right_sys):
                systolic_bigger_side = "rechts höher"
            else:
                systolic_bigger_side = "keine Seitendifferenz"
            if int(bp_left_dia) > int(bp_right_dia):
                diastolic_bigger_side = "links höher"
            elif int(bp_left_dia) < int(bp_right_dia):
                diastolic_bigger_side = "rechts höher"
            else:
                diastolic_bigger_side = "keine Seitendifferenz"
            side_difference = f"Seittendifferenz. Unterschied beträgt systolisch {systolic_diff} mmHg und diastolisch {diastolic_diff} mmHg, systolisch {systolic_bigger_side}, diastolisch {diastolic_bigger_side}"
        else:
            side_difference = "keine Seitendifferenz"

        # Pulse allseits gut tastbar
        if self.pulse_all_var.get() == "Ja":
            pulse_text = "Pulse allseits gut tastbar."
            self.pulse_text_entry.config(state="disabled")
        else:
            pulse_text = self.pulse_text_var.get()
            self.pulse_text_entry.config(state="normal")
        # Strömungsgeräusche
        if self.flow_noise_var.get() == "Ja":
            flow_noise_text = self.flow_noise_text_var.get()
        else:
            flow_noise_text = "Keine Strömungsgeräusche."

        # Ödeme
        if self.edema_var.get() == "Ja":
            edema_text = self.edema_text_var.get()
        else:
            edema_text = "Keine preipheren Ödeme. Kardinal kompensiert."

        # Auskultation Lunge
        if self.lung_abnormal_var.get() == "Ja":
            lung_text = self.lung_text_var.get()
        else:
            lung_text = "Pulmo mit VAG beidseits, keine Rasselgeräusche."

        # Auskultation Herz
        if self.heart_rhythm_var.get() == "Cor":
            heart_text = "Cor rhytmisch."
            self.heart_rhythm_text_entry.config(state="disabled")

        else:
            heart_text = f"Arrhytmisch, {self.heart_rhythm_text_var.get()}"
            self.heart_rhythm_text_entry.config(state="normal")

        if self.heart_pathology_var.get() == "Ja":
            pathology_text = self.heart_pathology_text_var.get()
        else:
            pathology_text = "keine pathologischen Nebentöne."

        # Generiere den Text
        physical_examination_text = (
            f"{az} AZ und {ez} EZ. Körpergröße {height} cm, Körpergewicht {weight} kg, BMI {bmi} kg/m². "
            f"Blutdruck in Ruhe links {bp_left_sys}/{bp_left_dia} mmHg, rechts {bp_right_sys}/{bp_right_dia} mmHg, {side_difference}. "
            f"Ruhepuls {pulse}/min. {lung_text} {heart_text} {pathology_text} {pulse_text} {flow_noise_text} {edema_text}"
        )

        # Speichere den generierten Text
        self.doctors_letter["physical_examination"] = physical_examination_text

        # Aktualisiere das Ausgabefeld
        self.output_text.delete("1.0", tk.END)
        self.output_text.insert(tk.END, physical_examination_text)
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

        # Ausgabefeld für generierten Text
        output_frame = ttk.LabelFrame(self.physical_examination_tab, text="Generierter Text", padding=10)
        output_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.output_text = scrolledtext.ScrolledText(output_frame, wrap=tk.WORD, height=10)
        self.output_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Aktualisiere den Text bei Änderungen
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

        # Generiere den Text
        physical_examination_text = (
            f"{az} AZ und {ez} EZ. Körpergröße {height} cm, Körpergewicht {weight} kg, BMI {bmi} kg/m². "
            f"Blutdruck in Ruhe links {bp_left_sys}/{bp_left_dia} mmHg, rechts {bp_right_sys}/{bp_right_dia} mmHg, {side_difference}. "
            f"Ruhepuls {pulse}/min."
        )

        # Speichere den generierten Text
        self.doctors_letter["physical_examination"] = physical_examination_text

        # Aktualisiere das Ausgabefeld
        self.output_text.delete("1.0", tk.END)
        self.output_text.insert(tk.END, physical_examination_text)
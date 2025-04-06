import tkinter as tk
from GUI import LLMClientGUI

if __name__ == "__main__":
    root = tk.Tk()
    gui = LLMClientGUI(root)
    root.mainloop()
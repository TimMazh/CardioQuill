
import tkinter as tk
from OldGUI import LLMClientGUI

if __name__ == "__main__":
    root = tk.Tk()
    root.title("CardioQuill LLM Client")
    gui = LLMClientGUI(root)
    root.mainloop()

# First test for local LLM usage
# Accesses the locally installed LLM in the DGX-2 container
# Use at least 3 GPUs due tue insufficient VRAM on only one or two.

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import time

# 1. CUDA Initialisierung erzwingen
torch.cuda.init()
assert torch.cuda.is_available(), "CUDA nicht verfügbar!"

# 2. Speichermanagement
for i in range(torch.cuda.device_count()):
    torch.cuda.empty_cache()
    print(f"GPU {i}: {torch.cuda.get_device_name(i)} | Freier Speicher: {torch.cuda.mem_get_info(i)[0]/1e9:.2f} GB")

model_path = '/mnt/data/tim.mazhari/qwq32b'

# 3. Tokenizer laden
print('Lade Tokenizer...')
tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)

# 4. Modell mit Fehlerbehandlung laden
try:
    print('Lade Modell...')
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        local_files_only=True,
        torch_dtype=torch.bfloat16,
        device_map="auto",
        # Alternative bei Instabilität:
        # device_map="sequential",
        # max_memory={0: "30GiB", 1: "30GiB"}
    ).eval()  # Wichtig: eval()-Modus
    
    print("Modellverteilung:")
    print(model.hf_device_map)

    # 5. Generierung mit reduzierter Batch-Grösse
    prompt = 'Erzähle mir etwas über die Stadt Campo Grande.'
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    

    with torch.inference_mode():  # Zusätzlicher Speicheroptimierung
        start_time = time.perf_counter()

        outputs = model.generate(
            **inputs,
            max_new_tokens=1000,  # Erstmal klein anfangen
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=tokenizer.eos_token_id  # Wichtig für Qwen-Modelle
        )
    end_time = time.perf_counter()

    print(tokenizer.decode(outputs[0], skip_special_tokens=False))
    print(f"Generation took {end_time - start_time:.2f} seconds")

except RuntimeError as e:
    print(f"Fehler: {str(e)}")
    print("\nTroubleshooting Tips:")
    print("1. CUDA-Treiber neu starten: 'sudo systemctl restart nvidia*'")
    print("2. Apptainer mit '--nv --cleanenv' neu starten")
    print("3. torch und transformers updaten")
    print("4. Alternative device_map='sequential' versuchen")
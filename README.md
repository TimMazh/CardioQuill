# CardioQuill

CardioQuill ist ein KI-gestützter Arztbriefgenerator, welcher im Rahmen einer Bachelorarbeit an der Ostschweizer Fachhochschule umgesetzt wurde. 

Folgend einige Hinweise für zukünftige Entwickler, welche bei der Erweiterung bzw. Inbetriebnahme helfen. 

## Rechenleistung / ICAI
Das lokal installierte LLM wird auf einem NVIDIA DGX-2 der Ostschweizer Fachhochschule, welcher von dem Interdisciplinary Center for Artificial Intelligence (ICAI) der OST betrieben wird. 

Da der DGX-2 ein geteiler Rechner ist, werden nur 3 von 16 verfügbaren Grafikkarten verwendet.

Da keine Administratoren-Rechte für Entwickler auf dem DGX-2 bestehen, wird die Verbindung via SSH gemacht. Die Logindaten und Pfade sind in dem Dokument serverconfig.json anzupassen. 

Dazu bedarf es ein Login für den DGX-2, welches der zukünftige Entwickler beim ICAI anzufragen hat. 

Weiter Informationen finden sich unter https://wiki.ost.ch/display/ICAI/AI-Computing+@+ICAI

## Architektur / Start der Applikation
Die WebApp ist in ein Frontend und ein Backend aufgeteilt. Das Frontend ist primär mit TypeScript umgesetzt und das Backend mit Python. 

Um die Applikation laufen zu lassen, ist zunächst via Konsole in den Ordner "/WebApp/backend" zu navigieren, wo dann der Befehl "./start_backend.sh" (Mac) respektive "./start_backend.bat" (Windows) auszuführen ist. 

Anschliessend ist in den Ordner "/WebApp" zu navigieren, in welchem der Befehl "npm run dev" in einener separaten Konsoleninstanz auszuführen ist. 

Dies lässt schliesslich die Applikation via localhost erreichbar machen

Nach dem Starten der Applikation wird ein Skript auf dem DGX-2 ausgeführt, welches das Modell initialisiert. Wichtig zu beachten ist, dass wenn die Applikation heruntergefahren wird, zwingend via SSH auf den DGX-2 zugegriffen werden muss und der Befehl "apptainer instance stop llm_instance" ausgeführt werden muss, um die Rechenleistung wieder freizugeben.

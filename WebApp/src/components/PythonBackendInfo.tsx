
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function PythonBackendInfo() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Python Backend Setup</CardTitle>
        <CardDescription>
          Diese Anwendung erfordert einen lokalen Python-Backend-Server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">So starten Sie den Backend-Server:</h3>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>Navigieren Sie zum <code>backend</code>-Verzeichnis im Projektordner.</li>
              <li>
                <strong>Unter Windows:</strong> Doppelklicken Sie auf <code>start_backend.bat</code> oder führen Sie es in der Kommandozeile aus.
              </li>
              <li>
                <strong>Unter macOS/Linux:</strong> Öffnen Sie ein Terminal und führen Sie <code>./start_backend.sh</code> aus.
                <br/>
                (Möglicherweise müssen Sie zuerst <code>chmod +x start_backend.sh</code> ausführen, um die Datei ausführbar zu machen.)
              </li>
              <li>Der Backend-Server sollte starten und auf <code>http://localhost:5000</code> lauschen.</li>
              <li>Lassen Sie das Terminal-/Kommandozeilenfenster geöffnet, während Sie die App verwenden.</li>
            </ol>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium">Anforderungen:</h3>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Python 3.8 oder höher</li>
              <li>Pip (Python-Paketmanager)</li>
              <li>Alle in <code>requirements.txt</code> aufgeführten Abhängigkeiten (werden automatisch installiert)</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-col space-y-2 w-full">
          <p className="text-sm text-muted-foreground">
            Die Backend-Komponenten kommunizieren per SSH mit dem Fernserver und leiten Ihre Anfragen an das LLM weiter.
          </p>
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => window.open("http://localhost:5000/status", "_blank")}
            >
              Backend-Status prüfen
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

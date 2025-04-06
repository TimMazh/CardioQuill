import time

def execute_prompt(ssh_conn, query, container_path, model_path, rag_enabled):
    """
    Führt den Prompt aus, indem er die Anfrage an den persistenten LLM-Server weiterleitet.
    
    Falls die Apptainer-Instanz oder der LLM-Server (auf Port 5000) noch nicht läuft, werden
    diese automatisch gestartet. Dabei wird sichergestellt, dass nur die GPUs 0, 1 und 2 genutzt werden.
    
    Hinweis: Ersetze '/pfad/zu/llm_server.py' durch den tatsächlichen Pfad von llm_server.py
    innerhalb der Instanz.
    """
    # Escape einfache Anführungszeichen in der Query
    escaped_query = query.replace("'", "'\\''")
    
    instance_name = "llm_instance"
    
    # Prüfe, ob die Apptainer-Instanz bereits läuft
    check_instance_command = f"apptainer instance list | grep {instance_name}"
    instance_output, instance_error = ssh_conn.run_command(check_instance_command)
    if instance_name not in instance_output:
        set_gpu_command = f"export APPTAINERENV_CUDA_VISIBLE_DEVICES=0,1,2"
        ssh_conn.run_command(set_gpu_command)
        start_instance_command = f"APPTAINERENV_CUDA_VISIBLE_DEVICES=0,1,2 apptainer instance start --nv {container_path} {instance_name}"
        ssh_conn.run_command(start_instance_command)

    
    # Prüfe, ob der LLM-Server auf Port 5000 läuft – ausführen innerhalb der Instanz
    check_server_command = f"apptainer exec instance://{instance_name} nc -z localhost 5000 && echo 'running' || echo 'not running'"
    server_status, server_error = ssh_conn.run_command(check_server_command)
    if "not running" in server_status:
        # Starte den LLM-Server innerhalb der Instanz (im Hintergrund mit nohup)
        start_server_command = f"APPTAINERENV_CUDA_VISIBLE_DEVICES=0,1,2 apptainer exec instance://{instance_name} nohup python3 /home/tim.mazhari/llm_server.py > /home/tim.mazhari/llm_server.log 2>&1 &"
        ssh_conn.run_command(start_server_command)
        # Warte, bis der Server bereit ist, mit Polling (maximal 180 Sekunden)
        timeout = 180
        poll_interval = 5
        elapsed = 0
        while elapsed < timeout:
            check_ready_cmd = f"apptainer exec instance://{instance_name} nc -z localhost 5000 && echo 'ready' || echo 'not ready'"
            ready_status, _ = ssh_conn.run_command(check_ready_cmd)
            if "ready" == ready_status:
                break
            time.sleep(poll_interval)
            elapsed += poll_interval
    
    # Sende die Anfrage an den LLM-Server – führe den netcat-Befehl innerhalb der Instanz aus
    cmd = f"APPTAINERENV_CUDA_VISIBLE_DEVICES=0,1,2 apptainer exec instance://{instance_name} bash -c \"echo '{escaped_query}' | nc localhost 5000\""
    output, error = ssh_conn.run_command(cmd)
    return output, error
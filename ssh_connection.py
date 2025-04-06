import paramiko
import os

class SSHConnection:
    def __init__(self, host, user, key_path=""):
        self.host = host
        self.user = user
        self.key_path = key_path
        self.client = None

    def connect(self):
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.client.connect(self.host, username=self.user, password=self.key_path)
        return self.client

    def run_command(self, command):
        if self.client is None:
            self.connect()
        stdin, stdout, stderr = self.client.exec_command(command)
        output = stdout.read().decode().strip()
        error = stderr.read().decode().strip()
        return output, error

    def upload_file(self, local_path, remote_path):
        if self.client is None:
            self.connect()
        sftp = self.client.open_sftp()
        remote_dir = os.path.dirname(remote_path)
        self.client.exec_command(f"mkdir -p {remote_dir}")
        sftp.put(local_path, remote_path)
        sftp.close()

    def close(self):
        if self.client:
            self.client.close()
            self.client = None
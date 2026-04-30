import paramiko
from scp import SCPClient
import os

hostname = "47.84.69.17"
username = "root"
password = "CVZXcvzxCVZX1@"

def create_ssh_client(server, port, user, password):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(server, port, user, password)
    return client

def main():
    print(f"Connecting to {hostname}...")
    ssh = create_ssh_client(hostname, 22, username, password)
    
    print("Uploading server.tar.gz...")
    with SCPClient(ssh.get_transport()) as scp:
        scp.put("server.tar.gz", "server.tar.gz")
    
    print("Extracting server.tar.gz...")
    stdin, stdout, stderr = ssh.exec_command("mkdir -p uis-backend && tar -xzf server.tar.gz -C uis-backend")
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    print("Checking for docker and docker-compose...")
    commands = ["docker --version", "docker-compose --version", "docker compose version"]
    for cmd in commands:
        stdin, stdout, stderr = ssh.exec_command(cmd)
        print(f"{cmd}: {stdout.read().decode().strip()} {stderr.read().decode().strip()}")

    ssh.close()

if __name__ == "__main__":
    main()

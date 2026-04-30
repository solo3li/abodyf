import paramiko
from scp import SCPClient
import time
import os

hostname = "47.84.69.17"
username = "root"
password = "CVZXcvzxCVZX1@"

def main():
    print("Archiving server directory...")
    os.system("tar -czf server.tar.gz -C server .")
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, 22, username, password)
    
    print("Uploading server.tar.gz...")
    with SCPClient(client.get_transport()) as scp:
        scp.put("server.tar.gz", "server.tar.gz")
    
    print("Extracting and running docker-compose...")
    commands = [
        "rm -rf uis-backend && mkdir -p uis-backend",
        "tar -xzf server.tar.gz -C uis-backend",
        "cd uis-backend && docker compose up -d --build"
    ]
    
    for cmd in commands:
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        err = stderr.read().decode()
        if err:
            print(f"Error: {err}")
    
    print("Checking container status...")
    stdin, stdout, stderr = client.exec_command("docker ps")
    print(stdout.read().decode())
    
    client.close()

if __name__ == "__main__":
    main()

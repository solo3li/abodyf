import paramiko
import time

hostname = "47.84.69.17"
username = "root"
password = "CVZXcvzxCVZX1@"

def execute_commands(client, commands):
    for cmd in commands:
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        # Read output in real-time or at least wait for completion
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                print(stdout.channel.recv(1024).decode(), end="")
            time.sleep(0.1)
        
        print(stdout.read().decode())
        err = stderr.read().decode()
        if err:
            print(f"Error: {err}")

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, 22, username, password)
    
    install_commands = [
        "apt-get update",
        "apt-get install -y ca-certificates curl gnupg",
        "install -m 0755 -d /etc/apt/keyrings",
        "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes",
        "chmod a+r /etc/apt/keyrings/docker.gpg",
        'echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null',
        "apt-get update",
        "apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"
    ]
    
    execute_commands(client, install_commands)
    
    # Check if docker is working
    stdin, stdout, stderr = client.exec_command("docker --version && docker compose version")
    print(stdout.read().decode())
    
    client.close()

if __name__ == "__main__":
    main()

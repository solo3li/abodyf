import paramiko
hostname = "47.84.69.17"
username = "root"
password = "CVZXcvzxCVZX1@"

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, 22, username, password)
    
    print("Checking app logs...")
    stdin, stdout, stderr = client.exec_command("docker logs uis_app --tail 50")
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    print("Testing local connection to port 5035...")
    stdin, stdout, stderr = client.exec_command("curl -I http://localhost:5035")
    print(stdout.read().decode())
    
    client.close()

if __name__ == "__main__":
    main()

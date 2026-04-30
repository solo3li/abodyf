import paramiko
hostname = "47.84.69.17"
username = "root"
password = "CVZXcvzxCVZX1@"

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, 22, username, password)
    
    stdin, stdout, stderr = client.exec_command("cat /etc/os-release")
    print(stdout.read().decode())
    
    client.close()

if __name__ == "__main__":
    main()

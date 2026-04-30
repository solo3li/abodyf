import paramiko
hostname = "47.84.69.17"
username = "root"
password = "CVZXcvzxCVZX1@"

def main():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname, 22, username, password, allow_agent=False, look_for_keys=False, timeout=10)
        print("Connected successfully!")
        stdin, stdout, stderr = client.exec_command("docker ps")
        print(stdout.read().decode())
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

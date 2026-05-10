import urllib.request
import json
import subprocess
import time
import random

email = f"test_{random.randint(1000, 9999)}@example.com"
print(f"Registering user {email}...")

# Register
req = urllib.request.Request("http://localhost:5035/api/Auth/register", method="POST", data=json.dumps({
    "fullName": "Test User",
    "email": email,
    "password": "Pass123",
    "role": "Student"
}).encode('utf-8'), headers={"Content-Type": "application/json"})
res = urllib.request.urlopen(req)
print(res.read().decode('utf-8'))

import sqlite3
# Get token from DB
time.sleep(2)
token = subprocess.check_output(["docker", "exec", "uis_db", "psql", "-U", "postgres", "-d", "uisdb", "-t", "-c", f"SELECT \"EmailVerificationToken\" FROM \"Users\" WHERE \"Email\"='{email}'"]).decode('utf-8').strip()

print(f"Token: {token}")

# Verify email
req = urllib.request.Request(f"http://localhost:5035/api/Auth/verify-email?token={token}", method="GET")
res = urllib.request.urlopen(req)
print("Email verification response:", res.status)

# Login
req = urllib.request.Request("http://localhost:5035/api/Auth/login", method="POST", data=json.dumps({
    "email": email,
    "password": "Pass123"
}).encode('utf-8'), headers={"Content-Type": "application/json"})
res = urllib.request.urlopen(req)
login_res = json.loads(res.read().decode('utf-8'))
print(f"Login response: {login_res}")

# Get OTP from DB
time.sleep(2)
otp = subprocess.check_output(["docker", "exec", "uis_db", "psql", "-U", "postgres", "-d", "uisdb", "-t", "-c", f"SELECT \"OtpCode\" FROM \"Users\" WHERE \"Email\"='{email}'"]).decode('utf-8').strip()
print(f"OTP: {otp}")

# Verify OTP
req = urllib.request.Request("http://localhost:5035/api/Auth/verify-otp", method="POST", data=json.dumps({
    "email": email,
    "otpCode": otp
}).encode('utf-8'), headers={"Content-Type": "application/json"})
res = urllib.request.urlopen(req)
verify_res = json.loads(res.read().decode('utf-8'))
print(f"Verify OTP response: Token={verify_res.get('token')[:10]}... ID={verify_res.get('id')}")


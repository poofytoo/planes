import subprocess
import time

subprocess.Popen('sudo forever -a -e err.log -o out.log start app.js', shell=True)

while True:
    subprocess.Popen('sudo forever -a -e err.log -o out.log restart app.js', shell=True)
    time.sleep(60 * 20)

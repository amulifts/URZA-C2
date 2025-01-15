# django-urza-backend\backend\apps\st_client\process_manager.py

import subprocess
import os
import platform
import logging
from django.conf import settings
import win32gui
import win32con
import pyautogui
import time
from pathlib import Path


logger = logging.getLogger(__name__)

class ProcessManager:
    def __init__(self):
        self.process = None
        self.pid_file = Path(settings.BASE_DIR).parent / 'urza' / 'client.pid'

    def get_python_executable(self):
        """
        Returns the path to the Python executable in Urza's virtual environment.
        """
        project_root = os.path.abspath(os.path.join(settings.BASE_DIR, '..'))
        urza_env = os.path.join(project_root, 'urza', 'urzaenv')

        if os.name == 'nt':
            python_executable = os.path.join(urza_env, 'Scripts', 'python.exe')
        else:
            python_executable = os.path.join(urza_env, 'bin', 'python')

        if not os.path.exists(python_executable):
            raise FileNotFoundError(f"Python executable not found at {python_executable}")

        return python_executable

    def start_client(self, connection_url: str) -> int:
        """
        Starts the client process in a detached manner.
        """
        python_executable = self.get_python_executable()

        working_directory = os.path.abspath(os.path.join(settings.BASE_DIR, '..', 'urza'))
        main_py_path = os.path.join(working_directory, 'main.py')

        if os.path.exists(main_py_path):
            entry_script = 'main.py'
        else:
            raise FileNotFoundError(f"'main.py' not found in {working_directory}")

        command = [python_executable, entry_script, 'client', connection_url]
        logger.debug(f"Executing command: {' '.join(command)} in {working_directory}")

        try:
            if os.name == 'nt':
                # Windows: Open a detached process using START
                cmd_command = [
                    'cmd.exe', '/c', 'start', '', python_executable, entry_script, 'client', connection_url
                ]
                process = subprocess.Popen(cmd_command, cwd=working_directory, shell=False, env=os.environ.copy())
                pid = process.pid
                logger.info("Client process started successfully in a new console window.")
            else:
                # Unix/Linux/MacOS: Use `setsid` to detach the process
                self.process = subprocess.Popen(
                    command,
                    cwd=working_directory,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    shell=False,
                    preexec_fn=os.setsid,  # Detaches the process
                    env=os.environ.copy()
                )
                pid = self.process.pid
                logger.info(f"Started client process with PID: {self.process.pid}")
            
            # Write PID to file
            with self.pid_file.open('w') as f:
                f.write(str(pid))
            logger.debug(f"PID {pid} written to {self.pid_file}")

            return pid
        
        except Exception as e:
            logger.exception(f"Failed to start client process: {e}")
            raise e

    def stop_client(self):
        pass

# django-urza-backend/backend/apps/st_client/process_manager.py

import subprocess
import os
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class ProcessManager:
    def __init__(self):
        self.process = None

    def get_python_executable(self):
        """
        Returns the path to the Python executable in Urza's virtual environment.
        """
        # Determine project root (django-urza-backend/)
        project_root = os.path.abspath(os.path.join(settings.BASE_DIR, '..'))

        # Path to Urza's virtual environment
        urza_env = os.path.join(project_root, 'urza', 'urzaenv')

        if os.name == 'nt':
            # Windows
            python_executable = os.path.join(urza_env, 'Scripts', 'python.exe')
        else:
            # Unix/Linux/MacOS
            python_executable = os.path.join(urza_env, 'bin', 'python')

        if not os.path.exists(python_executable):
            raise FileNotFoundError(f"Python executable not found at {python_executable}")

        return python_executable

    def start_client(self, connection_url: str):
        if self.process and self.process.poll() is None:
            raise Exception("Client is already running.")

        python_executable = self.get_python_executable()

        # Determine the entry script
        # Check if 'main.py' exists; if not, use 'st.py'
        working_directory = os.path.abspath(os.path.join(settings.BASE_DIR, '..', 'urza'))
        main_py_path = os.path.join(working_directory, 'main.py')
        st_py_path = os.path.join(working_directory, 'st.py')

        if os.path.exists(main_py_path):
            entry_script = 'main.py'
        elif os.path.exists(st_py_path):
            entry_script = 'st.py'
        else:
            raise FileNotFoundError(f"Neither 'main.py' nor 'st.py' found in {working_directory}")

        command = [python_executable, entry_script, 'client', connection_url]
        logger.debug(f"Executing command: {' '.join(command)} in {working_directory}")

        try:
            if os.name == 'nt':
                # Windows: Use cmd.exe to start a new window
                # The empty string "" after 'start' is for the window title
                cmd_command = [
                    'cmd.exe', '/c', 'start', '', python_executable, entry_script, 'client', connection_url
                ]
                subprocess.Popen(
                    cmd_command,
                    cwd=working_directory,
                    shell=False,
                    env=os.environ.copy()
                )
                logger.info("Client process started successfully in a new console window.")
            else:
                # Unix-like systems
                self.process = subprocess.Popen(
                    command,
                    cwd=working_directory,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    shell=False,
                    env=os.environ.copy()
                )
                logger.info(f"Started client process with PID: {self.process.pid}")

                # Optional: Log stdout and stderr
                stdout, stderr = self.process.communicate()
                if stdout:
                    logger.info(f"Client stdout: {stdout.decode()}")
                if stderr:
                    logger.error(f"Client stderr: {stderr.decode()}")

            return self.process
        except Exception as e:
            logger.exception(f"Failed to start client process: {e}")
            raise e

    def terminate_client(self):
        if self.process and self.process.poll() is None:
            logger.info(f"Terminating client process with PID: {self.process.pid}")
            self.process.terminate()
            try:
                self.process.wait(timeout=10)
                logger.info("Client process terminated successfully.")
            except subprocess.TimeoutExpired:
                logger.warning("Client process did not terminate in time; killing it.")
                self.process.kill()
                self.process.wait()
                logger.info("Client process killed.")
        else:
            raise Exception("Client is not running.")
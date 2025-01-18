# django-urza-backend/backend/apps/st_client/process_manager.py

import subprocess
import os
import logging
from pathlib import Path
from django.conf import settings

logger = logging.getLogger(__name__)

class ClientManager:
    def __init__(self):
        self.process = None
        # Separate PID file for Client
        self.pid_file = Path(settings.BASE_DIR).parent / 'urza' / 'client.pid'

    def get_python_executable(self):
        """
        Returns the path to the Python executable in Urza's virtual environment.
        """
        project_root = os.path.abspath(os.path.join(settings.BASE_DIR, '..'))
        urza_env = os.path.join(project_root, 'urza', 'urzaenv')

        python_executable = os.path.join(urza_env, 'bin', 'python')

        if not os.path.exists(python_executable):
            raise FileNotFoundError(f"Python executable not found at {python_executable}")

        return python_executable

    def is_client_running(self):
        """
        Checks if the Client is currently running by verifying the PID file and process existence.
        """
        if self.pid_file.exists():
            try:
                with self.pid_file.open('r') as f:
                    pid = int(f.read().strip())
                os.kill(pid, 0)  # Check if process exists
                return True
            except ProcessLookupError:
                logger.warning(f"Client PID {pid} not found. Removing stale PID file.")
                self.pid_file.unlink()
                return False
            except Exception as e:
                logger.exception(f"Error checking Client status: {e}")
                return False
        return False

    def start_client(self, connection_url: str):
        """
        Starts the Client process with the given connection URL.
        """
        if self.is_client_running():
            raise Exception("Client is already running.")

        python_executable = self.get_python_executable()
        working_directory = os.path.abspath(os.path.join(settings.BASE_DIR, '..', 'urza'))
        client_py_path = os.path.join(working_directory, 'client.py')  # Assuming client.py is the client script

        if not os.path.exists(client_py_path):
            raise FileNotFoundError(f"'client.py' not found in {working_directory}")

        command = [
            python_executable,
            "client.py",
            "connect",
            connection_url
        ]

        logger.debug(f"Executing command: {' '.join(command)} in {working_directory}")

        try:
            # Start the subprocess detached from the parent
            process = subprocess.Popen(
                command,
                cwd=working_directory,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=False,
                preexec_fn=os.setsid,  # Start the process in a new session
                env=os.environ.copy()
            )
            pid = process.pid
            self.process = process  # Store the process object
            logger.info(f"Client started successfully with PID: {pid}")

            # Write PID to file
            with self.pid_file.open('w') as f:
                f.write(str(pid))
            logger.debug(f"PID {pid} written to {self.pid_file}")

            return pid

        except Exception as e:
            logger.exception(f"Failed to start Client: {e}")
            raise e

    def stop_client(self):
        """
        Stops the Client process if it's running.
        """
        if self.pid_file.exists():
            try:
                with self.pid_file.open('r') as f:
                    pid_str = f.read().strip()
                    pid = int(pid_str)
            except Exception as e:
                logger.exception(f"Failed to read PID file: {e}")
                raise Exception("Invalid PID file.")

            try:
                # Terminate the entire process group
                os.killpg(os.getpgid(pid), subprocess.signal.SIGTERM)
                logger.info(f"Sent SIGTERM to Client process group with PGID: {os.getpgid(pid)}")
                # Optionally, wait for the process to terminate
                os.waitpid(pid, 0)
                logger.info("Client stopped successfully.")
            except ProcessLookupError:
                logger.warning(f"No process found with PID {pid}. It may have already been stopped.")
            except Exception as e:
                logger.exception(f"Failed to stop Client with PID {pid}: {e}")
                raise Exception(f"Failed to stop Client with PID {pid}.")
            finally:
                # Remove the PID file
                try:
                    self.pid_file.unlink()
                    logger.debug("PID file removed successfully.")
                except Exception as e:
                    logger.warning(f"Failed to remove PID file: {e}")
        else:
            logger.warning("Client PID file not found. It may already be stopped.")

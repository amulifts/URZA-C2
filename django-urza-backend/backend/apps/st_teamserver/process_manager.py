# URZA-C2/django-urza-backend/backend/apps/st_teamserver/process_manager.py

import subprocess
import os
import platform
import logging
import signal
from django.conf import settings
from pathlib import Path

logger = logging.getLogger(__name__)

class TeamServerManager:
    def __init__(self):
        self.process = None
        self.pid_file = Path(settings.BASE_DIR).parent / 'urza' / 'teamserver.pid'

    def get_python_executable(self):
        """
        Returns the path to the Python executable in URZA's virtual environment
        located at 'urza/venv'.
        """
        # BASE_DIR -> something like: /path/to/URZA-C2/django-urza-backend/backend
        project_root = os.path.abspath(os.path.join(settings.BASE_DIR, '..'))
        # e.g. /path/to/URZA-C2/django-urza-backend/urza/venv
        urza_env = os.path.join(project_root, 'urza', 'venv')

        if os.name == 'nt':
            python_executable = os.path.join(urza_env, 'Scripts', 'python.exe')
        else:
            python_executable = os.path.join(urza_env, 'bin', 'python')

        if not os.path.exists(python_executable):
            raise FileNotFoundError(f"Python executable not found at {python_executable}")

        return python_executable

    def start_teamserver(self, host: str, password: str, port: int, secure: bool):
        python_executable = self.get_python_executable()
        working_directory = os.path.abspath(os.path.join(settings.BASE_DIR, '..', 'urza'))
        st_py_path = os.path.join(working_directory, 'main.py')

        if not os.path.exists(st_py_path):
            raise FileNotFoundError(f"'main.py' not found in {working_directory}")

        command = [
            python_executable,
            "main.py",
            "teamserver",
            host,
            password,
            "--port",
            str(port)
        ]
        if not secure:
            command.append("--insecure")

        logger.debug(f"Executing command: {' '.join(command)} in {working_directory}")

        try:
            self.process = subprocess.Popen(
                command,
                cwd=working_directory,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid,  # Detaches on Unix
                env=os.environ.copy()
            )
            logger.info(f"TeamServer started with PID: {self.process.pid}")

            with self.pid_file.open('w') as f:
                f.write(str(self.process.pid))

            return self.process.pid

        except Exception as e:
            logger.exception(f"Failed to start TeamServer: {e}")
            raise e

    def stop_teamserver(self):
        if self.pid_file.exists():
            try:
                with self.pid_file.open('r') as f:
                    pid_str = f.read().strip()
                pid = int(pid_str)

                os.killpg(os.getpgid(pid), signal.SIGTERM)
                logger.info("TeamServer stopped successfully.")
            except ProcessLookupError:
                logger.warning(f"No process found with PID {pid}. Already stopped?")
            except Exception as e:
                logger.exception(f"Error stopping TeamServer: {e}")
                raise e
            finally:
                try:
                    self.pid_file.unlink()
                    logger.debug("Removed TeamServer PID file.")
                except Exception:
                    logger.warning("Unable to remove PID file.")
        else:
            logger.warning("No TeamServer PID file found; server might already be stopped.")

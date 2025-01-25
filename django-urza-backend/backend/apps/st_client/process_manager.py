# URZA-C2/django-urza-backend/backend/apps/st_client/process_manager.py

import subprocess
import os
import signal
import logging
from django.conf import settings
from pathlib import Path

logger = logging.getLogger(__name__)

class ProcessManager:
    def __init__(self):
        self.process = None
        self.pid_file = Path(settings.BASE_DIR).parent / 'urza' / 'client.pid'

    def get_python_executable(self):
        project_root = os.path.abspath(os.path.join(settings.BASE_DIR, '..'))
        urza_env = os.path.join(project_root, 'urza', 'venv')  # note the venv location

        if os.name == 'nt':
            python_executable = os.path.join(urza_env, 'Scripts', 'python.exe')
        else:
            python_executable = os.path.join(urza_env, 'bin', 'python')

        if not os.path.exists(python_executable):
            raise FileNotFoundError(f"Python executable not found at {python_executable}")

        return python_executable

    def start_client(self, connection_url: str) -> int:
        python_executable = self.get_python_executable()
        working_directory = os.path.abspath(os.path.join(settings.BASE_DIR, '..', 'urza'))
        main_py_path = os.path.join(working_directory, 'main.py')

        if not os.path.exists(main_py_path):
            raise FileNotFoundError(f"'main.py' not found in {working_directory}")

        command = [python_executable, 'main.py', 'client', connection_url]
        logger.debug(f"Executing: {' '.join(command)} in {working_directory}")

        try:
            self.process = subprocess.Popen(
                command,
                cwd=working_directory,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid,
                env=os.environ.copy()
            )
            pid = self.process.pid
            logger.info(f"Started client process with PID: {pid}")

            with self.pid_file.open('w') as f:
                f.write(str(pid))

            return pid
        except Exception as e:
            logger.exception(f"Failed to start client: {e}")
            raise e

    def stop_client(self):
        if self.pid_file.exists():
            try:
                with self.pid_file.open('r') as f:
                    pid_str = f.read().strip()
                pid = int(pid_str)
                os.killpg(os.getpgid(pid), signal.SIGTERM)
                logger.info("Client stopped successfully.")
            except ProcessLookupError:
                logger.warning(f"No process with PID {pid} found.")
            except Exception as e:
                logger.exception(f"Error stopping client: {e}")
                raise e
            finally:
                try:
                    self.pid_file.unlink()
                except Exception:
                    logger.warning("Could not remove client PID file.")
        else:
            logger.warning("No client PID file. Possibly not running.")


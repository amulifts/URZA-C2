# django-urza-backend/backend/apps/st_teamserver/process_manager.py

import subprocess
import os
import platform
import logging
from django.conf import settings
from pathlib import Path
import re
from typing import Optional
import threading

logger = logging.getLogger(__name__)

class TeamServerManager:
    def __init__(self):
        self.process = None
        self.pid_file = Path(settings.BASE_DIR).parent / 'urza' / 'teamserver.pid'

    def get_python_executable(self) -> str:
        project_root = os.path.abspath(os.path.join(settings.BASE_DIR, '..'))
        urza_env = os.path.join(project_root, 'urza', 'urzaenv')

        if os.name == 'nt':
            python_executable = os.path.join(urza_env, 'Scripts', 'python.exe')
        else:
            python_executable = os.path.join(urza_env, 'bin', 'python')

        if not os.path.exists(python_executable):
            raise FileNotFoundError(f"Python executable not found at {python_executable}")

        return python_executable

    def _log_stream(self, stream, log_level):
        for line in iter(stream.readline, b''):
            decoded_line = line.decode('utf-8').rstrip()
            if decoded_line:
                logger.log(log_level, decoded_line)
        stream.close()

    def start_teamserver(self, host: str, password: str, port: int, secure: bool) -> Optional[int]:
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
            if os.name == 'nt':
                # Windows: Start the process detached
                process = subprocess.Popen(
                    command,
                    cwd=working_directory,
                    creationflags=subprocess.CREATE_NEW_CONSOLE,
                    shell=False,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    env=os.environ.copy()
                )
            else:
                # Unix/Linux/MacOS: Use setsid to detach
                process = subprocess.Popen(
                    command,
                    cwd=working_directory,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    shell=False,
                    preexec_fn=os.setsid,
                    env=os.environ.copy()
                )
            self.process = process
            logger.info(f"TeamServer started successfully with PID: {process.pid}")

            # Start threads to log stdout and stderr
            stdout_thread = threading.Thread(target=self._log_stream, args=(process.stdout, logging.INFO))
            stderr_thread = threading.Thread(target=self._log_stream, args=(process.stderr, logging.ERROR))
            stdout_thread.start()
            stderr_thread.start()

            # Write PID to file
            with self.pid_file.open('w') as f:
                f.write(str(process.pid))

            return process.pid
        except Exception as e:
            logger.exception(f"Failed to start TeamServer: {e}")
            raise e

    def stop_teamserver(self):
        if self.pid_file.exists():
            try:
                with self.pid_file.open('r') as f:
                    pid_str = f.read().strip()
                    pid = int(pid_str)
            except Exception as e:
                logger.exception(f"Failed to read PID file: {e}")
                raise Exception("Invalid PID file.")

            try:
                if os.name == 'nt':
                    subprocess.check_call(['taskkill', '/F', '/T', '/PID', str(pid)])
                    # once stopped clear the log file
                    log_file_path = Path(settings.BASE_DIR).parent / 'urza' / 'urza' / 'core' / 'teamserver' / 'logs' / 'live_logs.json'
                    if log_file_path.exists():
                        with log_file_path.open('w') as f:
                            f.write("")
                else:
                    os.killpg(os.getpgid(pid), subprocess.signal.SIGTERM)
                logger.info("TeamServer stopped successfully.")
            except subprocess.CalledProcessError as cpe:
                logger.exception(f"Failed to stop TeamServer with PID {pid}: {cpe}")
                raise Exception(f"Failed to stop TeamServer with PID {pid}.")
            except ProcessLookupError:
                logger.warning(f"No process found with PID {pid}. It may have already been stopped.")
            except Exception as e:
                logger.exception(f"An unexpected error occurred while stopping TeamServer: {e}")
                raise e
            finally:
                try:
                    self.pid_file.unlink()
                    logger.debug("PID file removed successfully.")
                except Exception as e:
                    logger.warning(f"Failed to remove PID file: {e}")
        else:
            logger.warning("TeamServer PID file not found. It may already be stopped.")


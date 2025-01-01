# URZA-C2

Welcome to **URZA-C2** – a modern, experimental platform that integrates **Django** and **Next.js** with the **URZA** teamserver for a powerful and user-friendly Command & Control experience.

---

## About

- **Django URZA Backend**: Houses the Python-based API that communicates with URZA and orchestrates C2 operations.
- **Next URZA Frontend**: A Next.js application providing a sleek UI for interacting with the backend and performing red team tasks.

**URZA** remains a separate project and can be installed or linked locally to provide the underlying C2 logic.

---

## Quick Start

1. **Clone** this repo alongside your urza repository.
2. **Install** dependencies:
   ```bash
   cd django-urza-backend
   python -m venv .env
   source .env/bin/activate
   pip install -r requirements.txt
    ```
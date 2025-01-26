# URZA-C2

> **A Modern, Flexible, and Modular Command & Control Framework**  
> URZA-C2 integrates a **Django Backend**, **Next.js Frontend**, and the **URZA C2 Engine** to deliver a comprehensive offensive security platform.

[![Python][python-badge]][python-link]
[![Django][django-badge]][django-link]
[![TypeScript][typescript-badge]][typescript-link]
[![Next.js][nextjs-badge]][nextjs-link]
[![Visual Studio Code][vscode-badge]][vscode-link]
[![Git][git-badge]][git-link]

![Sample][Sample]

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
  - [1. URZA C2 Engine](#1-urza-c2-engine)
  - [2. Django Backend](#2-django-backend)
  - [3. Next.js Frontend](#3-nextjs-frontend)
- [Features](#features)
  - [URZA C2 Engine Features](#urza-c2-engine-features)
  - [Django Backend Features](#django-backend-features)
  - [Next.js Frontend Features](#nextjs-frontend-features)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [URZA C2 Engine Setup](#urza-c2-engine-setup)
- [Usage](#usage)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
  - [Running the URZA C2 Engine](#running-the-urza-c2-engine)
- [Configuration](#configuration)
  - [Backend Configuration](#backend-configuration)
  - [Frontend Configuration](#frontend-configuration)
  - [URZA C2 Engine Configuration](#urza-c2-engine-configuration)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## Overview

**URZA-C2** is a robust and scalable Command & Control framework designed for advanced red team operations. It seamlessly integrates a **Django Backend**, a **Next.js Frontend**, and the **URZA C2 Engine** to provide a full-stack solution for managing and orchestrating offensive security tasks.

---

## Architecture

![Flow][Flow]

### 1. URZA C2 Engine

- **Location**: `urza/` directory
- **Purpose**:  
  The core engine responsible for handling listeners, stagers, sessions, modules, and secure communication. It manages the lifecycle of the TeamServer and Client processes, ensuring efficient and secure operations.

### 2. Django Backend

- **Location**: `django-urza-backend/` directory
- **Purpose**:  
  Acts as the API layer, handling user authentication, role-based access control, process orchestration (start/stop TeamServer and Client), and providing endpoints for the frontend to interact with the C2 engine.

### 3. Next.js Frontend

- **Location**: `next-urza-frontend/frontend/` directory
- **Purpose**:  
  Delivers a responsive and intuitive user interface for administrators to manage users, control the TeamServer and Client processes, monitor logs, and perform various C2 operations through seamless API interactions.

---

## Features

### URZA C2 Engine Features

- **Multi-User & Multi-Server**  
  Supports multi-user collaboration. Additionally, the client can connect to and control multiple TeamServers.

- **Client and TeamServer Built in Python 3.7**  
  Utilizes the latest features of Python, with heavy use of `asyncio` for exceptional performance.

- **Real-time Updates and Communication**  
  WebSockets enable real-time communication and updates between the Client and TeamServer.

- **Focus on Usability with an Extremely Modern CLI**  
  Powered by [prompt-toolkit](https://github.com/prompt-toolkit/python-prompt-toolkit) for an enhanced command-line experience.

- **Dynamic Evaluation/Compilation Using .NET Scripting Languages**  
  The URZA implant [Naga](https://github.com/byt3bl33d3r/Naga) uses embedded third-party .NET scripting languages (e.g., [Boolang](https://github.com/boo-lang/boo)) to dynamically compile/evaluate tasks. This removes the need to compile tasks server-side, allows real-time editing of modules, provides greater flexibility and stealth over traditional C#-based payloads, and makes everything much more lightweight.

- **ECDHE Encrypted C2 Communication**  
  Utilizes Ephemeral Elliptic Curve Diffie-Hellman Key Exchange to encrypt all C2 traffic between the TeamServer and its implant.

- **Fully Modular**  
  Listeners, Modules, Stagers, and C2 Channels are fully modular, allowing operators to easily build and integrate their own components.

- **Extensive Logging**  
  Every action is logged to a file for thorough auditing and troubleshooting.

- **Future-Proof**  
  HTTPS/HTTP listeners are built on [Quart](https://gitlab.com/pgjones/quart) & [Hypercorn](https://gitlab.com/pgjones/hypercorn), which support HTTP/2 & WebSockets.

### Django Backend Features

- **User Authentication**  
  JWT-based authentication with token refresh and blacklisting to ensure secure access control.

- **Role-Based Access Control**  
  Define Admin and User roles with specific permissions, ensuring that sensitive operations are restricted to authorized personnel.

- **User Management**  
  Create, update, delete, and impersonate users through comprehensive API endpoints.

- **Process Orchestration**  
  API endpoints to control TeamServer and Client processes, including starting, stopping, and monitoring.

- **Logging Endpoints**  
  Fetch and display real-time logs from the TeamServer, facilitating effective monitoring and troubleshooting.

### Next.js Frontend Features

- **Responsive UI**  
  Modern and intuitive interface built with Next.js and Tailwind CSS, ensuring accessibility across devices.

- **Authentication Flow**  
  Secure login and logout mechanisms with automatic token management and refresh capabilities.

- **User Management Interface**  
  Admin panel to manage users and roles, including features like impersonation and detailed user profiles.

- **TeamServer Control Panel**  
  Start/stop TeamServer and view connection details directly from the UI.

- **Client Connection Management**  
  Connect/disconnect clients and monitor their status through an interactive interface.

- **Real-Time Logs**  
  Display live logs from the TeamServer for monitoring activities and diagnosing issues in near real-time.

- **Modern CLI Integration**  
  Seamlessly integrates with the backend's modern CLI for enhanced usability and control.

---

## Installation

### Prerequisites

Ensure you have the following installed on your system:

| Component                | Requirement       |
| ------------------------ | ----------------- |
| **Python**               | 3.7+              |
| **Node.js**              | v22+               |
| **PostgreSQL**           | 16+                |
| **pip**                  | Latest version    |
| **npm** / **yarn**       | Latest version    |

### Backend Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/amulifts/URZA-C2.git
   cd URZA-C2/django-urza-backend
   ```

2. **Create a Virtual Environment**

   ```bash
   python3 -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**

   Create a `.env` file in the `django-urza-backend/backend/` directory:

   ```env
   SECRET_KEY=your_django_secret_key
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   DATABASE_URL=postgres://postgres:admin@localhost:5432/urzaC2
   ```

5. **Apply Migrations and Create Superuser**

   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Run the Backend Server**

   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

### Frontend Setup

1. **Navigate to Frontend Directory**

   ```bash
   cd ../../next-urza-frontend/frontend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   npx install
   ```

3. **Configure Environment Variables**

   Create a `.env.local` file in the `next-urza-frontend/frontend/` directory:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```

4. **Run the Frontend Server**

   ```bash
   npx next dev
   ```

### URZA C2 Engine Setup

1. **Navigate to URZA Directory**

   ```bash
   cd ../../urza
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Manually run the URZA C2 Engine**

   ```bash
   python main.py teamserver 0.0.0.0 admin --port 5365 --insecure
   or
   python main.py teamserver 0.0.0.0 admin --port 5365 --secure
   ```

4. **Manually Connect to the URZA C2 Engine**

   ```bash
   python main.py client ws://operator:admin@127.0.0.1:5365 
   ```



---

## Usage

### Running the Backend

1. **Start the Django Server**

   ```bash
   cd django-urza-backend
   source venv/bin/activate    # Activate the virtual environment
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Access the Admin Panel**

   Open [http://localhost:8000/admin/](http://localhost:8000/admin/) and log in with the superuser credentials created during setup.

### Running the Frontend

1. **Start the Next.js Server**

   ```bash
   cd next-urza-frontend/frontend
   npx next dev
   ```

2. **Access the Frontend**

   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Login Flow**

   - **Admin Users**: Can manage users, start/stop TeamServer, and impersonate other users.
   - **Regular Users**: Can connect/disconnect clients and view logs.

### Running the URZA C2 Engine

1. **Start the TeamServer**

   Use the frontend interface to start TeamServer by providing the necessary details.

2. **Connect Clients**

   Use the frontend interface to connect clients to the TeamServer by providing the necessary connection details.

3. **Monitor Logs**

   Access real-time logs through the frontend's TeamServer control panel to monitor activities and troubleshoot issues.

---

## Configuration

### Backend Configuration

- **Settings File**: `django-urza-backend/backend/backend/settings.py`
- **Key Configurations**:
  - **Database**: Configured via `DATABASE_URL` in `.env`.
  - **Security**: Adjust `SECRET_KEY`, `DEBUG`, and `ALLOWED_HOSTS` as needed.
  - **JWT Settings**: Managed by `rest_framework_simplejwt`.

### Frontend Configuration

- **Environment Variables**: Managed via `.env.local` in `next-urza-frontend/frontend/`.
  - `NEXT_PUBLIC_API_BASE_URL`: API endpoint for the backend.

### URZA C2 Engine Configuration

- **Environment Variables**: Managed via `.env` in the `urza/` directory.
  - `TEAMSERVER_HOST`: Host address for the TeamServer.
  - `TEAMSERVER_PORT`: Port number for the TeamServer.
  - `TEAMSERVER_PASSWORD`: Password for securing the TeamServer.
  - `SECURE_MODE`: Enable or disable secure communication (WSS).
  - `LOG_FILE_PATH`: Path to the log file for TeamServer activities.

> **Note**: For production, always disable `DEBUG`, set strong credentials, and use HTTPS.

---

## Security Notes

- **JWT Authentication**: Utilizes token-based authentication with refresh tokens and blacklisting to ensure secure access.
- **Role-Based Access Control**: Differentiates between Admin and User roles to restrict access to sensitive operations.
- **Secure Communication**: Supports WSS (WebSocket Secure) for encrypted client-server communication.
- **Environment Variables**: Sensitive information like `SECRET_KEY` and `TEAMSERVER_PASSWORD` are managed via environment variables and excluded from version control using `.gitignore`.
- **CORS Configuration**: Ensure `ALLOWED_HOSTS` in Django settings are properly configured for production environments.
- **Regular Updates**: Keep dependencies up-to-date to mitigate known vulnerabilities.

> **⚠️ Warning:**  
> Always run the backend and frontend in secure environments. Never expose `DEBUG=True` in production, and use strong, unique passwords for all components.

---

## Contributing

We welcome contributions to **URZA-C2**! To contribute:

1. **Fork the Repository**

   Click the [Fork](https://github.com/amulifts/URZA-C2/fork) button at the top right of this page.

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/amulifts/URZA-C2.git
   cd URZA-C2
   ```

3. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

4. **Commit Your Changes**

   ```bash
   git commit -m "Add feature: Your Feature Description"
   ```

5. **Push to Your Fork**

   ```bash
   git push origin feature/YourFeatureName
   ```

6. **Open a Pull Request**

   Navigate to the original repository and click on **Compare & pull request**. Provide a clear description of your changes and submit the PR.

> **Note:**  
> Please ensure your code adheres to the project's coding standards and includes relevant tests.

---

## Team

  <a href = "https://github.com/amulifts"><img src = "https://avatars.githubusercontent.com/u/49828737?v=4" width="144"></a>

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

---

<!-- Badge links -->
[python-badge]: https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white
[django-badge]: https://img.shields.io/badge/Django-092E20?style=flat-square&logo=django&logoColor=white
[typescript-badge]: https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white
[nextjs-badge]: https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white
[vscode-badge]: https://img.shields.io/badge/Visual_Studio_Code-007ACC?style=flat-square&logo=visual-studio-code&logoColor=white
[git-badge]: https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white

<!-- Link definitions -->
[python-link]: https://www.python.org
[django-link]: https://www.djangoproject.com
[typescript-link]: https://www.typescriptlang.org
[nextjs-link]: https://nextjs.org
[vscode-link]: https://code.visualstudio.com/
[git-link]: https://git-scm.com/
[json-link]: https://www.json.org/json-en.html

[Sample]: ./sample/urza_sample.gif
[Flow]: ./sample/flow.png

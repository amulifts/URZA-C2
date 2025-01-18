# URZA/setup.py

import setuptools

setuptools.setup(
    name="urza",
    version="1.0.0",
    author="Aman Khadka",
    author_email="",
    description="URZA as a packaged Python library",
    packages=setuptools.find_packages(include=["urza", "urza.*"]),
    include_package_data=True,
    python_requires=">=3.7",
    install_requires=[
        # e.g. "aiosqlite", "websockets", etc., if you want them auto-installed
    ],
    entry_points={
        # If you want to keep main.py as a script entry point, you could do:
        # "console_scripts": [
        #     "main = urza.__main__:run",
        # ],
    },
)

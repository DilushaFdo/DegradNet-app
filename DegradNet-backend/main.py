"""DegradNet API — Entry Point.

This module serves as the thin entry point for uvicorn.
All application logic is organized in the `app` package.

Usage:
    uvicorn main:app --host 0.0.0.0 --port 7860
"""

from app import create_app

app = create_app()

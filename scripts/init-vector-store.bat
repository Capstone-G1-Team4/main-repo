@echo off
REM =============================================================================
REM init-vector-store.bat — Windows equivalent of init-vector-store.sh
REM =============================================================================
setlocal

set SCRIPT_DIR=%~dp0
set AI_DIR=%SCRIPT_DIR%Agentic-RAG

echo === Initializing Vector Store ===

cd /d "%AI_DIR%"

echo [1/2] Loading and chunking product data...
python app\rag\data_loader.py

echo [2/2] Generating embeddings and building vector store...
python app\rag\embeddings.py

echo.
echo === Vector store ready at %AI_DIR%\vector_store\ ===

endlocal

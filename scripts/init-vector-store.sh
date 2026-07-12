#!/usr/bin/env bash
# =============================================================================
# init-vector-store.sh
# Builds the ChromaDB vector store from processed product data.
# Run this once after cloning, or whenever product data changes.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_DIR="$(dirname "$SCRIPT_DIR")/Agentic-RAG"

echo "=== Initializing Vector Store ==="

cd "$AI_DIR"

echo "[1/2] Loading and chunking product data..."
python app/rag/data_loader.py

echo "[2/2] Generating embeddings and building vector store..."
python app/rag/embeddings.py

echo ""
echo "=== Vector store ready at $AI_DIR/vector_store/ ==="

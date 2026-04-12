#!/bin/bash
# cc24h verify — check that the system is usable
set -e
cd "$(dirname "$0")/.."

echo "=== cc24h verify ==="

echo -n "[1/5] Node.js... "; node --version
echo -n "[2/5] Deps... "; [ -d node_modules ] && echo "OK" || { echo "FAIL: run npm install"; exit 1; }
echo -n "[3/5] CLI... "; node bin/cc24h.mjs --version
echo "[4/5] Tests..."
node --test tests/core.test.mjs 2>&1 | tail -5
echo -n "[5/5] Import... "
rm -rf /tmp/cc24h-verify 2>/dev/null
node bin/cc24h.mjs enqueue examples/nightly.yaml -p /tmp/cc24h-verify 2>&1 | head -1
rm -rf /tmp/cc24h-verify 2>/dev/null

echo ""
echo "=== All checks passed ==="

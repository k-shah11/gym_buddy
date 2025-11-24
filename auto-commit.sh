#!/bin/bash
# Auto-commit script - syncs repository every 5 minutes

while true; do
  cd /home/runner/workspace
  
  # Check if there are uncommitted changes
  if ! git diff-index --quiet HEAD --; then
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Auto-committing changes..."
    git add -A
    git commit -m "Auto-commit: $(date +'%Y-%m-%d %H:%M:%S')" || true
    git push origin main 2>/dev/null || echo "Push failed or no remote origin"
  fi
  
  # Wait 5 minutes before next check
  sleep 300
done

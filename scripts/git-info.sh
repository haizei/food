#!/bin/bash

# Git信息脚本 - 用于Background Agent调试
echo "=== Git Repository Information ==="
echo "Current directory: $(pwd)"
echo "Git repository: $(git rev-parse --is-inside-work-tree 2>/dev/null || echo 'Not a git repository')"
echo "Git remote origin: $(git remote get-url origin 2>/dev/null || echo 'No remote origin')"
echo "Current branch: $(git branch --show-current 2>/dev/null || echo 'No current branch')"
echo "Git status: $(git status --porcelain 2>/dev/null || echo 'Git status failed')"
echo "=== End Git Information ==="

#!/usr/bin/env bash
# Creates sample_repo/: a small git repo with a feature branch that has planted problems.
# The key in the sample file is fake. Run from this folder: ./setup.sh
set -euo pipefail
cd "$(dirname "$0")"
rm -rf sample_repo && mkdir sample_repo && cd sample_repo
git init -q -b main
git config user.name "DevFest Demo" && git config user.email "demo@example.com"
echo "# Sample app" > README.md
git add README.md && git commit -qm "Initial project"
git checkout -qb feature/login
mkdir -p flutter_app && cp ../samples/login_service.dart flutter_app/
git add flutter_app && git commit -qm "Add login service"
echo "sample_repo is ready: branch feature/login, compared with main."

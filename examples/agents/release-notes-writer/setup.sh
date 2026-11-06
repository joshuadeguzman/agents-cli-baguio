#!/usr/bin/env bash
# Creates sample_repo/: a git repo with a v1.4.0 tag and seven commits after it.
# Run from this folder: ./setup.sh
set -euo pipefail
cd "$(dirname "$0")"
rm -rf sample_repo && mkdir sample_repo && cd sample_repo
git init -q -b main
git config user.name "DevFest Demo" && git config user.email "demo@example.com"
echo "Release 1.4.0" > CHANGES.txt
git add CHANGES.txt && git commit -qm "Release 1.4.0" && git tag v1.4.0
for m in "Add dark mode to settings" "Fix crash when opening an expired order" \
         "Refactor order repository" "Bump Flutter to 3.38 in CI" \
         "Show delivery ETA on the order screen" "Fix wrong total when a coupon is removed" \
         "Update dependencies"; do
  echo "$m" >> CHANGES.txt
  git add CHANGES.txt
  git commit -qm "$m"
done
echo "sample_repo is ready: v1.4.0 plus 7 commits."

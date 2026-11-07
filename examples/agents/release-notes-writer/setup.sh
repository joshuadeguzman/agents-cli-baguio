#!/usr/bin/env bash
# Creates sample_repo/ from sample_data/history.txt: Kain, a made-up food delivery app,
# with tags v1.3.0 and v1.4.0 and 30 commits after v1.4.0.
# Run from this folder: ./setup.sh
set -euo pipefail
cd "$(dirname "$0")"
HISTORY="$PWD/sample_data/history.txt"
rm -rf sample_repo && mkdir sample_repo && cd sample_repo
git init -q -b main
git config user.email "dev@kain.example"
git config commit.gpgsign false
git config tag.gpgsign false
n=0
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    ""|"#"*) continue ;;
    "tag "*) git tag "${line#tag }" ;;
    *)
      date="$(echo "$line" | cut -d'|' -f1 | xargs)"
      author="$(echo "$line" | cut -d'|' -f2 | xargs)"
      message="$(echo "$line" | cut -d'|' -f3- | sed 's/^ //')"
      echo "$message" >> CHANGES.txt
      git add CHANGES.txt
      GIT_AUTHOR_NAME="$author" GIT_COMMITTER_NAME="$author" \
      GIT_AUTHOR_DATE="${date}T10:00:00+08:00" GIT_COMMITTER_DATE="${date}T10:00:00+08:00" \
        git commit -q -m "$message"
      n=$((n + 1))
      ;;
  esac
done < "$HISTORY"
echo "sample_repo is ready: $n commits, tags $(git tag | tr '\n' ' ')"
echo "Commits since v1.4.0: $(git rev-list --count v1.4.0..HEAD)"

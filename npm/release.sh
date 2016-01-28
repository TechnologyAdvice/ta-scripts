#!/usr/bin/env bash

# bump package version
# commit
# create tag
# push commit & tag
# publish

usage() {
  echo ""
  echo "  Usage: bash $0 <major|minor|patch>"
}

run() {
  npm version $1
  git push
  git push --follow-tags
  npm publish
}

case $1 in
  "major" | "minor" | "patch")
    run $1
  ;;

  *)
    usage
    exit 1
  ;;
esac

#!/usr/bin/env bash

# Creates a changelog for the current build and puts it in the root
# Commits and pushes it if it updated

usage() {
  echo ""
  echo "  USAGE:  bash $0 [options]"
  echo ""
  echo "  OPTIONS:"
  echo "          -t    github personal access token"
}

error() {
  echo ""
  echo "  ERROR: $1"
  usage
  exit 1
}

run() {
  local endpoint="github-changelog-api.herokuapp.com/TechnologyAdvice/stardust"
  [ "$token" ] && endpoint+="?token=$token"

  curl -X POST ${endpoint} > CHANGELOG.md

  changelog_was_updated=false
  for modified_file in $(git ls-files -m); do
    [[ ${modified_file} == "CHANGELOG.md" ]] && changelog_was_updated=true
  done

  if ${changelog_was_updated}; then
    git add CHANGELOG.md
    git commit -n -m "update CHANGELOG.md by $CIRCLE_USERNAME [ci skip]"
    git push origin ${CIRCLE_BRANCH}
  fi
}

while getopts "t:" opt; do
  case ${opt} in
    t   ) token=${OPTARG};;
    h   ) usage; exit 0;;
    \?  ) error "Invalid option: -$OPTARG" >&2;;
    :   ) error "Option -$OPTARG requires an argument." >&2;;
    *   ) error "Unimplemented option: -$OPTARG" >&2;;
  esac
done

run

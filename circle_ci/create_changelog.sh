#!/usr/bin/env bash

# Creates a changelog for the current build and puts it in the root
# Commits and pushes it if it updated

curl -X POST github-changelog-api.herokuapp.com/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME > CHANGELOG.md

changelog_was_updated=false
for modified_file in $(git ls-files -m); do
  [[ ${modified_file} == "CHANGELOG.md" ]] && changelog_was_updated=true
done

if ${changelog_was_updated}; then
  git add CHANGELOG.md
  git commit -n -m "update CHANGELOG.md by $CIRCLE_USERNAME [ci skip]"
  git push origin $CIRCLE_BRANCH
fi

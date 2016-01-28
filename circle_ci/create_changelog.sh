#!/usr/bin/env bash

# Creates a changelog for the current build and puts it in the root

curl -X POST github-changelog-api.herokuapp.com/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME > CHANGELOG.md

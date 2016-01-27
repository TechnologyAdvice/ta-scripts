#!/usr/bin/env bash

usage() {
  echo ""
  echo "  USAGE:"
  echo "          bash circle_deploy.sh -e <staging|production> -d <path>"
  echo ""
  echo "  OPTIONS:"
  echo "          -e    environment to deploy to"
  echo "          -d    local directory to sync to S3 bucket"
  echo "          -b    S3 bucket name to sync to"
}

run() {
  # build
  echo "...build"
  echo "> npm run build"

  # s3 sync
  echo "...installing awscli"
  echo "> sudo pip install awscli"

  echo "...syncing with s3"
  echo "> aws s3 sync ${DIRECTORY} s3://${BUCKET}/ --delete --acl public-read"
}

deploy_staging() {
  export NODE_ENV=staging
  run
}

deploy_production() {
  export NODE_ENV=production
  run
}

# usage if no params
if [ -z "$*" ]; then usage; exit 1; fi

# get opts
while getopts ":b:d:e:" opt; do
  case ${opt} in
    b   ) BUCKET=${OPTARG};;
    d   ) DIRECTORY=${OPTARG};;
    e   ) ENVIRONMENT=${OPTARG};;
    h   ) usage; exit 0;;
    \?  ) echo "Invalid option: -$OPTARG" >&2; usage; exit 1;;
    :   ) echo "Option -$OPTARG requires an argument." >&2; usage; exit 1;;
    *   ) echo "Unimplemented option: -$OPTARG" >&2; usage; exit 1;;
  esac
done

# validate and run
if [ -z "$BUCKET" ]; then
  echo "-b bucket option is required"; usage; exit 1;
elif [ -z "$ENVIRONMENT" ]; then
  echo "-e environment option is required"; usage; exit 1;
elif [ -z "$DIRECTORY" ]; then
  echo "-d directory option is required"; usage; exit 1;
elif [[ ${ENVIRONMENT} == "production" ]]; then
  deploy_production
elif [[ ${ENVIRONMENT} == "staging" ]]; then
  deploy_staging
else
  echo "\"$ENVIRONMENT\" is not a valid -e argument"; usage; exit 1;
fi

unset BUCKET
unset DIRECTORY
unset ENVIRONMENT

#!/usr/bin/env bash

# Syncs a local directory to S3
#  - installs awscli if missing
#  - mirrors local directory to S3
#  - makes content publicly readable

usage() {
  echo ""
  echo "  USAGE:  bash $0 -d <directory> -b <bucket>"
  echo ""
  echo "  OPTIONS:"
  echo "          -d    local directory to sync to S3 bucket"
  echo "          -b    S3 bucket name to sync to"
}

error() {
  echo ""
  echo "  ERROR: $1"
  usage
  exit 1
}

run() {
  if hash aws 2>/dev/null; then
    echo "...awscli found"
  else
    echo "...installing awscli"
    sudo pip install awscli
  fi

  echo "...syncing with s3"
  aws s3 sync ${DIRECTORY} s3://${BUCKET}/ --delete --acl public-read
}

# get opts
while getopts ":b:d:e:" opt; do
  case ${opt} in
    b   ) BUCKET=${OPTARG};;
    d   ) DIRECTORY=${OPTARG};;
    h   ) usage; exit 0;;
    \?  ) error "Invalid option: -$OPTARG" >&2;;
    :   ) error "Option -$OPTARG requires an argument." >&2;;
    *   ) error "Unimplemented option: -$OPTARG" >&2;;
  esac
done

# validate and run
if [ -z "$DIRECTORY" ]; then
  error "-d directory option is required"
elif [ -z "$BUCKET" ]; then
  error "-b bucket option is required"
else
  run
fi

unset BUCKET
unset DIRECTORY

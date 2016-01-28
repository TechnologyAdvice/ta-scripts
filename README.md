ta-scripts
==========
Reusable shell agnostic scripting so you can get your shtuff done.

## Install

    $ npm i @technologyadvice/ta-scripts -D

## Usage

    $ ta-script <path_to_script> -- [...script_args]

1. Script paths are relative to the repo root
1. Just like npm scripts, use `--` to pass arguments to a script
1. Make sure the env executing the script has all the env vars used in the script

## Examples

#### S3 Sync

Sync local assets to a publicly readable bucket.

    $ ta-script aws/s3_sync.sh -- -d ./local-dir -b s3-bucket

#### Circle CI Changelog

Create a CHANGELOG.md in the root of the project for the current build _user_ and _repo_.

    $ ta-script circle_ci/create_changelog.sh

## Contribute

1. Clone this repo
1. Create a branch
1. Add a script
1. Open a PR

To test your scripts, run them with the cli:

    $ node cli.js <path-to-script>

### Releasing

On the latest clean `master`:

    npm run release:major
    npm run release:minor
    npm run release:patch

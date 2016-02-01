ta-scripts
==========
Managing separate scripts on multiple projects is not DRY nor maintainable.
This is a place to house your reusable scripts.

ta-scripts are installed with npm, so they are versioned.
A CLI is also included so you can run scripts with a single command.
This means you don't need to worry about which shell to use, nor file extensions, nor heavily nested paths.

## Install

    $ npm i @technologyadvice/ta-scripts -D

## Usage

    $ ta-script <path_to_script> [...script_args]

1. Script paths are relative to the repo root
1. Make sure the env executing the script has all the env vars used in the script
1. Extensions don't matter

## Examples

#### Circle CI Changelog

Create a CHANGELOG.md in the root of the project for the current build _user_ and _repo_.

    $ ta-script circle_ci/create_changelog

Private repo?  Add the `tadeploy` user's personal access token:

    $ ta-script circle_ci/create_changelog -t <token_string>

#### S3 Sync

Sync local assets to a publicly readable bucket.

    $ ta-script aws/s3_sync -d ./local-dir -b s3-bucket

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

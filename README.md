# ta-scripts
[![Circle CI](https://img.shields.io/circleci/project/TechnologyAdvice/ta-scripts/master.svg?style=flat-square)](https://circleci.com/gh/TechnologyAdvice/ta-scripts/tree/master)

Managing separate scripts on multiple projects is not DRY nor maintainable.
This is a place to house your reusable scripts.

&check; npm installed, shared, and versioned scripts  
&check; cli `ta-script` executes `bash` and `node` scripts  
&check; execute scripts without specifying extensions  
&check; get global benefit from company scripting skills and updates  

## Install

    $ npm i ta-scripts -D

## Usage

    $ ta-script <script> [...args]

1. Script paths are relative to the repo root
1. Make sure the env executing the script has all the env vars used in the script
1. Extensions don't matter

### How does it work?

#### `ta-script`

##### Search
This is a dead simple cli that traverses this repo looking for the `<script>` passed to it.
If found, it passes all the args to the script and executes it with the `[...args]`.

##### Extensionless
Do not include file extensions when running `ta-script`.
It will execute the script with the shell that matches the script file extension.
This allows switching the script between shells overtime without updating use of `ta-script`.

## Examples

#### Circle CI Changelog

Create a CHANGELOG.md in the root of the project for the current build _user_ and _repo_.

    $ ta-script circle_ci/create_changelog

Private repo?  Add a personal access token:

    $ ta-script circle_ci/create_changelog -t <token>

#### S3 Sync

Sync local assets to a publicly readable bucket.

    $ ta-script aws/s3_sync -d <local-dir> -b <s3-bucket>

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

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

#### Sync FunnelAdvice to S3

    $ ta-script "aws/s3_sync.sh" -- -d ./dist -b funneladvice.taplatform.net

## Contribute

1. Clone this repo
1. Create a branch
1. Add a script
1. Open a PR

To test your scripts, run them with the cli:

    $ node cli.js <path-to-script>

## Deploy

After merging a new PR:

    checkout master && git pull       # get the lastest master 
    npm version <major|minor|patch>   # bump package, commit, creates tag
    git push && git push --tags       # put it on github
    npm publish                       # put it on npm

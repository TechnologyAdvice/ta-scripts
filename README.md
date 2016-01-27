scripts
=======
Reusable shell agnostic scripting so you can get your shtuff done.

## Install

```bash
npm i @TechnologyAdvice/scripts -D
```

## Usage

```bash
ta-script <path_to_script> -- [...script_args]
```

1. Script paths are relative to the repo root
1. Just like npm scripts, use `--` to pass arguments to a script
1. Make sure the env executing the script has all the env vars used in the script


## Examples

### Sync FunnelAdvice to S3

```bash
ta-script "aws/s3_sync.sh" -- -d ./dist -b funneladvice.taplatform.net
```

## Contribute

Create a script and/or directory
Scripts can be written in `bash` or `node`.

## Deploy

```bash
npm version <major|minor|patch>   # bump package, commit, creates tag
git push && git push --tags       # put it on github
npm publish                       # put it on npm
```

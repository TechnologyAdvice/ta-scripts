ta-scripts
==========
Scripts you can curl to get your shtuff done.

## Usage

1. Get `tadeploy`'s `scripts` personal access token into your environment.
   This example assumes you've exported it as `GITHUB_TOKEN`.

1. Create a helper function to run scripts and pass handle arguments:

  ```bash
  taScript() {
    local script="$1"
    local url="https://api.github.com/repos/TechnologyAdvice/scripts/contents/$script"
    local auth_header="Authorization: token $GITHUB_TOKEN"
    local accept_header="Accept: application/vnd.github.v3.raw"
    shift # remove first arg, we'll pass remaining args to the script
    bash <(curl -fsSL ${url} -H "$auth_header" -H "$accept_header") "$@"
  }
  ```

### Example

Make sure your env has all the env vars used in the script or else the script will fail.

**Deploy Unity Staging**

```bash
taScript "circle_ci/deploy_app.sh" -e staging -d ./dist -b staging-unity.taplatform.net
```

**Deploy FunnelAdvice Production**

```bash
taScript "circle_ci/deploy_app.sh" -e production -d ./dist -b funneladvice.taplatform.net
```

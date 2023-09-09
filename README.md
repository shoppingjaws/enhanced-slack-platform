# Setup

## Notion Setup

### Publish token

- Publish Notion integration token with these scope
  - contents read/write/insert
  - comment read/insert
  - user read(email)

### Connect token to contents

read [here](https://www.notion.so/help/add-and-manage-connections-with-the-api)

### Install token into local

```bash
$ export NOTION_TOKEN=********
```

### Install token into remote

```bash
$ slack env add NOTION_TOKEN ********
```

# Install the Slack Workflow

To use this template, you need to install and configure the Slack CLI.
Step-by-step instructions can be found in our
[Quickstart Guide](https://api.slack.com/automation/quickstart).

## Install into workspace(locally)

```bash
$ slack run
```

## Install into workspace

```bash
$ slack deploy
```

## Change Workflow Builder visibility

```bash
$ slack function distribute
```

<img src="./packages/rapidroute/src/images/global/base_graphic.svg">

# RapidRoute

## A Route Planner and Navigator for the Minecart Rapid Transit Minecraft server

## Packages

### Main Website

`packages/rapidroute`

Contains code for the primary rapidroute website

### Database Importer

`packages/database-importer`

Imports data from various spreadsheets and dynmap into the RapidRoute database

### Database Types

`packages/database-types`

Contains typings for the RapidRoute database and other shared types

### ESLint Config

`packages/eslint-config`

Contains the base ESLint config for the RapidRoute project, extended by other packages

### Wiki Importer

`packages/wiki-importer`

Pulls data from the MRT wiki for import into the RapidRoute database. Not yet in use.

## Setup

### ESLint with VSCode

If you're using the VSCode ESLint extension, you may need to add the following to `.vscode/settings.json`

```json
  "eslint.workingDirectories": [
    "packages/rapidroute",
    "packages/database-importer",
    "packages/wiki-scraper",
    "packages/database-types"
  ],
```

You can run the following command to update this file automatically

```bash
touch .vscode/settings.json && echo '{\n  "eslint.workingDirectories": [\n    "packages/rapidroute",\n    "packages/database-importer",\n    "packages/wiki-scraper",\n "packages/database-types"]\n}' > .vscode/settings.json
```

### Automatic Dev Server Task

You can enable automatic tasks with the `Tasks: Manage Automatic Tasks in Folder` command in VSCode. If enabled, this will automatically run the dev server for the package you're working on when you open this folder in VSCode.

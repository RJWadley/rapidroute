<img src="../rapidroute/src/images/global/importer_graphic.svg">

# Database Importer

Imports data from various spreadsheets and dynmap into the RapidRoute database

## Development

1. Install dependencies from the root of the repository: `npm install`
2. Run the importer from this directory with: `npm start`

The script expects a `serviceAccountKey.json` file in the src of the repository. This file is not included in the repository for security reasons. Please contact the RapidRoute team for access to this file if you need it, or create your own Firebase project and use a service account key for that project. The importer should work on any empty Realtime Database.

# Storyblok import and export

A Node.js Script that allows you to export and import a CSV to Storyblok.

<hr>

The Node.js Script checks for column values starting with `http` and downloads the original File into the  `./images/` folder and than uploads it to Storyblok.

## Configuration

Create a `.env` file in the root directory:

```
STORYBLOK_PREVIEW_TOKEN=your_preview_token
STORYBLOK_SPACE_ID=your_space_id
STORYBLOK_OAUTH_TOKEN=your_oauth_token
```

## How to use it

### Exporting data from Storyblok as xlsx

1. Configure `.env` with your `STORYBLOK_PREVIEW_TOKEN` and `STORYBLOK_SPACE_ID`.
2. Execute `npm run export`.
3. Export will be saved at `/export/audit_<timestamp>.xlsx`.

### Import data to Storyblok from CSV

**Required:** The CSV requires a `name` and `slug` column for each entry.

1. Obtain the `oauthToken` for the Management API in the Storyblok UI Account area.
2. Define the `spaceId` you want to import your CSV into.
3. Define the `parentFolderId` (the numeric id - not the slug) to import your Stories there.
4. Define the `importFilePath` which needs to be the filepath to the CSV you want to join.
5. Execute `npx run import`.

## Commands

### Export

```bash
npm run export
```

### Import

```bash
npm run import
```

## Currently does not (out of the box) support 

1. Importing Bloks (feel free to adjust & maybe create a PR? :) )
2. Check for images vs links
3. Proper Error handling
4. Does not support RichText Imports by now.

## Known thing

- 422 Status Error: The script will fail with the API error message - 422 most likely will be the formatting of your CSV or that the Story with the slug already exists.

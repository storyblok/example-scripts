# Storyblok import and export

A Node.js Script that allows you to export and import a CSV to Storyblok.

<hr>

The Node.js Script checks for column values starting with `http` and downloads the original File into the  `./images/` folder and than uploads it to Storyblok.

## Configuration Options for config.js

```js
module.exports = {
  storyblok: {
    export: {
      previewToken: 'YOUR_PREVIEW_TOKEN',         // for export -> Delivery API
      options: {                                  // Content Delivery Parameters
        // starts_with: '/your-folder-slug',      // folder you want to export as CSV,
        version: 'draft',                         // version of content that should be exported
        per_page: 100,                            // 100 is max atm
        page: 1                                   // can be upped as needed.
      }
    },
    import: {
      oauthToken: 'YOUR_OAUTH_MANAGEMENT_TOKEN',  // for import -> Management API,
      spaceId: 83418,                             // Space ID you want to import it
      parentFolderId: 0,                          // Folder of the Parent ID
      importFilePath: './import/import.csv',      // File that should be imported 
    }
  }
}
```

## How to use it

### Exporting data from Storyblok as CSV

1. Configure the `previewToken` with the preview token of your space.
2. Leave the `options.starts_with` blank or remove if you dont want to use a specific folder.
3. Define the version of content which should be used `options.version`.
4. You can use any kind of Content Delivery Parameters in `options`.
5. Export will be saved at `/export/<timestamp>.csv`.
6. Execute `npx run export`.

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
npx run export
```

### Import

```bash
npx run import
```

## Currently does not (out of the box) support 

1. Importing Bloks (feel free to adjust & maybe create a PR? :) )
2. Check for images vs links
3. Proper Error handling
4. Does not support RichText Imports by now.

## Known thing

- 422 Status Error: The script will fail with the API error message - 422 most likely will be the formatting of your CSV or that the Story with the slug already exists.

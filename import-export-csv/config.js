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
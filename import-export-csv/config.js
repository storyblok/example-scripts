require('dotenv').config()

module.exports = {
  storyblok: {
    export: {
      previewToken: process.env.STORYBLOK_PREVIEW_TOKEN,
      spaceId: parseInt(process.env.STORYBLOK_SPACE_ID, 10),
      version: 'draft',
      perPage: 100
    },
    import: {
      oauthToken: process.env.STORYBLOK_OAUTH_TOKEN,
      spaceId: parseInt(process.env.STORYBLOK_SPACE_ID, 10),
      parentFolderId: 0,
      importFilePath: './import/import.csv'
    }
  },
  retry: {
    maxRetries: 5,
    defaultRetryDelay: 1000,
    paginationDelay: 200,
    requestTimeout: 30000
  }
}
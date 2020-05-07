const StoryblokClient = require('storyblok-js-client')
const json2csv = require('json2csv')
const fs = require('fs')
const config = require('./config')

// https://www.storyblok.com/docs/api/content-delivery#topics/authentication
const Storyblok = new StoryblokClient({
  accessToken: config.storyblok.export.previewToken,
  cache: {
    clear: 'auto',
    type: 'memory'
  }
})

const start = async () => {
  const response = await Storyblok.get('cdn/stories/', config.storyblok.export.options)
  
  const mapped = response.data.stories.map((story) => {
    return {
      name: story.name,
      slug: story.slug,
      ...story.content
    }
  })

  const csv = json2csv.parse(mapped, { fields: Object.keys(mapped[0]) })
  
  fs.writeFileSync('./export/' + Date.now() + '.csv', csv)
}

start()
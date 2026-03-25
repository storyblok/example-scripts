const { Storyblok: StoryblokClient } = require('storyblok-js-client')
const ExcelJS = require('exceljs')
const config = require('./config')

const { export: exportConfig } = config.storyblok
const { retry: retryConfig } = config

const Storyblok = new StoryblokClient({
  accessToken: exportConfig.previewToken,
  cache: {
    clear: 'auto',
    type: 'memory'
  }
})

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchWithRetry(endpoint, params, attempt = 0) {
  try {
    const response = await Storyblok.get(endpoint, params)
    return response
  } catch (error) {
    if (error.status === 429 && attempt < retryConfig.maxRetries) {
      const retryAfter = (error.response?.headers?.['retry-after'] || retryConfig.defaultRetryDelay / 1000) * 1000
      console.warn(`Rate limited (429), retrying after ${retryAfter}ms (attempt ${attempt + 1}/${retryConfig.maxRetries})`)
      await sleep(retryAfter)
      return fetchWithRetry(endpoint, params, attempt + 1)
    }
    throw error
  }
}

async function fetchAllStories() {
  const stories = []
  let page = 1
  let totalPages = 1

  console.log('Fetching stories from Storyblok...')

  while (page <= totalPages) {
    const params = {
      version: exportConfig.version,
      per_page: exportConfig.perPage,
      page: page
    }

    const response = await fetchWithRetry('cdn/stories/', params)

    stories.push(...response.data.stories)

    const total = parseInt(response.headers.total, 10)
    totalPages = Math.ceil(total / exportConfig.perPage)

    console.log(`Fetched page ${page}/${totalPages} (${stories.length} stories so far)`)

    page++

    if (page <= totalPages) {
      await sleep(retryConfig.paginationDelay)
    }
  }

  console.log(`Finished fetching ${stories.length} stories`)
  return stories
}

function buildStoryblokUrl(storyId) {
  return `https://app.storyblok.com/#/me/spaces/${exportConfig.spaceId}/stories/0/0/${storyId}`
}

function getStatus(story) {
  if (story.published_at) {
    return 'published'
  }
  return 'draft'
}

function getParentFolder(fullSlug, slug) {
  if (!fullSlug || !slug) return ''
  const parentPath = fullSlug.replace(new RegExp(`/?${slug}$`), '')
  return parentPath || ''
}

function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const year = date.getUTCFullYear()
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

function mapStory(story) {
  const parentFolder = getParentFolder(story.full_slug, story.slug)

  return {
    story_id: String(story.id),
    storyblok_url: buildStoryblokUrl(story.id),
    story_name: story.name,
    full_slug: story.full_slug,
    status: getStatus(story),
    content_type: story.content?.component || '',
    parent_folder: parentFolder,
    created_at: formatDate(story.created_at),
    first_published_at: formatDate(story.first_published_at),
    last_published_at: formatDate(story.published_at),
    last_updated_at: formatDate(story.updated_at),
    should_be_removed: ''
  }
}

const COLUMNS = [
  { header: 'story_id', key: 'story_id', width: 20 },
  { header: 'storyblok_url', key: 'storyblok_url', width: 70 },
  { header: 'story_name', key: 'story_name', width: 40 },
  { header: 'full_slug', key: 'full_slug', width: 50 },
  { header: 'status', key: 'status', width: 12 },
  { header: 'content_type', key: 'content_type', width: 20 },
  { header: 'parent_folder', key: 'parent_folder', width: 30 },
  { header: 'created_at (UTC)', key: 'created_at', width: 20 },
  { header: 'first_published_at (UTC)', key: 'first_published_at', width: 22 },
  { header: 'last_published_at (UTC)', key: 'last_published_at', width: 22 },
  { header: 'last_updated_at (UTC)', key: 'last_updated_at', width: 22 },
  { header: 'should_be_removed', key: 'should_be_removed', width: 18 }
]

async function start() {
  try {
    const stories = await fetchAllStories()

    if (stories.length === 0) {
      console.log('No stories found in the space.')
      return
    }

    const mappedStories = stories.map(story => mapStory(story))

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Stories Audit')

    worksheet.columns = COLUMNS

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    worksheet.getColumn('story_id').numFmt = '@'

    mappedStories.forEach(story => {
      worksheet.addRow(story)
    })

    worksheet.autoFilter = {
      from: 'A1',
      to: `L${mappedStories.length + 1}`
    }

    const filename = `./export/audit_${Date.now()}.xlsx`
    await workbook.xlsx.writeFile(filename)

    console.log(`Export complete: ${filename}`)
    console.log(`Total stories exported: ${mappedStories.length}`)
  } catch (error) {
    console.error('Export failed:', error.message)
    process.exit(1)
  }
}

start()

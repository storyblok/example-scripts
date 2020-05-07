const fs = require('fs')
const FormData = require('form-data')
const config = require('./config')
const request = require('request')
const sizeOf = require('image-size')
const StoryblokClient = require('storyblok-js-client')
const csv = require('csvtojson')
const { v4: uuidv4 } = require('uuid')

const start = async () => {
  let rows = await csv({ delimiter: ';' }).fromFile(config.storyblok.import.importFilePath)
  
  for (const row of rows) {

    for (const field in row) {
      if (row.hasOwnProperty(field)) {
        if (row[field].indexOf('http') == 0) {
          row[field] = await handleFile(row[field])
        }
      }
    }
    
    let data = {
      "story": {
        "name": row.name,
        "slug": row.slug,
        "content": {
          "_uid": uuidv4(),
          ...row
        },
        "is_startpage": false,
        "parent_id": config.storyblok.import.parentFolderId || 0
      }
    }
    
    const response = await Storyblok.post(`spaces/${config.storyblok.import.spaceId}/stories/`, data)
    console.log(data.story.name + ' imported')
  }
}

start()



/** Needs to be cleaned up **/

const Storyblok = new StoryblokClient({
  oauthToken: config.storyblok.import.oauthToken
})

const download = async (uri, fileName) => {
  return new Promise((resolve, reject) => {
    request.head(uri, (err, res, body) => {    
      request(uri).pipe(fs.createWriteStream('./images/' + fileName)).on('close', () => {
        return resolve(true)
      })
    })
  })
}

const upload = (signed_request, file) => {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    for (let key in signed_request.fields) {
      form.append(key, signed_request.fields[key])
    }
    form.append('file', fs.createReadStream(file))
    form.submit(signed_request.post_url, (err, res) => {
      if (err) reject(err)
      return resolve(res)
    })
  })
}

const signedUpload = async (fileName) => {
  return new Promise(async (resolve, reject) => {
    let dimensions = sizeOf('./images/' + fileName)

    const assetResponse = await Storyblok.post(`spaces/${config.storyblok.import.spaceId}/assets/`, {
      filename: fileName,
      size: `${dimensions.width}x${dimensions.height}`
    })
    let uploadResponse = await upload(assetResponse.data, './images/' + fileName)

    return resolve(assetResponse.data.pretty_url)
  })
}

const handleFile = async (fileURL) => {
  let fileName = fileURL.split('/').pop()
  await download(fileURL, fileName)
  return signedUpload(fileName) 
}
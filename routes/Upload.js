const Router = require('./Router')
const mime = require('mime-types')
const rand = require('random-id')

class Upload extends Router {
  constructor (Database) {
    super()
    this.post('/', async (req, res) => {
      try {
        if (!req.files) {
          res.send({
            status: false,
            message: 'No video uploaded'
          })
        } else {
          // Use the name of the input field (i.e. "video") to retrieve the uploaded file
          const video = req.files.video

          // checking the video file extension :)
          const ext = mime.extension(video.mimetype)
          const exts = ['mp4', 'flv', 'webm', 'mkv', 'vob', 'ogv', 'ogg', 'avi', 'wmv', 'mov', 'mpeg', 'mpg', 'mtc']
          if (!exts.includes(ext)) {
            return res.status(403).send({
              status: false,
              message: 'Invalid file type, file types that are allowed are: mp4, flv, webm, mkv, vob, ogv, ogg, avi, wmv, mov, mpeg, and mpg'
            })
          }
          console.log('Video File Type: ' + ext)

          const name = this.sanitizeHTML(req.body.name)
          const description = this.sanitizeHTML(req.body.description)
          const privacy = this.sanitizeHTML(req.body.privacy)
          const tags = this.sanitizeHTML(req.body.tags)
          const category = this.sanitizeHTML(req.body.category)

          if (category > 15) {
            res.status(500).send('Invalid category ID')
          } else if (category < 1) {
            res.status(500).send('Invalid category ID')
          } else {
            // do absolutely nothing
          }

          // Use the mv() method to place the file in upload directory (i.e. "uploads")
          await video.mv('./tmp/' + video.name)

          const id = rand(12, 'aA0')
          const ffmpeg = require('fluent-ffmpeg')
          const inFilename = './tmp/' + video.name
          const outFilename = './uploads/videos/' + id + '.mp4'

          const videoId = rand(12, 'aA0')

          console.log(outFilename)

          const convertToMp4 = async () => {
            ffmpeg(inFilename)
              .outputOptions('-c:v', 'copy')
              .save(outFilename)

            ffmpeg(inFilename)
              .on('error', function (err) {
                // handle error conditions
                if (err) {
                  console.log('Error transcoding file')
                }
              })
          }

          const userLoggedIn = req.session.user.userLoggedIn

          if (userLoggedIn === 'undefined') {
            res.setHeader('Content-Type', 'application/json')
            res.send(JSON.stringify({ message: 'You are not signed in!' }))
          }

          const insertVideoInfo = async () => {
            Database.insertVideo(name, description, privacy, category, tags, videoId, req.session.user.userLoggedIn, 'uploads/videos/" + id + ".mp4', (err, result) => {
              if (err) throw err
              console.log('Video Info inserted')

              console.dir(result)

              const processThumbnails = async () => {
                const thumbnailId = rand(20, 'aA0')
                const latestVideoId = result.insertId

                await ffmpeg(outFilename)
                  .screenshot({
                    count: 3,
                    folder: 'uploads/videos/thumbnails',
                    size: '1280x720',
                    filename: thumbnailId + '-' + id + '.png'
                  })

                const thumbnailVideoId = rand(12, 'aA0')
                Database.insertThumbnail(id, latestVideoId, thumbnailId, thumbnailVideoId, (err, result) => {
                  if (err) throw err
                  console.log('Thumbnail Video inserted')
                  console.dir(params)
                })

                const calculateVideoDuration = async () => {
                  await ffmpeg.ffprobe(outFilename, (err, metadata) => {
                    if (err) throw err
                    const latestVideoId = result.insertId
                    // const videoDuration = metadata.streams[0].duration <--- commented out unused variable

                    const duration = metadata.streams[0].duration
                    let hours = Math.floor(duration / 3600)
                    let mins = Math.floor((duration - hours * 3600) / 60)
                    let secs = Math.floor(duration % 60)
                    hours = hours < 1 ? '' : hours + ':'
                    mins = mins < 10 ? '0' + mins + ':' : mins + ':'
                    secs = secs < 10 ? '0' + secs : secs
                    const finalDuration = hours + mins + secs

                    console.log(finalDuration)

                    console.log(metadata)

                    Database.setVideoDuration(latestVideoId, duration, (err, result) => {
                      if (err) throw err
                      console.log(result)
                    })
                  })
                }

                const deleteInputVideo = async () => {
                  await fs.unlink(inFilename, (err) => {
                    if (err) throw err

                    console.log('Video: ' + inFilename + ' is now deleted from the tmp folder')

                    // send response
                    res.send({
                      status: true,
                      message: 'Video is uploaded',
                      data: {
                        name: video.name,
                        mimetype: video.mimetype,
                        size: video.size,
                        outputVideo: outFilename,
                        inputVideo: inFilename,
                        viewVideo: 'https://winsvideo.net/watch?v=' + videoId + ''
                      }
                    })
                  })
                }

                setTimeout(processThumbnails, 2000)
                setTimeout(calculateVideoDuration, 3000)
                setTimeout(deleteInputVideo, 4000)
              }
            })
          }
          setTimeout(convertToMp4, 500)
          setTimeout(insertVideoInfo, 1000)
        }
      } catch (err) {
        res.status(500).send(err)
      }
    })
  }
}
module.exports = Upload

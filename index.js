const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const _ = require('lodash')
const exec = require('child_process').exec
const rand = require('random-id')
const fs = require('fs')
const config = require('./config.json')
const sanitizeHtml = require('sanitize-html')
const mime = require('mime-types');
const session = require('express-session');

const app = express()

// enable session authentication 
const sessionId = rand(30, 'aA0')
app.use(session({resave: true, saveUninitialized: true, secret: sessionId, expires: new Date(Date.now() + (30 * 86400 * 1000))}));

// enable files upload
app.use(fileUpload({
  createParentPath: true
}))

// add other middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))

const validator = require('validator')

// start app
const port = process.env.PORT || 3000

const { readFile } = require('fs')
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require('constants')

const mysql = require('mysql')
const { lastIndexOf, get } = require('lodash')
const con = mysql.createConnection({
  host: config.dbInfo.host,
  user: config.dbInfo.user,
  password: config.dbInfo.password,
  database: config.dbInfo.database
})

app.listen(port, () =>
  console.log(`App is listening on port ${port}.`)
)

app.get('/', (req, res) => {
  readFile('./html/index.html', 'utf8', (err, html) => {
    if (err) {
      res.status(500).send('Page not available')
    }

    res.send(html)
  })
})

app.get('/upload', (req, res) => {
  readFile('./html/upload.html', 'utf8', (err, html) => {
    if (err) {
      res.status(500).send('Page not available')
    }

    res.send(html)
  })
})

app.post('/upload', async (req, res) => {
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
      const ext = mime.extension(video.mimetype);
      let exts = ["mp4", "flv", "webm", "mkv", "vob", "ogv", "ogg", "avi", "wmv", "mov", "mpeg", "mpg", "mtc"]
      if(!exts.includes(ext)){
        return res.status(403).send({
          status: false,
          message: 'Invalid file type, file types that are allowed are: mp4, flv, webm, mkv, vob, ogv, ogg, avi, wmv, mov, mpeg, and mpg'
        })
      }
      console.log("Video File Type: " + ext)

      const name = sanitizeHtml(req.body.name)
      const description = sanitizeHtml(req.body.description)
      const privacy = sanitizeHtml(req.body.privacy)
      const tags = sanitizeHtml(req.body.tags)
      const category = sanitizeHtml(req.body.category)

      if (category > 15) {
        res.status(500).send('Invalid category ID')
      } else if (category < 1) {
        res.status(500).send('Invalid category ID')
      } else {
        // do absolutely nothing
      }

      // Use the mv() method to place the file in upload directory (i.e. "uploads")
      video.mv('./tmp/' + video.name)

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

      let userLoggedIn = req.session.user.userLoggedIn; 

      if(userLoggedIn == "undefined") {
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify({ message: "You are not signed in!" }))
      }

      const insertVideoInfo = async () => {
        con.connect(function (err) {
          console.log('Video Upload database: Connected!')

          const sql = "INSERT INTO videos (title, uploadedBy, description, tags, privacy, category, filePath, url) VALUES ('" + name + "', '"+req.session.user.userLoggedIn+"', '" + description + "', '" + tags + "', '" + privacy + "', '1', 'uploads/videos/" + id + ".mp4', '" + videoId + "')"
          con.query(sql, function (err, result) {
            console.log('Video Info inserted')

            console.dir(result)
            const proccessThumbnails = async () => {
              const thumbnailId = rand(20, 'aA0')
              const latestVideoId = result.insertId

              await ffmpeg(outFilename)
                .screenshot({
                  count: 3,
                  folder: 'uploads/videos/thumbnails',
                  size: '1280x720',
                  filename: thumbnailId + '-' + id + '.png'
                })

              con.connect(function (err) {
                console.log('Thumbnail Upload Database: Connected')
                const thumbnailVideoId = rand(12, 'aA0')
                const sql = 'INSERT INTO thumbnails (videoId, filePath, selected, url) VALUES ?'
                const params = [
                  [latestVideoId, 'uploads/videos/thumbnails/' + thumbnailId + '-' + id + '_1.png', '1', thumbnailVideoId],
                  [latestVideoId, 'uploads/videos/thumbnails/' + thumbnailId + '-' + id + '_2.png', '0', thumbnailVideoId],
                  [latestVideoId, 'uploads/videos/thumbnails/' + thumbnailId + '-' + id + '_3.png', '0', thumbnailVideoId]
                ]
                con.query(sql, [params], function (err, result) {
                  console.log('Thumbnail Video inserted')
                  // console.dir(result)
                  console.dir(params)
                })
              })
            }

            const calculateVideoDuration = async () => {
              await ffmpeg.ffprobe(outFilename, function (err, metadata) {
                const latestVideoId = result.insertId
                const videoDuration = metadata.streams[0].duration

                const duration = metadata.streams[0].duration
                let hours = Math.floor(duration / 3600);
                let mins = Math.floor((duration - hours * 3600) / 60);
                let secs = Math.floor(duration % 60);
                hours = hours < 1 ? "" : hours + ":";
                mins = mins < 10 ? "0" + mins + ":" : mins + ":";
                secs = secs < 10 ? "0" + secs : secs;
                let finalDuration = hours + mins + secs;

                console.log(finalDuration);

                console.log(metadata);
                const sql = "UPDATE videos SET duration = '" + finalDuration + "' WHERE id = '" + latestVideoId + "'"
                con.query(sql, function (err, result) {
                  console.log(result)
                  // console.dir(result)
                })
              })
            }

            const deleteInputVideo = async () => {
              await fs.unlink(inFilename, (err) => {
                if (err) {
                  throw err
                }

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

            setTimeout(proccessThumbnails, 2000)
            setTimeout(calculateVideoDuration, 3000)
            setTimeout(deleteInputVideo, 4000)
          })
        })
      }
      setTimeout(convertToMp4, 500)
      setTimeout(insertVideoInfo, 1000)
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

function getUserSubscriberCount (username) {
  con.connect(function (err) {
    const sql = 'SELECT * FROM subscribers WHERE userTo=:userTo'
    con.query(sql, function (err, result) {
      // console.dir(result);

      const latestID = result.insertId
      return latestID
    })
  })
}

// show subscribers
app.get('/api/subscribers/users/:id', (req, res) => {
  const sql = "SELECT * FROM subscribers WHERE userTo='" + req.params.id + "'"
  const query = con.query(sql, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({ username: req.params.id, subscribers: results.length }))
  })
})

// Add a new user  
app.post('/api/users/create/', function (req, res) {
  let firstName = sanitizeHtml(req.body.firstName);
  let lastName = sanitizeHtml(req.body.lastName);
  let username = sanitizeHtml(req.body.username);
  let email = sanitizeHtml(req.body.email);
  let passwordInput = sanitizeHtml(req.body.passwordInput);
  let confirmPasswordInput = sanitizeHtml(req.body.confirmPasswordInput);

  //Name of the file : sha512-hash.js
  //Loading the crypto module in node.js
  var crypto = require('crypto');
  //creating hash object 
  var hash = crypto.createHash('sha512');
  var hash2 = crypto.createHash('sha512');
  //passing the data to be hashed
  data = hash.update(passwordInput, 'utf-8');
  dataConfirm = hash2.update(confirmPasswordInput, 'utf-8');
  //Creating the hash in the required format
  password = data.digest('hex');
  confirmPassword = dataConfirm.digest('hex');

  console.log(password);
  console.log(confirmPassword);

  let profilePic = "assets/images/profilePictures/default.png";
  let banner = "assets/images/coverPhotos/default-cover-photo.jpg";

  if(username != "undefined") {
    if(password == confirmPassword) {
      con.connect(function (err) {
        const sql = "SELECT username FROM users WHERE username = '"+username+"'"
        con.query(sql, function(err, result) {
          if(result.length == 0) {
            const sql = "INSERT INTO users (firstName, lastName, username, email, password, profilePic, banner) VALUES (?, ?, ?, ?, ?, ?, ?)"
            con.query(sql, [firstName, lastName, username, email, password, profilePic, banner], function (err, result) {
              console.log(result);
              return res.send({ error: false, message: 'You are registered!'});
            })
          } else {
            return res.status(400).send({ error:true, message: 'The username was already been taken' });
          }
        }) 
      })
    } else {
      return res.status(400).send({ error:true, message: 'You did not enter the same password' });
    }
  } else {
    return res.status(400).send({ error:true, message: 'Please provide user' });
  }
});

// user logs in api
app.post('/api/users/login/', function (req, res){
  let usernameInput = sanitizeHtml(req.body.username);
  let passwordInput = sanitizeHtml(req.body.password);

  //Name of the file : sha512-hash.js
  //Loading the crypto module in node.js
  var crypto = require('crypto');
  //creating hash object 
  var hash = crypto.createHash('sha512');
  //passing the data to be hashed
  data = hash.update(passwordInput, 'utf-8');
  //Creating the hash in the required format
  gen_hash= data.digest('hex');
  //Printing the output on the console
  console.log("hash : " + gen_hash);

  con.connect(function (err) {
    const sql = "SELECT * FROM users WHERE username = ?"
    con.query(sql, [usernameInput], function (err, result) {
      console.log(result[0].password);
      const passwordSelected = result[0].password;
      if(passwordSelected == gen_hash) {        
        // session things
        sessionData = req.session;
        sessionData.user = {};
        let userLoggedIn = usernameInput;
        sessionData.user.userLoggedIn = userLoggedIn;

        return res.status(200).send(JSON.stringify({ error: false, message: 'You are logged in as: ', results: sessionData.user.userLoggedIn }));
      } else {
        return res.status(400).send({ error: true, message: 'Wrong Credentials' });
      }
    })
  })
});

app.get('/api/users/loggedIn', (req, res) => {
  try {
    if(!userLoggedIn) {
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify({ message: "You are not signed in!" }))
    } else {
      return res.status(200).send(JSON.stringify({ error: false, results: "You are logged in as: " + req.session.user.userLoggedIn }));
    }
  } catch (err) {
    res.status(400).send(JSON.stringify({ message: "You are not signed in!" }))
  }
})

app.get('/api/users/logout', (req, res) => {
  try {
    if(userLoggedIn == "undefined") {
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify({ message: "You are not signed in!" }))
    } else {
      req.session.destroy();
      return res.send(JSON.stringify({ error: false, results: "logged out!" }));
    }
  } catch (err) {
    res.status(400).send(JSON.stringify({ message: "You are not signed in!" }))
  }
});

// show all users
app.get('/api/users', (req, res) => {
  const sql = 'SELECT username, signUpDate, keywords, about, country FROM users'
  const query = con.query(sql, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(JSON.stringify({ status: 200, error: null, response: results }))
  })
})

// show single user
app.get('/api/users/:id', (req, res) => {
  const sql = "SELECT username,signUpDate,keywords,about,country FROM users WHERE username = '" + req.params.id + "'"
  const query = con.query(sql, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'application/json')

    if(results.length == 0) {
      res.status(400).send(JSON.stringify({status: 400, response: "Invalid username"}));
    } else {
      res.send(JSON.stringify({ status: 200, error: null, response: results}))
    }
  })
})

// show all videos
app.get('/api/video', (req, res) => {
  const sql = 'SELECT uploadedBy, title, description, category, uploadDate, views, duration, url, tags FROM videos'
  const query = con.query(sql, (err, results) => {
    if (err) throw err
    // videoArray = validator.escape(results);
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({ status: 200, error: null, response: results }))
    // videoArray = validator.escape(results);
  })
})

// show single video
app.get('/api/video/:id', (req, res) => {
  const sql = "SELECT uploadedBy, title, description, category, uploadDate, views, duration, url, tags, filePath FROM videos WHERE url = '" + req.params.id + "' AND privacy = '1'"
  const query = con.query(sql, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({ status: 200, error: null, response: results }))
  })
})

// update video
app.put('/api/update/video/', (req, res) => {
  try {
    let userLoggedIn = req.session.user.userLoggedIn; 
    if(req.session.user.userLoggedIn == "undefined") {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(JSON.stringify({ message: "You are not signed in!" }))
    } else {
      console.log(userLoggedIn + "accessed the update video page");
      let givenVideoUrl = sanitizeHtml(req.query.videoUrl);
      const validateUsername = "SELECT * FROM videos WHERE url = '"+givenVideoUrl+"' AND uploadedBy = '"+userLoggedIn+"'"
      const query2 = con.query(validateUsername, (err, resultsForValidation) => {
        if (err) throw err;  

        let selectedUsername = resultsForValidation[0].username;
        let selectedVideoUrl = resultsForValidation[0].url;

        if(selectedUsername == userLoggedIn || selectedVideoUrl == givenVideoUrl) {

          // declare some variables ig
          let title = sanitizeHtml(req.body.title); 
          let description = sanitizeHtml(req.body.description);
          let privacy = sanitizeHtml(req.body.privacy);
          let category = sanitizeHtml(req.body.category);
          let tags = sanitizeHtml(req.body.tags);

          const sql = "UPDATE videos SET title='" + title + "', description='" + description + "', privacy='" + privacy + "', category='" + category + "', tags='" + tags + "' WHERE url='" + givenVideoUrl + "' AND uploadedBy='" + userLoggedIn + "'";
          const query = con.query(sql, (err, results) => {
            if (err) throw err;  
            res.setHeader('Content-Type', 'application/json')
            res.status(200).send(JSON.stringify({ status: 200, error: err, response: results}))
          })
        }
      })
    }
  } catch (err) {
    res.status(400).send(JSON.stringify({ message: "You are not signed in!" }))
  }
})

// Delete video
app.delete('/api/delete/video/', (req, res) => {
  const sql = "DELETE FROM videos WHERE url='" + req.query.videoUrl + "' AND uploadedBy='"+req.query.username+"'"
  const query = con.query(sql, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({ status: 200, error: null, response: results }))
  })
})

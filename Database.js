const mysql = require('mysql')
const crypto = require('crypto')
class Database {
  constructor (database) {
    this.con = mysql.createConnection(database)

    this.connected = false
    this.con.connect((err) => {
      if (err) throw err
      this.connected = true
    })

    const error = (type) => {
      return {
        error: type
      }
    }

    const PROFILE_PIC = 'assets/images/profilePictures/default.png'
    const BANNER = 'assets/images/coverPhotos/default-cover-photo.jpg'

    this.userExists = (username, callback) => { // Returns a boolean of whether or not a user exists wit the supplied username
      this.con.query(`SELECT username FROM users WHERE username = '${username}'`, (err, result) => {
        if (err) return callback(err)
        if (result.length === 0) callback(null, false)
        else return callback(null, true)
      })
    }

    const hashPassword = (password) => {
      let hash = crypto.createHash('sha512')
      hash = hash.update(password, 'utf-8')
      return hash.digest('hex')
    }

    this.createUser = (firstName, lastName, username, email, password, callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      password = hashPassword(password)

      this.userExists(username, (err, exists) => {
        if (err) return callback(err)
        if (!exists) {
          this.con.query('INSERT INTO users (firstName, lastName, username, email, password, profilePic, banner) VALUES (?, ?, ?, ?, ?, ?, ?)', [firstName, lastName, username, email, password, PROFILE_PIC, BANNER], (err) => {
            if (err) return callback(err)
            return callback(null, 'CREATED')
          })
        } else return callback(error('USER EXISTS'))
      })
    }

    this.login = (username, password, callback) => {
      password = hashPassword(password)
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query(`SELECT * FROM users WHERE username = '${username}'`, (err, results) => {
        if (err) return callback(err)
        if (results.length === 0) return callback(error('USER NOT FOUND'))
        if (password === results[0].password) return callback(null, true)
        else return callback(null, false)
      })
    }

    this.getUser = (username, callback) => { // Gets a user array by username
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query(`SELECT username,signUpDate,keywords,about,country,profilePic,banner,publicEmail,badges,country FROM users where username = '${username}'`, (err, results) => {
        if (err) return callback(err)
        if (results.length === 0) return callback(error('USER NOT FOUND'))
        else return callback(null, results)
      })
    }

    this.getUsers = (callback) => { // Gets a user array by username
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query('SELECT username, signUpDate, keywords, about, country FROM users', (err, results) => {
        if (err) return callback(err)
        if (results.length === 0) return callback(error('NO USERS FOUND'))
        else return callback(null, results)
      })
    }

    this.getSubscribers = (username, callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query(`SELECT * FROM subscribers where userTo = '${username}'`, (err, results) => {
        if (err) return callback(err)
        if (results.length === 0) return callback(error('USER NOT FOUND'))
        else return callback(null, results)
      })
    }

    this.getAllVideos = (callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query("SELECT * FROM videos, thumbnails WHERE videos.id = thumbnails.videoId AND privacy = '1' AND thumbnails.selected = '1'", (err, results) => {
        if (err) return callback(err)
        else return callback(null, results)
      })
    }

    this.getLatestVideos = (callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query("SELECT * FROM videos, thumbnails WHERE videos.id = thumbnails.videoId AND privacy = '1' AND thumbnails.selected = '1' ORDER BY uploadDate DESC LIMIT 21", (err, results) => {
        if (err) return callback(err)
        else return callback(null, results)
      })
    }

    this.getRecommendedVideos = (callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query("SELECT * FROM videos, thumbnails WHERE videos.id = thumbnails.videoId AND privacy = '1' AND thumbnails.selected = '1' ORDER BY RAND() LIMIT 21", (err, results) => {
        if (err) return callback(err)
        else return callback(null, results)
      })
    }

    this.getVideo = (id, callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query(`SELECT uploadedBy, title, description, category, uploadDate, views, duration, url, tags, filePath FROM videos WHERE url = '${id}' AND privacy = '1'`, (err, results) => {
        if (err) return callback(err)
        else return callback(null, results)
      })
    }

    this.getVideoFromSearch = (searchQuery, callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
        this.con.query(`SELECT * FROM videos, thumbnails WHERE videos.id = thumbnails.videoId AND privacy = '1' AND thumbnails.selected = '1' AND (title LIKE '%${searchQuery}%' OR tags LIKE '%${searchQuery}%') AND privacy = '1' ORDER BY uploadDate DESC`, (err, results) => {
          
          if(results == null) {
            return callback(true, "No videos found.")
          }
          
          if (err) return callback(err)
          else return callback(null, results)
        })
    }

    this.getVideoThumbnails = (id, callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query('SELECT * FROM thumbnails WHERE selected=1', (err, results) => {
        if (err) return callback(err)
        else return callback(null, results)
      })
    }

    this.validateVideoOwnership = (username, url, callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query(`SELECT * FROM videos WHERE url='${url}' AND uploadedBy='${username}'`, (err, results) => {
        if (err) return callback(err)
        if (results.length === 0) callback(error('NO VIDEO FOUND'))
        else {
          const videoOwner = results[0].username
          const videoURL = results[0].url
          if (username === videoOwner && url === videoURL) return callback(null, true)
          else return callback(null, false)
        }
      })
    }

    this.insertVideo = (title, description, privacy, category, tags, url, username, file, callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query(`INSERT INTO videos (title, uploadedBy, description, tags, privacy, category, filePath, url) VALUES ('${title}', '${username}', '${description}', '${tags}', '${privacy}', '${category}', '${file}', '${url}')`, (err, results) => {
        if (err) return callback(err)
        else return callback(null, results)
      })
    }

    this.insertThumbnail = (id, latestVideoId, thumbnailId, thumbnailVideoId, callback) => {
      const params = [
        [latestVideoId, 'uploads/videos/thumbnails/' + thumbnailId + '-' + id + '_1.png', '1', thumbnailVideoId],
        [latestVideoId, 'uploads/videos/thumbnails/' + thumbnailId + '-' + id + '_2.png', '0', thumbnailVideoId],
        [latestVideoId, 'uploads/videos/thumbnails/' + thumbnailId + '-' + id + '_3.png', '0', thumbnailVideoId]
      ]
      this.con.query('INSERT INTO thumbnails (videoId, filePath, selected, url) VALUES ?', [params], (err, results) => {
        if (err) return callback(err)
        else return callback(null, results)
      })
    }

    this.setVideoDuration = (id, duration, callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query(`UPDATE videos SET duration='${duration}' WHERE id='${id}'`, (err, results) => {
        if (err) return callback(err)
        else return callback(null, results)
      })
    }

    this.updateVideo = (title, description, privacy, category, tags, url, username, callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query(`UPDATE videos SET title='${title}', description='${description}', privacy='${privacy}', category='${category}', tags='${tags}' WHERE url='${url}' AND uploadedBy='${username}'`, (err, results) => {
        if (err) return callback(err)
        else return callback(null, results)
      })
    }

    this.deleteVideo = (url, username, callback) => {
      if (!this.connected) return callback(error('DATABASE NOT CONNECTED'))
      this.con.query(`DELETE FROM videos WHERE url='${url}' AND uploadedBy='${username}'`, (err, results) => {
        if (err) return callback(err)
        else return callback(null, results)
      })
    }
  }
}
module.exports = Database

const { Router } = require('./Router')

class API extends Router {
  constructor (Database) {
    super()
    this.Database = Database

    // Simple API middleware to set the content-type everytime
    const APIMiddleware = (req, res, next) => {
      res.setHeader('Content-Type', 'application/json')
      next()
    }

    // Return all users
    this.get('/api/users', APIMiddleware, (req, res) => {
      this.Database.getUsers((err, results) => {
        if (err) throw err
        res.setHeader('Content-Type', 'application/json')
        res.status(200).send(JSON.stringify({ status: 200, error: null, response: results }))
      })
    })

    // Create user
    this.post('/users/create', APIMiddleware, (req, res) => {
      const user = {
        firstName: this.sanitizeHTML(req.body.firstName),
        lastName: this.sanitizeHTML(req.body.lastName),
        username: this.sanitizeHTML(req.body.username),
        email: this.sanitizeHTML(req.body.email),
        passwordInput: this.sanitizeHTML(req.body.passwordInput),
        confirmPasswordInput: this.sanitizeHTML(req.body.confirmPasswordInput)
      }

      // Check if username is present
      if (!user.username) return res.status(400).send({ error: true, message: 'Please provide user' })
      // Check is passwords match
      if (user.passwordInput !== user.confirmPasswordInput) return res.status(400).send({ error: true, message: 'You did not enter the same password' })

      // Username is present & passwords match
      this.Database.createUser(user.firstName, user.lastName, user.username, user.email, user.passwordInput, (err, result) => {
        if (err) return res.send({ error: true, message: 'Error creating user: ' + err.error })
        if (result === 'CREATED') return res.send({ error: false, message: 'You are registered!' })
        else return res.send({ error: true, message: 'An unknown error occurred.' })
      })
    })

    // Log a user in
    this.post('/api/users/login/', APIMiddleware, function (req, res) {
      const usernameInput = this.sanitizeHTML(req.body.username)
      const passwordInput = this.sanitizeHTML(req.body.password)
      this.Database.login(usernameInput, passwordInput, (err, loggedIn) => {
        if (!loggedIn) return res.status(400).send({ error: true, message: 'Wrong Credentials' })
        else {
          const sessionData = req.session
          sessionData.user = { userLoggedIn: usernameInput }
          return res.status(200).send(JSON.stringify({
            error: false,
            message: 'You are logged in as: ' + sessionData.user.userLoggedIn,
            username: sessionData.user.userLoggedIn
          }))
        }
      })
    })

    // Check if user is logged in
    this.get('/api/users/loggedIn', APIMiddleware, (req, res) => {
      try {
        const userLoggedIn = req.session.user.userLoggedIn
        if (!userLoggedIn) {
          res.send(JSON.stringify({ message: 'You are not signed in!' }))
        } else {
          return res.status(200).send(JSON.stringify({ error: false, results: 'You are logged in as: ' + req.session.user.userLoggedIn }))
        }
      } catch (err) {
        res.status(400).send(JSON.stringify({ error: true, message: 'You are not signed in!' }))
      }
    })

    // Logout user
    this.post('/users/logout', APIMiddleware, (req, res) => {
      try {
        const userLoggedIn = req.session.user.userLoggedIn
        if (userLoggedIn === 'undefined') {
          res.send(JSON.stringify({ message: 'You are not signed in!' }))
        } else {
          req.session.destroy()
          return res.send(JSON.stringify({ error: false, results: 'logged out!' }))
        }
      } catch (err) {
        res.status(400).send(JSON.stringify({ message: 'You are not signed in!' }))
      }
    })

    // Show single user
    this.get('/api/users/info/:id', APIMiddleware, (req, res) => {
      this.Database.getUser(req.params.id, (err, results) => {
        if (err) return res.send({ error: true, message: 'Error getting user: ' + err.error })
        else return res.send({ status: 200, error: null, response: results })
      })
    })

    // Show user's subscribers
    this.get('/api/users/subscribers/:id', APIMiddleware, (req, res) => {
      this.Database.getSubscriptions(req.params.id, (err, results) => {
        if (err) return res.send({ error: true, message: 'Error getting user\'s subscriptions: ' + err.error })
        else return res.send(JSON.stringify({ status: 200, error: null, response: results }))
      })
    })

    // Show all videos
    this.get('/api/video', APIMiddleware, (req, res) => {
      this.Database.getAllVideos((err, results) => {
        if (err) return res.send({ error: true, message: 'Error getting videos: ' + err.error })
        else return res.send(JSON.stringify({ status: 200, error: null, response: results }))
      })
    })

    // Show all video thumbnails
    this.get('/api/video/thumbnails', APIMiddleware, (req, res) => {
      this.Database.getVideoThumbnails((err, results) => {
        if (err) return res.send({ error: true, message: 'Error getting videos: ' + err.error })
        res.send(JSON.stringify({ status: 200, error: null, response: results }))
      })
    })

    // Show latest videos
    this.get('/api/video/latest', APIMiddleware, (req, res) => {
      this.Database.getLatestVideos((err, results) => {
        if (err) return res.send({ error: true, message: 'Error getting videos: ' + err.error })
        // videoArray = validator.escape(results);
        res.send(JSON.stringify({ status: 200, error: null, response: results }))
        // videoArray = validator.escape(results);
      })
    })

    // Show recommended videos
    this.get('/api/video/recommended', APIMiddleware, (req, res) => {
      this.Database.getRecommendedVideos((err, results) => {
        if (err) return res.send({ error: true, message: 'Error getting videos: ' + err.error })
        // videoArray = validator.escape(results);
        res.send(JSON.stringify({ status: 200, error: null, response: results }))
        // videoArray = validator.escape(results);
      })
    })

    // Show video by ID
    this.get('/api/video/:id', APIMiddleware, (req, res) => {
      this.Database.getVideo(req.params.id, (err, results) => {
        if (err) return res.send({ error: true, message: 'Error getting videos: ' + err.error })
        res.send(JSON.stringify({ status: 200, error: null, response: results }))
      })
    })

    this.put('/api/update/video/', APIMiddleware, (req, res) => {
      try {
        const userLoggedIn = req.session.user.userLoggedIn
        if (req.session.user.userLoggedIn === 'undefined') {
          res.status(200).send(JSON.stringify({ message: 'You are not signed in!' }))
        } else {
          console.log(userLoggedIn + 'accessed the update video page')
          const givenVideoUrl = this.sanitizeHTML(req.query.videoUrl)
          this.validateVideoOwnership(userLoggedIn, givenVideoUrl, (err, owner) => {
            if (err) return res.send({ error: true, message: 'Error getting video: ' + err.error })


            if (owner) {
              // declare some variables ig
              const title = this.sanitizeHTML(req.body.title)
              const description = this.sanitizeHTML(req.body.description)
              const privacy = this.sanitizeHTML(req.body.privacy)
              const category = this.sanitizeHTML(req.body.category)
              const tags = this.sanitizeHTML(req.body.tags)

              this.Database.updateVideo(title, description, privacy, category ,tags, givenVideoUrl, userLoggedIn, (err, results) => {
                if (err) return res.send({ error: true, message: 'Error updating video: ' + err.error })
                res.status(200).send(JSON.stringify({ status: 200, error: err, response: results }))
              })
            } else if (err) return res.send({ error: true, message: 'You do not have permission to update that video' })
          })
        }
      } catch (err) {
        res.status(400).send(JSON.stringify({ message: 'You are not signed in!' }))
      }
    })

    this.delete('/api/delete/video', APIMiddleware, (req, res) => {
      try {
        const userLoggedIn = req.session.user.userLoggedIn
        if (userLoggedIn === 'undefined') {
          res.setHeader('Content-Type', 'application/json')
          res.status(200).send(JSON.stringify({ message: 'You are not signed in!' }))
        } else {
          const givenVideoUrl = this.sanitizeHTML(req.query.videoUrl)
          const userLoggedIn = req.session.user.userLoggedIn
          console.log(userLoggedIn + 'accessed the update video page')
          this.Database.deleteVideo(givenVideoUrl, userLoggedIn, (err, results) => {
            if (err) throw err
            res.setHeader('Content-Type', 'application/json')
            res.send(JSON.stringify({ status: 200, error: null, response: results }))
          })
        }
      } catch (err) {
        res.status(400).send(JSON.stringify({ message: 'You are not signed in!' }))
      }
    })
  }
}
module.exports = API

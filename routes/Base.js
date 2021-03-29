const Router = require('./Router')
const path = require('path')

class Base extends Router {
  constructor () {
    super()
    // Setup our static files
    this.use(this.express.static(this.STATIC_DIR))
    this.use('/boostrap', this.express.static(path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist')))
    this.use('/jquery', this.express.static(path.join(__dirname, '..', 'node_modules', 'jquery', 'dist')))

    this.get('/', (req, res) => {
      try {
        res.render('home', {data : {userSignedIn: req.session.user.userLoggedIn}})
        console.log(req.session.user.userLoggedIn)
      } catch (err) {
        res.render('home', {data : {userSignedIn: ""}})
      }
    })

    this.get('/watch', (req, res) => {
      try {
        res.render('watch', {data : {userSignedIn: req.session.user.userLoggedIn}})
        console.log(req.session.user.userLoggedIn)
      } catch (err) {
        res.render('watch', {data : {userSignedIn: ""}})
      }
    })

    this.get('/login', (req, res) => {
      try {
        res.render('login')
      } catch (err) {
        
      }
    })

    this.get('/search', (req, res) => {
      try {
        res.render('search', {data : {userSignedIn: req.session.user.userLoggedIn}})
        console.log(req.session.user.userLoggedIn)
      } catch (err) {
        res.render('search', {data : {userSignedIn: ""}})
      }
    })

    this.get('/mobile', (req, res) => {
      res.render('mobile')
    })

    // Catch 404 errors here
    this.get('*', (req, res) => {
      res.status(400).send('404: Could not find that page')
    })
  }
}

module.exports = Base

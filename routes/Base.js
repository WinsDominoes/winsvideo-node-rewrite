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
      res.render('home')
    })

    this.get('/watch', (req, res) => {
      res.render('watch')
    })

    // Catch 404 errors here
    this.get('*', (req, res) => {
      res.status(400).send('404: Could not find that page')
    })
  }
}

module.exports = Base

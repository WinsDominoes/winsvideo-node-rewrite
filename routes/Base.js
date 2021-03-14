const Router = require('./Router')

class Base extends Router {
  constructor () {
    super()
    // Setup our static directory
    this.use(this.express.static(this.STATIC_DIR))

    this.get('/', (req, res) => {
      res.render('index')
    })

    // Catch 404 errors here
    this.get('*', (req, res) => {
      res.status(400).send('404: Could not find that page')
    })
  }
}

module.exports = Base

const { Router } = require('Router.js')
const path = require('path');

class Base extends Router {
  constructor () {
    super()
    this.use(this.express.static(path.join(__dirname, 'public')))
  }
}

module.exports = Base

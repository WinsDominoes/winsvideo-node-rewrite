class Middleware {
  constructor () {
    // Check if user is authenticated
    this.authenticated = (res, req, next) => {
      next()
    }
  }
}
module.exports = Middleware

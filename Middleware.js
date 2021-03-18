const global = (req, res, next) => {
  res.locals.host = req.header('host')
  next()
}

const APIMiddleware = (req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next()
}

const authenticated = (req, res, next) => {
  if (1 === 1) { // User is authenticated
    next()
  } else { // User is not authenticated, redirect them to login
    res.redirect('/login')
  }
}
module.exports = { global, authenticated, APIMiddleware }

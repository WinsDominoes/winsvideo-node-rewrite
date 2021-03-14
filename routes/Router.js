/*

Base router class for building on top of Express' Router

*/

const express = require('express')
const path = require('path')
const sanitizeHtml = require('sanitize-html')
const middleware = require('../middleware')
const VIEWS_DIR = path.join(__dirname, '..', 'public') // Define our views directory
const STATIC_DIR = path.join(__dirname, '..', 'public') // Define our static directory

class Router extends express.Router {
  constructor () {
    super()
    this.express = express
    this.middleware = middleware
    this.VIEWS_DIR = VIEWS_DIR
    this.STATIC_DIR = STATIC_DIR
    this.sanitizeHTML = sanitizeHtml()

    // Apply our global middleware to ALL pages
    this.use(middleware.global)
  }
}
module.exports = Router

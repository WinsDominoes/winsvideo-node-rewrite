/*

Base router class for building on top of Express' Router

*/

const express = require('express')
const path = require('path')
const sanitizeHtml = require('sanitize-html')
const PUBLIC_DIR = path.join(__dirname, '..', 'public') // Define our public directory where we store all HTML files

// Include our other sub-routers here so we can pass them all back to the index file through one variable
const Base = require('./Base')
const API = require('./API')
const Upload = require('./API')

class Router extends express.Router {
  constructor () {
    super()
    this.express = express
    this.PUBLIC_DIR = PUBLIC_DIR
    this.sanitizeHTML = sanitizeHtml()
  }
}

module.exports = { Router, Base, API, Upload }

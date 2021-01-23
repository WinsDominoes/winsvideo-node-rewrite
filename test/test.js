const validator = require('validator');

checkEmail = validator.isEmail('<script>alert(1)</script>@<script>alert(1)</script>.com');

if(checkEmail == true) {
    console.log("dat's ebic");
} else {
    console.log("WRONG");
}

const config = require('../config.json')
const mysql = require('mysql')
const { lastIndexOf, get } = require('lodash')
const con = mysql.createConnection({
  host: config.dbInfo.host,
  user: config.dbInfo.user,
  password: config.dbInfo.password,
  database: config.dbInfo.database
})

													
//Name of the file : sha512-hash.js
//Loading the crypto module in node.js
var crypto = require('crypto');
//creating hash object 
var hash = crypto.createHash('sha512');
//passing the data to be hashed
data = hash.update('Winny2', 'utf-8');
//Creating the hash in the required format
gen_hash= data.digest('hex');
//Printing the output on the console
console.log("hash : " + gen_hash);

con.connect(function (err) {
    const sql = "SELECT * FROM users WHERE username = 'wins_dominoes'"
    con.query(sql, function (err, result) {
      console.log(result[0].password);
      const passwordSelected = result[0].password;

      if(passwordSelected == gen_hash) {
        console.log("This password thing actually works");
      } else {
        console.log("Wrong password!");
      }
    })
  })
/*jshint esversion: 6 */

var express = require('express');
var router = express.Router();
var app = express();
var PORT = process.env.PORT || 9000;
var bodyParser = require('body-parser');




app.get('/', (req, res)=>{
  res.send('Hello World');
});

















app.listen(PORT, ()=>{
  console.log(`server running on ${PORT} `);
});
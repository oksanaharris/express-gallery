/*jshint esversion: 6 */

var express = require('express');
var app = express();
var PORT = process.env.PORT || 9000


app.get('/', (req, res)=>{
  res.send('Hello World');
});

















app.listen(PORT, ()=>{
  console.log('server running on port 9000');
});
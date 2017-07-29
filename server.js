/*jshint esversion: 6 */

var express = require('express');
var router = express.Router();
var app = express();
var PORT = process.env.PORT || 9000;
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

let db = require('./models');

let Images = db.Images;
let Authors = db.Authors;

app.get('/images', function(req, res) {
  Images.findAll()
  .then(function (images){
    res.json(images);
  });
});


app.get('/', (req, res)=>{
  res.send('Hello World');
});


app.listen(PORT, ()=>{
  db.sequelize.drop();
  db.sequelize.sync();
  console.log(`server running on ${PORT} `);
});
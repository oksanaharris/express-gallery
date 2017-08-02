/*jshint esversion: 6 */

const express = require('express');
const router = express.Router();
const app = express();
const PORT = process.env.PORT || 9000;
const bodyParser = require('body-parser');
const imageRouter = require('./routes/image_routes');
const expressHb = require('express-handlebars');
const hbs = expressHb.create({
  defaultLayout: 'main',
  extname:'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({extended: true}));
app.use('/gallery', imageRouter);

app.use(express.static('public'));

const db = require('./models');

const Images = db.Images;
const Authors = db.Authors;



app.listen(PORT, ()=>{
  //db.sequelize.drop();
  db.sequelize.sync();
  console.log(`server running on ${PORT}`);
});
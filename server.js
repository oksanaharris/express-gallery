      /*jshint esversion: 6 */

      const express = require('express');
      const router = express.Router();
      const app = express();
      const PORT = process.env.PORT || 9000;
      const bodyParser = require('body-parser');
      const imageRouter = require('./routes/image_routes');
      const methodOverride = require('method-override');

      const passport = require('passport');
      const LocalStrategy = require('passport-local').Strategy;
      const session = require('express-session');

      const RedisStore = require('connect-redis')(session);
      const saltRounds = 10;
      const bcrypt = require('bcrypt');

      const expressHb = require('express-handlebars');
      const hbs = expressHb.create({
        defaultLayout: 'main',
        extname:'hbs'
      });

      const db = require('./models');

      const Images = db.Images;
      const Authors = db.Authors;
      const Users = db.Users;

      app.engine('hbs', hbs.engine);
      app.set('view engine', 'hbs');


      app.use(express.static('public'));


      app.use(bodyParser.urlencoded({extended: true}));


      app.use(methodOverride('_method'));


      app.use(session({
        store: new RedisStore(),
        secret: 'keyboard cat',
        resave: false,
        saveUninitiazlied: false
      }));


      app.use(passport.initialize());
      app.use(passport.session());

      passport.use(new LocalStrategy((username, password, done) => {
        return Users.findAll({where: {username: username}})
        .then(results => {
          if(results.length === 0){
            return done(null, false, {message: 'No user with that username'});
          }

          if(password !== results[0].password){
            return done(null, false, {message: 'Incorrect password'});
          }
          return done(null, results[0]);
        });
      }));


      passport.serializeUser((user, done) => {
        return done (null, {
          id: user.id,
          username: user.username
        });
      });


      passport.deserializeUser((user, done) => {
        Users.findById(user.id)
        .then(user => {
          return done(null, user);
        })
        .catch((error) => {
          console.log ('here is our error', error);
        });
      });


      app.get('/login', (req, res) => {
        res.render('login');
      });


      app.get('/register', (req, res) => {
        res.render('register');
      });


      app.post('/register', (req, res) => {
        console.log('post to register is firing');
        let {username, password} = req.body;

        bcrypt.genSalt(saltRounds, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash){
            Users.create({
              username: username,
              password: hash
            });
          });
        })
        .then(() => {
          res.redirect('/gallery');
        })
        .catch((error) => {
          console.log ('here is our error', error);
        });
      });


      app.post('/login', passport.authenticate('local', {successRedirect: '/gallery', failureRedirect: '/login'
      }));


      app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/login');
      });


      app.use('/gallery', imageRouter);


      app.listen(PORT, ()=>{
        // db.sequelize.drop();
        db.sequelize.sync();
        console.log(`server running on ${PORT}`);
      });
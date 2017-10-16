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
        saveUninitialized: false
      }));


      app.use(passport.initialize());
      app.use(passport.session());

      passport.use(new LocalStrategy((username, password, done) => {
        return Users.findOne({where: {username: username}})
        .then(result => {
          console.log('firing passport use and result is ', result);

          if(result === null){
            console.log('no user found');
            return done(null, false, {message: 'No user with that username'});
          }

          // if(password !== result.password){
          //   console.log('incorrect password');
          //   return done(null, false, {message: 'Incorrect password'});
          // }

          bcrypt.compare(password, result.password, function(err, res) {
            if(!res){ return done(null, false, { message: 'Incorrect password.' }); }
            return done(null, result);
          });

          // return done(null, result);
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

      app.get('/', (req, res) => {
        res.redirect('/gallery');
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

        console.log('req body', req.body.username, req.body.password);

        bcrypt.genSalt(saltRounds, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash){
            Users.create({
              username: username,
              password: hash
            })
            .then(() => {
              res.redirect('/gallery');
            })
            .catch((error) => {
              console.log ('here is our error', error);
            });
          });
        })
      });


      app.post('/login', function(req, res, next) {
        console.log('post to login is firing');
        console.log('req body', req.body);

        passport.authenticate('local', function(err, user, info) {
          console.log('going into authenticate');
          console.log('result from authenticate', user);
          console.log('info from authenticate', info);
          console.log('err', err);
          //if authentication fails, user is false
          //and info is {message: 'Incorrect password'}
          //and err is null

          if (err) { return res.status(500).json({err});}

          // if (!user) {return res.status(401).json({success: false});}

          // if (!user) {return res.status(401).redirect('/login');}
          if (!user) {return res.render('login', {message: info.message});}

          req.logIn(user, function(err) {
            if (err) {return res.status(500).json({err});}
            console.log('successful login! from app.post to login');
            let {id, username} = user;
            let loggedInUser = {id, username};
            // return res.json(loggedInUser);
            return res.redirect('/gallery');
          })
        })(req, res, next);
      });


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
/*jshint esversion: 6 */

const express = require('express');
const router = express.Router();
const db = require('../models');
const Images = db.Images;
const Authors = db.Authors;

const photoMetas = require('../collections/').photoMetas;

let loggedInUser = require('../server.js');

// Images.belongsTo(Authors, {as : 'authors_id'});
// Authors.hasMany(Images);


router.get('/', (req, res)=> {
  let user = req.user;
  if (!req.user){
    user = loggedInUser;
  }

  console.log('user from get on galleries', req.user);

  Images.findAll({
    include: [ Authors ],
    order: ['id']
  })
  .then((images)=>{

    if(req.headers.hasOwnProperty('accept') && req.headers.accept.match(/json/)) {
      res.json(images);
    } else {

      if(!images || images.length === 0) { return res.json('message: no images in the database');}

      let firstImage = {id: images[0].id, url: images[0].url, author: images[0].Author.name};
      let otherImages = []

      images.forEach(image => {
        return otherImages.push({id: image.id, url: image.url, description: image.description, author: image.Author.name});
      });

      otherImages.shift();

      let allViewObj = {
        firstImage: firstImage,
        otherImages: otherImages
      }

      if(user && user !== '' && user !== undefined){allViewObj.authenticated = true;};

      return res.render('all', allViewObj);
    }
  })
  .catch((error) => {
    console.log ('here is our error', error);
    return res.status(400).send(error.message);
  });
});


router.get('/new', (req, res) => {
  let user = req.user;

  if (!req.user){
    user = loggedInUser;
  }

  let header = {authenticated: false}
  if (!user) { res.send('Please log in to upload images.'); }
  else if (user){header.authenticated = true;};
  res.render('newForm', header);
});


router.post('/', (req, res)=>{
  let image = req.body;
  let author = image.author;
  let user = req.user;

  if (!req.user){
    user = loggedInUser;
  }

  return Images.findAll({where: {url: image.url}})
  .then(images => {
    if(images.length !== 0){
      throw new Error('An image with this url already exists');
    } else {
      return Authors.findAll({where: {name: author}});
    }
  })
  .then(authors => {
    if(authors.length === 0){
      return Authors.create({name: author});
    } else {
      return authors[0];
    }
  })
  .then(author => {
    return author.id;
  })
  .then(authorId => {
    return Images.create({url: image.url, description: image.description, authors_id: authorId, user_id: user.id});
  })
  .then(image => {
    // return res.json(image);
    // save the meta to mongo here
    console.log('HERE IS OUR META', req.body.meta);
    if (req.body.meta) {
      req.body.meta.photoId = image.id;
      photoMetas().insert(req.body.meta);
    }
    res.redirect('/gallery');
  })
  .catch((error) => {
    console.log ('here is our error', error);
    return res.status(400).send(error.message);
  });
});


router.put('/:id', (req, res) => {
  let data = req.body;
  let targetId = req.params.id;
  let user = req.user;
  let authorId;

  if (!req.user){
    user = loggedInUser;
  }

  console.log('REQ BODY from PUT REQUEST', req.body);

  return Authors.findAll({where: {name: data.author}})
  .then (authors => {
    if (authors.length === 0){
      return Authors.create({name: data.author});
    } else {
      return authors[0];
    }
  })
  .then(author => {
    return authorId = author.id;
  })
  .then (() => {
    return Images.findById(targetId, {include: [Authors]});
  })
  .then(image => {
    if (!image){throw new Error('Error - trying to edit an image that does not exist.');};
    if (image.user_id !== user.id) {throw new Error ('Trying to edit someone else\'s image is not nice.');};
    return image.update({url: data.url, description: data.description, authors_id: authorId});
  })
  .then ((image) => {
    return photoMetas().findOne({photoId : image.id.toString()});
  })
  .then ((mongoRecord) => {

    req.body.meta.photoId = targetId;
    console.log('WHAT WE ARE TRYING TO SEND', req.body.meta);
    if (mongoRecord){
      return photoMetas().update(mongoRecord, req.body.meta);
    } else {
      return photoMetas().insert(req.body.meta);
    }
  })
  .then (() => {
    return res.redirect('/gallery/'+targetId);
    // return res.json(result);
  })
  .catch((error) => {
    console.log ('here is our error', error);
    return res.status(400).send(error.message);
  });
});


router.get('/:id/edit', (req, res) => {
  let targetId = parseInt(req.params.id);
  let user = req.user;

  if (!req.user){
    user = loggedInUser;
  }

  let targetImage = {};

  return Images.findById(targetId, {include: [ Authors ]})
  .then(image => {
    if (!image) { throw new Error('Error - trying to edit an image that does not exist.'); }
    if (!user) { throw new Error('Please sign in to make edits to your images.'); }
    else if (image.user_id !== user.id) {throw new Error ('Trying to edit someone else\'s image is not nice.'); }
    image.authenticated = true;
    targetImage = {id: image.id, url: image.url, description: image.description, user_id: image.user_id, author: image.Author.name};

    return photoMetas().findOne({photoId: image.id.toString()});
  })
  .then(mongoRecord => {
    if(mongoRecord){
      delete mongoRecord._id;
      delete mongoRecord.photoId;
    }
    targetImage.meta = JSON.stringify(mongoRecord);
    return res.render('editForm', targetImage);
  })
  .catch((error) => {
    console.log ('here is our error', error);
    return res.status(400).send(error.message);
  });
});


router.get('/:id', (req, res) => {
  let targetId = parseInt(req.params.id);
  let user = req.user;

  if (!req.user){
    user = loggedInUser;
  }

  let singleViewObj = {
    targetImage: {},
    otherImages: []
  };

  return Images.findById(targetId, {include: [ Authors ]})
  .then(image => {
    if(!image){ throw new Error ('Error - image with that id does not exist');}
    let ownedByUser = (user && (image.user_id === user.id));
    let targetImage = {id: image.id, url: image.url, description: image.description, user_id: image.user_id, author: image.Author.name, ownedByUser: ownedByUser};
    singleViewObj.targetImage = targetImage;
    console.log('the image id we are looking for', image.id);
    return photoMetas().findOne({photoId : image.id.toString()});
  })
  .then((mongoRecord) => {
    console.log('HERE IS OUR MONGO RECORD FROM GET TO ID', mongoRecord);
    if(mongoRecord){
      delete mongoRecord._id;
      delete mongoRecord.photoId;
    }
    singleViewObj.targetImage.meta = mongoRecord;

    return Images.findAll({ where: {id : {$ne: targetId}}, include: [ Authors ]})
  })
  .then(images => {
    let otherImages = images.map((image, index, array) => {
      return {id: image.id, url: image.url, description: image.description, user_id: image.user_id, author: image.Author.name};
    });

    singleViewObj.otherImages = otherImages;

    if (user) {singleViewObj.authenticated = true;};

    res.render('single', singleViewObj);
  })
  .catch(error => {
    console.log ('here is our error', error);
    return res.status(400).send(error.message);
  });
});


router.delete('/:id', (req, res) => {
  let targetId = req.params.id;

  let user = req.user;

  if (!req.user){
    user = loggedInUser;
  }
    console.log('this is our logged in user', user);

  return Images.findById(targetId)
  .then(image => {
    if (!image) {throw new Error('Error - trying to delete an image that does not exist.');};
    if (user === undefined || image.user_id !== user.id) {throw new Error ('Trying to delete someone else\'s image is not nice.');};
    return Images.destroy({where: {id: targetId}});
  })
  .then(() => {
    return photoMetas().findOne({photoId: targetId.toString()});
  })
  .then(mongoRecord => {
    if(mongoRecord){
      return photoMetas().remove({_id: mongoRecord._id});
    }
  })
  .then((result) => {
    return res.redirect('/gallery');
  }).catch(error => {
    console.log ('here is our error', error);
    return res.status(400).send(error.message);
  });
});


module.exports = router;
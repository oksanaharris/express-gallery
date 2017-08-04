/*jshint esversion: 6 */

const express = require('express');
const router = express.Router();
const db = require('../models');
const Images = db.Images;
const Authors = db.Authors;

// Images.belongsTo(Authors, {as : 'authors_id'});
// Authors.hasMany(Images);


router.get('/', (req, res)=> {
  console.log('THIS IS OUR USER ID FROM GET TO GALLERY', req.user.id, req.user.username);
  Images.findAll({
    include: [ Authors ]
  })
  .then((images)=>{
    // images.forEach(image => console.log('IMAGE', image.Author.dataValues.name));
    // console.log('HERE ARE OUR IMAGES',
    if(req.headers.hasOwnProperty('accept') && req.headers.accept.match(/json/)) {
      res.json(images);
    } else {

      let firstImage = {id: images[0].id, url: images[0].url, author: images[0].Author.name};
      let otherImages = []

      images.forEach(image => {
        return otherImages.push({id: image.id, url: image.url, author: image.Author.name});
      });

      otherImages.shift();

      let allViewObj = {
        firstImage: firstImage,
        otherImages: otherImages
      }

      return res.render('all', allViewObj);
    }
  })
  .catch((error) => {
    console.log ('here is our error', error);
    return res.status(400).send(error.message);
  });
});


router.get('/new', (req, res) => {
  res.render('newForm');
});


router.post('/', (req, res)=>{
  let image = req.body;
  let author = image.author;
  let user = req.user;

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
  .then(result => {
    // return res.json(result);
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
  .then (result => {
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

  let allViewObj = {
    targetImage: {},
    otherImages: []
  };

  return Images.findById(targetId, {include: [ Authors ]})
  .then(image => {
    if (!image) {throw new Error('Error - trying to edit an image that does not exist.');};
    if (image.user_id !== user.id) {throw new Error ('Trying to edit someone else\'s image is not nice.');};
    return res.render('editForm', image);
  })
  .catch((error) => {
    console.log ('here is our error', error);
    return res.status(400).send(error.message);
  });
});


router.get('/:id', (req, res) => {
  let targetId = parseInt(req.params.id);
  let user = req.user;

  let singleViewObj = {
    targetImage: {},
    otherImages: [],
  };

  return Images.findById(targetId, {include: [ Authors ]})
  .then(image => {
    if(!image){
      throw new Error ('Error - image with that id does not exist');
    } else {
      let ownedByUser = (image.user_id === user.id);
      let targetImage = {id: image.id, url: image.url, description: image.description, user_id: image.user_id, author: image.Author.name, ownedByUser: ownedByUser};
      return singleViewObj.targetImage = targetImage;
    }
  })
  .then(() => {
    return Images.findAll({ include: [ Authors ]})
  })
  .then(images => {
    let otherImages = images.filter((image) => {
      return image.id !== targetId;
    }).map((image, index, array) => {
      return {id: image.id, url: image.url, description: image.description, user_id: image.user_id, author: image.Author.name};
    })

    singleViewObj.otherImages = otherImages;

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
    console.log('this is our logged in user', user);

  return Images.findById(targetId)
  .then(image => {
    if (!image) {throw new Error('Error - trying to delete an image that does not exist.');};
    if (user === undefined || image.user_id !== user.id) {throw new Error ('Trying to delete someone else\'s image is not nice.');};
    return Images.destroy({where: {id: targetId}});
  })
  .then(deletedImage => {
    return res.redirect('/gallery');
  }).catch(error => {
    console.log ('here is our error', error);
    return res.status(400).send(error.message);
  });
});


module.exports = router;
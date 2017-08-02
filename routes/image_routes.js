/*jshint esversion: 6 */

const express = require('express');
const router = express.Router();
const db = require('../models');
const Images = db.Images;
const Authors = db.Authors;

// Images.belongsTo(Authors, {as : 'authors_id'});
// Authors.hasMany(Images);


router.get('/', (req, res)=> {
  Images.findAll({
    include: [ Authors ]
  })
  .then((images)=>{
    // images.forEach(image => console.log('IMAGE', image.Author.dataValues.name));
    // console.log('HERE ARE OUR IMAGES',
    if(req.headers.hasOwnProperty('accept') && req.headers.accept.match(/json/)) {
      res.json(images);
    } else {
      let firstImage = images[0];
      let otherImages = images;
      otherImages.shift();

      let allViewObj = {
        firstImage: firstImage,
        otherImages: otherImages
      }

      res.render('all', allViewObj);
    }
  });
});

router.post('/', (req, res)=>{
  var data = req.body;
  var author = data.author;

  return Images.findAll({where: {url: data.url}})
  .then(result => {
    if(result.length !== 0){
      throw new Error('An image with this url already exists');
    } else {
      return Authors.findAll({where: {name: author}});
    }
  })
  .then(result => {
    console.log("result:", result);
    if(result.length === 0){
      //return makes it accessible in then statement below.
      return Authors.create({name: author});
    } else {
      return result[0];
    }
  })
  .then(result => {
    return result.dataValues.id;
  })
  .then(id => {
    return Images.create({url: data.url, description: data.description, authors_id: id});
  })
  .then(result => {
    return res.json(result);
  })
  .catch((error) => {
    console.log ('here is our error', error);
    return res.status(400).send(error.message);
  });
});


router.put('/:id', (req, res) => {
  let data = req.body;
  let id = req.params.id;

  return Images.findById(id)
  .then(result => {
    // console.log('this is the length', results.length);
    // console.log('this is what the query returns', results);

    if (result === null){
      throw new Error('Error - trying to edit a record that does not exist.');
    } else {
      return result.update({url: data.url, description: data.description});
    }
  })
  .then (result => {
    return res.json(result);
  })
  .catch((error) => {
    console.log ('here is our error', error);
    return res.status(400).send(error.message);
  });
});

router.get('/:id', (req, res) => {
  let targetId = parseInt(req.params.id);
  let allViewObj = {
    targetImage: {},
    otherImages: []
  };

  return Images.findById(targetId, {include: [ Authors ]})
  .then(result => {
    if(result === null){
      throw new Error ('Error - image with that id does not exist');
    } else {
      return allViewObj.targetImage = result;
    }
  })
  .then((result) => {
    return Images.findAll({ include: [ Authors ]})
  })
  .then(images => {
    allViewObj.otherImages = images.filter((image) => {
      return image.dataValues.id !== targetId;
    });
    res.render('single', allViewObj);
  })
  .catch(error => {
    console.log ('here is our error', error);
    return res.status(400).send(error.message);
  });
});

router.delete('/:id', (req, res) => {
  let id = req.params.id;
  return Images.destroy({where: {id: id}})
  .then(result => {
    console.log('results from delete:',result);
    res.end();
  });
});









module.exports = router;
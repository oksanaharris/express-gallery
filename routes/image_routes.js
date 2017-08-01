/*jshint esversion: 6 */

const express = require('express');
const router = express.Router();
const db = require('../models');
const Images = db.Images;
const Authors = db.Authors;


router.get('/', (req, res)=> {
  Images.findAll()
  .then((images)=>{
    res.json(images);
  });
});

router.post('/', (req, res)=>{
  var data = req.body;
  var author = data.author;

  return Images.findAll({where: {url: data.url}})
  .then(result =>{
    if(result.length !== 0){
      res.send('fuck off!');
    } else {
      return Authors.findAll({where: {name: author}});
    }
  })
  .then(result =>{
    console.log("result:", result);
    if(result.length === 0){
      //return makes it accessible in then statement below.
      return Authors.create({name: author});
    } else {
      return result[0];
    }
  })
  .then(result =>{
    return result.dataValues.id;
    
  })
  .then(id =>{

    return Images.create({url: data.url, description: data.description, authors_id: id});
    
  })
  .then(result =>{
    res.json(result);
  });
});



module.exports = router;
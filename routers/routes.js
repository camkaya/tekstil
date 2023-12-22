
const express = require('express');
const router = express.Router();

router.get("/",function(req,res){
    res.render("index.ejs"); 
})
router.get("/graphic",function(req,res){
    res.render("graphic.ejs"); 
})
router.get("/homepage",function(req,res){
    res.render("homepage.ejs"); 
})
router.get("/deneme",function(req,res){
    res.render("deneme.ejs"); 
})

module.exports = router;

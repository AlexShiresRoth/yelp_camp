   
   var express = require('express');
   var router = express.Router();
   var Campground = require('../models/campground');
   var Comment    = require('../models/comment');
   
    router.get("/", function(req, res){
        
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            }
            else{
                res.render("campgrounds/index", {campgrounds: allCampgrounds});
            }
        });
           //res.render("campgrounds", {campgrounds: campgrounds});
    });
    
    router.post("/", function(req, res){
       
        var name = req.body.name;
        var image = req.body.image;
        var description = req.body.description;
        var newCampground = {name: name, image: image, description: description};
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/campgrounds");
            }
        });
        
    });
    
    router.get("/new", function(req, res){// the new must be before the id route or it will act as the id route
       res.render("campgrounds/new"); 
    });
    
    router.get("/:id", function(req, res){
        //find campground with provided ID
        Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
            if(err){
                console.log(err);
            }
            else{
                console.log(foundCampground);
                res.render("campgrounds/show", {campground: foundCampground});
            }
        });
    });
    
      //middleware
    function isLoggedIn(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect('/login');
    }
    
    
    module.exports = router;
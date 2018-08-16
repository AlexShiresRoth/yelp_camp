   
   var express = require('express');
   var router = express.Router();
   var Campground = require('../models/campground');
   var Comment    = require('../models/comment');
   var middleware = require('../middleware');
   
    router.get("/", function(req, res){
        //eval(require('locus'));
        var noMatch = null;
        if(req.query.search){
            const regex = new RegExp(escapeRegex(req.query.search), 'gi'); 
            Campground.find({name: regex}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            }
            else{
                
                if(allCampgrounds.length < 1){
                    noMatch = "No campgrounds match your search :(, please try again.";
                }
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch});
            }
        });
        }
        else{
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            }
            else{
                
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch});
            }
        });
          } //res.render("campgrounds", {campgrounds: campgrounds});
    });
    
    //create route
    router.post("/", middleware.isLoggedIn, function(req, res){
       
        var name = req.body.name;
        var price = req.body.price;
        var image = req.body.image;
        var description = req.body.description;
        var author = {
            id: req.user._id,
            username: req.user.username
        };
        var newCampground = {name: name, price: price ,image: image, description: description, author: author};
        console.log(req.user);
        
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
                req.flash('error','Whoops something went wrong creating your campground! :(')
            }
            else{
                console.log(newlyCreated);
                req.flash('success', "Nice, your new campground has been added!");
                res.redirect("/campgrounds");
            }
        });
        
    });
    
    router.get("/new", middleware.isLoggedIn, function(req, res){// the new must be before the id route or it will act as the id route
       res.render("campgrounds/new"); 
    });
    
    router.get("/:id", function(req, res){
        //find campground with provided ID
        Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
            if(err || !foundCampground){
                req.flash('error', 'Campground not found!');
                res.redirect('back');
            }
            else{
                console.log(foundCampground);
                res.render("campgrounds/show", {campground: foundCampground});
            }
        });
    });
    
    
    //edit route
    router.get('/:id/edit',middleware.checkCampgroundOwnerShip, function(req, res){
             Campground.findById(req.params.id, function(err, foundCampground){
                     res.render('campgrounds/edit', {campground: foundCampground});   
             });
    });
    //update route
    router.put('/:id', middleware.checkCampgroundOwnerShip, function(req, res){
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
            if(err){
                res.redirect('/campgrounds');
            }
            else{
                res.redirect('/campgrounds/' + req.params.id);
            }
        })
    });
    
    //destroy route
    router.delete('/:id', middleware.checkCampgroundOwnerShip, function(req, res){
        Campground.findByIdAndRemove(req.params.id, function(err){
           if(err){
                res.redirect('/campgrounds');   
           }
           else{
                res.redirect('/campgrounds');
           }
        });
    });
    
   function escapeRegex(text){
       return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
   }
    module.exports = router;
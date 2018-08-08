var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Campground = require('./models/campground'),
    seedDB = require('./seeds')
    
    mongoose.connect("mongodb://localhost/yelp_camp_v3");
    
    app.use(bodyParser.urlencoded({extended: true}));
    
    app.set("view engine", "ejs");
    
    seedDB();
    
    app.get('/', function(req, res){
        res.render("landing");
    });




app.get("/campgrounds", function(req, res){
    
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }
        else{
            res.render("index", {campgrounds: allCampgrounds});
        }
    });
       //res.render("campgrounds", {campgrounds: campgrounds});
});

app.post("/campgrounds", function(req, res){
   
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name: name, image: image, description: description}
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/campgrounds");
        }
    });
    
});

app.get("/campgrounds/new", function(req, res){// the new must be before the id route or it will act as the id route
   res.render("new"); 
});

app.get("/campgrounds/:id", function(req, res){
    //find campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }
        else{
            console.log(foundCampground);
            res.render("show", {campground: foundCampground});
        }
    });
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server has started");
})
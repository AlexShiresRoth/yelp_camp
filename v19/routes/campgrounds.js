
   var express = require('express');
   var router = express.Router();
   var Campground = require('../models/campground');
   var Comment    = require('../models/comment');
   var middleware = require('../middleware');
   var NodeGeocoder = require('node-geocoder');
   var multer = require('multer');
    var storage = multer.diskStorage({
      filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
      }
    });
    var imageFilter = function (req, file, cb) {
        // accept image files only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    };
    var upload = multer({ storage: storage, fileFilter: imageFilter});
    
    var cloudinary = require('cloudinary');
    cloudinary.config({ 
      cloud_name: 'alexshiresroth', 
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
 
   
   var options = {
       provider: 'google',
       httpAdapter: 'https',
       apiKey: process.env.GEOCODER_API_KEY,
       apiSecret:process.env.GEOCODER_SECRET,
       formatter: null
   };
   
   var geocoder = NodeGeocoder(options);
   
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
   //CREATE - add new campground to DB
  // get data from form and add to campgrounds array
router.post("/", middleware.isLoggedIn, upload.single('image'), function (req, res) {
  // geocoder configuration
    geocoder.geocode(req.body.location, function (err, data) {
     if (err || !data.length) {
         console.log(err);
       req.flash('error', 'Invalid address');
       return res.redirect('back');
     }
     req.body.campground.lat = data[0].latitude;
     req.body.campground.lng = data[0].longitude;
     req.body.campground.location = data[0].formattedAddress;
    // cloudinary configuration
    cloudinary.uploader.upload(req.file.path, function (result) {
      // add cloudinary url for the image to the campground object under image property
      req.body.campground .image = result.secure_url;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      };
      // add to the campground model
      Campground.create(req.body.campground , function (err, party) {
        if (err) {
          req.flash('failure', err.message);
          return res.redirect('back');
        }
        req.flash("success", "Campground was created!");
        res.redirect('/campgrounds');
      });
    });
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
   // UPDATE CAMPGROUND ROUTE
   router.put("/:id", middleware.checkCampgroundOwnerShip, function(req, res){
      geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
    
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

    
    //destroy route
    router.delete('/:id', middleware.checkCampgroundOwnerShip, function(req, res){
        Campground.findByIdAndRemove(req.params.id, function(err){
           if(err){
                res.redirect('/campgrounds');   
           }
           else{
               req.flash("success", "Campground was deleted, hope it wasn't great!")
                res.redirect('/campgrounds');
           }
        });
    });
    
   function escapeRegex(text){
       return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
   }
    module.exports = router;
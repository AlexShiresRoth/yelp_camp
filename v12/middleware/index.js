//all the middleware goes here
       var Campground = require('../models/campground');
       var Comment    = require('../models/comment');
       
var middlewareObj = {
    
}

middlewareObj.checkCampgroundOwnerShip = function(req, res, next){
            if(req.isAuthenticated()){
             req.flash('success', 'Campground was successfully edited!');
             Campground.findById(req.params.id, function(err, foundCampground){
                 //if campground returns null--
                if(err || !foundCampground){
                    console.log(err);
                    req.flash('error', 'Sorry, that campground does not exist!');
                    res.redirect('/campgrounds');
                }
                else{
                    //does the user own the campground?
                    if(foundCampground.author.id.equals(req.user._id)){
                            next();   
                    }
                    else{
                        req.flash('error', "You don't have permission to do that!");
                        res.redirect('back');
                    } 
                }
            });     
        }
        else{
            req.flash('error', 'You need to be logged in to do that!');
            res.redirect('back');
        }
    }

middlewareObj.checkCommentOwnerShip = function(req, res, next){
            if(req.isAuthenticated()){
            
             Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err || !foundComment){
                    req.flash('error','Comment not found');
                    res.redirect('back');
                }
                else{
                    //does the user own the comment?
                    if(foundComment.author.id.equals(req.user._id)){
                            next();   
                    }
                    else{
                        req.flash('error', 'You need to be logged in to do that!');
                        res.redirect('back');
                    } 
                }
            });     
        }
        else{
            res.redirect('back');
        }
    };
    
middlewareObj.isLoggedIn = function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error', 'You need to be logged in to do that!');
        res.redirect('/login');
    };


module.exports = middlewareObj;
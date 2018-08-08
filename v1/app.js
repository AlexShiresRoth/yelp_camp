var express = require("express");
var app = express();
var bodyParser = require("body-parser");

 var campgrounds = [
       {name: "Bear Cove", image: "https://images.unsplash.com/photo-1455496231601-e6195da1f841?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4d1156d3e4dfafbc71a9f293939f3243&auto=format&fit=crop&w=795&q=80.jpg"},
       {name: "Boullion cuber gorge", image: "https://images.unsplash.com/photo-1496947850313-7743325fa58c?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=8f0bb0006c15a626dab0a5025e7838fa&auto=format&fit=crop&w=750&q=80.jpg"},
       {name: "Weenie Town Canyon", image: "https://images.unsplash.com/photo-1468956398224-6d6f66e22c35?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=5d2e4d45d037053be722233b79bd0510&auto=format&fit=crop&w=755&q=80.jpg"}
       ]    

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get('/', function(req, res){
    res.render("landing");
});

app.get("/campgrounds", function(req, res){
  
       res.render("campgrounds", {campgrounds: campgrounds});
});

app.post("/campgrounds", function(req, res){
   
    var name = req.body.name;
    var image = req.body.image;
    var newCampground = {name: name, image: image}
    campgrounds.push(newCampground);
    res.redirect("/campgrounds");
});

app.get("/campgrounds/new", function(req, res){
   res.render("new.ejs"); 
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server has started");
})
//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-tirna:Shubh@4197@cluster0.mbvbv.mongodb.net/todolistDB", {useNewUrlParser: true , useUnifiedTopology: true});

//schema:
const itemsSchema = new mongoose.Schema({
  name: String
});

//model:
const Item = new mongoose.model("Item", itemsSchema);
//documents:
const cookFood = new Item({
  name: "Cook Food"
});

const eatFood = new Item({
  name: "Eat Food"
});

const washDishes = new Item({
  name: "Wash Dishes"
});

//Schema for list:
const listSchema={
  name: String,
  items:[itemsSchema]
};

const defaultItems = [cookFood,eatFood,washDishes];

//Model for list:
const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {

const day = date.getDate();

  Item.find({},function(err,results){
    if(results.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Data added successfully!");
        }
      });
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: results});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });
  if(listName==="Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

//create dynamic lists:
app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        //show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Item Removed successfully!");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,rseultList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});

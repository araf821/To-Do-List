const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();

// This array will hold the elements in the to-do list.
// var items = ["Work on the EJS module."];

app.set("view engine", "ejs");

// Connecting to a MongoDB database with the help of mongoose
async function main() {
  // Use connect method to connect to the server
  await mongoose.connect(
    "mongodb+srv://admin:n3dsu821@cluster0.0ndaeef.mongodb.net/todolistDB"
  );
}

// This function executes the connection to a databse.
main().catch((err) => {
  console.log(err);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Creating a schema for the database
const itemSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemSchema],
};

// Create a model based on the itemSchema
const Item = mongoose.model("Item", itemSchema);

// Creating items for the database
const item1 = new Item({
  name: "Hit the + button to add a new item.",
});

const item2 = new Item({
  name: "Click on the checkbox to delete an item.",
});

const defaultItems = [item1, item2];

// Creating a model based on the listSchema
const List = mongoose.model("List", listSchema);

// This code decalres what exactly renders on our home route.
// Recall: "/" refers to just localhost:3000 or our home page/route.
app.get("/", (req, res) => {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      // Insert the default items into the database if there isn't already any.
      Item.insertMany(defaultItems, (err) => {
        err
          ? console.log(err)
          : console.log("Successfully added the defualt items.");
        foundItems = defaultItems;
      });
    }
    res.render("list", { listTitle: "Today", newItems: foundItems });
  });
});

// This next bit of code directs the user to the about ejs page
// when the user goes to localhost:3000/about
app.get("/:route", (req, res) => {
  const routeName = lodash.capitalize(req.params.route);

  List.findOne({ name: routeName }, (err, listFound) => {
    if (!err) {
      if (!listFound) {
        // If a list with the same name doesn't already exist, create it.
        const list = new List({
          name: routeName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + routeName);
      } else {
        // If the list exists, then we show it.
        res.render("list", {
          listTitle: listFound.name,
          newItems: listFound.items,
        });
      }
    } else {
      console.log(err);
    }
  });
});

app.post("/", (req, res) => {
  // Add the new item to the list of items to be added to the to-do list.
  const itemName = req.body.newItem;
  const listName = req.body.listName;

  // No matter which list the user adds a new item to,
  // we create a new item by default.
  const item = new Item({
    name: itemName,
  });

  // We then check whether the user is trying to add the item into
  // the main list or a custom list that they've made.
  // Remember, the main list has a title of "Today"
  if (listName === "Today") {
    // Save just the item and redirect back to our main get()
    // function in order to display the new item.
    item.save();
    res.redirect("/");
  } else {
    // If the list is not the main list, then find out what the list is.
    List.findOne({ name: listName }, (err, foundList) => {
      // Once found, add the item to that list.
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const itemToDelete = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(itemToDelete, (err) => {
      console.log(err);
    });

    // Redirect back to the main route.
    res.redirect("/");
  } else {
    // If the list doesn't refer to the home route, then find
    // and delete from the custom list.
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemToDelete } } },
      (err) => {
        if (err) console.log(err);
        else res.redirect("/" + listName);
      }
    );
  }
});

// This bit of code declares that our application runs on the port localhost:3000
// That is also our home route.
let port = process.env.PORT;
if(port == null || port == "")
  port = 3000;

app.listen(port, () => {
  console.log("Server is now up and running!");
});

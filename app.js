//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const { ServerApiVersion } = require("mongodb");

// Connect Local DB
mongoose.connect("mongodb://127.0.0.1:27017/BlogWebsite", {
  useNewUrlParser: true,
});

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const postSchema = {
  title: String,
  content: String,
};

const contactUsSchema = {
  name: String,
  email: String,
  subject: String,
  message: String,
};

const Post = mongoose.model("Post", postSchema);
const ContactUs = mongoose.model("ContactUs", contactUsSchema);

app.get("/", async function (req, res) {
  try {
    const foundItems = await Post.find().exec();
    res.render("home", {
      startingContent: homeStartingContent,
      posts: foundItems,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

// app.get("/contact", function (req, res) {
//   res.render("contact", { contactContent: contactContent });
// });

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });
  post.save();
  res.redirect("/");
});

app.post("/ContactsUs", async function (req, res) {
  const contactus = new ContactUs({
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
  });
  try {
    await contactus.save();
    // redirect to contact page with success message
    res.redirect("/contact?success=true");
  } catch (err) {
    // handle error
    console.error(err);
  }
});


// In your contact page route:
app.get("/contact", function(req, res) {
  const success = req.query.success;
  res.render("contact", { success: success });
});


app.get("/posts/:postName", async function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);
  try {
    const foundItems = await Post.find().exec();
    foundItems.forEach(function (post) {
      const storedTitle = _.lowerCase(post.title);
      if (storedTitle === requestedTitle) {
        res.render("post", {
          title: post.title,
          content: post.content,
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/delete/:postName", async function (req, res) {
  const requestedTitle = req.params.postName;
  try {
    const deletedPost = await Post.findOneAndDelete({
      title: requestedTitle,
    }).exec();
    if (deletedPost) {
      console.log(`Post "${deletedPost.title}" has been deleted.`);
      res.redirect("/");
    } else {
      console.log(`Post "${requestedTitle}" does not exist.`);
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

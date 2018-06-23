var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
var cheerio = require("cheerio");
var request = require("request");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/news-scraper");
if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
}
else {
	mongoose.connect("mongodb://localhost/news-scraper");
};
mongoose.Promise = Promise;

var connection = mongoose.connection;

connection.on("error", function(error) {
	console.log("Mongoose Error: ", error);
});
connection.once("open", function() {
	console.log("Mongoose connection successful.");
});

// Routes

app.get("/", function(req, res) {
	db.Article.find({}, null, {sort: {created: -1}}, function(err, data) {
		// if(data.length === 0) {
		// 	res.render("placeholder", {message: "There's nothing scraped yet."});
		// }
		// else{
			res.render("index", {articles: data});
		// }
	});
});

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.chicagotribune.com", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    let results = [];
    // Now, we grab every h2 within an article tag, and do the following:
    $("h4.trb_outfit_list_headline_a_text").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .parent()
        .text();
      result.link = "https://www.chicagotribune.com" + $(this)
        .parent()
        .attr("href");

       results.push(result); 
    //   result.category = $(this)
    //     .child()
    //     .attr("trb_outfit_categorySectionHeading_a");

      // Create a new Article using the `result` object built from scraping
    
    });

    db.Article.create(results)
    .then(function(dbArticle) {
      // View the added result in the console
      console.log(dbArticle);
    //   res.send("Scrape Complete");
      res.redirect("/");
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      return res.json(err);
    });
    // If we were able to successfully scrape and save an Article, send a message to the client

  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for getting all user-saved Articles from the db
app.get("/saved", function(req, res) {
	db.Article.find({saved: true}, null, {sort: {created: -1}}, function(err, data) {
			res.render("saved");
	});
});

// Route for grabbing a specific Article by id, populate it with its note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// route for saving an Article for later
app.post("/save/:id", function(req, res) {
	db.Article.findById(req.params.id, function(err, data) {
		if (data.saved) {
			// db.Article.findByIdAndUpdate(req.params.id, {$set: {saved: false}}, {new: true}, function(err, data) {
				res.redirect("/");
			// });
		}
		else {
			db.Article.findByIdAndUpdate(req.params.id, {$set: {saved: true}}, {new: true}, function(err, data) {
				res.redirect("/saved");
			});
		}
	});
});

// Route for retrieving all Notes from the db
app.get("/notes", function(req, res) {
    // Find all Notes
    db.Note.find({})
      .then(function(dbNote) {
        // If all Notes are successfully found, send them back to the client
        res.json(dbNote);
      })
      .catch(function(err) {
        // If an error occurs, send the error back to the client
        res.json(err);
      });
  });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

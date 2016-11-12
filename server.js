var express = require('express');
var app = express();
var Note = require('./models/comment.js');
var Article = require('./models/article.js');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var request = require('request');
var cheerio = require('cheerio');

//Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}))
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;

db.on('error', function(err) {
	console.log("ERROR: " + err)
});
db.once('open', function() {
  console.log("we're connected!");
});

// A GET request to scrape the echojs website.
app.get('/scrape', function(req, res) {
	console.log('yo');
	// first, we grab the body of the html with request
	request('http://www.nytimes.com/pages/technology/index.html?action=click&pgtype=Homepage&region=TopBar&module=HPMiniNav&contentCollection=Tech&WT.nav=page', function(error, response, html) {
		if (error) {
			console.log('ERROR: ' + error);
		}
		// then, we load that into cheerio and save it to $ for a shorthand selector
		var $ = cheerio.load(html);
		// now, we grab every h2 within an article tag, and do the following:
		$('div.ledeStory').each(function(i, element) {
			console.log('yo2');

			// save an empty result object
				var result = {};

				// add the text and href of every link, 
				// and save them as properties of the result obj
				result.title = $(this).find('h2').text();
				result.summary = $(this).children('p.summary').text();

				// using our Article model, create a new entry.
				// Notice the (result):
				// This effectively passes the result object to the entry (and the title and link)
				var entry = new Article (result);

				// now, save that entry to the db
				entry.save(function(err, doc) {
					// log any errors
				  if (err) {
				    console.log(err);
				  } 
				  // or log the doc
				  else {
				    console.log(doc);
				  }
				});

		});
	});
  	// tell the browser that we finished scraping the text.
  	return res.render('index', {})
});

app.get('/', function(req, res){
	console.log('1')
	res.render('index')
})

app.get('/articles', function(req, res){
	console.log('2')
	// grab every doc in the Articles array
	Article.find({}, function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		} 
		// or send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});


var port = 3000;
app.listen(port);
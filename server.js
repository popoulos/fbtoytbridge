var http = require('http');
var URL = require('url');
var express = require('express');
var swig  = require('swig');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var dbUrl = 'mongodb://localhost:27017/chill';
var async = require("async");
var FB = require('fb');
FB.setAccessToken('EAACEdEose0cBAEuaGHs7d2RCvLuFb4brnLZCCgOxJuZBC60il4fS2ev7KCDZAZAKhUhRnpMiKQMz8aHpsXAYBs8I0d3OXQkYHcTy4ESj22xHnZCui9qtrj0K7t5gY8DvyjHi5R8pZBxOWfdoeF2pf1npV82MqxqKh7bI9uHYRZBBgZDZD');
var app = express();
app.use("/css", express.static(__dirname + '/assets/css'));

// playlist id = PLPu8jplSWBZW15knyu909uzsh1jmrz7f9
// snippet : kind : youtube#video
// snippet : videoId : nssMO0courw

//https://graph.facebook.com/v2.0/1492344740991612/feed?format=json&icon_size=16&since=1464915900&access_token=EAACEdEose0cBADNNxffkL5OHLLJRpiUkwEF3N6gZA9QxTdw2ZA6pWXgrlCbAZCT3tdNDEvEzWJpYaSD1HwtqZCgzkyTRBJdF4n7Y5xZCGqVZC7i5LDfy0XrR2KJf1FZCrIIEd5BWgLNmjovx5LSsFFsIR15TFEiMtqxxFHertfClgZDZD&limit=25&__paging_token=enc_AdAZBtLd2oUuZAzMopMSAChJZBegaxMzZAfBwAXxvGIXkWAwknF2JA681Ve6DqXrBjZAyU6k7dk9MFEtOqfWZCL70Sbosy7RZAWdRuZAfNLGfmrA8rx4WgZDZD&__previous=1
//https://graph.facebook.com/v2.0/1492344740991612/feed?format=json&icon_size=16&access_token=EAACEdEose0cBADNNxffkL5OHLLJRpiUkwEF3N6gZA9QxTdw2ZA6pWXgrlCbAZCT3tdNDEvEzWJpYaSD1HwtqZCgzkyTRBJdF4n7Y5xZCGqVZC7i5LDfy0XrR2KJf1FZCrIIEd5BWgLNmjovx5LSsFFsIR15TFEiMtqxxFHertfClgZDZD&limit=25&until=1461794008&__paging_token=enc_AdD2jivtpH9YlMQH12geIBHqvNoAn7ktGUOK8m7LcIWr3XZCZBXeN2qZAtXrczCT38lgpiZCuf2B9XPShkAPm1Jy9hSPzf4KagdnakY49bJLXmRt6AZDZD
//https://graph.facebook.com/v2.0/1492344740991612/feed?format=json&__paging_token=enc_AdBOsuvm0JobeeSy7LwE2HNr8RFXHfVJcfpnTMw2e9BIpMfbPhsGvcGPLo7VO8vU2VBZAQ9oJiWc96x368XGqWyZBiRDyYFCblWiYpL0kmP5ZAcpwZDZD&icon_size=16&access_token=EAACEdEose0cBADNNxffkL5OHLLJRpiUkwEF3N6gZA9QxTdw2ZA6pWXgrlCbAZCT3tdNDEvEzWJpYaSD1HwtqZCgzkyTRBJdF4n7Y5xZCGqVZC7i5LDfy0XrR2KJf1FZCrIIEd5BWgLNmjovx5LSsFFsIR15TFEiMtqxxFHertfClgZDZD&limit=25&until=1460579183
// var groupId = 1492344740991612
app.get('/', function(req, res) {
    res.writeHead(200);
	var data = { groupId : 1492344740991612 , posts : []};

	MongoClient.connect(dbUrl, function(err, db) {
		assert.equal(null, err);
		console.log("Connected correctly to server");

		//removeCollection(res, db);
		//renderDbGroupList(res, db, data);
		//renderGroupList(res, db, data);
		//recursiveRenderGroupList(res, db, data);
		addOnYoutube(res, db, data);
	});
});

function addOnYoutube(res, db, data){
	const Youtube = require("youtube-api")
	const opn = require("opn");
	const readJson = require("r-json");

	const CREDENTIALS = readJson('givemenoize-0ddfc54acdea.json');

	var oauth = Youtube.authenticate({
		type: "oauth"
		, client_id: CREDENTIALS.client_id
		, client_secret: CREDENTIALS.client_secret
		, redirect_url: "http://localhost/:8080"
	});

	opn(oauth.generateAuthUrl({
		access_type: "offline"
		, scope: [
			"https://www.googleapis.com/auth/youtubepartner",
			"https://www.googleapis.com/auth/youtube",
			"https://www.googleapis.com/auth/youtube.force-ssl"
		]
	}));

	oauth.setCredentials(tokens);

	Youtube.playlistItems.insert({
		"part": "snippet",
		"snippet": {
			"playlistId": "PLPu8jplSWBZW15knyu909uzsh1jmrz7f9",
			"resourceId": {
				"kind": "youtube#video",
				"videoId": "nzWpyEvi_dI"
			}
		}
	}, (err, ytdata) => {
		console.log(ytdata);
		console.log(err);
		console.log("Done.");
		renderDbGroupList(res, db, data);
	});
}

function removeCollection(res, db){
	db.collection('chillFull').remove(function(){
		renderPage(res, db, []);
	});
}

function renderPage(res, db, data){
	db.close();
	var html = swig.renderFile('templates/index.html', data);
	res.end(html);
}

function renderDbGroupList(res, db, data){
	var collection = db.collection('chillFull');
	collection.find({}).toArray(function(err, docs) {
		assert.equal(err, null);
		console.log("Found the following records");
//console.log(docs);
		data.posts = docs;
		renderPage(res, db, data);
	});
}

function recursiveRenderGroupList(res, db, data, url){
	if(url){
		url = URL.parse(url).path;
	}
	var url = url || data.groupId+'/feed';
	FB.api(url,
			{ fields: ['id', 'name', 'likes', 'description', 'story', 'picture', 'link', 'created_time'] },
			function (apiRes) {

		if(!apiRes || apiRes.error) {
			console.log(!res ? 'error occurred' : apiRes.error);
			return 0;
		}

		Array.prototype.push.apply(data.posts, apiRes.data);

		if(apiRes.paging && apiRes.paging.next){
			recursiveRenderGroupList(res, db, data, apiRes.paging.next);
		} else {
			insertGroupList(db, res, data);
		}
	});
}

function insertGroupList(db, res, data) {
	var collection = db.collection('chillFull');
	console.log(data.posts);

	collection.insertMany(data.posts, function(err, result) {
		console.log('------');
		console.log(result);
		console.log("Inserted");
		renderPage(res, db, data);
	});
}



function getFBAccessToken(){
FB.api('oauth/access_token', {
    client_id: 'app_id',
    client_secret: 'app_secret',
    grant_type: 'client_credentials'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }

    var accessToken = res.access_token;
});
}


app.listen(8080);

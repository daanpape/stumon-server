/* 
 * Copyright (C) 2016 Daan Pape
 * 
 * Written by Daan Pape <daan@dptechnics.com>
 */

var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(session({secret: 'secretsessionkeywhichisverylongandsafe', resave: true, saveUninitialized: true}));

var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'stumon-server',
	password : 'pannenkoeken',
	database : 'stumon_server'
});

/******************************************************* STUMON DEVICE API ***************************************************/
app.post('/devapi/v1/heartbeat', function(req, res) {
	console.log("Updating heartbeat date for scanner: " + req.body.reader_id);
	connection.query("UPDATE stumon_readers SET last_heartbeat = NOW() WHERE reader_id = ?", [req.body.reader_id], function(err, result) {
		res.statusCode = 200;
		res.send("Ok");
	});
});

app.post('/devapi/v1/tag', function(req, res) {
        console.log("Inserting tag");
	connection.query("INSERT INTO scans (reader_id, tag, scan_time) VALUES (?, ?, NOW())", [req.body.reader_id, req.body.tag], function(err, result) {
		res.statusCode = 200;
		console.log(result);
                console.log(err);
		res.send("Ok");
	});
});

app.post('/devapi/v1/score', function(req, res) {
        console.log("Inserting score");
	connection.query("INSERT INTO scans (reader_id, tag, score, scan_time) VALUES (?, ?, ?, NOW())", [req.body.reader_id, req.body.tag, req.body.score], function(err, result) {
		res.statusCode = 200;
		console.log(result);
		console.log(err);
		res.send("Ok");
	});
});


/******************************************************* STUMON USER API ***************************************************/
app.get('/userapi/scanners', function (req, res) {
	if(req.session.logged == false || req.session.email == "" || req.session.email == undefined) {
                res.statusCode = 403;
		console.log(req.session);
		res.send("login");
        } else {
		connection.query("SELECT id, reader_id, last_heartbeat FROM stumon_readers WHERE last_heartbeat >= NOW() - INTERVAL 1 MINUTE", function(err, rows) {
			res.send(rows);
		});
	}
});

app.get('/userapi/scans', function(req, res) {
	if(req.session.logged == false  || req.session.email == "" || req.session.email == undefined) {
                res.statusCode = 403;
		res.send("login");
        } else {
		connection.query("SELECT id, reader_id, tag, score, scan_time FROM scans", function(err, rows) {
                	res.send(rows);
        	});
	}
});

app.delete('/userapi/scans', function(req, res) {
	if(req.session.logged == false || req.session.email == "" || req.session.email == undefined) {
		res.statusCode = 403;
		res.send("login");
	} else {
		connection.query("DELETE FROM scans", function(err, rows) {
			res.send("deleted");
		});
	}
});

app.post('/userapi/login', function(req, res) {
	if(req.body.username == 'demo@howest.be' && req.body.password == "demo") {
		var sess = req.session;
		sess.email = req.body.username;
		sess.logged = true;
		console.log(req.session);
		res.send("Ok");
	} else {
		req.session.logged = false;
		res.statusCode = 403;
		res.send("Bad username/password"); 
	}
});

app.delete('/userapi/session', function(req, res) {
	var sess = req.session;
	sess.email = "",
	sess.logged = false;
	res.send("Logged out");
});

app.listen(3000, function () {
  console.log('Stumon server started listening on port 3000');
});

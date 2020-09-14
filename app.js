'use strict';

// [START gae_node_request_example]
require('dotenv').config()
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database');

app.use(express.static(__dirname + '/public')); //__dir and not _dir

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json({limit:'1mb'}));


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;

var fs = require('fs');


var runSQL = function(sql, response){
	console.log(sql);
	logInfo(sql);
	
	try {
		connection.query(sql,
			function(error, results, fields) {
				if(!error){
					response.json(results);
				}
				else{
					response.json(error);
					console.log(error);
					logInfo(error);
					//throw error;
				}
			}
		);
	}
	catch(err) {
		console.log(err);
		logInfo(err);
		response.json(error);
	}	
}

var logInfo = function(info){
	return false;
	var date = new Date();
	fs.appendFile('sqlLog.txt', date.toString() + " - " + info + "\n", function (err) {
	  if (err) throw err;
	  console.log('Saved!');
	});
}

app.get('/api/login',(request, response)=>{
	console.log('login');
	console.log(request.query.username);
	console.log(request.query.password);
	var sql = '';
	
	if (request.query.username === 'Small Parcel Team' && request.query.password === 'Revenue') {
        response.json(true);
    }else{
		response.json(false);
	}
});

app.get('/api/test',(request, response)=>{
	console.log('login');
	console.log(request.query.youtubecode);
	
	var sql = 'call getLyrics("'+request.query.youtubecode+ '")'
	logInfo(sql);

	runSQL(sql, response);
});
app.post('/api/record',(request, response)=>{	

	//console.log(request.body);
	
	var sql = 'call add_myEZY("'+request.body["Status Code"]+'","'+request.body["Carrier Name"]+'","'+request.body["Freight Bill (PRO) Document"]+'","'+request.body["Consignee Name"];
	sql = sql + '","'+request.body["Consignee Address Line3"]+'","'+request.body["Claim Number"]+'","'+request.body["Claim Amount"]+'","'+request.body["Date Filed"];
	sql = sql + '","'+request.body["Date Mailed"]+'","'+request.body["Company Name"]+'","'+request.body["Shipper Name"]+'","'+request.body["Consignee Name1"];
	sql = sql + '","'+request.body["Reason Code"]+'","'+request.body["Date Requested"]+'","'+request.body["Shipment Date"]+'","'+request.body["Date Paid (Last)"];
	sql = sql + '","'+request.body["Date Closed"]+'","'+request.body["Date Filed1"]+'","'+request.body["Date Mailed1"]+'","'+request.body["Date Requested1"];
	sql = sql + '")'
	logInfo(sql);

	runSQL(sql, response);
});
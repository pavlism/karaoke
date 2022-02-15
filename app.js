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
var listActions = [];

//file updater code ******
app.get('/api/testConnect',(request, response)=>{
	console.log('');
	console.log('/api/testConnect');
	response.json('Connection Tested');
	response.end();
});
app.post('/api/changeFile',(request, response)=>{
	console.log('');
	console.log('/api/changeFile');
	//console.log(request.body);
	console.log(request.body.filePath);
	console.log(request.body.fileContent);

	var path = 'public/' + request.body.filePath;
	var fileStr = request.body.fileContent;

	fs.readFile(path, (error, data) => {
		console.log('checking if file exists');
		if(error) {
			console.log('error');
			console.log(error);
			response.status(500);
			response.json({error});
			response.end();
		}else{
			console.log('file exists');
			console.log('attempting to update file');
			fs.writeFile(path, fileStr, (error) => {
				if(error) {
					console.log('error');
					console.log(error);
					response.status(500);
					response.json(error);
					response.end();
				}else{
					console.log('File Updated');
					response.json('File Updated');
					response.end();
				}
			});
		}
	});
});
//************************


app.get('/api/listActions', function(request, response) {
	response.json(listActions);
});
app.post('/api/listAction',(request, response)=>{
	console.log('post listAction');

	//console.log(request.body.action);
	//console.log(request.body.title);
	var tempObj = {};

	tempObj[request.body.action] = request.body.title;
	listActions.push(tempObj);

	console.log(listActions);
	response.json('');
});
app.delete('/api/listAction',(request, response)=>{
	console.log('delete listAction');

	console.log(request.body.action);
	console.log(request.body.title);

	for(let actionCounter = 0;actionCounter<listActions.length;actionCounter++){
		if(listActions[actionCounter][request.body.action] === request.body.title){
			listActions.splice(actionCounter,1);
		}
	}

	console.log(listActions);
	response.json('');
});
app.delete('/api/allListAction',(request, response)=>{
	console.log('delete allListAction');

	listActions = [];
	console.log(listActions);
	response.json('');
});


app.post('/api/changeSongTitle',(request, response)=>{
	console.log('post addPlaylist');
	
	console.log(request.body.newTitle);
	console.log(request.body.oldTitle);
	
	
	if (fs.existsSync('public/lyrics/' + request.body.oldTitle + '.txt')) {
		fs.rename('public/lyrics/' + request.body.oldTitle + '.txt', 'public/lyrics/' + request.body.newTitle + '.txt', function(error) {

		});
	}

	fs.rename('public/videos/' + request.body.oldTitle + '.mp4', 'public/videos/' + request.body.newTitle + '.mp4', function(error) {
		if(error) {
			response.json(error);
		}else{
			response.json('PlayList Created');
		}
		response.end();
	});

});
app.get('/api/video', function(request, response) { 
  const path = 'public/videos/' + request.query.name + '.mp4'
  
  console.log(path);
  
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = request.headers.range
  
  
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] 
      ? parseInt(parts[1], 10)
      : fileSize-1
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    response.writeHead(206, head);
    file.pipe(response);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    response.writeHead(200, head)
    fs.createReadStream(path).pipe(response)
  }
});
app.post('/api/addLyrics',(request, response)=>{	
	console.log('/api/addLyrics');
	
	console.log(request.body.songTitle);
	console.log(request.body.lyrics);
	
	fs.writeFile('public/lyrics/' + request.body.songTitle + '.txt', request.body.lyrics, (error) => {
		if(error) {
			response.json(error);
		}else{
			response.json('Lyrics Created');
		}
		response.end();
	});
});
app.post('/api/addPlaylist',(request, response)=>{	
	console.log('post addPlaylist');
	
	console.log(request.body.title);
	console.log(request.body.list);
	
	fs.writeFile('public/playlists/' + request.body.title + '.txt', request.body.list, (error) => {
		// throws an error, you could also catch it here
		if(error) {
			response.json(error);
		}else{
			response.json('PlayList Created');
		}
		response.end();
	});
});
app.delete('/api/playList',(request, response)=>{	
	console.log('delete playList');
	console.log(request.body.title);

	fs.unlink('public/playlists/' + request.body.title + '.txt', (err) => {
		if (err) {
			console.error(err)
			return
		}
			response.json('PlayList Removed');
	})
});
app.get('/api/playlists',(request, response)=>{
	console.log('get playlists');
	
	var playListList = [];
	
	fs.readdirSync('public/playlists/').forEach(fileName => {
		if(fileName.search('txt') >0){
			playListList.push(fileName.replace(".txt",""));
		}
	});

	response.json(playListList);
});
app.get('/api/playlist',(request, response)=>{
	console.log('/api/playlist');
	
	const path = 'public/playlists/' + request.query.name + '.txt'
	
	console.log('path: ' + path);
	
	fs.readFile(path, (error, data) => {
		if(error) {
			response.json(error);
		}else{
			response.json(data.toString());
		}
	});
});
app.get('/api/songList',(request, response)=>{
	console.log('songList');
	
	var videoList = [];
	
	fs.readdirSync('public/videos/').forEach(fileName => {
		if(fileName.search('mp4') >0){
			videoList.push(fileName.replace(".mp4",""));
		}
	});

	response.json(videoList);
});
app.get('/api/lyrics',(request, response)=>{
	console.log('/api/lyrics');
	
	const path = 'public/lyrics/' + request.query.name + '.txt'

	console.log('path:' + path);

	fs.readFile(path, (error, data) => {
		if(error) {
			console.log("error");
			console.log(error);
			response.json('Lyrics Missing');
		}else{
			response.json(data.toString());
		}
	});
});
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

	response.json('');
});
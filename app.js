'use strict';

/*TODO
	-make it work
	-send a ressponse with errors
	-turn into an npm package
 */

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

//File Updater Code
var fs = require('fs');
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
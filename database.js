//const mysql = require('mysql');

// Database Connection for Production
/*
 let config = {
	user: process.env.DB_USER,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASS,
}

if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
	config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
}

let connection = mysql.createConnection(config);
*/
// Database Connection for Development
/*
let config = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASS,
}
*/

/*
let config = {};

config.user = process.env.DB_USER;
config.database = process.env.DB_DATABASE;
config.password = process.env.DB_PASS;

if(process.env.PROD ==='0'){
	config.host = process.env.DB_HOST;
}else{
	if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
		config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
	}
}

let connection = mysql.createConnection(config);

//var fs = require('fs');

connection.connect(function(err) {

	//process.stdout.write("I will goto the STDERR")
	//process.stderr.write("I will goto the STDERR")

	if (err) {
		
	  console.error('Error connecting: ' + err.stack);
	  return false;
	  var date = new Date();
	  var info = err.stack;
		fs.appendFile('sqlLog.txt', date.toString() + " - " + info + "\n", function (err) {
		  if (err) throw err;
		  console.log('Saved!');
		});
	  
	  
	  return;
	}
	console.log('Connected as thread id: ' + connection.threadId);
});
*/
//module.exports = connection;
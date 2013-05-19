var ssh2    = require('ssh2'),
    fs      = require('fs'),
    express = require('express');

// Load config defaults from JSON file.
// Environment variables override defaults.
function loadConfig() {
  var config = JSON.parse(fs.readFileSync(__dirname+ '/config.json', 'utf-8'));
  for (var i in config) {
    config[i] = process.env[i.toUpperCase()] || config[i];
  }
  console.log('Configuration');
  console.log(config);
  return config;
}

var config = loadConfig();
var app = express();
app.use(express.bodyParser());

// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/upload', function(req, res) {
	console.log("/upload");
	var conn = new ssh2();
	conn.on(
		'connect',
		function () {
			console.log("- connected");
		}
	);
	 
	conn.on(
		'ready',
		function () {
			console.log("- ready");
			conn.sftp(
				function (err, sftp) {
					if (err) {
						console.log("Error, problem while starting SFTP: %s", err);
						res.json({error: 'Unable to start SFTP'});
					}
	 
					console.log("- SFTP started");
				
					var writeStream = sftp.createWriteStream(req.body.path);
	 
					// what to do when transfer finishes
					writeStream.on(
						'close',
						function () {
							console.log("- file transferred");
							sftp.end();
							conn.end();
						}
					);
					
					writeStream.on(
						'error',
						function (err) {
							console.log('Error, problem while writing file "%s": %s', req.body.path, err);
							res.json({error: 'Unable to write "' + req.body.path + '"'});
							sftp.end();
							conn.end();
						}
					);
	 
					// initiate transfer of file
					writeStream.end(req.body.content);
				}
			);
		}
	);
	 
	conn.on(
		'error',
		function (err) {
			console.log("- connection error: %s", err);
			if(err.level == "authentication") {
				res.json({error: "Authentication failure"});
			}
			else if(err.code == "ENOTFOUND") {
				res.json({error: "Host not found"});
			}
			else if(err.code == "ETIMEDOUT") {
				res.json({error: "Connection timeout"});
			}
			else {
				res.json({error: err});
			}
		}
	);
	 
	conn.on(
		'end',
		function () {
			console.log("- connection end");
			res.json({});
		}
	);
	
	conn.connect({
		host: req.body.host,
		port: req.body.port || 22,
		username: req.body.username,
		password: req.body.password
	});
});

var port = process.env.PORT || config.port || 9999;

app.listen(port, null, function (err) {
	console.log('Server started: http://localhost:' + port);
});

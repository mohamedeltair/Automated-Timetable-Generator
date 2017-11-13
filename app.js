var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser=require('cookie-parser'),
    logger = require('morgan'),
    path = require('path'),
    fs = require('fs'),
    http = require('http');



var app = express();

app.set('port', process.env.PORT || 3000);
var httpServer = http.createServer(app);

httpServer.listen(app.get('port'), '0.0.0.0',
    function() {
        console.log('Express server listening on port ' + app.get('port'));
    }
);

var io = require('socket.io');

var listener = io.listen(httpServer);

listener.sockets.on('connection',
    function(socket){
        socket.emit('connected', {"status": "connected"});
        socket.on('credentials', function(data) {
            var username = data.username;
			var password = data.password;
			if(username==="nour"&& password=="1234") {
				socket.emit('response', {"status": "valid"});
			}
			else {
				socket.emit('response', {"status": "invalid"});
			}
        });
		socket.on("start", function(data) {
			/*fs.readFile("./public/files/table.txt", 'utf8', function(err, data2) {
			  //if (err) socket.emit("start", err);
			  //var obj = JSON.parse(data2);
			  socket.emit("start", data2);
			});*/
			var obj = JSON.parse(fs.readFileSync('./public/files/table.txt', 'utf8'));
			socket.emit("start", obj);
		});
		socket.on("edit", function(data) {
			fs.unlinkSync("./public/files/table.txt");
			fs.writeFileSync('./public/files/table.txt', data);
		});
    });

var index = require('./routes/index');
var Login = require('./routes/Login');
var admin = require('./routes/admin');
var addCourse = require('./routes/addCourse');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

app.use('/index', index);
app.use('/', Login);
app.use('/admin', admin);
app.use('/admin/addcourse',addCourse);

app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status=404;
    next(err);
});
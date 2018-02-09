
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

//const {generateMessage, generateLocationMessage} = require('./utils/message');

const ge = require('./utils/message');
const generateMessage = ge.generateMessage;
const generateLocationMessage = ge.generateLocationMessage;

const {isRealString} = require('./utils/validation'); 
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');

var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var responseTime = require('response-time');
var currency = require('./currency-convert.js');
var cc = require('./CC.js');

const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

app.use(bodyParser.json());
app.use(responseTime());


app.get('/getTime', responseTime((req, res,time) => {
  //console.log(`request ip is:${req.ip}. times:${time} ms`);
  res.send("Hi,have a nice day!   response time is :"+time+"ms.");
  
}));

app.get('/',(req, res,next) => {
  //console.log(`request ip is:${req.ip}.`);
  //res.send("Hi,have a nice day!   response time is :"+time+"ms.");
  next();
});

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/welcome', (req, res) => {
  try {
    res.send("Hi,have a nice day!");
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/currency', async (req, res) => {
  try{
    res.send("<html><p>"+await currency.currentNow()+"</p></html>");
  } catch (e){
    res.status(400).send(e);
  }
    //await res.send("Hi,have a nice day!");
 
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});


io.on('connection', (socket) => {
  //console.log('New user connected');

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.removeUserByUserName(params.name);
    users.addUser(socket.id, params.name, params.room);

    console.log(JSON.stringify(users));
    /* var u = users.getUserByName (params.name);
    console.log(JSON.stringify(users));
    console.log(JSON.stringify(u));
    if(u ){
      console.log(`already user:${params.name}`);
      return callback();
    } */

    io.to(params.room).emit('updateUserList', users.getUserList(params.room,params.name));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
    console.log(`-------------------------->>>>>>>>>New user connected. ${params.name} jion room ${params.room}`);
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }

    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));  
    }
  });

  socket.on('disconnect', (params) => {

 

    //users.removeUser(socket.id);
    users.removeUserByUserName(params.name);

    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room,user.name));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
});


server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});

/* console.log("res is : "+ currency.currentNow());
console.log("cc res is : "+ cc.currentNow()); */

/* app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app}; */

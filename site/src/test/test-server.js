const express = require('../../server/node_modules/express');
const session = require('../../server/node_modules/express-session');
const socketserver = require('../../server/node_modules/websocket').server;

function TestServer() {
  let app = express();
  let clients = {}; // for websockets chat
  let count = 0; // for websockets chat
  let socket;

  app.use(function(req, res, next) {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Credentials", true);
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });

  let server = app.listen(3000, function() {
    let host = server.address().address;
    let port = server.address().port;
    console.log('####################');
    console.log('Test server started');
    console.log('####################');
  });

  socket = new socketserver({
    httpServer: server
  });

  socket.on('request', function(request) {
    let acceptConn = request.accept(null, request.origin);
  });

  socket.on('connect', function(connection) {
    console.log('##########################################');
    console.log('Websocket test server - client connected');
    console.log('##########################################');
    
    count++;
    connection.id = count;
    clients[count] = connection;

    connection.sendUTF(JSON.stringify({custom: 'Welcome. Logged in.', _id: 'custom_welcome'}));

    connection.on('message', function(message) {
      // 0: message
      // 1: chat name
      // 2: email
      let msg_parts = message.utf8Data.split(';');
      let message_text = msg_parts[0];
      let chat_name = msg_parts[1];
      let email = msg_parts[2];
      let uid = msg_parts[3];

      for(let i in clients) {
        clients[i].sendUTF(
          JSON.stringify({
            message: message_text,
            timestamp: new Date(),
            user_name: chat_name,
            uid: uid,
            _id: '42r2f34g3'
          })
        );
      }
    });

    connection.on('close', function(reasonCode, description) {
      for (let i in clients) {
        if (i == connection.id) {
          delete clients[i];
        }	else {
          //console.log( i );
        }
      }
    });

  });

  app.post('/admin/editmessage', function(req, res, next) {
    res.contentType('application/json');
    res.send({
      'edited': true
    });
  });

  TestServer.stop = function() {
    socket.shutDown();
    server.close(() => {
      //process.exit(0);
    });
  }

  process.on('SIGTERM', function() {
    socket.shutDown();
    server.close(() => {
      process.exit(0);
    });
  });

  return server;
}

module.exports = TestServer;

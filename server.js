const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const formatMessage = require('./tools/messages');
const formatMassage = require("./tools/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./tools/users");
const botName = " CHATCORD BOT";
const listDePointsDeRencontres = [];
const listDeRestaurantsChoisies = [];
const listDePositionDeUsers = [];




/**
 * Static folder 
 */


app.use(express.static(path.join(__dirname, 'public')));

/**
 * Run when a user is logged in
 */

io.on('connection', (socket) => {

  /**Con a utlisateur ce connecte au serveur */
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room, null);

    socket.join(user.room);

    // Welcome current user
    socket.broadcast
      .to(user.room)
      .emit(
        "message", formatMessage(botName, "Welcome to ChatCord! " + user.username));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    /**Récuperation du point de rencontre si existente**/
    console.log("P R envoie vers client " + getPOintDeREncontre(user.room))
    if (getPOintDeREncontre(user.room) != null) {
      var pr_input = getPOintDeREncontre(user.room)
      var lat = pr_input.lat
      var lon = pr_input.lon
      console.log("Chau : " + lat + " " + lon + "")
      io.to(user.room).emit('nouveauPointDeRencotre_DS', ({ lat, lon }));
      envoieListeDeRestarantsChoisies(user.room)
    }

  });
  console.log("Nouvelle connection au serveur " + socket);


  //Pour tout le monde 
  //io.emit('message',formatMassage('CHATBOT','Welcome to the serverChatBox'));

  //Ecute de message sur le chat  
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMassage(user.username, msg));


    console.log(listDeRestaurantsChoisies)
    envoieListeDeRestarantsChoisies(user.room)
    //io.to(user.room).emit("listDeRestaurantsChoisies",{list:listDeRestaurantsChoisies});
  });
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`));

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });

  /**Socket Points***/
  socket.on('nouveauPointDeRencotre', ({ lat, lon }) => {


    console.log(lat + lon)
    const user = getCurrentUser(socket.id);
    /**Enregistremment de un nouveau point de rencontre dans une room */
    insertionDeNouveuPointDeRencontre(user.room, lat, lon);

    io.to(user.room).emit('nouveauPointDeRencotre_DS', ({ lat, lon }));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} Ha change le point de rencontre`)
      );
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });




  });

  socket.on('changeMentDeMaPosition', ({ lat, lon }) => {

    console.log("Server  : " + lat + " " + lon);
    const user = getCurrentUser(socket.id);
    io.to(user.id).emit('changeMentDeMaPosition_DS', ({ lat, lon }));
    insertionDePositionDeUser(user.id, lat, lon)
    miseAjour()
  });


  socket.on('chengemmentDeRestaurant', (restaurant) => {
    const user = getCurrentUser(socket.id);
    io.to(user.id).emit('chengemmentDeRestaurant_DS')
    insertRestaurantToUser(user.id, restaurant)
    console.log("choix de restaurant : " + restaurant)
    miseAjour()
  });

 

  socket.on('miseAjour', (mqiseAjour) => {
    const user = getCurrentUser(socket.id);  
    io.to(user.room).emit('clean', user);
    miseAjour()
  });

  function miseAjour(){
    const user = getCurrentUser(socket.id);  
    if (getPOintDeREncontre(user.room) != null) {
      var pr_input = getPOintDeREncontre(user.room)
      var lat = pr_input.lat
      var lon = pr_input.lon
      console.log("Chau : " + lat + " " + lon + "")
      io.to(user.room).emit('nouveauPointDeRencotre_DS', ({ lat, lon }));
    }
    envoieListeDeRestarantsChoisies(user.room);
  }

    function envoieListeDeRestarantsChoisies(room) {
      var lisOfUsersRoom = getRoomUsers(room);
      for (var i = 0; i < lisOfUsersRoom.length; i++) {
        var user = lisOfUsersRoom[i];
        const userE = getCurrentUser(socket.id);
        if (listDeRestaurantsChoisies.hasOwnProperty(user.id) && user.id != userE.id) {
          var userID = user.id
          var restaurant = listDeRestaurantsChoisies[user.id];
          var latitud = getUserPosition(user.id).latitude;
          var lonitud = getUserPosition(user.id).longitude;
          io.to(user.room).emit('AjoutDeAssociationRestaurantETUser', ({ user: userID, userName: user.username, restautant: restaurant, lat: latitud, lon: lonitud }));

        }
      }
    }


  });




  const PORT = 3007 || process.env.PORT;
  server.listen(PORT, () => console.log("Server Edson listening on port " + PORT));



  function insertionDeNouveuPointDeRencontre(room, lat_input, lon_input) {
    var nouveauPointDeRencontre = { lat: lat_input, lon: lon_input }
    if (listDePointsDeRencontres.hasOwnProperty(room)) {
      listDePointsDeRencontres[room] = nouveauPointDeRencontre
      console.log("Ajout du point :" + lat_input + " " + lon_input)
    } else {
      listDePointsDeRencontres[room] = nouveauPointDeRencontre
      console.log("Ajout du point :" + lat_input + " " + lon_input)
    }
  }


  function getPOintDeREncontre(room) {
    if (listDePointsDeRencontres.hasOwnProperty(room)) {
      return listDePointsDeRencontres[room]
    } else {
      return null
    }
  }


  function insertRestaurantToUser(userID, restaurant) {

    if (listDeRestaurantsChoisies.hasOwnProperty(userID)) {
      listDeRestaurantsChoisies[userID] = restaurant
      console.log("Ajout de restaurant" + restaurant)
    } else {
      listDeRestaurantsChoisies[userID] = restaurant
      console.log("Ajout de restaurant :" + restaurant)
    }
  }

  function getRestaurantUser(userID) {
    if (listDeRestaurantsChoisies.hasOwnProperty(userID)) {
      return listDeRestaurantsChoisies[userID]
    } else {
      return null
    }
  }





  function insertionDePositionDeUser(userID, lat, lgn) {
    var position = { latitude: lat, longitude: lgn }
    if (listDePositionDeUsers.hasOwnProperty(userID)) {
      listDePositionDeUsers[userID] = position
      console.log("Ajout de position de user: " + position)
    } else {
      listDePositionDeUsers[userID] = position
      console.log("Ajout de position de user: " + position)
    }
  }

  function getUserPosition(userID) {
    if (listDePositionDeUsers.hasOwnProperty(userID)) {
      console.log(listDePositionDeUsers[userID])
      return listDePositionDeUsers[userID]
    } else {
      return null
    }
  }
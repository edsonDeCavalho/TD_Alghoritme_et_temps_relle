const users = [];

// Join user to chat
function userJoin(id, username, room, restaurant) {
  const user = { id, username, room ,restaurant};

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

function setUser(id,user) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
   users[index] = user;
  }
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  setUser,
  getRoomUsers
};
[{
  id: '/#12poiajdspfoif',
  name: 'Andrew',
  room: 'The Office Fans'
}]

// addUser(id, name, room)
// removeUser(id)
// getUser(id)
// getUserList(room)

class Users {
  constructor () {
    this.users = [];
  }

  addUser (id, name, room) {
    var user = {id, name, room};
    this.users.push(user);
    return user;
  }

  removeUser (id) {
    var user = this.getUser(id);
    if (user) {
      this.users = this.users.filter((user) => user.id !== id);
    }
    return user;
  }

  removeUserByUserName (usrName) {
    var user = this.getUserByName(usrName);
    if (user) {
      this.users = this.users.filter((user) => user.name !== usrName);
    }
    return user;
  }

  getUser (id) {
    return this.users.filter((user) => user.id === id)[0]
  }
  getUserByName(userName) {
    return this.users.filter((user) => user.name === userName)[0]
  }
 
  getUserList (room,userName) {
    var users = this.users.filter((user) =>  user.room === room);
 
    var namesArray = users.map((user) => {
      var usrName = user.name===userName?user.name+"(me)":user.name;
      return usrName;
    });
    return namesArray;
  }
}

module.exports = {Users};

 // class Person {
 //   constructor (name, age) {
 //     this.name = name;
 //     this.age = age;
 //   }
 //   getUserDescription () {
 //     return `${this.name} is ${this.age} year(s) old.`;
 //   }
 // }
 //
 // var me = new Person('Andrew', 25);
 // var description = me.getUserDescription();
 // console.log(description);

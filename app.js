const express = require("express");
const path = require("path");
const {MongoClient} = require("mongodb");
const hash = require('hash.js');
//for use on heroku
const herokuuri = `mongodb+srv://herokuhost:${process.env.mongodbKEY}@cluster0.utcj8.mongodb.net/<dbname>?retryWrites=true&w=majority`;
//for use locally
const key = require("./key.json");
const localuri = `mongodb+srv://${key.user}:${key.mongodbKEY}@cluster0.utcj8.mongodb.net/<dbname>?retryWrites=true&w=majority`;

const routes = require("./routes");

var app = express();

app.set("port", process.env.PORT || 3000);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, 'static')));
app.use(routes);

var server = app.listen(app.get("port"), () =>{
  console.log("server started on port " + app.get("port"));
});
const options = {};
const io = require("socket.io")(server, options);

let currUser = "";

io.on("connection", socket =>{
  socket.emit("news", {hello: "world"});

  socket.on("loginEvent", (data, callback) =>{
    tryLogin(data.user, data.pass).catch(console.dir).then(result =>{
      callback({ message: result });
    });
  });

  socket.on("signUpEvent", (data, callback) =>{
    trySignUp(data.user, data.pass).catch(console.dir).then(result =>{
      callback({ message: result });
    });
  });

  socket.on("saveEvent", (data, callback) =>{
    saveData(data.urls, data.times, data.dates).then(result =>{
      callback({ successful: result });
    });
  });

  socket.on("requestDataEvent", (data, callback)=>{
    getUserData().then(result =>{
      callback({ data: result });
    });
  });
});

async function trySignUp(username, password){
  retVal = "failed";
  password = hash.sha256().update(password).digest('hex');
  const client = new MongoClient(localuri);
  try {
    // Connect the client to the server
    await client.connect();
    const database = client.db("users");
    const collection = database.collection("users");
    const userCheck = await collection.findOne({
      username: username,
    }, options);
    if(userCheck == null){
      let newUser = {
        username: username,
        password: password,
        meetingData: {
          urls: [],
          times: [],
          dates: []
        }
      }
      const user = await collection.insertOne(newUser);
      if(user){
        currUser = username;
        retVal = "success";
      }
    }else{
      console.log("user with that name already exists");
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    return retVal;
  }
}

async function tryLogin(username, password){
  let retVal = "failed";
  password = hash.sha256().update(password).digest('hex');
  const client = new MongoClient(localuri);
  try {
    // Connect the client to the server
    await client.connect();
    const database = client.db("users");
    const collection = database.collection("users");
    const user = await collection.findOne({
      username: username,
      password: password
    }, options);
    if(user != null){
      currUser = username;
      retVal = "success";
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    return retVal;
  }
}

async function saveData(urls, times, dates){
  retVal = "failed";
  if(currUser === "") return retVal;
  const client = new MongoClient(localuri);
  try {
    // Connect the client to the server
    await client.connect();
    const database = client.db("users");
    const collection = database.collection("users");
    //check if user exists
    const user = await collection.findOne({
      username: currUser
    }, options);

    if(user != null){
      //update entries
      let newData = { //replacement data
        username: currUser,
        password: user.password,
        meetingData: {
          urls: urls,
          times: times,
          dates: dates
        }
      }
      let user2 = await collection.update({
        username: currUser
      }, newData);
      retVal = "success";
    } else {
      console.log("user not found");
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    return retVal;
  }
}

async function getUserData(){
  let data = { error: "none" };
  if(currUser === "") return { error: "user not logged in" };
  const client = new MongoClient(localuri);
  try {
    // Connect the client to the server
    await client.connect();
    const database = client.db("users");
    const collection = database.collection("users");
    const userCheck = await collection.findOne({
      username: currUser
    }, options);
    data = {
      urls: [],
      times: [],
      dates: []
    }

    if(userCheck != null){
      data.urls = userCheck.meetingData.urls;
      data.times = userCheck.meetingData.times;
      data.dates = userCheck.meetingData.dates;
    }
  }finally{
    await client.close();
    return data
  }
}

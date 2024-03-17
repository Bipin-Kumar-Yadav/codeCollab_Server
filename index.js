const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const server = http.createServer(app);
const auth = require('./routes/auth.route')
const profile = require('./routes/profile.route')
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
require("dotenv").config();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(process.env.DB_URL).then(()=>{console.log("DB Connection successfull")}).catch((err)=>{console.error("DB connection error",err)})

const allUsers = {};
function getAllConnectedClients(roomId) {
  // Map
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        userDetails: allUsers[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  var roomID = "";
  console.log("new user connected", socket.id);

  socket.on("join", ({ roomId, userDetails }) => {
    allUsers[socket.id] = userDetails;
    socket.join(roomId);
    roomID = roomId;
    console.log(roomID);
    const clients = getAllConnectedClients(roomId);
    io.to(roomId).emit("joined", "new User Connected", clients);
    // Emit the current code to the user who just joined
    const currentCode = getCodeForRoom(roomId);
    socket.emit("currentCode", currentCode);
  });

  socket.on("codeChange", (code) => {
    saveCodeForRoom(roomID, code);
    io.to(roomID).emit("codeChange", code);
  });

  socket.on("requestCurrentCode", (roomId) => {
    const currentCode = getCodeForRoom(roomId);
    // Emit the current code back to the requesting user
    socket.emit("currentCode", currentCode);
  });

  socket.on("disconnect", () => {
    const disconnectedUserDetails = allUsers[socket.id];
    delete allUsers[socket.id];
    console.log(roomID);
    // Notify all clients in the room about the disconnection
    const clients = getAllConnectedClients(roomID);
    console.log(clients);
    io.to(roomID).emit(
      "userDisconnected",
      "User Disconnected",
      clients,
      disconnectedUserDetails
    );

    socket.leave();
  });
});
const roomCodes = {};

// Function to get the current code for a room
function getCodeForRoom(roomId) {
  return roomCodes[roomId] || "";
}

// Function to save the new code for a room
function saveCodeForRoom(roomId, newCode) {
  roomCodes[roomId] = newCode;
}

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/api/auth",auth);
app.use("/api/profile",profile)

app.get("/", (req, res) => {
  res.send("hi");
});

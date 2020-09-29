const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs'); 
const path = require('path');
const imageRouter = require("./imageRouter");
const cors = require("cors");
const users={};
const socketToRoom={};
var files={},
struct={
    name:null,
    type:null,
    size:0,
    data:[],
    slice:0
}
app.use(express.json());
app.use(cors());
app.use("/upload", imageRouter);
app.get('/',(req,res)=>{
    res.send('captain JACKSPARROW...[ ^._.^ ]');
})
io.on("connection", (socket) => {
    socket.on("join", ({userName, roomID}) => {
        const time = getCurrentTime(socket);
        socket.join(roomID);
        socket.emit("join", time);
        socket.emit("message", { userName: "Admin", message: "You joined !" })
        socket.to(roomID).emit("message", { userName: "Admin", message: `${userName} has joined !` });
    });

    socket.on("message", ({ userName, message, roomID }) => {
        socket.to(roomID).emit("message", { userName, message });
    });
    socket.on('typing',({userName,roomID})=>{
      //  console.log("The username is",userName,roomID);
       socket.to(roomID).emit('typing',{userName})
    })

    socket.on("send-image", ({ userName, img, roomID }) => {
        socket.to(roomID).emit("send-image", { userName, img });
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("message", { userName: "Admin", message: "A user has left !"  });
    });
});
io.on('connection', socket => {
    socket.on("join room", roomID => {
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        socket.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });
    socket.on('slice upload', (data) => { 
        console.log('the data',data.roomID)
        if (!files[data.name]) { 
            files[data.name] = Object.assign({}, struct, data); 
            files[data.name].data = []; 
        }
        data.data = new Buffer.from(new Uint8Array(data.data)); 
        var convert=data.data.toString();
        io.to(data.roomID).emit("string file",({convert}));
        files[data.name].data.push(data.data); 
        files[data.name].slice++; 
        if (files[data.name].slice * 100000 >= files[data.name].size) { 
            socket.emit('end upload');
        } else { 
            socket.emit('request slice upload', { 
                currentSlice: files[data.name].slice 
            }); 
        } 
    });
    socket.on("send textfile",({link,roomID})=>{
        console.log("the download is",link)
        io.to(roomID).emit("send textfile",{link});
    })
    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });
    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    });

});
const getCurrentTime = (socket) => {
    return new Date();
}
module.exports = (env) => {
    const currentPath = path.join(__dirname);
        const basePath = currentPath + '/.env';
      const envPath = basePath + '.' + env.ENVIRONMENT;
      const finalPath = fs.existsSync(envPath) ? envPath : basePath;
      const fileEnv = dotenv.config({ path: finalPath }).parsed;
        const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
      prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
      return prev;
    }, {});
  
    return {
      plugins: [
        new webpack.DefinePlugin(envKeys)
      ]
    }
  }
const PORT =  5000;
server.listen(PORT, () => {
    console.log("Server listening on port", PORT);
});
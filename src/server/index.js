var app = require('http').createServer()
var io = module.exports.io = require('socket.io')(app)

// khởi tạo port để listen cho PJ
const PORT = process.env.PORT || 3231 
//Tạo một socket
const SocketManager = require('./SocketManager')
//Kết nối socket
io.on('connection', SocketManager)
//Port được mở và bắt đầu lắng nghe kết nối
app.listen(PORT, ()=>{
	console.log("Connected to port:" + PORT);
})
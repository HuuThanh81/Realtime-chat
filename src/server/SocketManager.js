const io = require('./index.js').io

const { VERIFY_USER, USER_CONNECTED, USER_DISCONNECTED, 
		LOGOUT, COMMUNITY_CHAT, MESSAGE_RECIEVED, MESSAGE_SENT,
		TYPING, PRIVATE_MESSAGE, NEW_CHAT_USER  } = require('../Events')

const { createUser, createMessage, createChat } = require('../Factories')

let connectedUsers = { }

let communityChat = createChat({ isCommunity:true })

module.exports = function(socket){
					
	console.log("Socket Id:" + socket.id);

	let sendMessageToChatFromUser;

	let sendTypingFromUser;

	//Xác minh người dùng.
	socket.on(VERIFY_USER, (nickname, callback)=>{
		if(isUser(connectedUsers, nickname)){
			callback({ isUser:true, user:null })
		}else{
			callback({ isUser:false, user:createUser({name:nickname, socketId:socket.id})})
		}
	})

	//người dùng kết nối với tên(nickname) vừa tạo
	socket.on(USER_CONNECTED, (user)=>{
		user.socketId = socket.id
		connectedUsers = addUser(connectedUsers, user)
		socket.user = user

		sendMessageToChatFromUser = sendMessageToChat(user.name)
		sendTypingFromUser = sendTypingToChat(user.name)

		io.emit(USER_CONNECTED, connectedUsers)
		console.log(connectedUsers);

	})
	
	//người dùng ngắt kết nối
	socket.on('disconnect', ()=>{
		if("user" in socket){
			connectedUsers = removeUser(connectedUsers, socket.user.name)

			io.emit(USER_DISCONNECTED, connectedUsers)
			console.log("Disconnect", connectedUsers);
		}
	})


	//người dùng thoát
	socket.on(LOGOUT, ()=>{
		connectedUsers = removeUser(connectedUsers, socket.user.name)
		io.emit(USER_DISCONNECTED, connectedUsers)
		console.log("Disconnect", connectedUsers);

	})

	//cuộc trò chuyện cộng đồng
	socket.on(COMMUNITY_CHAT, (callback)=>{
		callback(communityChat)
	})

	socket.on(MESSAGE_SENT, ({chatId, message})=>{
		sendMessageToChatFromUser(chatId, message)
	})

	socket.on(TYPING, ({chatId, isTyping})=>{
		sendTypingFromUser(chatId, isTyping)
	})

	socket.on(PRIVATE_MESSAGE, ({reciever, sender, activeChat})=>{
		if(reciever in connectedUsers){
			const recieverSocket = connectedUsers[reciever].socketId
			if(activeChat === null || activeChat.id === communityChat.id){
				const newChat = createChat({ name:`${reciever}&${sender}`, users:[reciever, sender] })
				socket.to(recieverSocket).emit(PRIVATE_MESSAGE, newChat)
				socket.emit(PRIVATE_MESSAGE, newChat)
			}else{
				if(!(reciever in activeChat.users)){
					activeChat.users
										.filter( user => user in connectedUsers)
										.map( user => connectedUsers[user] )
										.map( user => {
												socket.to(user.socketId).emit(NEW_CHAT_USER, { chatId: activeChat.id, newUser: reciever })
										} )
										socket.emit(NEW_CHAT_USER, { chatId: activeChat.id, newUser: reciever } )
				}
				socket.to(recieverSocket).emit(PRIVATE_MESSAGE, activeChat)
			}
		}
	})

}
/*
* return về một hàm để lấy cuộc trò chuyện boolean isTyping
* sau đó phát thông điệp đến một chương trình id mà người nhập đang nhập
* @param sender {string} tên người gửi tin nhắn
* @return function(chatId, message)
*/
function sendTypingToChat(user){
	return (chatId, isTyping)=>{
		io.emit(`${TYPING}-${chatId}`, {user, isTyping})
	}
}

/*
* return về một hàm nhận id của cuộc trò chuyện và tin nhắn.
* sau đó phát một broadcast đến id của cuộc trò chuyện.
* @param sender {string} tên người gửi tin nhắn.
* @return function(chatId, message)
*/
function sendMessageToChat(sender){
	return (chatId, message)=>{
		io.emit(`${MESSAGE_RECIEVED}-${chatId}`, createMessage({message, sender}))
	}
}

/*
* thêm user vào danh sách onl
* @param userList {Object} 	đối tượng có chứa giá trị của người dùng
* @param user {User} người dùng để them vào danh sách
* @return userList {Object} trả về danh sách có chứa giá trị người dùng.
*/
function addUser(userList, user){
	let newList = Object.assign({}, userList)
	newList[user.name] = user
	return newList
}

/*
* xóa người dùng ra khỏi danh sách onl
* @param userList {Object} đối tượng chứa giá trị người dùng
* @param username {string} tên của người dùng bị xóa khỏi  danh sách
* @return userList {Object} trả về danh sách mới khi đã xóa người dùng
*/
function removeUser(userList, username){
	let newList = Object.assign({}, userList)
	delete newList[username]
	return newList
}

/*
* kiểm tra người dùng có trinig danh sách
* @param userList {Object} 
* @param username {String}
* @return userList {Object} 
*/
function isUser(userList, username){
  	return username in userList
}
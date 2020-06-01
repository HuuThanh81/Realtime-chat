const uuidv4 = require('uuid/v4')

/*
*	Tạo mới một User
*	@prop id {string}
*	@prop name {string}
*	@param {object} 
*		name {string}
*/
const createUser = ({name = "", socketId = null } = {})=>(
	{
		id:uuidv4(),
		name,
		socketId
		
	}
)

/*
*	Tạo mới tin nhắn
* 	@prop id {string}
* 	@prop time {Date} định dạng ngày giờ theo dạng 14:22
* 	@prop message {string} chuỗi tin nhắn được tạo
* 	@prop sender {string} gửi chuỗi tin nhắn vừa tạo
*	@param {object} 
*		message {string}
*		sender {string}
*/
const createMessage = ({message = "", sender = ""} = { })=>(
		{
			id:uuidv4(),
			time:getTime(new Date(Date.now())),
			message,
			sender	
		}

	)

/*
*	Tạo cuộc trò chuyện
* 	@prop id {string}
* 	@prop name {string}
* 	@prop messages {Array.Message}
* 	@prop users {Array.string}
*		@prop typingUsers {Array.string}
*		@prop isCommunity {boolean}
*	@param {object} 
*		messages {Array.Message}
*		name {string}
*		users {Array.string}
* 
*/
const createChat = ({messages = [], name = "Cộng Đồng", users = [], isCommunity = false} = {})=>(
	{
		id:uuidv4(),
		name: isCommunity ? name : createChatNameFromUsers(users),
		messages,
		users,
		typingUsers:[],
		isCommunity
	}
)

/*
* Tạo cuộc trò chuyện với một người trong list
* @param users {Array.string} 
* @param excludedUser {string} người dùng tạo cuộc trò chuyện với người hiển thị trong danh sách onl
* @return {string} 
*/
const createChatNameFromUsers = (users, excludedUser = "") => {
	return users.filter(u => u !== excludedUser).join(' & ') || "Empty Chat"
}

/*
*	Định dạng ngày ngày và giờ
*	@param date {Date}
*	@return  '11:30', '19:30'
*/
const getTime = (date)=>{
	return `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`
}

module.exports = {
	createMessage,
	createChat,
	createUser,
	createChatNameFromUsers
}


const asyncHandler = require('express-async-handler');
const { successResponse, SuccessWithoutBody, PrintError, verifyrequiredparams, sendNotification } = require('../middleware/common');
const User = require('../schemas/User');
const Socket = require('../schemas/Socket');


const socketMongoPOST = async (socket_id, user_id = null, type) => {
    try {
        if (type == "create" && user_id != null) {
            const check = await Socket.findOne({ user_id });
            if (check) {
                const socket = await Socket.updateOne({ user_id }, { $set: { socket_id: socket_id } })
                const check = await Socket.findOne({ user_id });
                return check;
            }
            else {
                const socket = await Socket.create({ user_id, socket_id })
                return socket;
            }
        }
        if (type == "delete") {
            await Socket.deleteOne({ user_id })
        }
    }
    catch (error) {
        console.log(error)
    }
}

const getSocketUsingSocket_id = async (socket_id = null, user_id = null) => {
    try {
        let socket
        // console.log(user_id);
        if (socket_id == null && user_id != null) {
            socket = await Socket.findOne({ user_id: user_id });
            return socket?.socket_id != undefined && socket?.socket_id != null ? socket.socket_id : "";
        }
        if (user_id == null && socket_id != null) {
            socket = await Socket.findOne({ socket_id: socket_id });
            return socket?.socket_id != undefined && socket?.socket_id != null ? socket.socket_id : "";
            // return socket.user_id;
        }
        else {
            socket = await Socket.findOne({ socket_id: socket_id, user_id: user_id });
            return socket?.socket_id != undefined && socket?.socket_id != null ? socket.socket_id : "";
            // return socket.user_id;

        }
    }
    catch (error) {
        console.log(error)
    }
}



const getuser_idFromSocket_id = async (socket_id = null) => {
    try {
        const socket = await Socket.findOne({ socket_id });
        console.log(socket);
        console.log(socket_id);
        return socket?.user_id;
    }
    catch (error) {
        console.log(error)
    }
}

const deleteAll = async () => {
    const socket = await Socket.deleteMany();

}


const getUserTypeByUserId = async (user_id) => {
    const user = await User.findById(user_id);
    return user?.user_type;
}


const getUserByUserId = async (user_id) => {
    const user = await User.findById(user_id);
    return user;
}



const sendNotificationUserOffline = async (user_id, notification_obj) => {
    console.log(user_id);
    console.log(notification_obj);
    console.log(await sendNotification(user_id, notification_obj))
    return false;
}


module.exports = { socketMongoPOST, getSocketUsingSocket_id, deleteAll, getuser_idFromSocket_id, getUserTypeByUserId, sendNotificationUserOffline, getUserByUserId }
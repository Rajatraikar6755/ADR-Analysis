const userSockets = new Map();
let ioInstance = null;

module.exports = {
    setIo: (io) => {
        ioInstance = io;
    },
    getIo: () => ioInstance,
    userSockets,
    emitToUser: (userId, event, data) => {
        if (!ioInstance) return false;
        const socketId = userSockets.get(userId);
        if (socketId) {
            ioInstance.to(socketId).emit(event, data);
            return true;
        }
        return false;
    }
};

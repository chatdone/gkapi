import { Server, Socket } from 'socket.io';

const setupSocketHandlers = async (io: Server, socket: Socket) => {
  if (io) {
    // testHandler(socketServer, socket);
  }
};

export default {
  setupSocketHandlers,
};

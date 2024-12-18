import { Server, Socket } from 'socket.io';

const handler = (io: Server, socket: Socket) => {
  const startTest = (payload: unknown) => {
    console.log('start test', payload);
  };

  const stopTest = (payload: unknown) => {
    console.log('stop test', payload);
  };

  socket.on('test:start', startTest);
  socket.on('test:stop', stopTest);
};

export default handler;

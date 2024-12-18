import { Server, Socket } from 'socket.io';

import { fetchAuth0UserProfile } from '@utils/auth0.util';
import { UserStore } from '@data-access';
import _ from 'lodash';
import { redis } from '@data-access';

let socketServer: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  'message:show': (message: string) => void;
  'task:update': (taskId: string) => void;
  'attendance:start': (memberId: string) => void;
  'attendance:stop': (memberId: string) => void;
  'user:logout': () => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  user: string;
  accessToken: string;
}

const setupSocketServer = (
  expressServer: Express.Application,
  corsOrigins: string[],
) => {
  socketServer = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(expressServer, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
    },
  });

  if (!socketServer) {
    return;
  }

  socketServer.use(async (socket: Socket, next) => {
    const { token } = socket.handshake.auth;

    if (!token) {
      return next(new Error('Unauthorized'));
    }

    const cacheKey = `socket:${socket.id}:${token}`;

    try {
      const cachedUser = await redis.get(cacheKey);
      let user;

      if (cachedUser) {
        user = cachedUser;
      } else {
        const result = await fetchAuth0UserProfile(token);
        if (!result) {
          return next(new Error('Unauthorized'));
        }

        const { email } = result;

        user = await UserStore.getUserWithCompaniesByEmail(email);

        await redis.setNeverExpire(cacheKey, user);
      }

      socket.data.user = user;
      socket.data.timestamp = Date.now();
    } catch (error) {
      return next(new Error('Unauthorized'));
    }

    next();
  });

  socketServer.on('connection', (socket) => {
    if (socketServer) {
      setupConnection(socketServer, socket);
    }
  });
};

const setupConnection = async (io: Server, socket: Socket) => {
  if (
    process.env.GK_ENVIRONMENT === 'development' ||
    process.env.GK_ENVIRONMENT === 'sandbox'
  ) {
    console.log('connected to', socket.data.user?.email);
    console.log('socket id:', socket.id);
  }

  socket.conn.on('close', async (reason) => {
    if (
      process.env.GK_ENVIRONMENT === 'development' ||
      process.env.GK_ENVIRONMENT === 'sandbox'
    ) {
      console.log('socket closed with reason', reason);
    }

    const cacheKey = `*socket:${socket.id}:*`;
    await redis.deleteKeysByPattern(cacheKey);
  });
};

export { setupSocketServer, socketServer };

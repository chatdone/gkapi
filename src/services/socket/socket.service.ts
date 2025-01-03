import { CompanyStore, TaskStore, UserStore } from '@data-access';
import { CompanyId } from '@models/company.model';
import { TaskId, TaskPicModel, TaskPublicId } from '@models/task.model';
import { UserId, UserModel } from '@models/user.model';
import { socketServer } from '@sockets';
import _ from 'lodash';

const getSocketsForUserEmail = async (email: string) => {
  const sockets = await socketServer?.fetchSockets();

  const socket = _.filter(
    sockets,
    (s) => _.get(s.data.user, 'email') === email,
  );

  return socket;
};

const getSocketsForUserId = async (id: UserId) => {
  const sockets = await socketServer?.fetchSockets();

  const socket = _.filter(sockets, (s) => _.get(s.data.user, 'id') === id);

  return socket;
};

const sendMessageToUser = async (id: UserId, message: string) => {
  const user = await UserStore.getUserById(id);
  if (!user) {
    throw new Error('User not found');
  }

  const sockets = await getSocketsForUserEmail(user.email);

  _.forEach(sockets, (socket) => {
    socket.emit('message:show', message);
  });
};

const notifyTaskUpdated = async (input: {
  taskId: TaskId;
  companyId: CompanyId;
}) => {
  try {
    const { taskId, companyId } = input;
    const task = _.head(await TaskStore.getTasksById({ ids: [taskId] }));

    const pics = (await TaskStore.getTaskPicsByTaskId({
      taskId,
    })) as TaskPicModel[];
    const picUserIds = _.map(pics, 'userId');

    const sockets = await socketServer?.fetchSockets();
    if (!sockets) {
      return;
    }
    const filteredSockets = sockets.filter((s) => {
    // const socketUserCompanyIds = _.get(s.data.user, 'companyIds');
    const socketUserCompanyIds = _.get(s.data.user, 'companyIds') as unknown as (CompanyId | null)[];
    const socketUserId = _.get(s.data.user, 'id') ?? 0;
    // const socketUserId = _.get(s.data.user, 'id');

  return (
    (socketUserCompanyIds && socketUserCompanyIds.includes(companyId)) ||
    picUserIds.includes(socketUserId)
  );
});

    // const filteredSockets = sockets.filter((s) => {
    //   const socketUserCompanyIds = _.get(s.data.user, 'companyIds');
    //   const socketUserId = _.get(s.data.user, 'id');

    //   return (
    //     socketUserCompanyIds.includes(companyId) ||
    //     picUserIds.includes(socketUserId)
    //   );
    // });

    _.forEach(filteredSockets, (socket) => {
      socket.emit('task:update', task.idText);
    });
  } catch (error) {
    // return Promise.reject(error);
  }
};

const notifyAttendanceStarted = async ({ user }: { user: UserModel }) => {
  try {
    const sockets = await socketServer?.fetchSockets();
    if (!sockets) {
      return;
    }

    const userSockets = await exportFunctions.getSocketsForUserId(user.id);

    _.forEach(userSockets, (socket) => {
      socket.emit('attendance:start', JSON.stringify({ userId: user.idText }));
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const notifyAttendanceStopped = async ({
  user,
  message,
}: {
  user: UserModel;
  message: string | null;
}) => {
  try {
    const sockets = await socketServer?.fetchSockets();
    if (!sockets) {
      return;
    }

    const userSockets = await exportFunctions.getSocketsForUserId(user.id);
    _.forEach(userSockets, (socket) => {
      socket.emit(
        'attendance:stop',
        JSON.stringify({ userId: user.idText, message }),
      );
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const forceUserLogout = async ({ user }: { user: UserModel }) => {
  try {
    const sockets = await socketServer?.fetchSockets();
    if (!sockets) {
      return;
    }

    const userSockets = await exportFunctions.getSocketsForUserId(user.id);
    _.forEach(userSockets, (socket) => {
      socket.emit('user:logout');
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportFunctions = {
  getSocketsForUserEmail,
  getSocketsForUserId,
  sendMessageToUser,
  notifyTaskUpdated,
  notifyAttendanceStarted,
  notifyAttendanceStopped,
  forceUserLogout,
};

export default exportFunctions;

import { ApolloServer, gql } from 'apollo-server-express';
import schema from '@graphql/schemasMap';
import fixtures from '@test/fixtures';
import { TaskService } from '@services';
import {
  getCompanyTeam,
  getTaskBoard,
  getTasks,
  getProject,
} from '@data-access/getters';
import { TaskBoardModel, TaskModel } from '@models/task.model';
import { createLoaders } from '@data-access';
import { TeamModel } from '@models/team.model';
jest.mock('@data-access/getters');
jest.mock('@services');

const mockUser = fixtures.generateCustom('user', {
  activeCompany: 177,
  companyIds: [23, 78, 387],
});

const testServer = new ApolloServer({
  schema,
  context: () => {
    return {
      auth: {
        user: mockUser,
        isAuthenticated: true,
      },
    };
  },
});

describe('task.schema', () => {
  describe('toggleTasksPinned', () => {
    test('it should toggle the pinned status of the task', async () => {
      try {
        const mockTasks = fixtures.generate('task', 3) as TaskModel[];

        (getTasks as jest.Mock).mockResolvedValue(mockTasks);

        (TaskService.toggleTasksPinned as jest.Mock).mockResolvedValue(
          mockTasks,
        );

        const result = await testServer.executeOperation({
          query: gql`
            mutation ToggleTasksPinned($taskIds: [ID!]!) {
              toggleTasksPinned(taskIds: $taskIds) {
                id
                pinned
              }
            }
          `,
          variables: {
            taskIds: mockTasks.map((task) => task.id_text),
          },
        });

        expect(TaskService.toggleTasksPinned).toBeCalledWith({
          taskIds: mockTasks.map((t) => t.id),
          userId: mockUser.id,
        });
        expect(result.errors).toBeUndefined();
      } catch (error) {
        console.error(error);
      }
    });
  });

  describe('createTask', () => {
    test('it should create a task with camelized inputs', async () => {
      const mt = fixtures.generate('task') as TaskModel;
      const mb = fixtures.generate('taskBoard') as TaskBoardModel;
      const mockTask = { ...mt, job_id: mb.id, jobId: mb.id };
      const mockBoard = { ...mb, team_id: mockTask.team_id };
      const mockTeam = { id: mockTask.team_id } as TeamModel;

      (getTaskBoard as jest.Mock).mockResolvedValue(mockBoard);
      (getProject as jest.Mock).mockResolvedValue(mockBoard);
      (getCompanyTeam as jest.Mock).mockResolvedValue(mockTeam);

      try {
        const result = await testServer.executeOperation({
          query: gql`
            mutation CreateTask($input: TaskInput!) {
              createTask(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: mockTask.name,
              description: mockTask.description,
              jobId: mockTask.job_id,
              job_id: mockTask.job_id,
              teamId: mockTask.team_id,
              team_id: mockTask.team_id,
              dueDate: mockTask.due_date,
              plannedEffort: 45,
              projectedCost: 85,
              subStatusId: 'aeiou',
              startDate: mockTask.start_date,
              endDate: mockTask.end_date,
            },
          },
        });
        //TODO: Fix this test
        // expect(TaskService.createTask).toBeCalledWith({
        //   user: mockUser,
        //   payload: {
        //     name: mockTask?.name,
        //     description: mockTask?.description,
        //     value: mockTask?.value,
        //     priority: mockTask?.priority,
        //     plannedEffort: 45,
        //     subStatusId: 'aeiou',
        //     dueDate: mockTask?.due_date,
        //     createdBy: mockUser.id,
        //     jobId: mockTask.job_id,
        //     teamId: mockTask.team_id,
        //     startDate: mockTask.start_date,
        //     endDate: mockTask.end_date,
        //     projectedCost: 85,
        //   },
        // });

        expect(result.errors).toBeUndefined();
      } catch (error) {
        console.error(error);
      }
    });
  });
});

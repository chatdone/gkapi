import { gql } from 'apollo-server-express';

export const schema = gql`
  """
  Task Board refers to job in DB
  """
  type TaskBoard {
    id: ID
    company: Company
    tasks(limit: Int, offset: Int, filters: FilterOptions): [Task]
    contact: Contact
    # team: Team
    type: TaskBoardType
    category: TaskBoardCategory
    name: String
    description: String
    comment: String
    color: String
    """
    Not the same kind of status in Task
    """
    status: TaskBoardStatusType
    slug: String
    archived: Boolean
    owners: [TaskBoardOwner]
    members: [TaskMember]
    value: Int
    createdAt: DateTime
    updatedAt: DateTime
    archivedAt: DateTime
    deletedAt: DateTime
    associateBy: User
    createdBy: User
    updatedBy: User
    deletedBy: User
    timeSpent: Int
    startDate: DateTime
    endDate: DateTime
    taskBoardTeams: [TaskBoardTeam]
    folder: TaskBoardFolder
    groups(groupQuery: GroupQuery): [ProjectGroup]
    workspace: Workspace

    visibility: CommonVisibility
    visibilityWhitelist: CommonVisibilityWhitelist
    pinned: Boolean
    published: Boolean
    projectSettings: ProjectSettings
    projectStatuses: [ProjectStatus]
    archivedBy: User

    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    deleted_at: DateTime #deprecated
    associate_by: User #deprecated
    created_by: User #deprecated
    updated_by: User #deprecated
    deleted_by: User #deprecated
    time_spent: Int #deprecated
    start_date: DateTime #deprecated
    end_date: DateTime #deprecated
    task_board_teams: [TaskBoardTeam] #deprecated
  }

  input GroupQuery {
    limit: Int
    offset: Int
    taskQuery: [GroupTaskQuery]
  }

  input GroupTaskQuery {
    limitTasks: Int
    offsetTask: Int
    groupId: ID
  }

  type TaskBoardFolder {
    id: ID
    name: String
    taskBoards: [TaskBoard]
    createdAt: DateTime
    updatedAt: DateTime
    createdBy: User
    updatedBy: User
  }

  type PaginatedTaskBoards {
    taskBoards: [TaskBoard]
    total: Int
  }

  input SetTaskBoardVisibilityInput {
    boardId: ID!
    visibility: TaskBoardVisibility!
  }

  input CreateTaskBoardFolderInput {
    name: String!
    type: TaskBoardFolderType!
  }

  input UpdateTaskBoardFolderInput {
    folderId: ID!
    name: String!
  }

  input AssignTaskBoardsToFolderInput {
    folderId: ID!
    boardIds: [ID!]!
  }

  input RemoveTaskBoardsFromFolderInput {
    boardIds: [ID!]!
  }

  input AddToVisibilityWhitelistInput {
    boardId: ID!
    memberIds: [ID!]
    teamIds: [ID!]
  }

  input RemoveFromVisibilityWhitelistInput {
    boardId: ID!
    memberIds: [ID!]
    teamIds: [ID!]
  }

  input TaskBoardFilter {
    dueDateRange: [DateTime!]
    memberOwnerIds: [ID!]
    memberAssigneeIds: [ID!]
    tagIds: [ID!]
    isOverdue: Boolean
    boardType: TaskBoardType
    category: TaskBoardCategory
  }

  enum TaskBoardSortType {
    CREATED_AT
    NAME
  }

  enum ProjectInvoiceSortType {
    CREATED_AT
    NAME
  }

  enum TaskBoardFolderType {
    INTERNAL
    PERSONAL
    COLLABORATION
    PROJECT
  }

  enum TaskBoardVisibility {
    HIDDEN # Not shown (not selectable from UI)
    PUBLIC # Visible to all within the company
    ASSIGNED # Visible to teams, members and PICs assigned
    SPECIFIC # Manually-specified list of teams and members allowed
    PRIVATE # Only visible to the owner of the entity
  }

  extend type Query {
    taskBoard(id: ID!): TaskBoard
    taskBoards(
      companyId: ID!
      type: TaskBoardType!
      limit: Int
      category: TaskBoardCategory
      filters: TaskBoardFiltersOptions
    ): [TaskBoard]

    taskBoardsV3(
      filter: TaskBoardFilter
      sort: TaskBoardSort
      limit: Int
      offset: Int
    ): PaginatedTaskBoards

    taskBoardTeams(
      companyId: ID!
      type: TaskBoardType!
      category: TaskBoardCategory
    ): [TaskBoardTeam]

    taskBoardFolders(type: TaskBoardFolderType!): [TaskBoardFolder]
  }

  extend type Mutation {
    createTaskBoard(input: TaskBoardInput!): TaskBoard
    createTaskBoardTeam(input: TaskBoardTeamInput!): TaskBoardTeam
    deleteTaskBoards(ids: [ID]!): [TaskBoard]
    deleteTaskBoardTeams(ids: [ID]!, isV3: Boolean): [TaskBoardTeam]
    updateTaskBoard(id: ID!, input: TaskBoardUpdateInput!): TaskBoard
    updateTaskBoardsArchivedState(
      input: UpdateTaskBoardsArchivedStateInput!
    ): [TaskBoard]

    setTaskBoardVisibility(input: SetTaskBoardVisibilityInput!): TaskBoard
    toggleTaskBoardPinned(boardId: ID!): TaskBoard
    toggleTaskBoardsPinned(boardIds: [ID!]!): [TaskBoard]

    addToVisibilityWhitelist(input: AddToVisibilityWhitelistInput!): TaskBoard
    removeFromVisibilityWhitelist(
      input: RemoveFromVisibilityWhitelistInput!
    ): TaskBoard

    createTaskBoardFolder(input: CreateTaskBoardFolderInput!): TaskBoardFolder
    updateTaskBoardFolder(input: UpdateTaskBoardFolderInput!): TaskBoardFolder
    deleteTaskBoardFolder(folderId: ID!): TaskBoardFolder
    assignTaskBoardsToFolder(
      input: AssignTaskBoardsToFolderInput!
    ): TaskBoardFolder
    removeTaskBoardsFromFolder(
      input: RemoveTaskBoardsFromFolderInput!
    ): [TaskBoard]
  }
`;

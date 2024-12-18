import { gql } from 'apollo-server-express';
import { schema as taskBoardSchema } from './task-board.schema';

export const schema = gql`
  scalar DateTime
  scalar Upload
  """
  Task refers to "card" in DB
  """
  type Task {
    id: ID!
    name: String
    description: String
    value: Float
    dueDate: DateTime
    dueReminder: DateTime
    startDate: DateTime
    endDate: DateTime
    fileType: String
    actualStart: DateTime
    actualEnd: DateTime
    plannedEffort: Int ## in minutes
    spentEffort: Int
    projectedCost: Float ## DEPRECATED, now called projectedValue
    actualCost: Float ##DEPRECATED, now called actualValue
    projectedValue: Float
    actualValue: Float
    approvedCost: Float ## Total approved cost using members hourly rate
    """
    Total of hourly rate * timesheet approval hour of all members under that task(see Time Approval page on FE)
    """
    totalRate(dates: [TaskQueryTotalRate!]!): Float
    """
    if a card has a sub_status_id = 50 and status = 2, in card_statuses it will be id = 50 and parent_status = 2
    """
    companyTeamStatus: CompanyTeamStatus
    """
    To get sub_status_id
    """
    taskActivities: [TaskActivity]
    createdAt: DateTime
    parentTask: Task
    childTasks: [Task]
    updatedAt: DateTime
    deletedAt: DateTime
    createdBy: User
    archivedAt: DateTime
    archivedBy: User
    taskBoardTeam: TaskBoardTeam
    taskBoard: TaskBoard
    project: TaskBoard
    companyTeam: CompanyTeam
    timeSpent: Int
    timeSpentMember: Int
    timesheets: [Timesheet]
    timerTotals: [TaskTimerTotal]
    completed: Boolean
    archived: Boolean
    comments(limit: Int, offset: Int): [TaskComment]
    members: [TaskMember]
    watchers: [TaskWatcher]
    pics: [TaskPic]
    subtasks(limit: Int, offset: Int): [Subtask] ### TODO: Deprecate this and use checklist instead, new subtask is just another task now
    checklists(limit: Int, offset: Int): [Checklist]
    attachments: [TaskAttachment]
    group: ProjectGroup
    projectStatus: ProjectStatus
    customValues: [TaskCustomValue]
    """
    To be deprecated and replace by stageStatus
    """
    status: CompanyTeamStatusType
    stageStatus: StageType
    """
    Type is deprecated as of 2021/10/13, will always be "Task"
    """
    type: TaskType
    company: Company
    """
    2022/01/12 - Specifically for task activity tracker, but may be available to normal task in the future
    """
    priority: TaskPriorityType
    templateTask: TaskTemplate
    tags: [Tag]
    pinned: Boolean
    visibility: CommonVisibility
    visibilityWhitelist: CommonVisibilityWhitelist
    published: Boolean
    posY: Int
    actualEffort: Float

    due_date: DateTime #deprecated
    due_reminder: DateTime #deprecated
    start_date: DateTime #deprecated
    end_date: DateTime #deprecated
    file_type: String #deprecated
    actual_start: DateTime #deprecated
    actual_end: DateTime #deprecated
    planned_effort: Int #deprecated
    spent_effort: Int #deprecated
    projected_cost: Float #deprecated
    actual_cost: Float #deprecated
    company_team_status: CompanyTeamStatus #deprecated
    task_activities: [TaskActivity] #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    deleted_at: DateTime #deprecated
    created_by: User #deprecated
    task_board_team: TaskBoardTeam #deprecated
    task_board: TaskBoard #deprecated
    company_team: CompanyTeam #deprecated
    time_spent: Int #deprecated
    timer_totals: [TaskTimerTotal] #deprecated
  }

  input TaskQueryTotalRate {
    day: Int!
    month: Int!
    year: Int!
  }

  type TaskBoardTeam {
    id: ID!
    tasks: [Task]
    companyTeam: CompanyTeam
    company_team: CompanyTeam #deprecated
  }

  type TaskAttachment {
    id: ID!
    type: String
    encoding: String
    name: String
    url: String
    path: String
    createdBy: User
    isDeleted: Boolean

    fileSize: Int
    documentHash: String
    createdAt: DateTime

    isExternal: Boolean
    externalSource: ExternalFileSource

    file_size: Int #deprecated
    document_hash: String #deprecated
    created_at: DateTime #deprecated
  }

  type TaskMember {
    id: ID!
    task: Task
    user: User
    companyMember: CompanyMember
    company_member: CompanyMember #deprecated
  }

  type TaskPic {
    id: ID!
    task(isProject: Boolean): Task
    contact: Contact
    pic: ContactPic
    user: User
  }

  ## This is now a child task, not a "checklist" item like before
  type Subtask {
    id: ID!
    title: String
    checked: Boolean
    sequence: Int
    task: Task ## Task version
  }

  type Checklist {
    id: ID!
    title: String
    checked: Boolean
    sequence: Int
    task: Task ## Task version
  }

  type TaskComment {
    id: ID!
    message: String
    task: Task
    parentTaskComment: TaskComment
    messageContent: String
    attachments: [TaskAttachment]

    createdAt: DateTime
    updatedAt: DateTime
    deletedAt: DateTime
    createdBy: User
    updatedBy: User
    deletedBy: User

    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    deleted_at: DateTime #deprecated
    created_by: User #deprecated
    updated_by: User #deprecated
    deleted_by: User #deprecated
  }

  # WIP - TaskActivity is "card_activities"
  type TaskActivity {
    id: ID!
    task: Task
    attachment: TaskAttachment

    fieldName: String
    actionType: String
    fromValueTo: String
    toValue: String
    fromDate: DateTime
    toDate: DateTime
    fromLabel: String
    toLabel: String
    targetPic: ContactPic
    targetMember: CompanyMember
    fromCardStatus: CompanyTeamStatus
    toCardStatus: CompanyTeamStatus
    createdBy: User
    createdAt: DateTime

    field_name: String #deprecated
    action_type: String #deprecated
    from_value_to: String #deprecated
    to_value: String #deprecated
    from_date: DateTime #deprecated
    to_date: DateTime #deprecated
    from_label: String #deprecated
    to_label: String #deprecated
    target_pic: ContactPic #deprecated
    target_member: CompanyMember #deprecated
    from_card_status: CompanyTeamStatus #deprecated
    to_card_status: CompanyTeamStatus #deprecated
    created_by: User #deprecated
    created_at: DateTime #deprecated
  }

  type TaskTimerEntry {
    task: Task

    companyMember: CompanyMember
    startDate: DateTime
    endDate: DateTime
    createdAt: DateTime
    updatedAt: DateTime
    timeTotal: Int

    company_member: CompanyMember #deprecated
    start_date: DateTime #deprecated
    end_date: DateTime #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    time_total: Int #deprecated
  }

  type TaskTimerTotal {
    companyMember: CompanyMember
    memberTotal: Int

    company_member: CompanyMember #deprecated
    member_total: Int #deprecated
  }

  type TaskBoardOwner {
    board: TaskBoard
    companyMember: CompanyMember
  }

  type TaskWatcher {
    task: Task
    companyMember: CompanyMember
  }

  type PaginatedTasks {
    tasks: [Task]
    total: Int
  }

  type ImportTasksResponse {
    imported: Int
    failed: Int
    tasks: [Task!]
  }

  enum TaskBoardCategory {
    DEFAULT
    PROJECT
  }

  enum TaskBoardStatusType {
    PROGRESS
    DONE
    CANCELLED
  }

  enum TaskPriorityType {
    LOW
    MEDIUM
    HIGH
  }

  enum TaskDueRemindersType {
    ON_DUE
    FIVE_M
    TEN_M
    FIFTEEN_M
    ONE_HOUR
    TWO_HOUR
    ONE_DAY
    TWO_DAY
  }

  enum TaskBoardType {
    INTERNAL
    PERSONAL
    COLLABORATION
    COMPANY
    ALL
  }

  enum PersonalStatusType {
    PENDING
    PASS
    FAIL
    CLOSED
  }

  enum TaskType {
    TASK
    DOCUMENT
  }

  enum ExternalFileSource {
    ONE_DRIVE
    GOOGLE_DRIVE
    DROPBOX
  }

  enum TaskActionType {
    TASK_CREATED
    TASK_ARCHIVED
    TASK_UNARCHIVED
    TASK_REMOVED
    UPDATED_DUE_DATE
    UPDATED_START_DATE
    UPDATED_END_DATE
    UPDATED_TEAM_STATUS
    ASSIGNEE_ADDED
    ASSIGNEE_REMOVED
    PIC_ADDED
    PIC_REMOVED
    ATTACHMENT_UPLOADED
    ATTACHMENT_REMOVED
  }

  input TaskInput {
    name: String!
    description: String
    value: Float
    priority: TaskPriorityType
    tagIds: [ID!]
    posY: Int
    groupId: ID
    projectStatusId: ID

    parentId: ID

    jobId: ID # to be deprecated
    workspaceId: ID # TODO: TO BE REMOVED UGH - ENOCH PLS
    projectId: ID # will replace jobId
    teamId: ID
    plannedEffort: Float
    subStatusId: ID
    dueDate: DateTime
    startDate: DateTime
    endDate: DateTime
    projectedCost: Float
    published: Boolean
    visibility: TaskVisibilityType

    job_id: ID #deprecated
    team_id: ID #deprecated
    planned_effort: Float #deprecated
    sub_status_id: ID #deprecated
    due_date: DateTime #deprecated
    start_date: DateTime #deprecated
    end_date: DateTime #deprecated
    projected_cost: Float #deprecated
  }

  input TaskPersonalInput {
    name: String!
    description: String
    status: PersonalStatusType
    stageStatus: StageType
    value: Float
    priority: TaskPriorityType

    jobId: ID
    dueDate: DateTime
    startDate: DateTime
    endDate: DateTime
    published: Boolean

    job_id: ID! #deprecated
    due_date: DateTime #deprecated
    start_date: DateTime #deprecated
    end_date: DateTime #deprecated
  }

  input TaskUpdateInput {
    name: String
    description: String
    sequence: Int
    priority: TaskPriorityType
    dueDate: DateTime
    teamId: ID
    dueReminder: DateTime
    subStatusId: ID
    plannedEffort: Float ## In minutes
    startDate: DateTime
    endDate: DateTime
    projectedCost: Float
    published: Boolean
    visibility: TaskVisibilityType
    projectStatusId: ID

    actualStart: DateTime
    actualEnd: DateTime
    actualEffort: Float ## In minutes
    actualValue: Float

    due_date: DateTime #deprecated
    team_id: ID #deprecated
    due_reminder: DateTime #deprecated
    sub_status_id: ID #deprecated
    planned_effort: Float #deprecated
    start_date: DateTime #deprecated
    end_date: DateTime #deprecated
    projected_cost: Float #deprecated
  }

  enum TaskVisibilityType {
    """
    And creator
    """
    OWNERS
    DEFAULT
  }

  enum TaskSortType {
    CREATED_AT
    DUE_DATE
    NAME
    PRIORITY
    STAGE
  }

  input PersonalTaskUpdateInput {
    name: String
    description: String
    sequence: Int
    status: PersonalStatusType
    stageStatus: StageType
    value: Float

    dueDate: DateTime
    teamId: ID
    dueReminder: DateTime
    startDate: DateTime
    endDate: DateTime

    due_date: DateTime #deprecated
    team_id: ID #deprecated
    due_reminder: DateTime #deprecated
    start_date: DateTime #deprecated
    end_date: DateTime #deprecated
  }

  input TaskDeleteInput {
    task_ids: [ID]!
  }

  input TaskBoardInput {
    name: String!
    description: String
    companyId: ID
    company_id: ID!
    type: TaskBoardType!
    category: TaskBoardCategory
    status: Int!
    color: String
    owners: [String!]
  }

  input CollaborationBoardInput {
    contactId: ID
    companyId: ID
    contact_id: ID!
    description: String
    company_id: ID!
    type: TaskBoardType!
    category: TaskBoardCategory
    status: Int!
    name: String
    owners: [String!]
    color: String
  }

  input TaskBoardUpdateInput {
    name: String!
    description: String
    type: TaskBoardType!
    category: TaskBoardCategory
    color: String
    """
    "owners" are company member IDs
    """
    owners: [String!]
    published: Boolean
  }

  input TaskMemberInput {
    companyMemberIds: [ID!]
    company_member_ids: [ID]!
  }

  input TaskPicInput {
    picIds: [ID!]
    pic_ids: [ID] #DEPRECATED
  }

  input TaskPicsInput {
    taskId: ID!
    picIds: [ID!]!
  }

  input SubtaskInput {
    title: String!
  }

  input ChecklistInput {
    title: String!
  }

  input SubtaskUpdateInput {
    title: String
    checked: Boolean
  }

  input ChecklistUpdateInput {
    title: String
    checked: Boolean
  }

  input TaskCommentUpdateInput {
    message: String
    messageContent: String
  }

  """
  Only works with new comment system
  """
  input EditTaskCommentInput {
    commentId: ID!
    messageContent: ID!
    """
    New and old mentions
    """
    mentionIds: [ID!]
  }

  input TaskCommentInput {
    """
    Old mention system pattern: @[member-or-pic-uuid]
    """
    message: String
    """
    Must be in JSON file
    """
    messageContent: String
    """
    If have parentId, means it is a reply or children, no parentId is a parent comment.
    """
    parentId: ID
    """
    Either in PIC or Member UUID
    """
    mentionIds: [ID!]
  }

  input ArchiveTaskInput {
    task_ids: [ID]!
  }

  input UnarchiveTaskInput {
    task_ids: [ID]!
  }

  input TaskBoardTeamDeleteInput {
    task_board_team_ids: [ID]!
  }

  input TaskBoardTeamInput {
    job_id: ID!
    team_id: ID!
  }

  input TaskSequenceInput {
    task_id: ID
    sequence: Int
  }

  input CopyTaskInput {
    companyId: ID!
    companyTeamId: ID
    taskId: ID!
    taskBoardId: ID!
    copySubtasks: Boolean!
    copyAttachments: Boolean!
  }

  input CopyTasksInput {
    companyId: ID!
    companyTeamId: ID
    taskIds: [ID!]!
    taskBoardId: ID!
    copySubtasks: Boolean!
    copyAttachments: Boolean!
  }

  input DuplicateTasksInput {
    taskIds: [ID!]!
    projectGroupId: ID
    projectId: ID!
    parentId: ID
  }

  input UpdateTaskBoardsArchivedStateInput {
    boardIds: [String]!
    archived: Boolean!
  }

  input LinkAttachmentToCommentInput {
    attachmentId: ID!
    commentId: ID!
  }

  input PostCommentInput {
    taskId: ID!
    """
    In JSON Format
    """
    parentId: String
    messageContent: String!
  }

  input SubtaskSequencesInput {
    subtaskId: ID!
    sequence: Int
  }

  input ChecklistSequencesInput {
    checklistId: ID!
    sequence: Int
  }

  input LinkExternalAttachmentsInput {
    taskId: ID!
    externalAttachments: [ExternalAttachmentInput!]!
  }

  input ExternalAttachmentInput {
    name: String!
    type: String!
    url: String!
    source: ExternalFileSource!
  }

  input TaskFilter {
    search: String
    ids: [ID!]
    boardType: TaskBoardType
    stage: StageType
    subStatusId: ID
    contactIds: [ID!]
    priority: TaskPriorityType
    dueDateRange: [DateTime!]
    startDateRange: [DateTime!]
    memberOwnerIds: [ID!]
    memberAssigneeIds: [ID!]
    picIds: [ID!]
    tagIds: [ID!]
    isRecurring: Boolean
    isOverdue: Boolean
    category: TaskBoardCategory
  }

  input TaskSort {
    type: TaskSortType
    direction: SortDirection
  }

  input AddTaskWatchersInput {
    taskId: ID!
    memberIds: [ID!]!
  }

  input ChangeGroupTaskInput {
    taskIds: [ID!]!
    groupId: ID!
  }

  input RemoveTaskWatchersInput {
    taskId: ID!
    memberIds: [ID!]!
  }

  type PaginatedSharedWithMeTasks {
    tasks: [Task]
    total: Int
  }

  input ChangeTaskPositionInput {
    taskId: ID!
    posY: Float!
    projectStatusId: ID
  }

  input ImportTasksInput {
    projectId: ID!
    groupId: ID
    attachment: Upload!
  }

  input UpdateTaskParentInput {
    childTaskId: ID!
    destinationParentId: ID!
  }

  type UpdateTaskParentResponse {
    sourceTask: Task!
    destinationTask: Task!
  }

  input AddToTaskVisibilityWhitelistInput {
    taskId: ID!
    memberIds: [ID!]
    teamIds: [ID!]
  }

  input RemoveFromTaskVisibilityWhitelistInput {
    taskId: ID!
    memberIds: [ID!]
    teamIds: [ID!]
  }

  input SetTaskVisibilityInput {
    taskId: ID!
    visibility: CommonVisibility!
  }

  extend type Query {
    """
    To be deprecated
    """
    getTaskPics: [TaskPic]
    taskPics: [TaskPic]
    sharedWithMeTasks(
      filter: TaskFilter
      sort: TaskSort
      limit: Int
      offset: Int
    ): PaginatedSharedWithMeTasks
    task(taskId: ID!): Task
    tasksV3(
      filter: TaskFilter
      sort: TaskSort
      limit: Int
      offset: Int
    ): PaginatedTasks
    tasks(
      companyId: ID!
      filters: FilterOptions
      category: TaskBoardCategory
    ): [Task]
  }

  extend type Mutation {
    createCollaborationBoard(input: CollaborationBoardInput!): TaskBoard
    createTask(input: TaskInput!, memberIds: [ID], picIds: [ID]): Task

    createPersonalTask(
      input: TaskPersonalInput!
      memberIds: [ID]
      creatorMemberId: ID
    ): Task

    createSubtask(taskId: ID!, input: SubtaskInput!): Subtask
    postTaskComment(input: PostCommentInput!): TaskComment
    editTaskComment(input: EditTaskCommentInput!): TaskComment

    assignTaskMembers(taskId: ID!, input: TaskMemberInput!): [TaskMember]
    assignTaskPics(taskId: ID!, input: TaskPicInput!): [TaskPic]

    deleteTasks(taskIds: [ID]!): [Task]

    deleteTaskAttachments(taskAttachmentIds: [ID]!): [TaskAttachment]
    deleteTaskMembers(taskId: ID!, input: TaskMemberInput!): [TaskMember]

    deleteTaskPics(taskId: ID!, input: TaskPicInput!): [TaskPic] ## Deprecate V3
    removeTaskPics(input: TaskPicsInput!): [TaskPic] ## Replace deleteTaskPics
    deleteSubtasks(subtaskIds: [ID]!): [Subtask]
    deleteChecklists(checklistIds: [ID]!): [Checklist]
    deleteTaskComment(taskCommentId: ID!): TaskComment

    updateTask(taskId: ID!, input: TaskUpdateInput!): Task
    updatePersonalTask(taskId: ID!, input: PersonalTaskUpdateInput!): Task

    updateSubtask(subtaskId: ID!, input: SubtaskUpdateInput!): Subtask
    updateChecklist(checklistId: ID!, input: ChecklistUpdateInput!): Checklist
    updateTaskComment(
      taskCommentId: ID!
      input: TaskCommentUpdateInput!
    ): TaskComment

    updateTasksSequence(input: [TaskSequenceInput]!): [Task] ## DEPRECATED
    uploadTaskAttachment(
      taskId: ID!
      attachment: Upload!
      commentId: ID
    ): TaskAttachment

    archiveTasks(input: ArchiveTaskInput!): [Task]
    unarchiveTasks(input: UnarchiveTaskInput!): [Task]

    startTaskTimer(taskId: ID!, companyMemberId: ID!): TaskTimerEntry
    stopTaskTimer(taskId: ID!, companyMemberId: ID!): TaskTimerEntry

    copyTask(input: CopyTaskInput!): Task ## TODO: DEPRECATED after task unification
    copyTasks(input: CopyTasksInput!): [Task] ## DEPRECATED after task unification
    """
    Include x-company-id in headers
    """
    duplicateTasks(input: DuplicateTasksInput!): [Task]

    linkAttachmentToComment(input: LinkAttachmentToCommentInput!): TaskComment
    unlinkAttachmentFromComment(
      input: LinkAttachmentToCommentInput!
    ): TaskComment
    updateSubtaskSequences(input: [SubtaskSequencesInput]): [Subtask]
    updateChecklistSequences(input: [ChecklistSequencesInput]): [Checklist]

    toggleTasksPinned(taskIds: [ID!]!): [Task]
    toggleTasksPublishStatus(taskIds: [ID!]!): [Task]

    linkExternalAttachments(input: LinkExternalAttachmentsInput!): Task
    addTaskWatchers(input: AddTaskWatchersInput!): [TaskWatcher]
    removeTaskWatchers(input: RemoveTaskWatchersInput!): [TaskWatcher]
    changeTaskPosition(input: ChangeTaskPositionInput!): Task
    changeGroupTasks(input: ChangeGroupTaskInput!): [Task]

    createChecklist(taskId: ID!, input: ChecklistInput!): Checklist

    importTasks(input: ImportTasksInput!): ImportTasksResponse

    updateTaskParent(input: UpdateTaskParentInput!): UpdateTaskParentResponse

    addToTaskVisibilityWhitelist(
      input: AddToTaskVisibilityWhitelistInput!
    ): Task
    removeFromTaskVisibilityWhitelist(
      input: RemoveFromTaskVisibilityWhitelistInput!
    ): Task

    setTaskVisibility(input: SetTaskVisibilityInput!): Task
  }

  ${taskBoardSchema}
`;

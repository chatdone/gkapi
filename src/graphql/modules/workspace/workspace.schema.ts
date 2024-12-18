import { gql } from 'apollo-server-express';
import _ from 'lodash';

export const schema = gql`
  scalar DateTime

  type Workspace {
    id: ID
    name: String
    bgColor: String

    company: Company
    projects: [TaskBoard]

    visibility: CommonVisibility
    visibilityWhitelist: CommonVisibilityWhitelist

    createdBy: User
    updatedBy: User
    createdAt: DateTime
    updatedAt: DateTime
  }

  input CreateWorkspaceInput {
    name: String!
    bgColor: String!
    companyId: ID!
  }

  input UpdateWorkspaceInput {
    name: String
    bgColor: String
    workspaceId: ID!
  }

  input AssignProjectsToWorkspaceInput {
    workspaceId: ID!
    projectIds: [ID!]!
  }

  input RemoveProjectsFromWorkspaceInput {
    workspaceId: ID!
    projectIds: [ID!]!
  }

  input MoveProjectsToWorkspaceInput {
    sourceWorkspaceId: ID!
    destinationWorkspaceId: ID!
    projectIds: [ID!]!
  }

  input CreateProjectInput {
    name: String!
    companyId: ID!
    workspaceId: ID!
    projectTemplateId: ID
    visibility: ProjectVisibility
    ownerIds: [ID!]
  }

  input ProjectUpdateInput {
    projectId: ID!
    name: String
    description: String
    color: String
    """
    "owners" are company member IDs
    """
    ownerIds: [ID!]
    published: Boolean
  }

  input CreateCustomColumnForGroupInput {
    groupId: ID!
    name: String!
    type: ProjectGroupCustomAttributeType!
  }

  input EditCustomColumnForGroupInput {
    groupId: ID!
    attributeId: ID!
    name: String!
  }

  input DeleteCustomColumnForGroupInput {
    groupId: ID!
    attributeId: ID!
  }

  input AddCustomValueToTaskInput {
    taskId: ID!
    attributeId: ID!
    groupId: ID!
    value: String!
  }

  input ToggleEnabledCustomColumnInput {
    projectId: ID!
    attributeId: ID!
  }

  input ReorderGroupInput {
    projectId: ID!
    reorderedGroups: [ReorderedGroup!]!
  }

  input ReorderedGroup {
    groupId: ID!
    ordering: Int!
  }

  input DeleteCustomValueFromTaskInput {
    taskId: ID!
    attributeId: ID!
    groupId: ID!
  }

  enum ProjectVisibility {
    HIDDEN # Not shown (not selectable from UI)
    PUBLIC # Visible to all within the company
    ASSIGNED # Visible to teams, members and PICs assigned
    SPECIFIC # Manually-specified list of teams and members allowed
    PRIVATE # Only visible to the owner of the entity
  }

  type PaginatedProjectInvoices {
    projectInvoices: [ProjectInvoice]
    total: Int
  }

  type PaginatedProjectClaims {
    projectClaims: [ProjectClaim]
    total: Int
  }

  type PaginatedProjectTimeCosts {
    projectTimeCosts: [ProjectTimeCost]
    total: Int
  }

  type TaskBoardVisibilityWhitelist {
    teams: [CompanyTeam]
    members: [CompanyMember]
  }

  type ProjectInvoice {
    id: ID
    name: String
    invoiceNo: String
    quantity: Int
    price: Float
    amount: Float
    actualCost: Float
    variance: Float
    project: TaskBoard
    createdAt: DateTime
    createdBy: User
    updatedAt: DateTime
    updatedBy: User
  }

  type ProjectClaim {
    id: ID
    name: String
    description: String
    note: String
    member: CompanyMember
    amount: Float
    attachmentUrl: String
    status: ProjectClaimType
    project: TaskBoard
    createdAt: DateTime
    createdBy: User
    updatedAt: DateTime
    updatedBy: User
  }

  type ProjectTimeCost {
    id: ID
    project: TaskBoard
    date: DateTime
    timeIn: DateTime
    timeOut: DateTime
    task: Task
    member: CompanyMember
    duration: Int ## In Seconds
    amount: Float
    createdAt: DateTime
    createdBy: User
    updatedAt: DateTime
    updatedBy: User
  }

  type ProjectTemplate {
    id: ID
    name: String
    company: Company
    columns: JSON
    statuses: [ProjectTemplateStatus]
  }

  type ProjectTemplateGallery {
    galleryTemplates: JSON
  }

  type ProjectStatus {
    id: ID
    project: TaskBoard
    color: String
    name: String
    sequence: Int
    notify: Boolean
  }

  type ProjectTemplateStatus {
    id: ID
    projectTemplate: ProjectTemplate
    name: String
    color: String
    notify: Boolean
  }

  type ProjectStatus {
    id: ID
    project: TaskBoard
    name: String
    color: String
    notify: Boolean
    sequence: Int
  }

  type ProjectSettings {
    project: TaskBoard
    columns: JSON
  }

  type ProjectGroup {
    id: ID
    name: String
    project: TaskBoard
    customColumns: [ProjectGroupCustomColumn]
    tasks(filters: FilterOptions): [Task]
    totalTasks: Int
    ordering: Int
  }

  type ProjectGroupCustomAttribute {
    id: ID
    name: String
    type: ProjectGroupCustomAttributeType
  }

  type ProjectGroupCustomColumn {
    group: ProjectGroup
    attribute: ProjectGroupCustomAttribute
    enabled: Boolean
  }

  type TaskCustomValue {
    group: ProjectGroup
    task: Task
    attribute: ProjectGroupCustomAttribute
    value: String
  }

  input TaskBoardSort {
    type: TaskBoardSortType
    direction: SortDirection
  }

  input ProjectInvoiceFilter {
    projectId: ID
  }

  input ProjectTimeCostFilter {
    projectId: ID
  }

  input ProjectClaimFilter {
    projectId: ID
  }

  input ProjectInvoiceSort {
    type: ProjectInvoiceSortType
    direction: SortDirection
  }

  input ProjectTimeCostSort {
    type: ProjectTimeCostSortType
    direction: SortDirection
  }

  input ProjectClaimSort {
    type: ProjectClaimSortType
    direction: SortDirection
  }

  input ProjectInvoiceInput {
    name: String!
    invoiceNo: String
    quantity: Int!
    price: Float!
    actualCost: Float
    projectId: ID!
  }

  input ProjectTimeCostInput {
    date: DateTime!
    timeIn: DateTime
    timeOut: DateTime
    taskId: ID!
    memberId: ID!
    amount: Float!
    projectId: ID!
    note: String
  }

  input ProjectInvoiceEditInput {
    invoiceId: ID!
    name: String
    invoiceNo: String
    quantity: Int
    price: Float
    actualCost: Float
  }

  input ProjectTimeCostEditInput {
    timeCostId: ID!
    date: DateTime
    timeIn: DateTime
    timeOut: DateTime
    taskId: ID
    memberId: ID
    amount: Float
    note: String
    projectId: ID
  }

  input ProjectInvoiceDeleteInput {
    ids: [ID!]!
  }

  input ProjectTimeCostDeleteInput {
    ids: [ID!]!
  }

  input ProjectClaimInput {
    name: String!
    description: String
    note: String
    memberId: ID
    amount: Float!
    attachmentUrl: String
    status: ProjectClaimType
    projectId: ID!
  }

  input ProjectClaimEditInput {
    name: String
    description: String
    note: String
    memberId: ID
    amount: Float ## This shouldn't be edited, should make a new claim instead
    attachmentUrl: String
    status: ProjectClaimType
    claimId: ID!
  }

  input ProjectClaimDeleteInput {
    ids: [ID!]!
  }

  input ProjectTemplateEditInput {
    projectTemplateId: ID!
    name: String
    columns: ProjectTemplateOptions
  }

  input ProjectTemplateInput {
    name: String!
    companyId: ID!
    columns: ProjectTemplateOptions
    statuses: [ProjectTemplateStatusInput]
  }

  input ProjectTemplateStatusInput {
    name: String!
    color: String!
    notify: Boolean
  }

  input ProjectTemplateOptions {
    name: Boolean
    status: Boolean
    timeline: Boolean
    activity: Boolean
    assignee: Boolean
    watchers: Boolean
    contacts: Boolean
    tracking: Boolean
    priority: Boolean
    tags: Boolean
    value: Boolean
    effort: Boolean
    reminder: Boolean
    recurrence: Boolean
  }

  input ProjectTemplateStatusEditInput {
    projectTemplateStatusId: ID!
    name: String
    color: String
    notify: Boolean
  }

  input ProjectStatusEditInput {
    projectStatusId: ID!
    name: String
    color: String
    notify: Boolean
    sequence: Int ## This is the posX of the task in the project
  }

  input ProjectSettingsEditInput {
    projectId: ID!
    columns: ProjectTemplateOptions!
  }

  input CreateProjectGroupInput {
    name: String!
    projectId: ID!
  }

  input UpdateProjectsArchivedStateInput {
    projectIds: [ID!]!
    archived: Boolean!
  }

  input SetProjectVisibilityInput {
    projectId: ID!
    visibility: ProjectVisibility!
  }

  input SetWorkspaceVisibilityInput {
    workspaceId: ID!
    visibility: CommonVisibility!
  }

  input ProjectTemplateStatusIdsInput {
    projectTemplateStatusIds: [ID!]!
  }

  input CreateProjectTemplateStatusInput {
    projectTemplateId: ID!
    name: String!
    color: String!
    notify: Boolean!
  }

  input CreateProjectStatusInput {
    name: String!
    color: String!
    notify: Boolean
    projectId: ID!
  }

  input DeleteProjectStatusInput {
    projectStatusIds: [ID!]!
  }

  input EditProjectGroupInput {
    projectGroupId: ID!
    name: String!
  }

  input DeleteWorkspacesInput {
    workspaceIds: [ID!]!
  }

  input DeleteProjectsInput {
    projectIds: [ID!]!
  }

  input DeleteProjectTemplateIdsInput {
    projectTemplateIds: [ID!]!
  }

  input CopyProjectInput {
    projectId: ID!
    targetWorkspaceId: ID!
  }

  input AddToProjectVisibilityWhitelistInput {
    projectId: ID!
    memberIds: [ID!]
    teamIds: [ID!]
  }

  input RemoveFromProjectVisibilityWhitelistInput {
    projectId: ID!
    memberIds: [ID!]
    teamIds: [ID!]
  }

  input DeleteProjectGroupInput {
    projectGroupIds: [ID!]!
  }

  input MoveTasksInput {
    projectGroupId: ID!
    taskIds: [ID!]!
    projectId: ID!
  }

  input MoveTaskToMemberInput {
    sourceMemberId: ID!
    destinationMemberId: ID!
    taskId: ID!
  }

  enum ProjectGroupCustomAttributeType {
    TEXT
    NUMBER
  }

  enum ProjectClaimType {
    NEW
    APPROVED
    REJECTED
  }

  enum ProjectClaimSortType {
    CREATED_AT
    NAME
  }

  enum ProjectTimeCostSortType {
    CREATED_AT
  }

  input AddToWorkspaceVisibilityWhitelistInput {
    workspaceId: ID!
    memberIds: [ID!]
    teamIds: [ID!]
  }

  input RemoveFromWorkspaceVisibilityWhitelistInput {
    workspaceId: ID!
    memberIds: [ID!]
    teamIds: [ID!]
  }

  extend type Query {
    workspace(id: ID!): Workspace
    workspaces(companyId: ID!, ids: [ID!]): [Workspace]
    projectInvoice(invoiceId: ID!): ProjectInvoice

    project(id: ID!): TaskBoard
    projects(memberId: ID!): [TaskBoard]

    projectInvoices(
      filter: ProjectInvoiceFilter
      sort: ProjectInvoiceSort
      limit: Int
      offset: Int
    ): PaginatedProjectInvoices

    projectClaim(claimId: ID!): ProjectClaim

    projectClaims(
      filter: ProjectClaimFilter
      sort: ProjectClaimSort
      limit: Int
      offset: Int
    ): PaginatedProjectClaims

    projectTimeCost(timeCostId: ID!): ProjectTimeCost

    projectTimeCosts(
      filter: ProjectClaimFilter
      sort: ProjectTimeCostSort
      limit: Int
      offset: Int
    ): PaginatedProjectTimeCosts
    projectTemplates(companyId: ID!): [ProjectTemplate]

    globalProjectTemplateGallery: ProjectTemplateGallery
  }

  extend type Mutation {
    createWorkspace(input: CreateWorkspaceInput!): Workspace
    updateWorkspace(input: UpdateWorkspaceInput!): Workspace
    assignProjectsToWorkspace(input: AssignProjectsToWorkspaceInput!): Workspace
    removeProjectsFromWorkspace(
      input: RemoveProjectsFromWorkspaceInput!
    ): Workspace
    moveProjectsToWorkspace(input: MoveProjectsToWorkspaceInput!): [Workspace]

    createProject(input: CreateProjectInput!): TaskBoard
    updateProject(input: ProjectUpdateInput!): TaskBoard
    createProjectInvoice(input: ProjectInvoiceInput!): ProjectInvoice
    editProjectInvoice(input: ProjectInvoiceEditInput!): ProjectInvoice
    deleteProjectInvoices(input: ProjectInvoiceDeleteInput!): [ProjectInvoice]

    createProjectClaim(input: ProjectClaimInput!): ProjectClaim
    editProjectClaim(input: ProjectClaimEditInput!): ProjectClaim
    deleteProjectClaims(input: ProjectClaimDeleteInput!): [ProjectClaim]

    createProjectTimeCost(input: ProjectTimeCostInput!): ProjectTimeCost
    editProjectTimeCost(input: ProjectTimeCostEditInput!): ProjectTimeCost
    deleteProjectTimeCosts(
      input: ProjectTimeCostDeleteInput!
    ): [ProjectTimeCost]

    editProjectTemplate(input: ProjectTemplateEditInput!): ProjectTemplate
    createProjectTemplate(input: ProjectTemplateInput!): ProjectTemplate

    editProjectTemplateStatus(
      input: ProjectTemplateStatusEditInput!
    ): ProjectTemplateStatus

    editProjectStatus(input: ProjectStatusEditInput!): ProjectStatus
    editProjectSettings(input: ProjectSettingsEditInput!): ProjectSettings
    createProjectGroup(input: CreateProjectGroupInput!): ProjectGroup

    updateProjectsArchivedState(
      input: UpdateProjectsArchivedStateInput!
    ): [TaskBoard]

    setProjectVisibility(input: SetProjectVisibilityInput!): TaskBoard
    setWorkspaceVisibility(input: SetWorkspaceVisibilityInput!): Workspace

    deleteProjectTemplateStatuses(
      input: ProjectTemplateStatusIdsInput!
    ): [ProjectTemplateStatus]

    createProjectTemplateStatus(
      input: CreateProjectTemplateStatusInput!
    ): ProjectTemplateStatus

    createProjectStatus(input: CreateProjectStatusInput!): ProjectStatus
    deleteProjectStatuses(input: DeleteProjectStatusInput!): [ProjectStatus]

    editProjectGroup(input: EditProjectGroupInput!): ProjectGroup

    deleteWorkspaces(input: DeleteWorkspacesInput!): [Workspace]
    deleteProjects(input: DeleteProjectsInput!): [TaskBoard]

    deleteProjectTemplates(
      input: DeleteProjectTemplateIdsInput!
    ): [ProjectTemplate]

    copyProject(input: CopyProjectInput!): TaskBoard ### WIP
    addToVisibilityWhitelistProject(
      input: AddToProjectVisibilityWhitelistInput!
    ): TaskBoard
    removeFromVisibilityWhitelistProject(
      input: RemoveFromProjectVisibilityWhitelistInput!
    ): TaskBoard

    deleteProjectGroups(input: DeleteProjectGroupInput!): [ProjectGroup]
    moveTasks(input: MoveTasksInput!): [Task]

    moveTaskToMember(input: MoveTaskToMemberInput!): Task

    addToWorkspaceVisibilityWhitelist(
      input: AddToWorkspaceVisibilityWhitelistInput!
    ): Workspace
    removeFromWorkspaceVisibilityWhitelist(
      input: RemoveFromWorkspaceVisibilityWhitelistInput!
    ): Workspace

    createCustomColumnForGroup(
      input: CreateCustomColumnForGroupInput!
    ): ProjectGroupCustomColumn

    editCustomColumnForGroup(
      input: EditCustomColumnForGroupInput!
    ): ProjectGroupCustomColumn

    deleteCustomColumnForGroup(
      input: DeleteCustomColumnForGroupInput!
    ): ProjectGroupCustomColumn

    addCustomValueToTask(input: AddCustomValueToTaskInput!): TaskCustomValue
    deleteCustomValueFromTask(
      input: DeleteCustomValueFromTaskInput!
    ): TaskCustomValue

    toggleEnabledCustomColumn(
      input: ToggleEnabledCustomColumnInput!
    ): ProjectGroupCustomColumn

    reorderGroups(input: ReorderGroupInput!): [ProjectGroup]
  }
`;

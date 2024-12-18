import { gql } from 'apollo-server-express';
import _ from 'lodash';

export const schema = gql`
  scalar DateTime
  scalar Latitude
  scalar Longitude

  interface Template {
    id: ID
    name: String
    company: Company

    createdBy: User
    createdAt: DateTime
    updatedAt: DateTime
    type: TemplateType
  }

  type TaskTemplate implements Template {
    id: ID
    name: String
    company: Company
    createdBy: User
    createdAt: DateTime
    updatedAt: DateTime
    description: String
    copySubtasks: Boolean
    copyAttachments: Boolean
    isRecurring: Boolean
    recurringSetting: TaskTemplateRecurringSetting
    templateId: ID

    items: [TaskTemplateItem]
    attachments: [TaskTemplateAttachment]
    type: TemplateType
  }

  """
  Translated from cron string
  """
  type TaskTemplateRecurringSetting {
    intervalType: String
    day: Int
    month: Int
    skipWeekend: Boolean
  }

  type TaskTemplateItem {
    name: String
    sequence: Int
    description: String
    isSubtask: Boolean
  }

  type TaskTemplateAttachment {
    name: String

    type: String
    filesize: Int
    bucket: String
    path: String
    url: String
    createdAt: String
    updatedAt: String
  }

  input CreateTaskTemplateInput {
    companyId: ID!
    sourceTaskId: ID!
    name: String!
    copySubtasks: Boolean!
    copyAttachments: Boolean!
    description: String
    """
    Deprecated, sending a cronString will automatically mark it as recurring
    """
    isRecurring: Boolean
    """
    Sending a cronString means it will be classified as recurring and no longer should be listed as a template
    """
    cronString: String
  }

  input UpdateTaskTemplateInput {
    companyId: ID!
    templateId: ID!
    name: String!
    description: String
    cronString: String
    isCopySubtasks: Boolean
    isCopyAttachments: Boolean
  }

  input DeleteTemplateInput {
    companyId: ID!
    templateId: ID!
  }

  input ApplyTaskTemplateInput {
    companyId: ID!
    companyTeamId: ID
    templateId: ID!
    taskBoardId: ID!
  }

  enum TemplateType {
    TASK
    PROJECT_TASK
  }

  extend type Query {
    taskTemplate(id: ID!, companyId: ID!): TaskTemplate
    taskTemplates(companyId: ID!): [TaskTemplate]
  }

  extend type Mutation {
    createTaskTemplate(input: CreateTaskTemplateInput!): TaskTemplate
    updateTaskTemplate(input: UpdateTaskTemplateInput!): TaskTemplate
    deleteTaskTemplate(input: DeleteTemplateInput!): TaskTemplate
    applyTaskTemplate(input: ApplyTaskTemplateInput!): TaskTemplate
  }
`;

import { gql } from 'apollo-server-express';
import _ from 'lodash';

export const schema = gql`
  scalar DateTime

  type Notification {
    id: ID!

    type: String
    title: String
    message: String
    description: String
    data: String
    user: User
    member: CompanyMember
    contact: Contact
    pic: ContactPic
    # member_type: ???
    task: Task
    comment: TaskComment
    taskBoard: TaskBoard
    team: CompanyTeam
    company: Company
    collection: Collection
    group: String
    # collection_period: CollectionPeriod
    # card_status: ??

    due_date: DateTime

    created_at: DateTime
    updated_at: DateTime
    deleted_at: DateTime
  }

  type UserNotification {
    id: ID!
    notification: Notification
    user: User
    username: String
    is_read: Boolean
    user_type: UserNotificationType
    created_at: DateTime
    group: String
  }

  type UnreadCount {
    unread: Int
  }

  type TotalNotificationCount {
    total: Int
  }

  enum NotificationGroups {
    CRM
    TASK
    COLLECTION
    PAYMENT
    MISC
  }

  enum UserNotificationType {
    MEMBER
    PIC
  }

  enum NotificationType {
    GENERIC
    ASSIGNED_AS_CREATOR
    INVITED_TO_COMPANY
    JOIN_COMPANY_BY_CODE
    REMOVED_FROM_COMPANY
    ASSIGNED_MEMBER_TYPE
    ASSIGNED_TO_TEAM
    REMOVED_FROM_TEAM
    MEMBER_ASSIGNED_TO_TASKBOARD
    MEMBER_REMOVED_FROM_TASKBOARD
    PIC_ASSIGNED_TO_TASKBOARD
    PIC_REMOVED_FROM_TASKBOARD
    MEMBER_ASSIGNED_TO_TASK
    MEMBER_REMOVED_FROM_TASK
    PIC_ASSIGNED_TO_TASK
    PIC_REMOVED_FROM_TASK
    COMMENT_ON_TASK
    UPLOAD_TO_TASK
    TASK_DUE_MEMBER
    TASK_DUE_PIC
    TASK_OVERDUE_MEMBER
    TASK_OVERDUE_PIC
    TASK_REJECTED
    TASK_DONE
    COLLECTION_CREATED
    COLLECTION_DUE
    COLLECTION_OVERDUE
    COLLECTION_PAYMENT_RECEIVED
    COLLECTION_PAYMENT_REJECTED
    COLLECTION_CANCELLED
    QUOTA_EXCEEDED
    SENANGPAY_ACTIVATION
    SENANGPAY_TRANSACTION_FULL
    SENANGPAY_TRANSACTION_RECURRING
    FPX_TRANSACTION_STATUS
    DEDOCO_SIGN_REQUEST
    PROJECT_REMINDER
    PROJECT_ON_DUE
    PROJECT_OVERDUE
    CLOCK_IN_BEFORE_TEN_MINUTES
    CLOCK_IN_AFTER_TEN_MINUTES
    CLOCK_OUT_AFTER_TWO_HOURS
  }

  input NotificationTypeInput {
    isAssigned: Boolean
    isUnread: Boolean
    isMentioned: Boolean
  }

  extend type Mutation {
    resendCollectionNotification(collectionId: ID!): Notification
    updateIsRead(notificationIds: [ID]!): UserNotification ## DEPRECATED
    updateAllRead(companyId: ID): [UserNotification] ## DEPRECATED
  }
`;

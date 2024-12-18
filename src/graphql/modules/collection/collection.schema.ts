import { gql } from 'apollo-server-express';

export const schema = gql`
  scalar DateTime
  scalar Upload
  scalar Date
  scalar JSON

  type Collection {
    id: ID
    refNo: String
    contact: Contact
    title: String
    description: String
    payableAmount: Float
    periods: Int
    remindType: CollectionRemindTypes
    due_date: DateTime
    invoice: String
    fileName: String
    invoiceFileSize: Int
    startMonth: DateTime
    endMonth: DateTime
    remindInterval: CollectionRemindIntervalTypes
    remindOnDate: Int
    remindOnMonth: Int
    remindEndOn: DateTime
    smsNotify: Boolean
    whatsappNotify: Boolean
    voiceNotify: Boolean
    emailNotify: Boolean
    notifyPics: [ContactPic]
    status: CollectionStatusTypes
    isDraft: Boolean
    active: Boolean
    archive: Boolean
    archiveAt: DateTime
    createdBy: User
    updatedBy: User
    createdAt: DateTime
    updatedAt: DateTime
    paymentType: CollectionPaymentTypes
    spRecurringId: String
    collectionPeriods: [CollectionPeriod]
    remindOnDays: [CollectionRemindOnDays]
    collector: Collector
    activityLogs: [CollectionActivityLog]

    assignees: [CompanyMember]

    """
    Not from receivable_reminders DB
    """
    reminderStatus: ReminderStatus
    messageLogs: [CollectionMessageLog]
    shortLink: String
    tags: [Tag]
    """

    """
    ref_no: String #deprecated
    payable_amount: Float #deprecated
    remind_type: CollectionRemindTypes #deprecated
    dueDate: DateTime #deprecated
    file_name: String #deprecated
    invoice_file_size: Int #deprecated
    start_month: DateTime #deprecated
    end_month: DateTime #deprecated
    remind_interval: CollectionRemindIntervalTypes #deprecated
    remind_on_date: Int #deprecated
    remind_on_month: Int #deprecated
    remind_end_on: DateTime #deprecated
    sms_notify: Boolean #deprecated
    whatsapp_notify: Boolean #deprecated
    voice_notify: Boolean #deprecated
    email_notify: Boolean #deprecated
    notify_pics: [ContactPic] #deprecated
    is_draft: Boolean #deprecated
    archive_at: DateTime #deprecated
    created_by: User #deprecated
    updated_by: User #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    payment_type: CollectionPaymentTypes #deprecated
    sp_recurring_id: String #deprecated
    collection_periods: [CollectionPeriod] #deprecated
    remind_on_days: [CollectionRemindOnDays] #deprecated
    reminder_status: ReminderStatus #deprecated
    message_logs: [CollectionMessageLog] #deprecated
    short_link: String #deprecated
  }

  type CollectionMessageLog {
    id: ID
    collection: Collection
    type: String
    emailAddress: String
    phone: String
    timestamp: DateTime
    status: CollectionMessageLogStatusTypes

    email_address: String #deprecated
  }

  type ReminderStatus {
    email: ServiceHistory
    whatsapp: ServiceHistory
  }

  type ServiceHistory {
    id: ID
    type: ServiceHistoryTypes
    collection: Collection
    to: String
    status: ReminderStatusTypes
    updatedAt: DateTime

    updated_at: DateTime #deprecated
  }

  type CollectionReminderRead {
    id: ID
    user: User
    collection: Collection
    createdAt: String

    created_at: String #deprecated
  }

  type CollectionPeriod {
    id: ID
    collection: Collection
    period: Int
    month: DateTime
    amount: Float
    dueDate: DateTime
    lastRemindOn: DateTime
    paymentAcceptAt: DateTime
    status: CollectionStatusTypes
    createdAt: DateTime
    updatedAt: DateTime
    webhookData: String
    payments: [CollectionPayment]

    due_date: DateTime #deprecated
    last_remind_on: DateTime #deprecated
    payment_accept_at: DateTime #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    webhook_data: String #deprecated
  }

  type CollectionPayment {
    id: ID
    collection: Collection
    collectionPeriod: CollectionPeriod
    contact: Contact
    contactPic: ContactPic
    companyMember: CompanyMember
    paymentProof: String
    paymentProofFileName: String
    paymentProofFileSize: String
    receipt: String
    receiptFileName: String
    receiptFileSize: Int
    remarks: String
    status: CollectionPaymentStatusTypes
    transactionId: String
    createdBy: User
    updatedBy: User
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt: DateTime
    deletedBy: User

    collection_period: CollectionPeriod #deprecated
    contact_pic: ContactPic #deprecated
    company_member: CompanyMember #deprecated
    payment_proof: String #deprecated
    payment_proof_file_name: String #deprecated
    payment_proof_file_size: String #deprecated
    receipt_file_name: String #deprecated
    receipt_file_size: Int #deprecated
    transaction_id: String #deprecated
    created_by: User #deprecated
    updated_by: User #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    deleted_at: DateTime #deprecated
    deleted_by: User #deprecated
  }

  type CollectionActivityLog {
    actionType: CollectionActionType
    createdBy: User
    createdAt: DateTime
    collection: Collection
    currentValues: JSON
    previousValues: JSON
    changedValues: JSON
  }

  type CollectionRemindOnDays {
    id: ID
    collection: Collection
    day: Int
    createdAt: DateTime
    updatedAt: DateTime

    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
  }

  enum ReminderStatusTypes {
    IN_PROGRESS
    SENT
    FAILED
  }

  enum ServiceHistoryTypes {
    WHATSAPP
    EMAIL
  }

  enum CollectionPaymentTypes {
    MANUAL
    SENANGPAY
  }

  enum CollectionPaymentStatusTypes {
    PENDING
    APPROVED
    REJECTED
  }

  enum CollectionStatusTypes {
    PENDING
    PAID
  }

  enum CollectionRemindTypes {
    FULL
    INSTALMENT
  }

  enum CollectionRemindIntervalTypes {
    Day
    Week
    Month
    Year
  }

  enum CollectionActiveTypes {
    TRUE
    FALSE
  }

  enum CollectionDraftType {
    TRUE
    FALSE
  }

  enum CollectionArchiveType {
    TRUE
    FALSE
  }

  enum CollectionPeriodStatusTypes {
    PENDING
    PAID
  }

  enum CollectionMessageLogStatusTypes {
    SENT
    FAILED
  }

  enum CollectionActionType {
    COLLECTION_CREATED
    COLLECTION_REMOVED
    COLLECTION_UPDATED_DUE_DATE
    COLLECTION_UPDATED_TITLE
    COLLECTION_UPDATED_REF_NO
    COLLECTION_MARKED_PAID
    COLLECTION_MARKED_UNPAID
    COLLECTION_UPLOADED_PAYMENT
    COLLECTION_UPLOADED_RECEIPT
    COLLECTION_PAYMENT_REJECTED
    COLLECTION_PAYMENT_APPROVED
    COLLECTION_REMOVED_MEMBER
    COLLECTION_ADDED_MEMBER
    COLLECTION_UPDATED_NAME
    COLLECTION_UPDATED_REMINDER
    COLLECTION_REMINDER_OPTION_UPDATED
    COLLECTION_MANUAL_RESEND
    COLLECTION_ARCHIVED
    COLLECTION_UNARCHIVED
    COLLECTION_PIC_UPDATED
  }

  input UpdateCollectionPaymentTypeInput {
    payment_type: CollectionPaymentTypes
  }

  input UpdateCollectionInput {
    title: String
    description: String
    refNo: String
    dueDate: DateTime
    remindInterval: CollectionRemindIntervalTypes
    startMonth: DateTime
    smsNotify: Boolean
    whatsappNotify: Boolean
    voiceNotify: Boolean
    emailNotify: Boolean
    notifyPics: [ID!]
    remindEnd_on: DateTime
    remindOnDate: Int
    remindOnMonth: Int
    isDraft: Boolean

    ref_no: String #deprecated
    due_date: DateTime #deprecated
    remind_interval: CollectionRemindIntervalTypes #deprecated
    start_month: DateTime #deprecated
    sms_notify: Boolean #deprecated
    whatsapp_notify: Boolean #deprecated
    voice_notify: Boolean #deprecated
    email_notify: Boolean #deprecated
    notify_pics: [ID!] #deprecated
    remind_end_on: DateTime #deprecated
    remind_on_date: Int #deprecated
    remind_on_month: Int #deprecated
    is_draft: Boolean #deprecated
  }

  input CreateCollectionInput {
    title: String!
    description: String
    periods: Int
    tagIds: [ID!]

    remindInterval: CollectionRemindIntervalTypes
    remindType: CollectionRemindTypes
    notifyTypes: [String]
    refNo: String # mark as mandatory once V3 is up
    payableAmount: Float # mark as mandatory once V3 is up
    dueDate: DateTime
    remindOnDate: Int
    remindOnMonth: Int
    remindEndOn: DateTime
    notifyPics: [ID!]
    isDraft: Boolean # mark as mandatory once V3 is up
    contactId: ID # mark as mandatory once V3 is up
    smsNotify: Boolean
    whatsappNotify: Boolean
    voiceNotify: Boolean
    emailNotify: Boolean
    paymentType: CollectionPaymentTypes
    startMonth: DateTime
    endMonth: DateTime

    remind_interval: CollectionRemindIntervalTypes # deprecated
    remind_type: CollectionRemindTypes # deprecated
    notify_types: [String] # deprecated
    ref_no: String! # deprecated
    payable_amount: Float! # deprecated
    due_date: DateTime # deprecated
    remind_on_date: Int # deprecated
    remind_on_month: Int # deprecated
    remind_end_on: DateTime # deprecated
    notify_pics: [ID!] # deprecated
    is_draft: Boolean! # deprecated
    contact_id: ID! # deprecated
    sms_notify: Boolean # deprecated
    whatsapp_notify: Boolean # deprecated
    voice_notify: Boolean # deprecated
    email_notify: Boolean # deprecated
    payment_type: CollectionPaymentTypes # deprecated
    start_month: DateTime # deprecated
    end_month: DateTime # deprecated
  }
  input CreateCollectionPaymentInput {
    collectionId: ID # mark as mandatory once V3 is up
    collectionPeriodId: ID # mark as mandatory once V3 is up
    collection_id: ID! # deprecated
    collection_period_id: ID! # deprecated
  }

  input DeletePaymentProofInput {
    collectionId: ID # mark as mandatory once V3 is up
    collectionPeriodId: ID # mark as mandatory once V3 is up
    collectionPaymentId: ID # mark as mandatory once V3 is up
    collection_id: ID! # deprecated
    collection_period_id: ID! # deprecated
    collection_payment_id: ID! # deprecated
  }

  input UpdatePaymentStatusInput {
    status: CollectionPaymentStatusTypes!
    remarks: String
    collectionId: ID # mark as mandatory once V3 is up
    collectionPeriodId: ID # mark as mandatory once V3 is up
    collectionPaymentId: ID # mark as mandatory once V3 is up
    collection_id: ID! # deprecated
    collection_period_id: ID! # deprecated
    collection_payment_id: ID! # deprecated
  }

  input UploadPaymentReceiptInput {
    collectionId: ID # mark as mandatory once V3 is up
    collectionPeriodId: ID # mark as mandatory once V3 is up
    collectionPaymentId: ID # mark as mandatory once V3 is up
    collection_id: ID! # deprecated
    collection_period_id: ID! # deprecated
    collection_payment_id: ID! # deprecated
  }

  input AssignMembersToCollectionInput {
    collectionId: ID!
    memberIds: [ID!]!
  }

  input RemoveMembersFromCollectionInput {
    collectionId: ID!
    memberIds: [ID!]!
  }

  extend type Query {
    collection(collectionId: ID!, isForMember: Boolean): Collection
    collectionPeriods(collectionId: ID!): [CollectionPeriod]
    collectionPeriod(collectionPeriodId: ID!): CollectionPeriod
  }

  extend type Mutation {
    updateCollectionPaymentType(
      collectionId: ID!
      input: UpdateCollectionPaymentTypeInput!
    ): Collection

    createCollection(
      input: CreateCollectionInput!
      attachment: Upload!
      remindOnDays: [Int!]
    ): Collection

    deleteCollections(collectionIds: [ID]!): [Collection]
    updateCollection(
      collectionId: ID!
      input: UpdateCollectionInput!
      attachment: Upload
      remindOnDays: [Int!]
    ): Collection
    deactivateCollections(collectionIds: [ID]!): [Collection]
    activateCollections(collectionIds: [ID]!): [Collection]
    archiveCollections(collectionIds: [ID]!): [Collection]
    unarchiveCollections(collectionIds: [ID]!): [Collection]
    collectionReminderRead(collectionId: ID!): CollectionReminderRead
    updateCollectionPeriodStatus(
      collectionId: ID!
      collectionPeriodId: ID!
      status: CollectionPeriodStatusTypes!
    ): CollectionPeriod
    uploadPaymentProof(
      input: CreateCollectionPaymentInput!
      attachment: Upload!
    ): CollectionPayment
    deletePaymentProof(input: DeletePaymentProofInput!): CollectionPayment
    updatePaymentStatus(input: UpdatePaymentStatusInput!): CollectionPayment
    uploadPaymentReceipt(
      input: UploadPaymentReceiptInput!
      attachment: Upload!
    ): CollectionPayment

    assignMembersToCollection(
      input: AssignMembersToCollectionInput!
    ): Collection
    removeMembersFromCollection(
      input: RemoveMembersFromCollectionInput!
    ): Collection
  }
`;

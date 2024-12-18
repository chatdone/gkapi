import { gql } from 'apollo-server-express';

export const schema = gql`
  scalar DateTime
  scalar Upload

  type Contact {
    id: ID!
    company: Company
    name: String
    address: String
    remarks: String
    type: ContactType
    groups: [ContactGroup]
    pics: [ContactPic]
    collections: [Collection]
    notes: [ContactNote]
    activities(
      limit: Int!
      offset: Int!
      tableType: ContactActivityTableType!
      isCount: Boolean!
    ): [ContactActivityRaw]
    tags: [Tag]
    dealValue: Float
    dealCreator: User
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt: DateTime
    createdBy: User
    updatedBy: User
    deletedBy: User
    taskBoards: [TaskBoard]
    attendances: [Attendance]
    edited: Boolean
    """
    Only for invoice generation
    """
    accountCode: String
    deal_value: Float #deprecated
    deal_creator: User #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    deleted_at: DateTime #deprecated
    created_by: User #deprecated
    updated_by: User #deprecated
    deleted_by: User #deprecated
    task_boards: [TaskBoard] #deprecated
  }

  type ContactNote {
    id: ID
    contact: Contact
    content: String
    noteContent: String
    user: User
    date: DateTime
  }

  type ContactActivity {
    assignee: CompanyMember
    attachment: TaskAttachment
    pic: ContactPic
    activityType: String
    toDate: DateTime
    fromDate: DateTime
    createdBy: User
    date: DateTime
    task: Task

    activity_type: String #deprecated
    to_date: DateTime #deprecated
    from_date: DateTime #deprecated
    created_by: User #deprecated
  }

  type ContactGroup {
    id: ID!
    name: String
    company: Company
    createdAt: DateTime
    updatedAt: DateTime
    type: ContactGroupType
    color: String
    contacts: [Contact]
    count: Int

    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
  }

  type ContactPic {
    id: ID!
    name: String
    remarks: String
    contact: Contact
    user: User

    contactNo: String
    nationalFormat: String
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt: DateTime
    createdBy: User
    updatedBy: User
    deletedBy: User

    contact_no: String #deprecated
    national_format: String #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    deleted_at: DateTime #deprecated
    created_by: User #deprecated
    updated_by: User #deprecated
    deleted_by: User #deprecated
  }

  type ContactTask {
    id: ID!
    name: String
    dueDate: DateTime
    status: ContactTaskStatusType

    due_date: DateTime #deprecated
  }

  type DeleteContactPicResponse {
    contact: Contact
  }

  type AuditLogValues {
    title: String
    archive: Int
    status: Int
    label: String

    refNo: String
    dueDate: String
    contactPicName: String
    teamName: String
    memberName: String
    contactGroupName: String
    contactNo: String
    contactAddress: String
    contactType: String
    contactName: String
    attachmentName: String

    ref_no: String #deprecated
    due_date: String #deprecated
    contact_pic_name: String #deprecated
    team_name: String #deprecated
    member_name: String #deprecated
    contact_group_name: String #deprecated
    contact_no: String #deprecated
    contact_address: String #deprecated
    contact_type: String #deprecated
    contact_name: String #deprecated
    attachment_name: String #deprecated
  }

  type AuditLogChangedValues {
    archive: Boolean
    invoice: Boolean
    title: Boolean
    dueDate: Boolean
    refNo: Boolean
    contactAddress: Boolean
    contactType: Boolean
    contactName: Boolean
    contactNo: Boolean
    contactPicName: Boolean
    contactGroup: Boolean
    collectionPayment: Boolean
    isCreate: Boolean
    markedPaid: Boolean
    collectorMember: Boolean
    companyMember: Boolean
    companyTeam: Boolean
    notifyPics: Boolean
    uploadedPayment: Boolean
    uploadedReceipt: Boolean
    rejectedPayment: Boolean

    due_date: Boolean #deprecated
    ref_no: Boolean #deprecated
    contact_address: Boolean #deprecated
    contact_type: Boolean #deprecated
    contact_name: Boolean #deprecated
    contact_no: Boolean #deprecated
    contact_pic_name: Boolean #deprecated
    contact_group: Boolean #deprecated
    collection_payment: Boolean #deprecated
    is_create: Boolean #deprecated
    marked_paid: Boolean #deprecated
    collector_member: Boolean #deprecated
    company_member: Boolean #deprecated
    company_team: Boolean #deprecated
    notify_pics: Boolean #deprecated
    uploaded_payment: Boolean #deprecated
    uploaded_receipt: Boolean #deprecated
    rejected_payment: Boolean #deprecated
  }

  type ContactActivityRaw {
    action: String
    timestamp: DateTime

    tableName: String
    previousValues: String
    currentValues: String
    changedValues: String

    table_name: String #deprecated
    previous_values: String #deprecated
    current_values: String #deprecated
    changed_values: String #deprecated
    # user: User
    # task: Task
    # taskAttachment: TaskAttachment

    # collection: Collection
    # contact: Contact
    # from_company_status: CompanyTeamStatus
    # to_company_status: CompanyTeamStatus
    # from_member: CompanyMember
    # to_member: CompanyMember
    # from_pic: ContactPic
    # to_pic: ContactPic
    # from_user: User
    # to_user: User
    # from_team: CompanyTeam
    # to_team: CompanyTeam
  }

  type BulkUploadContactsResponse {
    contacts: [Contact]
  }

  enum ContactActivityTableType {
    ALL
    TASKS
    COLLECTIONS
    CONTACTS
  }

  enum ContactActivityType {
    TASK_CREATED
    TASK_ARCHIVED
    TASK_UNARCHIVED
    TASK_REMOVED
    UPDATED_DUE_DATE
    UPDATED_TEAM_STATUS
    ASSIGNEE_ADDED
    ASSIGNEE_REMOVED
    PIC_ADDED
    PIC_REMOVED
    ATTACHMENT_UPLOADED
    ATTACHMENT_REMOVED
    # Add more activities as needed
  }

  enum ContactType {
    NONE
    INDIVIDUAL
    COMPANY
  }

  enum ContactGroupType {
    UNASSIGNED
    INDIVIDUAL
    COMPANY
  }

  enum ContactTaskStatusType {
    PENDING
    DONE
    REJECTED
  }

  input CreateContactInput {
    name: String!
    address: String
    type: ContactType!
    remarks: String
    deal_value: Float #deprecated
    dealValue: Float
    """
    Only for invoice generation
    """
    accountCode: String

    tagIds: [ID!]
  }

  input UpdateContactInput {
    name: String!
    address: String
    type: ContactType!
    remarks: String
    deal_value: Float #deprecated
    dealValue: Float
    """
    Only for invoice generation
    """
    accountCode: String
  }

  input CreateContactGroupInput {
    name: String!
    # type: ContactGroupType!
    # color: String!
  }

  input UpdateContactGroupInput {
    name: String
    # type: ContactGroupType
    # color: String
  }

  input CreateContactPicInput {
    name: String!
    email: String
    contactNo: String

    contact_no: String #deprecated
    remarks: String
  }

  input UpdateContactPicInput {
    name: String!
    email: String
    contactNo: String
    contact_no: String #deprecated
    remarks: String
  }

  input AddMembersToContactGroupInput {
    contact_ids: [ID]! #deprecated
    contactIds: [ID] # mark as mandatory once V3 is up
  }

  input ContactNoteInput {
    content: String
    noteContent: String
    date: DateTime
    userId: ID

    user_id: ID #deprecated
  }

  extend type Query {
    contact(id: ID!): Contact
    contacts(companyId: ID!): [Contact]
    contactGroups(companyId: ID!): [ContactGroup]
    contactGroup(companyId: ID!, groupId: ID!): ContactGroup
    contactActivities(
      contactId: ID!
      tableType: ContactActivityTableType!
      limit: Int!
      isCount: Boolean!
      offset: Int!
    ): [ContactActivityRaw]
  }

  extend type Mutation {
    createContact(
      companyId: ID!
      input: CreateContactInput!
      contactGroupId: ID
      dealCreator: ID
    ): Contact
    deleteContacts(companyId: ID!, contactIds: [ID]!): [Contact]
    updateContact(
      companyId: ID!
      contactId: ID!
      input: UpdateContactInput!
      contactGroupId: ID
      dealCreator: ID
    ): Contact
    createContactGroup(
      companyId: ID!
      input: CreateContactGroupInput!
    ): ContactGroup
    updateContactGroup(
      groupId: ID!
      input: UpdateContactGroupInput!
    ): ContactGroup
    deleteContactGroup(groupId: ID!): ContactGroup
    addMembersToContactGroup(
      groupId: ID
      input: AddMembersToContactGroupInput!
    ): [Contact]
    removeMemberFromContactGroup(groupId: ID!, contactId: ID!): ContactGroup
    createContactPic(
      companyId: ID!
      contactId: ID!
      input: CreateContactPicInput!
    ): ContactPic
    updateContactPic(
      companyId: ID!
      picId: ID!
      input: UpdateContactPicInput!
    ): ContactPic
    deleteContactPic(companyId: ID!, picId: ID!): DeleteContactPicResponse
    bulkUploadContacts(
      groupId: ID
      companyId: ID!
      attachment: Upload!
    ): BulkUploadContactsResponse

    createContactNote(contactId: ID!, input: ContactNoteInput!): ContactNote
    updateContactNote(contactNoteId: ID!, input: ContactNoteInput!): ContactNote
    """
    Ignores ids that does not exist and deletes the ones that do.
    """
    deleteContactNotes(contactNoteIds: [ID]!): [ContactNote]
  }
`;

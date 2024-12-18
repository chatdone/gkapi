import { gql } from 'apollo-server-express';

export const schema = gql`
  scalar DateTime

  type Company {
    id: ID
    id_num: Int
    name: String
    invitationCode: String
    invitationValidity: DateTime # deprecated
    description: String
    emailEnabled: Boolean
    smsEnabled: Boolean
    whatsappEnabled: Boolean
    phoneCallEnabled: Boolean
    createdBy: User
    updatedBy: User
    deletedBy: User
    idleTiming: Int
    settings: String
    slug: String
    user: User
    members: [CompanyMember]
    teams: [CompanyTeam]

    currentSubscription: Subscription

    # -------THESE ARE DEPRECATED AND WILL BE REMOVED
    subscriptions: [CompanySubscription]
    activeSubscription: [CompanySubscription]
    expiredSubscription: [CompanySubscription]
    # -----------------------------------

    employeeTypes: [EmployeeType]
    permission: String
    defaultTimezone: String
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt: DateTime
    logoUrl: String
    """
    Only for invoice generation
    """
    accountCode: String
    """
    Only for invoice generation
    """
    invoicePrefix: String
    address: String
    email: String
    phone: String
    website: String
    registrationCode: String
    invoiceStart: String
    default_timezone: String # deprecated
    employee_types: [EmployeeType] # deprecated
    active_subscription: [CompanySubscription] # deprecated
    created_by: User # deprecated
    updated_by: User # deprecated
    deleted_by: User # deprecated
    idle_timing: Int # deprecated
    email_enabled: Boolean # deprecated
    sms_enabled: Boolean # deprecated
    whatsapp_enabled: Boolean # deprecated
    phone_call_enabled: Boolean # deprecated
    invitation_code: String # deprecated
    invitation_validity: DateTime # deprecated
    created_at: DateTime # deprecated
    updated_at: DateTime # deprecated
    deleted_at: DateTime # deprecated
    logo_url: String # deprecated
  }

  type CompanyMember {
    id: ID!
    user: User
    type: CompanyMemberType
    position: String
    setting: CompanyMemberSettings
    permissions: [CompanyMemberPermissionScope]
    referenceImage: CompanyMemberReferenceImage
    hourlyRate: Float
    employeeType: EmployeeType
    createdAt: DateTime
    active: Boolean
    teams: [CompanyTeam]
    reference_image: CompanyMemberReferenceImage # deprecated
    hourly_rate: Float # deprecated
    employee_type: EmployeeType # deprecated
    created_at: DateTime # deprecated
  }

  type CompanyMemberPermissionScope {
    scope: String
    enabled: Boolean
  }

  type CompanyMemberSettings {
    senangPay: Int

    senang_pay: Int # deprecated
  }

  type CompanyTeam {
    id: ID!
    company: Company
    title: String

    statuses: [CompanyTeamStatus]
    members: [CompanyMember]

    createdAt: DateTime
    updatedAt: DateTime
    deletedAt: DateTime
    createdBy: User
    updatedBy: User
    deletedBy: User

    created_at: DateTime # deprecated
    updated_at: DateTime # deprecated
    deleted_at: DateTime # deprecated
    created_by: User # deprecated
    updated_by: User # deprecated
    deleted_by: User # deprecated
  }

  type CompanyWorkDaySetting {
    company: Company
    day: WorkDay
    open: Boolean
    startHour: String
    endHour: String
    timezone: String

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: User
    updatedBy: User

    start_hour: String # deprecated
    end_hour: String # deprecated
    created_by: User # deprecated
    updated_by: User # deprecated
    created_at: DateTime # deprecated
    updated_at: DateTime # deprecated
  }

  """
  Also referred to as "dynamic statuses". Refers to table card_statuses
  """
  type CompanyTeamStatus {
    id: ID!
    company: Company
    label: String
    percentage: Int
    color: String
    sequence: Int
    team: CompanyTeam
    parentStatus: CompanyTeamStatusType
    stage: StageType

    createdAt: DateTime
    updatedAt: DateTime
    deletedAt: DateTime
    createdBy: User
    updatedBy: User
    deletedBy: User

    parent_status: CompanyTeamStatusType # deprecated
    created_at: DateTime # deprecated
    updated_at: DateTime # deprecated
    deleted_at: DateTime # deprecated
    created_by: User # deprecated
    updated_by: User # deprecated
    deleted_by: User # deprecated
  }

  """
  Describes the reference image of the member for face verification
  """
  type CompanyMemberReferenceImage {
    status: CompanyMemberReferenceImageStatus
    remark: String

    imageUrl: String
    s3Bucket: String
    s3Key: String
    actionBy: User
    createdAt: DateTime
    updatedAt: DateTime

    image_url: String #deprecated
    s3_bucket: String #deprecated
    s3_key: String #deprecated
    action_by: User #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
  }

  type EmployeeType {
    id: ID!
    name: String
    archived: Boolean

    """
    Work schedule
    """
    workDaySettings: [CompanyWorkDaySetting]
    hasOvertime: Boolean

    has_overtime: Boolean #deprecated
  }

  type CompanyMemberReferenceImageResponse {
    s3Bucket: String
    s3Key: String
    uploadUrl: String

    s3_bucket: String #deprecated
    s3_key: String #deprecated
    upload_url: String #deprecated
  }
  type CompanyPermission {
    company: Company
    grants: String
  }

  type ResourcePermission {
    companyMembers: [CompanyMember]
    teams: [CompanyTeam]

    company_members: [CompanyMember] #deprecated
  }

  type BulkUploadMembersResponse {
    companyMembers: [CompanyMember]
    duplicateEmails: Int
  }

  type CompanyStorageList {
    type: String
    fileSize: Float
  }

  type CompanyStorageDetails {
    summary: [CompanyStorageList]
    totalUsageInKB: Float
    totalUsageInMB: Float
  }

  type CompanyPaymentMethod {
    stripeCustomerId: String
    stripePaymentMethodId: String
    brand: String
    last4: String
    expMonth: String
    expYear: String
    company: Company
    user: User
    isDefault: Boolean
    createdAt: DateTime
    updatedAt: DateTime
    createdBy: User
    updatedBy: User
  }

  type DeleteCompanyPaymentMethodResponse {
    success: Boolean
    affectedNum: Int
  }

  enum CompanyMemberType {
    ADMIN
    MANAGER
    MEMBER
  }

  enum CompanyTeamStatusType {
    PENDING
    DONE
    REJECTED
  }

  enum StageType {
    PENDING
    PASS
    FAIL
    CLOSED
  }

  enum CompanyMemberReferenceImageStatus {
    PENDING_APPROVAL
    APPROVED
    REJECTED
  }

  enum CompanyArchivedUpdate {
    UNARCHIVED
    ARCHIVED
  }

  """
  Add more resources as necessary, it will be combined with its own id, eg. task_26
  """
  enum ResourceType {
    TASK
    COLLECTION
  }

  enum WorkDay {
    MONDAY
    TUESDAY
    WEDNESDAY
    THURSDAY
    FRIDAY
    SATURDAY
    SUNDAY
  }

  input AddCompanyTeamStatusInput {
    label: String!
    percentage: Int!
    color: String!
    parent_status: CompanyTeamStatusType! #deprecated
    parentStatus: CompanyTeamStatusType #mark as mandatory once V3 is up
    stage: StageType #use this instead of parentStatus once V3 is up
  }

  input UpdateCompanyTeamStatusInput {
    label: String!
    percentage: Int!
    color: String!
    parent_status: CompanyTeamStatusType! #deprecated
    parentStatus: CompanyTeamStatusType #mark as mandatory once V3 is up
    stage: StageType #use this instead of parentStatus once v3 is up
  }

  input CreateCompanyInput {
    name: String!
    description: String
    """
    Only for invoice generation
    """
    accountCode: String
  }

  input UpdateCompanyInfoInput {
    name: String
    description: String
    logoUrl: String
    """
    Only for invoice generation
    """
    accountCode: String
    """
    Only for invoice generation
    """
    invoicePrefix: String
    address: String
    email: String
    phone: String
    website: String
    registrationCode: String
    invoiceStart: String
    logo_url: String #deprecated
  }

  input AddMemberToCompanyInput {
    email: String!
    position: String
    type: CompanyMemberType
    hourlyRate: Float
    employeeTypeId: ID

    hourly_rate: Float #deprecated
    employee_type_id: ID #deprecated
  }

  input UpdateCompanyMemberInfoInput {
    position: String
    type: CompanyMemberType
    hourlyRate: Float
    employeeTypeId: ID

    hourly_rate: Float #deprecated
    employee_type_id: ID #deprecated
  }

  input CreateCompanyTeamInput {
    title: String!
    memberIds: [ID]
    member_ids: [ID] #deprecated
  }

  input UpdateCompanyTeamInfoInput {
    title: String
    memberIds: [ID]
    member_ids: [ID] #deprecated
  }

  input CompanyTeamStatusSequenceInput {
    sequence: Int!
    company_team_status_id: ID! #deprecated
    companyTeamStatusId: ID #mark as mandatory once V3 is up
  }

  input UploadMemberReferenceImageInput {
    imageUrl: String #mark as mandatory once V3 is up
    s3Bucket: String #mark as mandatory once V3 is up
    s3Key: String #mark as mandatory once V3 is up
    image_url: String! #deprecated
    s3_bucket: String! #deprecated
    s3_key: String! #deprecated
  }

  input UpdateCompanyWorkDayInput {
    open: Boolean!
    startHour: String #mark as mandatory once V3 is up
    endHour: String #mark as mandatory once V3 is up
    start_hour: String! #deprecated
    end_hour: String! #deprecated
  }

  input UpdateCompanyPermissionsInput {
    member: UpdateCrudInput
    manager: UpdateCrudInput
  }

  input UpdateCrudInput {
    member: CommonCrud
  }

  input ResourcePermissionInput {
    companyMemberIds: [String]
    teamIds: [String]
    company_member_ids: [String] #deprecated
    team_ids: [String] #deprecated
  }

  input CreateCompanyPaymentMethodInput {
    companyId: ID!
    stripePaymentMethodId: String!
  }

  input DeleteCompanyPaymentMethodInput {
    companyId: ID!
    stripePaymentMethodId: String!
  }

  input SetDefaultCompanyPaymentMethodInput {
    companyId: ID!
    stripePaymentMethodId: ID!
  }

  extend type Query {
    company(id: ID!): Company
    companySlug(slug: String): Company
    companyMember(companyMemberId: ID!): CompanyMember
    companies(pagination: Pagination): [Company]

    companyTeam(id: ID!): CompanyTeam
    companyTeams(companyId: ID!): [CompanyTeam]
    teamStatuses(companyTeamId: ID!): [CompanyTeamStatus]
    senangPayUsers(companyId: ID!): [CompanyMember]

    companyProfileJson(companyId: ID!): String

    getReferenceImageUploadUrl(
      companyId: ID!
    ): CompanyMemberReferenceImageResponse

    companyWorkDaySettings(
      companyId: ID!
      employeeTypeId: ID!
    ): [CompanyWorkDaySetting]

    employeeType(employeeTypeId: ID!): EmployeeType
    companyStorage(companyId: ID!): CompanyStorageDetails

    companyPaymentMethods(companyId: ID!): [CompanyPaymentMethod]
  }

  extend type Mutation {
    createCompany(input: CreateCompanyInput!): Company
    deleteCompany(companyId: ID!): Company
    updateCompanyInfo(companyId: ID!, input: UpdateCompanyInfoInput!): Company
    uploadCompanyProfileImage(companyId: ID!, attachment: Upload!): Company
    addMemberToCompany(companyId: ID!, input: AddMemberToCompanyInput!): Company
    updateCompanyMemberInfo(
      companyMemberId: ID!
      input: UpdateCompanyMemberInfoInput!
    ): CompanyMember
    removeMemberFromCompany(companyId: ID!, companyMemberId: ID!): Company

    updateCompanyProfile(companyId: ID!, key: String!, value: String!): String
    updateCompanyTimezone(companyId: ID!, timezone: String!): String

    updateCompanyMemberActiveStatus(
      companyMemberId: ID!
      active: Boolean!
    ): CompanyMember

    createCompanyTeam(
      companyId: ID!
      input: CreateCompanyTeamInput!
    ): CompanyTeam
    deleteCompanyTeam(teamId: ID!): CompanyTeam
    updateCompanyTeamInfo(
      companyTeamId: ID!
      input: UpdateCompanyTeamInfoInput!
    ): CompanyTeam
    removeMemberFromCompanyTeam(
      companyTeamId: ID!
      teamMemberId: ID!
    ): CompanyTeam

    addCompanyTeamStatus(
      teamId: ID!
      input: AddCompanyTeamStatusInput!
    ): CompanyTeamStatus
    updateCompanyTeamStatus(
      teamId: ID!
      statusId: ID!
      input: UpdateCompanyTeamStatusInput!
    ): CompanyTeamStatus
    deleteCompanyTeamStatus(companyTeamStatusId: ID!): CompanyTeamStatus

    updateCompanyTeamStatusSequences(
      input: [CompanyTeamStatusSequenceInput]!
    ): [CompanyTeamStatus]

    addSenangPayUsers(companyId: ID!, userIds: [ID]!): [CompanyMember]
    removeSenangPayUsers(companyId: ID!, userIds: [ID]!): [CompanyMember]
    updateSenangPayOptions(
      companyId: ID!
      defaultPayment: Boolean
      instalmentOption: Boolean
      fullOption: Boolean
      enabled: Boolean
    ): Company

    setCompanyMemberReferenceImage(
      companyMemberId: ID!
      input: UploadMemberReferenceImageInput!
    ): CompanyMember

    setCompanyMemberReferenceImageStatus(
      companyId: ID!
      companyMemberIds: [ID]!
      status: CompanyMemberReferenceImageStatus!
      remark: String
    ): [CompanyMember]

    createEmployeeType(
      companyId: ID!
      name: String!
      overtime: Boolean!
      timezone: String
    ): EmployeeType

    updateEmployeeType(
      typeId: ID!
      name: String!
      overtime: Boolean!
      archived: CompanyArchivedUpdate
    ): EmployeeType

    archiveEmployeeType(typeId: ID!, archived: Boolean!): EmployeeType

    updateCompanyWorkDaySetting(
      companyId: ID!
      day: WorkDay!
      employeeTypeId: ID!
      input: UpdateCompanyWorkDayInput!
    ): CompanyWorkDaySetting

    bulkUploadMembers(
      companyId: ID!
      attachment: Upload!
    ): BulkUploadMembersResponse

    createCompanyPaymentMethod(
      input: CreateCompanyPaymentMethodInput!
    ): CompanyPaymentMethod

    deleteCompanyPaymentMethod(
      input: DeleteCompanyPaymentMethodInput!
    ): DeleteCompanyPaymentMethodResponse

    """
    The default payment option here refers to the card which will be used for creating GK transactions but
    it may not be the default card on the customer's Stripe object because the same customer may have different cards
    set as default across different companies
    """
    setDefaultCompanyPaymentMethod(
      input: SetDefaultCompanyPaymentMethodInput!
    ): CompanyPaymentMethod
  }
`;

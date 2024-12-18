import { gql } from 'apollo-server-express';

export const schema = gql`
  scalar DateTime
  scalar Latitude
  scalar Longitude

  type Attendance {
    id: ID!
    type: AttendanceType
    comments: String
    location: Location
    label: AttendanceLabel
    worked: Int
    overtime: Int
    lat: Latitude
    lng: Longitude
    address: String
    tags: [Tag]

    companyMember: CompanyMember
    startDate: DateTime
    endDate: DateTime
    submittedDate: DateTime
    commentsOut: String
    createdAt: DateTime
    updatedAt: DateTime
    timeTotal: Int
    verificationType: AttendanceVerificationType
    isLastOut: Boolean
    imageUrl: String
    s3Bucket: String
    s3Key: String
    contact: Contact

    company_member: CompanyMember
    start_date: DateTime
    end_date: DateTime
    submitted_date: DateTime
    comments_out: String
    created_at: DateTime
    updated_at: DateTime
    time_total: Int
    verification_type: AttendanceVerificationType
    is_last_out: Boolean
    image_url: String
    s3_bucket: String
    s3_key: String
  }

  type AttendanceLabel {
    id: ID!
    company: Company
    name: String
    color: String
    archived: Boolean
    description: String

    createdAt: DateTime
    updatedAt: DateTime

    created_at: DateTime
    updated_at: DateTime
  }

  type VerificationImageUploadUrlResponse {
    s3Bucket: String
    s3Key: String
    uploadUrl: String

    s3_bucket: String
    s3_key: String
    upload_url: String
  }

  type AttendanceDaySummary {
    day: Int
    month: Int
    """
    Deprecated
    """
    firstIn: DateTime
    firstAttendance: Attendance
    lastAttendance: Attendance
    year: Int
    tracked: Int
    worked: Int
    regular: Int
    overtime: Int
    attendances: [Attendance]

    generatedAt: DateTime
    updatedAt: DateTime
    createdAt: DateTime
    companyMember: CompanyMember

    generated_at: DateTime
    updated_at: DateTime
    created_at: DateTime
    company_member: CompanyMember
  }

  type AttendanceWeekSummary {
    week: Int
    month: Int
    year: Int
    monday: Int
    tuesday: Int
    wednesday: Int
    thursday: Int
    friday: Int
    saturday: Int
    sunday: Int

    companyMember: CompanyMember
    trackedTotal: Int
    workedTotal: Int
    regularTotal: Int
    overtimeTotal: Int
    generatedAt: DateTime
    updatedAt: DateTime
    createdAt: DateTime

    company_member: CompanyMember
    tracked_total: Int
    worked_total: Int
    regular_total: Int
    overtime_total: Int
    generated_at: DateTime
    updated_at: DateTime
    created_at: DateTime
  }

  type AttendanceMonthSummary {
    month: Int
    year: Int

    companyMember: CompanyMember
    trackedTotal: Int
    workedTotal: Int
    regularTotal: Int
    overtimeTotal: Int

    company_member: CompanyMember
    tracked_total: Int
    worked_total: Int
    regular_total: Int
    overtime_total: Int
  }

  type WorkHourTotals {
    tracked: Int
    worked: Int
    regular: Int
    overtime: Int
  }

  type AttendanceSettings {
    allowMobile: Boolean
    allowWeb: Boolean
    requireVerification: Boolean
    requireLocation: Boolean
    enable2d: Boolean
    enableBiometric: Boolean

    allow_mobile: Boolean
    allow_web: Boolean
    require_verification: Boolean
    require_location: Boolean
    enable_2d: Boolean
    enable_biometric: Boolean
  }

  type AttendanceMemberStats {
    total: Int
    overtime: Int
    break: Int
    worked: Int
  }

  enum AttendanceType {
    CLOCK
    BREAK
  }

  enum AttendanceVerificationType {
    BIOMETRIC
    DEVICE_PASSCODE # pin or pattern
    IMAGE_COMPARE # AWS Rekognition compare
  }

  input StartAttendanceEntryInput {
    type: AttendanceType!
    comments: String
    lat: Latitude
    lng: Longitude
    address: String
    tagIds: [ID!]

    verificationType: AttendanceVerificationType
    s3Bucket: String
    s3Key: String
    imageUrl: String

    verification_type: AttendanceVerificationType
    s3_bucket: String
    s3_key: String
    image_url: String
  }

  input AttendanceVerificationS3Object {
    bucket: String!
    key: String!
  }

  input SetAttendanceVerificationImageInput {
    imageUrl: String!
    s3Bucket: String!
    s3Key: String!
  }

  input GetAttendancesInput {
    companyId: ID
    companyMemberId: ID
    contactId: ID
    fromDate: DateTime
    toDate: DateTime

    company_id: ID!
    company_member_id: ID
    from_date: DateTime!
    to_date: DateTime!
  }

  input AttendanceLabelInput {
    name: String!
    color: String
    description: String
  }

  input AttendanceDaySummaryInput {
    day: Int!
    month: Int!
    year: Int!
    companyMemberId: ID
  }

  input AttendanceWeekSummaryInput {
    week: Int!
    month: Int!
    year: Int!
    companyMemberId: ID
  }

  input AttendanceMonthSummaryInput {
    week: [Int]!
    month: Int!
    year: Int!
    companyMemberId: ID
  }

  input UpdateAttendanceSettingsInput {
    allowMobile: Boolean
    allowWeb: Boolean
    requireVerification: Boolean
    requireLocation: Boolean
    enable2d: Boolean
    enableBiometric: Boolean

    allow_mobile: Boolean
    allow_web: Boolean
    require_verification: Boolean
    require_location: Boolean
    enable_2d: Boolean
    enable_biometric: Boolean
  }

  extend type Query {
    getVerificationImageUploadUrl(
      companyId: ID!
    ): VerificationImageUploadUrlResponse

    attendances(input: GetAttendancesInput!): [Attendance]

    attendanceLabels(companyId: ID!): [AttendanceLabel]

    memberLastOut(companyMemberId: ID!): Attendance

    getServerTime(companyId: ID!): DateTime

    attendanceDaySummary(
      companyId: ID!
      input: AttendanceDaySummaryInput!
    ): [AttendanceDaySummary]

    """
    selectedDate limit will only for one month
    """
    attendanceDaySummaries(
      companyId: ID!
      selectedDate: DateTime!
      companyMemberId: ID
    ): [AttendanceDaySummary]

    attendanceWeekSummary(
      companyId: ID!
      input: AttendanceWeekSummaryInput!
    ): [AttendanceWeekSummary]

    attendanceMonthSummary(
      companyId: ID!
      input: AttendanceMonthSummaryInput!
    ): [AttendanceMonthSummary]

    attendanceWeeklyForMonthSummary(
      companyId: ID!
      input: AttendanceMonthSummaryInput!
    ): [AttendanceWeekSummary]

    attendanceSettings(companyId: ID!): AttendanceSettings
    currentAttendance(memberId: ID!): Attendance
    attendanceMemberStats(memberId: ID!): AttendanceMemberStats
  }

  extend type Mutation {
    """
    Starts an attendance for either CLOCK or BREAK. If there is an open entry it will
    close it first.
    """
    startAttendanceEntry(
      companyMemberId: ID!
      locationId: ID
      labelId: ID
      contactId: ID
      input: StartAttendanceEntryInput!
    ): Attendance

    """
    Clock out without starting a new entry
    """
    closeAttendance(companyMemberId: ID!, commentsOut: String): Attendance
    closeAttendanceForUser(
      companyMemberId: ID!
      commentsOut: String
    ): Attendance

    createAttendanceLabel(
      companyId: ID!
      input: AttendanceLabelInput!
    ): AttendanceLabel

    updateAttendanceLabel(
      labelId: ID!
      input: AttendanceLabelInput!
    ): AttendanceLabel

    archiveAttendanceLabel(labelId: ID!, archived: Boolean!): AttendanceLabel

    updateAttendanceSettings(
      companyId: ID!
      input: UpdateAttendanceSettingsInput!
    ): AttendanceSettings

    #Deprecated? Not used anywhere as of 28-09-2022 for web/mobile
    setAttendanceVerificationImage(
      companyMemberId: ID!
      attendanceId: ID!
      input: SetAttendanceVerificationImageInput!
    ): Attendance
  }
`;

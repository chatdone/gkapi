export const SERVICE_TYPES = {
  SMS: 'SMS',
  EMAIL: 'Email',
  PHONE_CALL: 'PhoneCall',
  WHATSAPP: 'WhatsApp',
};

export const SERVICE_STATUS = {
  IN_PROGRESS: { value: 1, label: 'Processing' },
  SENT: { value: 2, label: 'Sent' },
  FAILED: { value: 3, label: 'Failed' },
  //   toArray: () => constantToArray(SERVICE_STATUS),
  //   toValueArray: () => constantToValueArray(SERVICE_STATUS)
};

export const DEFAULT_COMPANY_GRANTS = {
  manager: {
    member: {
      'create:any': [],
      'read:any': [],
      'update:any': [],
      'delete:any': [],
    },
  },
  member: {
    member: {
      'create:any': [],
      'read:any': [],
      'update:any': [],
      'delete:any': [],
    },
  },
};

export const memberTypes = {
  MEMBER: 'member',
  ADMIN: 'admin',
  MANAGER: 'manager',
};

export const ResourceTypes = {
  TASK: 'task',
  COLLECTION: 'collection',
};

export const CompanyStageType = {
  PENDING: 1,
  PASS: 2,
  FAIL: 3,
  CLOSED: 4,
};

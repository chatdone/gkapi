export const member = [
  {
    action: 'create',
    subject: 'Collection',
    conditions: {
      user_id: '${user.id}',
      company_id: '${company.id}',
      contact_id: '${contact.id}',
    },
  },
];

export const manager = [
  {
    action: 'create',
    subject: 'Collection',
    conditions: {
      user_id: '${user.id}',
    },
  },
];

export const admin = [
  {
    action: 'create',
    subject: 'Collection',
    conditions: {
      user_id: '${user.id}',
    },
  },
];

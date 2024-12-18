export const member = [
  {
    action: 'edit',
    subject: 'Company',
    conditions: {
      user_id: '${user.id}',
      company_id: '${company.id}',
      contact_id: '${contact.id}',
    },
  },
];

export const manager = [];

export const admin = [];

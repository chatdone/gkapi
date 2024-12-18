export type EmailPayload = {
  to: string;
  data: any;
  templateId: string;
  attachments: any;
  subject: string;
};

export type FpxEmailModel = {
  fpxTransactionId: string;
  dateAndTime: string;
  sellerName: string;
  merchantOrderNo: string;
  sellerOrderNo: string;
  buyerBank: string;
  debitStatus: string;
  creditStatus: string;
  transactionAmount: string;
  fpxStatus: string;
};

export type IncomingEmailModel = {
  dkim: string;
  email: string;
  to: string;
  from: string;
  sender_ip: string;
  spam_report: string;
  envelope: string;
  subject: string;
  spam_score: string;
  charsets: string;
  SPF: string;
};

export type EmailAttachmentModel = {
  filename: string;
  content: string;
  type: string | boolean;
};

import { gql } from 'apollo-server-express';
import _ from 'lodash';

export const schema = gql`
  scalar DateTime

  type BillingInvoice {
    id: ID
    project: TaskBoard
    docNo: String
    docDate: DateTime
    contactPic: ContactPic
    terms: Int
    remarks: String
    createdAt: DateTime
    createdBy: User
    updatedAt: DateTime
    updatedBy: User
    """
    Total discounted is calculated first before tax is applied.
    """
    totalDiscounted: Float
    """
    Total taxed is calculated after discount
    """
    totalTaxed: Float
    totalReceived: Float
    items: [BillingInvoiceItem]
    void: Boolean
    voidedAt: DateTime
    voidedBy: User
  }

  type BillingInvoiceItem {
    id: ID
    billingInvoice: BillingInvoice
    descriptionHdr: String
    sequence: Int
    task: Task
    """
    Either task name or the custom name, aka descriptionDtl
    """
    itemName: String
    qty: Int
    uom: String
    unitPrice: Float
    discountPercentage: Float
    tax: String
    taxInclusive: Boolean
    taxPercentage: Float
    taxAmount: Float
    """
    aka amount
    """
    billed: Float
    createdAt: DateTime
    createdBy: User
    updatedAt: DateTime
    updatedBy: User
  }

  input CreateBillingInvoiceInput {
    projectId: ID!
    docDate: DateTime!
    """
    Get companyName from contactId
    """
    picId: ID!
    terms: Int
    """
    Maximum 200 characters
    """
    remarks: String
  }

  input UpdateBillingInvoiceInput {
    billingInvoiceId: ID!
    """
    Maximum 20 characters
    """
    docNo: String
    docDate: DateTime
    """
    Get companyName from contactId
    """
    picId: ID
    terms: Int
    """
    Maximum 200 characters
    """
    remarks: String
  }

  input UpdateBillingInvoiceItemInput {
    invoiceItemId: ID!
    descriptionHdr: String
    sequence: Int
    """
    Either update taskId to change name or change the itemName
    """
    taskId: ID
    """
    aka Description_DTL, either update taskId to change name or change the itemName
    """
    itemName: String
    unitPrice: Float
    discountPercentage: Float
    taxPercentage: Float
  }

  input CreateBillingInvoiceItemInput {
    invoiceId: ID!
    taskId: ID
    customName: String
    unitPrice: Float
    discountPercentage: Float
    taxPercentage: Float
  }

  input ReceivePaymentInvoiceInput {
    invoiceId: ID!
    received: Float!
    date: DateTime
  }
  """
  Once voided, cannot be unvoided
  """
  input VoidInvoiceInput {
    invoiceId: ID!
  }

  input SendInvoiceInput {
    invoiceId: ID!
    emails: [String!]
  }

  extend type Query {
    billingInvoices(projectId: ID!): [BillingInvoice]
    billingInvoice(id: ID!): BillingInvoice

    billingInvoiceItem(id: ID!): BillingInvoiceItem
    billingInvoiceItems(invoiceId: ID!): [BillingInvoiceItem]
  }

  extend type Mutation {
    createBillingInvoice(input: CreateBillingInvoiceInput!): BillingInvoice
    updateBillingInvoice(input: UpdateBillingInvoiceInput!): BillingInvoice

    createBillingInvoiceItem(
      input: CreateBillingInvoiceItemInput!
    ): BillingInvoiceItem

    updateBillingInvoiceItem(
      input: UpdateBillingInvoiceItemInput!
    ): BillingInvoiceItem

    deleteBillingInvoices(ids: [ID!]!): [BillingInvoice]
    deleteBillingInvoiceItems(ids: [ID!]!): BillingInvoiceItem

    receivePaymentInvoice(input: ReceivePaymentInvoiceInput!): BillingInvoice
    """
    Once voided, cannot be unvoided
    """
    voidInvoice(input: VoidInvoiceInput!): BillingInvoice
    sendInvoice(input: SendInvoiceInput!): BillingInvoice
  }
`;

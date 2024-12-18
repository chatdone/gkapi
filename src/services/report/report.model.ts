import { UserId } from '@models/user.model';

export type CollectionReportRowModel = {
  createdAt: Date | string;
  dueDate: Date | string;
  collector: string;
  refNo: string;
  payableAmount: string | number;
  contactGroupName: string;
  assignee: string;
  notify_pics: string;
  status: string;
  remindType: string;
};

export type TaskReportRowModel = {
  id: number;
  id_text: string;
  name: string;
  jobIdText: string;
  statusLabel: string;
  dueDate: Date | string;
  createdAt: Date | string;
  boardName: string;
  companyName: string;
  contactName: string;
  teamTitle: string;
  assignee: string;
  pics: string;
  taskBoardType: string;
  taskBoardCategory: number;
  createdBy: UserId;
  taskBoardDescription: string;
  tagNames: string;
  tagColors: string;
};

export type ProjectTaskReportRowModel = {
  id: string;
  projectId: string;
  taskName: string;
  taskType: string;
  projectName: string;
  contactName: string;
  teamName: string;
  subStatus: string;
  start_date: string;
  end_date: string;
  actual_start: string;
  actual_end: string;
  projected_cost: string;
  actual_cost: string;
  variance: string;
  effort_spent: string;
  assignee: string;
  tagNames: string;
  tagColors: string;
};

export type ProjectReportRowModel = {
  id: string;
  projectId: string;
  taskType: string;
  projectName: string;
  contactNames: string;
  teamNames: string;
  statuses: string;
  subStatus: string;
  start_date: string;
  end_date: string;
  actual_start: string;
  actual_end: string;
  projected_cost: string;
  actual_cost: string;
  startDate: string;
  endDate: string;
  actualStart: string;
  actualEnd: string;
  projectedCost: string;
  actualCost: string;
  variance: string;
  effortSpent: string;
  assignees: string;
  tagNames: string;
  tagColors: string;
  projectOwners: string;
};

const keys = [
  'createdAt',
  'dueDate',
  'collector',
  'refNo',
  'payableAmount',
  'contactGroupName',
  'assignee',
  'notify_pics',
  'status',
  'remindType',
];

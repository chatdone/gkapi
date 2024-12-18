export const SortDirection = {
  ASC: 'asc',
  DESC: 'desc',
};

export const TaskSortType = {
  CREATED_AT: 'created_at',
  DUE_DATE: 'due_date',
  NAME: 'name',
  PRIORITY: 'priority',
  STAGE: 'status',
};

export const TaskBoardSortType = {
  CREATED_AT: 'created_at',
  NAME: 'name',
};

export const SUBSCRIPTION_CHANGE_ACTIONS = {
  DOWNGRADE: 'DOWNGRADE',
  CANCEL: 'CANCEL',
};

export const TASK_KANBAN_POSITION_BUFFER = 65535; // how much to add on top of the highest kanban card position when placing a new one

import AttendanceStore from './attendance/attendance.store';
import CollectionStore from './collection/collection.store';
import CollectorStore from './collector/collector.store';
import CompanyStore from './company/company.store';
import ContactStore from './contact/contact.store';
import DedocoStore from './dedoco/dedoco.store';
import HolidayStore from './holiday/holiday.store';
import LocationStore from './location/location.store';
import NotificationStore from './notification/notification.store';
import ReportStore from './report/report.store';
import SubscriptionStore from './subscription/subscription.store';
import TaskStore from './task/task.store';
import TeamStore from './team/team.store';
import TemplateStore from './template/template.store';
import TimesheetStore from './timesheet/timesheet.store';
import UrlStore from './url/url.store';
import UserStore from './user/user.store';
import EventManagerStore from './event-manager/event-manager.store';
import TagStore from './tag/tag.store';
import WorkspaceStore from './workspace/workspace.store';
import BillingStore from './billing/billing.store';

import { createLoaders } from './loaders';
import redis from './redis';

export {
  createLoaders,
  redis,
  AttendanceStore,
  CollectionStore,
  CollectorStore,
  CompanyStore,
  ContactStore,
  DedocoStore,
  HolidayStore,
  LocationStore,
  NotificationStore,
  ReportStore,
  SubscriptionStore,
  TaskStore,
  TeamStore,
  TemplateStore,
  TimesheetStore,
  UrlStore,
  UserStore,
  EventManagerStore,
  TagStore,
  WorkspaceStore,
  BillingStore,
};

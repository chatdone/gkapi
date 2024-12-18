import { CronJob } from 'cron';
import {
  AttendanceService,
  EventManagerService,
  NotificationService,
  SubscriptionService,
  TemplateService,
} from '@services';

const timezone = process.env.LOCAL_TIMEZONE;

const runOnStartup =
  process.env.TIMEZONE_FEATURE_TEST === 'true' ? true : false;

const runJobEveryMinute = async () => {
  if (process.env.CRON_TASK_REMINDERS_ENABLED) {
    NotificationService.remindTaskDueReminder();
    NotificationService.remindProjectTasksAndOverdueTasks();
  }
  if (process.env.CRON_ATTENDANCE_CLOCK_ENABLED) {
    AttendanceService.clockOutAndInOpenAttendances();
    EventManagerService.remindClockInBeforeWorkStart();
    EventManagerService.remindClockInAfterWorkStart();
    EventManagerService.remindClockOutAfterWorkEnd();
  }

  if (process.env.SUBSCRIPTION_REWORK) {
    SubscriptionService.runSubscriptionChanges();
  }
};

const runJobEveryHour = async () => {
  if (process.env.CRON_COLLECTION_REMINDERS_ENABLED) {
    NotificationService.remindCollectionOnDue();
  }

  if (process.env.SUBSCRIPTION_REWORK) {
    SubscriptionService.refreshSubscriptionQuota();
  }

  if (process.env.CRON_TASK_REMINDERS_ENABLED) {
    NotificationService.remindProjectTasksAndOverdueTasks();
  }

  if (process.env.CRON_RECURRING_TASKS_ENABLED) {
    TemplateService.getTasksForNextRecurringCreate();
  }
};

const runJobEveryDay = async () => {
  if (
    process.env.GK_ENVIRONMENT !== 'development' &&
    process.env.GK_ENVIRONMENT !== 'staging'
  ) {
    // refreshes month quota for legacy annual subscriptions
    SubscriptionService.handleRenewAnnualSubscriptionsTrigger();
  }
};

const jobEveryMin = new CronJob(
  '* * * * *',
  () => runJobEveryMinute(),
  null,
  true,
  timezone,
  undefined,
  runOnStartup, //Run on init
);

const jobEveryHour = new CronJob(
  '0 * * * *',
  () => runJobEveryHour(),
  null,
  true,
  timezone,
  undefined,
  true,
);

const jobEveryday = new CronJob(
  '0 11 * * *',
  () => runJobEveryDay(),
  null,
  true,
  timezone,
  undefined,
  false,
);

if (process.env.CRON_ENABLED) {
  jobEveryMin.start();
  jobEveryHour.start();
  jobEveryday.start();
}

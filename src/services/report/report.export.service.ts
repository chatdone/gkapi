/* eslint-disable prefer-const */
import _ from 'lodash';
import dayjs from 'dayjs';
import { ContactStore } from '@data-access';
import Excel from 'exceljs';
import { parseWorksheetHeader, parseWorksheetHeaderV2 } from './excel.util';
import { setFileResHeader } from '@tools/utils';
import { Response } from 'express';

import { minutesToHoursAndMinutes, secondsToHoursAndMinutes } from './tools';
import { ContactExpandedModel, ContactGroupId } from '@models/contact.model';
import {
  CompanyId,
  CompanyMemberModel,
  CompanyModel,
} from '@models/company.model';
import { UserModel } from '@models/user.model';

import { ProjectReportRowModel } from './report.model';
import { parseMoney } from '@services/collection/util';
import tz from 'dayjs/plugin/timezone';
import { CompanyService, ReportService } from '@services';
import { ReportQueryModelV2, ReportTypeService } from './report.service';
import { getCurrencyCodeByCompanyTimeZone } from '@utils/currency.util';
import { ProjectGroupWithTaskModel } from '@data-access/report/report.store';
dayjs.extend(tz);

type SqlAccountModel = {
  docDate: string;
  docNo: string;
  code: string;
  companyName: string;
  terms: string;
  descriptionHdr: string;
  seq: string;
  account: string;
  descriptionDtl: string;
  qty: string;
  uom: string;
  unitPrice: string;
  disc: string;
  tax: string;
  taxInclusive: string;
  taxAmt: string;
  amount: string;
  remark1: string;
};

const exportActiveTrialSubscriptionCompaniesAsExcel = async ({
  res,
}: {
  res: Response;
}) => {
  try {
    const result =
      await ReportService.generateActiveTrialSubscriptionCompaniesReport();

    const workbook = new Excel.Workbook();
    workbook.created = new Date();

    result.forEach((data, index) => {
      const worksheetName = `${index}_${data.name}`;
      const sheet = workbook.addWorksheet(worksheetName, {});
      sheet.columns = [
        { header: 'Email', key: 'email', width: 20 },
        { header: 'Subscription', key: 'package_title', width: 20 },
        { header: 'Start Date', key: 'start_date', width: 20 },
        { header: 'End Date', key: 'end_date', width: 20 },
      ];

      const emails = data.emails.map((email) => ({ email }));
      const subscriptions = data.subscriptions.map((sub) => ({
        package_title: sub.title,
        start_date: sub.startDate,
        end_date: sub.endDate,
      }));

      sheet.addRows(_.merge(emails, subscriptions));
    });

    const fileName = parseFileName('trial_export');
    setFileResHeader({ res, fileName });
    return await workbook.xlsx.write(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportContactGroupsAsExcel = async ({
  companyId,
  res,
  keyword,
  groupId,
}: {
  companyId: CompanyId;
  res: Response;
  keyword?: string;
  groupId?: ContactGroupId;
}): Promise<unknown> => {
  try {
    let contacts = (await ContactStore.listContactsForExport({
      companyId,
    })) as ContactExpandedModel[];

    if (contacts.length === 0) {
      throw new Error('No contacts to export');
    }

    if (groupId) {
      contacts = contacts.filter(
        (contact) => contact.contact_group_id === groupId,
      );
    }

    if (keyword) {
      const regex = new RegExp(keyword, 'i');

      contacts = contacts.filter((contact) => {
        const matchContact = contact.name?.match(regex);
        const matchPic = contact.pic_name?.match(regex);

        return matchContact || matchPic;
      });
    }

    const sortedByGroups = _.groupBy(
      contacts,
      (c: ContactExpandedModel) => c.contact_group_name,
    );

    const workbook = new Excel.Workbook();
    workbook.created = new Date();

    Object.keys(sortedByGroups).map((key) => {
      const worksheetName = key === 'null' ? 'Unassigned' : key;
      const sheet = workbook.addWorksheet(worksheetName, {});
      sheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Type', key: 'type', width: 20 },
        { header: 'PIC Name', key: 'pic_name', width: 20 },
        { header: 'PIC Email', key: 'pic_email', width: 20 },
        { header: 'PIC Contact', key: 'pic_phone', width: 20 },
        { header: 'Contact Created Date', key: 'created_at', width: 20 },
        //{ header: 'PIC Created Date', key: 'pic_created', width: 20 },
        //{ header: 'PIC Updated Date', key: 'pic_updated', width: 20 },
      ];

      const rowValues = sortedByGroups[key].map((e) => ({
        ...e,
        type: e.type === 1 ? 'Personal' : 'Company',
      }));

      sheet.addRows(rowValues);
    });

    const fileName = parseFileName('crm_export');
    setFileResHeader({ res, fileName });
    return await workbook.xlsx.write(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportCollectionRowsAsExcel = async (res: Response, rows: any) => {
  try {
    const formattedRows = _.map(rows, (row) => {
      return {
        ...row,
        dueDate: !row.dueDate ? '-' : row.dueDate,
        createdAt: !row.createdAt ? '-' : row.createdAt,
        payableAmount: parseMoney(row.payableAmount),
      };
    });

    /* --------------------------- Create new Excel -------------------------- */
    const workbook = new Excel.Workbook();
    workbook.created = new Date();

    /* ---------------------------- Create new sheet ---------------------------- */
    const worksheet = workbook.addWorksheet('Collections', {
      headerFooter: {
        firstHeader: 'Collections',
        firstFooter: dayjs().format('LLLL'),
      },
    });

    /* ----------------------------- Columns Configs ---------------------------- */
    const alignCenter = { alignment: { horizontal: 'center' } };
    const alignRight = { alignment: { horizontal: 'right' } };
    let columns = [
      {
        label: 'Created Date',
        key: 'createdAt',
        width: 25,
        style: alignCenter,
      },
      { label: 'Due date', key: 'dueDate', width: 25, style: alignCenter },

      { label: 'Client', key: 'collector', width: 25 },

      { label: 'Invoice', key: 'refNo', width: 25 },
      {
        label: 'Invoice Amount (RM)',
        key: 'payableAmount',
        width: 20,
        style: alignRight,
      },
      {
        label: 'Group',
        key: 'contactGroupName',
        width: 20,
        style: alignCenter,
      },
      { label: 'Assignee', key: 'assignee', width: 25 },
      { label: 'PIC', key: 'notify_pics', width: 25 },

      { label: 'Status', key: 'status', width: 25, style: alignCenter },
      { label: 'Type', key: 'remindType', width: 25, style: alignCenter },
      { label: 'Tags', key: 'tagNames', width: 25, style: alignCenter },
      // {
      //   label: 'Overdue Amount',
      //   key: 'overdueAmount',
      //   width: 20,
      //   style: alignCenter,
      // },
    ];

    // const companySettingsRes = await CompanyStore.getCompanySettings(companyId);
    // const activeSubscription = await CompanyStore.isCompanySubscriptionActive(
    //   companyId
    // );
    // const parsedCompanySettings = JSON.parse(companySettingsRes.settings);

    // const isSenangPayEnabled =
    //   _.get(parsedCompanySettings, 'senangpay.applicationStatus') === 2 &&
    //   _.get(parsedCompanySettings, 'senangpay.enabled');

    //only if senangPay is enabled
    columns.push({
      label: 'Payment Type',
      key: 'paymentTypeLabel',
      width: 20,
      style: alignCenter,
    });

    const headerArgs = {
      title: 'Collection Report',
      columns,
      paddingBottomRows: 1,
    } as any;
    parseWorksheetHeader(worksheet, { headerArgs });

    /* ---------------------------- Add Rows to Excel --------------------------- */
    worksheet.addRows(formattedRows);

    // const sumCol = ['E', 'J', 'K'];
    // const offset = 5;
    // _.map(sumCol, (col) => {
    //   const cell = worksheet.getCell(`${col}:${rows.length + offset}`);
    //   //@ts-ignore
    //   cell.value = {
    //     formula: `SUM(${col}${offset}:${col}${rows.length - 1 + offset})`,
    //   };
    //   cell.border = {
    //     top: { style: 'thin' },
    //     bottom: { style: 'thin' },
    //   };
    //   cell.font = { bold: true };
    // });

    const fileName = parseFileName('Receivables-Report');
    setFileResHeader({ res, fileName });
    return await workbook.xlsx.write(res);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const exportTasksRowsAsExcel = async (res: Response, rows: any) => {
  /* --------------------------- Create new Excel -------------------------- */
  const workbook = new Excel.Workbook();
  workbook.created = new Date();

  const formattedRows = rows.map((row: any) => ({
    ...row,
    boardName: row.contactName !== '-' ? row.contactName : row.boardName,
  }));

  /* ---------------------------- Create new sheet ---------------------------- */
  const worksheet = workbook.addWorksheet('Tasks', {
    headerFooter: {
      firstHeader: 'Tasks',
      firstFooter: dayjs().format('LLLL'),
    },
  });

  /* ----------------------------- Columns Configs ---------------------------- */
  const alignCenter = { alignment: { horizontal: 'center' } };
  const columns = [
    { label: 'Board Name', key: 'boardName', width: 25 },
    { label: 'Board Description', key: 'taskBoardDescription', width: 25 },
    { label: 'Task Name', key: 'name', width: 25 },
    { label: 'Status', key: 'statusLabel', width: 20, style: alignCenter },
    { label: 'Created date', key: 'createdAt', width: 20, style: alignCenter },
    { label: 'Due date', key: 'dueDate', width: 20, style: alignCenter },
    { label: 'Team', key: 'teamTitle', width: 25 },
    { label: 'Assignee', key: 'assignee', width: 25 },
    { label: 'Contact PIC', key: 'pics', width: 25 },
    { label: 'Tags', key: 'tagNames', width: 20, style: alignCenter },
  ];
  const headerArgs = {
    title: 'Tasks Report',
    columns,
    paddingBottomRows: 1,
  } as any;
  parseWorksheetHeader(worksheet, { headerArgs });
  /* ---------------------------- Add Rows to Excel --------------------------- */
  worksheet.addRows(formattedRows);

  const fileName = parseFileName('Tasks-Report') as string;
  setFileResHeader({ res, fileName });
  return await workbook.xlsx.write(res);
};

const exportProjectTasksRowsAsExcel = async (res: Response, rows: any) => {
  /* --------------------------- Create new Excel -------------------------- */
  const workbook = new Excel.Workbook();
  workbook.created = new Date();

  /* ---------------------------- Create new sheet ---------------------------- */
  const worksheet = workbook.addWorksheet('Project Tasks', {
    headerFooter: {
      firstHeader: 'Project Tasks',
      firstFooter: dayjs().format('LLLL'),
    },
  });

  /* ----------------------------- Columns Configs ---------------------------- */
  const alignCenter = { alignment: { horizontal: 'center' } };
  const alignLeft = { alignment: { horizontal: 'left' } };
  const columns = [
    { label: 'Assignee', key: 'assignee', width: 25 },
    { label: 'Effort Spent', key: 'effort_spent', width: 25, style: alignLeft },
    {
      label: 'Effort Spent (minutes)',
      key: 'effort_spent_minutes',
      width: 25,
      style: alignLeft,
    },
    { label: 'Project Task', key: 'taskName', width: 25 },
    { label: 'Project', key: 'projectName', width: 25 },
    { label: 'Project Owner', key: 'projectOwner', width: 25 },
    { label: 'Contact', key: 'contactName', width: 20 },
    { label: 'Team', key: 'teamName', width: 20 },
    { label: 'Status', key: 'subStatus', width: 25 },
    { label: 'Targeted Start', key: 'start_date', width: 25, style: alignLeft },
    { label: 'Targeted End', key: 'end_date', width: 25, style: alignLeft },
    { label: 'Actual Start', key: 'actual_start', width: 25, style: alignLeft },
    { label: 'Actual End', key: 'actual_end', width: 25, style: alignLeft },
    { label: 'Variance', key: 'variance', width: 25, style: alignLeft },
    { label: 'Projected Cost', key: 'projected_cost', width: 25 },
    { label: 'Actual Cost', key: 'actual_cost', width: 25 },
    { label: 'Tags', key: 'tagNames', width: 20, style: alignCenter },
  ];
  const headerArgs = {
    title: 'Project Tasks Report',
    columns,
    paddingBottomRows: 1,
  } as any;
  parseWorksheetHeader(worksheet, { headerArgs });
  /* ---------------------------- Add Rows to Excel --------------------------- */
  worksheet.addRows(rows);

  const fileName = parseFileName('ProjectTasks-Report') as string;
  setFileResHeader({ res, fileName });
  return await workbook.xlsx.write(res);
};

const exportProjectRowsAsExcel = async (
  res: Response,
  rows: any | ProjectReportRowModel[],
) => {
  /* --------------------------- Create new Excel -------------------------- */
  const workbook = new Excel.Workbook();
  workbook.created = new Date();

  /* ---------------------------- Create new sheet ---------------------------- */
  const worksheet = workbook.addWorksheet('Projects', {
    headerFooter: {
      firstHeader: 'Projects',
      firstFooter: dayjs().format('LLLL'),
    },
  });

  /* ----------------------------- Columns Configs ---------------------------- */
  const alignCenter = { alignment: { horizontal: 'center' } };
  const alignLeft = { alignment: { horizontal: 'left' } };
  const columns = [
    { label: 'Project', key: 'projectName', width: 25 },
    { label: 'Assignee', key: 'assignee', width: 50 },
    { label: 'Project Owners', key: 'projectOwner', width: 50 },
    { label: 'Statuses', key: 'subStatus', width: 25 },
    { label: 'Targeted Start', key: 'startDate', width: 25, style: alignLeft },
    { label: 'Targeted End', key: 'endDate', width: 25, style: alignLeft },
    {
      label: 'Actual Effort',
      key: 'effort_spent',
      width: 25,
      style: alignLeft,
    },
    {
      label: 'Actual Effort (minutes)',
      key: 'effort_spent_minutes',
      width: 25,
      style: alignLeft,
    },
    { label: 'Actual Start', key: 'actualStart', width: 25, style: alignLeft },
    { label: 'Actual End', key: 'actualEnd', width: 25, style: alignLeft },
    { label: 'Variance', key: 'variance', width: 25, style: alignLeft },
    { label: 'Projected Value', key: 'projectedCost', width: 25 },
    { label: 'Actual Value', key: 'actualCost', width: 25 },
    { label: 'Tags', key: 'tagNames', width: 50, style: alignCenter },
  ];
  const headerArgs = {
    title: 'Projects Report',
    columns,
    paddingBottomRows: 1,
  } as any;
  parseWorksheetHeader(worksheet, { headerArgs });
  /* ---------------------------- Add Rows to Excel --------------------------- */
  worksheet.addRows(rows);

  const totalActualCost = _.sum(rows.map((row: any) => +row.actualCost));
  const totalProjectedCost = _.sum(
    rows.map((row: any) =>
      row.projectedCost === '-' ? 0 : +row.projectedCost,
    ),
  );
  const totalActualEffort = _.sum(
    rows.map((row: any) => +row.effort_spent_minutes),
  );

  worksheet.addRow([
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    `Total: ${totalActualEffort.toFixed(2)}`,
    '',
    '',
    '',
    `Total: ${totalProjectedCost.toFixed(2)}`,
    `Total: ${totalActualCost.toFixed(2)}`,
    '',
  ]);

  const fileName = parseFileName('ProjectTasks-Report') as string;
  setFileResHeader({ res, fileName });
  return await workbook.xlsx.write(res);
};

const exportAttendanceRowsAsExcel = async ({
  res,
  rows,
  overtimeFlag,
}: {
  res: Response;
  rows: any;
  overtimeFlag: any;
}) => {
  const formattedRows = rows.map((row: any) => ({
    ...row,
    trackedTime:
      row.trackedTime !== '-'
        ? secondsToHoursAndMinutes(row.trackedTime) === '-'
          ? `${row.trackedTime}s`
          : secondsToHoursAndMinutes(row.trackedTime)
        : '-',
    overtime: row.overtime === 0 ? '-' : secondsToHoursAndMinutes(row.overtime),
    workedHours: secondsToHoursAndMinutes(row.workedHours),
    breakHours: secondsToHoursAndMinutes(row.breakHours),
  }));

  const totalTrackedMinutes = _.sum(
    rows.map((row: any) => _.toNumber(row.workedHoursMinutes)),
  );

  const totalWorkedHours = secondsToHoursAndMinutes(
    _.sum(rows.map((row: any) => _.toNumber(row.workedHours))),
  );

  const totalWorkedMinutes = _.sum(
    rows.map((row: any) => _.toNumber(row.workedHoursMinutes)),
  );

  const totalOvertime = secondsToHoursAndMinutes(
    _.sum(rows.map((row: any) => _.toNumber(row.overtime))),
  );

  const totalBreakHours = secondsToHoursAndMinutes(
    _.sum(rows.map((row: any) => _.toNumber(row.breakHours))),
  );

  /* --------------------------- Create new Excel -------------------------- */
  const workbook = new Excel.Workbook();
  workbook.created = new Date();

  /* ---------------------------- Create new sheet ---------------------------- */
  const worksheet = workbook.addWorksheet('Time Attendance', {
    headerFooter: {
      firstHeader: 'Time Attendance',
      firstFooter: dayjs().format('LLLL'),
    },
  });

  /* ----------------------------- Columns Configs ---------------------------- */
  const alignCenter = { alignment: { horizontal: 'center' } };
  const alignLeft = { alignment: { horizontal: 'left' } };

  let columns = [
    { label: 'Name', key: 'memberName', width: 25 },
    { label: 'Period', key: 'period', width: 20 },
    { label: 'Activities', key: 'activity', width: 20 },
    { label: 'Employee Type', key: 'employeeType', width: 20 },
    { label: 'Worked', key: 'workedHours', width: 25 },
    { label: 'Worked (minutes)', key: 'workedHoursMinutes', width: 25 },
    { label: 'Tracked (minutes)', key: 'trackedTimeMinutes', width: 25 },
    { label: 'Overtime', key: 'overtime', width: 25 },
    { label: 'Break Hours', key: 'breakHours', width: 25 },
    { label: 'Notes', key: 'comments', width: 25, style: alignLeft },
    { label: 'Contact', key: 'contactName', width: 20 },
    { label: 'Tags', key: 'tagNames', width: 25, style: alignLeft },
    {
      label: 'Location Name',
      key: 'locationName',
      width: 25,
      style: alignLeft,
    },
    {
      label: 'Location Address',
      key: 'locationAddress',
      width: 25,
      style: alignLeft,
    },
  ];

  // if (overtimeFlag === 'false') {
  //   columns = columns.filter((column) => {
  //     return column.key !== 'overtime';
  //   });
  // }
  const headerArgs = {
    title: 'Time Attendance Report',
    columns,
    paddingBottomRows: 1,
  } as any;
  parseWorksheetHeader(worksheet, { headerArgs });
  /* ---------------------------- Add Rows to Excel --------------------------- */
  worksheet.addRows(formattedRows);

  worksheet.addRow([
    '',
    '',
    '',
    '',
    `Total: ${totalWorkedHours}`,
    `Total: ${totalWorkedMinutes.toFixed(2)}`,
    `Total: ${totalTrackedMinutes.toFixed(2)}`,
    `Total: ${totalOvertime}`,
    `Total: ${totalBreakHours}`,
  ]);

  // if (overtimeFlag === 'false') {
  //   worksheet.addRow([
  //     '',
  //     '',
  //     '',
  //     '',
  //     `Total: ${totalTrackedTime}`,
  //     `Total: ${totalWorkedHours}`,
  //   ]);
  // }

  const fileName = parseFileName('TimeAttendance-Report') as string;
  setFileResHeader({ res, fileName });
  return await workbook.xlsx.write(res);
};

const exportReportTransactionRowsAsExcel = async ({
  res,
  rows,
}: {
  res: Response;
  rows: any;
}) => {
  const totalPrice = _.sum(rows.map((row: any) => _.toNumber(row?.price)));
  let currency = 'MYR';

  const formattedRows = rows.map((row: any) => {
    const currency = row?.currency === 'myr' ? 'MYR' : 'USD';
    return {
      ...row,
      price: row?.price ? `${parseMoney(row?.price)} ${currency}` : '-',
    };
  });

  const totalPriceFormatted = `${parseMoney(totalPrice)} ${currency}`;

  /* --------------------------- Create new Excel -------------------------- */
  const workbook = new Excel.Workbook();
  workbook.created = new Date();

  /* ---------------------------- Create new sheet ---------------------------- */
  const worksheet = workbook.addWorksheet('Payment Transactions', {
    headerFooter: {
      firstHeader: 'Payment Transactions',
      firstFooter: dayjs().format('LLLL'),
    },
  });

  /* ----------------------------- Columns Configs ---------------------------- */

  let columns = [
    { label: 'Invoice No.', key: 'invoice_no', width: 20 },
    { label: 'Date', key: 'date', width: 25 },
    { label: 'Status', key: 'status', width: 20 },
    { label: 'Price', key: 'price', width: 20 },
  ];

  const headerArgs = {
    title: 'Payment Transactions Report',
    columns,
    paddingBottomRows: 1,
  } as any;
  parseWorksheetHeader(worksheet, { headerArgs });
  /* ---------------------------- Add Rows to Excel --------------------------- */
  worksheet.addRows(formattedRows);

  worksheet.addRow(['', '', '', `Total: ${totalPriceFormatted}`]);

  const fileName = parseFileName('PaymentTransactions-Report') as string;
  setFileResHeader({ res, fileName });
  return await workbook.xlsx.write(res);
};

const exportSqlInvoiceReport = async (
  res: Response,
  rows: SqlAccountModel[],
) => {
  /* --------------------------- Create new Excel -------------------------- */
  const workbook = new Excel.Workbook();
  workbook.created = new Date();

  /* ---------------------------- Create new sheet ---------------------------- */
  const worksheet = workbook.addWorksheet('GK-SQLAcc-Export', {});

  /* ----------------------------- Columns Configs ---------------------------- */

  const columns = [
    { header: 'DocDate', key: 'docDate', width: 30 },
    { header: 'DocNo(20)', key: 'docNo', width: 30 },
    { header: 'Code(10)', key: 'code', width: 30 },
    { header: 'CompanyName(100)', key: 'companyName', width: 30 },
    { header: 'TERMS(10)', key: 'terms', width: 30 },
    { header: 'Description_HDR(200)', key: 'descriptionHdr', width: 30 },
    { header: 'SEQ', key: 'seq', width: 30 },
    { header: 'ACCOUNT(10)', key: 'account', width: 30 },
    { header: 'Description_DTL(200)', key: 'descriptionDtl', width: 30 },
    { header: 'Qty', key: 'qty', width: 30 },
    { header: 'UOM', key: 'uom', width: 30 },
    { header: 'UnitPrice', key: 'unitPrice', width: 30 },
    { header: 'DISC(20)', key: 'disc', width: 30 },
    { header: 'Tax(10)', key: 'tax', width: 30 },
    { header: 'TaxInclusive', key: 'taxInclusive', width: 30 },
    { header: 'TaxAmt', key: 'taxAmt', width: 30 },
    { header: 'Amount', key: 'amount', width: 30 },
    { header: 'Remark1(200)', key: 'remark1', width: 30 },
  ];
  worksheet.columns = columns;
  /* ---------------------------- Add Rows to Excel --------------------------- */
  worksheet.addRows(rows);

  const fileName = parseFileName('GK-SQLAcc-Export') as string;
  setFileResHeader({ res, fileName });
  return await workbook.xlsx.write(res);
};

const exportReportV2 = async (
  res: Response,
  payload: {
    rows: ReportQueryModelV2[];
    reportType: ReportTypeService;
    company: CompanyModel;
    dateRange: [Date, Date];
  },
) => {
  let timeoutId = setTimeout(() => {
    throw new Error('Operation timed out');
  }, 10000);
  try {
    const { rows, reportType, company, dateRange } = payload;

    const companyCurrency = await getCurrencyCodeByCompanyTimeZone(company.id);
    const companyTimezone = await CompanyService.getCompanyDefaultTimezone({
      companyId: company.id,
    });

    /* --------------------------- Create new Excel -------------------------- */
    const workbook = new Excel.Workbook();
    workbook.created = new Date();

    /* ---------------------------- Create new sheet ---------------------------- */
    const worksheet = workbook.addWorksheet(`${_.capitalize(reportType)}`, {
      headerFooter: {
        firstHeader: _.capitalize(reportType),
        firstFooter: dayjs().format('LLLL'),
      },
    });

    const customColumnNames: { name: string; type: number }[] = [];

    rows.forEach((row) =>
      row.customColumnNames?.forEach((name) =>
        customColumnNames.push({ name: name.name, type: name.type }),
      ),
    );

    const titleRow = [
      'Group',
      'Task',
      'Assignee',
      'Statuses',
      'Targeted Start',
      'Targeted End',
      'Actual Start',
      'Actual End',
      'Targeted Hour',
      'Actual Hour',
      'Actual Minutes',
      'Variance (Hours)',
      `Budget (${companyCurrency})`,
      `Actual (${companyCurrency})`,
      `Variance (${companyCurrency})`,
      `Billable`,
      `Tags`,
      ...customColumnNames.map((name) => name?.name),
    ];

    /* ----------------------------- Columns Configs ---------------------------- */

    const firstRow = worksheet.getRow(1);
    firstRow.font = {
      bold: true,
      size: 14,
    };

    worksheet.addRow([`${_.capitalize(reportType)} Report`]);
    //generated at
    worksheet.addRow([
      `Generated At:  ${dayjs()
        .tz(companyTimezone)
        .format('DD/MM/YYYY hh:mm:ss A')}`,
    ]);

    worksheet.addRow([]);
    worksheet.addRow([]);

    // // company name
    worksheet.addRow([`Company Name: ${company.name}`]);
    // // report type
    worksheet.addRow([`Report Type: ${_.capitalize(reportType)}`]);
    // // date range
    worksheet.addRow([
      _.isEmpty(dateRange)
        ? 'Date Range: All'
        : `Date Range: ${dayjs(dateRange[0]).format('LL')} - ${dayjs(
            dateRange[1],
          ).format('LL')}`,
    ]);

    worksheet.addRow([]);
    worksheet.addRow([]);

    let grandTotalTargetedMinutes = 0;
    let grandTotalActualHour = '0:00';
    let grandTotalActualMinutes = 0;
    let grandTotalVarianceMinutes = 0;
    let grandTotalBudget = 0;
    let grandTotalActualCost = 0;
    let grandTotalVarianceBudget = 0;
    const grandNumberValues: any[] = [];

    for (const row of rows) {
      const reportTypeTitle =
        reportType === 'project'
          ? `Project Name: ${row?.projectName}`
          : reportType === 'assignee'
          ? `Assignee: ${row?.assigneeName}`
          : `Team Name: ${row?.teamName}`;
      worksheet.addRow([reportTypeTitle]);

      worksheet.addRow([
        `Project Owners: ${
          row?.projectOwnerNames ? row?.projectOwnerNames : '-'
        }`,
      ]);

      worksheet.addRow(titleRow);

      const numberValues: any[] = [];

      for (const group of row?.projectGroups) {
        for (let i = 0; i < group.tasks.length; i++) {
          const valuesObj: any[] = [];

          group.tasks[i]?.customValuesObj?.forEach((value) => {
            valuesObj.push(value);
          });

          const values: {
            name: string;
            order: number;
            type: number;
            columnName: string;
          }[] = [];
          customColumnNames.forEach((v, i) =>
            valuesObj.forEach(
              (val) =>
                val.name === v.name &&
                +val.type === +v.type &&
                values.push({
                  name: val?.value,
                  order: i,
                  type: v?.type,
                  columnName: v?.name,
                }),
            ),
          );
          values.sort((a, b) => a.order - b.order);
          const highestOrder = _.last(values)?.order as number;

          const orderedCustomValues =
            _.range(0, highestOrder + 1).map((i) => {
              const value = values.find((v) => v.order === i);

              if (value?.type === 2) {
                numberValues.push({
                  name: value?.columnName,
                  value: value?.name,
                  order: value?.order,
                });
              }
              return values.find((v) => v.order === i)?.name || '';
            }) || [];

          worksheet.addRow([
            i === 0 ? group?.projectGroupName : '',
            group.tasks[i]?.name,
            group.tasks[i]?.assigneeNames,
            group.tasks[i]?.statusName,
            group.tasks[i]?.targetedStart,
            group.tasks[i]?.targetedEnd,
            group.tasks[i]?.actualStart,
            group.tasks[i]?.actualEnd,
            group.tasks[i]?.targetedHour,
            group.tasks[i]?.actualHour,
            (group.tasks[i]?.actualMinutes || 0)?.toString(),
            (group.tasks[i]?.varianceHours || 0)?.toString(),
            (group.tasks[i]?.budget || 0)?.toString(),
            (group.tasks[i]?.actualCost || 0)?.toString(),
            parseMoney((group.tasks[i]?.varianceBudget || 0) as number),
            group.tasks[i]?.billable ? '1' : '0',
            group.tasks[i]?.tagNames,
            ...orderedCustomValues,
          ]);
        }

        const totalBudget = group.tasks.reduce((acc, task) => {
          if (task?.budget) {
            return acc + +task?.budget;
          } else {
            return acc;
          }
        }, 0);

        grandTotalBudget += totalBudget;

        const totalActualCost = group.tasks.reduce((acc, task) => {
          if (task?.actualCost) {
            return acc + +task?.actualCost;
          } else {
            return acc;
          }
        }, 0);

        grandTotalActualCost += totalActualCost;

        const totalVarianceBudget = group.tasks.reduce((acc, task) => {
          if (task?.varianceBudget) {
            return acc + +task?.varianceBudget;
          } else {
            return acc;
          }
        }, 0);

        grandTotalVarianceBudget += totalVarianceBudget;

        const totalVarianceMinutes = group.tasks.reduce((acc, task) => {
          if (task?.varianceMinutes) {
            return acc + +task?.varianceMinutes;
          } else {
            return acc;
          }
        }, 0);

        grandTotalVarianceMinutes += totalVarianceMinutes;

        grandTotalActualMinutes += group.totalActualMinutes;
        grandTotalTargetedMinutes += group.totalTargetedMinutes;

        const summedData = numberValues.reduce((acc, curr) => {
          if (!acc[curr.order]) {
            acc[curr.order] = parseFloat(curr.value);
          } else {
            acc[curr.order] += parseFloat(curr.value);
          }
          return acc;
        }, {});

        const arr = Object.entries(summedData);

        arr.sort((a, b) => +b[0] - +a[0]);

        let arrangedTotal: any = [];
        if (!_.isEmpty(arr)) {
          const highestOrder = arr[0][0];
          arrangedTotal = _.range(0, +highestOrder + 1).map((order) => {
            const item = arr.find((item) => item[0] === order.toString());
            return item ? `Total: ${item[1]}` : '';
          });
        }

        worksheet.addRow([]);
        worksheet.addRow([
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          `Total: ${minutesToHoursAndMinutes(group.totalTargetedMinutes)} `,
          `Total: ${minutesToHoursAndMinutes(group.totalActualMinutes)} `,
          `Total: ${group.totalActualMinutes}`,
          `Total: ${minutesToHoursAndMinutes(group.totalVarianceMinutes)} `,
          `Total: ${parseMoney(totalBudget)}`,
          `Total: ${parseMoney(totalActualCost)}`,
          `Total: ${parseMoney(totalVarianceBudget)}`,
          '',
          '',
          ...arrangedTotal,
        ]);
      }

      numberValues.forEach((v) => grandNumberValues.push(v));

      worksheet.addRow([]);
    }

    worksheet.eachRow((row, rowNumber) => {
      //@ts-ignore
      if (row.values.includes('Budget (MYR)')) {
        row.eachCell(function (cell, colNumber) {
          if (cell.value) {
            row.getCell(colNumber).font = { bold: true };
            //align center
            row.getCell(colNumber).alignment = { horizontal: 'center' };
            cell.border = {
              bottom: { style: 'thin', color: { argb: '000000' } },
              top: { style: 'thin', color: { argb: '000000' } },
            };
          }
        });
      }
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 2) {
        row.eachCell(function (cell, colNumber) {
          if (cell.value) {
            row.getCell(colNumber).font = { bold: true };
          }
        });
      }
      row.eachCell(function (cell, colNumber) {
        if (
          cell.value &&
          //@ts-ignore
          (cell.value.includes('Project Name') ||
            //@ts-ignore
            cell.value.includes('Assignee Name') ||
            //@ts-ignore
            cell.value.includes('Team Name') ||
            //@ts-ignore
            cell.value.includes('Project Owners'))
        ) {
          row.getCell(colNumber).font = { bold: true };

          //adjust width of cell
          row.getCell(colNumber).alignment = { wrapText: true };
        } else if (
          cell.value &&
          //@ts-ignore
          (cell.value.includes('Project Report') ||
            //@ts-ignore
            cell.value.includes('Generated At:') ||
            //@ts-ignore
            cell.value.includes('Company Name:') ||
            //@ts-ignore
            cell.value.includes('Report Type:') ||
            //@ts-ignore
            cell.value.includes('Date Range:'))
        ) {
          row.getCell(colNumber).font = { bold: true };
          row.getCell(colNumber).alignment = { horizontal: 'left' };
          //@ts-ignore
        } else {
          row.getCell(colNumber).alignment = { horizontal: 'left' };
        }
      });
    });

    const widthObjArr = _.range(0, customColumnNames.length).map(() => {
      return { width: 20 };
    });

    const columns = [
      { width: 50 },
      { width: 50 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      ...widthObjArr,
    ];
    //adjust columns with
    worksheet.columns = columns;

    grandTotalActualHour = minutesToHoursAndMinutes(grandTotalActualMinutes);

    const summedData = grandNumberValues.reduce((acc, curr) => {
      if (!acc[curr.order]) {
        acc[curr.order] = parseFloat(curr.value);
      } else {
        acc[curr.order] += parseFloat(curr.value);
      }
      return acc;
    }, {});

    const arr = Object.entries(summedData);

    arr.sort((a, b) => +b[0] - +a[0]);

    let arrangedTotal: any = [];
    if (!_.isEmpty(arr)) {
      const highestOrder = arr[0][0];
      arrangedTotal = _.range(0, +highestOrder + 1).map((order) => {
        const item = arr.find((item) => item[0] === order.toString());
        return item ? `Total: ${item[1]}` : '';
      });
    }

    worksheet.addRow([
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      `Total: ${minutesToHoursAndMinutes(grandTotalActualMinutes)} `,
      `Total: ${grandTotalActualHour}`,
      `Total: ${grandTotalActualMinutes}`,
      `Total: ${minutesToHoursAndMinutes(grandTotalVarianceMinutes)} `,
      `Total: ${parseMoney(grandTotalBudget)}`,
      `Total: ${parseMoney(grandTotalActualCost)}`,
      `Total: ${parseMoney(grandTotalVarianceBudget)}`,
      '',
      '',
      ...arrangedTotal,
    ]);

    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    worksheet.addRow(['Notes:']);
    worksheet.addRow([
      'Assignee: The user who is assigned to work on the task.',
    ]);
    worksheet.addRow(['Status: The status of the task.']);
    worksheet.addRow([
      'Targeted Start: The date where you target to start working on the task.',
    ]);
    worksheet.addRow([
      'Targeted End: The date where you target to complete the task.',
    ]);
    worksheet.addRow([
      'Actual Start: The date where you start working on the task.',
    ]);
    worksheet.addRow([
      'Actual End: The date where you have finished the task.',
    ]);
    worksheet.addRow([
      'Targeted Hours: The budgeted number of hours to be spent on the task.',
    ]);
    worksheet.addRow([
      'Actual Hours: The actual number of hours spent on the task.',
    ]);
    worksheet.addRow([
      'Actual Minutes: The actual number of minutes spent on the task.',
    ]);
    worksheet.addRow([
      'Variance (Hours): The difference between the targeted hours and actual hours.',
    ]);
    worksheet.addRow([
      'Budget (MYR): The budgeted cost to be spent on the task.',
    ]);
    worksheet.addRow(['Actual (MYR): The actual cost spent on the task.']);
    worksheet.addRow([
      'Variance (MYR): The difference between the budget (myr) and actual (myr).',
    ]);
    worksheet.addRow(['Billable: 1=billable; 0=non-billable']);

    const lastRow = worksheet.getRow(worksheet.rowCount - 18);
    lastRow.border = {
      bottom: { style: 'thin', color: { argb: 'black' } },
      top: { style: 'thin', color: { argb: 'black' } },
    };
    lastRow.font = { bold: true };

    // make every row has wrapText
    worksheet.eachRow(function (row, rowNumber) {
      row.eachCell(function (cell, colNumber) {
        cell.alignment = { wrapText: true };
      });
    });

    /* ---------------------------- Add Rows to Excel --------------------------- */

    const fileName = parseFileName(`${reportType}-Report`) as string;

    setFileResHeader({ res, fileName });
    clearTimeout(timeoutId);
    return await workbook.xlsx.write(res);
  } catch (error) {
    console.error(error);
    clearTimeout(timeoutId);
    return res
      .status(500)
      .send({ message: (error as unknown as Error).message });
  }
};

const parseFileName = (reportName: any, ext = 'xlsx') =>
  `${reportName}-${dayjs().format('YYYYMMDDHHmmssSSS')}.${ext}`;

export {
  exportTasksRowsAsExcel,
  exportCollectionRowsAsExcel,
  exportContactGroupsAsExcel,
  exportProjectTasksRowsAsExcel,
  exportAttendanceRowsAsExcel,
  exportReportTransactionRowsAsExcel,
  exportActiveTrialSubscriptionCompaniesAsExcel,
  exportProjectRowsAsExcel,
  exportSqlInvoiceReport,
  exportReportV2,
};

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import _ from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(tz);

export const numberToLetter = (i: any) =>
  _.toUpper(String.fromCharCode(96 + i));
const lastRowBorder = (worksheet: any) => {
  _.map(worksheet.lastRow._cells, (cell) => {
    worksheet.getCell(cell._address).border = {
      bottom: { style: 'thin', color: { argb: '000000' } },
    };
  });
};

export const parseWorksheetHeader = (
  worksheet: any,
  { headerArgs }: { headerArgs: any },
) => {
  const timestamp = true;
  const paddingBottomRows = 2;

  const filters = {};
  if (!worksheet) return 0;
  const columnsCount = headerArgs.columns.length;
  const lastLetter = numberToLetter(columnsCount);
  let i = 0;

  const addHeaderLabel = (value: any) => {
    i++;
    const cellId = `A${i}`;
    const lastCellId = `${lastLetter}${i}`;
    worksheet.addRow();
    worksheet.mergeCells(cellId, lastCellId);
    const cell = worksheet.getCell(cellId);
    cell.style = { alignment: { horizontal: 'left' }, font: { bold: true } };
    cell.value = value;
  };

  // Add Title
  if (headerArgs.title) {
    i++;
    const cellId = 'A1';
    const lastCellId = `${lastLetter}1`;
    worksheet.addRow();
    worksheet.mergeCells(cellId, lastCellId);

    const cell = worksheet.getCell(cellId);
    cell.value = headerArgs.title;
    cell.style = {
      alignment: { horizontal: 'center' },
      font: { bold: true, size: 14 },
    };
    lastRowBorder(worksheet);
  }

  // Add Subtitle
  if (headerArgs.subtitle) {
    i++;
    const cellId = 'A2';
    const lastCellId = `${lastLetter}2`;
    worksheet.addRow();
    worksheet.mergeCells(cellId, lastCellId);

    const cell = worksheet.getCell(cellId);
    cell.value = headerArgs.subtitle;
    cell.style = { alignment: { horizontal: 'center' } };
  }

  _.map(filters, (value, key) =>
    addHeaderLabel(`${_.startCase(key)}:  ${value}`),
  );
  if (headerArgs.timezone) addHeaderLabel(`Timezone: ${headerArgs.timezone}`);
  if (headerArgs.by) addHeaderLabel(`Generated By:  ${headerArgs.by}`);
  if (timestamp)
    addHeaderLabel(
      `Generated At:  ${dayjs()
        .tz('Asia/Kuala_Lumpur')
        .format('DD/MM/YYYY hh:mm:ss A')}`,
    );

  lastRowBorder(worksheet);

  const paddingBottom = [];
  for (let ii = 0; ii < paddingBottomRows; ii++) {
    paddingBottom.push({});
  }
  worksheet.addRows(paddingBottom);
  worksheet.mergeCells(`A${i + 1}`, `${lastLetter}${paddingBottomRows + i}`);

  const tableHeaderRowIndex = 1 + paddingBottomRows + i;
  _.map(headerArgs.columns, (c, index) => {
    const { style, label } = c;
    const cellId = `${numberToLetter(index + 1)}:${tableHeaderRowIndex}`;
    const cell = worksheet.getCell(cellId);
    cell.value = label;
    cell.style = { ...style, font: { bold: true } };
    cell.border = {
      bottom: { style: 'thin', color: { argb: '000000' } },
      top: { style: 'thin', color: { argb: '000000' } },
    };
  });
  worksheet.columns = _.map(headerArgs.columns, (o) => ({
    ..._.omit(o, 'label'),
  }));

  return i;
};

export const parseWorksheetHeaderV2 = (
  worksheet: any,
  {
    headerArgs,
    info,
  }: {
    headerArgs: any;
    info: { companyName: string; dateRange: [Date, Date]; reportType: string };
  },
) => {
  const { companyName, dateRange, reportType } = info;
  const timestamp = true;
  const paddingBottomRows = 4;

  const filters = {};
  if (!worksheet) return 0;
  const columnsCount = headerArgs.columns.length;
  const lastLetter = numberToLetter(columnsCount);
  let i = 0;

  const addHeaderLabel = (value: any) => {
    i++;
    const cellId = `A${i}`;
    const lastCellId = `${lastLetter}${i}`;
    worksheet.addRow();

    worksheet.mergeCells(cellId, lastCellId);
    const cell = worksheet.getCell(cellId);
    cell.style = { alignment: { horizontal: 'left' }, font: { bold: true } };
    cell.value = value;
  };

  // Add Title
  if (headerArgs.title) {
    i++;
    const cellId = 'A1';
    const lastCellId = `${lastLetter}1`;
    worksheet.addRow();
    worksheet.mergeCells(cellId, lastCellId);

    const cell = worksheet.getCell(cellId);
    cell.value = headerArgs.title;
    cell.style = {
      alignment: { horizontal: 'left' },
      font: { bold: true, size: 14 },
    };
    lastRowBorder(worksheet);
  }

  // Add Subtitle
  if (headerArgs.subtitle) {
    i++;
    const cellId = 'A2';
    const lastCellId = `${lastLetter}2`;
    worksheet.addRow();
    worksheet.mergeCells(cellId, lastCellId);

    const cell = worksheet.getCell(cellId);
    cell.value = headerArgs.subtitle;
    cell.style = { alignment: { horizontal: 'center' } };
  }

  _.map(filters, (value, key) =>
    addHeaderLabel(`${_.startCase(key)}:  ${value}`),
  );
  if (headerArgs.timezone) addHeaderLabel(`Timezone: ${headerArgs.timezone}`);
  if (headerArgs.by) addHeaderLabel(`Generated By:  ${headerArgs.by}`);
  if (timestamp)
    addHeaderLabel(
      `Generated At:  ${dayjs()
        .tz('Asia/Kuala_Lumpur')
        .format('DD/MM/YYYY hh:mm:ss A')}`,
    );

  const date = dateRange
    ? `Date Range: ${dayjs(dateRange[0]).format('YYYY-MM-DD')} - ${dayjs(
        dateRange[1],
      ).format('YYYY-MM-DD')}`
    : 'Date Range: All';

  addHeaderLabel(`Company Name: ${companyName}`);
  addHeaderLabel(`Report Type: ${reportType}`);
  addHeaderLabel(date);

  lastRowBorder(worksheet);

  const paddingBottom = [];
  for (let ii = 0; ii < paddingBottomRows; ii++) {
    paddingBottom.push({});
  }
  worksheet.addRows(paddingBottom);
  worksheet.mergeCells(`A${i + 1}`, `${lastLetter}${paddingBottomRows + i}`);

  const tableHeaderRowIndex = 1 + paddingBottomRows + i;
  _.map(headerArgs.columns, (c, index) => {
    const { style, label } = c;

    const cellId = `${numberToLetter(index + 1)}:${tableHeaderRowIndex}`;

    const cell = worksheet.getCell(cellId);

    // cell.value = label;
    // make row bold
    cell.style = { ...style };

    // cell.border = {
    //   bottom: { style: 'thin', color: { argb: '000000' } },
    //   top: { style: 'thin', color: { argb: '000000' } },
    // };
  });

  worksheet.columns = _.map(headerArgs.columns, (o) => ({
    ..._.omit(o, 'label'),
  }));
};

export const styleBorderBottom = (worksheet: any, columns: any) => {
  const row = worksheet.lastRow;
  const lastRowIndex = row._number;
  const borderBottom = { bottom: { style: 'thin', color: { argb: '000000' } } };

  _.map(columns, (c, index) => {
    const cellId = `${numberToLetter(index + 1)}:${lastRowIndex}`;
    const cell = worksheet.getCell(cellId);
    cell.border = borderBottom;
  });
};

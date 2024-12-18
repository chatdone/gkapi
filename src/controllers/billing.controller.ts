import _ from 'lodash';
import { Request, Response } from 'express';
import { CompanyService } from '@services';
import { setFileResHeader } from '@tools/utils';
import { Readable } from 'stream';
import { BillingStore, CompanyStore, createLoaders } from '@data-access';
import { BillingInvoiceModel } from '@models/billing.model';
import { ProjectModel } from '@models/task.model';
import { CompanyModel, CompanyProfileModel } from '@models/company.model';
import { ContactModel, ContactPicModel } from '@models/contact.model';
import dayjs from 'dayjs';
import axios from 'axios';
import logger from '@tools/logger';
import { UserModel } from '@models/user.model';

export const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;
    const loaders = createLoaders();

    const invoice = (await loaders.billingInvoices.load(
      invoiceId,
    )) as BillingInvoiceModel;

    if (!invoice) {
      throw new Error('Invoice does not exist');
    }

    setFileResHeader({ res, fileName: `${invoice.docNo}.pdf` as string });

    const readable = new Readable();

    //Get HTML content from HTML file
    const html = await generateHtml(invoice);

    const pdf = await generatePdf({ body: { html } });

    readable.push(pdf);
    readable.push(null);

    return readable.pipe(res);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const generateHtml = async (
  invoice: BillingInvoiceModel,
  sentBy?: UserModel,
): Promise<string> => {
  try {
    const loaders = createLoaders();
    const projectId = invoice.projectId;
    const project = (await loaders.taskBoards.load(projectId)) as ProjectModel;
    const company = (await loaders.companies.load(
      project.companyId,
    )) as CompanyModel;

    let companyLogoUrl = company.logoUrl;

    let logoBase64;

    if (!company.logoUrl) {
      logoBase64 = blankImageBase64;
    } else {
      logoBase64 = await CompanyService.getCompanyLogoInBase64(companyLogoUrl);
    }

    // get pic
    const pic = (await loaders.contactPics.load(
      invoice.picId,
    )) as ContactPicModel;
    const contact = (await loaders.contacts.load(
      pic.contactId,
    )) as ContactModel;

    const companyProfile = (await CompanyStore.getCompanyProfile({
      companyId: company.id,
    })) as CompanyProfileModel;
    const companyPrefix = companyProfile?.invoicePrefix || 'IV';

    const invoiceCode = `${companyPrefix}-${invoice.docNo}`;

    const isVoided = invoice.void;

    const terms = +invoice.terms;
    let dueDate;
    if (_.isNumber(terms) && !_.isNaN(terms)) {
      dueDate = dayjs(invoice.docDate).add(terms, 'day').format('DD MMM YYYY');
    } else {
      dueDate = 'Terms invalid';
    }

    const items = await BillingStore.getBillingInvoiceItemsByInvoiceId(
      invoice.id,
    );

    const totalDiscounted = items
      .reduce((acc, item) => {
        const discountedAmount = item?.amount * (item.discountPercentage / 100);
        return acc + discountedAmount;
      }, 0)
      .toFixed(2);

    const totalTaxed = items
      .reduce((acc, item) => {
        const discountAmount = item.amount * (item.discountPercentage / 100);
        const discountedAmount = item.amount - discountAmount;
        const taxedAmount = discountedAmount * (item.taxPercentage / 100);
        return acc + taxedAmount;
      }, 0)
      .toFixed(2);

    const totalBilled = items.reduce((acc, item) => {
      const discountAmount = item.amount * (item.discountPercentage / 100);
      const discountedAmount = item.amount - discountAmount;

      const taxAmount = discountedAmount * (item.taxPercentage / 100);
      const billedAmount = discountedAmount + taxAmount;

      return acc + billedAmount;
    }, 0);

    const totalBilledFixed = totalBilled.toFixed(2);

    const balanceDue = (totalBilled - (+invoice.totalReceived || 0)).toFixed(2);
    const html = `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Static Template</title>
  </head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin-top: 50px;
      margin-bottom: 50px;
    }
    

    .header {
      width: 100%;
      display: flex;
      justify-items: center;
      justify-content: center;
      align-content: center;
    }

    .table-group {
      width: 100%;
      display: flex;
      justify-items: space-between;
      justify-content: space-between;
      align-content: space-between;
      font-size: 14px;
    }

    .arco-table-tfoot .arco-table-td {
      background-color: unset;
      border-bottom: none;
    }

    .arco-table-tfoot .arco-table-td:first-child 
    .arco-table-tfoot .arco-table-td:last-child {
      font-weight: 600;
    }

    .arco-table-tfoot .arco-table-td:nth-child(2) {
      text-align: right;
    }

    .voidGroup {
      position:absolute;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      transform: rotate(45deg);
      opacity: 0.5;
      justify-items: center;
      align-items: center;
      margin-left:30px;
    }
    .void {
      font-size: 100px;
    }
  </style>
  <body>
    <div class="header">
      <div style="width: 100%; display: flex; justify-content: space-between;">
        <img
          src="${logoBase64}"
        alt="logo"
          style="display: block; width: 50px; height: 50px;"
        />
        <h1>INVOICE</h1>
      </div>
    </div>
    <div class="table-group">
      <table style="text-align: left;">
        <tr>
          <th>Bill To</th>
        </tr>
        <tr>
          <td><b>${contact?.name}</b></td>
        </tr>
        <tr>
            <td style="width: 150px;">
                ${pic?.name}
            </br>
            ${contact?.address || 'No address'}
              </td>
            
          
        </tr>
      </table>

      <table style="text-align: right;">
        
        <tr>
          <td>
            <b>Invoice Number</b>
          </br>
          ${invoiceCode}
        </td>
        </tr>
        <tr>
            <td>
              <b>Invoice Date</b>
            </br>
            ${dayjs(invoice?.docDate).format('DD MMM YYYY')}
          </td>
          </tr>
          <tr>
              <td>
                <b>Due Date</b>
              </br>
              ${dueDate}
            </td>
            </tr>
        
       
      </table>
    </div>
  </br>
    <table style="width: 100%;">
      <colgroup>
        <col style="width: 25px;">
        <col style="width: 300px;">
        <col style="width: 100px;">
        <col style="width: 60px;">
        <col style="width: 60px;">
        <col style="width: 100px;">
      </colgroup>
      <thead>
        <tr class="arco-table-tr">
          <th class="arco-table-th" style="text-align: center;">
            <div style="text-align:right;">
              <span >#</span>
            </div>
          </th>
          <th class="arco-table-th">
            <div style="text-align:left;">
              <span >Item</span>
            </div>
          </th>
          <th class="arco-table-th" style="text-align: right;">
            <div style="text-align:right;">
              <span >Gross (RM)</span></div></th>
              <th class="arco-table-th" style="text-align: right;">
                <div style="text-align:right; width:100px;">
                  <span >Disc (%)</span>
                </div>
              </th>
              <th class="arco-table-th" style="text-align: right;">
                <div style="text-align:right;">
                  <span >Tax (%)</span>
                </div>
              </th>
                <th class="arco-table-th" style="text-align: right;">
                  <div style="text-align:right;">
                    <span >Billed (RM)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
          
              ${items.map((item, index) => {
                const discountPercentage = `${item?.discountPercentage}`;

                const taxPercentage = `${item?.taxPercentage}`;

                const discountAmount =
                  item.amount * (item.discountPercentage / 100);

                const discountedAmount = item.amount - discountAmount;

                const taxAmount = discountedAmount * (item.taxPercentage / 100);

                const billedAmount = (discountedAmount + taxAmount).toFixed(2);

                return `
                <tr class="arco-table-tr">
                <td class="arco-table-td" style="text-align: center;">
                  <div style="text-align: left;">
                    <span class="arco-table-cell-wrap-value">
                      <div class="text-gray-300">${index + 1}</div>
                    </span>
                    </div>
                    </td>
                    <td class="arco-table-td"><div style="text-align: left;">
                        <span class="arco-table-cell-wrap-value">
                            <span>${item?.descriptionDtl}</span>
                        </span>
                        </div>
                    </td>
                    <td class="arco-table-td" style="text-align: right;">
                        <div style="text-align: right;">
                            <span class="arco-table-cell-wrap-value">${
                              item?.amount
                            }</span>
                        </div>
                    </td>
                    <td class="arco-table-td" style="text-align: right;">
                        <div style="text-align: right;">
                            <span class="arco-table-cell-wrap-value">${discountPercentage}</span>
                        </div>
                    </td>
                    <td class="arco-table-td" style="text-align: right;">
                        <div style="text-align: right;">
                            <span class="arco-table-cell-wrap-value">${taxPercentage}</span>
                        </div>
                    </td>
                    <td class="arco-table-td" style="text-align: right;">
                        <div style="text-align: right;">
                            <span class="arco-table-cell-wrap-value">${billedAmount}</span>
                        </div>
                    </td>
                </tr>
                `;
              })}
            </tbody>
            <tfoot class="arco-table-tfoot">
                <tr style="text-align: right;">
                    <td class="arco-table-td text-right" colspan="5">Discount (RM)</td>
                    <td class="arco-table-td text-right font-bold">${totalDiscounted}</td>
                        </tr>
                        <tr style="text-align: right;">
                            <td class="arco-table-td text-right" colspan="5">Tax (RM)</td>
                            <td class="arco-table-td text-right font-bold">${totalTaxed}</td>
                        </tr>
                            <tr style="text-align: right;">
                            <td class="arco-table-td text-right" colspan="5">Total (RM)</td>
                            <td class="arco-table-td text-right font-bold">${
                              isVoided ? '0.00' : totalBilledFixed
                            }</td>
                        </tr >
                            <tr style="text-align: right;">
                            <td class="arco-table-td text-right" colspan="5">Balance Due (RM)</td>
                    <td class="arco-table-td text-right font-bold">${
                      isVoided ? '0.00' : balanceDue
                    }</td>
              </tr>
            </tfoot>
          </table>

        </br>

        <p>
          Notes:
          </br>
          ${invoice?.remarks || ''}
        </p>
        <hr>

        <div class="table-group">
            <table style="text-align: left;">
              
              <tr style="width: 150px;">
                <td><b>${company?.name}${
      companyProfile?.registrationCode
        ? `(${companyProfile?.registrationCode})`
        : ''
    }</b>
                </br>
                ${companyProfile?.address ? companyProfile.address : ''}
                </br>
                ${
                  companyProfile?.phone
                    ? companyProfile?.phone
                    : sentBy?.contact_no
                    ? sentBy?.contact_no
                    : ''
                }
                </td>
              </tr>
              
            </table>
      
            <table style="text-align: right;">
              
                <tr style="width: 150px;">
                  <td>
                    ${
                      companyProfile?.email
                        ? companyProfile?.email
                        : sentBy?.email
                        ? sentBy?.email
                        : ''
                    }
                  </br>
                  ${companyProfile?.website ? companyProfile.website : ''}
                  </td>
                </tr>
                
              </table>
          </div>
  </body>
</html>
    `;

    return html;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const generatePdf = async ({ body }: { body: unknown }) => {
  try {
    const api = axios.create({
      baseURL: process.env.HTML_TO_PDF_API,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const stringifiedBody = JSON.stringify(body);

    const res = await api
      .post('/', stringifiedBody)
      .then((response) => {
        const base64Pdf = response.data.body;

        const buffer = Buffer.from(base64Pdf, 'base64');

        return buffer;
      })
      .catch((err) => {
        logger.logError({
          error: err,
          payload: {
            service: 'billing.controller',
            fnName: 'generatePdf',
            stringifiedBody,
            apiFail: true,
          },
        });
      });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'billing.controller',
        fnName: 'generatePdf',
        body,
      },
    });
  }
};

const blankImageBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPwAAAD8CAYAAABTq8lnAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALOSURBVHgB7dMBAQAgDMCga//O+h6DDpy3Bki4A2QIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkOI8BAiPIQIDyHCQ4jwECI8hAgPIcJDiPAQIjyECA8hwkPIBxraBfRO2tS0AAAAAElFTkSuQmCC';

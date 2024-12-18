import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { createLoaders } from '@data-access';
import {
  CollectionModel,
  CollectionPaymentModel,
} from '@models/collection.model';
import { CollectionService, EmailService } from '@services';
import { setFileResHeader } from '@tools/utils';
import { Readable } from 'stream';
import { ContactModel } from '@models/contact.model';
import { CompanyModel } from '@models/company.model';

const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const { collectionId } = req.params;
    const collection = (await CollectionService.getCollection(
      collectionId,
    )) as CollectionModel;

    if (!collection) throw new Error('Collection id does not exist');

    const file = await CollectionService.downloadFile({
      filePath: collection.invoice,
      fileName: collection.file_name,
    });

    setFileResHeader({ res, fileName: collection.file_name as string });

    const buffer = Buffer.from(file.Body);
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    return readable.pipe(res);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const downloadPaymentReceipt = async (req: Request, res: Response) => {
  try {
    const { collectionPaymentId } = req.params;
    const collectionPayment = (await CollectionService.getCollectionPayment(
      collectionPaymentId,
    )) as CollectionPaymentModel;

    if (!collectionPayment)
      throw new Error('Collection Payment id does not exist');

    const file = await CollectionService.downloadFile({
      filePath: collectionPayment.receipt,
      fileName: collectionPayment.receipt_file_name,
    });

    setFileResHeader({
      res,
      fileName: collectionPayment.receipt_file_name as string,
    });

    const buffer = Buffer.from(file.Body);
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    return readable.pipe(res);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const downloadPaymentProof = async (req: Request, res: Response) => {
  try {
    const { collectionPaymentId } = req.params;
    const collectionPayment = (await CollectionService.getCollectionPayment(
      collectionPaymentId,
    )) as CollectionPaymentModel;

    if (!collectionPayment)
      throw new Error('Collection Payment id does not exist');

    const file = await CollectionService.downloadFile({
      filePath: collectionPayment.payment_proof,
      fileName: collectionPayment.payment_proof_file_name,
    });

    setFileResHeader({
      res,
      fileName: collectionPayment.payment_proof_file_name as string,
    });

    const buffer = Buffer.from(file.Body);
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    return readable.pipe(res);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const testSendPaymentLink = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  const loaders = createLoaders();
  try {
    const { id } = req.params;

    const collection = (await loaders.collections.load(id)) as CollectionModel;
    if (!collection) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Collection does not exist' });
    }

    const contact = (await loaders.contacts.load(
      collection.contact_id,
    )) as ContactModel;
    if (!contact) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Contact does not exist' });
    }

    const company = (await loaders.companies.load(
      contact.company_id,
    )) as CompanyModel;
    if (!company) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Company does not exist' });
    }

    const payload = {
      name: contact.name,
      rr_id: collection.id_text,
      contact_id: contact.id_text,
      company_id: company.id_text,
      ref_no: collection.ref_no,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || '', {
      // expiresIn: '15m'
    });

    const urlString = `${process.env.WEBSITE_URL}${process.env.PAYMENT_PATH}?token=${token}`;
    console.log(urlString);

    if (req.body.send_email === true) {
      await EmailService.sendBasicEmail({
        to: req.body.to,
        from: 'GoKudos Test <no-reply@gokudos.io>',
        subject: 'GoKudos - You have been requested to make payment',
        html: `Please click on this link to pay: <a href='${urlString}'>Make payment on GoKudos</a>`,
      });
    }

    return res.status(StatusCodes.OK).json({
      payload,
      token,
      url: urlString,
    });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
  }
};

export default {
  downloadInvoice,
  downloadPaymentProof,
  downloadPaymentReceipt,
  testSendPaymentLink,
};

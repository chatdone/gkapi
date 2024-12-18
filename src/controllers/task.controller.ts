import _ from 'lodash';
import { Request, Response } from 'express';
import { TaskService } from '@services';
import { setFileResHeader } from '@tools/utils';
import { Readable } from 'stream';
import { TaskAttachmentModel } from '@models/task.model';

export const downloadTaskAttachment = async (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;

    const taskAttachment = (await TaskService.getTaskAttachmentByPublicId(
      attachmentId,
    )) as TaskAttachmentModel;

    if (!taskAttachment) throw new Error('Task Attachment id does not exist');

    const file = await TaskService.downloadFile({
      filePath: taskAttachment.path,
      fileName: taskAttachment.name,
    });

    setFileResHeader({ res, fileName: taskAttachment.name as string });

    const buffer = Buffer.from(file.Body);
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    return readable.pipe(res);
  } catch (error) {
    return res.status(500).json(error);
  }
};

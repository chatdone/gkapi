import { Request, Response } from 'express';
import express from 'express';
import { DedocoController } from '@controllers/index';

const router = express.Router();

router.post('/login', (req: Request, res: Response) => {
  DedocoController.login(req, res);
});
router.get('/token', (req: Request, res: Response) => {
  DedocoController.getToken(req, res);
});
router.post('/workflow', (req: Request, res: Response) => {
  DedocoController.createSigningWorkflow(req, res);
});
router.post('/workflow/callback/:workflowId', (req: Request, res: Response) => {
  DedocoController.callbackSigningWorkflow(req, res);
});
router.get('/document', (req: Request, res: Response) => {
  DedocoController.getDocument(req, res);
});
router.get('/document/updated', (req: Request, res: Response) => {
  DedocoController.getUpdatedDocument(req, res);
});
router.post('/file/callback/:workflowId', (req: Request, res: Response) => {
  DedocoController.fileCallBack(req, res);
});
router.post('/status/callback/:workflowId', (req: Request, res: Response) => {
  DedocoController.statusCallBack(req, res);
});
router.get('/workflow/:companyId/:taskId', (req: Request, res: Response) => {
  DedocoController.workflowStatus(req, res);
});
router.delete(
  '/workflow/:companyId/:documentId/:workflowId/:taskId',
  (req: Request, res: Response) => {
    DedocoController.voidSigningProcess(req, res);
  },
);

router.get('/metrics/:companyId', (req: Request, res: Response) => {
  DedocoController.getMetricsByCompany(req, res);
});

export default router;

//packages/backend/src/routes/piPaymentRouter.ts
import express, { Request, Response, NextFunction } from 'express';
import { pi, PaymentDTO } from '../services/piService';
import logger from '../util/logger';

const router = express.Router();

interface PaymentRequestBody {
  payment: PaymentDTO;
}

router.post('/:paymentId', (req: Request<{ paymentId: string }, any, PaymentRequestBody>, res: Response, next: NextFunction) => {
  (async () => {
    const paymentId = req.params.paymentId;
    const { payment } = req.body;

    logger.debug(`Processing payment with id: ${paymentId}`);

    // Fetch payment from Pi servers
    const serverPayment = await pi.getPayment(paymentId);
    logger.info(`Payment fetched successfully for id: ${paymentId}`);

    res.status(200).json({
      message: 'Incomplete payment processed',
      payment,
      serverPayment,
    });
  })().catch((err) => {
    logger.error(`Incomplete Payment Error for ${req.params.paymentId}: ${err}`);
    res.status(500).json({
      error: 'Failed to process incomplete payment',
    });
  });
});

export default router;
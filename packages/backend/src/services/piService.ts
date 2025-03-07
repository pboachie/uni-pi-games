//packages/backend/src/services/piService.ts
import exp from 'constants';
import PiNetwork from 'pi-backend';

const apiKey = process.env.PI_API_KEY || '';
const walletPrivateSeed = process.env.PI_WALLET_SEED || '';

export const pi = new PiNetwork(apiKey, walletPrivateSeed);
export type { PaymentDTO, PaymentArgs, TransactionData } from 'pi-backend/dist/types';
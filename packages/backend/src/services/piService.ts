//packages/backend/src/services/piService.ts
import { cfg } from '../util/env';
import PiNetwork from 'pi-backend';
import axios from 'axios';

const apiKey = process.env.PI_API_KEY || '';
const walletPrivateSeed = process.env.PI_WALLET_SEED || '';

export const pi = new PiNetwork(apiKey, walletPrivateSeed);

// Attach verifyUser method if it does not exist
if (typeof (pi as any).verifyUser !== 'function') {
    (pi as any).verifyUser = async (piUserId: string, accessToken: string) => {
        // Require both a user id and an access token
        if (!piUserId || !accessToken) return null;

        try {
            // Use the BASE_URL from the configuration and verify the access token
            const response = await axios.get(`${cfg.piNetwork.baseURL}/me`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // If the response status is not 200, return an error-like object
            if (response.status !== 200) {
                return { error: 'Invalid authorization' };
            }

            // Return the user data upon successful verification
            return response.data;
        } catch (error) {
            console.error('User verification failed:', error);
            return null;
        }
    };
}

export type { PaymentDTO, PaymentArgs, TransactionData } from 'pi-backend/dist/types';
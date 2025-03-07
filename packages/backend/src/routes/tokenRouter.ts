import { Router, Request, Response, NextFunction } from 'express';
import { pgPool } from '../db/postgres/postgres.db';
import { signToken, generateRefreshToken, verifyRefreshToken } from '../util/jwt';
import { asyncHandler } from '../middleware/asyncHandler';

const tokenRouter = Router();

tokenRouter.post('/refresh', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'No refresh token provided' });
        }
        // Verify refresh token using JWT utility
        const uid = verifyRefreshToken(refreshToken);
        if (!uid) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        // Check if refresh token exists in DB and is not expired
        const result = await pgPool.query(
            'SELECT * FROM refresh_tokens WHERE token = $1 AND uid = $2',
            [refreshToken, uid]
        );
        if (result.rowCount === 0) {
            return res.status(401).json({ error: 'Refresh token not recognized' });
        }
        const tokenRecord = result.rows[0];
        const now = new Date();
        if (new Date(tokenRecord.expires_at) < now) {
            return res.status(401).json({ error: 'Refresh token expired' });
        }
        // Generate new tokens
        const newAccessToken = signToken({ uid, role: 'user' });
        const newRefreshToken = generateRefreshToken(uid);
        // Define new expiration (e.g., 7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        // Insert new refresh token and remove the old one
        await pgPool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        await pgPool.query(
            'INSERT INTO refresh_tokens (uid, token, expires_at) VALUES ($1, $2, $3)',
            [uid, newRefreshToken, expiresAt]
        );
        // Return new tokens
        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        console.error('Refresh token error:', err);
        next(err);
    }
}));

tokenRouter.post('/logout', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await pgPool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        }
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        next(err);
    }
}));

export default tokenRouter;

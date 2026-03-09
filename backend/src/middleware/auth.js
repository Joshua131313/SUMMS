import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    try {
        // Decode the Supabase JWT. Since the secret might not be provided in this exercise,
        // we'll primarily decode and trust it. However, if SUPABASE_JWT_SECRET is set, we use it.
        const secret = process.env.SUPABASE_JWT_SECRET;
        let decodedUser;
        if (secret) {
            decodedUser = jwt.verify(token, secret);
        }
        else {
            // For local testing without secret, we just decode. 
            // WARNING: In production, always verify!
            decodedUser = jwt.decode(token);
        }
        if (!decodedUser || !decodedUser.sub) {
            return res.status(403).json({ error: 'Forbidden: Invalid token' });
        }
        const userId = decodedUser.sub; // Supabase uses "sub" for user ID
        // Fetch user from public schema
        const user = await prisma.userProfile.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User not found in database' });
        }
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(403).json({ error: 'Forbidden: Token verification failed', details: err.message });
    }
};
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `Forbidden: Requires one of roles: ${roles.join(', ')}` });
        }
        next();
    };
};
//# sourceMappingURL=auth.js.map
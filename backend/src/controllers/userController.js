import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const getMe = async (req, res) => {
    try {
        const user = req.user;
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.userProfile.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
};
export const updateMe = async (req, res) => {
    try {
        const userId = req.user.id; // Guaranteed by auth midleware
        const { firstName, lastName, username, email, city, preferredMobility } = req.body;
        const updatedUser = await prisma.userProfile.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                username,
                email,
                city,
                preferredMobility
            }
        });
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update profile', details: error.message });
    }
};
export const updateUserRole = async (req, res) => {
    try {
        const targetUserId = String(req.params.id);
        const { role } = req.body;
        if (!['CLIENT', 'MOBILITY_PROVIDER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role provided' });
        }
        const updatedUser = await prisma.userProfile.update({
            where: { id: targetUserId },
            data: { role }
        });
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update user role', details: error.message });
    }
};
//# sourceMappingURL=userController.js.map
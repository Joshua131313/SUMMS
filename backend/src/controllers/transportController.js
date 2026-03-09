import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const getRoutes = async (req, res) => {
    try {
        const userId = req.user?.id;
        // Mock public transport routes
        const mockRoutes = [
            { id: '1', type: 'BUS', name: 'Downtown Express', schedule: 'Every 15 mins' },
            { id: '2', type: 'TRAIN', name: 'City Circle Line', schedule: 'Every 10 mins' },
            { id: '3', type: 'TRAM', name: 'Riverfront Tram', schedule: 'Every 20 mins' }
        ];
        if (userId) {
            // Log access
            await prisma.accessLog.create({
                data: {
                    userId,
                    serviceType: 'PUBLIC_TRANSPORT',
                    timeStamp: new Date()
                }
            });
        }
        res.json(mockRoutes);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch public transport routes', details: error.message });
    }
};
//# sourceMappingURL=transportController.js.map
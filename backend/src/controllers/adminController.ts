import type { Request, Response } from 'express';
import { vehicleAvailabilityService } from '../services/vehicleAvailability/vehicleAvailabilityService.js';

import prisma from '../prisma.js';
export const getRentalAnalytics = async (req: Request, res: Response) => {
    try {
        const { from, to, city, type } = req.query;

        const whereClause: any = {};

        if (from || to) {
            whereClause.bookingDate = {};
            if (from) whereClause.bookingDate.gte = new Date(String(from));
            if (to) whereClause.bookingDate.lte = new Date(String(to));
        }

        if (city) {
            whereClause.client = { city };
        }

        const transportFilter: any = {};

        if (
            type &&
            typeof type === 'string' &&
            ['CAR', 'BIKE', 'SCOOTER'].includes(type.toUpperCase())
        ) {
            const t = type.toUpperCase();
            transportFilter[t.toLowerCase()] = { isNot: null };
        }

        if (req.user?.role === 'MOBILITY_PROVIDER') {
            transportFilter.providerId = req.user.id;
        }

        if (Object.keys(transportFilter).length > 0) {
            whereClause.transport = transportFilter;
        }

        const totalRentals = await prisma.booking.count({
            where: whereClause
        });

        const completedRentals = await prisma.booking.count({
            where: {
                ...whereClause,
                status: 'COMPLETED'
            }
        });

        const aggregateCost = await prisma.booking.aggregate({
            where: {
                ...whereClause,
                status: 'COMPLETED'
            },
            _sum: { totalCost: true }
        });

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                transport: {
                    include: {
                        car: true,
                        bike: true,
                        scooter: true,
                        provider: true
                    }
                }
            }
        });

        const rentalsByVehicleMap = new Map<string, any>();

        for (const booking of bookings) {
            const transport = booking.transport;

            const vehicleName =
                transport.car?.model ||
                (transport.bike ? 'Bike' : null) ||
                (transport.scooter ? 'Scooter' : null) ||
                'Mobility Vehicle';

            const vehicleType =
                transport.car ? 'CAR' :
                transport.bike ? 'BIKE' :
                transport.scooter ? 'SCOOTER' :
                'UNKNOWN';

            if (!rentalsByVehicleMap.has(transport.id)) {
                rentalsByVehicleMap.set(transport.id, {
                    transportId: transport.id,
                    vehicleName,
                    vehicleType,
                    providerName: transport.provider?.name || null,
                    rentalCount: 0,
                    completedRentalCount: 0,
                    totalRevenue: 0
                });
            }

            const entry = rentalsByVehicleMap.get(transport.id);
            entry.rentalCount += 1;

            if (booking.status === 'COMPLETED') {
                entry.completedRentalCount += 1;
                entry.totalRevenue += Number(booking.totalCost || 0);
            }
        }

        const rentalsByVehicle = Array.from(rentalsByVehicleMap.values()).sort(
            (a, b) => b.rentalCount - a.rentalCount
        );

        res.json({
            totalRentals,
            completedRentals,
            totalRevenue: aggregateCost._sum.totalCost || 0,
            availabilitySnapshot:
                req.user?.role === 'ADMIN'
                    ? vehicleAvailabilityService.getAnalyticsSnapshot()
                    : null,
            rentalsByVehicle
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to fetch rental analytics',
            details: error.message
        });
    }
};

export const getGatewayAnalytics = async (req: Request, res: Response) => {
    try {
        const { from, to, serviceType } = req.query;

        const whereClause: any = {};
        if (from || to) {
            whereClause.timeStamp = {};
            if (from) whereClause.timeStamp.gte = new Date(String(from));
            if (to) whereClause.timeStamp.lte = new Date(String(to));
        }

        if (serviceType) {
            whereClause.serviceType = String(serviceType).toUpperCase();
        }

        const accessLogs = await prisma.accessLog.groupBy({
            by: ['serviceType'],
            where: whereClause,
            _count: {
                id: true
            }
        });

        res.json({ summary: accessLogs });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to fetch gateway analytics',
            details: error.message
        });
    }
};

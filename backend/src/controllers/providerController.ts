import type { Request, Response } from 'express';
import { vehicleAvailabilityService } from '../services/vehicleAvailability/vehicleAvailabilityService.js';
import { transportCreator } from '../services/creators/transportCreator.js';

import prisma from '../prisma.js';
import { getAvailableSlots } from '../utils/availability.js';
export const getProviders = async (req: Request, res: Response) => {
    try {
        const providers = await prisma.mobilityProvider.findMany();
        res.json(providers);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch providers', details: error.message });
    }
};

export const createProvider = async (req: Request, res: Response) => {
    try {
        const name = String(req.body?.name || '').trim();
        if (!name) {
            return res.status(400).json({ error: 'Provider name is required' });
        }

        if (req.user?.role === 'MOBILITY_PROVIDER') {
            const userProviderId = req.user.id;

            const existingByName = await prisma.mobilityProvider.findFirst({
                where: { name: { equals: name, mode: 'insensitive' } }
            });

            const ownedProvider = await prisma.mobilityProvider.upsert({
                where: { id: userProviderId },
                update: { name },
                create: { id: userProviderId, name }
            });

            if (existingByName && existingByName.id !== userProviderId) {
                await prisma.transport.updateMany({
                    where: { providerId: existingByName.id },
                    data: { providerId: userProviderId }
                });

                await prisma.mobilityProvider.delete({
                    where: { id: existingByName.id }
                });
            }

            return res.json(ownedProvider);
        }

        const existing = await prisma.mobilityProvider.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } }
        });

        if (existing) {
            return res.json(existing);
        }

        const created = await prisma.mobilityProvider.create({
            data: { name }
        });

        res.status(201).json(created);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create provider', details: error.message });
    }
};

export const getManageableVehicles = async (req: Request, res: Response) => {
    try {
        const isAdmin = req.user?.role === 'ADMIN';

        const vehicles = await prisma.transport.findMany({
            where: isAdmin ? {} : { providerId: req.user!.id },
            include: {
                car: true,
                bike: true,
                scooter: true,
                provider: true,
                bookings: true
            },
            orderBy: { id: 'desc' }
        });

        const enriched = vehicles.map(v => {
            const slots = getAvailableSlots(
                v.availableFrom,
                v.availableTo,
                v.bookings
            );

            return {
                ...v,
                availableSlots: slots,
                isAvailable: slots.length > 0
            };
        });

        res.json(enriched);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch vehicles', details: error.message });
    }
};

export const addVehicle = async (req: Request, res: Response) => {
    try {
        const { providerId, costPerMinute, type, model, fuelType, imageUrl, availability, availableFrom, availableTo } = req.body;
        const isAdmin = req.user?.role === 'ADMIN';
        const targetProviderId = isAdmin ? providerId : req.user!.id;

        if (!targetProviderId || costPerMinute === undefined || costPerMinute === null || Number.isNaN(Number(costPerMinute))) {
            return res.status(400).json({ error: 'Missing required field: costPerMinute' });
        }

        if (type === 'CAR' && !model) {
            return res.status(400).json({ error: 'Missing required field: model' });
        }

        const provider = await prisma.mobilityProvider.findUnique({
            where: { id: targetProviderId },
            select: { id: true }
        });

        if (!provider) {
            return res.status(400).json({ error: 'Invalid mobility provider selected' });
        }

        const transport = await transportCreator.create({
            providerId: targetProviderId,
            costPerMinute: Number(costPerMinute),
            type,
            model,
            fuelType,
            imageUrl,
            availableFrom: availableFrom,
            availableTo: availableTo,
            availability
        });

        res.status(201).json(transport);
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: 'Failed to add vehicle', details: error.message });
    }
};

export const updateVehicle = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);

        const {
            costPerMinute,
            model,
            fuelType,
            imageUrl,
            availableFrom,
            availableTo
        } = req.body;

        const isAdmin = req.user?.role === 'ADMIN';

        const existingTransport = await prisma.transport.findUnique({
            where: { id },
            include: { car: true, bike: true, scooter: true }
        });

        if (!existingTransport) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        if (!isAdmin && existingTransport.providerId !== req.user!.id) {
            return res.status(403).json({
                error: 'You can only modify your own company vehicles'
            });
        }

        if (availableFrom !== undefined && availableTo !== undefined) {
            const start = new Date(availableFrom);
            const end = new Date(availableTo);

            if (start >= end) {
                return res.status(400).json({
                    error: 'Available To must be after Available From'
                });
            }
        }

        const transportCar = (existingTransport as any).car;
        const transportBike = (existingTransport as any).bike;
        const transportScooter = (existingTransport as any).scooter;

        const imageUrlUpdate =
            imageUrl !== undefined ? { imageUrl } : {};

        const updatedTransport = await prisma.transport.update({
            where: { id },
            data: {
                ...(costPerMinute !== undefined && {
                    costPerMinute
                }),

                ...(availableFrom !== undefined && {
                    availableFrom: new Date(availableFrom)
                }),
                ...(availableTo !== undefined && {
                    availableTo: new Date(availableTo)
                }),

                ...(transportCar
                    ? {
                          car: {
                              update: {
                                  ...(model !== undefined && { model }),
                                  ...(fuelType !== undefined && { fuelType }),
                                  ...imageUrlUpdate
                              }
                          }
                      }
                    : {}),

                ...(transportBike &&
                Object.keys(imageUrlUpdate).length > 0
                    ? {
                          bike: {
                              update: {
                                  ...imageUrlUpdate
                              }
                          }
                      }
                    : {}),

                ...(transportScooter
                    ? {
                          scooter: {
                              update: {
                                  ...(fuelType !== undefined && { fuelType }),
                                  ...imageUrlUpdate
                              }
                          }
                      }
                    : {})
            },
            include: {
                car: true,
                bike: true,
                scooter: true,
                provider: true,
                bookings: true 
            }
        });

        const availableSlots = getAvailableSlots(
            updatedTransport.availableFrom,
            updatedTransport.availableTo,
            updatedTransport.bookings
        );

        res.json({
            ...updatedTransport,
            availableSlots,
            isAvailable: availableSlots.length > 0
        });

    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to update vehicle',
            details: error.message
        });
    }
};

export const removeVehicle = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const isAdmin = req.user?.role === 'ADMIN';

        const existingTransport = await prisma.transport.findUnique({
            where: { id },
            select: { id: true, providerId: true }
        });

        if (!existingTransport) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        if (!isAdmin && existingTransport.providerId !== req.user!.id) {
            return res.status(403).json({ error: 'You can only delete your own company vehicles' });
        }

        const activeBookings = await prisma.booking.findFirst({
            where: {
                transportId: id,
                status: { in: ['ACTIVE', 'RESERVED'] }
            }
        });

        if (activeBookings) {
            return res.status(400).json({ error: 'Cannot remove vehicle with active or reserved bookings' });
        }

        await prisma.transport.delete({
            where: { id }
        });

        res.json({ message: 'Vehicle removed successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to remove vehicle', details: error.message });
    }
};

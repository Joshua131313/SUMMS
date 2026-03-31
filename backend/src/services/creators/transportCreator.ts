import prisma from '../../prisma.js';

const EMISSION_FACTORS: Record<string, number> = {
    petrol: 185,
    diesel: 171,
    electric: 0
};

interface CreateTransportInput {
    providerId: string;
    costPerMinute: number;
    type: string;
    model?: string;
    fuelType?: string;
}

class TransportCreator {
    async create(input: CreateTransportInput) {
        const normalizedType = String(input.type).toUpperCase();
        const fuelType = input.fuelType || 'petrol';
        const emissionFactorGPerKm = EMISSION_FACTORS[fuelType] ?? 185;
    

        return prisma.transport.create({
            data: {
                providerId: input.providerId,
                costPerMinute: input.costPerMinute,
                availability: true,
                ...(normalizedType === 'CAR'
                    ? { car: { create: { model: input.model || 'Unknown', fuelType, emissionFactorGPerKm } } }
                    : {}),
                ...(normalizedType === 'BIKE'
                    ? { bike: { create: {} } }
                    : {}),
                ...(normalizedType === 'SCOOTER'
                    ? { scooter: { create: {fuelType, emissionFactorGPerKm } } }
                    : {})
            },
            include: {
                car: true,
                bike: true,
                scooter: true
            }
        });
    }
}

export const transportCreator = new TransportCreator();
import type { CSSProperties } from 'react';
import { Bike, CarFront, Scooter } from 'lucide-react';

export type VehicleImageNode = {
    imageUrl?: string | null;
};

export type VehicleWithMedia = {
    car?: (VehicleImageNode & { model?: string | null; fuelType?: string | null }) | null;
    bike?: VehicleImageNode | null;
    scooter?: (VehicleImageNode & { fuelType?: string | null }) | null;
};

type VehicleType = 'CAR' | 'BIKE' | 'SCOOTER';

const fallbackStylesByType: Record<VehicleType, CSSProperties> = {
    CAR: {
        background: '#91aca5',
        color: '#ffffff'
    },
    BIKE: {
        background: '#91aca5',
        color: '#ffffff'
    },
    SCOOTER: {
        background: '#91aca5',
        color: '#ffffff'
    }
};

export const getVehicleType = (vehicle: VehicleWithMedia): VehicleType => {
    if (vehicle.car) return 'CAR';
    if (vehicle.bike) return 'BIKE';
    return 'SCOOTER';
};

export const getVehicleImageUrl = (vehicle: VehicleWithMedia): string | null => {
    const image = vehicle.car?.imageUrl || vehicle.bike?.imageUrl || vehicle.scooter?.imageUrl;
    return typeof image === 'string' && image.trim() ? image.trim() : null;
};

export const getVehicleDisplayName = (vehicle: VehicleWithMedia) => vehicle.car?.model || (vehicle.bike ? 'Bike' : 'Scooter');

type VehicleMediaProps = {
    vehicle: VehicleWithMedia;
    alt?: string;
    className?: string;
    style?: CSSProperties;
    iconSize?: number;
};

const renderFallbackIcon = (type: VehicleType, iconSize: number) => {
    const iconProps = {
        size: iconSize,
        strokeWidth: 2.1
    };

    if (type === 'CAR') return <CarFront {...iconProps} />;
    if (type === 'BIKE') return <Bike {...iconProps} />;
    return <Scooter {...iconProps} />;
};

const VehicleMedia = ({ vehicle, alt, className, style, iconSize = 44 }: VehicleMediaProps) => {
    const imageUrl = getVehicleImageUrl(vehicle);
    const label = alt || getVehicleDisplayName(vehicle);

    if (imageUrl) {
        return (
            <div className={className} style={{ overflow: 'hidden', ...style }}>
                <img
                    src={imageUrl}
                    alt={label}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                    }}
                />
            </div>
        );
    }

    const vehicleType = getVehicleType(vehicle);

    return (
        <div
            aria-label={label}
            className={className}
            role="img"
            style={{
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                ...fallbackStylesByType[vehicleType],
                ...style
            }}
        >
            {renderFallbackIcon(vehicleType, iconSize)}
        </div>
    );
};

export default VehicleMedia;

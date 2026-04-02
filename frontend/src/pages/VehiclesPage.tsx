import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import VehicleMedia, { getVehicleDisplayName, type VehicleWithMedia } from '../components/vehicles/VehicleMedia';

type Vehicle = {
  id: string;
  costPerMinute: number;
  availability: boolean;
  provider?: { name?: string | null } | null;
} & VehicleWithMedia;

const VehiclesPage = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState('5.00');
    const navigate = useNavigate();

    const minPrice = 0.05;
    const maxPrice = 5.0;
    const priceValue = Number(priceFilter);
    const sliderProgress = Math.min(100, Math.max(0, ((priceValue - minPrice) / (maxPrice - minPrice)) * 100));

    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        try {
            let query = '?';
            if (typeFilter) query += `type=${typeFilter}&`;
            if (priceFilter) query += `maxPrice=${priceFilter}&`;

            const res = await api.get(`/vehicles${query}`);
            setVehicles(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [typeFilter, priceFilter]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const handleResetFilters = () => {
        setTypeFilter('');
        setPriceFilter('5.00');
    };

    return (
        <div className="page-container vehicles-page">
            <h1 className="text-5xl font-bold mb-12">Find Vehicles</h1>

            <div className="card vehicles-filters-card">
                <div className="vehicles-filter-top-row">
                    <h3>Filter Vehicles</h3>
                    <p className="vehicles-price-readout">Max Price: ${Number(priceFilter).toFixed(2)}/min</p>
                </div>

                <div className="vehicles-range-wrap">
                    <input
                        type="range"
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        min={0.05}
                        max={5.0}
                        step={0.05}
                        className="vehicles-range"
                        style={{ '--range-progress': `${sliderProgress}%` } as CSSProperties}
                    />
                    <div className="vehicles-range-labels">
                        <span>$0.05</span>
                        <span>$5.00</span>
                    </div>
                </div>

                <div className="vehicles-type-buttons">
                    {['', 'Car', 'Bike', 'Scooter'].map((type) => (
                        <button
                            key={type || 'ALL'}
                            type="button"
                            onClick={() => setTypeFilter(type)}
                            className={typeFilter === type ? 'vehicles-type-btn vehicles-type-btn-active' : 'vehicles-type-btn'}
                        >
                            {type || 'All'}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="vehicles-reset-btn"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="vehicles-grid">
                    {vehicles.map((v) => (
                        <div key={v.id} className="card vehicles-card">
                            <VehicleMedia
                                vehicle={v}
                                alt={getVehicleDisplayName(v)}
                                className="vehicles-media"
                                style={{ border: '1px solid #d7dfdb' }}
                                iconSize={46}
                            />

                            <div>
                                <h3 className="vehicles-name">{getVehicleDisplayName(v)}</h3>
                                {(v.car?.fuelType === 'electric' || v.scooter?.fuelType === 'electric' || v.bike) && (
                                    <div className="vehicles-zero-emission-badge-card">
                                        <span className="vehicles-zero-emission-dot" aria-hidden="true" />
                                        <div>
                                            <p className="vehicles-zero-emission-title">Zero Emission</p>
                                            <p className="vehicles-zero-emission-subtitle">Cleaner choice</p>
                                        </div>
                                    </div>
                                )}
                                <p>Type: <strong>{v.car ? 'Car' : v.bike ? 'Bike' : 'Scooter'}</strong></p>
                                <p>Price: <strong>${v.costPerMinute}/min</strong></p>
                                <p>Mobility Provider: <strong>{v.provider?.name || 'Unknown Provider'}</strong></p>
                                <p>
                                    Available:{' '}
                                    <strong className={v.availability ? 'vehicles-available' : 'vehicles-unavailable'}>
                                        {v.availability ? 'Yes' : 'No'}
                                    </strong>
                                </p>
                            </div>

                            <button
                                onClick={() => navigate(`/vehicles/${v.id}`)}
                                disabled={!v.availability}
                                className={v.availability ? 'vehicles-view-btn' : 'vehicles-view-btn vehicles-view-btn-disabled'}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {!loading && vehicles.length === 0 && (
                <p className="vehicles-empty">No vehicles found.</p>
            )}
        </div>
    );
};

export default VehiclesPage;

import { useEffect, useState } from 'react';
import api from '../lib/api';

const ParkingPage = () => {
    const [spots, setSpots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const getSpotCity = (location: string) => location.startsWith('Yonge St') ? 'Toronto' : 'Montreal';

    const fetchSpots = async () => {
        try {
            const res = await api.get('/parking-spots');
            setSpots(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpots();
    }, []);

    const reserveSpot = async (spotId: string) => {
        try {
            // Mock hardcoded time for reservation
            const start = new Date();
            const end = new Date(start.getTime() + 7200000); // 2 hours

            await api.post('/parking-spots/reservations', {
                spotId,
                startTime: start.toISOString(),
                endTime: end.toISOString()
            });
            setMsg('Spot reserved successfully (for 2 hours)!');
            fetchSpots();
        } catch (err: any) {
            setMsg(err.response?.data?.error || err.message);
        }
    };

    const unreserveSpot = async (spotId: string) => {
        try {
            await api.delete(`/parking-spots/reservations/${spotId}`);
            setMsg('Spot unreserved successfully!');
            fetchSpots();
        } catch (err: any) {
            setMsg(err.response?.data?.error || err.message);
        }
    };

    return (
        <div className="page-container">
            <h1 className="text-5xl font-bold mb-12">Parking Availability</h1>

            {msg && <p className="status-msg">{msg}</p>}

            {loading ? <p>Loading...</p> : (
                <div className="grid">
                    {spots.map(spot => (
                        <div
                            key={spot.id}
                            className={spot.reservedByCurrentUser ? 'card parking-reserved-card' : 'card'}
                        >
                            <h3>{spot.location}</h3>
                            <p>City: {getSpotCity(spot.location)}</p>
                            <p>Status: {spot.status}</p>
                            {spot.status === 'AVAILABLE' ? (
                                <button className="rentals-pay-btn" onClick={() => reserveSpot(spot.id)}>
                                    Reserve Spot
                                </button>
                            ) : spot.reservedByCurrentUser ? (
                                <button className="del-btn" onClick={() => unreserveSpot(spot.id)}>
                                    Unreserve Spot
                                </button>
                            ) : (
                                <button disabled>
                                    Unavailable
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParkingPage;

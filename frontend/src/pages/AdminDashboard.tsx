import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../features/auth/context/AuthContext';

const AdminDashboard = () => {
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'ADMIN';

    const [rentals, setRentals] = useState<any>(null);
    const [gateway, setGateway] = useState<any>(null);
    const [co2Summary, setCo2Summary] = useState<Record<string, number>>({});
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [rRes, co2Res] = await Promise.all([
                    api.get('/admin/analytics/rentals'),
                    api.get('/bookings/co2-summary')
                ]);
                setRentals(rRes.data);
                setCo2Summary(co2Res.data);

                if (isAdmin) {
                    const [gRes, uRes] = await Promise.all([
                        api.get('/admin/analytics/gateway'),
                        api.get('/admin/users')
                    ]);
                    setGateway(gRes.data.summary);
                    setUsers(uRes.data);
                }
            } catch (e: any) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (profile) {
            loadData();
        }
    }, [profile, isAdmin]);

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            const uRes = await api.get('/admin/users');
            setUsers(uRes.data);
        } catch (e: any) {
            alert(e.response?.data?.error || e.message);
        }
    };

    if (loading) return <div>Loading dashboard...</div>;

    const totalCo2 = co2Summary.total ?? 0;
    const totalTripsWithCo2 = co2Summary.trips ?? 0;
    const carCo2 = co2Summary.car ?? 0;
    const bikeCo2 = co2Summary.bike ?? 0;
    const scooterCo2 = co2Summary.scooter ?? 0;
    const co2Heading = isAdmin ? 'Platform CO2 Summary' : 'Fleet CO2 Summary';
    const co2Description = isAdmin
        ? 'Emissions recorded across all completed rentals.'
        : 'Emissions recorded for completed rentals on your vehicles.';

    return (
        <div className="page-container">
            <h1 className="text-5xl font-bold mb-12">
                {isAdmin ? 'Admin Dashboard' : 'Provider Analytics'}
            </h1>

            <div className="analytics-top-row">
                <div className="card analytics-summary-card">
                    <h3>Rental Analytics Summary</h3>
                    <div className='analytics-summary'>
                    <p>Total Rentals: <strong>{rentals?.summary?.totalRentals || 0}</strong></p>
                    <p>Completed Rentals: <strong>{rentals?.summary?.completedRentals || 0}</strong></p>
                    </div>
                    <div className='total-revenue'>
                        <p>Total Revenue: <strong>${rentals?.summary?.totalRevenue || 0}</strong></p>
                    </div>
                </div>

                <div className="card analytics-vehicle-status-card">
                    <h3>Vehicle Status</h3>
                    <div style={{ overflowX: 'auto', marginTop: 16 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Vehicle Type</th>
                                    <th>Rented</th>
                                    <th>Available</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentals?.requiredMetrics?.vehicleStatusTable?.map((entry: any) => (
                                    <tr key={entry.type}>
                                        <td>{entry.type}</td>
                                        <td>{entry.rented}</td>
                                        <td>{entry.available}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: 16 }}>
                    <p>Trips Completed Today: <strong>{rentals?.requiredMetrics?.tripsCompletedToday || 0}</strong></p>
                    <p>Most Used Mobility Option Between Bikes and Scooters: <strong>{rentals?.requiredMetrics?.mostUsedMobilityOption || 'N/A'}</strong></p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="card analytics-gateway-card">
                        <h3>Gateway Logs</h3>
                        <div style={{ overflowX: 'auto', marginTop: 16 }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Service Type</th>
                                        <th>Access Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gateway?.map((g: any) => (
                                        <tr key={g.serviceType}>
                                            <td>{g.serviceType}</td>
                                            <td>{g._count.id}</td>
                                        </tr>
                                    ))}
                                    {(!gateway || gateway.length === 0) && (
                                        <tr>
                                            <td colSpan={2}>No logs yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="card analytics-co2-card" style={{ marginTop: 32 }}>
                <h3>{co2Heading}</h3>
                <p className="analytics-co2-description">{co2Description}</p>
                <div className="analytics-co2-grid" style={{ marginTop: 16 }}>
                    <div className="analytics-co2-stat">
                        <p className="analytics-co2-label">Completed Trips Tracked</p>
                        <p className="analytics-co2-value">{totalTripsWithCo2}</p>
                    </div>
                    <div className="analytics-co2-stat analytics-co2-stat-primary">
                        <p className="analytics-co2-label">Total CO2 Recorded</p>
                        <p className="analytics-co2-value">{totalCo2.toFixed(2)} kg</p>
                    </div>
                    <div className="analytics-co2-stat">
                        <p className="analytics-co2-label">Cars</p>
                        <p className="analytics-co2-value">{carCo2.toFixed(2)} kg</p>
                    </div>
                    <div className="analytics-co2-stat">
                        <p className="analytics-co2-label">Bikes</p>
                        <p className="analytics-co2-value">{bikeCo2.toFixed(2)} kg</p>
                    </div>
                    <div className="analytics-co2-stat">
                        <p className="analytics-co2-label">Scooters</p>
                        <p className="analytics-co2-value">{scooterCo2.toFixed(2)} kg</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: 32 }}>
                <h3>Usage Per City</h3>
                {rentals?.requiredMetrics?.usagePerCity?.length > 0 ? (
                    <div style={{ overflowX: 'auto', marginTop: 16 }}>
                        <table className="data-table" style={{ minWidth: '500px' }}>
                            <thead>
                                <tr>
                                    <th>City</th>
                                    <th>Usage Count</th>
                                    <th>Active Rentals</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentals.requiredMetrics.usagePerCity.map((entry: any) => (
                                    <tr key={entry.city}>
                                        <td>{entry.city}</td>
                                        <td>{entry.count}</td>
                                        <td>{entry.activeRentals ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ marginTop: 16 }}>No usage data available.</p>
                )}
            </div>

            {!isAdmin && (
                <div className="card" style={{ marginTop: 32 }}>
                    <h3>Your Vehicle Rental Breakdown</h3>

                    {rentals?.rentalsByVehicle?.length > 0 ? (
                        <div style={{ overflowX: 'auto', marginTop: 16 }}>
                            <table className="data-table" style={{ minWidth: '700px' }}>
                                <thead>
                                    <tr>
                                        <th>Vehicle</th>
                                        <th>Type</th>
                                        <th>Times Rented</th>
                                        <th>Completed Rentals</th>
                                        <th>Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rentals.rentalsByVehicle.map((vehicle: any) => (
                                        <tr key={vehicle.transportId}>
                                            <td>{vehicle.vehicleName}</td>
                                            <td>{vehicle.vehicleType}</td>
                                            <td>{vehicle.rentalCount}</td>
                                            <td>{vehicle.completedRentalCount}</td>
                                            <td>${vehicle.totalRevenue}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ marginTop: 16 }}>No rentals found for your vehicles yet.</p>
                    )}
                </div>
            )}

            {isAdmin && (
                <div style={{ marginTop: 40 }}>
                    <h3 style={{ fontSize: '28px', fontWeight: '700' }}>User Management</h3>
                    <p style={{ marginBottom: 16 }}>
                        Number of registered users: <strong>{users.length}</strong>
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Assign Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.firstName} {u.lastName}</td>
                                        <td>{u.email}</td>
                                        <td><strong>{u.role}</strong></td>
                                        <td>
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                            >
                                                <option value="CLIENT">Client</option>
                                                <option value="MOBILITY_PROVIDER">Mobility Provider</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

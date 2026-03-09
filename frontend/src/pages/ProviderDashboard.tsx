import { useEffect, useState } from 'react';
import api from '../lib/api';

const ProviderDashboard = () => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
    const [editVehicle, setEditVehicle] = useState({
        costPerMinute: 0,
        availability: true,
        model: ''
    });

    const [newVehicle, setNewVehicle] = useState({
        providerId: '',
        costPerMinute: 0,
        type: 'CAR',
        model: ''
    });

    const fetchData = async () => {
        try {
            const [vRes, pRes] = await Promise.all([
                api.get('/vehicles'),
                api.get('/provider/profiles')
            ]);
            setVehicles(vRes.data);
            setProviders(pRes.data);
            if (pRes.data.length > 0) {
                setNewVehicle(prev => ({ ...prev, providerId: pRes.data[0].id }));
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/provider/vehicles', newVehicle);
            setNewVehicle({ ...newVehicle, costPerMinute: 0, model: '' });
            fetchData();
        } catch (e: any) {
            alert(e.response?.data?.error || e.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this vehicle?')) return;
        try {
            await api.delete(`/provider/vehicles/${id}`);
            fetchData();
        } catch (e: any) {
            alert(e.response?.data?.error || e.message);
        }
    };

    const startEdit = (vehicle: any) => {
        setEditingVehicleId(vehicle.id);
        setEditVehicle({
            costPerMinute: vehicle.costPerMinute,
            availability: vehicle.availability,
            model: vehicle.car?.model || ''
        });
    };

    const cancelEdit = () => {
        setEditingVehicleId(null);
        setEditVehicle({ costPerMinute: 0, availability: true, model: '' });
    };

    const handleUpdate = async (id: string, hasCarModel: boolean) => {
        try {
            const payload: any = {
                costPerMinute: editVehicle.costPerMinute,
                availability: editVehicle.availability
            };

            if (hasCarModel) {
                payload.model = editVehicle.model;
            }

            await api.put(`/provider/vehicles/${id}`, payload);
            cancelEdit();
            fetchData();
        } catch (e: any) {
            alert(e.response?.data?.error || e.message);
        }
    };

    if (loading) return <div>Loading provider dashboard...</div>;

    return (
        <div className="page-container">
            <h2>Provider Dashboard</h2>
            {error && <p className="error">{error}</p>}

            <form onSubmit={handleAdd} className="form-card" style={{ marginBottom: 30 }}>
                <h3>Add New Vehicle</h3>
                <div className="input-group">
                    <label>Mobility Provider Company</label>
                    <select value={newVehicle.providerId} onChange={e => setNewVehicle({ ...newVehicle, providerId: e.target.value })} required>
                        {providers.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="input-group">
                    <label>Type</label>
                    <select value={newVehicle.type} onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value })}>
                        <option value="CAR">Car</option>
                        <option value="BIKE">Bike</option>
                        <option value="SCOOTER">Scooter</option>
                    </select>
                </div>
                {newVehicle.type === 'CAR' && (
                    <div className="input-group">
                        <label>Model</label>
                        <input value={newVehicle.model} onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} required />
                    </div>
                )}
                <div className="input-group">
                    <label>Cost per Minute ($)</label>
                    <input type="number" step="0.01" value={newVehicle.costPerMinute} onChange={e => setNewVehicle({ ...newVehicle, costPerMinute: parseFloat(e.target.value) })} required />
                </div>
                <button type="submit">Add Vehicle</button>
            </form>

            <h3>Vehicles List</h3>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID / Model</th>
                        <th>Pricing</th>
                        <th>Availability</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vehicles.map(v => (
                        <tr key={v.id}>
                            <td>{v.car?.model || (v.bike ? 'Bike' : 'Scooter')}</td>
                            <td>
                                {editingVehicleId === v.id ? (
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editVehicle.costPerMinute}
                                        onChange={e => setEditVehicle({ ...editVehicle, costPerMinute: parseFloat(e.target.value) })}
                                    />
                                ) : (
                                    <>${v.costPerMinute}/min</>
                                )}
                            </td>
                            <td>
                                {editingVehicleId === v.id ? (
                                    <select
                                        value={String(editVehicle.availability)}
                                        onChange={e => setEditVehicle({ ...editVehicle, availability: e.target.value === 'true' })}
                                    >
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                ) : (
                                    <>{v.availability ? 'Yes' : 'No'}</>
                                )}
                            </td>
                            <td>
                                {editingVehicleId === v.id ? (
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        {v.car && (
                                            <input
                                                placeholder="Car model"
                                                value={editVehicle.model}
                                                onChange={e => setEditVehicle({ ...editVehicle, model: e.target.value })}
                                            />
                                        )}
                                        <button className="success-btn" onClick={() => handleUpdate(v.id, !!v.car)}>Update</button>
                                        <button onClick={cancelEdit}>Cancel</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => startEdit(v)}>Edit</button>
                                        <button className="del-btn" onClick={() => handleDelete(v.id)}>Remove</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {vehicles.length === 0 && <tr><td colSpan={4}>No vehicles.</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

export default ProviderDashboard;

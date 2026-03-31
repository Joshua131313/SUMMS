import { Link } from 'react-router-dom';
import { BusFront, CalendarCheck2, CarFront, SquareParking } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';
import Button from '../components/ui/Button/Button';

const DashboardPage = () => {
    const { user, profile, recommendations, loadingRecommendation } = useAuth();


    return (
        <div className="page-container dashboard-page">
            

            {/* Travel Recommendations Section */}
            {profile?.preferredMobility && profile?.city && (
                <div className="card dashboard-recommendation-card">
                    <h3 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>✨ Personalized Travel Recommendations</h3>
                    {loadingRecommendation ? (
                        <p>Loading your recommendations...</p>
                    ) : recommendations.length > 0 ? (
                        <div className="flex-col">
                            <p style={{ fontSize: '18px' }}>
                                Good news! We found <strong>{recommendations.length} available {profile.preferredMobility.toLowerCase()}s</strong> in <strong>{profile.city}</strong> based on your preferences.
                            </p>
                            <Button style={{ marginTop: 20 }}>
                                <Link to="/vehicles">View them now</Link>
                            </Button>
                        </div>
                    ) : (
                        <p>Currently, there is no availability for {profile.preferredMobility.toLowerCase()}s in {profile.city}. Try checking other vehicle types.</p>
                    )}
                </div>
            )}

            <div className="dashboard-card-row" style={{ marginTop: 30 }}>
                <div className="card dashboard-card">
                    <CarFront className="dashboard-card-icon" strokeWidth={2.2} />
                    <h3>Rent a Vehicle</h3>
                    <p>Find nearby bikes, scooters, and cars.</p>
                    <Link to="/vehicles"><button className ="dashboard-button">Search Vehicles</button></Link>
                </div>

                <div className="card dashboard-card">
                    <SquareParking className="dashboard-card-icon" strokeWidth={2.2} />
                    <h3>Book a Parking Spots</h3>
                    <p>Find & reserve parking in the city.</p>
                    <Link to="/parking"><button className ="dashboard-button">Find Parking</button></Link>
                </div>

                <div className="card dashboard-card">
                    <BusFront className="dashboard-card-icon" strokeWidth={2.2} />
                    <h3>View Transit</h3>
                    <p>Check schedules for buses, trams & trains.</p>
                    <Link to="/public-transport"><button className ="dashboard-button">View Schedules</button></Link>
                </div>
                <div className="card dashboard-card">
                    <CalendarCheck2 className="dashboard-card-icon" strokeWidth={2.2} />
                    <h3>View My Bookings</h3>
                    <p>Manage your active and past rentals.</p>
                    <Link to="/rentals/current"><button className="dashboard-button"
                    >View Rentals</button></Link>
                </div>

                {profile?.role === 'ADMIN' && (
                    <div className="card" style={{ border: '2px solid #5a02e8' }}>
                        <h3>Admin Tools</h3>
                        <p>View analytics and manage roles.</p>
                        <Link to="/admin"><button>Admin Dashboard</button></Link>
                    </div>
                )}

                {profile?.role === 'MOBILITY_PROVIDER' && (
                    <div className="card" style={{ border: '2px solid #5a02e8' }}>
                        <h3>Provider Analytics</h3>
                        <p>View analytics for your own vehicles.</p>
                        <Link to="/admin/analytics"><button>View Analytics</button></Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;

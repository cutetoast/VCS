import React, { useState, useEffect } from 'react';
import { Car, Truck } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface RoadData {
  name: string;
  counts: {
    car: number;
    truck: number;
    bus: number;
    motorcycle: number;
    van: number;
  };
}

const ReportPage: React.FC = () => {
  const { user } = useAuth();
  const [roads, setRoads] = useState<RoadData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadData = async () => {
      if (!user) {
        setError('You need to be logged in to view reports.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const detectionsRef = collection(db, 'detections');
        const detectionsQuery = query(detectionsRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(detectionsQuery);

        if (snapshot.empty) {
          setError('No traffic data found for your account.');
          setRoads([]);
          setLoading(false);
          return;
        }

        const roadData: RoadData[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            name: data.roadName || 'Unknown',
            counts: {
              car: data.stats?.Car || 0,
              truck: data.stats?.Truck || 0,
              bus: data.stats?.Bus || 0,
              motorcycle: data.stats?.Motorcycle || 0,
              van: data.stats?.Van || 0,
            },
          };
        });

        setRoads(roadData);
      } catch (err) {
        console.error('Error fetching road data:', err);
        setError('Failed to load traffic data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadData();
  }, [user]);

  const getTotalVehicles = (counts: RoadData['counts']) =>
    Object.values(counts).reduce((sum, count) => sum + count, 0);

  const getHeavyVehicles = (counts: RoadData['counts']) =>
    counts.truck + counts.bus;

  const getLightVehicles = (counts: RoadData['counts']) =>
    counts.car + counts.motorcycle + counts.van;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Traffic Report by Road</h1>
      {roads.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          No traffic data available for your account.
        </div>
      ) : (
        <div className="space-y-4">
          {roads.map((road) => {
            const totalVehicles = getTotalVehicles(road.counts);
            const heavyVehicles = getHeavyVehicles(road.counts);
            const lightVehicles = getLightVehicles(road.counts);

            return (
              <div
                key={road.name}
                className="border border-gray-100 rounded-xl p-4 bg-white shadow-md"
              >
                <h3 className="font-medium text-lg mb-3">{road.name}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Traffic</p>
                    <p className="text-2xl font-bold">{totalVehicles}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-1">
                      <Truck className="w-4 h-4" />
                      <span>Heavy Vehicles</span>
                    </div>
                    <p className="text-2xl font-bold">{heavyVehicles}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-1">
                      <Car className="w-4 h-4" />
                      <span>Light Vehicles</span>
                    </div>
                    <p className="text-2xl font-bold">{lightVehicles}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportPage;
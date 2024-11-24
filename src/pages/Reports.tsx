import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Detection {
  roadName: string;
  timestamp: string;
  stats: {
    Car?: number;
    Truck?: number;
    Van?: number;
    Motorcycle?: number;
    Bus?: number;
  };
}

const Reports = () => {
  const { user } = useAuth();
  const [selectedRoad, setSelectedRoad] = useState<string>('');
  const [roads, setRoads] = useState<string[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      setError('');

      try {
        const detectionsRef = collection(db, 'detections');
        const detectionsQuery = query(detectionsRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(detectionsQuery);
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as Detection[];

        const uniqueRoads = Array.from(new Set(data.map((d) => d.roadName)));
        setRoads(uniqueRoads);
        setDetections(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getFilteredDetections = () => {
    return detections.filter((d) => d.roadName === selectedRoad);
  };

  const calculateTotals = (filteredData: Detection[]) => {
    const totals = {
      totalVehicles: 0,
      heavyVehicles: 0,
      lightVehicles: 0,
    };

    filteredData.forEach((d) => {
      if (!d.stats) return;

      const total = Object.values(d.stats).reduce((a, b) => a + b, 0);
      const heavy = (d.stats.Bus || 0) + (d.stats.Truck || 0);
      const light = total - heavy;

      totals.totalVehicles += total;
      totals.heavyVehicles += heavy;
      totals.lightVehicles += light;
    });

    return totals;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredDetections = getFilteredDetections();
  calculateTotals(filteredDetections);

  return (
    <div className="p-6 space-y-8">
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded">
          {error}
        </div>
      )}

      {/* Road Selector */}
      <div className="space-y-4">
        <label htmlFor="road" className="block font-medium text-gray-700">
          Select Road:
        </label>
        <select
          id="road"
          value={selectedRoad}
          onChange={(e) => setSelectedRoad(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a Road</option>
          {roads.map((road) => (
            <option key={road} value={road}>
              {road}
            </option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      {filteredDetections.length > 0 ? (
        <div className="overflow-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Road Name</th>
                <th className="px-4 py-2 text-left">Cars</th>
                <th className="px-4 py-2 text-left">Trucks</th>
                <th className="px-4 py-2 text-left">Buses</th>
                <th className="px-4 py-2 text-left">Motorcycles</th>
                <th className="px-4 py-2 text-left">Vans</th>
                <th className="px-4 py-2 text-left">Heavy Vehicles</th>
                <th className="px-4 py-2 text-left">Light Vehicles</th>
              </tr>
            </thead>
            <tbody>
              {filteredDetections.map((detection, index) => {
                const stats = detection.stats || {};
                const total = Object.values(stats).reduce((a, b) => a + b, 0);
                const heavy = (stats.Bus || 0) + (stats.Truck || 0);
                const light = total - heavy;

                return (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{detection.roadName}</td>
                    <td className="px-4 py-2">{stats.Car || 0}</td>
                    <td className="px-4 py-2">{stats.Truck || 0}</td>
                    <td className="px-4 py-2">{stats.Bus || 0}</td>
                    <td className="px-4 py-2">{stats.Motorcycle || 0}</td>
                    <td className="px-4 py-2">{stats.Van || 0}</td>
                    <td className="px-4 py-2">{heavy}</td>
                    <td className="px-4 py-2">{light}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded">
          No data available for the selected road.
        </div>
      )}
    </div>
  );
};

export default Reports;
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

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

        // Auto-select the first road
        if (uniqueRoads.length > 0) setSelectedRoad(uniqueRoads[0]);
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

  const exportData = () => {
    const filteredDetections = getFilteredDetections();
    const csvContent = [
      ['Road Name', 'Timestamp', 'Car', 'Truck', 'Bus', 'Motorcycle', 'Van'],
      ...filteredDetections.map((d) => [
        d.roadName,
        d.timestamp,
        d.stats?.Car || 0,
        d.stats?.Truck || 0,
        d.stats?.Bus || 0,
        d.stats?.Motorcycle || 0,
        d.stats?.Van || 0,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'vehicle_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status"></div>
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <div className="bg-red-100 text-red-600 p-6 rounded shadow-md">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredDetections = getFilteredDetections();
  const totals = calculateTotals(filteredDetections);

  const chartData = {
    labels: ['Cars', 'Trucks', 'Buses', 'Motorcycles', 'Vans'],
    datasets: [
      {
        label: 'Vehicle Count',
        data: [
          filteredDetections.reduce((acc, d) => acc + (d.stats?.Car || 0), 0),
          filteredDetections.reduce((acc, d) => acc + (d.stats?.Truck || 0), 0),
          filteredDetections.reduce((acc, d) => acc + (d.stats?.Bus || 0), 0),
          filteredDetections.reduce((acc, d) => acc + (d.stats?.Motorcycle || 0), 0),
          filteredDetections.reduce((acc, d) => acc + (d.stats?.Van || 0), 0),
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  const pieData = {
    labels: ['Heavy Vehicles', 'Light Vehicles'],
    datasets: [
      {
        label: 'Vehicle Type',
        data: [totals.heavyVehicles, totals.lightVehicles],
        backgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  };

  return (
    <div className="p-6 space-y-8">
      {/* Road Selector */}
      <div className="space-y-4">
        <label htmlFor="road" className="block font-medium text-gray-700">
          Select Road:
        </label>
        <select
          id="road"
          value={selectedRoad}
          onChange={(e) => setSelectedRoad(e.target.value)}
          className="w-full p-2 border rounded shadow-sm"
        >
          {roads.map((road) => (
            <option key={road} value={road}>
              {road}
            </option>
          ))}
        </select>
      </div>

      {/* Export Button */}
      <button
        onClick={exportData}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Export Data as CSV
      </button>

      {/* Charts */}
      {filteredDetections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="font-medium text-lg mb-4">Vehicle Breakdown</h2>
            <Bar data={chartData} />
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="font-medium text-lg mb-4">Vehicle Type Distribution</h2>
            <Pie data={pieData} />
          </div>
        </div>
      )}

      {/* Data Table */}
      {filteredDetections.length > 0 ? (
      <div className="overflow-auto mt-8">
      <table className="min-w-full bg-white border border-gray-300 rounded shadow">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Road Name</th>
            <th className="px-4 py-2 text-left font-medium">Cars</th>
            <th className="px-4 py-2 text-left font-medium">Trucks</th>
            <th className="px-4 py-2 text-left font-medium">Buses</th>
            <th className="px-4 py-2 text-left font-medium">Motorcycles</th>
            <th className="px-4 py-2 text-left font-medium">Vans</th>
            <th className="px-4 py-2 text-left font-medium">Heavy Vehicles</th>
            <th className="px-4 py-2 text-left font-medium">Light Vehicles</th>
          </tr>
        </thead>
        <tbody>
          {filteredDetections.map((detection, index) => {
            const stats = detection.stats || {};
            const total = Object.values(stats).reduce((a, b) => a + b, 0);
            const heavy = (stats.Bus || 0) + (stats.Truck || 0);
            const light = total - heavy;
    
            return (
              <tr
                key={index}
                className={`border-t ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-blue-50 transition-colors`}
              >
                <td className="px-4 py-3 text-gray-700">{detection.roadName}</td>
                <td className="px-4 py-3 text-gray-700">{stats.Car || 0}</td>
                <td className="px-4 py-3 text-gray-700">{stats.Truck || 0}</td>
                <td className="px-4 py-3 text-gray-700">{stats.Bus || 0}</td>
                <td className="px-4 py-3 text-gray-700">{stats.Motorcycle || 0}</td>
                <td className="px-4 py-3 text-gray-700">{stats.Van || 0}</td>
                <td className="px-4 py-3 text-gray-700">{heavy}</td>
                <td className="px-4 py-3 text-gray-700">{light}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
      ) : (
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded mt-8">
          No data available for the selected road. Please select another road.
        </div>
      )}
    </div>
  );
};

export default Reports;
import React from 'react';
import { FaCar, FaTruck, FaBus, FaMotorcycle, FaShuttleVan } from 'react-icons/fa';

const DetectionStats = ({ data }: { data: any }) => {
  // Default to empty data if no props are provided
  const { classCounters = {}, heavyVehicles = 0, lightVehicles = 0 } = data || {};

  // Define icons and labels for vehicle types
  const vehicleTypes = [
    { label: 'Cars', icon: <FaCar className="text-blue-500" />, count: classCounters.Car || 0 },
    { label: 'Trucks', icon: <FaTruck className="text-green-500" />, count: classCounters.Truck || 0 },
    { label: 'Buses', icon: <FaBus className="text-yellow-500" />, count: classCounters.Bus || 0 },
    { label: 'Motorcycles', icon: <FaMotorcycle className="text-red-500" />, count: classCounters.Motorcycle || 0 },
    { label: 'Vans', icon: <FaShuttleVan className="text-purple-500" />, count: classCounters.Van || 0 },
  ];

  return (
    <div className="mt-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6 text-center">Vehicle Detection Results</h2>

      {/* Display individual vehicle counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {vehicleTypes.map((vehicle) => (
          <div
            key={vehicle.label}
            className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg shadow hover:shadow-md"
          >
            <div className="text-3xl mb-2">{vehicle.icon}</div>
            <p className="text-sm font-medium">{vehicle.label}</p>
            <p className="text-xl font-bold">{vehicle.count}</p>
          </div>
        ))}
      </div>

      {/* Display heavy and light vehicle totals */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center bg-red-100 p-4 rounded-lg shadow hover:shadow-md">
          <div className="text-3xl text-red-500 mb-2">
            <FaTruck />
          </div>
          <p className="text-sm font-medium text-red-600">Heavy Vehicles</p>
          <p className="text-2xl font-bold text-red-600">{heavyVehicles}</p>
        </div>
        <div className="flex flex-col items-center justify-center bg-blue-100 p-4 rounded-lg shadow hover:shadow-md">
          <div className="text-3xl text-blue-500 mb-2">
            <FaCar />
          </div>
          <p className="text-sm font-medium text-blue-600">Light Vehicles</p>
          <p className="text-2xl font-bold text-blue-600">{lightVehicles}</p>
        </div>
      </div>
    </div>
  );
};

export default DetectionStats;
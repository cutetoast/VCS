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
    <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Vehicle Detection Results</h2>

      {/* Display individual vehicle counts */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {vehicleTypes.map((vehicle) => (
          <div
            key={vehicle.label}
          className="bg-white rounded-xl p-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.1),0_10px_20px_-2px_rgba(0,0,0,0.06)] transition-shadow duration-300 ease-in-out"
          style={{ backgroundColor: 'white' }}
          >
          <div className="flex items-center justify-between">
            <div>
            <p className="text-sm font-medium">{vehicle.label}</p>
            <p className="text-xl font-bold">{vehicle.count}</p>
            </div>
            <div className="text-3xl mb-2">{vehicle.icon}</div>
          </div>
        </div>
        ))}
      </div>

      {/* Display heavy and light vehicle totals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-[0_2px_15px_-3px_rgba(251,146,60,0.3)] hover:shadow-[0_2px_15px_-3px_rgba(251,146,60,0.4)] transition-shadow duration-300 ease-in-out">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Heavy Vehicles</h3>
              <p className="text-3xl font-bold mt-2">{heavyVehicles}</p>
            </div>
            <FaTruck className="w-10 h-10 text-white/90" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-[0_2px_15px_-3px_rgba(59,130,246,0.3)] hover:shadow-[0_2px_15px_-3px_rgba(59,130,246,0.4)] transition-shadow duration-300 ease-in-out">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Light Vehicles</h3>
              <p className="text-3xl font-bold mt-2">{lightVehicles}</p>
            </div>
            <FaCar className="w-10 h-10 text-white/90" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionStats;
import React from 'react';
import { MapPin } from 'lucide-react';

interface RoadSelectorProps {
  selectedRoad: string;
  onRoadChange: (roadId: string) => void;
  roads: Array<{ id: number; name: string }>;
}

const RoadSelector: React.FC<RoadSelectorProps> = ({
  selectedRoad,
  onRoadChange,
  roads,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <MapPin className="inline-block w-4 h-4 mr-1" />
        Select Road
      </label>
      <select
        value={selectedRoad}
        onChange={(e) => onRoadChange(e.target.value)}
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="all">All Roads</option>
        {roads.map((road) => (
          <option key={road.id} value={road.id}>
            {road.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoadSelector;
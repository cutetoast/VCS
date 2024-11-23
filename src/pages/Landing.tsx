import React from 'react';
import { Link } from 'react-router-dom';
import { Car, BarChart2, Shield, Activity } from 'lucide-react';

const Landing = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Intelligent Vehicle Detection & Analytics
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Advanced AI-powered vehicle detection and traffic analysis platform for smart cities and transportation management.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/signup"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <Car className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Real-time Detection</h3>
          <p className="text-gray-600">
            Advanced AI algorithms for accurate vehicle detection and classification in real-time.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <BarChart2 className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
          <p className="text-gray-600">
            Comprehensive traffic analysis with detailed reports and visualizations.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <Activity className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Traffic Insights</h3>
          <p className="text-gray-600">
            Make data-driven decisions with our advanced traffic pattern analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
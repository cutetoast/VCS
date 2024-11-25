import React from 'react';
import { Link } from 'react-router-dom';
import { Car, BarChart2, Shield, Activity } from 'lucide-react';

const Landing = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      {/* Hero Section */}
      <div className="text-center py-16 relative">
        <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
          Intelligent Vehicle Detection & Analytics
        </h1>
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          AI-powered vehicle detection and traffic analysis designed for smart cities and next-generation transportation systems.
        </p>
        <div className="flex justify-center gap-6">
          <Link
            to="/signup"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-full bg-gray-200 text-gray-800 font-semibold shadow-md hover:bg-gray-300 transition"
          >
            Sign In
          </Link>
        </div>
        {/* Decorative Elements */}
        <div className="absolute -z-10 top-0 left-0 w-72 h-72 bg-blue-400 opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute -z-10 bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-20 blur-3xl rounded-full"></div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 py-16">
        {[
          {
            icon: <Car className="w-12 h-12 text-purple-600 mb-4" />,
            title: 'Real-time Detection',
            description:
              'Advanced AI algorithms for accurate vehicle detection and classification in real-time.',
          },
          {
            icon: <BarChart2 className="w-12 h-12 text-purple-600 mb-4" />,
            title: 'Detailed Analytics',
            description:
              'Comprehensive traffic analysis with detailed reports and visualizations.',
          },
          {
            icon: <Activity className="w-12 h-12 text-purple-600 mb-4" />,
            title: 'Traffic Insights',
            description:
              'Make data-driven decisions with our advanced traffic pattern analysis.',
          },
          {
            icon: <Shield className="w-12 h-12 text-purple-600 mb-4" />,
            title: 'Data Security',
            description:
              'Built-in security protocols to safeguard sensitive traffic data.',
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300"
          >
            {feature.icon}
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Landing;
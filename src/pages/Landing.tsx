import { Link } from 'react-router-dom';
import { Car, BarChart2, Shield, Activity } from 'lucide-react';

const Landing = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      {/* Hero Section */}
      <div className="text-center py-16 relative">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6 leading-tight">
          Intelligent Vehicle Detection & Analytics
        </h1>
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">
          AI-powered vehicle detection and traffic analysis for smart cities and next-generation transportation systems.
        </p>
        <div className="flex justify-center gap-4 md:gap-6">
          <Link
            to="/signup"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:opacity-90 transition"
            aria-label="Sign up for the system"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-full bg-gray-200 text-gray-800 font-medium shadow-md hover:bg-gray-300 transition"
            aria-label="Sign in to your account"
          >
            Sign In
          </Link>
          <Link
            to="/learn-more"
            className="px-8 py-3 rounded-full bg-blue-100 text-blue-700 font-medium shadow-md hover:bg-blue-200 transition"
            aria-label="Learn more about the system"
          >
            Learn More
          </Link>
        </div>
        {/* Decorative Elements */}
        <div className="absolute -z-10 top-0 left-0 w-80 h-80 bg-blue-400 opacity-25 blur-3xl rounded-full"></div>
        <div className="absolute -z-10 bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-25 blur-3xl rounded-full"></div>
        <div className="absolute -z-10 top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-300 to-purple-300 opacity-10 blur-3xl rounded-full"></div>
      </div>

      {/* Features Section */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 py-16">
        {[
          {
            icon: <Car className="w-14 h-14 text-purple-600 mb-4" />,
            title: 'Real-time Detection',
            description:
              'Advanced AI algorithms for accurate vehicle detection and classification in real-time.',
          },
          {
            icon: <BarChart2 className="w-14 h-14 text-purple-600 mb-4" />,
            title: 'Detailed Analytics',
            description:
              'Comprehensive traffic analysis with detailed reports and visualizations.',
          },
          {
            icon: <Activity className="w-14 h-14 text-purple-600 mb-4" />,
            title: 'Traffic Insights',
            description:
              'Make data-driven decisions with advanced traffic pattern analysis.',
          },
          {
            icon: <Shield className="w-14 h-14 text-purple-600 mb-4" />,
            title: 'Data Security',
            description:
              'Built-in security protocols to safeguard sensitive traffic data.',
          },
          {
            icon: <BarChart2 className="w-14 h-14 text-purple-600 mb-4" />,
            title: 'Performance Metrics',
            description:
              'Track system performance with real-time accuracy and efficiency metrics.',
          },
          {
            icon: <Activity className="w-14 h-14 text-purple-600 mb-4" />,
            title: 'Seamless Integration',
            description:
              'Easily integrate with existing smart city infrastructure.',
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white p-6 md:p-8 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition duration-300"
          >
            {feature.icon}
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
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
import React from "react";
import { Link } from "react-router-dom";
import { Car, BarChart2, Shield, Activity, ArrowRight } from "lucide-react";

const Landing: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      {/* Hero Section */}
      <div className="text-center py-16 relative">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6 leading-tight">
          Vehicle Detection & Counting
        </h1>
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">
          YOLOv11 powered vehicle detection and counting systems. Transform your
          traffic management with AI.
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
            aria-label="Sign in to the system"
          >
            Sign In
          </Link>
          {/* <Link
            to="/demo"
            className="px-8 py-3 rounded-full bg-gray-200 text-gray-800 font-medium shadow-md hover:bg-gray-300 transition"
            aria-label="Watch a demo of the system"
          >
            Watch Demo
          </Link> */}
        </div>
        {/* Decorative Elements */}
        <div className="absolute -z-10 top-0 left-0 w-80 h-80 bg-blue-400 opacity-25 blur-3xl rounded-full"></div>
        <div className="absolute -z-10 bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-25 blur-3xl rounded-full"></div>
        <div className="absolute -z-10 top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-300 to-purple-300 opacity-10 blur-3xl rounded-full"></div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Key Features
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              icon: <Car className="w-14 h-14 text-purple-600 mb-4" />,
              title: "Real-time Detection",
              description:
                "YOLOv11 algorithms for accurate vehicle detection and classification in real-time.",
            },
            {
              icon: <BarChart2 className="w-14 h-14 text-purple-600 mb-4" />,
              title: "Detailed Analytics",
              description:
                "Comprehensive traffic analysis with detailed reports and visualizations.",
            },
            {
              icon: <Activity className="w-14 h-14 text-purple-600 mb-4" />,
              title: "Traffic Insights",
              description:
                "Make data-driven decisions with advanced traffic pattern analysis.",
            },
            // {
            //   icon: <Shield className="w-14 h-14 text-purple-600 mb-4" />,
            //   title: 'Data Security',
            //   description: 'Built-in security protocols to safeguard sensitive traffic data.',
            // },
            // {
            //   icon: <BarChart2 className="w-14 h-14 text-purple-600 mb-4" />,
            //   title: 'Performance Metrics',
            //   description: 'Track system performance with real-time accuracy and efficiency metrics.',
            // },
            // {
            //   icon: <Activity className="w-14 h-14 text-purple-600 mb-4" />,
            //   title: 'Seamless Integration',
            //   description: 'Easily integrate with existing smart city infrastructure.',
            // },
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

      {/* Testimonials Section */}
      {/* <div id="testimonials" className="py-16 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          What Our Clients Say
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              quote: "VehicleAI has revolutionized our city's traffic management. The accuracy is unparalleled.",
              author: "Jane Doe, City Traffic Manager"
            },
            {
              quote: "The insights we've gained have helped us make data-driven decisions to improve traffic flow.",
              author: "John Smith, Urban Planner"
            },
            {
              quote: "Easy to integrate and use. It's become an essential tool for our smart city initiative.",
              author: "Emily Brown, Smart City Coordinator"
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
              <p className="text-gray-800 font-semibold">{testimonial.author}</p>
            </div>
          ))}
        </div>
      </div> */}

      {/* Pricing Section */}
      {/* <div id="pricing" className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Pricing Plans
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              name: "Starter",
              price: "$99/month",
              features: ["Up to 5 detection points", "Basic analytics", "24/7 support"]
            },
            {
              name: "Pro",
              price: "$299/month",
              features: ["Up to 20 detection points", "Advanced analytics", "API access", "Priority support"]
            },
            {
              name: "Enterprise",
              price: "Custom",
              features: ["Unlimited detection points", "Custom integrations", "Dedicated account manager"]
            }
          ].map((plan, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold text-purple-600 mb-6">{plan.price}</p>
              <ul className="mb-6 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center mb-2">
                    <ArrowRight className="w-5 h-5 text-purple-600 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-center font-medium hover:opacity-90 transition"
              >
                Choose Plan
              </Link>
            </div>
          ))}
        </div>
      </div> */}

      {/* Call to Action */}
      {/* <div className="text-center py-16">
        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Ready to Transform Your Traffic Management?
        </h2>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          Join the cities already benefiting from VehicleAI's cutting-edge technology.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/signup"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:opacity-90 transition"
          >
            Get Started Now
          </Link>
          <Link
            to="/contact"
            className="px-8 py-3 rounded-full bg-gray-200 text-gray-800 font-medium shadow-md hover:bg-gray-300 transition"
          >
            Contact Sales
          </Link>
        </div>
      </div> */}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 mb-4 md:mb-0">
            © 2024 Muhammad Mokhtar. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <Link
              to="/terms"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, Award, Star } from 'lucide-react';
import Header from '../components/Layout/Header';

const HomePage = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Professional Events',
      description: 'Discover workshops, conferences, and training sessions led by industry experts.'
    },
    {
      icon: Users,
      title: 'Expert Coaches',
      description: 'Connect with certified coaches and mentors to accelerate your growth.'
    },
    {
      icon: Award,
      title: 'Skill Development',
      description: 'Build valuable skills through hands-on learning and practical experience.'
    },
    {
      icon: Star,
      title: 'Quality Assured',
      description: 'All events and coaches are carefully vetted to ensure the highest quality.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Events Hosted' },
    { number: '50+', label: 'Expert Coaches' },
    { number: '10K+', label: 'Participants' },
    { number: '95%', label: 'Satisfaction Rate' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Transform Your Career with
              <span className="text-primary-600 block">Expert-Led Events</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in">
              Join thousands of professionals who are advancing their careers through our 
              carefully curated events and world-class coaching programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link
                to="/events"
                className="btn-primary inline-flex items-center text-lg px-8 py-4"
              >
                Explore Events
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/coaches"
                className="btn-outline inline-flex items-center text-lg px-8 py-4"
              >
                Meet Our Coaches
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ImpactBoard?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the highest quality learning experiences 
              that drive real career growth and personal development.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-hover text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join our community of learners and take the next step in your professional development.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Get Started Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IB</span>
              </div>
              <span className="text-xl font-bold">ImpactBoard</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering professionals through expert-led events and coaching.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <Link to="/events" className="hover:text-white transition-colors duration-200">
                Events
              </Link>
              <Link to="/coaches" className="hover:text-white transition-colors duration-200">
                Coaches
              </Link>
              <span>© 2025 ImpactBoard. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
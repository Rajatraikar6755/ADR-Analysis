
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, AlertCircle, FileText, MessageSquare, CheckCircle } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-teal-50 via-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12">
            <div className="flex items-center mb-4">
              <Heart className="text-healthcare-600 h-8 w-8 mr-2" />
              <h1 className="text-3xl md:text-4xl font-bold text-healthcare-900">
                ADR Analysis
              </h1>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              AI-Based Adverse Drug Reaction Prediction with Live Doctor Support
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Predict potential adverse drug reactions, get personalized health recommendations, 
              and connect with medical professionals - all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button asChild size="lg" className="bg-healthcare-600 hover:bg-healthcare-700">
                <Link to="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Login</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-healthcare-600 mt-1 mr-2" />
                <p className="text-gray-700">Predict adverse drug reactions</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-healthcare-600 mt-1 mr-2" />
                <p className="text-gray-700">Free AI health assistant</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-healthcare-600 mt-1 mr-2" />
                <p className="text-gray-700">Personalized health plans</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-healthcare-600 mt-1 mr-2" />
                <p className="text-gray-700">Connect with medical professionals</p>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 mt-8 md:mt-0">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-white p-8 rounded-xl border-2 border-healthcare-100">
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="h-10 w-10 text-healthcare-600 mr-3" />
                    <h3 className="text-xl font-semibold">Medication Risk Analysis</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg border-l-4 border-success-500">
                      <span className="font-medium">Ibuprofen</span>
                      <span className="px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm">Low Risk</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg border-l-4 border-warning-500">
                      <span className="font-medium">Lisinopril</span>
                      <span className="px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-sm">Medium Risk</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg border-l-4 border-danger-500">
                      <span className="font-medium">Warfarin + Aspirin</span>
                      <span className="px-3 py-1 bg-danger-100 text-danger-700 rounded-full text-sm">High Risk</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center mb-4">
                    <FileText className="h-6 w-6 text-healthcare-600 mr-3" />
                    <h3 className="text-lg font-semibold">Recommendations</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="p-2 bg-gray-50 rounded">Consider alternative to Warfarin based on your health profile</li>
                    <li className="p-2 bg-gray-50 rounded">Monitor blood pressure twice daily</li>
                    <li className="p-2 bg-gray-50 rounded">Avoid grapefruit with your current medications</li>
                  </ul>
                </div>

                <div>
                  <div className="flex items-center mb-4">
                    <MessageSquare className="h-6 w-6 text-healthcare-600 mr-3" />
                    <h3 className="text-lg font-semibold">AI Assistant</h3>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p className="font-medium text-gray-700">How can I help you with your medications today?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

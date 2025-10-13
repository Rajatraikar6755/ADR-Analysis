
import React from 'react';
import Reveal from '@/components/ui/Reveal';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Stethoscope, MessageSquare, AlertTriangle, Clock, Upload, Heart } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const PremiumPlans: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Basic features for personal use',
      features: [
        { name: 'AI-powered medication risk assessment', included: true },
        { name: 'Basic health recommendations', included: true },
        { name: 'AI health assistant chat', included: true },
        { name: 'Medical document upload & analysis', included: true, limit: '3 per month' },
        { name: 'Live doctor consultations', included: false },
        { name: 'Priority risk assessment', included: false },
        { name: 'Personalized exercise & diet plans', included: false },
        { name: '24/7 emergency doctor access', included: false },
      ],
      buttonText: 'Current Plan',
      buttonAction: () => toast.info('You are already on the Free plan'),
      recommended: false
    },
    {
      name: 'Premium',
      price: '$12.99',
      period: 'per month',
      description: 'Advanced features with professional support',
      features: [
        { name: 'AI-powered medication risk assessment', included: true },
        { name: 'Detailed health recommendations', included: true },
        { name: 'AI health assistant chat', included: true },
        { name: 'Medical document upload & analysis', included: true, limit: 'Unlimited' },
        { name: 'Live doctor consultations', included: true, limit: '2 per month' },
        { name: 'Priority risk assessment', included: true },
        { name: 'Personalized exercise & diet plans', included: true },
        { name: '24/7 emergency doctor access', included: false },
      ],
      buttonText: 'Upgrade to Premium',
      buttonAction: () => toast.success('Premium subscription will be implemented with actual payment integration'),
      recommended: true
    },
    {
      name: 'Family',
      price: '$29.99',
      period: 'per month',
      description: 'Complete coverage for up to 5 family members',
      features: [
        { name: 'AI-powered medication risk assessment', included: true },
        { name: 'Comprehensive health recommendations', included: true },
        { name: 'AI health assistant chat', included: true },
        { name: 'Medical document upload & analysis', included: true, limit: 'Unlimited' },
        { name: 'Live doctor consultations', included: true, limit: '5 per month' },
        { name: 'Priority risk assessment', included: true },
        { name: 'Personalized exercise & diet plans', included: true },
        { name: '24/7 emergency doctor access', included: true },
      ],
      buttonText: 'Upgrade to Family',
      buttonAction: () => toast.success('Family subscription will be implemented with actual payment integration'),
      recommended: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <Reveal>
          <Heart className="h-10 w-10 text-healthcare-600 mx-auto mb-4 animate-zoom-in" />
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="text-3xl font-bold mb-2 animate-slide-in-up">Premium Doctor Support</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up">
            Upgrade to get personalized healthcare advice and live consultations with medical professionals
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: 0.06 * index }}>
          <Card 
            className={`flex flex-col ${
              plan.recommended 
                ? 'border-healthcare-500 shadow-lg relative overflow-hidden' 
                : ''
            }`}
          >
            {plan.recommended && (
              <div className="absolute top-0 right-0">
                <div className="bg-healthcare-600 text-white text-xs font-semibold px-4 py-1 rounded-bl-lg">
                  Recommended
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-500 ml-1">{plan.period}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.name}
                      {feature.limit && feature.included && (
                        <span className="text-gray-400 text-xs ml-1">({feature.limit})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={plan.buttonAction}
                className={`w-full ${
                  plan.name === 'Free' 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : plan.recommended 
                      ? 'bg-gradient-accent text-white hover:opacity-90' 
                      : 'bg-healthcare-500 hover:bg-healthcare-600'
                }`}
                variant={plan.name === 'Free' ? 'outline' : 'default'}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 space-y-8">
        <h2 className="text-2xl font-bold text-center">Premium Benefits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-healthcare-100 mb-4">
              <Stethoscope className="h-6 w-6 text-healthcare-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Doctor Consultations</h3>
            <p className="text-gray-600">Connect with certified healthcare professionals via video, voice, or chat.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-healthcare-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-healthcare-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Priority Risk Assessment</h3>
            <p className="text-gray-600">Get faster and more detailed analysis of medication interactions and risks.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-healthcare-100 mb-4">
              <Upload className="h-6 w-6 text-healthcare-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unlimited Document Analysis</h3>
            <p className="text-gray-600">Upload and analyze unlimited medical documents and health reports.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-healthcare-100 mb-4">
              <Clock className="h-6 w-6 text-healthcare-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">24/7 Emergency Access</h3>
            <p className="text-gray-600">Get emergency medical advice from on-call doctors any time of day (Family plan).</p>
          </div>
        </div>
        
        <Reveal>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center mt-8 animate-slide-in-up">
            <h3 className="text-lg font-semibold mb-2">Need a Custom Plan?</h3>
            <p className="text-gray-600 mb-4">We offer tailored solutions for healthcare providers and organizations</p>
            <Button variant="outline">Contact for Enterprise Options</Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default PremiumPlans;

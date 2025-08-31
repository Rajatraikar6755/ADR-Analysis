
import React from 'react';
import { Shield, Microscope, Book, Stethoscope, AlertTriangle, FilePlus } from 'lucide-react';

const features = [
  {
    title: "Predict Adverse Drug Reactions",
    description: "Our AI analyzes your medications and health profile to identify potential adverse reactions before they occur.",
    icon: AlertTriangle,
    color: "text-danger-500",
    bgColor: "bg-danger-50"
  },
  {
    title: "Health Data Analysis",
    description: "Upload medical reports in various formats and let our system extract and analyze important data using OCR and NLP.",
    icon: FilePlus,
    color: "text-healthcare-500",
    bgColor: "bg-healthcare-50"
  },
  {
    title: "AI Risk Assessment",
    description: "Receive detailed risk assessments (Low/Medium/High) with clear explanations about potential medication interactions.",
    icon: Shield,
    color: "text-warning-500",
    bgColor: "bg-warning-50"
  },
  {
    title: "Alternative Treatments",
    description: "Get suggestions for safer drug alternatives and natural remedies based on your specific health conditions.",
    icon: Book,
    color: "text-success-500",
    bgColor: "bg-success-50"
  },
  {
    title: "Advanced AI Technology",
    description: "Our system uses machine learning models trained on extensive medical datasets to ensure accurate predictions.",
    icon: Microscope,
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  {
    title: "Expert Medical Support",
    description: "Connect with healthcare professionals for personalized advice and support through our premium subscription.",
    icon: Stethoscope,
    color: "text-healthcare-700",
    bgColor: "bg-healthcare-50"
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Comprehensive Health Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform combines advanced AI technology with medical expertise to provide you with a complete health management solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className={`${feature.bgColor} p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4`}>
                <feature.icon className={`h-7 w-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;


import React, { useRef } from 'react';
import { Shield, Microscope, Book, Stethoscope, AlertTriangle, FilePlus } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import Reveal from '@/components/ui/Reveal';

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="py-16 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={itemVariants}
        >
          <Reveal>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 animate-slide-in-up">Comprehensive Health Features</h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up">
              Our platform combines advanced AI technology with medical expertise to provide you with a complete health management solution.
            </p>
          </Reveal>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 animate-zoom-in"
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <Reveal delay={index * 0.05}>
                <div className={`${feature.bgColor} p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 animate-rotate-in`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Reveal>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;

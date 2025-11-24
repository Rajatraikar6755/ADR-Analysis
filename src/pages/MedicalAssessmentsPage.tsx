import React from 'react';
import { PatientAssessments } from '@/components/patient/PatientAssessments';

const MedicalAssessmentsPage: React.FC = () => {
    return (
        <div className="container mx-auto">
            <PatientAssessments />
        </div>
    );
};

export default MedicalAssessmentsPage;

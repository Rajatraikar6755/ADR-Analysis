import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import HealthcareSearch from '@/components/patient/HealthcareSearch';

const HealthcareSearchPage: React.FC = () => {
    return (
        <MainLayout>
            <HealthcareSearch />
        </MainLayout>
    );
};

export default HealthcareSearchPage;

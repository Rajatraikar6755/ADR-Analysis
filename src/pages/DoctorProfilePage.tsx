import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import DoctorProfile from '@/components/doctor/DoctorProfile';

const DoctorProfilePage: React.FC = () => {
    return (
        <MainLayout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Doctor Profile</h1>
                <DoctorProfile />
            </div>
        </MainLayout>
    );
};

export default DoctorProfilePage;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, HeartPulse, Dumbbell, ArrowLeft, Trash2, Stethoscope } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define the structure for the full assessment result
interface FullAssessment {
    id: string;
    date: string;
    medications: { name: string, dosage: string, frequency: string }[];
    riskPercentage: number;
    summary: string;
    recommendedSpecialist: string;
    alternatives: {
        originalDrug: string;
        suggestion: string;
        reasoning: string;
    }[];
    recommendations: {
        area: string;
        advice: string;
    }[];
}

const getRiskColor = (percentage: number) => {
    if (percentage >= 70) return 'text-red-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-green-600';
}

const AssessmentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState<FullAssessment | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedAssessments: FullAssessment[] = JSON.parse(localStorage.getItem('adr-assessments-full') || '[]');
        const found = savedAssessments.find(a => a.id === id);
        setAssessment(found || null);
        setIsLoading(false);
    }, [id]);

    const handleDelete = () => {
        if (!assessment) return;

        let fullAssessments: FullAssessment[] = JSON.parse(localStorage.getItem('adr-assessments-full') || '[]');
        fullAssessments = fullAssessments.filter(a => a.id !== assessment.id);
        localStorage.setItem('adr-assessments-full', JSON.stringify(fullAssessments));

        let summaryAssessments = JSON.parse(localStorage.getItem('adr-assessments') || '[]');
        summaryAssessments = summaryAssessments.filter(a => a.id !== assessment.id);
        localStorage.setItem('adr-assessments', JSON.stringify(summaryAssessments));

        toast.success("Assessment deleted successfully.");
        navigate('/patient-dashboard');
    };

    if (isLoading) {
        return <ProtectedRoute><MainLayout><div>Loading report...</div></MainLayout></ProtectedRoute>;
    }

    if (!assessment) {
        return (
            <ProtectedRoute>
                <MainLayout>
                    <div className="text-center py-10">
                        <h1 className="text-2xl font-bold">Assessment Not Found</h1>
                        <p className="text-gray-600">This report may have been deleted.</p>
                        <Button asChild variant="link" className="mt-4">
                            <Link to="/patient-dashboard">Back to Dashboard</Link>
                        </Button>
                    </div>
                </MainLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <MainLayout>
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <Link to="/patient-dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-black font-medium">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Report
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this assessment report.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Assessment from {new Date(assessment.date).toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className='text-center p-6 bg-gray-50 rounded-lg'>
                                <p className='text-lg text-gray-600'>Adverse Reaction Risk</p>
                                <p className={`text-6xl font-bold ${getRiskColor(assessment.riskPercentage)}`}>{assessment.riskPercentage}%</p>
                            </div>
                            <div>
                                <h3 className='font-semibold mb-2'>Summary</h3>
                                <p className='text-gray-700'>{assessment.summary}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {assessment.recommendedSpecialist && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Stethoscope className="text-blue-600" /> Recommended Specialist</CardTitle>
                                <CardDescription>Based on your profile, you may want to consult the following specialist.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-bold text-blue-800">{assessment.recommendedSpecialist}</p>
                            </CardContent>
                        </Card>
                    )}

                    {assessment.alternatives?.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Pill/> Suggested Alternatives</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {assessment.alternatives.map((alt, i) => (
                                    <div key={i} className='p-3 bg-blue-50 rounded-lg border border-blue-200'>
                                        <p>For <strong className='font-semibold'>{alt.originalDrug}</strong>, consider discussing <strong className='font-semibold'>{alt.suggestion}</strong> with your doctor.</p>
                                        <p className='text-sm text-gray-600 mt-1'><strong>Reasoning:</strong> {alt.reasoning}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {assessment.recommendations?.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><HeartPulse/> Lifestyle Recommendations</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {assessment.recommendations.map((rec, i) => (
                                    <div key={i} className='p-3 bg-green-50 rounded-lg border border-green-200'>
                                        <p className='font-semibold flex items-center gap-2'>{rec.area === 'Exercise' && <Dumbbell className='h-4 w-4'/>} {rec.area}</p>
                                        <p className='text-sm text-gray-600 mt-1'>{rec.advice}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
};

export default AssessmentDetailPage;
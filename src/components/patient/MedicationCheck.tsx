import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilePlus, X, Pill, Loader2, HeartPulse, Dumbbell, Stethoscope} from 'lucide-react';
import { toast } from '@/components/ui/sonner';


interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

interface RiskResult {
    riskPercentage: number;
    summary: string;
    recommendedSpecialist: string;
    alternatives: {
        originalDrug: string;
        suggestion: string;
        reasoning: string;
        type?: "modern" | "ayurvedic";
    }[];
    recommendations: {
        area: string;
        advice: string;
    }[];
}

const MedicationCheck: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [currentMedication, setCurrentMedication] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentDosage, setCurrentDosage] = useState('');
  const [currentFrequency, setCurrentFrequency] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [isAssessing, setIsAssessing] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);

  useEffect(() => {
    if (currentMedication.length < 3) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${currentMedication}`);
        const data = await response.json();
        const suggestions = data.suggestionGroup.suggestionList.suggestion || [];
        setSuggestions(suggestions.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch medication suggestions:", error);
      }
    };
    const debounce = setTimeout(() => fetchSuggestions(), 300);
    return () => clearTimeout(debounce);
  }, [currentMedication]);

  const addMedication = () => {
    if (!currentMedication.trim()) {
      toast.error('Please enter a medication name');
      return;
    }
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: currentMedication,
      dosage: currentDosage,
      frequency: currentFrequency
    };
    setMedications([...medications, newMedication]);
    setCurrentMedication('');
    setCurrentDosage('');
    setCurrentFrequency('');
    setSuggestions([]);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success(`File "${e.target.files[0].name}" uploaded successfully`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (medications.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }
    setIsAssessing(true);
    setResult(null);

    // Fetch the saved health profile from localStorage
    const savedProfile = localStorage.getItem('healthProfile');
    const healthProfile = savedProfile ? JSON.parse(savedProfile) : {};

    const formData = new FormData();
    formData.append('medications', JSON.stringify(medications));
    formData.append('conditions', medicalConditions); // Keep this for conditions added on-the-fly
    formData.append('healthProfile', JSON.stringify(healthProfile)); // Send the full profile
    if (file) {
      formData.append('document', file);
    }

    try {
      const response = await fetch("http://localhost:3001/api/assess-risk", {
          method: 'POST',
          body: formData,
      });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Assessment failed');
      }
      const assessmentResult = await response.json();
      setResult(assessmentResult);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsAssessing(false);
    }
  };
  
  const handleSaveReport = () => {
    if (!result) return;
    const fullAssessments = JSON.parse(localStorage.getItem('adr-assessments-full') || '[]');
    const newFullAssessment = { ...result, id: Date.now().toString(), date: new Date().toISOString(), medications: medications, };
    fullAssessments.unshift(newFullAssessment);
    localStorage.setItem('adr-assessments-full', JSON.stringify(fullAssessments));
    
    const summaryAssessments = JSON.parse(localStorage.getItem('adr-assessments') || '[]');
    const newSummary = { id: newFullAssessment.id, date: newFullAssessment.date, medications: medications.map(m => ({ name: m.name })), riskPercentage: result.riskPercentage, };
    summaryAssessments.unshift(newSummary);
    localStorage.setItem('adr-assessments', JSON.stringify(summaryAssessments));
    toast.success("Report saved successfully!");
  };

  const resetAssessment = () => {
    setResult(null);
    setMedications([]);
    setMedicalConditions('');
    setFile(null);
  };
  
  const getRiskColor = (percentage: number) => {
      if (percentage >= 70) return 'text-red-600';
      if (percentage >= 40) return 'text-yellow-600';
      return 'text-green-600';
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Medication Risk Assessment</h1>
      
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Medications</CardTitle>
              <CardDescription>Enter all medications you are currently taking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2 relative">
                  <Label htmlFor="medication">Medication Name</Label>
                  <Input
                    id="medication"
                    placeholder="e.g., Lisinopril"
                    value={currentMedication}
                    onChange={(e) => setCurrentMedication(e.target.value)}
                    autoComplete="off"
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg">
                      {suggestions.map(s => (
                        <div key={s} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                          setCurrentMedication(s);
                          setSuggestions([]);
                        }}>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="dosage">Dosage (mg)</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 10"
                    type="number"
                    value={currentDosage}
                    onChange={(e) => setCurrentDosage(e.target.value)}
                  />
                </div>
                <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={currentFrequency} onValueChange={setCurrentFrequency}>
                        <SelectTrigger id="frequency">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Once Daily">Once Daily</SelectItem>
                            <SelectItem value="Twice Daily">Twice Daily</SelectItem>
                            <SelectItem value="Three Times Daily">Three Times Daily</SelectItem>
                            <SelectItem value="As Needed">As Needed</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button type="button" onClick={addMedication} className="w-full">
                    Add
                </Button>
              </div>
              
              {medications.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Medication List:</h3>
                  <div className="space-y-2">
                    {medications.map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <div className='flex items-center gap-2'>
                            <Pill className='h-4 w-4 text-gray-500'/>
                            <span className="font-medium">{med.name}</span>
                            <span className="text-sm text-gray-500">{med.dosage ? `${med.dosage}mg` : ''}</span>
                            <span className="text-sm text-gray-500">{med.frequency}</span>
                          </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeMedication(med.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Health Conditions & Documents</CardTitle>
              <CardDescription>Provide your health history for a more accurate assessment.</CardDescription>
            </CardHeader>
            <CardContent>
                <Label htmlFor="conditions">List any known health conditions (e.g., Hypertension, Diabetes)</Label>
                <Textarea
                    id="conditions"
                    placeholder="e.g., High blood pressure, Type 2 Diabetes, Penicillin allergy..."
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    className="min-h-[100px] mb-4"
                />
                <Label>Upload Medical Records (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                        <FilePlus className="h-10 w-10 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-healthcare-600">Click to upload a file</span>
                        <span className="text-xs text-gray-500 mt-1">PDF, DOCX, JPG, PNG</span>
                    </Label>
                    {file && (
                        <div className="mt-4 text-sm text-gray-600 flex items-center justify-center">
                            {file.name}
                            <Button variant='ghost' size='sm' onClick={() => setFile(null)}><X className='h-4 w-4'/></Button>
                        </div>
                    )}
                </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="bg-healthcare-600 hover:bg-healthcare-700" disabled={isAssessing}>
              {isAssessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : 'Analyze Medications'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className='text-center p-6 bg-gray-50 rounded-lg'>
                    <p className='text-lg text-gray-600'>Adverse Reaction Risk</p>
                    <p className={`text-6xl font-bold ${getRiskColor(result.riskPercentage)}`}>{result.riskPercentage}%</p>
                </div>
                <div>
                    <h3 className='font-semibold mb-2'>Summary</h3>
                    <p className='text-gray-700'>{result.summary}</p>
                </div>
            </CardContent>
          </Card>
          {result.recommendedSpecialist && (
    <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="text-blue-600" />
                Recommended Specialist
            </CardTitle>
            <CardDescription>
                Based on your profile, you may want to consult the following specialist.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-xl font-bold text-blue-800">{result.recommendedSpecialist}</p>
        </CardContent>
    </Card>
)}
          {result.alternatives && result.alternatives.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Pill/> Suggested Alternatives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Modern Pharmaceutical Alternatives */}
                    {result.alternatives.filter(alt => !alt.type || alt.type === 'modern').length > 0 && (
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <Pill className="h-4 w-4" />
                                Modern Pharmaceutical Alternatives
                            </h4>
                            <div className="space-y-3">
                                {result.alternatives.filter(alt => !alt.type || alt.type === 'modern').map((alt, i) => (
                                    <div key={`modern-${i}`} className='p-3 bg-blue-50 rounded-lg border border-blue-200'>
                                        <p>For <strong className='font-semibold'>{alt.originalDrug}</strong>, consider discussing <strong className='font-semibold'>{alt.suggestion}</strong> with your doctor.</p>
                                        <p className='text-sm text-gray-600 mt-1'><strong>Reasoning:</strong> {alt.reasoning}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ayurvedic Alternatives */}
                    {result.alternatives.filter(alt => alt.type === 'ayurvedic').length > 0 && (
                        <div>
                            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                <span className="text-lg">🌿</span>
                                Ayurvedic Alternatives
                            </h4>
                            <div className="space-y-3">
                                {result.alternatives.filter(alt => alt.type === 'ayurvedic').map((alt, i) => (
                                    <div key={`ayurvedic-${i}`} className='p-3 bg-green-50 rounded-lg border border-green-200'>
                                        <p>For <strong className='font-semibold'>{alt.originalDrug}</strong>, consider <strong className='font-semibold'>{alt.suggestion}</strong> as an Ayurvedic alternative.</p>
                                        <p className='text-sm text-gray-600 mt-1'><strong>Reasoning:</strong> {alt.reasoning}</p>
                                        <p className='text-xs text-green-700 mt-2 italic'>⚠️ Consult with an Ayurvedic practitioner before using any herbal remedies.</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><HeartPulse/> Lifestyle Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {result.recommendations.map((rec, i) => (
                        <div key={i} className='p-3 bg-green-50 rounded-lg border border-green-200'>
                            <p className='font-semibold flex items-center gap-2'>{rec.area === 'Exercise' && <Dumbbell className='h-4 w-4'/>} {rec.area}</p>
                            <p className='text-sm text-gray-600 mt-1'>{rec.advice}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button onClick={resetAssessment} variant="outline">
              New Assessment
            </Button>
            <Button onClick={handleSaveReport} className="bg-healthcare-600 hover:bg-healthcare-700">
              Save Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationCheck;
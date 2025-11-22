// src/lib/mock-data.ts

export interface MockPatient {
  id: string;
  name: string;
  email: string;
  age: number;
  riskLevel: 'high' | 'medium' | 'low';
  conditions: string[];
}

export interface MockAssessment {
  id: string;
  patientId: string; // Links this assessment to a patient
  date: string;
  medications: { name: string; dosage: string; frequency: string }[];
  riskPercentage: number;
  summary: string;
  recommendedSpecialist: string;
}

export const mockPatients: MockPatient[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'patient@example.com',
    age: 45,
    riskLevel: 'high',
    conditions: ['Hypertension', 'Diabetes'],
  },
  {
    id: '2',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    age: 67,
    riskLevel: 'medium',
    conditions: ['Arthritis', 'High Cholesterol'],
  },
  {
    id: '3',
    name: 'Robert Smith',
    email: 'robert.s@example.com',
    age: 52,
    riskLevel: 'low',
    conditions: ['Allergies'],
  },
];

export const mockAssessments: MockAssessment[] = [
  {
    id: 'assess-101',
    patientId: '1', // Belongs to John Doe
    date: '2025-10-14T10:00:00.000Z',
    medications: [{ name: 'Lisinopril', dosage: '10', frequency: 'Once Daily' }],
    riskPercentage: 75,
    summary: 'High risk of adverse reaction due to interaction with existing conditions.',
    recommendedSpecialist: 'Cardiologist',
  },
  {
    id: 'assess-102',
    patientId: '1', // Belongs to John Doe
    date: '2025-09-20T11:30:00.000Z',
    medications: [{ name: 'Metformin', dosage: '500', frequency: 'Twice Daily' }],
    riskPercentage: 45,
    summary: 'Medium risk identified, monitoring of blood glucose is recommended.',
    recommendedSpecialist: 'Endocrinologist',
  },
  {
    id: 'assess-201',
    patientId: '2', // Belongs to Alice Johnson
    date: '2025-10-12T15:00:00.000Z',
    medications: [{ name: 'Ibuprofen', dosage: '200', frequency: 'As Needed' }],
    riskPercentage: 25,
    summary: 'Low risk, but monitor for stomach discomfort.',
    recommendedSpecialist: '',
  },
];
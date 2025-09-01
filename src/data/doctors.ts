export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    qualifications: string[];
    experience: string;
    hospital: string;
    location: string;
    address: string;
    email: string;
    phone: string;
    imageUrl: string;
    rating: number;
    consultationFee: number;
    availableDays: string[];
    availableTime: string;
    languages: string[];
    about: string;
    education: string[];
    certifications: string[];
    isAvailable: boolean;
}

export const doctors: Doctor[] = [
    {
        id: "doc-001",
        name: "Dr. Sarah Johnson",
        specialty: "Cardiologist",
        qualifications: ["MBBS", "MD - Cardiology", "FACC"],
        experience: "15+ years",
        hospital: "Apollo Heart Institute",
        location: "Mumbai, Maharashtra",
        address: "Apollo Heart Institute, Andheri West, Mumbai - 400058",
        email: "dr.sarah.johnson@apollo.com",
        phone: "+91-22-2493-7700",
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
        rating: 4.8,
        consultationFee: 2500,
        availableDays: ["Monday", "Wednesday", "Friday"],
        availableTime: "9:00 AM - 5:00 PM",
        languages: ["English", "Hindi", "Marathi"],
        about: "Dr. Sarah Johnson is a renowned cardiologist with over 15 years of experience in treating complex heart conditions. She specializes in interventional cardiology and has performed over 5000 successful procedures.",
        education: [
            "MBBS - Grant Medical College, Mumbai",
            "MD - Cardiology - AIIMS, Delhi",
            "Fellowship in Interventional Cardiology - Cleveland Clinic, USA"
        ],
        certifications: [
            "Board Certified Cardiologist",
            "Fellow of American College of Cardiology",
            "Advanced Cardiac Life Support (ACLS)"
        ],
        isAvailable: true
    },
    {
        id: "doc-002",
        name: "Dr. Rajesh Kumar",
        specialty: "Dermatologist",
        qualifications: ["MBBS", "MD - Dermatology", "DDV"],
        experience: "12+ years",
        hospital: "Fortis Skin & Hair Clinic",
        location: "Delhi, NCR",
        address: "Fortis Hospital, Sector 62, Noida - 201301",
        email: "dr.rajesh.kumar@fortis.com",
        phone: "+91-120-492-6900",
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
        rating: 4.6,
        consultationFee: 1800,
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        availableTime: "10:00 AM - 6:00 PM",
        languages: ["English", "Hindi", "Punjabi"],
        about: "Dr. Rajesh Kumar is a leading dermatologist specializing in cosmetic dermatology, skin cancer treatment, and hair restoration procedures. He has treated over 10,000 patients successfully.",
        education: [
            "MBBS - Maulana Azad Medical College, Delhi",
            "MD - Dermatology - AIIMS, Delhi",
            "Diploma in Dermatology & Venereology"
        ],
        certifications: [
            "Board Certified Dermatologist",
            "Fellowship in Cosmetic Dermatology",
            "Advanced Dermatosurgery Training"
        ],
        isAvailable: true
    },
    {
        id: "doc-003",
        name: "Dr. Priya Sharma",
        specialty: "Neurologist",
        qualifications: ["MBBS", "MD - Neurology", "DM - Neurology"],
        experience: "18+ years",
        hospital: "Max Super Speciality Hospital",
        location: "Bangalore, Karnataka",
        address: "Max Hospital, Bannerghatta Road, Bangalore - 560076",
        email: "dr.priya.sharma@maxhealthcare.com",
        phone: "+91-80-7122-2222",
        imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
        rating: 4.9,
        consultationFee: 3000,
        availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
        availableTime: "8:00 AM - 4:00 PM",
        languages: ["English", "Hindi", "Kannada"],
        about: "Dr. Priya Sharma is a senior neurologist with expertise in stroke management, epilepsy, and movement disorders. She has published over 50 research papers in international journals.",
        education: [
            "MBBS - Bangalore Medical College",
            "MD - Neurology - NIMHANS, Bangalore",
            "DM - Neurology - AIIMS, Delhi"
        ],
        certifications: [
            "Board Certified Neurologist",
            "Fellowship in Stroke Neurology",
            "Epilepsy Specialist Certification"
        ],
        isAvailable: true
    },
    {
        id: "doc-004",
        name: "Dr. Amit Patel",
        specialty: "Orthopedic Surgeon",
        qualifications: ["MBBS", "MS - Orthopedics", "Fellowship in Joint Replacement"],
        experience: "20+ years",
        hospital: "Kokilaben Dhirubhai Ambani Hospital",
        location: "Mumbai, Maharashtra",
        address: "Kokilaben Hospital, Andheri West, Mumbai - 400053",
        email: "dr.amit.patel@kokilabenhospital.com",
        phone: "+91-22-3096-6666",
        imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
        rating: 4.7,
        consultationFee: 2800,
        availableDays: ["Wednesday", "Friday", "Saturday"],
        availableTime: "9:00 AM - 7:00 PM",
        languages: ["English", "Hindi", "Gujarati"],
        about: "Dr. Amit Patel is a renowned orthopedic surgeon specializing in joint replacement surgeries, sports injuries, and spine surgery. He has performed over 3000 successful surgeries.",
        education: [
            "MBBS - Seth GS Medical College, Mumbai",
            "MS - Orthopedics - KEM Hospital, Mumbai",
            "Fellowship in Joint Replacement - UK"
        ],
        certifications: [
            "Board Certified Orthopedic Surgeon",
            "Fellowship in Joint Replacement",
            "Advanced Arthroscopy Training"
        ],
        isAvailable: true
    },
    {
        id: "doc-005",
        name: "Dr. Meera Reddy",
        specialty: "Pediatrician",
        qualifications: ["MBBS", "MD - Pediatrics", "Fellowship in Neonatology"],
        experience: "14+ years",
        hospital: "Rainbow Children's Hospital",
        location: "Hyderabad, Telangana",
        address: "Rainbow Hospital, Banjara Hills, Hyderabad - 500034",
        email: "dr.meera.reddy@rainbowhospitals.com",
        phone: "+91-40-4567-8900",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop&crop=face",
        rating: 4.8,
        consultationFee: 1500,
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        availableTime: "10:00 AM - 6:00 PM",
        languages: ["English", "Hindi", "Telugu"],
        about: "Dr. Meera Reddy is a compassionate pediatrician with expertise in newborn care, childhood vaccinations, and developmental disorders. She has treated over 15,000 children.",
        education: [
            "MBBS - Osmania Medical College, Hyderabad",
            "MD - Pediatrics - NIMS, Hyderabad",
            "Fellowship in Neonatology - AIIMS, Delhi"
        ],
        certifications: [
            "Board Certified Pediatrician",
            "Neonatal Resuscitation Program",
            "Pediatric Advanced Life Support"
        ],
        isAvailable: true
    },
    {
        id: "doc-006",
        name: "Dr. Sanjay Gupta",
        specialty: "Psychiatrist",
        qualifications: ["MBBS", "MD - Psychiatry", "Fellowship in Child Psychiatry"],
        experience: "16+ years",
        hospital: "NIMHANS",
        location: "Bangalore, Karnataka",
        address: "NIMHANS, Hosur Road, Bangalore - 560029",
        email: "dr.sanjay.gupta@nimhans.ac.in",
        phone: "+91-80-2699-5000",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
        rating: 4.5,
        consultationFee: 2000,
        availableDays: ["Monday", "Wednesday", "Friday"],
        availableTime: "11:00 AM - 5:00 PM",
        languages: ["English", "Hindi", "Kannada"],
        about: "Dr. Sanjay Gupta is a senior psychiatrist specializing in mood disorders, anxiety, and child psychiatry. He has helped thousands of patients overcome mental health challenges.",
        education: [
            "MBBS - Bangalore Medical College",
            "MD - Psychiatry - NIMHANS, Bangalore",
            "Fellowship in Child Psychiatry - NIMHANS"
        ],
        certifications: [
            "Board Certified Psychiatrist",
            "Child and Adolescent Psychiatry",
            "Cognitive Behavioral Therapy"
        ],
        isAvailable: true
    },
    {
        id: "doc-007",
        name: "Dr. Kavita Singh",
        specialty: "Gastroenterologist",
        qualifications: ["MBBS", "MD - Medicine", "DM - Gastroenterology"],
        experience: "13+ years",
        hospital: "Medanta - The Medicity",
        location: "Gurgaon, Haryana",
        address: "Medanta Hospital, Sector 38, Gurgaon - 122001",
        email: "dr.kavita.singh@medanta.org",
        phone: "+91-124-414-1414",
        imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
        rating: 4.7,
        consultationFee: 2200,
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        availableTime: "9:00 AM - 5:00 PM",
        languages: ["English", "Hindi", "Punjabi"],
        about: "Dr. Kavita Singh is a leading gastroenterologist specializing in liver diseases, inflammatory bowel disease, and advanced endoscopy procedures.",
        education: [
            "MBBS - Maulana Azad Medical College, Delhi",
            "MD - Medicine - AIIMS, Delhi",
            "DM - Gastroenterology - AIIMS, Delhi"
        ],
        certifications: [
            "Board Certified Gastroenterologist",
            "Advanced Endoscopy Training",
            "Liver Transplant Fellowship"
        ],
        isAvailable: true
    },
    {
        id: "doc-008",
        name: "Dr. Ramesh Iyer",
        specialty: "Endocrinologist",
        qualifications: ["MBBS", "MD - Medicine", "DM - Endocrinology"],
        experience: "17+ years",
        hospital: "Lilavati Hospital",
        location: "Mumbai, Maharashtra",
        address: "Lilavati Hospital, Bandra West, Mumbai - 400050",
        email: "dr.ramesh.iyer@lilavatihospital.com",
        phone: "+91-22-2675-1000",
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
        rating: 4.6,
        consultationFee: 2400,
        availableDays: ["Monday", "Wednesday", "Friday"],
        availableTime: "10:00 AM - 6:00 PM",
        languages: ["English", "Hindi", "Marathi"],
        about: "Dr. Ramesh Iyer is an expert endocrinologist specializing in diabetes management, thyroid disorders, and hormonal imbalances. He has treated over 20,000 patients.",
        education: [
            "MBBS - Grant Medical College, Mumbai",
            "MD - Medicine - KEM Hospital, Mumbai",
            "DM - Endocrinology - AIIMS, Delhi"
        ],
        certifications: [
            "Board Certified Endocrinologist",
            "Diabetes Management Specialist",
            "Thyroid Disorder Expert"
        ],
        isAvailable: true
    }
];

export const getDoctorsBySpecialty = (specialty: string): Doctor[] => {
    return doctors.filter(doctor => doctor.specialty === specialty);
};

export const getDoctorById = (id: string): Doctor | undefined => {
    return doctors.find(doctor => doctor.id === id);
};

export const getAllSpecialties = (): string[] => {
    return [...new Set(doctors.map(doctor => doctor.specialty))];
};

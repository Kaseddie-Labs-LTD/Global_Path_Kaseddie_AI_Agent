export const VERIFIER_SYSTEM_INSTRUCTION = `
You are a specialized Visa Document Verifier for GlobalPath Recruitment.
Your task is to analyze uploaded documents (Passport, GAMCA Medical, Police Clearance, or Selfies).

Rules for GCC:
- GAMCA Medical must be 'Fit' and within 6 months of issue.
- PCC (Police Clearance) must be within 3 months of issue.
- Passport must have at least 6 months validity.

Rules for EUROPE:
- PCC is mandatory for all professional roles.
- Insurance proofs may be required.

Output your response in valid JSON format only:
{
  "valid": boolean,
  "confidence": number (0-100),
  "issues": string[],
  "extractedData": {
    "name": string,
    "expiry": string,
    "documentType": string
  }
}
`;

export const PHOTO_ENHANCEMENT_INSTRUCTION = `
Analyze this selfie. Improve the clarity of features for biometric matching. 
Describe the image and suggest any lighting or posture adjustments for a professional visa application.
`;

export const MOCK_JOBS: any[] = [
  {
    id: '1',
    title: 'Warehouse Specialist',
    company: 'LogiLink GCC',
    location: 'Dubai, UAE',
    region: 'GCC',
    isVerified: true,
    description: 'Looking for physically fit warehouse assistants. Must handle inventory and packing.',
    fullDescription: 'We are seeking energetic individuals to join our logistics hub in Jebel Ali. Responsibilities include loading/unloading shipments, operating forklifts (training provided), maintaining stock records, and ensuring safety standards are met. We offer competitive housing allowances and transport.',
    salaryHint: '2500 - 3000 AED',
    postDate: '2 days ago',
    site: 'bayt',
    type: 'blue-collar',
    subCategory: 'Logistics',
    contactInfo: {
      recruiter: 'Ahmed Al-Maktoum',
      email: 'careers.ae@logilink.com',
      phone: '+971 4 000 0000'
    }
  },
  {
    id: '2',
    title: 'Senior Software Engineer',
    company: 'BerlinTech Systems',
    location: 'Berlin, Germany',
    region: 'EUROPE',
    isVerified: true,
    description: 'React/Node.js expert needed for fintech startup. Relocation assistance provided.',
    fullDescription: 'Join our core engineering team to build the future of cross-border payments. You will be responsible for architecting scalable microservices, mentoring junior devs, and implementing secure API layers. Requires 5+ years of JS experience and a degree in CS or equivalent.',
    salaryHint: '€70,000 - €90,000',
    postDate: '1 day ago',
    site: 'indeed',
    type: 'professional',
    subCategory: 'IT',
    contactInfo: {
      recruiter: 'Sarah Schmidt',
      email: 'hiring@berlintech.io',
      phone: '+49 30 1234567'
    }
  },
  {
    id: '3',
    title: 'Delivery Rider',
    company: 'QuickDispatch',
    location: 'Doha, Qatar',
    region: 'GCC',
    description: 'Valid motorcycle license required. Good knowledge of Doha routes.',
    fullDescription: 'Fast-paced role for experienced riders. Deliver packages across Doha with efficiency and safety. You will be provided with a company bike, uniform, and medical insurance. Flexible shifts available including nights and weekends.',
    salaryHint: '3000 QAR + Benefits',
    postDate: 'Just now',
    site: 'naukri',
    type: 'blue-collar',
    subCategory: 'Delivery',
    contactInfo: {
      recruiter: 'Rajesh Kumar',
      email: 'hr.qatar@quickdispatch.com',
      phone: '+974 4400 0000'
    }
  },
  {
    id: '4',
    title: 'Registered Nurse',
    company: 'CareFirst Hospital',
    location: 'London, UK',
    region: 'EUROPE',
    isVerified: true,
    description: 'Seeking qualified nurses for cardiac unit. Tier 2 visa sponsorship available.',
    fullDescription: 'Our Cardiac Care Unit is expanding. We need compassionate, registered nurses with specialized experience in heart health. You will manage patient care plans, coordinate with surgical teams, and provide support to families. Full NHS pension and career progression opportunities.',
    salaryHint: '£35,000 - £45,000',
    postDate: '3 days ago',
    site: 'google',
    type: 'professional',
    subCategory: 'Healthcare',
    contactInfo: {
      recruiter: 'Emily Thompson',
      email: 'recruitment@carefirst-trust.nhs.uk',
      phone: '+44 20 7946 0000'
    }
  },
  {
    id: '5',
    title: 'Project Manager (Construction)',
    company: 'Emirates Builders',
    location: 'Abu Dhabi, UAE',
    region: 'GCC',
    isVerified: true,
    description: 'Lead high-profile skyscraper projects in Abu Dhabi. PMP certification required.',
    fullDescription: 'Seeking a seasoned Project Manager with experience in high-rise construction. You will lead a multidisciplinary team, manage stakeholder expectations, and ensure projects are delivered on time and within budget. Experience in the Middle East is highly desirable.',
    salaryHint: '25,000 - 35,000 AED',
    postDate: '4 days ago',
    site: 'bayt',
    type: 'professional',
    subCategory: 'Engineering',
    contactInfo: {
      recruiter: 'Fatima Zayed',
      email: 'hr@emiratesbuilders.ae',
      phone: '+971 2 111 2222'
    }
  },
  {
    id: '6',
    title: 'Live-in Housemaid',
    company: 'Privat Residence',
    location: 'Kuwait City, Kuwait',
    region: 'GCC',
    description: 'Seeking reliable housemaid for family home. Accommodation and meals included.',
    fullDescription: 'Experienced housemaid needed for a small family. Duties include cleaning, laundry, and assisting with simple meal preparation. We provide a private room, medical insurance, and annual flight tickets.',
    salaryHint: '150 - 200 KWD',
    postDate: '6 days ago',
    site: 'bayt',
    type: 'blue-collar',
    subCategory: 'Domestic',
    contactInfo: {
      recruiter: 'Zainab Al-Sabah',
      email: 'zainab.hr@kuwaithomes.com',
      phone: '+965 2200 0000'
    }
  },
  {
    id: '7',
    title: 'Supermarket Cashier',
    company: 'HyperGlobal',
    location: 'Riyadh, Saudi Arabia',
    region: 'GCC',
    isVerified: true,
    description: 'Customer service role in high-traffic retail environment.',
    fullDescription: 'Join our Riyadh branch as a customer service assistant. You will handle transactions, manage stock displays, and assist customers with queries. Good communication skills in English are a plus.',
    salaryHint: '3000 - 4000 SAR',
    postDate: '1 day ago',
    site: 'naukri',
    type: 'blue-collar',
    subCategory: 'Retail',
    contactInfo: {
      recruiter: 'Hassan Al-Soud',
      email: 'jobs@hyperglobal.sa',
      phone: '+966 11 000 0000'
    }
  },
  {
    id: '8',
    title: 'Industrial Welder',
    company: 'SteelFoundry EU',
    location: 'Warsaw, Poland',
    region: 'EUROPE',
    description: 'Certified MIG/TIG welder for manufacturing plant.',
    fullDescription: 'Looking for skilled welders with international certifications. You will work on heavy machinery components. Visa sponsorship provided for qualified candidates from abroad.',
    salaryHint: '8,000 - 10,000 PLN',
    postDate: '4 days ago',
    site: 'indeed',
    type: 'blue-collar',
    subCategory: 'Trade',
    contactInfo: {
      recruiter: 'Marek Wisniewski',
      email: 'rekrutacja@steelfoundry.pl',
      phone: '+48 22 123 4567'
    }
  },
  {
    id: '9',
    title: 'Finance Manager',
    company: 'EuroBank Group',
    location: 'Paris, France',
    region: 'EUROPE',
    isVerified: true,
    description: 'Oversee regional financial operations for investment bank.',
    fullDescription: 'Senior level role managing a team of 10 analysts. Requires CPA/CFA and 10+ years experience in corporate finance. French language skills are an advantage but not mandatory.',
    salaryHint: '€85,000 - €110,000',
    postDate: '2 days ago',
    site: 'google',
    type: 'professional',
    subCategory: 'Finance',
    contactInfo: {
      recruiter: 'Jean Dupont',
      email: 'hiring@eurobank.fr',
      phone: '+33 1 45 67 89 00'
    }
  }
];

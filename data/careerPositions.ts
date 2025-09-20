export interface CareerPosition {
  id: string;
  title: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Volunteer';
  location: string;
  department: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isActive: boolean;
  applyLink: string;
  postedDate: string;
}

export const careerPositions: CareerPosition[] = [
  {
    id: 'campus-ambassador',
    title: 'Campus Ambassador',
    type: 'Volunteer',
    location: 'Bangladesh (Remote)',
    department: 'Marketing & Outreach',
    description: 'Join our Campus Ambassador Program and represent Insilicology at your university. Help us connect with students, promote our courses, and build a strong community of learners.',
    requirements: [
      'Currently enrolled in a university/college',
      'Strong communication and leadership skills',
      'Active on social media platforms',
      'Passionate about education and technology',
      'Must be male (as per current requirements)'
    ],
    benefits: [
      'Earn free access to all our courses',
      'Gain valuable marketing and networking experience',
      'Build your professional network',
      'Get certificates and recognition'
    ],
    isActive: true,
    applyLink: '/career/campus-ambassador',
    postedDate: '2025-06-25'
  }
  // Add more positions here as needed
  // Example:
  // {
  //   id: 'content-writer',
  //   title: 'Content Writer',
  //   type: 'Full-time',
  //   location: 'Bangladesh (Remote)',
  //   department: 'Content & Marketing',
  //   description: 'Create engaging educational content for our platform.',
  //   requirements: [
  //     'Excellent writing skills',
  //     'Experience in educational content',
  //     'Knowledge of technology topics'
  //   ],
  //   benefits: [
  //     'Competitive salary',
  //     'Remote work flexibility',
  //     'Professional development'
  //   ],
  //   isActive: true,
  //   applyLink: '/career/content-writer',
  //   postedDate: '2024-01-20'
  // }
];

export const getActivePositions = () => {
  return careerPositions.filter(position => position.isActive);
};

export const getPositionById = (id: string) => {
  return careerPositions.find(position => position.id === id);
}; 
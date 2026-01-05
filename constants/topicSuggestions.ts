export const topicSuggestions = [
  // General Skills & Development
  'Portfolio Review',
  'Project Consultation',
  'Creative Critique',
  'Concept Development',
  'Strategic Planning',
  'Problem Solving',
  'Critical Thinking',
  'Decision Making',
  'Time Management',
  'Goal Setting',
  'Leadership Development',
  'Team Building',
  'Communication Skills',
  'Public Speaking',
  'Presentation Skills',
  
  // Software & Technical
  'Python Programming',
  'Data Analysis',
  'Excel Training',
  'PowerPoint Skills',
  'Adobe Creative Suite',
  'Video Editing',
  'Web Development',
  'Mobile App Development',
  'Database Management',
  'Machine Learning',
  'Digital Marketing',
  'SEO & Analytics',
  'Social Media Management',
  'Content Creation',
  'Graphic Design',
  
  // Career & Academic
  'Career Advice',
  'Interview Preparation',
  'Resume Review',
  'Graduate School Guidance',
  'Scholarship Applications',
  'Internship Guidance',
  'Job Search Strategy',
  'Networking Tips',
  'Professional Development',
  'Licensing Exam Prep',
  'Continuing Education',
  'Research Methodology',
  'Thesis Guidance',
  'Academic Writing',
  'Literature Review',
  
  // Business & Entrepreneurship
  'Starting a Business',
  'Business Development',
  'Client Relations',
  'Project Management',
  'Contract Review',
  'Pricing Strategy',
  'Marketing Strategy',
  'Brand Development',
  'Sales Techniques',
  'Financial Planning',
  'Fundraising',
  'Grant Writing',
  'Proposal Writing',
  'Risk Management',
  'Legal Guidance',
  
  // Specialized Fields
  'Healthcare Industry',
  'Education Sector',
  'Technology Field',
  'Finance & Banking',
  'Marketing & Advertising',
  'Human Resources',
  'Supply Chain',
  'Operations Management',
  'Consulting',
  'Engineering',
  'Law & Legal',
  'Arts & Entertainment',
  'Hospitality',
  'Retail Management',
  'Non-Profit Sector',
  
  // Industry-Specific Skills
  'Quality Assurance',
  'Process Improvement',
  'Customer Service',
  'Negotiation Skills',
  'Conflict Resolution',
  'Change Management',
  'Innovation Strategy',
  'Product Development',
  'User Experience Design',
  'Market Research',
  'Competitive Analysis',
  'Performance Metrics',
  'Stakeholder Management',
  'Compliance & Regulations',
  'Sustainability Practices'
];

export const getFilteredSuggestions = (query: string): string[] => {
  if (!query.trim()) return topicSuggestions.slice(0, 10);
  
  const lowercaseQuery = query.toLowerCase();
  return topicSuggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(lowercaseQuery)
    )
    .slice(0, 10);
};
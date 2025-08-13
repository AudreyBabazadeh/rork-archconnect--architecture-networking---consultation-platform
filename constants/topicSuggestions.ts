export const topicSuggestions = [
  // Architecture & Design
  'Portfolio Review',
  'Project Consultation',
  'Design Critique',
  'Concept Development',
  'Technical Drawing Review',
  'Site Analysis',
  'Building Code Review',
  'Zoning Analysis',
  'Construction Documentation',
  'Material Selection',
  'Sustainable Design Consultation',
  'Accessibility Compliance Review',
  'Historic Preservation Guidance',
  'Renovation Planning',
  'Space Planning',
  'Interior Design Consultation',
  'Landscape Architecture',
  'Urban Planning',
  'Master Planning',
  'Feasibility Study',
  
  // Software & Technical
  'AutoCAD Training',
  'Revit Training',
  'SketchUp Training',
  'Rhino Training',
  'Grasshopper Training',
  'Lumion Training',
  'V-Ray Training',
  'Photoshop for Architecture',
  'InDesign for Portfolios',
  'BIM Coordination',
  '3D Modeling',
  'Rendering Techniques',
  'Parametric Design',
  'Digital Fabrication',
  'VR/AR in Architecture',
  
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
  'Presentation Skills',
  
  // Business & Practice
  'Starting an Architecture Firm',
  'Business Development',
  'Client Relations',
  'Project Management',
  'Contract Review',
  'Fee Structure Guidance',
  'Marketing for Architects',
  'Social Media Strategy',
  'Website Development',
  'Photography for Architecture',
  'Competition Strategy',
  'Grant Writing',
  'Proposal Writing',
  'Risk Management',
  'Insurance Guidance',
  
  // Specialized Areas
  'Healthcare Architecture',
  'Educational Architecture',
  'Residential Design',
  'Commercial Design',
  'Industrial Architecture',
  'Religious Architecture',
  'Cultural Architecture',
  'Sports Architecture',
  'Transportation Architecture',
  'Hospitality Design',
  'Retail Design',
  'Mixed-Use Development',
  'Affordable Housing',
  'Senior Living Design',
  'Childcare Facility Design',
  
  // Construction & Technical
  'Construction Administration',
  'Quality Control',
  'Site Supervision',
  'Cost Estimation',
  'Value Engineering',
  'Structural Coordination',
  'MEP Coordination',
  'Building Performance',
  'Energy Modeling',
  'LEED Certification',
  'Green Building Standards',
  'Building Commissioning',
  'Post-Occupancy Evaluation',
  'Facility Management',
  'Maintenance Planning'
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
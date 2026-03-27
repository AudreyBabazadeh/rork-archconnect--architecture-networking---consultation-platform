import { Post } from '@/types/user';

export const mockPosts: Post[] = [
  {
    id: '1',
    authorId: '1',
    authorName: 'Sarah Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Business Student at MIT',
    authorType: 'student',
    content: 'Just finished my first startup pitch competition! 🚀 Working on a sustainable business model has been incredibly challenging but rewarding. The integration of social impact with profitability really pushed my strategic thinking.',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=600&h=400&fit=crop'
    ],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 24,
    comments: 8,
    isLiked: false,
    tags: ['entrepreneurship', 'sustainability', 'student-work']
  },
  {
    id: '2',
    authorId: '2',
    authorName: 'Prof. Michael Rodriguez',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Professor of Psychology at Stanford',
    authorType: 'professor',
    content: 'Excited to share insights from our latest research on workplace well-being and productivity. The psychological benefits of flexible work arrangements and supportive environments are profound. Looking forward to discussing this at next week\'s symposium.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 67,
    comments: 15,
    isLiked: true,
    tags: ['psychology', 'research', 'workplace-wellbeing']
  },
  {
    id: '3',
    authorId: '3',
    authorName: 'Alex Thompson',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Senior Product Manager at Google',
    authorType: 'mentor',
    content: 'Mentoring tip: When presenting to stakeholders, always lead with the story behind your product. Product development isn\'t just about features—it\'s about solving real user problems. The technical details come second to the user impact.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: 89,
    comments: 22,
    isLiked: false,
    tags: ['mentoring', 'product-management', 'stakeholder-presentation']
  },
  {
    id: '4',
    authorId: '4',
    authorName: 'Emma Wilson',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'MBA Student at Harvard Business School',
    authorType: 'student',
    content: 'Struggling with my thesis on digital transformation in traditional industries. Any mentors here who have experience with change management? Would love to connect and learn from your expertise! 💼➡️📱',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    likes: 31,
    comments: 12,
    isLiked: true,
    tags: ['thesis', 'digital-transformation', 'change-management', 'help-needed']
  },
  {
    id: '5',
    authorId: '5',
    authorName: 'Dr. Priya Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Sustainability Consultant',
    authorType: 'mentor',
    content: 'Just wrapped up a fascinating project in Mumbai - helping a major corporation achieve carbon neutrality! The key was integrating renewable energy sources with operational efficiency. Innovation happens when sustainability meets business strategy.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop'
    ],
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    likes: 156,
    comments: 34,
    isLiked: false,
    tags: ['sustainability', 'innovation', 'mumbai', 'carbon-neutral']
  },
  {
    id: '6',
    authorId: '6',
    authorName: 'James Park',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Computer Science Student at UC Berkeley',
    authorType: 'student',
    content: 'First time using machine learning frameworks for my capstone project. The learning curve is steep but the possibilities are endless! Shoutout to all the mentors who\'ve been helping me navigate TensorFlow and PyTorch. 🤗',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
    likes: 43,
    comments: 16,
    isLiked: false,
    tags: ['machine-learning', 'tensorflow', 'pytorch', 'student-life']
  },
  {
    id: '7',
    authorId: '7',
    authorName: 'Prof. Lisa Anderson',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Professor of Social Innovation at Yale',
    authorType: 'professor',
    content: 'Reminder: Innovation is not just about new technologies. We\'re shaping communities, influencing behavior, and creating solutions for real problems. Every decision has social implications. Think beyond the product.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    likes: 201,
    comments: 45,
    isLiked: true,
    tags: ['social-innovation', 'community-impact', 'philosophy']
  },
  {
    id: '8',
    authorId: '8',
    authorName: 'Carlos Mendez',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Environmental Consultant & Mentor',
    authorType: 'mentor',
    content: 'Working on a city resilience project that integrates green infrastructure with community engagement. It\'s amazing how holistic approaches can solve multiple challenges simultaneously. Nature-based solutions are the future! 🌳💧',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop'
    ],
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
    likes: 78,
    comments: 19,
    isLiked: false,
    tags: ['environmental-consulting', 'urban-resilience', 'community-engagement', 'sustainability']
  }
];

export const getPostsByAuthorType = (type: 'student' | 'mentor' | 'professor') => {
  return mockPosts.filter(post => post.authorType === type);
};

export const getPostsByTag = (tag: string) => {
  return mockPosts.filter(post => post.tags?.includes(tag));
};

export const getRecentPosts = (hours: number = 24) => {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return mockPosts.filter(post => post.timestamp > cutoff);
};

export const getTrendingPosts = () => {
  return mockPosts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments)).slice(0, 5);
};

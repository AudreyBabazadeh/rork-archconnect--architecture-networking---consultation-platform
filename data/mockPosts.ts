import { Post } from '@/types/user';

export const mockPosts: Post[] = [
  {
    id: '1',
    authorId: 'user1',
    authorName: 'Sarah Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Architecture Student at MIT',
    authorType: 'student',
    content: 'Just finished my first sustainable design project! 🌱 Working on a net-zero energy residential complex has been incredibly challenging but rewarding. The integration of passive solar design with modern aesthetics really pushed my creative boundaries.',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=600&h=400&fit=crop'
    ],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 24,
    comments: 8,
    isLiked: false,
    tags: ['sustainable-design', 'residential', 'student-work']
  },
  {
    id: '2',
    authorId: 'user2',
    authorName: 'Prof. Michael Rodriguez',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Professor of Architecture at Stanford',
    authorType: 'professor',
    content: 'Excited to share insights from our latest research on biophilic design in urban environments. The psychological benefits of incorporating natural elements into architectural spaces are profound. Looking forward to discussing this at next week\'s symposium.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    likes: 67,
    comments: 15,
    isLiked: true,
    tags: ['biophilic-design', 'research', 'urban-planning']
  },
  {
    id: '3',
    authorId: 'user3',
    authorName: 'Alex Thompson',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Senior Architect at Foster + Partners',
    authorType: 'mentor',
    content: 'Mentoring tip: When presenting to clients, always lead with the story behind your design. Architecture isn\'t just about spaces—it\'s about the human experience within those spaces. The technical details come second to the emotional connection.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    likes: 89,
    comments: 22,
    isLiked: false,
    tags: ['mentoring', 'client-presentation', 'design-process']
  },
  {
    id: '4',
    authorId: 'user4',
    authorName: 'Emma Wilson',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Architecture Student at Harvard GSD',
    authorType: 'student',
    content: 'Struggling with my thesis on adaptive reuse of industrial buildings. Any mentors here who have experience with heritage preservation? Would love to connect and learn from your expertise! 🏭➡️🏢',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    likes: 31,
    comments: 12,
    isLiked: true,
    tags: ['thesis', 'adaptive-reuse', 'heritage-preservation', 'help-needed']
  },
  {
    id: '5',
    authorId: 'user5',
    authorName: 'Dr. Priya Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Sustainable Design Consultant',
    authorType: 'mentor',
    content: 'Just wrapped up a fascinating project in Mumbai - a 40-story residential tower that generates more energy than it consumes! The key was integrating wind turbines into the building\'s facade design. Innovation happens when sustainability meets creativity.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop'
    ],
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    likes: 156,
    comments: 34,
    isLiked: false,
    tags: ['sustainable-architecture', 'innovation', 'mumbai', 'energy-positive']
  },
  {
    id: '6',
    authorId: 'user6',
    authorName: 'James Park',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Architecture Student at UC Berkeley',
    authorType: 'student',
    content: 'First time using parametric design tools for my studio project. The learning curve is steep but the possibilities are endless! Shoutout to all the mentors who\'ve been helping me navigate Grasshopper and Rhino. 🤗',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    likes: 43,
    comments: 16,
    isLiked: false,
    tags: ['parametric-design', 'grasshopper', 'rhino', 'student-life']
  },
  {
    id: '7',
    authorId: 'user7',
    authorName: 'Prof. Lisa Anderson',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Professor of Urban Planning at Yale',
    authorType: 'professor',
    content: 'Reminder: Architecture is not just about beautiful buildings. We\'re shaping communities, influencing behavior, and creating the backdrop for human stories. Every design decision has social implications. Think beyond aesthetics.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    likes: 201,
    comments: 45,
    isLiked: true,
    tags: ['social-architecture', 'community-design', 'philosophy']
  },
  {
    id: '8',
    authorId: 'user8',
    authorName: 'Carlos Mendez',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    authorTitle: 'Landscape Architect & Mentor',
    authorType: 'mentor',
    content: 'Working on a public park design that integrates stormwater management with recreational spaces. It\'s amazing how landscape architecture can solve multiple urban challenges simultaneously. Nature-based solutions are the future! 🌳💧',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop'
    ],
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000), // 30 hours ago
    likes: 78,
    comments: 19,
    isLiked: false,
    tags: ['landscape-architecture', 'stormwater', 'public-space', 'sustainability']
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
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "content" | "sales" | "marketing" | "basic";
  avatar?: string;
}

export interface AIAssistant {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "content" | "social" | "market" | "student" | "press" | "general";
  features: string[];
}

export interface AISession {
  id: string;
  assistantId: string;
  userId: string;
  title: string;
  createdAt: Date;
  lastUpdatedAt: Date;
}

export interface AIContent {
  id: string;
  sessionId: string;
  content: string;
  type: "blog" | "social" | "email" | "press" | "report" | "other";
  platform?: "linkedin" | "facebook" | "instagram" | "tiktok" | null;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface LeadReport {
  id: string;
  prospectName: string;
  meetingDate: Date;
  advisorName: string;
  technicalAssessment: {
    currentSkills: Array<{ skill: string; level: string }>;
    knowledgeGaps: string[];
  };
  recommendedPathway: {
    primaryTrack: string;
    timeline: string;
    milestones: string[];
    secondaryOptions: string[];
  };
  valueProposition: {
    benefits: string[];
    currentSalaryRange: string;
    potentialSalaryRange: string;
    timelineToROI: string;
  };
  discussionPoints: {
    topics: string[];
    concerns: Array<{ concern: string; response: string }>;
  };
  successStories: string[];
  nextSteps: string[];
  resources: string[];
  createdAt: Date;
  lastUpdatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}
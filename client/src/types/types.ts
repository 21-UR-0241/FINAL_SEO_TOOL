export interface SEOIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  issue: string;
  location: string;
  description: string;
  howToFix: string;
  impact: string;
}

export interface SEOScore {
  overall: number;
  breakdown: {
    technical: number;
    content: number;
    metadata: number;
    performance: number;
    mobile: number;
    accessibility: number;
  };
}

export interface PageAnalysis {
  url: string;
  title: string;
  type: 'page' | 'post' | 'homepage';
  issues: SEOIssue[];
}

export interface SEOAnalysisResult {
  url: string;
  score: SEOScore;
  issues: SEOIssue[];
  pageAnalyses: PageAnalysis[];
  analyzedAt: Date;
  totalPages: number;
  recommendations: string[];
}
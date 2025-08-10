export interface ActionItem {
  id: string;
  description: string;
  assignee?: string;
  dueDate?: Date;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface AgendaItem {
  id: string;
  title: string;
  discussion: string;
  decision?: string;
  order: number;
}

export interface FormattedMinutes {
  htmlContent: string;
  summary: string;
  actionItems?: ActionItem[];
  decisions?: string[];
  nextMeeting?: string;
}
export type DashboardActivity = {
  id: string;
  name: string;
  createdAt: Date;
  totalSeconds: number;
  sessionCount: number;
};

export type DashboardData = {
  activities: DashboardActivity[];
  grandTotalSeconds: number;
  grandSessionCount: number;
};

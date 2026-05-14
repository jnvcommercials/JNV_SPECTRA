import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";

export interface DashboardStats {
  totalRevenue: {
    value: number;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  activeServices: {
    value: number;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  newOrders: {
    value: number;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  activeEvents: {
    value: number;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    service: string;
    date: string;
    status: "pending" | "completed" | "cancelled";
    total: number;
  }>;
}

export interface AnalyticsResponse {
  status: string;
  data: DashboardStats;
}

export interface DashboardStatsParams {
  timeFrame?: number;
  fromDate?: string;
  toDate?: string;
}

/**
 * Custom hook to fetch dashboard analytics
 * @param timeFrame Time frame in days for analytics data (7, 30, 90, 365)
 * @param refetchInterval Optional refetch interval in milliseconds
 */
export const useDashboardStats = (
  params: DashboardStatsParams = {},
  refetchInterval?: number,
) => {
  const { timeFrame = 30, fromDate, toDate } = params;

  return useQuery<AnalyticsResponse>({
    queryKey: ["dashboardStats", timeFrame, fromDate || null, toDate || null],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        timeFrame: String(timeFrame),
        _: String(Date.now()),
      });

      if (fromDate) {
        queryParams.append("fromDate", fromDate);
      }

      if (toDate) {
        queryParams.append("toDate", toDate);
      }

      const response = await fetchApi(`/api/v1/analytics/dashboard?${queryParams.toString()}`);
      return response as AnalyticsResponse;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: refetchInterval || false, // Allow auto-refetch if interval provided
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}; 

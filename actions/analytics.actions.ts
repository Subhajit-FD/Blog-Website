"use server";

import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Initialize the Google Analytics Data API client
// We use the JSON credentials string and Property ID.
const propertyId = process.env.GA_PROPERTY_ID;

// Fallback gracefully if the variables are not configured
const isConfigured =
  !!propertyId && !!process.env.GA_CLIENT_EMAIL && !!process.env.GA_PRIVATE_KEY;

let analyticsDataClient: BetaAnalyticsDataClient | null = null;

if (isConfigured) {
  try {
    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        // The private key must have literal newline characters
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      projectId:
        process.env.GA_CLIENT_EMAIL?.split("@")[1]?.split(".")[0] || "",
    });
  } catch (error) {
    console.error("Failed to initialize Google Analytics Data Client:", error);
  }
}

/**
 * Fetches total active users, grouped by date and broken down by device category (Desktop/Mobile)
 * @param timeRange e.g., '90daysAgo', '30daysAgo', '7daysAgo'
 */
export async function getAnalyticsData(
  timeRange: "30daysAgo" | "7daysAgo" | "90daysAgo" = "90daysAgo",
) {
  if (!analyticsDataClient || !propertyId) {
    return { error: "Google Analytics is not configured.", data: [] };
  }

  try {
    // We want the last X days, including today
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: timeRange,
          endDate: "today",
        },
      ],
      dimensions: [
        { name: "date" }, // Format: YYYYMMDD
        { name: "deviceCategory" }, // "Desktop", "Mobile", "Tablet", etc.
      ],
      metrics: [{ name: "activeUsers" }],
    });

    if (!response.rows) {
      return { success: true, data: [] };
    }

    // Process Google Analytics rows into a format charting libraries expect
    // We want an array of objects: { date: "YYYY-MM-DD", desktop: 100, mobile: 50, tablet: 10 }
    const formattedData: Record<
      string,
      {
        date: string;
        desktop: number;
        mobile: number;
        tablet: number;
        [key: string]: any;
      }
    > = {};

    response.rows.forEach((row) => {
      const gDate = row.dimensionValues?.[0]?.value || "";
      const deviceCategory = (
        row.dimensionValues?.[1]?.value || "Other"
      ).toLowerCase();
      const activeUsers = parseInt(row.metricValues?.[0]?.value || "0", 10);

      if (gDate.length === 8) {
        // Format YYYYMMDD to YYYY-MM-DD
        const formattedDateString = `${gDate.slice(0, 4)}-${gDate.slice(4, 6)}-${gDate.slice(6, 8)}`;

        if (!formattedData[formattedDateString]) {
          formattedData[formattedDateString] = {
            date: formattedDateString,
            desktop: 0,
            mobile: 0,
            tablet: 0,
          };
        }

        // Add to the specific device category, default to adding to mobile if unmapped
        if (deviceCategory === "desktop") {
          formattedData[formattedDateString].desktop += activeUsers;
        } else if (deviceCategory === "mobile" || deviceCategory === "tablet") {
          // Combine tablet and mobile for simplicity in the basic chart, or keep separate
          formattedData[formattedDateString][deviceCategory] += activeUsers;
        }
      }
    });

    // Convert the dictionary to a sorted array
    const sortedArray = Object.values(formattedData).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return { success: true, data: sortedArray };
  } catch (error: any) {
    console.error("Google Analytics Data API Error:", error);
    return { error: "Failed to fetch analytics data.", details: error.message };
  }
}

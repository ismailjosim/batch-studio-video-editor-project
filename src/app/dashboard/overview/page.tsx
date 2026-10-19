import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/overview/DashboardOverview";

export const metadata: Metadata = {
  title: "Studio Overview & Metrics — Dollar Doodles",
  description:
    "System-wide overview displaying total cloud projects, 2K video renders, AI images generated, and quick launcher tools.",
};

export default function OverviewPage() {
  return <DashboardOverview />;
}

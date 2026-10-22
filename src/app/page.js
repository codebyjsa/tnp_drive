import { getPlacementPosts } from "@/server/placement/placementService";
import DrivesClient from "@/components/DrivesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Placement Drives • T&P Cell GNDEC",
  description: "Official Campus Recruitment Drives & Placement Portal for Guru Nanak Dev Engineering College, Ludhiana.",
};

export default async function HomePage() {
  let initialDrives = [];
  try {
    initialDrives = await getPlacementPosts();
  } catch (error) {
    console.error("Failed to load placement drives on server:", error);
  }

  return <DrivesClient initialDrives={initialDrives} />;
}

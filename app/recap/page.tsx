import { redirect } from "next/navigation";
import { currentTz } from "@/lib/auth";
import { shiftMonth, todayIn } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function RecapIndex() {
  const tz = await currentTz();
  redirect(`/recap/${shiftMonth(todayIn(tz).slice(0, 7), -1)}`);
}

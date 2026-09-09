import { DashboardView } from "@/components/dashboard/dashboard-view"
import { getDashboardData } from "@/lib/actions/dashboard"

export default async function Page() {
  const data = await getDashboardData()
  return <DashboardView {...data} />
}

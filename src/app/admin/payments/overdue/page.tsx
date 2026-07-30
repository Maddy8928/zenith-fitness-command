import { redirect } from "next/navigation";

export default function AdminOverduePaymentsPage() {
    redirect("/admin/payments?tab=overdue");
}

import { redirect } from "next/navigation";

export default function AdminPendingPaymentsPage() {
    redirect("/admin/payments?tab=pending");
}

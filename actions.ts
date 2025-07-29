// app/employee/leave-request-v2/actions.ts
"use server"

export async function createLeaveRequest(formData: FormData) {
  const employee_id = formData.get("employee_id") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const leave_type = formData.get("leave_type") as string;
  const reason = formData.get("reason") as string;

  // Exemple de logique : requête à une API ou à ta DB
  console.log("Creating leave request for:", employee_id);

  // Ex : await db.createLeaveRequest(...)
}

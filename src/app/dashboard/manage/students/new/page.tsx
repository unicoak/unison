import Link from "next/link";
import { requireStaff } from "@/lib/guards";
import { NewStudentForm } from "./NewStudentForm";

export default async function NewStudentPage() {
  await requireStaff();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/manage/students" className="text-sm font-semibold text-violet hover:underline">
          ← Все ученики
        </Link>
        <h1 className="mt-1 font-display text-3xl font-extrabold">Новый ученик</h1>
      </div>
      <NewStudentForm />
    </div>
  );
}

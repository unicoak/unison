import { requireSession } from "@/lib/guards";
import { NewTopicForm } from "./NewTopicForm";

export default async function NewTopicPage() {
  await requireSession();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-extrabold">Новая тема</h1>
      <NewTopicForm />
    </div>
  );
}

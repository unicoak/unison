"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { forumTopicSchema, forumPostSchema } from "@/lib/validation";

export type ActionState = { error?: string } | undefined;

export async function createTopicAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();

  const parsed = forumTopicSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };

  const { title, body } = parsed.data;
  const topic = await prisma.forumTopic.create({
    data: { title, authorId: session.user.id, posts: { create: { body, authorId: session.user.id } } },
  });

  revalidatePath("/dashboard/forum");
  redirect(`/dashboard/forum/${topic.id}`);
}

export async function createPostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();

  const parsed = forumPostSchema.safeParse({
    topicId: formData.get("topicId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };

  const { topicId, body } = parsed.data;
  const topic = await prisma.forumTopic.findUnique({ where: { id: topicId }, select: { id: true } });
  if (!topic) return { error: "Тема не найдена" };

  await prisma.forumPost.create({ data: { topicId, body, authorId: session.user.id } });

  revalidatePath(`/dashboard/forum/${topicId}`);
  revalidatePath("/dashboard/forum");
  return {};
}

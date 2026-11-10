import { db } from "@/lib/db";

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  return db.notification.create({ data: { userId, type, title, message, link } });
}

export async function broadcastNotification({
  type,
  title,
  message,
  link,
}: {
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  const users = await db.user.findMany({ where: { isActive: true }, select: { id: true } });
  await db.notification.createMany({
    data: users.map((u) => ({ userId: u.id, type, title, message, link })),
  });
}

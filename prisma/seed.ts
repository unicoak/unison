import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const LEVELS = [
  { level: 1, requiredXp: 0, title: "Новичок" },
  { level: 2, requiredXp: 100, title: "Искатель" },
  { level: 3, requiredXp: 250, title: "Практик" },
  { level: 4, requiredXp: 450, title: "Следопыт" },
  { level: 5, requiredXp: 700, title: "Знаток" },
  { level: 6, requiredXp: 1000, title: "Мастер" },
  { level: 7, requiredXp: 1400, title: "Эксперт" },
  { level: 8, requiredXp: 1900, title: "Виртуоз" },
  { level: 9, requiredXp: 2500, title: "Чемпион" },
  { level: 10, requiredXp: 3200, title: "Гуру" },
  { level: 11, requiredXp: 4000, title: "Мудрец" },
  { level: 12, requiredXp: 5000, title: "Легенда" },
];

const ACHIEVEMENTS = [
  { code: "first-quest", name: "Первый шаг", icon: "🥇", description: "Сдал первый квест и получил зачёт" },
  { code: "five-quests", name: "Пять по пять", icon: "🔥", description: "Успешно сдал 5 квестов" },
  { code: "level-5", name: "Разогнался", icon: "🚀", description: "Достиг 5 уровня" },
  { code: "star-student", name: "Звезда класса", icon: "🌟", description: "За выдающиеся старания (вручается учителем)" },
  { code: "helper", name: "Помощник", icon: "🤝", description: "Помогает другим ученикам" },
  { code: "creative", name: "Творческий подход", icon: "🎨", description: "За нестандартное решение задачи" },
];

async function main() {
  for (const level of LEVELS) {
    await prisma.levelDefinition.upsert({
      where: { level: level.level },
      update: { requiredXp: level.requiredXp, title: level.title },
      create: level,
    });
  }
  console.log(`✔ Лестница уровней: ${LEVELS.length} ступеней`);

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
  }
  console.log(`✔ Ачивки: ${ACHIEVEMENTS.length} шт.`);

  const godEmail = process.env.GOD_EMAIL;
  const godPassword = process.env.GOD_PASSWORD;
  const godName = process.env.GOD_NAME || "Админ";

  if (!godEmail || !godPassword) {
    console.warn("⚠ GOD_EMAIL / GOD_PASSWORD не заданы в .env — аккаунт бога не создан");
  } else {
    const passwordHash = await bcrypt.hash(godPassword, 10);
    await prisma.user.upsert({
      where: { email: godEmail },
      update: { passwordHash, role: "GOD", displayName: godName },
      create: { email: godEmail, passwordHash, role: "GOD", displayName: godName },
    });
    console.log(`✔ Аккаунт бога готов: ${godEmail}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

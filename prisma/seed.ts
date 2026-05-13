import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { productToDbInput, products } from "../lib/data";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash("admin123", 10);
  const sellerPassword = await hash("seller123", 10);
  const buyerPassword = await hash("buyer123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@candlex.id" },
    update: {},
    create: {
      name: "CandleX Admin",
      email: "admin@candlex.id",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@candlex.id" },
    update: {},
    create: {
      name: "Mitra Jelantah Kemang",
      email: "seller@candlex.id",
      password: sellerPassword,
      role: "SELLER",
    },
  });

  await prisma.user.upsert({
    where: { email: "buyer@candlex.id" },
    update: {},
    create: {
      name: "CandleX Buyer",
      email: "buyer@candlex.id",
      password: buyerPassword,
      role: "BUYER",
      cart: { create: {} },
    },
  });

  for (const product of products) {
    const data = productToDbInput(product);

    await prisma.product.upsert({
      where: { id: product.id },
      update: data,
      create: data,
    });
  }

  await prisma.oilSubmission.createMany({
    data: [
      {
        userId: seller.id,
        quantity: 18,
        location: "Kemang, Jakarta Selatan",
        pickupMethod: "PICKUP",
        schedule: new Date("2026-05-08T09:00:00.000Z"),
        status: "PAID",
        priceEstimate: 101088,
      },
      {
        userId: seller.id,
        quantity: 7,
        location: "Cihampelas, Bandung",
        pickupMethod: "DROPOFF",
        schedule: new Date("2026-05-10T13:00:00.000Z"),
        status: "PENDING",
        priceEstimate: 36400,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`Seeded CandleX demo users, products, and oil submissions. Admin: ${admin.email}`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

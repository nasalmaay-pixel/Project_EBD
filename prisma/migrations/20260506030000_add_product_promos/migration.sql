-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "promoLabel" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "promoDiscount" INTEGER NOT NULL DEFAULT 0;

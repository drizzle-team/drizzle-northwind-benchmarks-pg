import { run, bench } from "mitata";
import * as Prisma from "@prisma/client";

import {
  customerIds,
  employeeIds,
  orderIds,
  productIds,
  productSearches,
  customerSearches,
  supplierIds,
} from "../common/meta";
import { products } from "../drizzle/schema";

const prisma = new Prisma.PrismaClient();

bench("Prisma ORM Customers: getAll", async () => {
  await prisma.customer.findMany();
});

bench("Prisma ORM Customers: getInfo", async () => {
  for (const id of customerIds) {
    await prisma.customer.findUnique({
      where: {
        id,
      },
    });
  }
});

bench("Prisma ORM Customers: search", async () => {
  for (const it of customerSearches) {
    await prisma.customer.findMany({
      where: {
        companyName: {
          contains: it,
          mode: "insensitive",
        },
      },
    });
  }
});

bench("Prisma ORM Employees: getAll", async () => {
  await prisma.employee.findMany();
});

bench("Prisma ORM Employees: getInfo", async () => {
  for (const id of employeeIds) {
    await prisma.employee.findUnique({
      where: {
        id,
      },
      include: {
        recipient: true,
      },
    });
  }
});
bench("Prisma ORM Suppliers: getAll", async () => {
  await prisma.supplier.findMany();
});

bench("Prisma ORM Suppliers: getInfo", async () => {
  for (const id of supplierIds) {
    await prisma.supplier.findUnique({
      where: {
        id,
      },
    });
  }
});

bench("Prisma ORM Products: getAll", async () => {
  await prisma.product.findMany();
});

bench("Prisma ORM Products: getInfo", async () => {
  for (const id of productIds) {
    await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        supplier: true,
      },
    });
  }
});

bench("Prisma ORM Products: search", async () => {
  for (const it of productSearches) {
    await prisma.product.findMany({
      where: {
        name: {
          contains: it,
          mode: "insensitive",
        },
      },
    });
  }
});

bench("Prisma ORM Orders: getAll", async () => {
  const result = await prisma.order.findMany({
    include: {
      details: true,
    },
  });
  const orders = result.map((item) => {
    return {
      id: item.id,
      shippedDate: item.shippedDate,
      shipName: item.shipName,
      shipCity: item.shipCity,
      shipCountry: item.shipCountry,
      productsCount: item.details.length,
      quantitySum: item.details.reduce(
        (sum, deteil) => (sum += +deteil.quantity),
        0
      ),
      totalPrice: item.details.reduce(
        (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
        0
      ),
    };
  });
});

bench("Prisma ORM Orders: getById", async () => {
  for (const id of orderIds) {
    const result = await prisma.order.findFirst({
      include: {
        details: true,
      },
      where: {
        id,
      },
    });
    const order = {
        id: result!.id,
        shippedDate: result!.shippedDate,
        shipName: result!.shipName,
        shipCity: result!.shipCity,
        shipCountry: result!.shipCountry,
        productsCount: result!.details.length,
        quantitySum: result!.details.reduce(
          (sum, deteil) => (sum += +deteil.quantity),
          0
        ),
        totalPrice: result!.details.reduce(
          (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
          0
        ),
      };
  }
});

bench("Prisma ORM Orders: getInfo", async () => {
  for (const id of orderIds) {
    await prisma.order.findMany({
      where: {
        id,
      },
      include: {
        details: {
          include: {
            product: true,
          },
        },
      },
    });
  }
});

const main = async () => {
  await run();
};

main();

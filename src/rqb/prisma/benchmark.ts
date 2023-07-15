import * as Prisma from "@prisma/client";
import { bench, run } from "mitata";

import { employeeIds, orderIds, productIds } from "../../common/meta";

const prisma = new Prisma.PrismaClient();

bench("Prisma ORM Employees: getInfo", async () => {
  for (const id of employeeIds) {
    await prisma.employee.findFirst({
      where: {
        id,
      },
      include: {
        recipient: true,
      },
    });
  }
});

bench("Prisma ORM Products: getInfo", async () => {
  for (const id of productIds) {
    await prisma.product.findFirst({
      where: {
        id,
      },
      include: {
        supplier: true,
      },
    });
  }
});

bench("Prisma ORM Orders: 1 relation", async () => {
  await prisma.order.findMany({
    include: {
      details: true,
    },
  });
});

bench("Prisma ORM Orders: 2 relations", async () => {
  await prisma.order.findMany({
    include: {
      details: {
        include: {
          product: true,
          order: true,
        },
      },
    },
  });
});

bench("Prisma ORM Orders: 3 relataions", async () => {
  await prisma.order.findMany({
    include: {
      details: {
        include: {
          product: {
            include: {
              details: true,
            },
          },
          order: {
            include: {
              details: true,
            },
          },
        },
      },
    },
  });
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
  // const sql_script = fs.readFileSync(path.resolve("data/init-db.sql"), "utf-8");

  // await prisma.$queryRawUnsafe(sql_script);

  await run();

  // const g1 = await prisma.employee.findFirst({
  //   where: {
  //     id: employeeIds[0],
  //   },
  //   include: {
  //     recipient: true,
  //   },
  // });

  // console.log(util.inspect(g1, {depth: null, colors: true}))
};

void main();

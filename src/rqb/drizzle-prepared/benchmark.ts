import { run, bench } from "mitata";
import path from "node:path";
import fs from "fs";
import { employeeIds, orderIds, productIds } from "../../common/meta";

import { drizzle as drizzleDb } from "drizzle-orm/node-postgres";

import pkg from "pg";
import { eq, placeholder, sql } from "drizzle-orm";

import * as schema from "./schema";

const { Pool } = pkg;

// drizzle connect
const drizzlePool = new Pool({
  connectionString: `postgres://postgres:postgres@localhost:5432/drizzle-bench`,
});
const drizzle = drizzleDb(drizzlePool, { schema });

const p1 = drizzle.query.employees
  .findFirst({
    where: eq(schema.employees.id, placeholder("id")),
    include: {
      recipient: true,
    },
  })
  .prepare("get-info-employees");

bench("Drizzle ORM Employees: getInfo", async () => {
  for (const id of employeeIds) {
    await p1.execute({ id });
  }
});

const p2 = drizzle.query.products
  .findFirst({
    where: eq(schema.products.id, placeholder("id")),
    include: {
      supplier: true,
    },
  })
  .prepare("products-get-info");

bench("Drizzle ORM Products: getInfo", async () => {
  for (const id of productIds) {
    await p2.execute({ id });
  }
});

const p3 = drizzle.query.orders
  .findMany({
    include: {
      details: true,
    },
  })
  .prepare("p3");

bench("Drizzle ORM Orders: 1 relation", async () => {
  await p3.execute();
});

const p4 = drizzle.query.orders
  .findMany({
    include: {
      details: {
        include: {
          product: true,
          order: true,
        },
      },
    },
  })
  .prepare("p4");

bench("Drizzle ORM Orders: 2 relations", async () => {
  await p4.execute();
});

const p5 = drizzle.query.orders
  .findMany({
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
  })
  .prepare("p5");

bench("Drizzle ORM Orders: 3 relataions", async () => {
  await p5.execute();
});

const p6 = drizzle.query.orders
  .findMany({
    where: eq(schema.orders.id, placeholder("id")),
    include: {
      details: {
        include: {
          product: true,
        },
      },
    },
  })
  .prepare("p6");

bench("Drizzle ORM Orders: getInfo", async () => {
  for (const id of orderIds) {
    await p6.execute({ id });
  }
});

const main = async () => {
  // const sql_script = fs.readFileSync(path.resolve("data/init-db.sql"), "utf-8");

  // await drizzle.execute(sql.raw(sql_script));

  await run();
};

main();

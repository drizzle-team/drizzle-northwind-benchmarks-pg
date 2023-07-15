import { bench, run } from "mitata";
import { employeeIds, orderIds, productIds } from "../../common/meta";

import { drizzle as drizzleDb } from "drizzle-orm/node-postgres";

import { eq, placeholder } from "drizzle-orm";
import pkg from "pg";

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
    with: {
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
    with: {
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
    with: {
      details: true,
    },
  })
  .prepare("p3");

bench("Drizzle ORM Orders: 1 relation", async () => {
  await p3.execute();
});

const p4 = drizzle.query.orders
  .findMany({
    with: {
      details: {
        with: {
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
    with: {
      details: {
        with: {
          product: {
            with: {
              details: true,
            },
          },
          order: {
            with: {
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
    with: {
      details: {
        with: {
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

void main();

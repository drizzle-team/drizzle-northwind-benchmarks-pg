import { bench, run } from "mitata";
import { employeeIds, orderIds, productIds } from "../../common/meta";

import { drizzle as drizzleDb } from "drizzle-orm/node-postgres";

import { eq } from "drizzle-orm";
import pkg from "pg";

import * as schema from "./schema";

const { Pool } = pkg;

// drizzle connect
const drizzlePool = new Pool({
  connectionString: `postgres://postgres:postgres@localhost:5432/drizzle-bench`,
});
const drizzle = drizzleDb(drizzlePool, { schema });

bench("Drizzle ORM Employees: getInfo", async () => {
  for (const id of employeeIds) {
    await drizzle.query.employees.findFirst({
      where: eq(schema.employees.id, id),
      with: {
        recipient: true,
      },
    });
  }
});

bench("Drizzle ORM Products: getInfo", async () => {
  for (const id of productIds) {
    await drizzle.query.products.findFirst({
      where: eq(schema.products.id, id),
      with: {
        supplier: true,
      },
    });
  }
});

bench("Drizzle ORM Orders: 1 relation", async () => {
  await drizzle.query.orders.findMany({
    with: {
      details: true,
    },
  });
});

bench("Drizzle ORM Orders: 2 relations", async () => {
  await drizzle.query.orders.findMany({
    with: {
      details: {
        with: {
          product: true,
          order: true,
        },
      },
    },
  });
});

bench("Drizzle ORM Orders: 3 relataions", async () => {
  await drizzle.query.orders.findMany({
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
  });
});

bench("Drizzle ORM Orders: getInfo", async () => {
  for (const id of orderIds) {
    await drizzle.query.orders.findMany({
      where: eq(schema.orders.id, id),
      with: {
        details: {
          with: {
            product: true,
          },
        },
      },
    });
  }
});

const main = async () => {
  // const sql_script = fs.readFileSync(path.resolve("data/init-db.sql"), "utf-8");

  // await drizzle.execute(sql.raw(sql_script));

  await run();

  // const g = await drizzle.query.employees.findFirst({
  //   where: eq(schema.employees.id, employeeIds[0]),
  //   with: {
  //     recipient: true
  //   }
  // })

  // console.log(util.inspect(g, {depth: null, colors: true}))
};

void main();

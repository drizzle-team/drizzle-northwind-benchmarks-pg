import { run, bench } from "mitata";
import path from "node:path";
import util from 'node:util';
import fs from "fs";
import {
  employeeIds,
  orderIds,
  productIds,
} from "../../common/meta";

import { drizzle as drizzleDb } from "drizzle-orm/node-postgres";

import pkg from "pg";
import { eq, sql } from "drizzle-orm";

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
      include: {
        recipient: true
      }
    })
  }
});

bench("Drizzle ORM Products: getInfo", async () => {
  for (const id of productIds) {
    await drizzle.query.products.findFirst({
      where: eq(schema.products.id, id),
      include: {
        supplier: true
      }
    })
  }
});

bench("Drizzle ORM Orders: 1 relation", async () => {
  await drizzle.query.orders.findMany({
    include: {
      details: true,
    }
  })
});

bench("Drizzle ORM Orders: 2 relations", async () => {
  await drizzle.query.orders.findMany({
    include: {
      details: {
        include: {
          product: true,
          order: true,
        },
      },
    }
  })
});

bench("Drizzle ORM Orders: 3 relataions", async () => {
  await drizzle.query.orders.findMany({
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
    }
  })
});

bench("Drizzle ORM Orders: getInfo", async () => {
  for (const id of orderIds) {
    await drizzle.query.orders.findMany({
      where: eq(schema.orders.id, id),
      include: {
        details: {
          include: {
            product: true
          },
        },
      }
    })
  }
});

const main = async () => {
  // const sql_script = fs.readFileSync(path.resolve("data/init-db.sql"), "utf-8");

  // await drizzle.execute(sql.raw(sql_script));

  await run();

  // const g = await drizzle.query.employees.findFirst({
  //   where: eq(schema.employees.id, employeeIds[0]),
  //   include: {
  //     recipient: true
  //   }
  // })

  // console.log(util.inspect(g, {depth: null, colors: true}))
};

main();

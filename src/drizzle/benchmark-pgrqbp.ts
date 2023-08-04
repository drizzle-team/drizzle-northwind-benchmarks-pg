import { run, bench } from "mitata";
import Docker from "dockerode";
import { v4 as uuid } from "uuid";
import getPort from "get-port";
import { asc, eq, ilike, placeholder } from "drizzle-orm";
import dotenv from "dotenv";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import {
  employees,
  customers,
  suppliers,
  products,
  orders,
  details,
} from "./schema";
import * as schema from "./schema";
import {
  customerIds,
  employeeIds,
  orderIds,
  productIds,
  customerSearches,
  productSearches,
  supplierIds,
} from "../common/meta";
import { alias } from "drizzle-orm/pg-core";
import { NodePgDatabase, drizzle as drzl } from "drizzle-orm/node-postgres";
import * as pg from "pg";
const { Pool } = pg.default;

dotenv.config();
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// const connector = new PgConnector(pool);

const port = 54321;
const dburl = `postgres://postgres:postgres@localhost:${port}/postgres`;
const pool = new Pool({ connectionString: dburl });
const drizzle = drzl(pool, { schema });

async function createDockerDB(desiredPort: number) {
  const docker = new Docker();
  const port = await getPort({ port: desiredPort });
  if (desiredPort !== port) {
    throw new Error(`${desiredPort} port is taken`);
  }
  const image = "postgres";

  await docker.pull(image);

  const pgContainer = await docker.createContainer({
    Image: image,
    Env: [
      "POSTGRES_PASSWORD=postgres",
      "POSTGRES_USER=postgres",
      "POSTGRES_DB=postgres",
    ],
    name: `benchmarks-tests-${uuid()}`,
    HostConfig: {
      AutoRemove: true,
      PortBindings: {
        "5432/tcp": [{ HostPort: `${port}` }],
      },
    },
  });

  await pgContainer.start();
}

const p1 = drizzle.query.customers.findMany().prepare("p1");
bench("Customers: getAll", async () => {
  await p1.execute();
});

const p2 = drizzle.query.customers
  .findFirst({
    where: eq(customers.id, placeholder("id")),
  })
  .prepare("p2");
bench("Customers: get by id", async () => {
  for (const id of customerIds) {
    await p2.execute({ id: id });
  }
});

const p3 = drizzle.query.customers
  .findMany({
    where: ilike(customers.companyName, placeholder("term")),
  })
  .prepare("p3");
bench("Customers: search", async () => {
  for (const it of customerSearches) {
    await p3.execute({ term: `%${it}%` });
  }
});

const p4 = drizzle.query.employees.findMany().prepare("p4");
bench("Employees: getAll", async () => {
  await p4.execute();
});

const e2 = alias(employees, "recipient");
const p5 = drizzle.query.employees
  .findMany({
    with: {
      recipient: true,
    },
    where: eq(employees.id, placeholder("id")),
  })
  .prepare("p5");

bench("Employees: get by id", async () => {
  for (const id of employeeIds) {
    await p5.execute({
      id,
    });
  }
});

const p6 = drizzle.query.suppliers.findMany().prepare("p6");
bench("Suppliers: getAll", async () => {
  await p6.execute();
});

const p7 = drizzle.query.suppliers
  .findFirst({
    where: eq(suppliers.id, placeholder("id")),
  })
  .prepare("p7");
bench("Suppliers: get by id", async () => {
  for (const id of supplierIds) {
    await p6.execute({ id });
  }
});

const p8 = drizzle.query.products.findMany().prepare("p8");
bench("Products: getAll", async () => {
  await p8.execute();
});

const p9 = drizzle.query.products
  .findMany({
    where: eq(products.id, placeholder("id")),
    with: {
      supplier: true,
    },
  })
  .prepare("p9");
bench("Products: get by id", async () => {
  for (const id of productIds) {
    await p9.execute({ id });
  }
});

const p10 = drizzle.query.products
  .findMany({
    where: ilike(products.name, placeholder("term")),
  })
  .prepare("p10");
bench("Products: search", async () => {
  for (const it of productSearches) {
    await p10.execute({ term: `%${it}%` });
  }
});

const p11 = drizzle
  .select({
    id: orders.id,
    shippedDate: orders.shippedDate,
    shipName: orders.shipName,
    shipCity: orders.shipCity,
    shipCountry: orders.shipCountry,
    productsCount: sql`count(${details.productId})`.as<number>(),
    quantitySum: sql`sum(${details.quantity})`.as<number>(),
    totalPrice:
      sql`sum(${details.quantity} * ${details.unitPrice})`.as<number>(),
  })
  .from(orders)
  .leftJoin(details, eq(orders.id, details.orderId))
  .groupBy(orders.id)
  .orderBy(asc(orders.id))
  .prepare("p11");

bench("Orders: get all with details", async () => {
  await p11.execute({});
});

const p12 = drizzle
  .select({
    id: orders.id,
    shippedDate: orders.shippedDate,
    shipName: orders.shipName,
    shipCity: orders.shipCity,
    shipCountry: orders.shipCountry,
    productsCount: sql`count(${details.productId})`.as<number>(),
    quantitySum: sql`sum(${details.quantity})`.as<number>(),
    totalPrice:
      sql`sum(${details.quantity} * ${details.unitPrice})`.as<number>(),
  })
  .from(orders)
  .leftJoin(details, eq(orders.id, details.orderId))
  .where(eq(orders.id, placeholder("id")))
  .groupBy(orders.id)
  .orderBy(asc(orders.id))
  .prepare("p12");

bench("Orders: get by id with details", async () => {
  for (const id of orderIds) {
    await p12.execute({ id });
  }
});

const p13 = drizzle.query.orders
  .findMany({
    with: {
      details: {
        with: {
          product: true,
        },
      },
    },
    where: eq(orders.id, placeholder("id")),
  })
  .prepare("p13");

bench("Orders: get by id", async () => {
  for (const id of orderIds) {
    await p13.execute({ id });
  }
});

const main = async () => {
  await createDockerDB(port);

  let sleep = 250;
  let timeLeft = 5000;
  let connected = false;
  let lastError: unknown | undefined;
  do {
    try {
      await pool.connect();
      connected = true;
      break;
    } catch (e) {
      lastError = e;
      await new Promise((resolve) => setTimeout(resolve, sleep));
      timeLeft -= sleep;
    }
  } while (timeLeft > 0);
  if (!connected) {
    console.error("Cannot connect to Postgres");
    throw lastError;
  }
  const sql_script = fs.readFileSync(path.resolve("data/init-db.sql"), "utf-8");
  await pool.query(sql_script);

  await run();
  process.exit(0);
};

main();

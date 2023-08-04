import { run, bench } from "mitata";
import Docker from "dockerode";
import { v4 as uuid } from "uuid";
import getPort from "get-port";
import { asc, eq, ilike } from "drizzle-orm";
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
import postgres from "postgres";
import { PostgresJsDatabase, drizzle as drzl } from "drizzle-orm/postgres-js";

dotenv.config();
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// const connector = new PgConnector(pool);

let drizzle: PostgresJsDatabase;

async function createDockerDB(): Promise<string> {
  const docker = new Docker();
  const port = await getPort({ port: 5432 });
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

  return `postgres://postgres:postgres@localhost:${port}/postgres`;
}

bench("Customers: getAll", async () => {
  await drizzle.select().from(customers);
});

bench("Customers: getInfo", async () => {
  for (const id of customerIds) {
    await drizzle.select().from(customers).where(eq(customers.id, id));
  }
});

bench("Customers: search", async () => {
  for (const it of customerSearches) {
    await drizzle
      .select()
      .from(customers)
      .where(ilike(customers.companyName, `%${it}%`));
  }
});

bench("Employees: getAll", async () => {
  await drizzle.select().from(employees);
});

bench("Employees: getInfo", async () => {
  const e2 = alias(employees, "recipient");

  for (const id of employeeIds) {
    await drizzle
      .select()
      .from(employees)
      .leftJoin(e2, eq(e2.id, employees.recipientId))
      .where(eq(employees.id, id));
  }
});

bench("Suppliers: getAll", async () => {
  await drizzle.select().from(suppliers);
});

bench("Suppliers: getInfo", async () => {
  for (const id of supplierIds) {
    await drizzle.select().from(suppliers).where(eq(suppliers.id, id));
  }
});

bench("Products: getAll", async () => {
  await drizzle.select().from(products);
});

bench("Products: getInfo", async () => {
  for (const id of productIds) {
    await drizzle
      .select()
      .from(products)
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .where(eq(products.id, id));
  }
});

bench("Products: search", async () => {
  for (const it of productSearches) {
    await drizzle
      .select()
      .from(products)
      .where(ilike(products.name, `%${it}%`));
  }
});

bench("Orders: getAll", async () => {
  await drizzle
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
    .orderBy(asc(orders.id));
});

bench("Orders: getById", async () => {
  for (const id of orderIds) {
    await drizzle
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
      .where(eq(orders.id, id))
      .groupBy(orders.id)
      .orderBy(asc(orders.id));
  }
});

bench("Orders: getInfo", async () => {
  for (const id of orderIds) {
    await drizzle
      .select()
      .from(orders)
      .leftJoin(details, eq(orders.id, details.orderId))
      .leftJoin(products, eq(details.productId, products.id))
      .where(eq(orders.id, id));
  }
});

const main = async () => {
  const connectionString =
    process.env["PG_CONNECTION_STRING"] ?? (await createDockerDB());

  let sleep = 250;
  let timeLeft = 5000;
  let connected = false;
  let lastError: unknown | undefined;
  const pgjs = postgres(connectionString);
  const sql_script = fs.readFileSync(path.resolve("data/init-db.sql"), "utf-8");
  drizzle = drzl(pgjs);
  do {
    try {
      await drizzle.execute(sql.raw(sql_script));
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

  // drizzle connect

  await run();
  process.exit(0);
};

main();

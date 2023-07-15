import Docker from "dockerode";
import dotenv from "dotenv";
import getPort from "get-port";
import { bench, run } from "mitata";
import pkg from "pg";
import { v4 as uuid } from "uuid";

import fs from "fs";
import path from "node:path";

import {
  customerIds,
  customerSearches,
  employeeIds,
  orderIds,
  productIds,
  productSearches,
  supplierIds,
} from "../common/meta";

const { Pool } = pkg;
dotenv.config();

// const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

// const pg = new Pool({
//   host: DB_HOST,
//   port: +DB_PORT!,
//   user: DB_USER,
//   password: DB_PASSWORD,
//   database: DB_NAME,
// });

let pg: pkg.Pool;
let pgContainer: Docker.Container;

async function createDockerDB(): Promise<string> {
  const docker = new Docker();
  const port = await getPort({ port: 5432 });
  console.log(port);
  const image = "postgres";

  await docker.pull(image);

  pgContainer = await docker.createContainer({
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

const getConection = async () => {
  const connectionString =
    process.env.PG_CONNECTION_STRING ?? (await createDockerDB());

  const sleep = 250;
  let timeLeft = 5000;
  let connected = false;
  let lastError: unknown | undefined;
  const pool = new Pool({ connectionString });
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
  pg = pool;
};

bench("Pg Driver Customers: getAll", async () => {
  await pg.query('select * from "customers"');
});
bench("Pg Driver Customers: getInfo", async () => {
  for await (const id of customerIds) {
    await pg.query('select * from "customers" where "customers"."id" = $1', [
      id,
    ]);
  }
});
bench("Pg Driver Customers: search", async () => {
  for await (const it of customerSearches) {
    await pg.query(
      'select * from "customers" where "customers"."company_name" ilike $1',
      [`%${it}%`],
    );
  }
});

bench("Pg Driver Employees: getAll", async () => {
  await pg.query('select * from "employees"');
});

bench("Pg Driver Employees: getInfo", async () => {
  for await (const id of employeeIds) {
    await pg.query(
      `select "e1".*, "e2"."last_name" as "reports_lname", "e2"."first_name" as "reports_fname"
          from "employees" as "e1" left join "employees" as "e2" on "e2"."id" = "e1"."recipient_id" where "e1"."id" = $1`,
      [id],
    );
  }
});

bench("Pg Driver Suppliers: getAll", async () => {
  await pg.query('select * from "suppliers"');
});

bench("Pg Driver Suppliers: getInfo", async () => {
  for await (const id of supplierIds) {
    await pg.query('select * from "suppliers" where "suppliers"."id" = $1', [
      id,
    ]);
  }
});

bench("Pg Driver Products: getAll", async () => {
  await pg.query('select * from "products"');
});

bench("Pg Driver Products: getInfo", async () => {
  for await (const id of productIds) {
    await pg.query(
      `select "products".*, "suppliers".*
          from "products" left join "suppliers" on "products"."supplier_id" = "suppliers"."id" where "products"."id" = $1`,
      [id],
    );
  }
});
bench("Pg Driver Products: search", async () => {
  for await (const it of productSearches) {
    await pg.query(
      'select * from "products" where "products"."name" ilike $1',
      [`%${it}%`],
    );
  }
});

bench("Pg Driver Orders: getAll", async () => {
  await pg.query(`select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
        sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
        from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" group by "o"."id" order by "o"."id" asc`);
});

bench("Pg Driver Orders: getById", async () => {
  for (const id of orderIds) {
    await pg.query(
      `select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
      sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
      from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" where "o"."id" = $1 group by "o"."id" order by "o"."id" asc`,
      [id],
    );
  }
});

bench("Pg Driver Orders: getInfo", async () => {
  for await (const id of orderIds) {
    await pg.query(
      `SELECT * FROM "orders" AS o
        LEFT JOIN "order_details" AS od ON o.id = od.order_id
        LEFT JOIN "products" AS p ON od.product_id = p.id
        WHERE o.id = $1`,
      [id],
    );
  }
});

const main = async () => {
  await getConection();
  const sqlScript = fs.readFileSync(path.resolve("data/init-db.sql"), "utf-8");
  await pg.query(sqlScript);
  await run();
  await pgContainer.stop().catch(console.error);
  process.exit(1);
};

void main();

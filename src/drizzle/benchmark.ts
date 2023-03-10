import { run, bench } from "mitata";
import Docker from 'dockerode';
import { v4 as uuid } from 'uuid';
import getPort from 'get-port';
import { asc, eq, ilike } from "drizzle-orm/expressions";
import dotenv from "dotenv";
import { sql } from "drizzle-orm";
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
import { PgConnector, PgDatabase, alias } from "drizzle-orm-pg";
import { Pool } from "pg";

dotenv.config();
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// const connector = new PgConnector(pool);
let drizzle: PgDatabase;

async function createDockerDB(): Promise<string> {
	const docker = new Docker()
	const port = await getPort({ port: 5432 });
	const image = 'postgres:14';

	await docker.pull(image);

	const pgContainer = await docker.createContainer({
		Image: image,
		Env: ['POSTGRES_PASSWORD=postgres', 'POSTGRES_USER=postgres', 'POSTGRES_DB=postgres'],
		name: `benchmarks-tests-${uuid()}`,
		HostConfig: {
			AutoRemove: true,
			PortBindings: {
				'5432/tcp': [{ HostPort: `${port}` }],
			},
		},
	})

	await pgContainer.start();

	return `postgres://postgres:postgres@localhost:${port}/postgres`;
}

const getConection = async () => {
	const connectionString = process.env['PG_CONNECTION_STRING'] ?? await createDockerDB();

	let sleep = 250;
	let timeLeft = 5000;
	let connected = false;
	let lastError: unknown | undefined;
  const pool = new Pool({connectionString});
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
		console.error('Cannot connect to Postgres');
		throw lastError;
	}
  drizzle = await new PgConnector(pool).connect();
}

bench("Drizzle-ORM Customers: getAll", async () => {
  await drizzle.select(customers);
});

bench("Drizzle-ORM Customers: getInfo", async () => {
  for (const id of customerIds) {
    await drizzle.select(customers).where(eq(customers.id, id));
  }
});

bench("Drizzle-ORM Customers: search", async () => {
  for (const it of customerSearches) {
    await drizzle
      .select(customers)
      .where(ilike(customers.companyName, `%${it}%`));
  }
});

bench("Drizzle-ORM Employees: getAll", async () => {
  await drizzle.select(employees);
});

bench("Drizzle-ORM Employees: getInfo", async () => {
  const e2 = alias(employees, "recipient");

  for (const id of employeeIds) {
    await drizzle
      .select(employees)
      .leftJoin(e2, eq(e2.id, employees.recipientId))
      .where(eq(employees.id, id));
  }
});

bench("Drizzle-ORM Suppliers: getAll", async () => {
  await drizzle.select(suppliers);
});

bench("Drizzle-ORM Suppliers: getInfo", async () => {
  for (const id of supplierIds) {
    await drizzle.select(suppliers).where(eq(suppliers.id, id));
  }
});

bench("Drizzle-ORM Products: getAll", async () => {
  await drizzle.select(products);
});

bench("Drizzle-ORM Products: getInfo", async () => {
  for (const id of productIds) {
    await drizzle
      .select(products)
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .where(eq(products.id, id));
  }
});

bench("Drizzle-ORM Products: search", async () => {
  for (const it of productSearches) {
    await drizzle.select(products).where(ilike(products.name, `%${it}%`));
  }
});

bench("Drizzle-ORM Orders: getAll", async () => {
  await drizzle
    .select(orders)
    .fields({
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
    .leftJoin(details, eq(orders.id, details.orderId))
    .groupBy(orders.id)
    .orderBy(asc(orders.id));
});

bench("Drizzle-ORM Orders: getById", async () => {
  for (const id of orderIds) {
    await drizzle
      .select(orders)
      .fields({
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
      .leftJoin(details, eq(orders.id, details.orderId))
      .where(eq(orders.id, id))
      .groupBy(orders.id)
      .orderBy(asc(orders.id));
  }
});

bench("Drizzle-ORM Orders: getInfo", async () => {
  for (const id of orderIds) {
    drizzle
      .select(orders)
      .leftJoin(details, eq(orders.id, details.orderId))
      .leftJoin(products, eq(details.productId, products.id))
      .where(eq(orders.id, id));
  }
});

const main = async () => {
  await getConection();
  await run();
};

main();

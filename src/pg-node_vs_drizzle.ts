import { run, bench, group } from "mitata";
import { asc, eq, ilike } from "drizzle-orm/expressions";

dotenv.config();
import dotenv from "dotenv";
import { sql } from "drizzle-orm";
import {
  employees,
  customers,
  suppliers,
  products,
  orders,
  details,
} from "../src/drizzle/schema";
import {
  customerIds,
  employeeIds,
  orderIds,
  productIds,
  customerSearches,
  productSearches,
  supplierIds,
} from "../src/common/meta";
import { PgConnector, PgDatabase, alias } from "drizzle-orm-pg";
import { Pool } from "pg";

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const connector = new PgConnector(pool);
let drizzle: PgDatabase;

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const db = new Pool({
  host: DB_HOST,
  port: +DB_PORT!,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

group({ name: "Drizzle", summary: false }, () => {
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

  // bench("Drizzle-ORM Orders: getAll", async () => {
  //   await drizzle.select(orders)
  //     .fields({
  //       id: orders.id,
  //       shippedDate: orders.shippedDate,
  //       shipName: orders.shipName,
  //       shipCity: orders.shipCity,
  //       shipCountry: orders.shipCountry,
  //       productsCount: sql`count(${details.productId})`.as<number>(),
  //       quantitySum: sql`sum(${details.quantity})`.as<number>(),
  //       totalPrice: sql`sum(${details.quantity} * ${details.unitPrice})`.as<number>(),
  //     })
  //     .leftJoin(details, eq(orders.id, details.orderId))
  //     .groupBy(orders.id)
  //     .orderBy(asc(orders.id))
  // });

  bench("Drizzle-ORM Orders: getInfo", async () => {
    for (const id of orderIds) {
      await drizzle
        .select(orders)
        .leftJoin(details, eq(orders.id, details.orderId))
        .leftJoin(products, eq(details.productId, products.id))
        .where(eq(orders.id, id));
    }
  });
});

group({ name: "Pg Driver Prepared", summary: false }, () => {
  const query = {
    name: "Customers-getAll",
    text: 'select * from "customers"',
  };
  bench("Pg Driver Customers: getAll", async () => {
    await db.query(query);
  });

  const query2 = {
    name: "Customers-getInfo",
    text: 'select * from "customers" where "customers"."id" = $1',
  };
  bench("Pg Driver Customers: getInfo", async () => {
    for await (const id of customerIds) {
      await db.query(query2, [id]);
    }
  });

  const query3 = {
    name: "Customers-search",
    text: 'select * from "customers" where "customers"."company_name" ilike $1',
  };
  bench("Pg Driver Customers: search", async () => {
    for await (const it of customerSearches) {
      await db.query(query3, [`%${it}%`]);
    }
  });

  const query4 = {
    name: "Employees-getAll",
    text: 'select * from "employees"',
  };
  bench("Pg Driver Employees: getAll", async () => {
    await db.query(query4);
  });

  const query5 = {
    name: "Employees-getInfo",
    text: `select "e1".*, "e2"."last_name" as "reports_lname", "e2"."first_name" as "reports_fname"
    from "employees" as "e1" left join "employees" as "e2" on "e2"."id" = "e1"."recipient_id" where "e1"."id" = $1`,
  };
  bench("Pg Driver Employees: getInfo", async () => {
    for await (const id of employeeIds) {
      await db.query(query5, [id]);
    }
  });

  const query6 = {
    name: "Suppliers-getAll",
    text: 'select * from "suppliers"',
  };

  bench("Pg Driver Suppliers: getAll", async () => {
    await db.query(query6);
  });

  const query7 = {
    name: "Suppliers-getInfo",
    text: 'select * from "suppliers" where "suppliers"."id" = $1',
  };

  bench("Pg Driver Suppliers: getInfo", async () => {
    for await (const id of supplierIds) {
      await db.query(query7, [id]);
    }
  });

  const query8 = {
    name: "Products-getAll",
    text: 'select * from "products"',
  };

  bench("Pg Driver Products: getAll", async () => {
    await db.query(query8);
  });

  const query9 = {
    name: "Products-getInfo",
    text: `select "products".*, "suppliers".*
    from "products" left join "suppliers" on "products"."supplier_id" = "suppliers"."id" where "products"."id" = $1`,
  };

  bench("Pg Driver Products: getInfo", async () => {
    for await (const id of productIds) {
      await db.query(query9, [id]);
    }
  });

  const query10 = {
    name: "Products-search",
    text: 'select * from "products" where "products"."name" ilike $1',
  };

  bench("Pg Driver Products: search", async () => {
    for await (const it of productSearches) {
      await db.query(query10, [`%${it}%`]);
    }
  });

  const query11 = {
    name: "Orders-getAll",
    text: `select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
    sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
    from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" group by "o"."id" order by "o"."id" asc`,
  };

  bench("Pg Driver Orders: getAll", async () => {
    await db.query(query11);
  });

  const query12 = {
    name: "Orders-getInfo",
    text: `SELECT * FROM "orders" AS o
    LEFT JOIN "order_details" AS od ON o.id = od.order_id
    LEFT JOIN "products" AS p ON od.product_id = p.id
    WHERE o.id = $1`,
  };

  bench("Pg Driver Orders: getInfo", async () => {
    for await (const id of orderIds) {
      await db.query(query12, [id]);
    }
  });
});

group({ name: "Pg Driver", summary: false }, () => {
  bench("Pg Driver Customers: getAll", async () => {
    await db.query('select * from "customers"');
  });
  bench("Pg Driver Customers: getInfo", async () => {
    for await (const id of customerIds) {
      await db.query('select * from "customers" where "customers"."id" = $1', [
        id,
      ]);
    }
  });
  bench("Pg Driver Customers: search", async () => {
    for await (const it of customerSearches) {
      await db.query(
        'select * from "customers" where "customers"."company_name" ilike $1',
        [`%${it}%`]
      );
    }
  });

  bench("Pg Driver Employees: getAll", async () => {
    await db.query('select * from "employees"');
  });

  bench("Pg Driver Employees: getInfo", async () => {
    for await (const id of employeeIds) {
      await db.query(
        `select "e1".*, "e2"."last_name" as "reports_lname", "e2"."first_name" as "reports_fname"
                from "employees" as "e1" left join "employees" as "e2" on "e2"."id" = "e1"."recipient_id" where "e1"."id" = $1`,
        [id]
      );
    }
  });

  bench("Pg Driver Suppliers: getAll", async () => {
    await db.query('select * from "suppliers"');
  });

  bench("Pg Driver Suppliers: getInfo", async () => {
    for await (const id of supplierIds) {
      await db.query('select * from "suppliers" where "suppliers"."id" = $1', [
        id,
      ]);
    }
  });

  bench("Pg Driver Products: getAll", async () => {
    await db.query('select * from "products"');
  });

  bench("Pg Driver Products: getInfo", async () => {
    for await (const id of productIds) {
      await db.query(
        `select "products".*, "suppliers".*
                from "products" left join "suppliers" on "products"."supplier_id" = "suppliers"."id" where "products"."id" = $1`,
        [id]
      );
    }
  });
  bench("Pg Driver Products: search", async () => {
    for await (const it of productSearches) {
      await db.query(
        'select * from "products" where "products"."name" ilike $1',
        [`%${it}%`]
      );
    }
  });

  bench("Pg Driver Orders: getAll", async () => {
    await db.query(`select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
            sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
            from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" group by "o"."id" order by "o"."id" asc`);
  });

  bench("Pg Driver Orders: getInfo", async () => {
    for await (const id of orderIds) {
      await db.query(
        `SELECT * FROM "orders" AS o
              LEFT JOIN "order_details" AS od ON o.id = od.order_id
              LEFT JOIN "products" AS p ON od.product_id = p.id
              WHERE o.id = $1`,
        [id]
      );
    }
  });
});

const main = async () => {
  drizzle = await connector.connect();
  await run();

  // console.log( await drizzle.select(orders)
  //     .fields({
  //       id: orders.id,
  //       shippedDate: orders.shippedDate,
  //       shipName: orders.shipName,
  //       shipCity: orders.shipCity,
  //       shipCountry: orders.shipCountry,
  //       productsCount: sql`count(${details.productId})`.as<number>(),
  //       quantitySum: sql`sum(${details.quantity})`.as<number>(),
  //       totalPrice: sql`sum(${details.quantity} * ${details.unitPrice})`.as<number>(),
  //     })
  //     .leftJoin(details, eq(orders.id, details.orderId))
  //     .groupBy(orders.id)
  //     .orderBy(asc(orders.id)));

  // const query = drizzle
  //   .select(orders)
  //   .fields({
  //     id: orders.id,
  //     shippedDate: orders.shippedDate,
  //     shipName: orders.shipName,
  //     shipCity: orders.shipCity,
  //     shipCountry: orders.shipCountry,
  //     productsCount: sql`count(${details.productId})`.as<number>(),
  //     quantitySum: sql`sum(${details.quantity})`.as<number>(),
  //     totalPrice:
  //       sql`sum(${details.quantity} * ${details.unitPrice})`.as<number>(),
  //   })
  //   .leftJoin(details, eq(orders.id, details.orderId))
  //   .groupBy(orders.id)
  //   .orderBy(asc(orders.id));

  // console.log(drizzle.buildQuery(query));
  // // drizzle.buildQuery(query)
};

main();

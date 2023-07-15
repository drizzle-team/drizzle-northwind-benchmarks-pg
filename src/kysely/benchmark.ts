import { Kysely, PostgresDialect, sql } from "kysely";
import { bench, run } from "mitata";
import {
  customerIds,
  customerSearches,
  employeeIds,
  orderIds,
  productIds,
  productSearches,
  supplierIds,
} from "../common/meta";
import { type Database } from "./db";

import { ports } from "@/utils";
import dotenv from "dotenv";
import pkg from "pg";

const { Pool } = pkg;
dotenv.config();

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: DB_HOST,
      port: +(DB_PORT ?? ports.kysely),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    }),
  }),
});

bench("Kysely ORM Customers: getAll", async () => {
  await db.selectFrom("customers").selectAll().execute();
});
bench("Kysely ORM Customers: getInfo", async () => {
  for (const id of customerIds) {
    await db
      .selectFrom("customers")
      .selectAll()
      .where("customers.id", "=", id)
      .execute();
  }
});
bench("Kysely ORM Customers: search", async () => {
  for (const it of customerSearches) {
    await db
      .selectFrom("customers")
      .selectAll()
      .where(sql`lower(company_name)`, "like", `%${it}%`)
      .execute();
  }
});

bench("Kysely ORM Employees: getAll", async () => {
  await db.selectFrom("employees").selectAll().execute();
});
bench("Kysely ORM Employees: getInfo", async () => {
  for (const id of employeeIds) {
    await db
      .selectFrom("employees as e1")
      .selectAll()
      .where("e1.id", "=", id)
      .leftJoin(
        db
          .selectFrom("employees as e2")
          .select([
            "id as e2_id",
            "last_name as e2_last_name",
            "first_name as e2_first_name",
            "title as e2_title",
            "title_of_courtesy as e2_title_of_courtesy",
            "birth_date as e2_birth_date",
            "hire_date as e2_hire_date",
            "address as e2_address",
            "city as e2_city",
            "postal_code as e2_postal_code",
            "country as e2_country",
            "home_phone as e2_home_phone",
            "extension as e2_extension",
            "notes as e2_notes",
            "recipient_id as e2_recipient_id",
          ])
          .as("e2"),
        "e2.e2_id",
        "e1.recipient_id",
      )
      .execute();
  }
});

bench("Kysely ORM Suppliers: getAll", async () => {
  await db.selectFrom("suppliers").selectAll().execute();
});
bench("Kysely ORM Suppliers: getInfo", async () => {
  for (const id of supplierIds) {
    await db
      .selectFrom("suppliers")
      .selectAll()
      .where("suppliers.id", "=", id)
      .execute();
  }
});

bench("Kysely ORM Products: getAll", async () => {
  await db.selectFrom("products").selectAll().execute();
});
bench("Kysely ORM Products: getInfo", async () => {
  for (const id of productIds) {
    await db
      .selectFrom("products")
      .selectAll()
      .where("products.id", "=", id)
      .leftJoin(
        db
          .selectFrom("suppliers")
          .select([
            "id as s_id",
            "company_name",
            "contact_name",
            "contact_title",
            "address",
            "city",
            "region",
            "postal_code",
            "country",
            "phone",
          ])
          .as("s1"),
        "s1.s_id",
        "products.supplier_id",
      )
      .execute();
  }
});
bench("Kysely ORM Products: search", async () => {
  for (const it of productSearches) {
    await db
      .selectFrom("products")
      .selectAll()
      .where(sql`lower(name)`, "like", `%${it}%`)
      .execute();
  }
});

bench("Kysely ORM Orders: getAll", async () => {
  await db
    .selectFrom("orders")
    .select([
      "orders.id",
      "orders.shipped_date",
      "orders.ship_name",
      "orders.ship_city",
      "orders.ship_country",
      db.fn.count("product_id").as("products_count"),
      db.fn.sum("quantity").as("quantity_sum"),
      sql`SUM(quantity * unit_price)`.as("total_price"),
    ])
    .leftJoin("order_details", "order_details.order_id", "orders.id")
    .groupBy("orders.id")
    .orderBy("orders.id", "asc")
    .execute();
});

bench("Kysely ORM Orders: getById", async () => {
  for (const id of orderIds) {
    await db
      .selectFrom("orders")
      .select([
        "orders.id",
        "orders.shipped_date",
        "orders.ship_name",
        "orders.ship_city",
        "orders.ship_country",
        db.fn.count("product_id").as("products_count"),
        db.fn.sum("quantity").as("quantity_sum"),
        sql`SUM(quantity * unit_price)`.as("total_price"),
      ])
      .where("orders.id", "=", id)
      .leftJoin("order_details", "order_details.order_id", "orders.id")
      .groupBy("orders.id")
      .orderBy("orders.id", "asc")
      .execute();
  }
});

bench("Kysely ORM Orders: getInfo", async () => {
  for (const id of orderIds) {
    await db
      .selectFrom("orders")
      .selectAll()
      .where("id", "=", id)
      .leftJoin(
        db
          .selectFrom("order_details")
          .select([
            "discount",
            "order_id",
            "product_id",
            "unit_price",
            "quantity",
          ])
          .as("od"),
        "od.order_id",
        "orders.id",
      )
      .leftJoin(
        db
          .selectFrom("products")
          .select([
            "products.id as p_id",
            "name",
            "qt_per_unit",
            "products.unit_price as p_unit_price",
            "units_in_stock",
            "units_on_order",
            "reorder_level",
            "discontinued",
            "supplier_id",
          ])
          .as("p"),
        "p.p_id",
        "od.product_id",
      )
      .execute();
  }
});

const main = async () => {
  await run();
};
void main();

import knex from "knex";
import { bench, run } from "mitata";
import {
  customerIds,
  employeeIds,
  orderIds,
  productIds,
  productSearches,
  customerSearches,
  supplierIds,
} from "../common/meta";
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
const db = knex({
  client: "pg",
  connection: {
    host: DB_HOST,
    port: +DB_PORT!,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
  useNullAsDefault: true,
});

bench("Knex ORM customer: getAll", async () => {
  await db("customers");
});
bench("Knex ORM customer: getInfo", async () => {
  for (const id of customerIds) {
    await db("customers").where({ id });
  }
});
bench("Knex ORM customer: search", async () => {
  for (const it of customerSearches) {
    await db("customers").whereILike("company_name", `%${it}%`);
  }
});

bench("Knex ORM Employees: getAll", async () => {
  await db("employees");
});
bench("Knex ORM Employees: getInfo", async () => {
  for (const id of employeeIds) {
    await db("employees as e1")
      .select([
        "e1.*",
        "e2.id as e2_id",
        "e2.last_name as e2_last_name",
        "e2.first_name as e2_first_name",
        "e2.title as e2_title",
        "e2.title_of_courtesy as e2_title_of_courtesy",
        "e2.birth_date as e2_birth_date",
        "e2.hire_date as e2_hire_date",
        "e2.address as e2_address",
        "e2.city as e2_city",
        "e2.postal_code as e2_postal_code",
        "e2.country as e2_country",
        "e2.home_phone as e2_home_phone",
        "e2.extension as e2_extension",
        "e2.notes as e2_notes",
        "e2.recipient_id as e2_recipient_id",
      ])
      .where("e1.id", "=", id)
      .leftJoin("employees as e2", "e1.recipient_id", "e2.id");
  }
});

bench("Knex ORM Suppliers: getAll", async () => {
  await db("suppliers");
});
bench("Knex ORM Suppliers: getInfo", async () => {
  for (const id of supplierIds) {
    await db("suppliers").where({ id }).first();
  }
});

bench("Knex ORM Products: getAll", async () => {
  await db("products");
});

bench("Knex ORM Products: getInfo", async () => {
  for (const id of productIds) {
    await db("products")
      .select([
        "products.*",
        "suppliers.id as s_id",
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
      .where("products.id", "=", id)
      .leftJoin("suppliers", "suppliers.id", "products.supplier_id");
  }
});

bench("Knex ORM Products: search", async () => {
  for (const it of productSearches) {
    await db("products").whereILike("name", `%${it}%`);
  }
});

bench("Knex ORM Orders: getAll", async () => {
  await db("orders")
    .select([
      "orders.id",
      "orders.shipped_date",
      "orders.ship_name",
      "orders.ship_city",
      "orders.ship_country",
    ])
    .leftJoin("order_details", "order_details.order_id", "orders.id")
    .count("product_id as products_count")
    .sum("quantity as quantity_sum")
    .sum({ total_price: db.raw("?? * ??", ["quantity", "unit_price"]) })
    .groupBy("orders.id")
    .orderBy("orders.id", "asc");
});

bench("Knex ORM Orders: getById", async () => {
  for (const id of orderIds) {
    await db("orders")
      .select([
        "orders.id",
        "orders.shipped_date",
        "orders.ship_name",
        "orders.ship_city",
        "orders.ship_country",
      ])
      .where("orders.id", "=", id)
      .leftJoin("order_details", "order_details.order_id", "orders.id")
      .count("product_id as products_count")
      .sum("quantity as quantity_sum")
      .sum({ total_price: db.raw("?? * ??", ["quantity", "unit_price"]) })
      .groupBy("orders.id")
      .orderBy("orders.id", "asc");
  }
});

bench("Knex ORM Orders: getInfo", async () => {
  for (const id of orderIds) {
    await db("orders")
      .select([
        "order_details.*",
        "orders.id as o_id",
        "order_date",
        "required_date",
        "shipped_date",
        "ship_via",
        "freight",
        "ship_name",
        "ship_city",
        "ship_region",
        "ship_postal_code",
        "ship_country",
        "customer_id",
        "employee_id",
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
      .where("orders.id", "=", id)
      .leftJoin("order_details", "order_details.order_id", "orders.id")
      .leftJoin("products", "products.id", "order_details.product_id");
  }
});

const main = async () => {
  await run();
};
main();

import { run, bench, group } from "mitata";
import { eq, ilike, placeholder } from "drizzle-orm";
import { sql } from "drizzle-orm";
// import { drizzle as drzl } from "drizzle-orm/node-postgres";
import { drizzle as drzl } from "drizzle-orm/postgres-js";
import { alias } from "drizzle-orm/pg-core";
import pkg from "pg";
import postgres from 'postgres'
import knex from "knex";
import dotenv from "dotenv";
import { Kysely, sql as k_sql, PostgresDialect } from "kysely";
import { DataSource, ILike } from "typeorm";
import { MikroORM } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import * as Prisma from "@prisma/client";

import { Database } from "@/kysely/db";
import { Customer } from "@/typeorm/entities/customers";
import { Employee } from "@/typeorm/entities/employees";
import { Supplier } from "@/typeorm/entities/suppliers";
import { Order } from "@/typeorm/entities/orders";
import { Product } from "@/typeorm/entities/products";
import { Detail } from "@/typeorm/entities/details";
import {
  employees,
  customers,
  suppliers,
  products,
  orders,
  details,
} from "@/drizzle/schema";
import { Customer as m_Customer } from "@/mikro/entities/customers";
import { Detail as m_Detail } from "@/mikro/entities/details";
import { Employee as m_Employee } from "@/mikro/entities/employees";
import { Order as m_Order } from "@/mikro/entities/orders";
import { Product as m_Product } from "@/mikro/entities/products";
import { Supplier as m_Supplier } from "@/mikro/entities/suppliers";
import {
  customerIds,
  employeeIds,
  orderIds,
  productIds,
  customerSearches,
  productSearches,
  supplierIds,
} from "./meta";
import { createDockerDBs, ports, deleteDockerDBs, DockerDBs } from "@/utils";

dotenv.config();

const DB_HOST = process.env.DB_HOST ?? "localhost";
const DB_NAME = process.env.DB_NAME ?? "postgres";
const DB_USER = process.env.DB_USER ?? "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD ?? "postgres";
const DB_PORT = process.env.DB_PORT;

console.log(DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT);
const port = Number(DB_PORT || ports.drizzle);
console.log(port);

const dockersDbs = await createDockerDBs(ports);

// const { Pool } = pkg;
// pg connect
const pg = new pkg.Pool({
  host: DB_HOST,
  port: Number(DB_PORT || ports.pg),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

// pgPrepared connect
const pgPrepared = new pkg.Pool({
  host: DB_HOST,
  port: Number(DB_PORT || ports.pgPrepared),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

// drizzle connect
const drizzlePool = postgres(
    process.env.DATABASE_URL ??
    `postgres://postgres:postgres@localhost:${ports.drizzle}/postgres`,
);
const drizzle = drzl(drizzlePool);

// drizzlePrepared  connect
const drizzlePreparedPool = postgres(
    process.env.DATABASE_URL ??
    `postgres://postgres:postgres@localhost:${ports.drizzlePrepared}/postgres`,
);
// await drizzlePreparedPool.connect();
const drizzlePrepared = drzl(drizzlePreparedPool);

// mikro connect
const mikroOrm = await MikroORM.init<PostgreSqlDriver>({
  type: "postgresql",
  host: DB_HOST,
  port: Number(DB_PORT || ports.mikroOrm),
  user: DB_USER,
  password: DB_PASSWORD,
  dbName: DB_NAME,
  entities: [m_Customer, m_Employee, m_Order, m_Supplier, m_Product, m_Detail],
  metadataProvider: TsMorphMetadataProvider,
});
const mikro = mikroOrm.em.fork();

// knex connect
const knexDb = knex({
  client: "pg",
  connection: {
    host: DB_HOST,
    port: Number(DB_PORT || ports.knex),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
  useNullAsDefault: true,
});

// kysely connect
const kysely = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pkg.Pool({
      host: DB_HOST,
      port: Number(DB_PORT || ports.kysely),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    }),
  }),
});

// prisma connect
const prisma = new Prisma.PrismaClient();

// typeorm connect
const typeorm = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT || ports.typeOrm),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  entities: [Customer, Employee, Order, Supplier, Product, Detail],
  synchronize: false,
  logging: false,
  extra: {
    decimalNumbers: true,
  },
});
await typeorm.initialize();

group("select * from customer", () => {
  bench("pg", async () => {
    await pg.query('select * from "customers"');
  });

  const query = {
    name: "Customers-getAll",
    text: 'select * from "customers"',
  };
  bench("pg:p", async () => {
    await pgPrepared.query(query);
  });

  bench("drizzle", async () => {
    await drizzle.select().from(customers);
  });

  const prepared = drizzlePrepared
    .select()
    .from(customers)
    .prepare("Customers-getAll-D");

  bench("drizzle:p", async () => {
    await prepared.execute();
  });

  bench("knex", async () => {
    await knexDb("customers");
  });

  bench("kysely", async () => {
    await kysely.selectFrom("customers").selectAll().execute();
  });

  bench("mikro", async () => {
    await mikro.find(Customer, {});
    mikro.clear();
  });

  bench("typeorm", async () => {
    await typeorm.getRepository(Customer).find();
  });

  bench("prisma", async () => {
    await prisma.customer.findMany();
  });
});

//
group("select * from customer where id = ?", () => {
  bench("pg", async () => {
    for (const id of customerIds) {
      await pg.query('select * from "customers" where "customers"."id" = $1', [
        id,
      ]);
    }
  });
  const query = {
    name: "Customers-getInfo",
    text: 'select * from "customers" where "customers"."id" = $1',
  };

  bench("pg:p", async () => {
    for (const id of customerIds) {
      await pgPrepared.query(query, [id]);
    }
  });

  bench("drizzle", async () => {
    for (const id of customerIds) {
      await drizzle.select().from(customers).where(eq(customers.id, id));
    }
  });
  const prepared = drizzlePrepared
    .select()
    .from(customers)
    .where(eq(customers.id, placeholder("userId")))
    .prepare("Customers-getInfo-D");

  bench("drizzle:p", async () => {
    for (const id of customerIds) {
      await prepared.execute({ userId: id });
    }
  });

  bench("knex", async () => {
    for (const id of customerIds) {
      await knexDb("customers").where({ id });
    }
  });

  bench("kysely", async () => {
    for (const id of customerIds) {
      await kysely
        .selectFrom("customers")
        .selectAll()
        .where("customers.id", "=", id)
        .execute();
    }
  });

  bench("mikro", async () => {
    for (const id of customerIds) {
      await mikro.findOne(m_Customer, { id });
    }
    mikro.clear();
  });

  const repo = typeorm.getRepository(Customer);
  bench("typeorm", async () => {
    for (const id of customerIds) {
      await repo.findOne({
        where: {
          id,
        },
      });
    }
  });

  bench("prisma", async () => {
    for (const id of customerIds) {
      await prisma.customer.findUnique({
        where: {
          id,
        },
      });
    }
  });
});

//
group("select * from customer where company_name ilike ?", () => {
  bench("pg", async () => {
    for (const it of customerSearches) {
      await pg.query(
        'select * from "customers" where "customers"."company_name" ilike $1',
        [`%${it}%`]
      );
    }
  });

  const query = {
    name: "Customers-search",
    text: 'select * from "customers" where "customers"."company_name" ilike $1',
  };
  bench("pg:p", async () => {
    for (const it of customerSearches) {
      await pgPrepared.query(query, [`%${it}%`]);
    }
  });

  bench("drizzle", async () => {
    for (const it of customerSearches) {
      await drizzle
        .select()
        .from(customers)
        .where(ilike(customers.companyName, `%${it}%`));
    }
  });

  const prepared = drizzlePrepared
    .select()
    .from(customers)
    .where(sql`${customers.companyName} ilike ${placeholder("name")}`)
    .prepare("Customers-search-D");

  bench("drizzle:p", async () => {
    for (const it of customerSearches) {
      await prepared.execute({ name: `%${it}%` });
    }
  });

  bench("knex", async () => {
    for (const it of customerSearches) {
      await knexDb("customers").whereILike("company_name", `%${it}%`);
    }
  });

  bench("kysely", async () => {
    for (const it of customerSearches) {
      await kysely
        .selectFrom("customers")
        .selectAll()
        .where(k_sql`company_name`, "ilike", `%${it}%`)
        .execute();
    }
  });

  bench("mikro", async () => {
    for (const it of customerSearches) {
      await mikro.find(m_Customer, {
        companyName: { $like: `%${it}%` },
      });
    }
    mikro.clear();
  });

  const repo = typeorm.getRepository(Customer);
  bench("typeorm", async () => {
    for (const it of customerSearches) {
      await typeorm.getRepository(Customer).find({
        where: {
          companyName: ILike(`%${it}%`),
        },
      });
    }
  });

  bench("prisma", async () => {
    for (const it of customerSearches) {
      await prisma.customer.findMany({
        where: {
          companyName: {
            contains: it,
            mode: "insensitive",
          },
        },
      });
    }
  });
});

group('"SELECT * FROM employee"', () => {
  bench("pg", async () => {
    await pg.query('select * from "employees"');
  });

  const query = {
    name: "Employees-getAll",
    text: 'select * from "employees"',
  };

  bench("pg:p", async () => {
    await pgPrepared.query(query);
  });

  bench("drizzle", async () => {
    await drizzle.select().from(employees);
  });

  const prepared = drizzlePrepared
    .select()
    .from(employees)
    .prepare("Employees-getAll-D");

  bench("drizzle:p", async () => {
    await prepared.execute();
  });

  bench("knex", async () => {
    await knexDb("employees");
  });

  bench("kysely", async () => {
    await kysely.selectFrom("employees").selectAll().execute();
  });

  bench("mikro", async () => {
    await mikro.find(m_Employee, {});
    mikro.clear();
  });

  bench("typeorm", async () => {
    await typeorm.getRepository(Employee).find();
  });

  bench("prisma", async () => {
    await prisma.employee.findMany();
  });
});

//
group("select * from employee where id = ? left join reportee", () => {
  bench("pg", async () => {
    for (const id of employeeIds) {
      await pg.query(
        `select "e1".*, "e2"."last_name" as "reports_lname", "e2"."first_name" as "reports_fname"
              from "employees" as "e1" left join "employees" as "e2" on "e2"."id" = "e1"."recipient_id" where "e1"."id" = $1`,
        [id]
      );
    }
  });
  const query = {
    name: "Employees-getInfo",
    text: `select "e1".*, "e2"."last_name" as "reports_lname", "e2"."first_name" as "reports_fname"
    from "employees" as "e1" left join "employees" as "e2" on "e2"."id" = "e1"."recipient_id" where "e1"."id" = $1`,
  };

  bench("pg:p", async () => {
    for await (const id of employeeIds) {
      await pgPrepared.query(query, [id]);
    }
  });

  bench("drizzle", async () => {
    const e2 = alias(employees, "recipient");

    for (const id of employeeIds) {
      await drizzle
        .select()
        .from(employees)
        .leftJoin(e2, eq(e2.id, employees.recipientId))
        .where(eq(employees.id, id));
    }
  });

  const e2 = alias(employees, "recipient");
  const prepared = drizzlePrepared
    .select()
    .from(employees)
    .leftJoin(e2, eq(e2.id, employees.recipientId))
    .where(eq(employees.id, placeholder("employeeId")))
    .prepare("Employees-getInfo-D");

  bench("drizzle:p", async () => {
    for (const id of employeeIds) {
      await prepared.execute({ employeeId: id });
    }
  });

  bench("knex", async () => {
    for (const id of employeeIds) {
      await knexDb("employees as e1")
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

  bench("kysely", async () => {
    for (const id of employeeIds) {
      await kysely
        .selectFrom("employees as e1")
        .selectAll()
        .where("e1.id", "=", id)
        .leftJoin(
          kysely
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
          "e1.recipient_id"
        )
        .execute();
    }
  });

  bench("mikro", async () => {
    for (const id of employeeIds) {
      await mikro.findOne(Employee, { id }, { populate: ["recipient"] });
    }
    mikro.clear();
  });

  bench("typeorm", async () => {
    for (const id of employeeIds) {
      await typeorm.getRepository(Employee).findOne({
        where: {
          id,
        },
        relations: {
          recipient: true,
        },
      });
    }
  });

  bench("prisma", async () => {
    for (const id of employeeIds) {
      await prisma.employee.findUnique({
        where: {
          id,
        },
        include: {
          recipient: true,
        },
      });
    }
  });
});

//
group("SELECT * FROM supplier", () => {
  bench("pg", async () => {
    await pg.query('select * from "suppliers"');
  });

  const query = {
    name: "Suppliers-getAll",
    text: 'select * from "suppliers"',
  };
  bench("pg:p", async () => {
    await pgPrepared.query(query);
  });

  bench("drizzle", async () => {
    await drizzle.select().from(suppliers);
  });

  const prepared = drizzlePrepared
    .select()
    .from(suppliers)
    .prepare("Suppliers-getAll-D");

  bench("drizzle:p", async () => {
    await prepared.execute();
  });

  bench("knex", async () => {
    await knexDb("suppliers");
  });

  bench("kysely", async () => {
    await kysely.selectFrom("suppliers").selectAll().execute();
  });

  bench("mikro", async () => {
    await mikro.find(m_Supplier, {});
    mikro.clear();
  });

  bench("typeorm", async () => {
    await typeorm.getRepository(Supplier).find();
  });

  bench("prisma", async () => {
    await prisma.supplier.findMany();
  });
});

//
group("select * from supplier where id = ?", () => {
  bench("pg", async () => {
    for (const id of supplierIds) {
      await pg.query('select * from "suppliers" where "suppliers"."id" = $1', [
        id,
      ]);
    }
  });

  const query = {
    name: "Suppliers-getInfo",
    text: 'select * from "suppliers" where "suppliers"."id" = $1',
  };
  bench("pg:p", async () => {
    for (const id of supplierIds) {
      await pgPrepared.query(query, [id]);
    }
  });

  bench("drizzle", async () => {
    for (const id of supplierIds) {
      await drizzle.select().from(suppliers).where(eq(suppliers.id, id));
    }
  });

  const prepared = drizzlePrepared
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, placeholder("supplierId")))
    .prepare("Suppliers-getInfo-D");

  bench("drizzle:p", async () => {
    for (const id of supplierIds) {
      await prepared.execute({ supplierId: id });
    }
  });

  bench("knex", async () => {
    for (const id of supplierIds) {
      await knexDb("suppliers").where({ id }).first();
    }
  });

  bench("kysely", async () => {
    for (const id of supplierIds) {
      await kysely
        .selectFrom("suppliers")
        .selectAll()
        .where("suppliers.id", "=", id)
        .execute();
    }
  });

  bench("mikro", async () => {
    for (const id of supplierIds) {
      await mikro.findOne(m_Supplier, { id });
    }
    mikro.clear();
  });

  bench("typeorm", async () => {
    for (const id of supplierIds) {
      await typeorm.getRepository(Supplier).findOneBy({ id });
    }
  });

  bench("prisma", async () => {
    for (const id of supplierIds) {
      await prisma.supplier.findUnique({
        where: {
          id,
        },
      });
    }
  });
});

//
group("SELECT * FROM product", () => {
  bench("pg", async () => {
    await pg.query('select * from "products"');
  });

  const query = {
    name: "Products-getAll",
    text: 'select * from "products"',
  };
  bench("pg:p", async () => {
    await pgPrepared.query(query);
  });

  bench("drizzle", async () => {
    await drizzle.select().from(products);
  });

  const prepared = drizzlePrepared
    .select()
    .from(products)
    .prepare("Products-getAll-D");

  bench("drizzle:p", async () => {
    await prepared.execute();
  });

  bench("knex", async () => {
    await knexDb("products");
  });

  bench("kysely", async () => {
    await kysely.selectFrom("products").selectAll().execute();
  });

  bench("mikro", async () => {
    await mikro.find(m_Product, {});
    mikro.clear();
  });

  bench("typeorm", async () => {
    await typeorm.getRepository(Product).find();
  });

  bench("prisma", async () => {
    await prisma.product.findMany();
  });
});

//
group("SELECT * FROM product LEFT JOIN supplier WHERE product.id = ?", () => {
  bench("pg", async () => {
    for (const id of productIds) {
      await pg.query(
        `select "products".*, "suppliers".*
              from "products" left join "suppliers" on "products"."supplier_id" = "suppliers"."id" where "products"."id" = $1`,
        [id]
      );
    }
  });

  const query = {
    name: "Products-getInfo",
    text: `select "products".*, "suppliers".*
    from "products" left join "suppliers" on "products"."supplier_id" = "suppliers"."id" where "products"."id" = $1`,
  };

  bench("pg:p", async () => {
    for (const id of productIds) {
      await pgPrepared.query(query, [id]);
    }
  });

  bench("drizzle", async () => {
    for (const id of productIds) {
      await drizzle
        .select()
        .from(products)
        .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
        .where(eq(products.id, id));
    }
  });

  const prepared = drizzlePrepared
    .select()
    .from(products)
    .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
    .where(eq(products.id, placeholder("productId")))
    .prepare("Products-getInfo-D");

  bench("drizzle:p", async () => {
    for (const id of productIds) {
      await prepared.execute({ productId: id });
    }
  });

  bench("knex", async () => {
    for (const id of productIds) {
      await knexDb("products")
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

  bench("kysely", async () => {
    for (const id of productIds) {
      await kysely
        .selectFrom("products")
        .selectAll()
        .where("products.id", "=", id)
        .leftJoin(
          kysely
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
          "products.supplier_id"
        )
        .execute();
    }
  });

  bench("mikro", async () => {
    for (const id of productIds) {
      await mikro.findOne(m_Product, { id }, { populate: ["supplier"] });
    }
    mikro.clear();
  });

  bench("typeorm", async () => {
    for (const id of productIds) {
      await typeorm.getRepository(Product).findOne({
        where: {
          id,
        },
        relations: ["supplier"],
      });
    }
  });

  bench("prisma", async () => {
    for (const id of productIds) {
      await prisma.product.findUnique({
        where: {
          id,
        },
        include: {
          supplier: true,
        },
      });
    }
  });
});

//
group("SELECT * FROM product WHERE product.name ILIKE ?", () => {
  bench("pg", async () => {
    for (const it of productSearches) {
      await pg.query(
        'select * from "products" where "products"."name" ilike $1',
        [`%${it}%`]
      );
    }
  });

  const query = {
    name: "Products-search",
    text: 'select * from "products" where "products"."name" ilike $1',
  };

  bench("pg:p", async () => {
    for (const it of productSearches) {
      await pgPrepared.query(query, [`%${it}%`]);
    }
  });

  bench("drizzle", async () => {
    for (const it of productSearches) {
      await drizzle
        .select()
        .from(products)
        .where(ilike(products.name, `%${it}%`));
    }
  });

  const prepared = drizzlePrepared
    .select()
    .from(products)
    .where(sql`${products.name} ilike ${placeholder("name")}`)
    .prepare("Products-search-D");

  bench("drizzle:p", async () => {
    for (const it of productSearches) {
      await prepared.execute({ name: `%${it}%` });
    }
  });

  bench("knex", async () => {
    for (const it of productSearches) {
      await knexDb("products").whereILike("name", `%${it}%`);
    }
  });

  bench("kysely", async () => {
    for (const it of productSearches) {
      await kysely
        .selectFrom("products")
        .selectAll()
        .where(k_sql`name`, "ilike", `%${it}%`)
        .execute();
    }
  });

  bench("mikro", async () => {
    for (const it of productSearches) {
      await mikro.find(m_Product, {
        name: { $ilike: `%${it}%` },
      });
    }
    mikro.clear();
  });

  bench("typeorm", async () => {
    for (const it of productSearches) {
      await typeorm.getRepository(Product).find({
        where: {
          name: ILike(`%${it}%`),
        },
      });
    }
  });

  bench("prisma", async () => {
    for (const it of productSearches) {
      await prisma.product.findMany({
        where: {
          name: {
            contains: it,
            mode: "insensitive",
          },
        },
      });
    }
  });
});

group("select all order with sum and count", () => {
  bench("pg", async () => {
    await pg.query(`select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
        sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
        from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" group by "o"."id"`);
  });

  const query = {
    name: "Orders-getAll",
    text: `select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
    sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
    from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" group by "o"."id"`,
  };
  bench("pg:p", async () => {
    await pgPrepared.query(query);
  });

  bench("drizzle", async () => {
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
      .groupBy(orders.id);
  });

  const prepared = drizzlePrepared
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
    .prepare("Orders-getAll-D");

  bench("drizzle:p", async () => {
    await prepared.execute();
  });

  bench("knex", async () => {
    await knexDb("orders")
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
      .sum({ total_price: knexDb.raw("?? * ??", ["quantity", "unit_price"]) })
      .groupBy("orders.id");
  });

  bench("kysely", async () => {
    await kysely
      .selectFrom("orders")
      .select([
        "orders.id",
        "orders.shipped_date",
        "orders.ship_name",
        "orders.ship_city",
        "orders.ship_country",
        kysely.fn.count("product_id").as("products_count"),
        kysely.fn.sum("quantity").as("quantity_sum"),
        k_sql`SUM(quantity * unit_price)`.as("total_price"),
      ])
      .leftJoin("order_details", "order_details.order_id", "orders.id")
      .groupBy("orders.id")
      .execute();
  });

  bench("mikro", async () => {
    const result = await mikro.find(m_Order, {}, { populate: ["details"] });
    const orders = result.map((item) => {
      const details = item.details.getItems();
      return {
        id: item.id,
        shippedDate: item.shippedDate,
        shipName: item.shipName,
        shipCity: item.shipCity,
        shipCountry: item.shipCountry,
        productsCount: item.details.length,
        quantitySum: details.reduce(
          (sum, deteil) => (sum += +deteil.quantity),
          0
        ),
        totalPrice: details.reduce(
          (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
          0
        ),
      };
    });
    mikro.clear();
  });

  bench("typeorm", async () => {
    const result = await typeorm.getRepository(Order).find({
      relations: {
        details: true,
      },
    });
    const orders = result.map((item) => {
      return {
        id: item.id,
        shippedDate: item.shippedDate,
        shipName: item.shipName,
        shipCity: item.shipCity,
        shipCountry: item.shipCountry,
        productsCount: item.details.length,
        quantitySum: item.details.reduce(
          (sum, deteil) => (sum += +deteil.quantity),
          0
        ),
        totalPrice: item.details.reduce(
          (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
          0
        ),
      };
    });
  });

  bench("prisma", async () => {
    const result = await prisma.order.findMany({
      include: {
        details: true,
      },
    });
    const orders = result.map((item) => {
      return {
        id: item.id,
        shippedDate: item.shippedDate,
        shipName: item.shipName,
        shipCity: item.shipCity,
        shipCountry: item.shipCountry,
        productsCount: item.details.length,
        quantitySum: item.details.reduce(
          (sum, deteil) => (sum += +deteil.quantity),
          0
        ),
        totalPrice: item.details.reduce(
          (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
          0
        ),
      };
    });
  });
});

group("select order with sum and count using limit with offset", () => {
  const limit = 50;

  bench("pg", async () => {
    let offset = 0;
    while (true) {
      const result = await pg.query(
        `select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
      sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
      from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" group by "o"."id" ORDER BY o.id ASC limit $1 offset $2`,
        [limit, offset]
      );

      offset += limit;
      if (result.rowCount < limit) break;
    }
  });

  const query = {
    name: "Orders-getLimit-withOffset",
    text: `select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
    sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
    from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" group by "o"."id" ORDER BY o.id ASC limit $1 offset $2`,
  };

  bench("pg:p", async () => {
    let offset = 0;
    while (true) {
      const result = await pgPrepared.query(query, [limit, offset]);
      offset += limit;
      if (result.rowCount < limit) break;
    }
  });

  bench("drizzle", async () => {
    let offset = 0;
    while (true) {
      const result = await drizzle
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
        .orderBy(orders.id)
        .groupBy(orders.id)
        .limit(limit)
        .offset(offset);

      offset += limit;
      if (result.length < limit) break;
    }
  });

  const prepared = drizzlePrepared
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
    .orderBy(orders.id)
    .groupBy(orders.id)
    .limit(placeholder("limit"))
    .offset(placeholder("offset"))
    .prepare("Orders-getLimit-withOffset-D");

  bench("drizle:p", async () => {
    let offset = 0;
    while (true) {
      const result = await prepared.execute({ limit, offset });
      offset += limit;
      if (result.length < limit) break;
    }
  });

  bench("knex", async () => {
    let offset = 0;
    while (true) {
      const result = await knexDb("orders")
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
        .sum({ total_price: knexDb.raw("?? * ??", ["quantity", "unit_price"]) })
        .groupBy("orders.id")
        .orderBy("orders.id")
        .limit(limit)
        .offset(offset);

      offset += limit;
      if (result.length < limit) break;
    }
  });

  bench("kysely", async () => {
    let offset = 0;
    while (true) {
      const result = await kysely
        .selectFrom("orders")
        .select([
          "orders.id",
          "orders.shipped_date",
          "orders.ship_name",
          "orders.ship_city",
          "orders.ship_country",
          kysely.fn.count("product_id").as("products_count"),
          kysely.fn.sum("quantity").as("quantity_sum"),
          k_sql`SUM(quantity * unit_price)`.as("total_price"),
        ])
        .leftJoin("order_details", "order_details.order_id", "orders.id")
        .groupBy("orders.id")
        .orderBy("orders.id")
        .limit(limit)
        .offset(offset)
        .execute();

      offset += limit;
      if (result.length < limit) break;
    }
  });

  bench("mikro", async () => {
    let offset = 0;
    while (true) {
      const result = await mikro.find(
        m_Order,
        {},
        { populate: ["details"], limit, offset, orderBy: { id: "ASC" } }
      );
      const orders = result.map((item) => {
        const details = item.details.getItems();
        return {
          id: item.id,
          shippedDate: item.shippedDate,
          shipName: item.shipName,
          shipCity: item.shipCity,
          shipCountry: item.shipCountry,
          productsCount: item.details.length,
          quantitySum: details.reduce(
            (sum, deteil) => (sum += +deteil.quantity),
            0
          ),
          totalPrice: details.reduce(
            (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
            0
          ),
        };
      });
      offset += limit;
      if (result.length < limit) break;
    }
    mikro.clear();
  });

  bench("typeorm", async () => {
    let offset = 0;
    while (true) {
      const result = await typeorm.getRepository(Order).find({
        relations: {
          details: true,
        },
        order: {
          id: "ASC",
        },
        take: limit,
        skip: offset,
      });
      const orders = result.map((item) => {
        return {
          id: item.id,
          shippedDate: item.shippedDate,
          shipName: item.shipName,
          shipCity: item.shipCity,
          shipCountry: item.shipCountry,
          productsCount: item.details.length,
          quantitySum: item.details.reduce(
            (sum, deteil) => (sum += +deteil.quantity),
            0
          ),
          totalPrice: item.details.reduce(
            (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
            0
          ),
        };
      });

      offset += limit;
      if (result.length < limit) break;
    }
  });

  bench("prisma", async () => {
    let offset = 0;
    while (true) {
      const result = await prisma.order.findMany({
        include: {
          details: true,
        },
        orderBy: {
          id: "asc",
        },
        take: limit,
        skip: offset,
      });
      const orders = result.map((item) => {
        return {
          id: item.id,
          shippedDate: item.shippedDate,
          shipName: item.shipName,
          shipCity: item.shipCity,
          shipCountry: item.shipCountry,
          productsCount: item.details.length,
          quantitySum: item.details.reduce(
            (sum, deteil) => (sum += +deteil.quantity),
            0
          ),
          totalPrice: item.details.reduce(
            (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
            0
          ),
        };
      });

      offset += limit;
      if (result.length < limit) break;
    }
  });
});

group("select order where order.id = ? with sum and count", () => {
  bench("pg", async () => {
    await Promise.all(
      orderIds.map(async (id) => {
        await pg.query(
          `select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
        sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
        from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" where "o"."id" = $1 group by "o"."id"`,
          [id]
        );
      })
    );
    // for (const id of orderIds) {
    //   await pg.query(
    //     `select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
    //     sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
    //     from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" where "o"."id" = $1 group by "o"."id"`,
    //     [id]
    //   );
    // }
  });

  const query = {
    name: "Orders-getById",
    text: `select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
    sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
    from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" where "o"."id" = $1 group by "o"."id"`,
  };

  bench("pg:p", async () => {
    await Promise.all(
      orderIds.map(async (id) => {
        await pgPrepared.query(query, [id]);
      })
    );
    // for (const id of orderIds) {
    //   await pg.query(query, [id]);
    // }
  });

  bench("drizzle", async () => {
    await Promise.all(
      orderIds.map(async (id) => {
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
          .groupBy(orders.id);
      })
    );
    // for (const id of orderIds) {
    //   await drizzle
    //     .select(orders)
    //     .fields({
    //       id: orders.id,
    //       shippedDate: orders.shippedDate,
    //       shipName: orders.shipName,
    //       shipCity: orders.shipCity,
    //       shipCountry: orders.shipCountry,
    //       productsCount: sql`count(${details.productId})`.as<number>(),
    //       quantitySum: sql`sum(${details.quantity})`.as<number>(),
    //       totalPrice:
    //         sql`sum(${details.quantity} * ${details.unitPrice})`.as<number>(),
    //     })
    //     .leftJoin(details, eq(orders.id, details.orderId), {})
    //     .where(eq(orders.id, id))
    //     .groupBy(orders.id)
    // }
  });

  const prepared = drizzlePrepared
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
    .where(eq(orders.id, placeholder("orderId")))
    .groupBy(orders.id)
    .prepare("Orders-getById-D");

  bench("drizzle:p", async () => {
    await Promise.all(
      orderIds.map(async (id) => {
        await prepared.execute({ orderId: id });
      })
    );
  });

  bench("knex", async () => {
    await Promise.all(
      orderIds.map(async (id) => {
        await knexDb("orders")
          .select([
            "orders.id",
            "orders.shipped_date",
            "orders.ship_name",
            "orders.ship_city",
            "orders.ship_country",
          ])
          .leftJoin("order_details", "order_details.order_id", "orders.id")
          .where("orders.id", "=", id)
          .count("product_id as products_count")
          .sum("quantity as quantity_sum")
          .sum({
            total_price: knexDb.raw("?? * ??", ["quantity", "unit_price"]),
          })
          .groupBy("orders.id");
      })
    );
    // for (const id of orderIds) {
    //   await knexDb("orders")
    //     .select([
    //       "orders.id",
    //       "orders.shipped_date",
    //       "orders.ship_name",
    //       "orders.ship_city",
    //       "orders.ship_country",
    //     ])
    //     .leftJoin("order_details", "order_details.order_id", "orders.id")
    //     .where("orders.id", "=", id)
    //     .count("product_id as products_count")
    //     .sum("quantity as quantity_sum")
    //     .sum({ total_price: knexDb.raw("?? * ??", ["quantity", "unit_price"]) })
    //     .groupBy("orders.id")
    // }
  });

  bench("kysely", async () => {
    await Promise.all(
      orderIds.map(async (id) => {
        await kysely
          .selectFrom("orders")
          .select([
            "orders.id",
            "orders.shipped_date",
            "orders.ship_name",
            "orders.ship_city",
            "orders.ship_country",
            kysely.fn.count("product_id").as("products_count"),
            kysely.fn.sum("quantity").as("quantity_sum"),
            k_sql`SUM(quantity * unit_price)`.as("total_price"),
          ])
          .leftJoin("order_details", "order_details.order_id", "orders.id")
          .where("orders.id", "=", id)
          .groupBy("orders.id")
          .execute();
      })
    );

    // for (const id of orderIds) {
    //   await kysely
    //     .selectFrom("orders")
    //     .select([
    //       "orders.id",
    //       "orders.shipped_date",
    //       "orders.ship_name",
    //       "orders.ship_city",
    //       "orders.ship_country",
    //       kysely.fn.count("product_id").as("products_count"),
    //       kysely.fn.sum("quantity").as("quantity_sum"),
    //       k_sql`SUM(quantity * unit_price)`.as("total_price"),
    //     ])
    //     .leftJoin("order_details", "order_details.order_id", "orders.id")
    //     .where("orders.id", "=", id)
    //     .groupBy("orders.id")
    //     .execute();
    // }
  });

  bench("mikro", async () => {
    await Promise.all(
      orderIds.map(async (id) => {
        const result = await mikro.findOne(
          m_Order,
          { id },
          { populate: ["details"] }
        );
        const details = result!.details.getItems();
        const order = {
          id: result!.id,
          shippedDate: result!.shippedDate,
          shipName: result!.shipName,
          shipCity: result!.shipCity,
          shipCountry: result!.shipCountry,
          productsCount: result!.details.length,
          quantitySum: details.reduce(
            (sum, deteil) => (sum += +deteil.quantity),
            0
          ),
          totalPrice: details.reduce(
            (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
            0
          ),
        };
      })
    );
    // for (const id of orderIds) {
    //   const result = await mikro.findOne(
    //     m_Order,
    //     { id },
    //     { populate: ["details"] }
    //   );
    //   const details = result!.details.getItems()
    //   const order = {
    //     id: result!.id,
    //     shippedDate: result!.shippedDate,
    //     shipName: result!.shipName,
    //     shipCity: result!.shipCity,
    //     shipCountry: result!.shipCountry,
    //     productsCount: result!.details.length,
    //     quantitySum: details
    //       .reduce((sum, deteil) => (sum += +deteil.quantity), 0),
    //     totalPrice: details
    //       .reduce(
    //         (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
    //         0
    //       ),
    //   };
    // }
    mikro.clear();
  });

  bench("prisma", async () => {
    await Promise.all(
      orderIds.map(async (id) => {
        const result = await prisma.order.findFirst({
          include: {
            details: true,
          },
          where: {
            id,
          },
        });
        const order = {
          id: result!.id,
          shippedDate: result!.shippedDate,
          shipName: result!.shipName,
          shipCity: result!.shipCity,
          shipCountry: result!.shipCountry,
          productsCount: result!.details.length,
          quantitySum: result!.details.reduce(
            (sum, deteil) => (sum += +deteil.quantity),
            0
          ),
          totalPrice: result!.details.reduce(
            (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
            0
          ),
        };
      })
    );
    // for (const id of orderIds) {
    //   const result = await prisma.order.findFirst({
    //     include: {
    //       details: true,
    //     },
    //     where: {
    //       id,
    //     },
    //   });
    //   const order = {
    //     id: result!.id,
    //     shippedDate: result!.shippedDate,
    //     shipName: result!.shipName,
    //     shipCity: result!.shipCity,
    //     shipCountry: result!.shipCountry,
    //     productsCount: result!.details.length,
    //     quantitySum: result!.details.reduce(
    //       (sum, deteil) => (sum += +deteil.quantity),
    //       0
    //     ),
    //     totalPrice: result!.details.reduce(
    //       (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
    //       0
    //     ),
    //   };
    // }
  });

  bench("typeorm", async () => {
    await Promise.all(
      orderIds.map(async (id) => {
        const result = await typeorm.getRepository(Order).findOne({
          relations: {
            details: true,
          },
          where: {
            id,
          },
        });
        const order = {
          id: result!.id,
          shippedDate: result!.shippedDate,
          shipName: result!.shipName,
          shipCity: result!.shipCity,
          shipCountry: result!.shipCountry,
          productsCount: result!.details.length,
          quantitySum: result!.details.reduce(
            (sum, deteil) => (sum += +deteil.quantity),
            0
          ),
          totalPrice: result!.details.reduce(
            (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
            0
          ),
        };
      })
    );
    // for (const id of orderIds) {
    //   const result = await typeorm.getRepository(Order).findOne({
    //     relations: {
    //       details: true,
    //     },
    //     where: {
    //       id,
    //     },
    //   });
    //   const order = {
    //     id: result!.id,
    //     shippedDate: result!.shippedDate,
    //     shipName: result!.shipName,
    //     shipCity: result!.shipCity,
    //     shipCountry: result!.shipCountry,
    //     productsCount: result!.details.length,
    //     quantitySum: result!.details.reduce(
    //       (sum, deteil) => (sum += +deteil.quantity),
    //       0
    //     ),
    //     totalPrice: result!.details.reduce(
    //       (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
    //       0
    //     ),
    //   };
    // }
  });
});

//
group("SELECT * FROM order_detail WHERE order_id = ?", () => {
  bench("pg", async () => {
    for (const id of orderIds) {
      await pg.query(
        `SELECT * FROM "orders" AS o
            LEFT JOIN "order_details" AS od ON o.id = od.order_id
            LEFT JOIN "products" AS p ON od.product_id = p.id
            WHERE o.id = $1`,
        [id]
      );
    }
  });

  const query = {
    name: "Orders-getInfo",
    text: `SELECT * FROM "orders" AS o
    LEFT JOIN "order_details" AS od ON o.id = od.order_id
    LEFT JOIN "products" AS p ON od.product_id = p.id
    WHERE o.id = $1`,
  };

  bench("pg:p", async () => {
    for await (const id of orderIds) {
      await pgPrepared.query(query, [id]);
    }
  });

  bench("drizzle", async () => {
    for (const id of orderIds) {
      await drizzle
        .select()
        .from(orders)
        .leftJoin(details, eq(orders.id, details.orderId))
        .leftJoin(products, eq(details.productId, products.id))
        .where(eq(orders.id, id));
    }
  });

  const prepared = drizzlePrepared
    .select()
    .from(orders)
    .leftJoin(details, eq(orders.id, details.orderId))
    .leftJoin(products, eq(details.productId, products.id))
    .where(eq(orders.id, placeholder("orderId")))
    .prepare("Orders-getInfo-D");

  bench("drizzle:p", async () => {
    for (const id of orderIds) {
      await prepared.execute({ orderId: id });
    }
  });

  bench("knex", async () => {
    for (const id of orderIds) {
      await knexDb("orders")
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

  bench("kysely", async () => {
    for (const id of orderIds) {
      await kysely
        .selectFrom("orders")
        .selectAll()
        .where("id", "=", id)
        .leftJoin(
          kysely
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
          "orders.id"
        )
        .leftJoin(
          kysely
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
          "od.product_id"
        )
        .execute();
    }
  });

  bench("mikro", async () => {
    for (const id of orderIds) {
      await mikro.find(
        m_Order,
        { id },
        { populate: ["details", "details.product"] }
      );
    }
    mikro.clear();
  });

  bench("typeorm", async () => {
    for (const id of orderIds) {
      await typeorm.getRepository(Order).find({
        relations: ["details", "details.product"],
        where: {
          id,
        },
      });
    }
  });

  bench("prisma", async () => {
    for (const id of orderIds) {
      await prisma.order.findMany({
        where: {
          id,
        },
        include: {
          details: {
            include: {
              product: true,
            },
          },
        },
      });
    }
  });
});

const main = async () => {
  try {
    await run();
  } catch (e) {
    console.error(e)
  }

  await deleteDockerDBs(dockersDbs);
  process.exit(0);
};

main();

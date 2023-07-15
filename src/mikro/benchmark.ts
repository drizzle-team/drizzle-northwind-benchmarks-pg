import { ports } from "@/utils";
import { MikroORM } from "@mikro-orm/core";
import {
  type PostgreSqlDriver,
  type SqlEntityManager,
} from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import dotenv from "dotenv";
import { bench } from "mitata";
import {
  customerIds,
  customerSearches,
  employeeIds,
  orderIds,
  productIds,
  productSearches,
  supplierIds,
} from "../common/meta";
import { Customer } from "./entities/customers";
import { Detail } from "./entities/details";
import { Employee } from "./entities/employees";
import { Order } from "./entities/orders";
import { Product } from "./entities/products";
import { Supplier } from "./entities/suppliers";

dotenv.config();
const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

let mikro: SqlEntityManager<PostgreSqlDriver>;

bench("MikroORM Customers: getAll", async () => {
  await mikro.find(Customer, {});
  mikro.clear();
});
bench("MikroORM Customers: getInfo", async () => {
  for (const id of customerIds) {
    await mikro.findOne(Customer, { id });
  }
  mikro.clear();
});
bench("MikroORM Customers: search", async () => {
  for (const it of customerSearches) {
    await mikro.find(Customer, {
      companyName: { $like: `%${it}%` },
    });
  }
  mikro.clear();
});
bench("MikroORM Employees: getAll", async () => {
  await mikro.find(Employee, {});
  mikro.clear();
});
bench("MikroORM Employees: getInfo", async () => {
  for (const id of employeeIds) {
    await mikro.findOne(Employee, { id }, { populate: ["recipient"] });
  }
  mikro.clear();
});
bench("MikroORM Suppliers: getAll", async () => {
  await mikro.find(Supplier, {});
  mikro.clear();
});
bench("MikroORM Suppliers: getInfo", async () => {
  for (const id of supplierIds) {
    await mikro.findOne(Supplier, { id });
  }
  mikro.clear();
});
bench("MikroORM Products: getAll", async () => {
  await mikro.find(Product, {});
  mikro.clear();
});
bench("MikroORM Products: getInfo", async () => {
  for (const id of productIds) {
    await mikro.findOne(Product, { id }, { populate: ["supplier"] });
  }
  mikro.clear();
});
bench("MikroORM Products: search", async () => {
  for (const it of productSearches) {
    await mikro.find(Product, {
      name: { $ilike: `%${it}%` },
    });
  }
  mikro.clear();
});

bench("MikroORM Orders: getAll", async () => {
  const result = await mikro.find(Order, {}, { populate: ["details"] });
  const _orders = result.map((item) => {
    const details = item.details.toArray();
    return {
      id: item.id,
      shippedDate: item.shippedDate,
      shipName: item.shipName,
      shipCity: item.shipCity,
      shipCountry: item.shipCountry,
      productsCount: item.details.length,
      quantitySum: details.reduce(
        (sum, deteil) => (sum += +deteil.quantity),
        0,
      ),
      totalPrice: details.reduce(
        (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
        0,
      ),
    };
  });
});

bench("MikroORM Orders: getById", async () => {
  for (const id of orderIds) {
    const result = await mikro.findOne(
      Order,
      { id },
      { populate: ["details"] },
    );
    const details = result?.details.getItems();
    const _order = {
      id: result?.id,
      shippedDate: result?.shippedDate,
      shipName: result?.shipName,
      shipCity: result?.shipCity,
      shipCountry: result?.shipCountry,
      productsCount: result?.details.length,
      quantitySum: details?.reduce(
        (sum, deteil) => (sum += +deteil.quantity),
        0,
      ),
      totalPrice: details?.reduce(
        (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
        0,
      ),
    };
  }
});

bench("MikroORM Orders: getInfo", async () => {
  for (const id of orderIds) {
    await mikro.find(
      Order,
      { id },
      { populate: ["details", "details.product"] },
    );
  }
  mikro.clear();
});

const main = async () => {
  const orm = await MikroORM.init<PostgreSqlDriver>({
    type: "postgresql",
    host: DB_HOST,
    port: +(DB_PORT ?? ports.mikroOrm),
    user: DB_USER,
    password: DB_PASSWORD,
    dbName: DB_NAME,
    entities: [Customer, Employee, Order, Supplier, Product, Detail],
    metadataProvider: TsMorphMetadataProvider,
  });
  mikro = orm.em.fork();
  // await run();

  const result = await mikro.findOne(
    Order,
    { id: "10248" },
    { populate: ["details"] },
  );
  console.log(result);

  const deteils = result?.details.getItems();
  const _order = {
    id: result?.id,
    shippedDate: result?.shippedDate,
    shipName: result?.shipName,
    shipCity: result?.shipCity,
    shipCountry: result?.shipCountry,
    productsCount: result?.details.length,
    quantitySum: deteils?.reduce((sum, deteil) => (sum += +deteil.quantity), 0),
    totalPrice: deteils?.reduce(
      (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
      0,
    ),
  };
};
void main();

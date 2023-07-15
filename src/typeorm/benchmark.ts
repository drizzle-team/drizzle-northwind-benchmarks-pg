import dotenv from "dotenv";
import { bench, run } from "mitata";
import { DataSource, ILike } from "typeorm";
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

const typeorm = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT),
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

bench("TypeORM Customers: getAll", async () => {
  await typeorm.getRepository(Customer).find();
});

bench("TypeORM Customers: getInfo", async () => {
  for (const id of customerIds) {
    await typeorm.getRepository(Customer).findOneBy({ id });
  }
});

bench("TypeORM Customers: search", async () => {
  for (const it of customerSearches) {
    await typeorm.getRepository(Customer).find({
      where: {
        companyName: ILike(`%${it}%`),
      },
    });
  }
});

bench("TypeORM Employees: getAll", async () => {
  await typeorm.getRepository(Employee).find();
});

bench("TypeORM Employees: getInfo", async () => {
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

bench("TypeORM Suppliers: getAll", async () => {
  await typeorm.getRepository(Supplier).find();
});

bench("TypeORM Suppliers: getInfo", async () => {
  for (const id of supplierIds) {
    await typeorm.getRepository(Supplier).findOneBy({ id });
  }
});

bench("TypeORM Products: getAll", async () => {
  await typeorm.getRepository(Product).find();
});

bench("TypeORM Products: getInfo", async () => {
  for (const id of productIds) {
    await typeorm.getRepository(Product).findOne({
      where: {
        id,
      },
      relations: ["supplier"],
    });
  }
});

bench("TypeORM Products: search", async () => {
  for (const it of productSearches) {
    await typeorm.getRepository(Product).find({
      where: {
        name: ILike(`%${it}%`),
      },
    });
  }
});

bench("TypeORM Orders: getAll", async () => {
  const result = await typeorm.getRepository(Order).find({
    relations: {
      details: true,
    },
  });
  const _orders = result.map((item) => {
    return {
      id: item.id,
      shippedDate: item.shippedDate,
      shipName: item.shipName,
      shipCity: item.shipCity,
      shipCountry: item.shipCountry,
      productsCount: item.details.length,
      quantitySum: item.details.reduce(
        (sum, deteil) => (sum += +deteil.quantity),
        0,
      ),
      totalPrice: item.details.reduce(
        (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
        0,
      ),
    };
  });
});

bench("TypeORM Orders: getById", async () => {
  for (const id of orderIds) {
    const result = await typeorm.getRepository(Order).findOne({
      relations: {
        details: true,
      },
      where: {
        id,
      },
    });
    if (result !== null) {
      const _order = {
        id: result.id,
        shippedDate: result.shippedDate,
        shipName: result.shipName,
        shipCity: result.shipCity,
        shipCountry: result.shipCountry,
        productsCount: result.details.length,
        quantitySum: result.details.reduce(
          (sum, deteil) => (sum += +deteil.quantity),
          0,
        ),
        totalPrice: result.details.reduce(
          (sum, deteil) => (sum += +deteil.quantity * +deteil.unitPrice),
          0,
        ),
      };
    }
  }
});

bench("TypeORM Orders: getInfo", async () => {
  for (const id of orderIds) {
    await typeorm.getRepository(Order).find({
      relations: ["details", "details.product"],
      where: {
        id,
      },
    });
  }
});

const main = async () => {
  await typeorm.initialize();
  await run();
};

void main();

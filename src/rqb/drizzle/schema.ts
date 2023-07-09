import {
  pgTable,
  varchar,
  date,
  text,
  foreignKey,
  integer,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { InferModel } from "drizzle-orm";
import { relations } from "drizzle-orm";

export const customers = pgTable("customers", {
  id: varchar("id", { length: 5 }).primaryKey().notNull(),
  companyName: varchar("company_name").notNull(),
  contactName: varchar("contact_name").notNull(),
  contactTitle: varchar("contact_title").notNull(),
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  postalCode: varchar("postal_code"),
  region: varchar("region"),
  country: varchar("country").notNull(),
  phone: varchar("phone").notNull(),
  fax: varchar("fax"),
});

export type Customer = InferModel<typeof customers>;

export const employees = pgTable(
  "employees",
  {
    id: varchar("id").primaryKey().notNull(),
    lastName: varchar("last_name").notNull(),
    firstName: varchar("first_name"),
    title: varchar("title").notNull(),
    titleOfCourtesy: varchar("title_of_courtesy").notNull(),
    birthDate: date("birth_date", { mode: "date" }).notNull(),
    hireDate: date("hire_date", { mode: "date" }).notNull(),
    address: varchar("address").notNull(),
    city: varchar("city").notNull(),
    postalCode: varchar("postal_code").notNull(),
    country: varchar("country").notNull(),
    homePhone: varchar("home_phone").notNull(),
    extension: integer("extension").notNull(),
    notes: text("notes").notNull(),
    recipientId: varchar("recipient_id"),
  },
  (table) => ({
    recipientFk: foreignKey({
      columns: [table.recipientId],
      foreignColumns: [table.id],
    }),
  })
);

export const employeeRelations = relations(employees, ({ one, many }) => ({
  recipient: one(employees, {
    fields: [employees.recipientId],
    references: [employees.id],
  }),
}));

export type Employee = InferModel<typeof employees>;

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().notNull(),
  orderDate: date("order_date", { mode: "date" }).notNull(),
  requiredDate: date("required_date", { mode: "date" }).notNull(),
  shippedDate: date("shipped_date", { mode: "date" }),
  shipVia: integer("ship_via").notNull(),
  freight: doublePrecision("freight").notNull(),
  shipName: varchar("ship_name").notNull(),
  shipCity: varchar("ship_city").notNull(),
  shipRegion: varchar("ship_region"),
  shipPostalCode: varchar("ship_postal_code"),
  shipCountry: varchar("ship_country").notNull(),

  customerId: varchar("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),

  employeeId: varchar("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
});

export const orderRelations = relations(orders, ({ many, one }) => ({
  details: many(details),
}));

export type Order = InferModel<typeof orders>;

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().notNull(),
  companyName: varchar("company_name").notNull(),
  contactName: varchar("contact_name").notNull(),
  contactTitle: varchar("contact_title").notNull(),
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  region: varchar("region"),
  postalCode: varchar("postal_code").notNull(),
  country: varchar("country").notNull(),
  phone: varchar("phone").notNull(),
});

export type Supplier = InferModel<typeof suppliers>;

export const products = pgTable("products", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  quantityPerUnit: varchar("qt_per_unit").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  unitsInStock: integer("units_in_stock").notNull(),
  unitsOnOrder: integer("units_on_order").notNull(),
  reorderLevel: integer("reorder_level").notNull(),
  discontinued: integer("discontinued").notNull(),

  supplierId: varchar("supplier_id")
    .notNull()
    .references(() => suppliers.id, { onDelete: "cascade" }),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  details: many(details),
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
}));

export type Product = InferModel<typeof products>;

export const details = pgTable("order_details", {
  unitPrice: doublePrecision("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  discount: doublePrecision("discount").notNull(),

  orderId: varchar("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  productId: varchar("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
});

export const detailsRelations = relations(details, ({ many, one }) => ({
  order: one(orders, { fields: [details.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [details.productId],
    references: [products.id],
  }),
}));

export type Detail = InferModel<typeof details>;

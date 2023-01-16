import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Order } from './orders';
import { Product } from './products';

@Entity({ tableName: 'order_details' })
export class Detail {
  @Property({ fieldName: 'unit_price', columnType: 'decimal', precision: 10, scale: 2, default: 0 })
    unitPrice: number;

  @Property({ fieldName: 'quantity' })
    quantity: number;

  @Property({ fieldName: 'discount', columnType: 'decimal', precision: 10, scale: 2, default: 0 })
    discount: number;

  @PrimaryKey({ fieldName: 'order_id' })
    orderId: string;
  @ManyToOne(() => Order)
    order: Order;

  @PrimaryKey({ fieldName: 'product_id' })
    productId: string;
  @ManyToOne(() => Product)
    product: Product;
}

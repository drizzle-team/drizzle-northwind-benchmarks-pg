import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Order } from './orders';

@Entity({ tableName: 'customers' })
export class Customer {
  @PrimaryKey()
    id: string;

  @Property({ fieldName: 'company_name' })
    companyName: string;

  @Property({ fieldName: 'contact_name' })
    contactName: string;

  @Property({ fieldName: 'contact_title' })
    contactTitle: string;

  @Property({ fieldName: 'address' })
    address: string;

  @Property({ fieldName: 'city' })
    city: string;

  @Property({ fieldName: 'postal_code', columnType: 'varchar', nullable: true })
    postalCode?: string;

  @Property({ fieldName: 'region', columnType: 'varchar', nullable: true })
    region?: string;

  @Property({ fieldName: 'country' })
    country: string;

  @Property({ fieldName: 'phone' })
    phone: string;

  @Property({ fieldName: 'fax', columnType: 'varchar', nullable: true })
    fax?: string;

  @OneToMany(() => Order, (order) => order.customer, { cascade: [Cascade.ALL] })
    orders = new Collection<Order>(this);
}

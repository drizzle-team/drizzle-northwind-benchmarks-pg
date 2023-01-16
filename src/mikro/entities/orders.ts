import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Customer } from './customers';
import { Detail } from './details';
import { Employee } from './employees';

@Entity({ tableName: 'orders' })
export class Order {
  @PrimaryKey()
    id: string;

  @Property({ fieldName: 'order_date', columnType: 'date' })
    orderDate: Date;

  @Property({ fieldName: 'required_date' })
    requiredDate: Date;

  @Property({ fieldName: 'shipped_date', columnType: 'date', nullable: true })
    shippedDate: Date | null;

  @Property({ fieldName: 'ship_via' })
    shipVia: number;

  @Property({ fieldName: 'freight', columnType: 'decimal', precision: 10, scale: 2, default: 0 })
    freight: number;

  @Property({ fieldName: 'ship_name' })
    shipName: string;

  @Property({ fieldName: 'ship_city' })
    shipCity: string;

  @Property({ fieldName: 'ship_region', columnType: 'varchar', nullable: true })
    shipRegion: string | null;

  @Property({ fieldName: 'ship_postal_code', columnType: 'varchar', nullable: true })
    shipPostalCode: string | null;

  @Property({ fieldName: 'ship_country' })
    shipCountry: string;

  @Property({ fieldName: 'customer_id' })
    customerId: string;
  @ManyToOne(() => Customer)
    customer: Customer;

  @Property({ fieldName: 'employee_id' })
    employeeId: string;
  @ManyToOne(() => Employee)
    employee: Employee;

  @OneToMany(() => Detail, (detail) => detail.order, { cascade: [Cascade.ALL] })
    details = new Collection<Detail>(this);
}

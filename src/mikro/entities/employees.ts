import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Order } from './orders';

@Entity({ tableName: 'employees' })
export class Employee {
  @PrimaryKey()
    id: string;

  @Property({ fieldName: 'last_name' })
    lastName: string;

  @Property({ fieldName: 'first_name', columnType: 'varchar', nullable: true })
    firstName?: string;

  @Property({ fieldName: 'title' })
    title: string;

  @Property({ fieldName: 'title_of_courtesy' })
    titleOfCourtesy: string;

  @Property({ fieldName: 'birth_date' })
    birthDate: Date;

  @Property({ fieldName: 'hire_date' })
    hireDate: Date;

  @Property({ fieldName: 'address' })
    address: string;

  @Property({ fieldName: 'city' })
    city: string;

  @Property({ name: 'postal_code' })
    postalCode: string;

  @Property({ fieldName: 'country' })
    country: string;

  @Property({ fieldName: 'home_phone' })
    homePhone: string;

  @Property({ fieldName: 'extension' })
    extension: number;

  @Property({ fieldName: 'notes', columnType: 'text' })
    notes: string;

  @Property({ fieldName: 'recipient_id', columnType: 'varchar', nullable: true })
    recipientId?: string;
  @ManyToOne(() => Employee)
    recipient?: Employee;

  @OneToMany(() => Order, (order) => order.employee, { cascade: [Cascade.ALL] })
    orders = new Collection<Order>(this);
}

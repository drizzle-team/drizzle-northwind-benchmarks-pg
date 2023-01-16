import {
  Entity, Column, ManyToOne, JoinColumn, OneToMany, PrimaryColumn,
} from 'typeorm';
import { Customer } from './customers';
import { Detail } from './details';
import { Employee } from './employees';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryColumn({ type: 'varchar' })
    id: string;

  @Column({ name: 'order_date', type: 'date' })
    orderDate: Date;

  @Column({ name: 'required_date', type: 'date' })
    requiredDate: Date;

  @Column({ name: 'shipped_date', type: 'date', nullable: true })
    shippedDate: Date | null;

  @Column({ name: 'ship_via', type: 'integer' })
    shipVia: number;

  @Column({ name: 'freight', type: 'decimal', precision: 10, scale: 2, default: 0 })
    freight: number;

  @Column({ name: 'ship_name', type: 'varchar' })
    shipName: string;

  @Column({ name: 'ship_city', type: 'varchar' })
    shipCity: string;

  @Column({ name: 'ship_region', type: 'varchar', nullable: true })
    shipRegion: string | null;

  @Column({ name: 'ship_postal_code', type: 'varchar', nullable: true })
    shipPostalCode: string | null;

  @Column({ name: 'ship_country', type: 'varchar' })
    shipCountry: string;

  @Column({ name: 'customer_id', type: 'varchar' })
    customerId: string;
  @ManyToOne(() => Customer, (customer) => customer.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
    customer: Customer;

  @Column({ name: 'employee_id', type: 'varchar' })
    employeeId: string;
  @ManyToOne(() => Employee, (employee) => employee.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
    employee: Employee;

  @OneToMany(() => Detail, (detail) => detail.order)
    details: Detail[];
}

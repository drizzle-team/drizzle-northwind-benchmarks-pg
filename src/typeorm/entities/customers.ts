import {
  Entity, Column, OneToMany, PrimaryColumn,
} from 'typeorm';
import { Order } from './orders';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryColumn({ type: 'varchar' })
    id: string;

  @Column({ name: 'company_name', type: 'varchar' })
    companyName: string;

  @Column({ name: 'contact_name', type: 'varchar' })
    contactName: string;

  @Column({ name: 'contact_title', type: 'varchar' })
    contactTitle: string;

  @Column({ name: 'address', type: 'varchar' })
    address: string;

  @Column({ name: 'city', type: 'varchar' })
    city: string;

  @Column({ name: 'postal_code', type: 'varchar', nullable: true })
    postalCode: string | null;

  @Column({ name: 'region', type: 'varchar', nullable: true })
    region: string | null;

  @Column({ name: 'country', type: 'varchar' })
    country: string;

  @Column({ name: 'phone', type: 'varchar' })
    phone: string;

  @Column({ name: 'fax', type: 'varchar', nullable: true })
    fax: string | null;

  @OneToMany(() => Order, (order) => order.customer)
    orders: Order[];
}

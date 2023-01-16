import {
  Entity, Column, OneToMany, PrimaryColumn,
} from 'typeorm';
import { Product } from './products';

@Entity({ name: 'suppliers' })
export class Supplier {
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

  @Column({ name: 'region', type: 'varchar', nullable: true })
    region: string | null;

  @Column({ name: 'postal_code', type: 'varchar' })
    postalCode: string;

  @Column({ name: 'country', type: 'varchar' })
    country: string;

  @Column({ name: 'phone', type: 'varchar' })
    phone: string;

  @OneToMany(() => Product, (product) => product.supplier)
    products: Product[];
}

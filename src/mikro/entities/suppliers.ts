import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Product } from './products';

@Entity({ tableName: 'suppliers' })
export class Supplier {
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

  @Property({ fieldName: 'region', columnType: 'varchar', nullable: true })
    region?: string;

  @Property({ fieldName: 'postal_code' })
    postalCode: string;

  @Property({ fieldName: 'country' })
    country: string;

  @Property({ fieldName: 'phone' })
    phone: string;

  @OneToMany(() => Product, (product) => product.supplier, { cascade: [Cascade.ALL] })
    products = new Collection<Product>(this);
}

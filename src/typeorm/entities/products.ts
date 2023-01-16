import {
  Entity, Column, ManyToOne, JoinColumn, OneToMany, PrimaryColumn,
} from 'typeorm';
import { Supplier } from './suppliers';
import { Detail } from './details';

@Entity({ name: 'products' })
export class Product {
  @PrimaryColumn({ type: 'varchar' })
    id: string;

  @Column({ name: 'name', type: 'varchar' })
    name: string;

  @Column({ name: 'qt_per_unit', type: 'varchar' })
    qtPerUnit: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
    unitPrice: number;

  @Column({ name: 'units_in_stock', type: 'integer' })
    unitsInStock: number;

  @Column({ name: 'units_on_order', type: 'integer'  })
    unitsOnOrder: number;

  @Column({ name: 'reorder_level', type: 'integer'  })
    reorderLevel: number;

  @Column({ name: 'discontinued', type: 'integer'  })
    discontinued: number;

  @Column({ name: 'supplier_id', type: 'varchar'  })
    supplierId: string;
  @ManyToOne(() => Supplier, (supplier) => supplier.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
    supplier: Supplier;

  @OneToMany(() => Detail, (detail) => detail.product)
    details: Detail[];
}

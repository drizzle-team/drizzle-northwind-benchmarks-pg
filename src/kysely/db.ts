interface Customers {
    id: string;
    company_name: string;
    contact_name: string;
    contact_title: string;
    address: string;
    city: string;
    postal_code: string | null;
    region: string | null;
    country: string;
    phone: string;
    fax: string | null;
}

interface Employees {
    id: string;
    last_name: string;
    first_name: string | null;
    title: string;
    title_of_courtesy: string;
    birth_date: Date;
    hire_date: Date;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    home_phone: string;
    extension: number;
    notes: string;
    recipient_id: number | null;
}

interface Orders {
    id: string;
    order_date: Date;
    required_date: Date;
    shipped_date: Date | null;
    ship_via: number;
    freight: number;
    ship_name: string;
    ship_city: string;
    ship_region: string | null;
    ship_postal_code: string | null;
    ship_country: string;
    customer_id: string;
    employee_id: number;
}

interface Suppliers {
    id: string;
    company_name: string;
    contact_name: string;
    contact_title: string;
    address: string;
    city: string;
    region: string | null;
    postal_code: string;
    country: string;
    phone: string;
}

interface Products {
    id: string;
    name: string;
    qt_per_unit: string;
    unit_price: number;
    units_in_stock: number;
    units_on_order: number;
    reorder_level: number;
    discontinued: number;
    supplier_id: number;
}

interface Details {
    id: string,
    unit_price: number;
    quantity: number;
    discount: number;
    order_id: number;
    product_id: number;
}

export interface Database {
    customers: Customers;
    employees: Employees;
    orders: Orders;
    products: Products;
    suppliers: Suppliers;
    order_details: Details;
}

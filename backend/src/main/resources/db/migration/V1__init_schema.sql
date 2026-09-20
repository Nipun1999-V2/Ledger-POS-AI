-- ===================================================================
-- Online POS System - Initial schema
-- ===================================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    role VARCHAR(20) NOT NULL DEFAULT 'CASHIER',   -- ADMIN, MANAGER, CASHIER
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,           -- PRODUCT, RAW_MATERIAL
    description VARCHAR(255),
    UNIQUE (name, type)
);

CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(30),
    email VARCHAR(150),
    address VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Raw materials: the stock a business buys in (fabric, flour, timber, steel, etc.)
CREATE TABLE raw_materials (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category_id BIGINT REFERENCES categories(id),
    supplier_id BIGINT REFERENCES suppliers(id),
    unit VARCHAR(20) NOT NULL,               -- KG, G, L, ML, PCS, METER, BOX ...
    cost_price NUMERIC(14,2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(14,2),             -- filled in when the raw material is also sold directly
    current_stock NUMERIC(14,3) NOT NULL DEFAULT 0,
    min_stock_level NUMERIC(14,3) NOT NULL DEFAULT 0,
    reorder_quantity NUMERIC(14,3) NOT NULL DEFAULT 0,
    sellable_directly BOOLEAN NOT NULL DEFAULT FALSE,   -- can be sold as-is at the POS
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Finished / sellable products (may be manufactured from raw materials via a recipe/BOM)
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category_id BIGINT REFERENCES categories(id),
    unit VARCHAR(20) NOT NULL DEFAULT 'PCS',
    cost_price NUMERIC(14,2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(14,2) NOT NULL,
    current_stock NUMERIC(14,3) NOT NULL DEFAULT 0,
    min_stock_level NUMERIC(14,3) NOT NULL DEFAULT 0,
    reorder_quantity NUMERIC(14,3) NOT NULL DEFAULT 0,
    has_recipe BOOLEAN NOT NULL DEFAULT FALSE,   -- true = consumes raw materials on sale (BOM below)
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Bill of materials: how much of each raw material one unit of a product consumes
CREATE TABLE product_recipe_items (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    raw_material_id BIGINT NOT NULL REFERENCES raw_materials(id),
    quantity_required NUMERIC(14,3) NOT NULL,
    UNIQUE (product_id, raw_material_id)
);

CREATE TABLE sales (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    cashier_id BIGINT REFERENCES users(id),
    customer_name VARCHAR(150),
    customer_phone VARCHAR(30),
    sale_date TIMESTAMP NOT NULL DEFAULT now(),
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax NUMERIC(14,2) NOT NULL DEFAULT 0,
    total NUMERIC(14,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'CASH',   -- CASH, CARD, MOBILE_WALLET, BANK_TRANSFER
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED'        -- COMPLETED, REFUNDED, VOIDED
);

CREATE TABLE sale_items (
    id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL,     -- PRODUCT, RAW_MATERIAL
    item_id BIGINT NOT NULL,
    item_name VARCHAR(150) NOT NULL,    -- snapshot at time of sale
    unit_price NUMERIC(14,2) NOT NULL,
    quantity NUMERIC(14,3) NOT NULL,
    line_total NUMERIC(14,2) NOT NULL
);

CREATE TABLE stock_movements (
    id BIGSERIAL PRIMARY KEY,
    item_type VARCHAR(20) NOT NULL,       -- PRODUCT, RAW_MATERIAL
    item_id BIGINT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    movement_type VARCHAR(20) NOT NULL,   -- PURCHASE_IN, SALE_OUT, ADJUSTMENT, RECIPE_CONSUMPTION, RETURN_IN
    quantity NUMERIC(14,3) NOT NULL,
    balance_after NUMERIC(14,3) NOT NULL,
    reference VARCHAR(100),
    note VARCHAR(255),
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE stock_alerts (
    id BIGSERIAL PRIMARY KEY,
    item_type VARCHAR(20) NOT NULL,
    item_id BIGINT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    current_stock NUMERIC(14,3) NOT NULL,
    min_stock_level NUMERIC(14,3) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',   -- OPEN, RESOLVED
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_item ON sale_items(item_type, item_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_stock_movements_item ON stock_movements(item_type, item_id);
CREATE INDEX idx_stock_alerts_status ON stock_alerts(status);
CREATE INDEX idx_raw_materials_stock ON raw_materials(current_stock);
CREATE INDEX idx_products_stock ON products(current_stock);

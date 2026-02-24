// functions/db-bootstrap-sqls.js

// UPDATE THIS WHOLE FILE 

// 0. Drop tables in dependency order (child → parent)
export const sql00_dropAllTables = `
  DROP TABLE IF EXISTS
    orders,
    products,
    customers
  CASCADE;
`;

// 1. Create tables

export const sql01_createCustomersTable = `
  CREATE TABLE IF NOT EXISTS customers (
    id     SERIAL PRIMARY KEY,
    name   TEXT NOT NULL,
    email  TEXT NOT NULL UNIQUE
  );
`;

export const sql02_createProductTable = `
  CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    price_credits INTEGER NOT NULL,
    image_url     TEXT,
    era        TEXT NOT NULL
  );
`;

export const sql03_createOrdersTable = `
  CREATE TABLE IF NOT EXISTS orders (
    id          SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    product_id  INTEGER NOT NULL REFERENCES products(id),
    quantity    INTEGER NOT NULL DEFAULT 1,
    order_status TEXT NOT NULL DEFAULT 'PLACED',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

// 2. Seed data

export const sql04_seedCustomers = `
  INSERT INTO customers (name, email) VALUES
    ('Alice Baker',   'alice@example.com'),
    ('Bob Dough',     'bob@example.com'),
    ('Cara Crumble',  'cara@example.com')
  ON CONFLICT (email) DO NOTHING;
`;

export const sql05_seedProducts = `
  INSERT INTO products (id, name, description, price_credits, image_url, era) VALUES
    ('Sword',
     'Old Sword',
     275,
     'atgSword.jpg',
     'past'),

    ('Magna Carta',
     'Old Book',
     2875,
     'magnaCarta.png',
     'past'),

     ('Temporal Stabiliser version 7.0',
     'New Gadget',
     9800,
     'temporalStabiliser.jpg',
     'future'),

  ON CONFLICT DO NOTHING;
`;

export const sql06_seedOrders = `
  INSERT INTO orders (customer_id, product_id, quantity, order_status)
  SELECT c.id, p.id, o.quantity, o.order_status
  FROM (
    VALUES
      (1, 1, 2, 'PLACED'),      -- customer 1, Blueberry Muffin
      (1, 3, 1, 'DISPATCHED'),  -- customer 1, Chocolate Brownie
      (2, 8, 1, 'PLACED'),      -- customer 2, Sourdough Loaf
      (3, 10, 2, 'PLACED')      -- customer 3, Victoria Sponge Slice
  ) AS o(customer_idx, product_idx, quantity, order_status)
  JOIN customers c ON c.id = o.customer_idx
  JOIN products  p ON p.id = o.product_idx;
`;

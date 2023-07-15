# ORM PostgreSQL Benchmarks

## General setup

### <a name="installing-node"></a> Installing node

---

```bash
# https://github.com/nvm-sh/nvm#install--update-script
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
# or any minor version for node18+
nvm install 18.13.0
nvm use 18.13.0
```

### <a name="installing-pnpm"></a> Install pnpm

---

```bash
# https://pnpm.io/installation
npm install -g pnpm
```

### <a name="installing-docker"></a> Install docker

---

```bash
# https://docs.docker.com/get-docker/
Use docker guide to install docker on your OS
```

## How to run

To run benchmarks locally just use current command.

> Note: make sure you will have docker running as long as benchmark script will create several docker containers with pg instance inside and run each orm library in new one. To prevent pg caching between different orm's running query

```bash
pnpm run start
```

## Sample Runs (2023-7-14 18:27)

<!--START_SECTION:benchmark-->
```js
cpu: Apple M2
runtime: node v18.15.0 (arm64-darwin)

benchmark                       time (avg)             (min … max)       p75       p99      p995
------------------------------------------------------------------ -----------------------------
• select * from customer
------------------------------------------------------------------ -----------------------------
postgres.js                 767.67 µs/iter   (492.46 µs … 6.67 ms) 803.71 µs   3.15 ms   4.71 ms
drizzle                     903.05 µs/iter   (688.67 µs … 3.92 ms) 933.54 µs    1.9 ms   2.26 ms
drizzle prepared statement    1.79 ms/iter   (982.17 µs … 8.42 ms)   2.34 ms   4.73 ms    5.5 ms
knex                          2.03 ms/iter      (1.13 ms … 5.6 ms)   2.27 ms   2.88 ms   3.24 ms
kysely                        1.81 ms/iter   (854.5 µs … 10.43 ms)   2.22 ms   3.03 ms   5.06 ms
mikro                         2.13 ms/iter      (1.58 ms … 7.4 ms)   2.23 ms   3.36 ms   3.73 ms
typeorm                       1.79 ms/iter     (1.03 ms … 4.02 ms)   1.95 ms   2.58 ms   2.86 ms
prisma                        3.22 ms/iter        (2 ms … 6.13 ms)   3.79 ms   5.51 ms   6.13 ms

summary for select * from customer
  postgres.js
   1.18x faster than drizzle
   2.34x faster than drizzle prepared statement
   2.34x faster than typeorm
   2.36x faster than kysely
   2.65x faster than knex
   2.77x faster than mikro
   4.19x faster than prisma

• select * from customer where id = ?
------------------------------------------------------------------ -----------------------------
postgres.js                  57.48 ms/iter   (49.75 ms … 63.49 ms)  61.67 ms  63.49 ms  63.49 ms
drizzle                      69.16 ms/iter   (57.66 ms … 82.74 ms)  74.54 ms  82.74 ms  82.74 ms
drizzle prepared statement   60.16 ms/iter   (49.28 ms … 67.79 ms)  64.16 ms  67.79 ms  67.79 ms
knex                         31.87 ms/iter   (24.54 ms … 46.87 ms)  32.36 ms  46.87 ms  46.87 ms
kysely                       53.59 ms/iter   (45.27 ms … 67.35 ms)  57.26 ms  67.35 ms  67.35 ms
mikro                        32.62 ms/iter    (30.2 ms … 42.95 ms)  33.41 ms  42.95 ms  42.95 ms
typeorm                      36.18 ms/iter   (32.19 ms … 43.71 ms)  38.55 ms  43.71 ms  43.71 ms
prisma                       41.83 ms/iter   (34.41 ms … 60.76 ms)  48.82 ms  60.76 ms  60.76 ms

summary for select * from customer where id = ?
  knex
   1.02x faster than mikro
   1.14x faster than typeorm
   1.31x faster than prisma
   1.68x faster than kysely
   1.8x faster than postgres.js
   1.89x faster than drizzle prepared statement
   2.17x faster than drizzle

• select * from customer where company_name ilike ?
------------------------------------------------------------------ -----------------------------
postgres.js                  36.98 ms/iter     (33.8 ms … 42.7 ms)  38.67 ms   42.7 ms   42.7 ms
drizzle                      40.34 ms/iter   (32.45 ms … 52.15 ms)  43.63 ms  52.15 ms  52.15 ms
drizzle prepared statement   36.53 ms/iter   (29.87 ms … 42.58 ms)  41.24 ms  42.58 ms  42.58 ms
knex                         24.39 ms/iter   (20.03 ms … 29.32 ms)  28.05 ms  29.32 ms  29.32 ms
kysely                       36.17 ms/iter   (29.62 ms … 42.92 ms)   39.4 ms  42.92 ms  42.92 ms
mikro                        17.69 ms/iter   (12.57 ms … 20.16 ms)  19.29 ms  20.16 ms  20.16 ms
typeorm                      19.81 ms/iter   (15.26 ms … 26.32 ms)  20.06 ms  26.32 ms  26.32 ms
prisma                      121.35 ms/iter  (94.14 ms … 135.25 ms) 133.69 ms 135.25 ms 135.25 ms

summary for select * from customer where company_name ilike ?
  mikro
   1.12x faster than typeorm
   1.38x faster than knex
   2.04x faster than kysely
   2.06x faster than drizzle prepared statement
   2.09x faster than postgres.js
   2.28x faster than drizzle
   6.86x faster than prisma

• "SELECT * FROM employee"
------------------------------------------------------------------ -----------------------------
postgres.js                 462.94 µs/iter   (318.88 µs … 4.81 ms) 495.21 µs    1.1 ms   1.35 ms
drizzle                     363.93 µs/iter (305.38 µs … 642.29 µs) 372.21 µs 499.83 µs 534.67 µs
drizzle prepared statement  416.52 µs/iter   (330.33 µs … 1.54 ms) 452.67 µs 527.58 µs 549.75 µs
knex                        422.12 µs/iter    (279.58 µs … 764 µs) 458.75 µs 597.67 µs 623.75 µs
kysely                       454.4 µs/iter   (324.25 µs … 2.54 ms) 513.63 µs 583.17 µs 620.83 µs
mikro                       496.25 µs/iter   (340.54 µs … 2.42 ms)  571.5 µs   1.11 ms   1.47 ms
typeorm                     471.29 µs/iter (310.83 µs … 893.71 µs) 535.17 µs 683.92 µs 692.38 µs
prisma                      790.81 µs/iter   (497.79 µs … 1.58 ms)  926.5 µs   1.46 ms   1.53 ms

summary for "SELECT * FROM employee"
  drizzle
   1.14x faster than drizzle prepared statement
   1.16x faster than knex
   1.25x faster than kysely
   1.27x faster than postgres.js
   1.3x faster than typeorm
   1.36x faster than mikro
   2.17x faster than prisma

• select * from employee where id = ? left join reportee
------------------------------------------------------------------ -----------------------------
postgres.js                   6.07 ms/iter     (5.1 ms … 14.35 ms)   6.66 ms  14.35 ms  14.35 ms
drizzle                       6.99 ms/iter     (6.28 ms … 15.3 ms)   6.94 ms   15.3 ms   15.3 ms
drizzle prepared statement    6.65 ms/iter     (5.34 ms … 9.17 ms)   7.59 ms   9.17 ms   9.17 ms
knex                           5.2 ms/iter     (4.38 ms … 6.41 ms)   5.51 ms    6.4 ms   6.41 ms
kysely                        6.96 ms/iter      (5.9 ms … 9.47 ms)   7.14 ms   9.47 ms   9.47 ms
mikro                         4.01 ms/iter    (3.37 ms … 11.13 ms)   4.08 ms    7.5 ms  11.13 ms
typeorm                        8.2 ms/iter     (7.68 ms … 8.85 ms)   8.35 ms   8.85 ms   8.85 ms
prisma                        6.53 ms/iter     (6.27 ms … 6.88 ms)   6.59 ms   6.88 ms   6.88 ms

summary for select * from employee where id = ? left join reportee
  mikro
   1.3x faster than knex
   1.51x faster than postgres.js
   1.63x faster than prisma
   1.66x faster than drizzle prepared statement
   1.73x faster than kysely
   1.74x faster than drizzle
   2.04x faster than typeorm

• SELECT * FROM supplier
------------------------------------------------------------------ -----------------------------
postgres.js                 335.61 µs/iter (271.17 µs … 458.79 µs) 349.42 µs 402.13 µs 416.13 µs
drizzle                     421.19 µs/iter   (317.88 µs … 1.61 ms) 462.79 µs 604.88 µs 625.92 µs
drizzle prepared statement  522.36 µs/iter   (311.88 µs … 2.01 ms) 571.29 µs 796.88 µs 837.96 µs
knex                         488.6 µs/iter   (356.33 µs … 2.25 ms) 535.83 µs 717.13 µs 726.21 µs
kysely                      499.04 µs/iter   (356.29 µs … 1.91 ms) 526.71 µs    673 µs 748.63 µs
mikro                       546.35 µs/iter    (379.67 µs … 4.2 ms) 522.29 µs    1.6 ms   1.88 ms
typeorm                     415.62 µs/iter   (350.33 µs … 1.04 ms) 421.04 µs 793.88 µs 928.92 µs
prisma                      494.26 µs/iter (432.08 µs … 562.96 µs) 512.33 µs 550.75 µs 555.33 µs

summary for SELECT * FROM supplier
  postgres.js
   1.24x faster than typeorm
   1.25x faster than drizzle
   1.46x faster than knex
   1.47x faster than prisma
   1.49x faster than kysely
   1.56x faster than drizzle prepared statement
   1.63x faster than mikro

• select * from supplier where id = ?
------------------------------------------------------------------ -----------------------------
postgres.js                  14.87 ms/iter   (13.24 ms … 16.04 ms)  15.33 ms  16.04 ms  16.04 ms
drizzle                      17.56 ms/iter    (14.7 ms … 21.51 ms)  18.85 ms  21.51 ms  21.51 ms
drizzle prepared statement   19.19 ms/iter    (17.2 ms … 23.22 ms)  20.33 ms  23.22 ms  23.22 ms
knex                         10.35 ms/iter     (8.9 ms … 12.65 ms)   10.9 ms  12.65 ms  12.65 ms
kysely                       17.04 ms/iter   (14.68 ms … 22.17 ms)  17.85 ms  22.17 ms  22.17 ms
mikro                        11.51 ms/iter     (9.3 ms … 17.06 ms)  12.64 ms  17.06 ms  17.06 ms
typeorm                      11.79 ms/iter    (9.45 ms … 15.69 ms)  12.61 ms  15.69 ms  15.69 ms
prisma                       35.27 ms/iter   (17.56 ms … 58.61 ms)  41.69 ms  58.61 ms  58.61 ms

summary for select * from supplier where id = ?
  knex
   1.11x faster than mikro
   1.14x faster than typeorm
   1.44x faster than postgres.js
   1.65x faster than kysely
   1.7x faster than drizzle
   1.85x faster than drizzle prepared statement
   3.41x faster than prisma

• SELECT * FROM product
------------------------------------------------------------------ -----------------------------
postgres.js                    1.6 ms/iter   (825.71 µs … 3.09 ms)   1.82 ms    2.2 ms   2.24 ms
drizzle                       2.06 ms/iter     (1.05 ms … 3.85 ms)   2.33 ms   2.51 ms   3.29 ms
drizzle prepared statement    1.99 ms/iter   (953.38 µs … 3.08 ms)   2.16 ms   2.71 ms   2.82 ms
knex                          1.85 ms/iter      (1.07 ms … 2.7 ms)   1.91 ms   2.33 ms   2.68 ms
kysely                        1.87 ms/iter     (1.34 ms … 3.04 ms)   1.91 ms    2.4 ms   2.59 ms
mikro                         2.24 ms/iter     (1.45 ms … 6.96 ms)   2.38 ms   4.49 ms   6.87 ms
typeorm                       1.65 ms/iter     (1.08 ms … 3.01 ms)   1.79 ms   2.95 ms   2.99 ms
prisma                        3.18 ms/iter     (1.79 ms … 4.53 ms)   4.25 ms   4.52 ms   4.53 ms

summary for SELECT * FROM product
  postgres.js
   1.03x faster than typeorm
   1.16x faster than knex
   1.17x faster than kysely
   1.24x faster than drizzle prepared statement
   1.29x faster than drizzle
   1.4x faster than mikro
   1.98x faster than prisma

• SELECT * FROM product LEFT JOIN supplier WHERE product.id = ?
------------------------------------------------------------------ -----------------------------
postgres.js                  50.02 ms/iter   (39.05 ms … 57.29 ms)  55.43 ms  57.29 ms  57.29 ms
drizzle                      152.4 ms/iter (110.29 ms … 227.92 ms) 188.47 ms 227.92 ms 227.92 ms
drizzle prepared statement   59.15 ms/iter    (46.5 ms … 71.72 ms)  61.71 ms  71.72 ms  71.72 ms
knex                         36.89 ms/iter   (29.18 ms … 52.64 ms)  39.31 ms  52.64 ms  52.64 ms
kysely                       56.82 ms/iter   (47.61 ms … 72.36 ms)   60.3 ms  72.36 ms  72.36 ms
mikro                        40.55 ms/iter   (38.15 ms … 50.38 ms)  40.97 ms  50.38 ms  50.38 ms
typeorm                      75.84 ms/iter   (65.99 ms … 84.64 ms)  80.87 ms  84.64 ms  84.64 ms
prisma                       52.15 ms/iter   (42.42 ms … 65.46 ms)  53.71 ms  65.46 ms  65.46 ms

summary for SELECT * FROM product LEFT JOIN supplier WHERE product.id = ?
  knex
   1.1x faster than mikro
   1.36x faster than postgres.js
   1.41x faster than prisma
   1.54x faster than kysely
   1.6x faster than drizzle prepared statement
   2.06x faster than typeorm
   4.13x faster than drizzle

• SELECT * FROM product WHERE product.name ILIKE ?
------------------------------------------------------------------ -----------------------------
postgres.js                     37 ms/iter   (32.74 ms … 39.94 ms)  38.11 ms  39.94 ms  39.94 ms
drizzle                      41.54 ms/iter   (31.71 ms … 51.75 ms)  47.87 ms  51.75 ms  51.75 ms
drizzle prepared statement   37.96 ms/iter    (32.8 ms … 41.32 ms)  40.37 ms  41.32 ms  41.32 ms
knex                         24.65 ms/iter   (20.06 ms … 27.96 ms)  26.35 ms  27.96 ms  27.96 ms
kysely                       37.65 ms/iter   (30.56 ms … 42.86 ms)  40.09 ms  42.86 ms  42.86 ms
mikro                        37.08 ms/iter   (20.34 ms … 70.56 ms)  47.12 ms  70.56 ms  70.56 ms
typeorm                      23.53 ms/iter    (19.26 ms … 28.1 ms)  25.82 ms   28.1 ms   28.1 ms
prisma                      105.65 ms/iter  (68.89 ms … 116.25 ms) 114.04 ms 116.25 ms 116.25 ms

summary for SELECT * FROM product WHERE product.name ILIKE ?
  typeorm
   1.05x faster than knex
   1.57x faster than postgres.js
   1.58x faster than mikro
   1.6x faster than kysely
   1.61x faster than drizzle prepared statement
   1.77x faster than drizzle
   4.49x faster than prisma

• select all order with sum and count
------------------------------------------------------------------ -----------------------------
postgres.js                   6.38 ms/iter     (5.19 ms … 9.21 ms)    6.6 ms   9.21 ms   9.21 ms
drizzle                       9.62 ms/iter    (7.87 ms … 14.32 ms)  10.43 ms  14.32 ms  14.32 ms
drizzle prepared statement    8.13 ms/iter     (5.4 ms … 10.36 ms)   8.41 ms  10.36 ms  10.36 ms
knex                          6.22 ms/iter     (3.17 ms … 9.85 ms)   6.99 ms   9.85 ms   9.85 ms
kysely                         6.5 ms/iter     (5.19 ms … 9.36 ms)   6.61 ms   9.36 ms   9.36 ms
mikro                        35.72 ms/iter   (32.01 ms … 43.56 ms)  36.41 ms  43.56 ms  43.56 ms
typeorm                      13.87 ms/iter   (12.77 ms … 17.44 ms)  14.21 ms  17.44 ms  17.44 ms
prisma                        34.1 ms/iter   (30.04 ms … 37.49 ms)  35.45 ms  37.49 ms  37.49 ms

summary for select all order with sum and count
  knex
   1.02x faster than postgres.js
   1.04x faster than kysely
   1.31x faster than drizzle prepared statement
   1.55x faster than drizzle
   2.23x faster than typeorm
   5.48x faster than prisma
   5.74x faster than mikro

• select order with sum and count using limit with offset
------------------------------------------------------------------ -----------------------------
postgres.js                  39.13 ms/iter   (36.48 ms … 40.69 ms)  39.63 ms  40.69 ms  40.69 ms
drizzle                      68.93 ms/iter   (59.42 ms … 77.08 ms)  72.32 ms  77.08 ms  77.08 ms
drizle prepared statement    58.86 ms/iter   (45.36 ms … 75.58 ms)  61.95 ms  75.58 ms  75.58 ms
knex                         60.38 ms/iter   (52.75 ms … 69.36 ms)  62.04 ms  69.36 ms  69.36 ms
kysely                       49.71 ms/iter   (35.64 ms … 74.73 ms)  54.76 ms  74.73 ms  74.73 ms
mikro                       142.24 ms/iter  (99.91 ms … 167.65 ms) 150.58 ms 167.65 ms 167.65 ms
typeorm                     142.67 ms/iter (103.62 ms … 166.65 ms) 148.63 ms 166.65 ms 166.65 ms
prisma                      131.97 ms/iter  (112.9 ms … 149.22 ms) 139.24 ms 149.22 ms 149.22 ms

summary for select order with sum and count using limit with offset
  postgres.js
   1.27x faster than kysely
   1.5x faster than drizle prepared statement
   1.54x faster than knex
   1.76x faster than drizzle
   3.37x faster than prisma
   3.64x faster than mikro
   3.65x faster than typeorm

• select order where order.id = ? with sum and count
------------------------------------------------------------------ -----------------------------
postgres.js                  27.27 ms/iter   (25.54 ms … 38.05 ms)  26.86 ms  38.05 ms  38.05 ms
drizzle                      38.98 ms/iter   (33.66 ms … 66.14 ms)  42.71 ms  66.14 ms  66.14 ms
drizzle prepared statement   28.57 ms/iter   (26.09 ms … 40.86 ms)  28.52 ms  40.86 ms  40.86 ms
knex                         21.13 ms/iter   (19.08 ms … 31.05 ms)  21.87 ms  31.05 ms  31.05 ms
kysely                       36.02 ms/iter   (28.18 ms … 51.47 ms)  40.38 ms  51.47 ms  51.47 ms
mikro                        45.04 ms/iter   (42.96 ms … 55.09 ms)  45.34 ms  55.09 ms  55.09 ms
prisma                       33.85 ms/iter   (30.18 ms … 41.52 ms)  36.08 ms  41.52 ms  41.52 ms
typeorm                         47 ms/iter   (42.94 ms … 56.11 ms)  47.51 ms  56.11 ms  56.11 ms

summary for select order where order.id = ? with sum and count
  knex
   1.29x faster than postgres.js
   1.35x faster than drizzle prepared statement
   1.6x faster than prisma
   1.7x faster than kysely
   1.84x faster than drizzle
   2.13x faster than mikro
   2.22x faster than typeorm

• SELECT * FROM order_detail WHERE order_id = ?
------------------------------------------------------------------ -----------------------------
postgres.js                 188.55 ms/iter (159.77 ms … 212.37 ms) 194.77 ms 212.37 ms 212.37 ms
drizzle                     558.96 ms/iter (458.14 ms … 661.83 ms)  587.2 ms 661.83 ms 661.83 ms
drizzle prepared statement  202.39 ms/iter (167.57 ms … 221.39 ms) 206.07 ms 221.39 ms 221.39 ms
knex                         153.2 ms/iter  (134.46 ms … 206.1 ms)  147.5 ms  206.1 ms  206.1 ms
kysely                      219.82 ms/iter (197.93 ms … 241.15 ms) 223.86 ms 241.15 ms 241.15 ms
mikro                          1.08 s/iter    (969.88 ms … 1.13 s)    1.12 s    1.13 s    1.13 s
typeorm                     651.53 ms/iter (522.92 ms … 745.13 ms)  691.9 ms 745.13 ms 745.13 ms
prisma                      887.07 ms/iter       (793.67 ms … 1 s) 986.41 ms       1 s       1 s

summary for SELECT * FROM order_detail WHERE order_id = ?
  knex
   1.23x faster than postgres.js
   1.32x faster than drizzle prepared statement
   1.43x faster than kysely
   3.65x faster than drizzle
   4.25x faster than typeorm
   5.79x faster than prisma
   7.02x faster than mikro
```
<!--END_SECTION:benchmark-->

### Latest Run Environment

```sh

  System:
    OS: macOS 14.0
    CPU: (8) arm64 Apple M2
    Memory: 49.06 MB / 8.00 GB
    Shell: 5.9 - /bin/zsh
  Binaries:
    Node: 18.15.0 - ~/Library/Caches/fnm_multishells/3967_1689334596120/bin/node
    npm: 9.5.0 - ~/Library/Caches/fnm_multishells/3967_1689334596120/bin/npm
    pnpm: 8.6.7 - ~/Library/pnpm/pnpm
  npmPackages:
    @mikro-orm/core: 5.7.12 => 5.7.12
    @mikro-orm/postgresql: 5.7.12 => 5.7.12
    @mikro-orm/reflection: 5.7.12 => 5.7.12
    @prisma/client: 5.0.0 => 5.0.0
    @types/dockerode: 3.3.19 => 3.3.19
    @types/pg: 8.10.2 => 8.10.2
    @types/uuid: 9.0.2 => 9.0.2
    @typescript-eslint/eslint-plugin: ^5.50.0 => 5.50.0
    dockerode: 3.3.5 => 3.3.5
    dotenv: 16.3.1 => 16.3.1
    drizzle-orm: 0.27.2 => 0.27.2
    eslint: 8.44.0 => 8.44.0
    eslint-config-prettier: 8.8.0 => 8.8.0
    eslint-config-standard-with-typescript: 36.0.0 => 36.0.0
    eslint-plugin-import: ^2.27.5 => 2.27.5
    eslint-plugin-n: ^15.0.0 => 15.0.0
    eslint-plugin-promise: ^6.1.1 => 6.1.1
    get-port: 7.0.0 => 7.0.0
    knex: 2.5.1 => 2.5.1
    kysely: 0.26.1 => 0.26.1
    kysely-postgres-js: 1.1.1 => 1.1.1
    mitata: 0.1.6 => 0.1.6
    pg: 8.11.1 => 8.11.1
    postgres: 3.3.5 => 3.3.5
    prettier: 3.0.0 => 3.0.0
    prisma: 5.0.0 => 5.0.0
    tsx: 3.12.7 => 3.12.7
    typeorm: 0.3.17 => 0.3.17
    typescript: 5.1.6 => 5.1.6
    uuid: 9.0.0 => 9.0.0


```

# General setup

### <a name="installing-node"></a> Installing node
---
```bash
# https://github.com/nvm-sh/nvm#install--update-script
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
nvm install 17.0.1
nvm use 17.0.1
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

# How to run
To run benchmarks locally just use current command.

> Note: make sure you will have docker running as long as benchmark script will create several docker containers with pg instance inside and run each orm library in new one. To prevent pg caching between different orm's running query

```bash
pnpm run start
```

# Sample runs 
```text
cpu: Apple M1
runtime: node v18.13.0 (x64-darwin)

benchmark      time (avg)             (min … max)       p75       p99      p995
------------------------------------------------- -----------------------------
• select * from customer
------------------------------------------------- -----------------------------
pg           2.66 ms/iter    (1.04 ms … 42.77 ms)    2.7 ms  33.58 ms  42.77 ms
pg:p         3.18 ms/iter     (1.1 ms … 30.46 ms)   3.54 ms  16.74 ms  30.46 ms
drizzle      8.38 ms/iter   (1.52 ms … 119.66 ms)   7.07 ms 119.66 ms 119.66 ms
drizzle:p    1.76 ms/iter  (978.83 µs … 17.49 ms)   1.84 ms   5.74 ms   5.84 ms
knex         1.69 ms/iter  (899.67 µs … 11.69 ms)   1.83 ms    4.2 ms   7.59 ms
kysely       2.95 ms/iter    (1.05 ms … 29.61 ms)   3.11 ms  26.55 ms  29.61 ms
mikro        6.63 ms/iter    (2.16 ms … 56.53 ms)   7.85 ms  56.53 ms  56.53 ms
typeorm      2.98 ms/iter    (1.52 ms … 12.95 ms)   3.08 ms  11.76 ms  12.95 ms
prisma       3.43 ms/iter     (2.37 ms … 9.21 ms)   3.49 ms   8.72 ms   9.21 ms

summary for select * from customer
  knex
   1.04x faster than drizzle:p
   1.57x faster than pg
   1.75x faster than kysely
   1.77x faster than typeorm
   1.88x faster than pg:p
   2.03x faster than prisma
   3.93x faster than mikro
   4.96x faster than drizzle

• select * from customer where id = ?
------------------------------------------------- -----------------------------
pg         111.26 ms/iter  (82.23 ms … 143.88 ms) 127.24 ms 143.88 ms 143.88 ms
pg:p       106.75 ms/iter  (83.67 ms … 191.55 ms) 111.33 ms 191.55 ms 191.55 ms
drizzle    130.49 ms/iter (108.13 ms … 201.81 ms) 127.73 ms 201.81 ms 201.81 ms
drizzle:p   92.47 ms/iter  (80.57 ms … 108.48 ms)  99.18 ms 108.48 ms 108.48 ms
knex        117.4 ms/iter  (82.29 ms … 223.48 ms) 125.89 ms 223.48 ms 223.48 ms
kysely     111.69 ms/iter  (78.33 ms … 177.55 ms) 122.29 ms 177.55 ms 177.55 ms
mikro      122.55 ms/iter  (99.11 ms … 199.75 ms) 125.99 ms 199.75 ms 199.75 ms
typeorm    117.89 ms/iter   (88.3 ms … 155.82 ms) 146.56 ms 155.82 ms 155.82 ms
prisma     184.46 ms/iter (123.07 ms … 338.22 ms) 211.13 ms 338.22 ms 338.22 ms

summary for select * from customer where id = ?
  drizzle:p
   1.15x faster than pg:p
   1.2x faster than pg
   1.21x faster than kysely
   1.27x faster than knex
   1.27x faster than typeorm
   1.33x faster than mikro
   1.41x faster than drizzle
   1.99x faster than prisma

• select * from customer where company_name ilike ?
------------------------------------------------- -----------------------------
pg          69.87 ms/iter   (56.02 ms … 147.9 ms)  69.04 ms  147.9 ms  147.9 ms
pg:p        90.12 ms/iter  (50.23 ms … 259.53 ms)  73.97 ms 259.53 ms 259.53 ms
drizzle     91.09 ms/iter  (47.11 ms … 285.87 ms) 123.06 ms 285.87 ms 285.87 ms
drizzle:p   58.25 ms/iter  (43.55 ms … 113.52 ms)  59.08 ms 113.52 ms 113.52 ms
knex        80.13 ms/iter  (50.95 ms … 125.36 ms)  87.74 ms 125.36 ms 125.36 ms
kysely      70.89 ms/iter  (55.68 ms … 101.36 ms)  73.47 ms 101.36 ms 101.36 ms
mikro      130.42 ms/iter  (71.16 ms … 211.76 ms) 141.58 ms 211.76 ms 211.76 ms
typeorm    100.83 ms/iter  (70.18 ms … 228.38 ms) 102.09 ms 228.38 ms 228.38 ms
prisma     108.91 ms/iter  (70.47 ms … 202.51 ms) 141.28 ms 202.51 ms 202.51 ms

summary for select * from customer where company_name ilike ?
  drizzle:p
   1.2x faster than pg
   1.22x faster than kysely
   1.38x faster than knex
   1.55x faster than pg:p
   1.56x faster than drizzle
   1.73x faster than typeorm
   1.87x faster than prisma
   2.24x faster than mikro

• "SELECT * FROM employee"
------------------------------------------------- -----------------------------
pg           1.21 ms/iter  (722.63 µs … 11.89 ms)   1.17 ms   5.09 ms   7.23 ms
pg:p         1.48 ms/iter  (736.54 µs … 22.24 ms)   1.37 ms  10.59 ms  14.28 ms
drizzle      1.42 ms/iter  (730.71 µs … 22.13 ms)   1.44 ms   6.08 ms  14.41 ms
drizzle:p    1.09 ms/iter   (682.71 µs … 4.81 ms)   1.15 ms    3.1 ms   3.56 ms
knex         1.31 ms/iter   (713.33 µs … 4.27 ms)   1.51 ms   2.82 ms   2.99 ms
kysely       1.36 ms/iter   (653.75 µs … 7.99 ms)   1.51 ms   4.64 ms   7.08 ms
mikro        2.97 ms/iter     (1.74 ms … 8.02 ms)   3.24 ms   7.87 ms   8.02 ms
typeorm      2.21 ms/iter   (935.5 µs … 40.27 ms)   2.12 ms  17.86 ms  19.91 ms
prisma       1.89 ms/iter     (1.12 ms … 4.93 ms)   2.26 ms   4.22 ms   4.26 ms

summary for "SELECT * FROM employee"
  drizzle:p
   1.11x faster than pg
   1.2x faster than knex
   1.25x faster than kysely
   1.31x faster than drizzle
   1.36x faster than pg:p
   1.73x faster than prisma
   2.03x faster than typeorm
   2.72x faster than mikro

• select * from employee where id = ? left join reportee
------------------------------------------------- -----------------------------
pg           9.94 ms/iter    (6.88 ms … 22.33 ms)  10.89 ms  22.33 ms  22.33 ms
pg:p        12.07 ms/iter    (6.52 ms … 67.09 ms)  13.78 ms  67.09 ms  67.09 ms
drizzle     15.21 ms/iter    (9.25 ms … 31.98 ms)  20.06 ms  31.98 ms  31.98 ms
drizzle:p    9.27 ms/iter    (6.68 ms … 23.71 ms)  10.42 ms  23.71 ms  23.71 ms
knex        12.06 ms/iter    (8.34 ms … 27.93 ms)  12.27 ms  27.93 ms  27.93 ms
kysely      13.79 ms/iter    (8.16 ms … 57.99 ms)   13.6 ms  57.99 ms  57.99 ms
mikro       15.35 ms/iter   (10.47 ms … 27.56 ms)   17.6 ms  27.56 ms  27.56 ms
typeorm     46.03 ms/iter  (25.99 ms … 123.24 ms)  54.07 ms 123.24 ms 123.24 ms
prisma      23.44 ms/iter   (17.18 ms … 33.96 ms)  25.88 ms  33.96 ms  33.96 ms

summary for select * from employee where id = ? left join reportee
  drizzle:p
   1.07x faster than pg
   1.3x faster than knex
   1.3x faster than pg:p
   1.49x faster than kysely
   1.64x faster than drizzle
   1.66x faster than mikro
   2.53x faster than prisma
   4.96x faster than typeorm

• SELECT * FROM supplier
------------------------------------------------- -----------------------------
pg           1.19 ms/iter   (771.58 µs … 3.18 ms)   1.27 ms      2 ms   2.31 ms
pg:p         1.35 ms/iter   (813.5 µs … 11.92 ms)   1.22 ms   6.45 ms  11.54 ms
drizzle      1.31 ms/iter   (838.08 µs … 4.47 ms)    1.4 ms   2.71 ms   4.18 ms
drizzle:p    1.13 ms/iter    (786.5 µs … 3.34 ms)   1.19 ms   2.14 ms   2.24 ms
knex         1.26 ms/iter   (902.42 µs … 4.03 ms)   1.36 ms    2.2 ms   2.39 ms
kysely       1.85 ms/iter  (867.71 µs … 12.75 ms)   1.77 ms  11.95 ms  12.36 ms
mikro        3.03 ms/iter    (1.31 ms … 57.96 ms)   2.83 ms  19.42 ms  57.96 ms
typeorm      1.52 ms/iter     (1.08 ms … 5.13 ms)   1.53 ms   4.38 ms   4.49 ms
prisma        1.8 ms/iter     (1.41 ms … 3.34 ms)   1.89 ms    2.7 ms      3 ms

summary for SELECT * FROM supplier
  drizzle:p
   1.05x faster than pg
   1.12x faster than knex
   1.15x faster than drizzle
   1.19x faster than pg:p
   1.34x faster than typeorm
   1.59x faster than prisma
   1.63x faster than kysely
   2.68x faster than mikro

• select * from supplier where id = ?
------------------------------------------------- -----------------------------
pg           39.5 ms/iter   (22.15 ms … 84.52 ms)  37.48 ms  84.52 ms  84.52 ms
pg:p        33.25 ms/iter  (21.44 ms … 133.69 ms)   30.1 ms 133.69 ms 133.69 ms
drizzle     37.45 ms/iter   (28.81 ms … 87.89 ms)  36.12 ms  87.89 ms  87.89 ms
drizzle:p   26.87 ms/iter       (21 ms … 46.7 ms)  27.67 ms   46.7 ms   46.7 ms
knex         37.5 ms/iter  (24.37 ms … 115.04 ms)  36.63 ms 115.04 ms 115.04 ms
kysely      32.98 ms/iter   (24.66 ms … 67.13 ms)  35.03 ms  67.13 ms  67.13 ms
mikro       73.34 ms/iter  (29.19 ms … 380.66 ms)  67.14 ms 380.66 ms 380.66 ms
typeorm     51.22 ms/iter   (30.38 ms … 267.4 ms)  45.08 ms  267.4 ms  267.4 ms
prisma      41.92 ms/iter   (30.78 ms … 56.61 ms)   50.9 ms  56.61 ms  56.61 ms

summary for select * from supplier where id = ?
  drizzle:p
   1.23x faster than kysely
   1.24x faster than pg:p
   1.39x faster than drizzle
   1.4x faster than knex
   1.47x faster than pg
   1.56x faster than prisma
   1.91x faster than typeorm
   2.73x faster than mikro

• SELECT * FROM product
------------------------------------------------- -----------------------------
pg           2.98 ms/iter     (1.18 ms … 11.6 ms)   3.59 ms   7.63 ms   11.6 ms
pg:p         1.72 ms/iter   (957.29 µs … 7.49 ms)   1.96 ms   4.59 ms      7 ms
drizzle      1.65 ms/iter     (1.06 ms … 6.13 ms)   1.91 ms   3.27 ms   4.26 ms
drizzle:p    1.81 ms/iter  (993.17 µs … 66.87 ms)   1.47 ms   7.72 ms   19.1 ms
knex         3.24 ms/iter      (1.6 ms … 7.32 ms)   3.64 ms   6.95 ms   7.32 ms
kysely       3.64 ms/iter     (1.8 ms … 17.42 ms)   4.18 ms  11.65 ms  17.42 ms
mikro        6.69 ms/iter    (3.06 ms … 15.81 ms)   7.71 ms  15.81 ms  15.81 ms
typeorm      6.51 ms/iter     (2.8 ms … 56.85 ms)   5.91 ms  56.85 ms  56.85 ms
prisma       6.51 ms/iter    (4.13 ms … 11.88 ms)   7.12 ms  11.88 ms  11.88 ms

summary for SELECT * FROM product
  drizzle
   1.05x faster than pg:p
   1.1x faster than drizzle:p
   1.81x faster than pg
   1.96x faster than knex
   2.21x faster than kysely
   3.95x faster than prisma
   3.95x faster than typeorm
   4.06x faster than mikro

• SELECT * FROM product LEFT JOIN supplier WHERE product.id = ?
------------------------------------------------- -----------------------------
pg         101.48 ms/iter   (68.1 ms … 180.85 ms) 115.62 ms 180.85 ms 180.85 ms
pg:p        95.17 ms/iter  (60.29 ms … 216.46 ms)  98.02 ms 216.46 ms 216.46 ms
drizzle     108.1 ms/iter  (91.67 ms … 200.25 ms) 104.39 ms 200.25 ms 200.25 ms
drizzle:p   80.01 ms/iter  (59.36 ms … 148.66 ms)  78.74 ms 148.66 ms 148.66 ms
knex       105.12 ms/iter   (78.6 ms … 164.04 ms) 107.93 ms 164.04 ms 164.04 ms
kysely      93.93 ms/iter   (88.51 ms … 97.61 ms)  96.43 ms  97.61 ms  97.61 ms
mikro      163.53 ms/iter (112.09 ms … 232.31 ms) 189.16 ms 232.31 ms 232.31 ms
typeorm    277.87 ms/iter (225.82 ms … 317.05 ms) 306.89 ms 317.05 ms 317.05 ms
prisma     267.18 ms/iter (200.32 ms … 333.29 ms) 292.96 ms 333.29 ms 333.29 ms

summary for SELECT * FROM product LEFT JOIN supplier WHERE product.id = ?
  drizzle:p
   1.17x faster than kysely
   1.19x faster than pg:p
   1.27x faster than pg
   1.31x faster than knex
   1.35x faster than drizzle
   2.04x faster than mikro
   3.34x faster than prisma
   3.47x faster than typeorm

• SELECT * FROM product WHERE product.name ILIKE ?
------------------------------------------------- -----------------------------
pg          52.34 ms/iter   (43.27 ms … 61.92 ms)  57.39 ms  61.92 ms  61.92 ms
pg:p        50.24 ms/iter   (44.58 ms … 57.74 ms)  51.37 ms  57.74 ms  57.74 ms
drizzle     66.68 ms/iter  (44.34 ms … 133.29 ms)  76.31 ms 133.29 ms 133.29 ms
drizzle:p   56.94 ms/iter  (48.92 ms … 117.31 ms)  55.18 ms 117.31 ms 117.31 ms
knex        71.52 ms/iter  (51.33 ms … 184.71 ms)  74.42 ms 184.71 ms 184.71 ms
kysely      81.99 ms/iter  (53.12 ms … 187.72 ms)  89.28 ms 187.72 ms 187.72 ms
mikro      141.46 ms/iter  (85.68 ms … 251.83 ms) 170.57 ms 251.83 ms 251.83 ms
typeorm     91.46 ms/iter  (75.51 ms … 155.69 ms)  96.68 ms 155.69 ms 155.69 ms
prisma     180.99 ms/iter (125.24 ms … 316.46 ms) 175.25 ms 316.46 ms 316.46 ms

summary for SELECT * FROM product WHERE product.name ILIKE ?
  pg:p
   1.04x faster than pg
   1.13x faster than drizzle:p
   1.33x faster than drizzle
   1.42x faster than knex
   1.63x faster than kysely
   1.82x faster than typeorm
   2.82x faster than mikro
   3.6x faster than prisma

• select all order with sum and count
------------------------------------------------- -----------------------------
pg            6.6 ms/iter    (3.71 ms … 49.63 ms)   7.08 ms  49.63 ms  49.63 ms
pg:p          5.3 ms/iter    (3.29 ms … 15.01 ms)   5.96 ms  13.59 ms  15.01 ms
drizzle      5.75 ms/iter     (4.18 ms … 9.99 ms)   6.23 ms   9.99 ms   9.99 ms
drizzle:p     5.4 ms/iter    (3.83 ms … 10.04 ms)    5.8 ms   9.55 ms  10.04 ms
knex         8.12 ms/iter    (4.11 ms … 34.04 ms)   8.12 ms  34.04 ms  34.04 ms
kysely       5.54 ms/iter    (3.97 ms … 10.38 ms)   6.59 ms   8.83 ms  10.38 ms
mikro      197.91 ms/iter (167.61 ms … 331.46 ms) 191.09 ms 331.46 ms 331.46 ms
typeorm     27.58 ms/iter    (23.7 ms … 34.43 ms)  28.41 ms  34.43 ms  34.43 ms
prisma      60.32 ms/iter  (52.02 ms … 107.18 ms)  61.24 ms 107.18 ms 107.18 ms

summary for select all order with sum and count
  pg:p
   1.02x faster than drizzle:p
   1.05x faster than kysely
   1.09x faster than drizzle
   1.25x faster than pg
   1.53x faster than knex
   5.21x faster than typeorm
   11.39x faster than prisma
   37.37x faster than mikro

• select order with sum and count using limit with offset
------------------------------------------------- -----------------------------
pg          57.29 ms/iter    (49.2 ms … 93.95 ms)   58.7 ms  93.95 ms  93.95 ms
pg:p        56.44 ms/iter   (50.58 ms … 87.78 ms)  55.49 ms  87.78 ms  87.78 ms
drizzle     59.39 ms/iter  (44.63 ms … 114.36 ms)  61.18 ms 114.36 ms 114.36 ms
drizle:p    52.06 ms/iter   (46.11 ms … 66.06 ms)  54.18 ms  66.06 ms  66.06 ms
knex        56.62 ms/iter      (47.35 ms … 97 ms)  59.13 ms     97 ms     97 ms
kysely      56.48 ms/iter  (49.37 ms … 100.97 ms)  57.98 ms 100.97 ms 100.97 ms
mikro      160.83 ms/iter (124.71 ms … 238.05 ms) 180.83 ms 238.05 ms 238.05 ms
typeorm    107.87 ms/iter  (91.32 ms … 174.22 ms) 110.64 ms 174.22 ms 174.22 ms
prisma     114.35 ms/iter  (98.28 ms … 161.81 ms) 122.01 ms 161.81 ms 161.81 ms

summary for select order with sum and count using limit with offset
  drizle:p
   1.08x faster than pg:p
   1.09x faster than kysely
   1.09x faster than knex
   1.1x faster than pg
   1.14x faster than drizzle
   2.07x faster than typeorm
   2.2x faster than prisma
   3.09x faster than mikro

• select order where order.id = ? with sum and count
------------------------------------------------- -----------------------------
pg          63.35 ms/iter  (48.77 ms … 104.83 ms)  64.15 ms 104.83 ms 104.83 ms
pg:p        54.37 ms/iter   (40.97 ms … 99.41 ms)  54.38 ms  99.41 ms  99.41 ms
drizzle     58.76 ms/iter   (51.52 ms … 76.24 ms)  61.21 ms  76.24 ms  76.24 ms
drizzle:p   46.61 ms/iter   (38.96 ms … 54.62 ms)  51.04 ms  54.62 ms  54.62 ms
knex        57.72 ms/iter   (53.77 ms … 62.54 ms)  59.83 ms  62.54 ms  62.54 ms
kysely      56.93 ms/iter   (49.57 ms … 70.77 ms)  59.26 ms  70.77 ms  70.77 ms
mikro      138.81 ms/iter (113.25 ms … 263.33 ms) 137.17 ms 263.33 ms 263.33 ms
prisma      89.73 ms/iter  (80.33 ms … 103.21 ms)  91.08 ms 103.21 ms 103.21 ms
typeorm     140.7 ms/iter (123.75 ms … 221.22 ms) 141.45 ms 221.22 ms 221.22 ms

summary for select order where order.id = ? with sum and count
  drizzle:p
   1.17x faster than pg:p
   1.22x faster than kysely
   1.24x faster than knex
   1.26x faster than drizzle
   1.36x faster than pg
   1.93x faster than prisma
   2.98x faster than mikro
   3.02x faster than typeorm

• SELECT * FROM order_detail WHERE order_id = ?
------------------------------------------------- -----------------------------
pg         235.75 ms/iter (200.16 ms … 308.49 ms) 237.78 ms 308.49 ms 308.49 ms
pg:p       224.74 ms/iter    (186 ms … 335.61 ms) 219.28 ms 335.61 ms 335.61 ms
drizzle    279.71 ms/iter  (258.3 ms … 338.51 ms) 268.15 ms 338.51 ms 338.51 ms
drizzle:p  213.52 ms/iter (199.68 ms … 261.62 ms)  211.5 ms 261.62 ms 261.62 ms
knex       270.84 ms/iter  (256.77 ms … 340.4 ms) 268.92 ms  340.4 ms  340.4 ms
kysely     270.46 ms/iter  (235.6 ms … 321.93 ms) 288.65 ms 321.93 ms 321.93 ms
mikro      862.84 ms/iter    (570.71 ms … 1.43 s)    1.06 s    1.43 s    1.43 s
typeorm    478.49 ms/iter (310.02 ms … 686.99 ms) 506.64 ms 686.99 ms 686.99 ms
prisma        1.08 s/iter     (913.1 ms … 1.29 s)    1.15 s    1.29 s    1.29 s

summary for SELECT * FROM order_detail WHERE order_id = ?
  drizzle:p
   1.05x faster than pg:p
   1.1x faster than pg
   1.27x faster than kysely
   1.27x faster than knex
   1.31x faster than drizzle
   2.24x faster than typeorm
   4.04x faster than mikro
   5.08x faster than prisma
```
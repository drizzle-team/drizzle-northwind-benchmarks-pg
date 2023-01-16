import Docker from "dockerode";
import { v4 as uuid } from "uuid";
import getPort from "get-port";
import pkg from "pg";
import path from "node:path";
import fs from "fs";

export interface DockerDBs {
  pgContainer: Docker.Container;
  port: number;
}

export const ports = {
  pg: 55000,
  pgPrepared: 55001,
  drizzle: 55002,
  drizzlePrepared: 55003,
  knex: 55004,
  kysely: 55005,
  typeOrm: 55006,
  mikroOrm: 55007,
  prismaOrm: 55008,
};

export async function createDockerDBs(ports: {
  [key: string]: number;
}): Promise<DockerDBs[]> {
  const docker = new Docker();
  const image = "postgres";
  const pullStream = await docker.pull(image);
	await new Promise((resolve, reject) =>
		docker.modem.followProgress(pullStream, (err) => (err ? reject(err) : resolve(err)))
	);
  const dockerDBs: DockerDBs[] = [];
  await Promise.all(
    Object.values(ports).map(async (port) => {
      const pgContainer = await docker.createContainer({
        Image: image,
        Env: [
          "POSTGRES_PASSWORD=postgres",
          "POSTGRES_USER=postgres",
          "POSTGRES_DB=postgres",
        ],
        name: `benchmarks-tests-${uuid()}`,
        HostConfig: {
          AutoRemove: true,
          PortBindings: {
            "5432/tcp": [{ HostPort: `${port}` }],
          },
        },
      });
      await pgContainer.start();
      dockerDBs.push({ pgContainer, port });
    })
  );

  await addDataToDB(dockerDBs);
  return dockerDBs;
}

export const addDataToDB = async (dockerDBs: DockerDBs[]) => {
  const sql_script = fs.readFileSync(path.resolve("data/init-db.sql"), "utf-8");
  await Promise.all(
    dockerDBs.map(async (dockerDb) => {
      const connectionString = `postgres://postgres:postgres@localhost:${dockerDb.port}/postgres`;
      let sleep = 250;
      let timeLeft = 5000;
      let connected = false;
      let lastError: unknown | undefined;
      const pool = new pkg.Pool({ connectionString });
      do {
        try {
          await pool.connect();
          connected = true;
          break;
        } catch (e) {
          lastError = e;
          await new Promise((resolve) => setTimeout(resolve, sleep));
          timeLeft -= sleep;
        }
      } while (timeLeft > 0);
      if (!connected) {
        console.error("Cannot connect to Postgres");
        throw lastError;
      }
      await pool.query(sql_script);
    })
  );
};

export const deleteDockerDBs = async (dockerDBs: DockerDBs[]) => {
  await Promise.all(
    dockerDBs.map(async (dockerDB) => {
      await dockerDB.pgContainer.stop().catch(console.error);
    })
  );
};

import mySql from "mysql2/promise";

const pool = mySql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    connectionLimit: 50,
    waitForConnections: true,
    maxIdle: 10
});

export const ExecuteQuery = async (query, params) => {
    try {
        return await pool.query(query, params);
    } catch (e) {
        console.error(`${new Date().toISOString()} - Database Error: `, e);
        console.error(`Query: ${query}`);
        console.error(`Params: ${JSON.stringify(params)}`);
        throw e;
    }
}

export const ExecuteTransaction = async (queries) => {
    let connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        for (const query of queries) {
            await connection.query(query.string, query.params);
        }
        await connection.commit();
    } catch (e) {
        await connection.rollback();
        console.error(`${new Date().toISOString()} - Database Transaction Error: `, e);
        console.error(`Queries: ${JSON.stringify(queries)}`);
        throw e;
    } finally {
        pool.releaseConnection(connection);
    }
}
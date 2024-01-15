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
    return pool.query(query, params);
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
        console.error(e);
        throw e;
    } finally {
        pool.releaseConnection(connection);
    }
}
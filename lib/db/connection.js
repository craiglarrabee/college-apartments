import mySql from "mysql2/promise";

const ConnectionPool = async () => {
    const pool = await mySql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB,
        user: process.env.DB_USER,
        password: process.env.DB_PWD
    });
    return pool;
}

export default ConnectionPool;
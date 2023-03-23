import mySql from "mysql2/promise";

const pool = mySql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    connectionLimit: 30
});

const Pool = () => {
    return pool;
}

export default Pool;
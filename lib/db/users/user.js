import argon2 from "argon2";
import {ExecuteQuery} from "../pool";

export const AddUser = async (username, password) => {

    const hash = await argon2.hash(password);
    await ExecuteQuery("INSERT INTO user (username, password) VALUES (?,?)", [username, hash]);
}

export const GetUserAndVerifyPassword = async (username, password) => {
    const [rows] = await ExecuteQuery("SELECT user.password, user.id, tenant.first_name, tenant.email FROM user LEFT JOIN tenant ON tenant.user_id = user.id WHERE username = ?",
        [
            username
        ]);

    if (rows.length !== 1 || !(await argon2.verify(rows[0].password, password))) {
        throw new Error("invalid login");
    }

    return rows[0];
}

export const GetUserAdminSites = async (userId) => {

    const [rows] = await ExecuteQuery(`SELECT site, site_privs, apartment_privs
                                       FROM site_admins
                                       WHERE userid = ?`,
        [
            userId
        ]);

    return rows;

}

export const GetUser = async (username) => {


    const [rows] = await ExecuteQuery("SELECT id, username FROM user WHERE username = ?",
        [
            username
        ]);
    if (rows.length !== 1) return {};

    return rows[0];
}

export const ChangeUserPassword = async (site, username, password, newPassword) => {

    const userData = await GetUserAndVerifyPassword(username, password);
    if (!userData) throw new Error("invalid login");

    const hash = await argon2.hash(newPassword);
    await ExecuteQuery("UPDATE user SET password=? WHERE username=?", [hash, username]);

}
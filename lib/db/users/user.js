import argon2 from "argon2";
import Pool from "../pool";

export const AddUser = async (username, password) => {
    const conn = Pool();

    const hash = await argon2.hash(password);
    await conn.execute("INSERT INTO user (username, password) VALUES (?,?)", [username, hash]);

    }

export const GetUserAndVerifyPassword = async (site, username, password) => {
    const conn = Pool();

    const [rows] = await conn.execute("SELECT user.password, user.id, tenant.first_name, site_admins.site FROM user LEFT JOIN tenant ON tenant.user_id = user.id LEFT JOIN site_admins ON site_admins.userid = user.id and site_admins.site = ? WHERE username = ?",
        [
            site,
            username
        ]);

    if (rows.length !== 1 || !(await argon2.verify(rows[0].password, password))) {
        throw new Error("invalid login");
    }

        return rows[0];
}

export const ChangeUserPassword = async (site, username, password, newPassword) => {
    const conn = Pool();
    const userData = await GetUserAndVerifyPassword(site, username, password);
    if (!userData) throw new Error("invalid login");

    const hash = await argon2.hash(newPassword);
    await conn.execute("UPDATE user SET password=? WHERE id=?", [hash, username]);

    }
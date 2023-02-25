import Connection from "../connection";

const NavLinks = async(site) => {
    const conn = await Connection();
    let [rows] = await conn.execute("SELECT * FROM site_nav WHERE site = ? ORDER BY position", [site]);
    conn.release();
    return rows;
}

export default NavLinks;
import Connection from "../connection";

export const GetDynamicContent = async(site, page) => {
    const conn = Connection();
    const [rows] = await conn.execute("SELECT name, content FROM site_content WHERE site = ? AND page = ?", [site, page])
        return rows;
}

export const UpdateDynamicContent = async(site, page, data) => {
    const conn = Connection();
    try {
        await conn.execute("REPLACE INTO site_content (site, page, name, content) VALUES (?,?,?,?)",
            [
                site,
                page,
                data.name,
                data.content
            ]);
    } finally {
            }
}

export const CopyDynamicContent = async(site, page, newPage) => {
    const conn = Connection();
    try {
        await conn.execute("INSERT INTO site_content (site, page, name, content) SELECT site, ?, name, content FROM site_content WHERE site = ? AND page = ?",
            [
                newPage,
                site,
                page
            ]);
    } catch (e) {
        //ignore
    }
}

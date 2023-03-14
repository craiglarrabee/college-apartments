import Connection from "../connection";

export const GetDynamicContent = async(site, page) => {
    const conn = await Connection();
    const [rows] = await conn.execute("SELECT name, content FROM site_content WHERE site = ? AND page = ?", [site, page])
    conn.release();
    return rows;
}

export const UpdateDynamicContent = async(site, page, data) => {
    const conn = await Connection();
    try {
        await conn.execute("REPLACE INTO site_content (site, page, name, content) VALUES (?,?,?,?)",
            [
                site,
                page,
                data.name,
                data.content
            ]);
    } finally {
        conn.release();
    }
}

export const CopyDynamicContent = async(site, page, newPage) => {
    const conn = await Connection();
    try {
        await conn.execute("INSERT INTO site_content (site, page, name, content) SELECT site, ?, name, content FROM site_content WHERE site = ? AND page = ?",
            [
                newPage,
                site,
                page
            ]);
    } finally {
        conn.release();
    }
}

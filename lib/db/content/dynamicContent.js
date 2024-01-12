import {ExecuteQuery} from "../pool";

export const GetDynamicContent = async (site, page) => {
    const [rows] = await ExecuteQuery("SELECT site, page, name, content FROM site_content WHERE site = ? AND page like ?", [site, page]);
    return rows;
}
export const DeleteDynamicContent = async (site, page, name) => {
    await ExecuteQuery("DELETE FROM site_content WHERE site = ? AND page = ? AND name = ?", [site, page, name]);
}

export const UpdateDynamicContent = async (site, page, data) => {
    try {
        await ExecuteQuery("REPLACE INTO site_content (site, page, name, content) VALUES (?,?,?,?)",
            [
                site,
                page,
                data.name,
                data.content
            ]);
    } finally {
    }
}

export const CopyDynamicContent = async (site, page, newPage) => {
    try {
        await ExecuteQuery("INSERT INTO site_content (site, page, name, content) SELECT site, ?, name, content FROM site_content WHERE site = ? AND page = ?",
            [
                newPage,
                site,
                page
            ]);
    } catch (e) {
        //ignore
    }
}

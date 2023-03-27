import {ExecuteQuery} from "../pool";

export const GetDynamicContent = async (site, page) => {
    const [rows] = await ExecuteQuery("SELECT name, content FROM site_content WHERE site = ? AND page = ?", [site, page]);
    return rows;
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

import fs from "fs";
import {extname} from "path";


export const GetDynamicImageContent = async(site, page) => {
    let images = null;
    try {
        //get images for carousel
        images = fs.readdirSync(`./upload/images/${site}/${page}/`);
    } catch (e) {
        //if we don't have images, just ignore
    }
    return images;
}

import fs from "fs";
import {extname} from "path";


export const GetDynamicImageContent = async(site, page) => {
    let images = null;
    try {
        //get images for carousel
        const files = fs.readdirSync(`./public/images/${site}/${page}/`);
        images = files.filter(file => extname(file) === ".jpg");
    } catch (e) {
        //if we don't have images, just ignore
    }
    return images;
}

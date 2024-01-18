import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import Busboy from "busboy";
import fs from "fs";
import {DeleteDynamicContent} from "../../../lib/db/content/dynamicContent";

const video = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.admin.includes(req.query.site)) {
        res.status(403).send();
        return;
    }

    try {
        switch (req.method) {
            case "POST":
                await uploadVideo(req);
                res.status(204).send();
                return;
            case "DELETE":
                fs.rmSync(`./upload/images/${req.query.site}/${req.query.page}/${req.query.fileName}`);
                DeleteDynamicContent(req.query.site, req.query.page, req.query.fileName);
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        res.body = {error: e.code, description: e.message};
        res.status(400).send();
        console.error(e);
    }
}, ironOptions);

const uploadVideo = async (req) => {
    const busboy = new Busboy({headers: req.headers});
    console.log(JSON.stringify(req.headers, null, 2));
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log(
            'File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype,
        );
        file.on('data', function (data) {
            console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        });
        file.on('end', function () {
            console.log('File [' + fieldname + '] Finished');
        });
    });
    busboy.on('field', function (fieldname, val) {
        console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });
    busboy.on('finish', function () {
        console.log('Done parsing form!');

        resolve(1);
    });
    req.pipe(busboy);
}
export default video;

export const config = {
    api: {
        bodyParser: false,
    },
};

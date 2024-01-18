import fs from "fs";
import {extname} from "path";
import {GetDynamicImageContent} from "./dynamicImageContent";

describe("GetDynamicImageContent", () => {
    let readdirSyncMock;

    beforeEach(() => {
        readdirSyncMock = jest.spyOn(fs, "readdirSync");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return null if there are no images", async () => {
        readdirSyncMock.mockImplementationOnce(() => {
            throw new Error("File not found");
        });

        const response = await GetDynamicImageContent("site", "page");

        expect(response).toBeNull();
    });

    it("should return an array of images if there are any", async () => {
        const mockFiles = ["image1.jpg", "image2.jpg", "text.txt"];

        readdirSyncMock.mockReturnValueOnce(mockFiles);

        const response = await GetDynamicImageContent("site", "page");

        expect(response).toHaveLength(2);
        expect(response).toEqual(expect.arrayContaining(["image1.jpg", "image2.jpg"]));
    });
});

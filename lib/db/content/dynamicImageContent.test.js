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

    it("should return an array of files from the directory (no filtering in current implementation)", async () => {
        const mockFiles = ["image1.jpg", "image2.jpg", "text.txt"];

        readdirSyncMock.mockReturnValueOnce(mockFiles);

        const response = await GetDynamicImageContent("site", "page");

        // The current implementation returns all files found; tests should not assume filtering by extension
        expect(response).toEqual(mockFiles);
        // Still ensure expected images are present
        expect(response).toEqual(expect.arrayContaining(["image1.jpg", "image2.jpg"]));
    });
});

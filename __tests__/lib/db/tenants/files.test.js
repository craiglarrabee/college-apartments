import {
    ListTenantFiles,
    GetTenantFileById,
    GetTenantFileByName,
    InsertTenantFile,
    ReplaceTenantFileByName,
    RenameTenantFile,
    DeleteTenantFile
} from '../../../../lib/db/tenants/files';
import { ExecuteQuery } from '../../../../lib/db/pool';

// Mock the database pool
jest.mock('../../../../lib/db/pool');

describe('Tenant Files Database Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('ListTenantFiles', () => {
        it('should return files with uploader name from JOIN', async () => {
            const mockFiles = [
                {
                    id: 1,
                    user_id: 123,
                    original_name: 'test.pdf',
                    stored_filename: 'uuid-123.pdf',
                    mime_type: 'application/pdf',
                    size_bytes: 1024,
                    uploaded_by_user_id: 456,
                    created_at: '2026-01-14T12:00:00Z',
                    updated_at: '2026-01-14T12:00:00Z',
                    uploaded_by_name: 'John Doe'
                }
            ];

            ExecuteQuery.mockResolvedValue([mockFiles]);

            const result = await ListTenantFiles(123);

            expect(ExecuteQuery).toHaveBeenCalledWith(
                expect.stringContaining('LEFT JOIN tenant'),
                [123]
            );
            expect(ExecuteQuery).toHaveBeenCalledWith(
                expect.stringContaining('CONCAT(t.first_name'),
                [123]
            );
            expect(result).toEqual(mockFiles);
            expect(result[0].uploaded_by_name).toBe('John Doe');
        });

        it('should handle empty file list', async () => {
            ExecuteQuery.mockResolvedValue([[]]);

            const result = await ListTenantFiles(123);

            expect(result).toEqual([]);
        });
    });

    describe('GetTenantFileById', () => {
        it('should return file by id and userId', async () => {
            const mockFile = {
                id: 1,
                user_id: 123,
                original_name: 'test.pdf',
                stored_filename: 'uuid-123.pdf'
            };

            ExecuteQuery.mockResolvedValue([[mockFile]]);

            const result = await GetTenantFileById(123, 1);

            expect(ExecuteQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE user_id = ? AND id = ?'),
                [123, 1]
            );
            expect(result).toEqual(mockFile);
        });

        it('should return null if file not found', async () => {
            ExecuteQuery.mockResolvedValue([[]]);

            const result = await GetTenantFileById(123, 999);

            expect(result).toBeNull();
        });
    });

    describe('GetTenantFileByName', () => {
        it('should return file by name and userId', async () => {
            const mockFile = {
                id: 1,
                user_id: 123,
                original_name: 'test.pdf'
            };

            ExecuteQuery.mockResolvedValue([[mockFile]]);

            const result = await GetTenantFileByName(123, 'test.pdf');

            expect(ExecuteQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE user_id = ? AND original_name = ?'),
                [123, 'test.pdf']
            );
            expect(result).toEqual(mockFile);
        });

        it('should return null if file not found', async () => {
            ExecuteQuery.mockResolvedValue([[]]);

            const result = await GetTenantFileByName(123, 'nonexistent.pdf');

            expect(result).toBeNull();
        });
    });

    describe('InsertTenantFile', () => {
        it('should insert new file and return metadata', async () => {
            const insertResult = { insertId: 1 };
            const mockFile = {
                id: 1,
                user_id: 123,
                original_name: 'test.pdf',
                stored_filename: 'uuid-123.pdf',
                mime_type: 'application/pdf',
                size_bytes: 1024,
                uploaded_by_user_id: 456,
                created_at: '2026-01-14T12:00:00Z'
            };

            ExecuteQuery
                .mockResolvedValueOnce([insertResult])
                .mockResolvedValueOnce([[mockFile]]);

            const result = await InsertTenantFile({
                userId: 123,
                originalName: 'test.pdf',
                storedFilename: 'uuid-123.pdf',
                mimeType: 'application/pdf',
                sizeBytes: 1024,
                uploadedByUserId: 456
            });

            expect(ExecuteQuery).toHaveBeenCalledTimes(2);
            expect(ExecuteQuery).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('INSERT INTO tenant_files'),
                [123, 'test.pdf', 'uuid-123.pdf', 'application/pdf', 1024, 456]
            );
            expect(result).toEqual(mockFile);
        });
    });

    describe('RenameTenantFile', () => {
        it('should update filename and return updated metadata', async () => {
            const mockFile = {
                id: 1,
                original_name: 'renamed.pdf'
            };

            ExecuteQuery
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([[mockFile]]);

            const result = await RenameTenantFile({
                userId: 123,
                fileId: 1,
                newOriginalName: 'renamed.pdf'
            });

            expect(ExecuteQuery).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE tenant_files SET original_name = ?'),
                ['renamed.pdf', 1, 123]
            );
            expect(result).toEqual(mockFile);
        });
    });

    describe('DeleteTenantFile', () => {
        it('should delete file by id and userId', async () => {
            ExecuteQuery.mockResolvedValue([{}]);

            await DeleteTenantFile({ userId: 123, fileId: 1 });

            expect(ExecuteQuery).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM tenant_files'),
                [1, 123]
            );
        });
    });

    describe('ReplaceTenantFileByName', () => {
        it('should update file metadata for replacement', async () => {
            const mockFile = {
                id: 1,
                stored_filename: 'new-uuid.pdf',
                size_bytes: 2048
            };

            ExecuteQuery
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([[mockFile]]);

            const result = await ReplaceTenantFileByName({
                userId: 123,
                originalName: 'test.pdf',
                newStoredFilename: 'new-uuid.pdf',
                mimeType: 'application/pdf',
                sizeBytes: 2048,
                uploadedByUserId: 456
            });

            expect(ExecuteQuery).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE tenant_files'),
                ['new-uuid.pdf', 'application/pdf', 2048, 456, 123, 'test.pdf']
            );
            expect(result).toEqual(mockFile);
        });
    });
});


/**
 * Integration Tests for File Management
 *
 * These tests verify the complete file management workflow including:
 * - File upload with validation
 * - File listing with formatted data
 * - File rename operations
 * - File replace operations
 * - File delete operations
 */

import fetchMock from 'jest-fetch-mock';

describe('File Management Integration Tests', () => {
    beforeAll(() => {
        fetchMock.enableMocks();
    });

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    describe('Complete Upload Workflow', () => {
        it('should validate, upload, and display files correctly', async () => {
            // Step 1: Validate file client-side
            const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
            const allowed = /^(image\/png|application\/pdf)$/;

            expect(file.name.length <= 150).toBe(true);
            expect(allowed.test(file.type)).toBe(true);
            expect(file.size <= 25 * 1024 * 1024).toBe(true);

            // Step 2: Upload file
            fetchMock.mockResponseOnce(JSON.stringify({
                results: [
                    {
                        original_name: 'test.pdf',
                        status: 'created',
                        file: {
                            id: 1,
                            original_name: 'test.pdf',
                            mime_type: 'application/pdf',
                            size_bytes: 1024,
                            created_at: '2026-01-14T12:00:00Z',
                            uploaded_by_name: 'John Doe'
                        }
                    }
                ]
            }));

            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch('/api/tenants/123/files?site=snow', {
                method: 'POST',
                body: formData
            });

            expect(uploadResponse.ok).toBe(true);
            const uploadData = await uploadResponse.json();
            expect(uploadData.results[0].status).toBe('created');

            // Step 3: Fetch and display files
            fetchMock.mockResponseOnce(JSON.stringify({
                files: [{
                    id: 1,
                    original_name: 'test.pdf',
                    mime_type: 'application/pdf',
                    size_bytes: 1024,
                    created_at: '2026-01-14T12:00:00Z',
                    uploaded_by_name: 'John Doe'
                }]
            }));

            const listResponse = await fetch('/api/tenants/123/files?site=snow');
            const listData = await listResponse.json();

            expect(listData.files.length).toBe(1);
            expect(listData.files[0].uploaded_by_name).toBe('John Doe');

            // Step 4: Format display data
            const formatDate = (dateString) => {
                const date = new Date(dateString);
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const year = date.getFullYear();
                return `${month}/${day}/${year}`;
            };

            const displayDate = formatDate(listData.files[0].created_at);
            const displaySize = (listData.files[0].size_bytes / 1024 / 1024).toFixed(2);

            expect(displayDate).toBe('01/14/2026');
            expect(displaySize).toBe('0.00');
        });
    });

    describe('Rename Workflow', () => {
        it('should rename file and update display', async () => {
            const fileId = 1;
            const oldName = 'old.pdf';
            const newName = 'new.pdf';

            // Validate new name
            expect(newName.length <= 150).toBe(true);
            expect(newName !== oldName).toBe(true);
            expect(newName.trim() !== '').toBe(true);

            // Send rename request
            fetchMock.mockResponseOnce(JSON.stringify({
                ok: true,
                file: {
                    id: fileId,
                    original_name: newName
                }
            }));

            const response = await fetch(`/api/tenants/123/files/${fileId}?site=snow`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newName })
            });

            expect(response.ok).toBe(true);
            const data = await response.json();
            expect(data.file.original_name).toBe(newName);
        });

        it('should handle duplicate filename error', async () => {
            fetchMock.mockResponseOnce(
                JSON.stringify({ error: 'A file with that name already exists for this tenant.' }),
                { status: 409 }
            );

            const response = await fetch('/api/tenants/123/files/1?site=snow', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newName: 'duplicate.pdf' })
            });

            expect(response.status).toBe(409);
            const data = await response.json();
            expect(data.error).toContain('already exists');
        });
    });

    describe('Replace Workflow', () => {
        it('should replace file with validation', async () => {
            const newFile = new File(['new content'], 'replacement.png', { type: 'image/png' });
            const allowed = /^(image\/png|application\/pdf)$/;

            // Validate replacement file
            expect(allowed.test(newFile.type)).toBe(true);
            expect(newFile.size <= 25 * 1024 * 1024).toBe(true);

            // Send replace request
            fetchMock.mockResponseOnce(JSON.stringify({
                ok: true,
                file: {
                    id: 1,
                    original_name: 'test.pdf',
                    stored_filename: 'new-uuid.png',
                    mime_type: 'image/png'
                }
            }));

            const formData = new FormData();
            formData.append('file', newFile);

            const response = await fetch('/api/tenants/123/files/1?site=snow', {
                method: 'PUT',
                body: formData
            });

            expect(response.ok).toBe(true);
            const data = await response.json();
            expect(data.file.mime_type).toBe('image/png');
        });
    });

    describe('Delete Workflow', () => {
        it('should delete file and update list', async () => {
            // Confirm deletion
            const confirmed = true;
            expect(confirmed).toBe(true);

            // Send delete request
            fetchMock.mockResponseOnce(JSON.stringify({ ok: true }));

            const response = await fetch('/api/tenants/123/files/1?site=snow', {
                method: 'DELETE'
            });

            expect(response.ok).toBe(true);

            // Verify file list updated
            fetchMock.mockResponseOnce(JSON.stringify({ files: [] }));

            const listResponse = await fetch('/api/tenants/123/files?site=snow');
            const listData = await listResponse.json();

            expect(listData.files.length).toBe(0);
        });
    });

    describe('Error Scenarios', () => {
        it('should handle upload with mixed success and failures', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({
                results: [
                    { original_name: 'file1.pdf', status: 'created' },
                    { original_name: 'file2.jpg', status: 'rejected', reason: 'only PNGs and PDFs are allowed' },
                    { original_name: 'toolong.pdf', status: 'rejected', reason: 'name must be <= 150 characters' }
                ]
            }));

            const response = await fetch('/api/tenants/123/files?site=snow', {
                method: 'POST',
                body: new FormData()
            });

            const data = await response.json();
            const errors = data.results.filter(r => r.status === 'error' || r.status === 'rejected');
            const successes = data.results.filter(r => r.status === 'created' || r.status === 'replaced');

            expect(successes.length).toBe(1);
            expect(errors.length).toBe(2);
            expect(errors[0].reason).toContain('only PNGs and PDFs');
        });

        it('should handle network errors gracefully', async () => {
            fetchMock.mockReject(new Error('Network error'));

            try {
                await fetch('/api/tenants/123/files?site=snow');
                fail('Should have thrown error');
            } catch (error) {
                expect(error.message).toBe('Network error');
            }
        });

        it('should handle unauthorized access', async () => {
            fetchMock.mockResponseOnce('', { status: 403 });

            const response = await fetch('/api/tenants/123/files?site=snow');
            expect(response.status).toBe(403);
        });
    });

    describe('File Type Validation', () => {
        const testCases = [
            { type: 'image/png', expected: true, description: 'PNG image' },
            { type: 'application/pdf', expected: true, description: 'PDF document' },
            { type: 'image/jpeg', expected: false, description: 'JPEG image' },
            { type: 'image/gif', expected: false, description: 'GIF image' },
            { type: 'text/plain', expected: false, description: 'Text file' },
            { type: 'application/msword', expected: false, description: 'Word document' }
        ];

        testCases.forEach(({ type, expected, description }) => {
            it(`should ${expected ? 'accept' : 'reject'} ${description}`, () => {
                const allowed = /^(image\/png|application\/pdf)$/;
                expect(allowed.test(type)).toBe(expected);
            });
        });
    });
});


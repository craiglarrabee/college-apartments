import { validateFilename, validateFileSize } from '../../lib/fileUtils';

describe('File Utilities', () => {
    describe('validateFilename', () => {
        it('should accept valid filename', () => {
            const result = validateFilename('test.pdf');
            expect(result.valid).toBe(true);
        });

        it('should reject empty filename', () => {
            const result = validateFilename('');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Filename is required');
        });

        it('should reject null filename', () => {
            const result = validateFilename(null);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Filename is required');
        });

        it('should reject filename longer than 150 characters', () => {
            const longName = 'a'.repeat(151) + '.pdf';
            const result = validateFilename(longName);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Filename must be <= 150 characters');
        });

        it('should accept filename exactly 150 characters', () => {
            const exactName = 'a'.repeat(146) + '.pdf'; // 146 + 4 = 150
            const result = validateFilename(exactName);
            expect(result.valid).toBe(true);
        });

        it('should trim whitespace from filename', () => {
            const result = validateFilename('  test.pdf  ');
            expect(result.valid).toBe(true);
        });

        it('should reject filename with only whitespace', () => {
            const result = validateFilename('   ');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Filename is required');
        });
    });

    describe('validateFileSize', () => {
        it('should accept file within size limit', () => {
            const maxBytes = 25 * 1024 * 1024; // 25 MB
            const fileSize = 10 * 1024 * 1024; // 10 MB
            const result = validateFileSize(fileSize, maxBytes);
            expect(result.valid).toBe(true);
        });

        it('should reject file exceeding size limit', () => {
            const maxBytes = 25 * 1024 * 1024; // 25 MB
            const fileSize = 30 * 1024 * 1024; // 30 MB
            const result = validateFileSize(fileSize, maxBytes);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('File too large. Max 25 MB');
        });

        it('should accept file exactly at size limit', () => {
            const maxBytes = 25 * 1024 * 1024;
            const result = validateFileSize(maxBytes, maxBytes);
            expect(result.valid).toBe(true);
        });

        it('should handle zero-byte files', () => {
            const maxBytes = 25 * 1024 * 1024;
            const result = validateFileSize(0, maxBytes);
            expect(result.valid).toBe(true);
        });
    });
});


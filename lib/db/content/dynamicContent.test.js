
import { ExecuteQuery } from "../pool";
import {CopyDynamicContent, GetDynamicContent, UpdateDynamicContent} from "./dynamicContent";

jest.mock('../pool', () => ({
  ExecuteQuery: jest.fn(),
}));

describe('GetDynamicContent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return rows', async () => {
    const mockRows = [{ name: 'test', content: 'test-content' }];
    ExecuteQuery.mockResolvedValue([mockRows]);

    const result = await GetDynamicContent('test-site', 'test-page');

    expect(ExecuteQuery).toHaveBeenCalledWith('SELECT name, content FROM site_content WHERE site = ? AND page = ?', ['test-site', 'test-page']);
    expect(result).toEqual(mockRows);
  });

  it('should throw an error on ExecuteQuery failure', async () => {
    ExecuteQuery.mockRejectedValue(new Error('ExecuteQuery error'));

    await expect(GetDynamicContent('test-site', 'test-page')).rejects.toThrow('ExecuteQuery error');
  });
});

describe('UpdateDynamicContent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update dynamic content', async () => {
    const mockData = { name: 'test', content: 'test-content' };
    ExecuteQuery.mockResolvedValue([]);

    await UpdateDynamicContent('test-site', 'test-page', mockData);

    expect(ExecuteQuery).toHaveBeenCalledWith('REPLACE INTO site_content (site, page, name, content) VALUES (?,?,?,?)', ['test-site', 'test-page', 'test', 'test-content']);
  });

  it('should throw an error on ExecuteQuery failure', async () => {
    const mockData = { name: 'test', content: 'test-content' };
    ExecuteQuery.mockRejectedValue(new Error('ExecuteQuery error'));

    await expect(UpdateDynamicContent('test-site', 'test-page', mockData)).rejects.toThrow('ExecuteQuery error');
  });
});

describe('CopyDynamicContent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should copy dynamic content', async () => {
    ExecuteQuery.mockResolvedValue([]);

    await CopyDynamicContent('test-site', 'test-page', 'new-page');

    expect(ExecuteQuery).toHaveBeenCalledWith('INSERT INTO site_content (site, page, name, content) SELECT site, ?, name, content FROM site_content WHERE site = ? AND page = ?', ['new-page', 'test-site', 'test-page']);
  });

  it('should ignore error on ExecuteQuery failure', async () => {
    ExecuteQuery.mockRejectedValue(new Error('ExecuteQuery error'));

    await CopyDynamicContent('test-site', 'test-page', 'new-page');

    expect(ExecuteQuery).toHaveBeenCalledWith('INSERT INTO site_content (site, page, name, content) SELECT site, ?, name, content FROM site_content WHERE site = ? AND page = ?', ['new-page', 'test-site', 'test-page']);
  });
});

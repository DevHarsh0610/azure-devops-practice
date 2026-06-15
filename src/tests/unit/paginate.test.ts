import { getPaginationOptions, getPaginationMeta } from '../../utils/paginate.js';

describe('paginate Utility', () => {
  describe('getPaginationOptions', () => {
    it('should return default options when page and limit are undefined', () => {
      const result = getPaginationOptions();

      expect(result).toEqual({
        skip: 0,
        take: 10,
        page: 1,
        limit: 10,
      });
    });

    it('should parse string inputs and return correct skip and take options', () => {
      const result = getPaginationOptions('2', '15');

      expect(result).toEqual({
        skip: 15,
        take: 15,
        page: 2,
        limit: 15,
      });
    });

    it('should clamp page to minimum of 1', () => {
      const result = getPaginationOptions('0', '10');

      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it('should clamp limit to maximum of 100', () => {
      const result = getPaginationOptions('1', '200');

      expect(result.limit).toBe(100);
      expect(result.take).toBe(100);
    });

    it('should clamp limit to minimum of 1', () => {
      const result = getPaginationOptions('1', '0');

      expect(result.limit).toBe(1);
      expect(result.take).toBe(1);
    });

    it('should handle negative numbers by clamping to 1', () => {
      const result = getPaginationOptions('-5', '-10');

      expect(result).toEqual({
        skip: 0,
        take: 1,
        page: 1,
        limit: 1,
      });
    });

    it('should handle invalid non-numeric strings and fallback to defaults', () => {
      const result = getPaginationOptions('abc', 'def');

      expect(result).toEqual({
        skip: 0,
        take: 10,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getPaginationMeta', () => {
    it('should return correct pagination metadata', () => {
      const result = getPaginationMeta(45, 2, 10);

      expect(result).toEqual({
        page: 2,
        limit: 10,
        totalCount: 45,
        totalPages: 5,
      });
    });

    it('should calculate 0 totalPages when totalCount is 0', () => {
      const result = getPaginationMeta(0, 1, 10);

      expect(result.totalPages).toBe(0);
    });

    it('should calculate 1 totalPage when totalCount is less than limit', () => {
      const result = getPaginationMeta(5, 1, 10);

      expect(result.totalPages).toBe(1);
    });
  });
});

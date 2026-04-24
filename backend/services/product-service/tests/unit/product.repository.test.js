const productRepository = require('../../src/repositories/productRepository');
const pool = require('../../src/db/db');

// Mock the database pool
jest.mock('../../src/db/db');

describe('ProductRepository', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'A test product',
    price: 29.99,
    category: 'electronics',
    stock: 10,
    merchant_id: 'merchant-123',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a new product in the database', async () => {
      const inputData = {
        name: 'New Product',
        description: 'A new product',
        price: 49.99,
        category: 'electronics',
        stock: 5,
        merchant_id: 'merchant-123',
      };

      pool.query.mockResolvedValue({
        rows: [{ id: 1, ...inputData }],
      });

      const result = await productRepository.createProduct(inputData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(inputData.name);
      expect(pool.query).toHaveBeenCalled();
    });

    it('should call pool.query with correct INSERT statement', async () => {
      const inputData = {
        name: 'Test',
        description: 'Description',
        price: 29.99,
        category: 'electronics',
        stock: 5,
        merchant_id: 'merchant-1',
      };

      pool.query.mockResolvedValue({
        rows: [{ id: 1, ...inputData }],
      });

      await productRepository.createProduct(inputData);

      const queryCall = pool.query.mock.calls[0];
      expect(queryCall[0]).toContain('INSERT INTO products');
      expect(queryCall[1]).toEqual([
        inputData.name,
        inputData.description,
        inputData.price,
        inputData.category,
        inputData.stock,
        inputData.merchant_id,
      ]);
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [mockProduct, { ...mockProduct, id: 2 }];

      pool.query.mockResolvedValue({
        rows: mockProducts,
      });

      const result = await productRepository.getAllProducts();

      expect(result).toEqual(mockProducts);
      expect(result.length).toBe(2);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM products ORDER BY id DESC'
      );
    });

    it('should return empty array if no products exist', async () => {
      pool.query.mockResolvedValue({
        rows: [],
      });

      const result = await productRepository.getAllProducts();

      expect(result).toEqual([]);
    });
  });

  describe('getProductById', () => {
    it('should return a product by id', async () => {
      pool.query.mockResolvedValue({
        rows: [mockProduct],
      });

      const result = await productRepository.getProductById(1);

      expect(result).toEqual(mockProduct);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE id = $1',
        [1]
      );
    });

    it('should return undefined if product not found', async () => {
      pool.query.mockResolvedValue({
        rows: [],
      });

      const result = await productRepository.getProductById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('updateProduct', () => {
    it('should update a product with provided fields', async () => {
      const updateData = { name: 'Updated Name', price: 39.99 };
      const updatedProduct = { ...mockProduct, ...updateData };

      pool.query.mockResolvedValue({
        rows: [updatedProduct],
      });

      const result = await productRepository.updateProduct(1, updateData);

      expect(result).toEqual(updatedProduct);
      const queryCall = pool.query.mock.calls[0];
      expect(queryCall[0]).toContain('UPDATE products');
      expect(queryCall[0]).toContain('name = $1');
      expect(queryCall[0]).toContain('price = $2');
    });

    it('should throw error if no fields to update', async () => {
      await expect(productRepository.updateProduct(1, {})).rejects.toThrow(
        'No fields to update'
      );
    });

    it('should not call database if no fields to update', async () => {
      try {
        await productRepository.updateProduct(1, {});
      } catch (error) {
        // Expected error
      }

      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product by id', async () => {
      pool.query.mockResolvedValue({
        rows: [mockProduct],
      });

      const result = await productRepository.deleteProduct(1);

      expect(result).toEqual(mockProduct);
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM products WHERE id=$1 RETURNING *',
        [1]
      );
    });

    it('should return undefined if product not found', async () => {
      pool.query.mockResolvedValue({
        rows: [],
      });

      const result = await productRepository.deleteProduct(999);

      expect(result).toBeUndefined();
    });
  });

  describe('searchProducts', () => {
    it('should search products by name (case-insensitive)', async () => {
      const mockResults = [mockProduct];

      pool.query.mockResolvedValue({
        rows: mockResults,
      });

      const result = await productRepository.searchProducts('Test');

      expect(result).toEqual(mockResults);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE name ILIKE $1',
        ['%Test%']
      );
    });

    it('should return empty array if no matches', async () => {
      pool.query.mockResolvedValue({
        rows: [],
      });

      const result = await productRepository.searchProducts('NonExistent');

      expect(result).toEqual([]);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products by category', async () => {
      const mockResults = [mockProduct];

      pool.query.mockResolvedValue({
        rows: mockResults,
      });

      const result = await productRepository.getProductsByCategory('electronics');

      expect(result).toEqual(mockResults);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE category = $1 ORDER BY id DESC',
        ['electronics']
      );
    });

    it('should return empty array if category has no products', async () => {
      pool.query.mockResolvedValue({
        rows: [],
      });

      const result = await productRepository.getProductsByCategory('unknown');

      expect(result).toEqual([]);
    });
  });

  describe('getProductsByMerchant', () => {
    it('should return products by merchant id', async () => {
      const mockResults = [mockProduct];

      pool.query.mockResolvedValue({
        rows: mockResults,
      });

      const result = await productRepository.getProductsByMerchant('merchant-123');

      expect(result).toEqual(mockResults);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE merchant_id = $1 ORDER BY id DESC',
        ['merchant-123']
      );
    });

    it('should return empty array if merchant has no products', async () => {
      pool.query.mockResolvedValue({
        rows: [],
      });

      const result = await productRepository.getProductsByMerchant('unknown');

      expect(result).toEqual([]);
    });
  });
});

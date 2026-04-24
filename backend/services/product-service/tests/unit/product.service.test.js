const productService = require('../../src/services/productService');
const productRepository = require('../../src/repositories/productRepository');

// Mock the repository
jest.mock('../../src/repositories/productRepository');

describe('ProductService', () => {
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
    it('should create a new product', async () => {
      const inputData = {
        name: 'New Product',
        description: 'A new product',
        price: 49.99,
        category: 'electronics',
        stock: 5,
        merchant_id: 'merchant-123',
      };

      productRepository.createProduct.mockResolvedValue({
        id: 1,
        ...inputData,
      });

      const result = await productService.createProduct(inputData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(inputData.name);
      expect(result.price).toBe(inputData.price);
      expect(productRepository.createProduct).toHaveBeenCalledWith(inputData);
    });

    it('should throw an error if repository fails', async () => {
      const inputData = {
        name: 'New Product',
        description: 'A new product',
        price: 49.99,
        category: 'electronics',
        stock: 5,
        merchant_id: 'merchant-123',
      };

      productRepository.createProduct.mockRejectedValue(
        new Error('Database error')
      );

      await expect(productService.createProduct(inputData)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [mockProduct, { ...mockProduct, id: 2, name: 'Product 2' }];

      productRepository.getAllProducts.mockResolvedValue(mockProducts);

      const result = await productService.getAllProducts();

      expect(result).toEqual(mockProducts);
      expect(result.length).toBe(2);
      expect(productRepository.getAllProducts).toHaveBeenCalled();
    });

    it('should return an empty array if no products exist', async () => {
      productRepository.getAllProducts.mockResolvedValue([]);

      const result = await productService.getAllProducts();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('getProductById', () => {
    it('should return a product by id', async () => {
      productRepository.getProductById.mockResolvedValue(mockProduct);

      const result = await productService.getProductById(1);

      expect(result).toEqual(mockProduct);
      expect(result.id).toBe(mockProduct.id);
      expect(productRepository.getProductById).toHaveBeenCalledWith(1);
    });

    it('should return undefined if product not found', async () => {
      productRepository.getProductById.mockResolvedValue(undefined);

      const result = await productService.getProductById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const updateData = { name: 'Updated Product', price: 39.99 };
      const updatedProduct = { ...mockProduct, ...updateData };

      productRepository.updateProduct.mockResolvedValue(updatedProduct);

      const result = await productService.updateProduct(1, updateData);

      expect(result).toEqual(updatedProduct);
      expect(result.name).toBe(updateData.name);
      expect(result.price).toBe(updateData.price);
      expect(productRepository.updateProduct).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw an error if update fails', async () => {
      productRepository.updateProduct.mockRejectedValue(
        new Error('Update failed')
      );

      await expect(productService.updateProduct(1, {})).rejects.toThrow('Update failed');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      productRepository.deleteProduct.mockResolvedValue(mockProduct);

      const result = await productService.deleteProduct(1);

      expect(result).toEqual(mockProduct);
      expect(productRepository.deleteProduct).toHaveBeenCalledWith(1);
    });

    it('should handle deletion of non-existent product', async () => {
      productRepository.deleteProduct.mockResolvedValue(undefined);

      const result = await productService.deleteProduct(999);

      expect(result).toBeUndefined();
    });
  });

  describe('searchProducts', () => {
    it('should search products by name', async () => {
      const mockResults = [mockProduct];

      productRepository.searchProducts.mockResolvedValue(mockResults);

      const result = await productService.searchProducts('Test');

      expect(result).toEqual(mockResults);
      expect(result.length).toBe(1);
      expect(productRepository.searchProducts).toHaveBeenCalledWith('Test');
    });

    it('should return empty array if no matches found', async () => {
      productRepository.searchProducts.mockResolvedValue([]);

      const result = await productService.searchProducts('NonExistent');

      expect(result).toEqual([]);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products by category', async () => {
      const mockResults = [mockProduct];

      productRepository.getProductsByCategory.mockResolvedValue(mockResults);

      const result = await productService.getProductsByCategory('electronics');

      expect(result).toEqual(mockResults);
      expect(productRepository.getProductsByCategory).toHaveBeenCalledWith('electronics');
    });

    it('should return empty array if category has no products', async () => {
      productRepository.getProductsByCategory.mockResolvedValue([]);

      const result = await productService.getProductsByCategory('unknown');

      expect(result).toEqual([]);
    });
  });

  describe('getProductsByMerchant', () => {
    it('should return products by merchant id', async () => {
      const mockResults = [mockProduct];

      productRepository.getProductsByMerchant.mockResolvedValue(mockResults);

      const result = await productService.getProductsByMerchant('merchant-123');

      expect(result).toEqual(mockResults);
      expect(productRepository.getProductsByMerchant).toHaveBeenCalledWith('merchant-123');
    });

    it('should return empty array if merchant has no products', async () => {
      productRepository.getProductsByMerchant.mockResolvedValue([]);

      const result = await productService.getProductsByMerchant('unknown-merchant');

      expect(result).toEqual([]);
    });
  });
});

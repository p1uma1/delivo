const { subscribeEvent } = require('@delivo/shared');
const productRepository = require('../repositories/productRepository');

const initOrderConsumer = async () => {
  try {
    // We have switched to synchronous stock reservation in order-service.
    // This consumer is now disabled to prevent double reduction.
    console.log('Product service order consumer skipped (using sync reservation)');
  } catch (err) {
    console.error('Failed to initialize product order consumer:', err.message);
  }
};

module.exports = { initOrderConsumer };

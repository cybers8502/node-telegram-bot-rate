const products = require('../db/culttobacco.json');

module.exports = (query) => {
  const lowercaseQuery = query.toLowerCase();

  return products.filter((product) => {
    if (product.number.toLowerCase() === lowercaseQuery) {
      return true;
    }
    for (const t of product.taste) {
      if (t.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
    }
    return false;
  });
};

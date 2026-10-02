const db = require('../database/db');

async function delayReadData() {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return await db.readData();
}

async function getAllProducts() {
    return await delayReadData();
}

async function getProductById(id) {
    let products = await delayReadData();
    return products.find((item) => item.id === id);
}

async function createProduct(product) {
    let products = await db.readData();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { id: newId, ...product };
    products.push(newProduct);
    await db.writeData(products);
    return newProduct;
}

async function updateProduct(id, productData) {
    let products = await db.readData();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...productData, id }; // Ensure ID doesn't change
        await db.writeData(products);
        return products[index];
    }
    return null;
}

async function deleteProduct(id) {
    let products = await db.readData();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        const deleted = products.splice(index, 1);
        await db.writeData(products);
        return deleted[0];
    }
    return null;
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};

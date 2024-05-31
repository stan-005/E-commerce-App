"use strict";
class ProductService {
    dbPath;
    products = [];
    constructor(dbPath) {
        this.dbPath = dbPath;
    }
    async getAllProducts() {
        const response = await fetch(this.dbPath);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        this.products = data;
        return this.products;
    }
    async getProduct(id) {
        const response = await fetch(`${this.dbPath}/${id}`);
        if (!response.ok) {
            throw new Error(`Product with id ${id} not found`);
        }
        const product = await response.json();
        return product;
    }
    async createProduct(product) {
        const response = await fetch(this.dbPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        });
        if (!response.ok) {
            throw new Error('Failed to create product');
        }
        const newProduct = await response.json();
        this.products.push(newProduct);
        return newProduct;
    }
    async updateProduct(updatedProduct) {
        const response = await fetch(`${this.dbPath}/${updatedProduct.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProduct),
        });
        if (!response.ok) {
            throw new Error(`Failed to update product with id ${updatedProduct.id}`);
        }
        const newProduct = await response.json();
        const productIndex = this.products.findIndex(product => product.id === updatedProduct.id);
        if (productIndex > -1) {
            this.products[productIndex] = newProduct;
            return newProduct;
        }
        throw new Error(`Product with id ${updatedProduct.id} not found`);
    }
    async deleteProduct(id) {
        const response = await fetch(`${this.dbPath}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Failed to delete product with id ${id}`);
        }
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex > -1) {
            this.products.splice(productIndex, 1);
        }
        else {
            throw new Error(`Product with id ${id} not found`);
        }
    }
}
const productService = new ProductService('http://localhost:3000/products');
async function displayProducts() {
    try {
        const products = await productService.getAllProducts();
        const productsList = document.getElementById('products-list');
        if (productsList) {
            productsList.innerHTML = '';
            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'product';
                productElement.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h2>${product.name}</h2>
                    <p>$ ${product.price}</p>
                    <p>${product.description}</p>
                    <button onclick="editProduct('${product.id}')">Edit</button>
                    <button onclick="viewProduct('${product.id}')">View</button>
                    <button onclick="deleteProduct('${product.id}')">Delete</button>
                `;
                productsList.appendChild(productElement);
            });
        }
    }
    catch (error) {
        console.error('Error displaying products:', error);
        showToast('Error displaying products: ' + error.message, 'error');
    }
}
async function editProduct(id) {
    try {
        const product = await productService.getProduct(id);
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-price').value = String(product.price);
        document.getElementById('product-description').value = product.description;
    }
    catch (error) {
        console.error('Error editing product:', error);
        showToast('Error editing product: ' + error.message, 'error');
    }
}
async function viewProduct(id) {
    try {
        const product = await productService.getProduct(id);
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button" onclick="closeModal()">&times;</span>
                <img src="${product.image}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p>$ ${product.price}</p>
                <p>${product.description}</p>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = "block";
    }
    catch (error) {
        console.error('Error viewing product:', error);
        showToast('Error viewing product: ' + error.message, 'error');
    }
}
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}
async function deleteProduct(id) {
    try {
        await productService.deleteProduct(id);
        await displayProducts();
    }
    catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error deleting product: ' + error.message, 'error');
    }
}
document.getElementById('form')?.addEventListener('submit', async function (event) {
    event.preventDefault();
    await productService.getAllProducts(); // Ensure products array is populated
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const image = document.getElementById('product-image').value;
    const price = parseInt(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const productId = id ? id : generateUniqueId();
    const product = { id: productId, name, image, price, description };
    try {
        if (id) {
            await productService.updateProduct(product);
        }
        else {
            await productService.createProduct(product);
        }
        document.getElementById('form').reset();
        await displayProducts();
    }
    catch (error) {
        console.error('Error saving product:', error);
        showToast('Error saving product: ' + error.message, 'error');
    }
});
function generateUniqueId() {
    return 'product_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewProduct = viewProduct;
displayProducts();

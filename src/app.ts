interface Product {
    id: string;
    name: string;
    image: string;
    price: number;
    description: string;
}

class ProductService {
    private products: Product[] = [];

    constructor(private dbPath: string) {}

    async getAllProducts(): Promise<Product[]> {
        const response = await fetch(this.dbPath);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const data: Product[] = await response.json();
        this.products = data;
        return this.products;
    }

    async getProduct(id: string): Promise<Product> {
        const response = await fetch(`${this.dbPath}/${id}`);
        if (!response.ok) {
            throw new Error(`Product with id ${id} not found`);
        }
        const product: Product = await response.json();
        return product;
    }

    async createProduct(product: Product): Promise<Product> {
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
        const newProduct: Product = await response.json();
        this.products.push(newProduct);
        return newProduct;
    }

    async updateProduct(updatedProduct: Product): Promise<Product> {
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
        const newProduct: Product = await response.json();
        const productIndex = this.products.findIndex(product => product.id === updatedProduct.id);
        if (productIndex > -1) {
            this.products[productIndex] = newProduct;
            return newProduct;
        }
        throw new Error(`Product with id ${updatedProduct.id} not found`);
    }

    async deleteProduct(id: string): Promise<void> {
        const response = await fetch(`${this.dbPath}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Failed to delete product with id ${id}`);
        }
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex > -1) {
            this.products.splice(productIndex, 1);
        } else {
            throw new Error(`Product with id ${id} not found`);
        }
    }
}

const productService: ProductService = new ProductService('http://localhost:3000/products');

async function displayProducts(): Promise<void> {
    try {
        const products: Product[] = await productService.getAllProducts();
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
    } catch (error) {
        console.error('Error displaying products:', error);
        showToast('Error displaying products: ' + (error as Error).message, 'error');
    }
}

async function editProduct(id: string): Promise<void> {
    try {
        const product: Product = await productService.getProduct(id);
        (document.getElementById('product-id') as HTMLInputElement).value = product.id;
        (document.getElementById('product-name') as HTMLInputElement).value = product.name;
        (document.getElementById('product-image') as HTMLInputElement).value = product.image;
        (document.getElementById('product-price') as HTMLInputElement).value = String(product.price);
        (document.getElementById('product-description') as HTMLInputElement).value = product.description;
    } catch (error) {
        console.error('Error editing product:', error);
        showToast('Error editing product: ' + (error as Error).message, 'error');
    }
}

async function viewProduct(id: string): Promise<void> {
    try {
        const product: Product = await productService.getProduct(id);
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
    } catch (error) {
        console.error('Error viewing product:', error);
        showToast('Error viewing product: ' + (error as Error).message, 'error');
    }
}

function closeModal(): void {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

async function deleteProduct(id: string): Promise<void> {
    try {
        await productService.deleteProduct(id);
        await displayProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error deleting product: ' + (error as Error).message, 'error');
    }
}

document.getElementById('form')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    await productService.getAllProducts(); // Ensure products array is populated

    const id: string = (document.getElementById('product-id') as HTMLInputElement).value;
    const name: string = (document.getElementById('product-name') as HTMLInputElement).value;
    const image: string = (document.getElementById('product-image') as HTMLInputElement).value;
    const price: number = parseInt((document.getElementById('product-price') as HTMLInputElement).value);
    const description: string = (document.getElementById('product-description') as HTMLInputElement).value;

    const productId: string = id ? id : generateUniqueId();

    const product: Product = { id: productId, name, image, price, description };

    try {
        if (id) {
            await productService.updateProduct(product);
        } else {
            await productService.createProduct(product);
        }
        (document.getElementById('form') as HTMLFormElement).reset();
        await displayProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Error saving product: ' + (error as Error).message, 'error');
    }
});

function generateUniqueId(): string {
    return 'product_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function showToast(message: string, type: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

(window as any).editProduct = editProduct;
(window as any).deleteProduct = deleteProduct;
(window as any).viewProduct = viewProduct;

displayProducts();
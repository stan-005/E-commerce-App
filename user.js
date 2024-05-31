let cartItems = [];
let cartTotal = 0;

localStorage.setItem('cartItems', JSON.stringify(cartItems));
localStorage.setItem('cartTotal', JSON.stringify(cartTotal));

async function displayProductsForUser() {
    try {
        const products = await fetch('http://localhost:3000/products').then(response => response.json());
        const productsList = document.getElementById('products-list');
        if (productsList) {
            productsList.innerHTML = '';
            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'product';

                productElement.innerHTML = `
                    <div class="product-info">
                        <img src="${product.image}" alt="${product.name}">
                        <h2>${product.name}</h2>
                        <p>Price: $ ${product.price}</p>
                        <p>Description: ${product.description}</p>
                        <button id=${product.id}>Add to Cart</button>
                    </div>
                `;

                productsList.appendChild(productElement);
                document.getElementById(`${product.id}`).addEventListener('click',()=>{
                    addToCart(product.name, product.price)
                })

            });
        }
    } catch (error) {
        console.error('Error displaying products:', error);
    }
}

function addToCart(name, price) {
    cartItems.push({ name, price });
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    cartTotal += price;
    localStorage.setItem('cartTotal', JSON.stringify(cartTotal));
    updateCartUI();
}

function updateCartUI() {
    const cartElement = document.getElementById('cart');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    cartItems = JSON.parse(localStorage.getItem('cartItems'));
    cartTotal = JSON.parse(localStorage.getItem('cartTotal'));
    
    if (cartElement) {
        cartElement.style.display = 'block';
    }

    if (cartItemsList) {
        cartItemsList.innerHTML = '';
        cartItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} - $${item.price}`;
            cartItemsList.appendChild(li);
        });
    }

    if (cartTotalElement) {
        cartTotalElement.textContent = cartTotal.toFixed(2);
    }
}

displayProductsForUser();

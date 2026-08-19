const SETTINGS = {
  name: 'TRUCO Indumentaria',
  wa: '5493534177651'
};

const ADMIN_PIN = '1234'; // 🔑 TU CLAVE DE ACCESO ADMIN

const defaultProducts = [
  {
    id: 1,
    name: 'Campera Adidas Puffer',
    price: 68000,
    category: 'camperas',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500',
    sizes: ['M', 'L', 'XL'],
    colors: ['Negro', 'Azul']
  },
  {
    id: 2,
    name: 'Remera Oversize Cotton',
    price: 25000,
    category: 'remeras',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Blanco']
  }
];

let products = JSON.parse(localStorage.getItem('truco_products')) || defaultProducts;
let cart = [];

function saveProductsToStorage() {
  localStorage.setItem('truco_products', JSON.stringify(products));
}

function renderProducts(filter = 'todos') {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';

  const filtered = filter === 'todos' 
    ? products 
    : products.filter(p => p.category === filter);

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="card-body">
        <div class="card-title">${product.name}</div>
        <div class="card-price">$${product.price.toLocaleString('es-AR')}</div>
        <div class="selectors">
          <select id="size-${product.id}">
            ${product.sizes.map(s => `<option value="${s}">Talle: ${s}</option>`).join('')}
          </select>
          <select id="color-${product.id}">
            ${product.colors.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <button class="btn-add" onclick="addToCart(${product.id})">Agregar al pedido</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterCategory(cat) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  if(event) event.target.classList.add('active');
  renderProducts(cat);
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const size = document.getElementById(`size-${productId}`).value;
  const color = document.getElementById(`color-${productId}`).value;

  cart.push({ ...product, selectedSize: size, selectedColor: color });
  updateCartUI();
  toggleCart(true);
}

function updateCartUI() {
  document.getElementById('cart-count').innerText = cart.length;
  const container = document.getElementById('cart-items');
  container.innerHTML = '';

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    container.innerHTML += `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong><br>
          <small>Talle: ${item.selectedSize} | Color: ${item.selectedColor}</small><br>
          <span>$${item.price.toLocaleString('es-AR')}</span>
        </div>
        <button onclick="removeFromCart(${index})" style="background:none;border:none;color:red;cursor:pointer;">✕</button>
      </div>
    `;
  });

  document.getElementById('cart-total').innerText = `$${total.toLocaleString('es-AR')}`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function toggleCart(forceOpen = false) {
  const modal = document.getElementById('cart-modal');
  if (forceOpen) modal.classList.remove('hidden');
  else modal.classList.toggle('hidden');
}

function sendToWhatsApp() {
  if (cart.length === 0) return alert('El carrito está vacío');
  const name = document.getElementById('cust-name').value.trim();
  const delivery = document.getElementById('cust-delivery').value;

  if (!name) return alert('Por favor ingresá tu nombre');

  let total = 0;
  let text = `*NUEVO PEDIDO - ${SETTINGS.name}*\n\n`;
  text += `👤 *Cliente:* ${name}\n\n`;
  text += `🛍️ *Productos:*\n`;

  cart.forEach(item => {
    total += item.price;
    text += `• ${item.name} | Talle: ${item.selectedSize} | Color: ${item.selectedColor} ($${item.price.toLocaleString('es-AR')})\n`;
  });

  text += `\n💰 *TOTAL:* $${total.toLocaleString('es-AR')}\n`;
  text += `📍 *Entrega:* ${delivery}`;

  window.open(`https://wa.me/${SETTINGS.wa}?text=${encodeURIComponent(text)}`, '_blank');
}

// INGRESO A ADMIN CON CLAVE
function loginAdmin() {
  const inputPin = prompt("Ingresá la contraseña de Administrador:");
  if (inputPin === ADMIN_PIN) {
    document.getElementById('admin-modal').classList.remove('hidden');
    renderAdminList();
  } else if (inputPin !== null) {
    alert("Contraseña incorrecta");
  }
}

function closeAdminModal() {
  document.getElementById('admin-modal').classList.add('hidden');
}

function renderAdminList() {
  const list = document.getElementById('admin-products-list');
  list.innerHTML = '';
  products.forEach(p => {
    list.innerHTML += `
      <div class="admin-item">
        <div>
          <strong>${p.name}</strong> - $${p.price.toLocaleString('es-AR')}
        </div>
        <div class="admin-item-btns">
          <button class="btn-edit" onclick="editProduct(${p.id})">✏️ Edit</button>
          <button class="btn-delete" onclick="deleteProduct(${p.id})">🗑️ Borrar</button>
        </div>
      </div>
    `;
  });
}

function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('admin-prod-id').value;
  const name = document.getElementById('admin-prod-name').value;
  const price = parseFloat(document.getElementById('admin-prod-price').value);
  const category = document.getElementById('admin-prod-cat').value;
  const image = document.getElementById('admin-prod-img').value;
  const sizes = document.getElementById('admin-prod-sizes').value.split(',').map(s => s.trim());
  const colors = document.getElementById('admin-prod-colors').value.split(',').map(c => c.trim());

  if (id) {
    const index = products.findIndex(p => p.id == id);
    products[index] = { id: parseInt(id), name, price, category, image, sizes, colors };
  } else {
    const newProd = {
      id: Date.now(),
      name, price, category, image, sizes, colors
    };
    products.push(newProd);
  }

  saveProductsToStorage();
  renderProducts();
  renderAdminList();
  resetAdminForm();
  alert("¡Producto guardado exitosamente!");
}

function editProduct(id) {
  const p = products.find(prod => prod.id === id);
  document.getElementById('admin-prod-id').value = p.id;
  document.getElementById('admin-prod-name').value = p.name;
  document.getElementById('admin-prod-price').value = p.price;
  document.getElementById('admin-prod-cat').value = p.category;
  document.getElementById('admin-prod-img').value = p.image;
  document.getElementById('admin-prod-sizes').value = p.sizes.join(', ');
  document.getElementById('admin-prod-colors').value = p.colors.join(', ');
}

function deleteProduct(id) {
  if (confirm('¿Seguro que querés eliminar esta prenda?')) {
    products = products.filter(p => p.id !== id);
    saveProductsToStorage();
    renderProducts();
    renderAdminList();
  }
}

function resetAdminForm() {
  document.getElementById('admin-form').reset();
  document.getElementById('admin-prod-id').value = '';
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
});

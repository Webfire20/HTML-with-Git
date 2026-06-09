// --- Data ---
const products = [
    { id: 1, name: "Minimalist Trench Coat", price: 189.00, category: "women", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800", description: "Timeless beige trench coat." },
    { id: 2, name: "Oxford Cotton Shirt", price: 85.00, category: "men", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800", description: "Crisp cotton oxford shirt." },
    { id: 3, name: "Pleated Midi Skirt", price: 120.00, category: "women", image: "https://images.unsplash.com/photo-1583496661160-db2906d798ef?auto=format&fit=crop&q=80&w=800", description: "High-waisted pleated skirt." },
    { id: 4, name: "Leather Chelsea Boots", price: 210.00, category: "men", image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800", description: "Handcrafted leather boots." },
    { id: 5, name: "Cashmere Scarf", price: 95.00, category: "accessories", image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800", description: "Ultra-soft cashmere." },
    { id: 6, name: "Silk Slip Dress", price: 150.00, category: "women", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800", description: "Elegant silk slip dress." },
];

// --- State ---
const state = { cart: [], user: null, filters: { category: 'all', sort: 'newest' } };

// --- Router ---
const router = {
    navigate: (page, param) => {
        window.scrollTo(0,0);
        // Hide all pages
        document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden-page'));
        
        // Show specific page & run logic
        const view = document.getElementById(`view-${page}`);
        if(view) view.classList.remove('hidden-page');

        if (page === 'shop') {
            if(param) state.filters.category = param;
            renderShopGrid();
        } 
        else if (page === 'product') loadProductDetail(param);
        else if (page === 'checkout') loadCheckout();
        else if (page === 'account' && !state.user) router.navigate('login');
        
        lucide.createIcons();
    }
};

// --- Page Logic ---
function renderShopGrid() {
    const grid = document.getElementById('shop-grid');
    const loader = document.getElementById('shop-loader');
    
    if (!grid) return;

    grid.classList.add('hidden');
    loader.classList.remove('hidden');

    setTimeout(() => {
        let filtered = products.filter(p => state.filters.category === 'all' || p.category === state.filters.category);
        if (state.filters.sort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
        else if (state.filters.sort === 'price-desc') filtered.sort((a,b) => b.price - a.price);

        grid.innerHTML = '';
        filtered.forEach(p => {
            const tpl = document.getElementById('product-card-template').content.cloneNode(true);
            tpl.querySelector('img').src = p.image;
            tpl.querySelector('.product-name').textContent = p.name;
            tpl.querySelector('.product-cat').textContent = p.category;
            tpl.querySelector('.product-price').textContent = `$${p.price.toFixed(2)}`;
            tpl.querySelector('div').onclick = () => router.navigate('product', p.id);
            tpl.querySelector('.quick-add-btn').onclick = (e) => { e.stopPropagation(); router.navigate('product', p.id); };
            grid.appendChild(tpl);
        });

        document.getElementById('shop-title').textContent = state.filters.category === 'all' ? 'All Collection' : `${state.filters.category} Collection`;
        if (document.getElementById('shop-count')) {
            document.getElementById('shop-count').textContent = `Showing ${filtered.length} products`;
        }
        
        loader.classList.add('hidden');
        grid.classList.remove('hidden');
    }, 300);
}

function loadProductDetail(id) {
    const p = products.find(x => x.id === parseInt(id));
    if(!p) return router.navigate('shop', 'all');
    
    document.getElementById('detail-image').src = p.image;
    document.getElementById('detail-name').textContent = p.name;
    document.getElementById('detail-name-crumb').textContent = p.name;
    document.getElementById('detail-price').textContent = `$${p.price.toFixed(2)}`;
    document.getElementById('detail-desc').textContent = p.description;
    
    const addBtn = document.getElementById('detail-add-btn');
    // Remove previous event listeners by cloning
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
    newBtn.onclick = () => addToCart(p.id);
    
    // Zoom Logic
    const container = document.getElementById('main-image-container');
    const img = document.getElementById('detail-image');
    container.onmousemove = (e) => {
        const {left, top, width, height} = container.getBoundingClientRect();
        img.style.transformOrigin = `${((e.clientX-left)/width)*100}% ${((e.clientY-top)/height)*100}%`;
        img.style.transform = "scale(2)";
    };
    container.onmouseleave = () => { img.style.transform = "scale(1)"; };
}

function loadCheckout() {
    const list = document.getElementById('checkout-items');
    list.innerHTML = '';
    let total = 0;
    state.cart.forEach(item => {
        total += item.price * item.quantity;
        list.innerHTML += `<li class="py-4 flex justify-between"><div>${item.name} <span class="text-xs text-gray-500">x${item.quantity}</span></div><span>$${(item.price*item.quantity).toFixed(2)}</span></li>`;
    });
    document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
}

// --- Filters ---
function updateFilters(type, val) {
    state.filters[type] = val;
    renderShopGrid();
}

// --- Cart Actions ---
function addToCart(id) {
    const p = products.find(x => x.id === id);
    const exist = state.cart.find(x => x.id === id);
    if(exist) exist.quantity++; else state.cart.push({...p, quantity: 1});
    updateCartUI();
    openCartDrawer();
    showToast('Added to cart');
}

function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    const count = document.getElementById('cart-count');
    const sub = document.getElementById('cart-subtotal');
    
    const totalQty = state.cart.reduce((a,b)=>a+b.quantity,0);
    count.textContent = totalQty;
    count.classList.toggle('opacity-0', totalQty === 0);
    
    let total = 0;
    list.innerHTML = state.cart.length ? '' : '<li class="text-center text-gray-500 py-10">Your cart is empty.</li>';
    
    state.cart.forEach(item => {
        total += item.price * item.quantity;
        list.innerHTML += `
            <li class="py-6 flex">
                <img src="${item.image}" class="h-16 w-16 object-cover rounded border">
                <div class="ml-4 flex-1">
                    <div class="flex justify-between font-medium"><h3>${item.name}</h3><p>$${item.price.toFixed(2)}</p></div>
                    <div class="flex justify-between mt-2 text-sm">
                        <span class="text-gray-500">Qty ${item.quantity}</span>
                        <button onclick="removeFromCart(${item.id})" class="text-red-500">Remove</button>
                    </div>
                </div>
            </li>`;
    });
    sub.textContent = `$${total.toFixed(2)}`;
}

function removeFromCart(id) {
    state.cart = state.cart.filter(x => x.id !== id);
    updateCartUI();
}

// --- UI Utils ---
function openCartDrawer() { 
    document.getElementById('cart-drawer').classList.remove('hidden');
    setTimeout(()=>document.getElementById('cart-panel').classList.remove('translate-x-full'), 10);
}
function closeCartDrawer() {
    document.getElementById('cart-panel').classList.add('translate-x-full');
    setTimeout(()=>document.getElementById('cart-drawer').classList.add('hidden'), 300);
}
function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('hidden'); }

function handleAuth(type) {
    state.user = { name: type === 'register' ? document.getElementById('reg-name').value : 'User' };
    document.getElementById('account-name').textContent = state.user.name;
    router.navigate('account');
}
function handleLogout() { state.user = null; router.navigate('home'); }
function handleCheckoutSubmit() { showToast('Order Placed!'); state.cart=[]; updateCartUI(); router.navigate('home'); }

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(()=>t.classList.add('translate-y-20', 'opacity-0'), 2000);
}

function handleAccountClick() { router.navigate(state.user ? 'account' : 'login'); }

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    router.navigate('home');
});
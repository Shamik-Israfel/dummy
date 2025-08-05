const cropsContainer = document.getElementById('crops-container');
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');
const cartItemsEl = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const regionFilter = document.getElementById('region-filter');
const typeFilter = document.getElementById('type-filter');
const mainSearch = document.getElementById('main-search');
const aiSection = document.getElementById('ai-section');
const checkoutBtn = document.getElementById('checkout-btn');


let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allCrops = [];

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000' 
  : '/api';


document.addEventListener('DOMContentLoaded', async () => {
    await fetchCrops();
    renderCrops();
    updateCartUI();
    setupEventListeners();
    
   
    getAiRecommendations();
});



async function fetchCrops() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/crops`);
        const data = await response.json();
        allCrops = data;
        showLoading(false);
    } catch (error) {
        console.error('Error fetching crops:', error);
        showError('Failed to load crops. Please refresh the page.');
        showLoading(false);
    }
}



function renderCrops(filteredCrops = allCrops) {
    if (filteredCrops.length === 0) {
        cropsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-seedling text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No crops found matching your filters</p>
                <button id="reset-filters" class="mt-4 text-green-600 hover:text-green-800">
                    <i class="fas fa-redo mr-2"></i> Reset filters
                </button>
            </div>
        `;
        return;
    }

    cropsContainer.innerHTML = filteredCrops.map(crop => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
            <div class="h-48 bg-green-50 flex items-center justify-center relative">
                <i class="fas fa-seedling text-4xl text-green-600"></i>
                ${crop.quantity < 100 ? `
                    <span class="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Low Stock
                    </span>
                ` : ''}
            </div>
            <div class="p-4">
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-lg">${crop.name}</h3>
                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">${crop.type}</span>
                </div>
                <p class="text-gray-600 text-sm mt-1">
                    <i class="fas fa-map-marker-alt mr-1 text-gray-400"></i>
                    ${crop.region}
                </p>
                <p class="text-sm text-gray-500 mt-2 line-clamp-2">${crop.description || 'No description available'}</p>
                
                <div class="mt-4 flex justify-between items-center">
                    <div>
                        <span class="text-xs text-gray-500">Available:</span>
                        <span class="block font-medium">${crop.quantity} kg</span>
                    </div>
                    <button class="add-to-cart bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                            data-id="${crop.id}">
                        <i class="fas fa-cart-plus mr-2"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}



function addToCart(cropId) {
    const crop = allCrops.find(c => c.id === cropId);
    if (!crop) return;

    const existingItem = cart.find(item => item.id === cropId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ 
            id: crop.id,
            name: crop.name,
            type: crop.type,
            quantity: 1,
            price: crop.price || 0,
            region: crop.region
        });
    }
    
    updateCartUI();
    showToast(`${crop.name} added to cart`);
}

function updateCartUI() {
    localStorage.setItem('cart', JSON.stringify(cart));
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.classList.toggle('hidden', totalItems === 0);
    
    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Your cart is empty</p>
            </div>
        `;
        cartTotal.textContent = '৳0';
        return;
    }
    
    cartItemsEl.innerHTML = cart.map(item => `
        <div class="flex justify-between items-center py-3 border-b">
            <div class="flex-1">
                <h4 class="font-medium">${item.name}</h4>
                <p class="text-sm text-gray-600">${item.type} • ${item.region}</p>
            </div>
            <div class="flex items-center ml-4">
                <button class="decrease-quantity text-gray-500 hover:text-green-600 px-2" 
                        data-id="${item.id}">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity-display mx-2 w-8 text-center">${item.quantity}</span>
                <button class="increase-quantity text-gray-500 hover:text-green-600 px-2" 
                        data-id="${item.id}">
                    <i class="fas fa-plus"></i>
                </button>
                <span class="ml-4 font-medium w-20 text-right">৳${(item.quantity * item.price).toFixed(2)}</span>
                <button class="remove-from-cart text-red-500 hover:text-red-700 ml-4" 
                        data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    cartTotal.textContent = `৳${total.toFixed(2)}`;
}



async function getAiRecommendations() {
    if (cart.length === 0) {
        aiSection.innerHTML = `
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-robot text-blue-400 text-xl"></i>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-blue-800">AI Recommendations</h3>
                        <p class="text-sm text-blue-700 mt-1">
                            Add items to your cart to get personalized crop suggestions.
                        </p>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    try {
        aiSection.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <i class="fas fa-spinner fa-spin text-green-500 mr-3"></i>
                <span class="text-gray-600">AI is analyzing your cart...</span>
            </div>
        `;

        const response = await fetch(`${API_BASE}/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cart: cart
            })
        });

        const data = await response.json();

        if (data.success && data.recommendations.length > 0) {
            renderAiRecommendations(data.recommendations);
        } else {
            aiSection.innerHTML = `
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i class="fas fa-robot text-yellow-400 text-xl"></i>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-yellow-800">AI Recommendations</h3>
                            <p class="text-sm text-yellow-700 mt-1">
                                Try adding more items to get better suggestions.
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('AI Recommendation Error:', error);
        aiSection.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-circle text-red-400 text-xl"></i>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">AI Service Unavailable</h3>
                        <p class="text-sm text-red-700 mt-1">
                            We couldn't load recommendations. Please try again later.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
}


function setupEventListeners() {
    cartBtn.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    document.addEventListener('click', handleDocumentClick);
    regionFilter.addEventListener('change', filterCrops);
    typeFilter.addEventListener('change', filterCrops);
    mainSearch.addEventListener('input', filterCrops);
    checkoutBtn.addEventListener('click', handleCheckout);
}

function toggleCart() {
    cartSidebar.classList.toggle('translate-x-full');
    document.body.classList.toggle('overflow-hidden');
}

function handleDocumentClick(e) {
    if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
        const btn = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
        const cropId = parseInt(btn.dataset.id);
        addToCart(cropId);
    }
    
    if (e.target.classList.contains('remove-from-cart') || e.target.closest('.remove-from-cart')) {
        const btn = e.target.classList.contains('remove-from-cart') ? e.target : e.target.closest('.remove-from-cart');
        const cropId = parseInt(btn.dataset.id);
        cart = cart.filter(item => item.id !== cropId);
        updateCartUI();
        getAiRecommendations();
    }
    
    if (e.target.classList.contains('increase-quantity') || e.target.closest('.increase-quantity')) {
        const btn = e.target.classList.contains('increase-quantity') ? e.target : e.target.closest('.increase-quantity');
        const cropId = parseInt(btn.dataset.id);
        const item = cart.find(item => item.id === cropId);
        if (item) item.quantity += 1;
        updateCartUI();
        getAiRecommendations();
    }
    
    if (e.target.classList.contains('decrease-quantity') || e.target.closest('.decrease-quantity')) {
        const btn = e.target.classList.contains('decrease-quantity') ? e.target : e.target.closest('.decrease-quantity');
        const cropId = parseInt(btn.dataset.id);
        const item = cart.find(item => item.id === cropId);
        if (item) {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== cropId);
            }
        }
        updateCartUI();
        getAiRecommendations();
    }
    
    if (e.target.id === 'reset-filters' || e.target.closest('#reset-filters')) {
        regionFilter.value = '';
        typeFilter.value = '';
        mainSearch.value = '';
        filterCrops();
    }
}

function filterCrops() {
    const region = regionFilter.value;
    const type = typeFilter.value;
    const searchTerm = mainSearch.value.toLowerCase();
    
    const filtered = allCrops.filter(crop => {
        return (!region || crop.region === region) &&
               (!type || crop.type === type) &&
               (!searchTerm || 
                crop.name.toLowerCase().includes(searchTerm) || 
                (crop.description && crop.description.toLowerCase().includes(searchTerm)));
    });
    
    renderCrops(filtered);
}

function handleCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    
    showToast('Order placed successfully!', 'success');
    cart = [];
    updateCartUI();
    getAiRecommendations();
    toggleCart();
}




function showLoading(show) {
    const loader = document.getElementById('loading-indicator');
    if (show) {
        if (!loader) {
            const loaderDiv = document.createElement('div');
            loaderDiv.id = 'loading-indicator';
            loaderDiv.className = 'fixed top-0 left-0 w-full h-1 bg-green-500 z-50';
            document.body.appendChild(loaderDiv);
        }
    } else {
        if (loader) {
            loader.remove();
        }
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } z-50 transform translate-y-10 opacity-0 transition-all duration-300`;
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4';
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    cropsContainer.parentNode.insertBefore(errorDiv, cropsContainer);
}
document.addEventListener('DOMContentLoaded', () => {
    // --- STATIC DATA (Default Fallback) ---
    const productData = [
        { "id": 1, "name": "Stardust Puppy Chow", "tagline": "Energi kosmik untuk anak anjing.", "price": 150000, "image": "images/product_placeholder.png", "category": "puppy" },
        { "id": 2, "name": "Meteor Meat Adult", "tagline": "Kekuatan meteor untuk anjing dewasa.", "price": 250000, "image": "images/product_placeholder.png", "category": "adult" },
        { "id": 3, "name": "Galaxy Grain-Free", "tagline": "Diet bebas biji-bijian dari galaksi lain.", "price": 280000, "image": "images/product_placeholder.png", "category": "adult" },
        { "id": 4, "name": "Nebula Nutrition Senior", "tagline": "Nutrisi seimbang untuk anjing senior.", "price": 260000, "image": "images/product_placeholder.png", "category": "senior" },
        { "id": 5, "name": "Cosmic Crunchies", "tagline": "Camilan renyah untuk semua usia.", "price": 80000, "image": "images/product_placeholder.png", "category": "treats" }
    ];

    // --- LOCALSTORAGE FUNCTIONS ---
    const saveProductsToStorage = (products) => {
        try {
            localStorage.setItem('galacticPaws.products', JSON.stringify(products));
        } catch (e) {
            console.error("Failed to save products to localStorage", e);
        }
    };
    const loadProductsFromStorage = () => {
        try {
            const productsJSON = localStorage.getItem('galacticPaws.products');
            return productsJSON ? JSON.parse(productsJSON) : productData;
        } catch (e) {
            return productData;
        }
    };

    // --- STATE ---
    let allProducts = loadProductsFromStorage();
    let cart = [];
    let currentlyEditingId = null;

    // --- SELECTORS ---
    const productListEl = document.getElementById('product-list');
    const cartPanelEl = document.getElementById('cart-panel');
    const cartOverlayEl = document.getElementById('cart-overlay');
    const cartItemsContainerEl = document.getElementById('cart-items');
    const cartToggleBtnEl = document.querySelector('.cart-toggle-btn');
    const closeCartBtnEl = document.getElementById('close-cart-btn');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const addProductBtn = document.getElementById('add-product-btn');
    const addProductModal = document.getElementById('add-product-modal');
    const addProductModalOverlay = document.getElementById('add-product-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addProductForm = document.getElementById('add-product-form');
    const readProductModal = document.getElementById('read-product-modal');
    const readProductModalOverlay = document.getElementById('read-product-modal-overlay');
    const closeReadModalBtn = document.getElementById('close-read-modal-btn');
    const readModalContent = document.getElementById('read-modal-content');
    const formTitle = addProductModal.querySelector('h2');
    const formSubmitBtn = addProductForm.querySelector('button[type="submit"]');

    // --- MODAL FUNCTIONS ---
    const openAddEditModal = (productId = null) => {
        if (productId) {
            currentlyEditingId = productId;
            const product = allProducts.find(p => p.id === productId);
            if (!product) return;
            formTitle.textContent = 'Edit Produk';
            formSubmitBtn.textContent = 'Simpan Perubahan';
            addProductForm.elements.name.value = product.name;
            addProductForm.elements.tagline.value = product.tagline;
            addProductForm.elements.price.value = product.price;
            addProductForm.elements.image.value = product.image;
            addProductForm.elements.category.value = product.category;
        } else {
            currentlyEditingId = null;
            formTitle.textContent = 'Tambah Produk Baru';
            formSubmitBtn.textContent = 'Simpan Produk';
        }
        addProductModal.classList.add('active');
        addProductModalOverlay.classList.add('active');
    };
    const closeAddEditModal = () => {
        addProductModal.classList.remove('active');
        addProductModalOverlay.classList.remove('active');
        addProductForm.reset();
        currentlyEditingId = null;
    };
    const openReadProductModal = (product) => {
        if (!product || !readModalContent) return;
        readModalContent.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="tagline">${product.tagline}</p>
            <p class="price">Rp ${product.price.toLocaleString('id-ID')}</p>
            <span class="category">${product.category}</span>
        `;
        readProductModal.classList.add('active');
        readProductModalOverlay.classList.add('active');
    };
    const closeReadProductModal = () => {
        readProductModal.classList.remove('active');
        readProductModalOverlay.classList.remove('active');
    };

    // --- CART FUNCTIONS ---
    const openCart = () => { if(cartPanelEl) cartPanelEl.classList.add('active'); if(cartOverlayEl) cartOverlayEl.classList.add('active'); };
    const closeCart = () => { if(cartPanelEl) cartPanelEl.classList.remove('active'); if(cartOverlayEl) cartOverlayEl.classList.remove('active'); };
    const updateCartTotals = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => {
            const product = allProducts.find(p => p.id === item.id);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
        if (cartToggleBtnEl) cartToggleBtnEl.textContent = `Keranjang (${totalItems})`;
        if (cartTotalPriceEl) cartTotalPriceEl.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    };
    const updateCartUI = () => {
        if (!cartItemsContainerEl) return;
        if (cart.length === 0) {
            cartItemsContainerEl.innerHTML = '<p class="cart-empty-msg">Keranjang Anda kosong.</p>';
        } else {
            cartItemsContainerEl.innerHTML = cart.map(item => {
                const product = allProducts.find(p => p.id === item.id);
                if (!product) return '';
                return `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${product.image}" alt="${product.name}" class="cart-item__image">
                        <div class="cart-item__details">
                            <p class="cart-item__name">${product.name}</p>
                            <p class="cart-item__price">Rp ${product.price.toLocaleString('id-ID')}</p>
                            <div class="cart-item__quantity-controls">
                                <button class="quantity-btn decrease-qty" data-id="${item.id}">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn increase-qty" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <button class="remove-item-btn" data-id="${item.id}">&times;</button>
                    </div>
                `;
            }).join('');
        }
        updateCartTotals();
    };
    const addToCart = (productId) => {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, quantity: 1 });
        }
        updateCartUI();
        openCart();
    };
    const handleCartActions = (e) => {
        const target = e.target;
        const productId = parseInt(target.dataset.id);
        if (isNaN(productId)) return;
        const itemInCart = cart.find(i => i.id === productId);
        if (!itemInCart) return;
        if (target.classList.contains('increase-qty')) {
            itemInCart.quantity++;
        } else if (target.classList.contains('decrease-qty')) {
            if (itemInCart.quantity > 1) {
                itemInCart.quantity--;
            } else {
                cart = cart.filter(i => i.id !== productId);
            }
        } else if (target.classList.contains('remove-item-btn')) {
            cart = cart.filter(i => i.id !== productId);
        }
        updateCartUI();
    };

    // --- PRODUCT CRUD FUNCTIONS ---
    const handleProductFormSubmit = (e) => {
        e.preventDefault();
        const formElements = addProductForm.elements;
        const productData = {
            name: formElements.name.value.trim(),
            tagline: formElements.tagline.value.trim(),
            price: parseInt(formElements.price.value, 10),
            image: formElements.image.value.trim() || 'images/product_placeholder.png',
            category: formElements.category.value
        };
        if (!productData.name || !productData.tagline || isNaN(productData.price) || !productData.category) {
            alert('Harap isi semua field yang wajib diisi.');
            return;
        }
        if (currentlyEditingId) {
            allProducts = allProducts.map(p => p.id === currentlyEditingId ? { ...p, ...productData } : p);
        } else {
            allProducts.push({ id: Date.now(), ...productData });
        }
        saveProductsToStorage(allProducts);
        loadProducts();
        closeAddEditModal();
    };
    const handleDeleteProduct = (productId) => {
        const productName = allProducts.find(p => p.id === productId)?.name || 'produk ini';
        if (confirm(`Apakah Anda yakin ingin menghapus ${productName}?`)) {
            allProducts = allProducts.filter(p => p.id !== productId);
            saveProductsToStorage(allProducts);
            loadProducts();
        }
    };

    // --- RENDER & INIT FUNCTIONS ---
    const loadProducts = () => {
        if (!productListEl) return;
        productListEl.innerHTML = allProducts.map(product => `
            <div class="product-card" data-id="${product.id}" data-category="${product.category}">
                <div class="product-card-actions">
                    <button class="edit-product-btn" data-id="${product.id}" title="Edit Produk">&#9998;</button>
                    <button class="delete-product-btn" data-id="${product.id}" title="Hapus Produk">&times;</button>
                </div>
                <img src="${product.image}" alt="${product.name}" class="product-card__image">
                <div class="product-card__content">
                    <h3 class="product-card__name">${product.name}</h3>
                    <p class="product-card__tagline">${product.tagline}</p>
                    <p class="product-card__price">Rp ${product.price.toLocaleString('id-ID')}</p>
                    <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Tambah ke Keranjang</button>
                </div>
            </div>
        `).join('');
    };
    const initProductFilter = () => {
        const filterContainer = document.querySelector('.filter-controls');
        if (!filterContainer) return;
        filterContainer.addEventListener('click', (e) => {
            const target = e.target.closest('.filter-btn');
            if (!target) return;
            filterContainer.querySelector('.active').classList.remove('active');
            target.classList.add('active');
            const selectedCategory = target.dataset.category;
            document.querySelectorAll('.product-card').forEach(card => {
                card.style.display = (selectedCategory === 'all' || selectedCategory === card.dataset.category) ? 'flex' : 'none';
            });
        });
    };
    const initTestimonialCarousel = () => {
        const carousel = document.querySelector('.testimonial-carousel');
        if (!carousel) return;
        const wrapper = carousel.querySelector('.testimonial-wrapper');
        const slides = carousel.querySelectorAll('.testimonial-slide');
        const prevBtn = carousel.querySelector('.prev-btn');
        const nextBtn = carousel.querySelector('.next-btn');
        let currentSlide = 0;
        const totalSlides = slides.length;
        if (totalSlides <= 1) {
            if(prevBtn) prevBtn.style.display = 'none';
            if(nextBtn) nextBtn.style.display = 'none';
            return;
        }
        const goToSlide = (slideIndex) => {
            wrapper.style.transform = `translateX(-${slideIndex * 100}%)`;
            currentSlide = slideIndex;
        };
        nextBtn.addEventListener('click', () => goToSlide((currentSlide + 1) % totalSlides));
        prevBtn.addEventListener('click', () => goToSlide((currentSlide - 1 + totalSlides) % totalSlides));
    };
    const initScrollAnimations = () => {
        const sections = document.querySelectorAll('.fade-in-section');
        if (!sections.length) return;
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        sections.forEach(section => observer.observe(section));
    };

    // --- EVENT LISTENERS ---
    if (cartToggleBtnEl) cartToggleBtnEl.addEventListener('click', openCart);
    if (closeCartBtnEl) closeCartBtnEl.addEventListener('click', closeCart);
    if (cartOverlayEl) cartOverlayEl.addEventListener('click', closeCart);
    if (cartItemsContainerEl) cartItemsContainerEl.addEventListener('click', handleCartActions);
    if (addProductBtn) addProductBtn.addEventListener('click', () => openAddEditModal());
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddEditModal);
    if (addProductModalOverlay) addProductModalOverlay.addEventListener('click', closeAddEditModal);
    if (addProductForm) addProductForm.addEventListener('submit', handleProductFormSubmit);
    if (closeReadModalBtn) closeReadModalBtn.addEventListener('click', closeReadProductModal);
    if (readProductModalOverlay) readProductModalOverlay.addEventListener('click', closeReadProductModal);

    if (productListEl) {
        productListEl.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;
            const productId = parseInt(card.dataset.id);
            const addToCartBtn = e.target.closest('.add-to-cart-btn');
            const deleteBtn = e.target.closest('.delete-product-btn');
            const editBtn = e.target.closest('.edit-product-btn');

            if (addToCartBtn) {
                addToCart(productId);
            } else if (deleteBtn) {
                handleDeleteProduct(productId);
            } else if (editBtn) {
                openAddEditModal(productId);
            } else {
                const product = allProducts.find(p => p.id === productId);
                if (product) {
                    openReadProductModal(product);
                }
            }
        });
    }

    // --- INITIALIZATION ---
    if (localStorage.getItem('galacticPaws.products') === null) {
        saveProductsToStorage(productData);
        allProducts = productData;
    }
    loadProducts();
    initProductFilter();
    initTestimonialCarousel();
    initScrollAnimations();
    updateCartUI();
});

document.addEventListener('DOMContentLoaded', async () => {
    // --- STATE ---
    let allProducts = [];
    let cart = [];

    // --- SELECTORS ---
    const productListEl = document.getElementById('product-list');
    const cartPanelEl = document.getElementById('cart-panel');
    const cartOverlayEl = document.getElementById('cart-overlay');
    const cartItemsContainerEl = document.getElementById('cart-items');
    const cartToggleBtnEl = document.querySelector('.cart-toggle-btn');
    const closeCartBtnEl = document.getElementById('close-cart-btn');
    const cartTotalPriceEl = document.getElementById('cart-total-price');

    // --- FUNCTIONS ---

    const openCart = () => {
        cartPanelEl.classList.add('active');
        cartOverlayEl.classList.add('active');
    };

    const closeCart = () => {
        cartPanelEl.classList.remove('active');
        cartOverlayEl.classList.remove('active');
    };

    const updateCartTotals = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => {
            const product = allProducts.find(p => p.id === item.id);
            return sum + (product.price * item.quantity);
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
                if (!product) return ''; // Should not happen
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

    const loadProducts = async () => {
        if (!productListEl) return;
        productListEl.innerHTML = '<p>Loading products...</p>';
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const products = await response.json();
            allProducts = products; // Store products in state

            productListEl.innerHTML = products.map(product => `
                <div class="product-card" data-id="${product.id}" data-category="${product.category}" style="display: flex;">
                    <img src="${product.image}" alt="${product.name}" class="product-card__image">
                    <div class="product-card__content">
                        <h3 class="product-card__name">${product.name}</h3>
                        <p class="product-card__tagline">${product.tagline}</p>
                        <p class="product-card__price">Rp ${product.price.toLocaleString('id-ID')}</p>
                        <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Tambah ke Keranjang</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error("Could not load products:", error);
            productListEl.innerHTML = '<p style="color: red;">Gagal memuat produk.</p>';
        }
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

    // --- EVENT LISTENERS ---
    if (cartToggleBtnEl) cartToggleBtnEl.addEventListener('click', openCart);
    if (closeCartBtnEl) closeCartBtnEl.addEventListener('click', closeCart);
    if (cartOverlayEl) cartOverlayEl.addEventListener('click', closeCart);
    if (cartItemsContainerEl) cartItemsContainerEl.addEventListener('click', handleCartActions);
    if (productListEl) {
        productListEl.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const productId = parseInt(e.target.closest('.product-card').dataset.id);
                addToCart(productId);
            }
        });
    }

    // --- INITIALIZATION ---
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

    await loadProducts();
    initProductFilter();
    initTestimonialCarousel();
    initScrollAnimations();
    updateCartUI(); // Initial UI update
});

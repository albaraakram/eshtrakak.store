
    const API_CLICKS = 'http://localhost:3000/api/clicks';
    const API_PRODUCTS = 'http://localhost:3000/api/products';

    let clickData = {};
    let productsData = [];

    async function fetchClicks() {
      try {
        const res = await fetch(API_CLICKS);
        clickData = await res.json();
      } catch (e) {
        clickData = {};
      }
    }

    async function fetchProducts() {
      try {
        const res = await fetch(API_PRODUCTS);
        productsData = await res.json();
      } catch (e) {
        console.error('Failed to load products');
      }
    }

    function renderProducts() {
      const grid = document.querySelector('.products-grid');
      grid.innerHTML = '';
      
      productsData.forEach(p => {
        const count = clickData[p.id] || 0;
        const cardHTML = `
        <div class="product-card fade-in" data-id="${p.id}">
          <div class="click-badge ${count > 0 ? '' : 'hidden'}">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg><span>${count} طلب</span>
          </div>
          <div class="product-icon">${p.iconHtml}</div>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-description">${p.description}</p>
          <div class="price-container">
            <span class="price-original">$${p.priceOriginal}</span>
            <span class="price-sale">$${p.priceSale}</span>
            <span class="price-period">${p.period}</span>
          </div>
          <a href="https://wa.me/967770989901?text=${encodeURIComponent('السلام عليكم، أبي أطلب اشتراك ' + p.name)}" target="_blank" class="btn btn-whatsapp">
            <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            اطلب الآن
          </a>
        </div>`;
        grid.insertAdjacentHTML('beforeend', cardHTML);
      });

      document.querySelectorAll('.product-card.fade-in').forEach(el => observer.observe(el));
      attachClickListeners();
    }

    function renderBadges() {
      document.querySelectorAll('.product-card[data-id]').forEach(card => {
        const id    = card.dataset.id;
        const count = clickData[id] || 0;
        let badge   = card.querySelector('.click-badge');
        if (badge) {
          if (count > 0) {
            badge.classList.remove('hidden');
            badge.querySelector('span').textContent = count + ' طلب';
          } else {
            badge.classList.add('hidden');
          }
        }
      });
    }

    function sortCards(animateId) {
      const grid  = document.querySelector('.products-grid');
      const cards = Array.from(grid.querySelectorAll('.product-card[data-id]'));
      cards.sort((a, b) => (clickData[b.dataset.id] || 0) - (clickData[a.dataset.id] || 0));
      cards.forEach(c => c.classList.remove('rank-first'));
      cards.forEach((card, idx) => {
        if (card.dataset.id === animateId) {
          card.classList.add('sorting');
          setTimeout(() => card.classList.remove('sorting'), 500);
        }
        if (idx === 0) card.classList.add('rank-first');
        grid.appendChild(card);
      });
    }

    function attachClickListeners() {
      document.querySelectorAll('.product-card[data-id] .btn-whatsapp').forEach(btn => {
        btn.addEventListener('click', async () => {
          const card = btn.closest('.product-card[data-id]');
          const id   = card.dataset.id;
          clickData[id] = (clickData[id] || 0) + 1;
          renderBadges();
          sortCards(id);
          try {
            const res  = await fetch(`${API_CLICKS}/${id}`, { method: 'POST' });
            const data = await res.json();
            clickData[id] = data.count;
            renderBadges();
            sortCards(null);
          } catch (e) {}
        });
      });
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.faq-question').forEach(item => {
      item.addEventListener('click', () => {
        const parent = item.parentElement;
        parent.classList.toggle('active');
        const icon = item.querySelector('span');
        icon.textContent = parent.classList.contains('active') ? '▲' : '▼';
      });
    });

    const menuBtn  = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    menuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });

    // ─── ADMIN LOGIC ──────────────────────────────────────────────────────────
    const adminTrigger = document.getElementById('admin-trigger');
    const adminModal = document.getElementById('admin-modal');
    const closeAdmin = document.getElementById('close-admin');
    const adminSave = document.getElementById('admin-save');
    const adminAddProduct = document.getElementById('admin-add-product');
    const adminProductsContainer = document.getElementById('admin-products-container');
    let adminPassword = '';

    adminTrigger.addEventListener('click', () => {
      const pass = prompt('الرجاء إدخال كلمة المرور للوحة التحكم:');
      if (pass === 'HelloWolrd') {
        adminPassword = pass;
        openAdminPanel();
      } else if (pass) {
        alert('كلمة المرور خاطئة!');
      }
    });

    closeAdmin.addEventListener('click', () => adminModal.style.display = 'none');

    function renderAdminProducts() {
      adminProductsContainer.innerHTML = '';
      productsData.forEach((p, idx) => {
        adminProductsContainer.innerHTML += `
          <div style="background:var(--bg-primary); padding:15px; margin-bottom:15px; border-radius:8px; display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h3 style="margin:0; color:var(--accent);">منتج: ${p.name}</h3>
              <button onclick="removeProduct(${idx})" style="background:var(--danger); border:none; color:white; padding:5px 10px; border-radius:4px; cursor:pointer;">حذف</button>
            </div>
            <input type="text" value="${p.id}" onchange="updateProduct(${idx}, 'id', this.value)" placeholder="ID (إنجليزي بدون مسافات)" style="padding:8px; border-radius:4px; border:none; background:var(--bg-secondary); color:white;">
            <input type="text" value="${p.name}" onchange="updateProduct(${idx}, 'name', this.value)" placeholder="اسم المنتج" style="padding:8px; border-radius:4px; border:none; background:var(--bg-secondary); color:white;">
            <input type="text" value="${p.description}" onchange="updateProduct(${idx}, 'description', this.value)" placeholder="الوصف" style="padding:8px; border-radius:4px; border:none; background:var(--bg-secondary); color:white;">
            <div style="display:flex; gap:10px;">
              <input type="text" value="${p.priceOriginal}" onchange="updateProduct(${idx}, 'priceOriginal', this.value)" placeholder="السعر الأصلي" style="padding:8px; border-radius:4px; border:none; flex:1; background:var(--bg-secondary); color:white;">
              <input type="text" value="${p.priceSale}" onchange="updateProduct(${idx}, 'priceSale', this.value)" placeholder="سعر التخفيض" style="padding:8px; border-radius:4px; border:none; flex:1; background:var(--bg-secondary); color:white;">
            </div>
            <input type="text" value="${p.period}" onchange="updateProduct(${idx}, 'period', this.value)" placeholder="المدة (مثل: / شهر)" style="padding:8px; border-radius:4px; border:none; background:var(--bg-secondary); color:white;">
            <textarea onchange="updateProduct(${idx}, 'iconHtml', this.value)" placeholder="كود أيقونة SVG أو رابط صورة img" style="padding:8px; border-radius:4px; border:none; height:60px; background:var(--bg-secondary); color:white; font-family:monospace; direction:ltr;">${p.iconHtml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
          </div>
        `;
      });
    }

    window.updateProduct = (idx, field, value) => {
      productsData[idx][field] = value;
    };
    
    window.removeProduct = (idx) => {
      if(confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        productsData.splice(idx, 1);
        renderAdminProducts();
      }
    };

    adminAddProduct.addEventListener('click', () => {
      productsData.push({
        id: 'new_product_' + Date.now(),
        name: 'منتج جديد',
        description: 'وصف المنتج',
        priceOriginal: '20',
        priceSale: '10',
        period: '/ شهر',
        iconHtml: '<svg viewBox="0 0 24 24" fill="gray"><path d="M12 2L2 22h20L12 2z"/></svg>'
      });
      renderAdminProducts();
      adminProductsContainer.scrollTop = adminProductsContainer.scrollHeight;
    });

    adminSave.addEventListener('click', async () => {
      adminSave.textContent = 'جاري الحفظ...';
      try {
        const res = await fetch(API_PRODUCTS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': adminPassword
          },
          body: JSON.stringify(productsData)
        });
        if (res.ok) {
          alert('تم حفظ التغييرات بنجاح!');
          renderProducts();
          sortCards(null);
          adminModal.style.display = 'none';
        } else {
          alert('خطأ أو كلمة مرور غير صحيحة!');
        }
      } catch(e) {
        alert('خطأ في الاتصال بالسيرفر!');
      }
      adminSave.textContent = 'حفظ التغييرات';
    });

    // ─── Init ─────────────────────────────────────────────────────────────────
    (async () => {
      await fetchProducts();
      await fetchClicks();
      renderProducts();
      sortCards(null);
    })();
  
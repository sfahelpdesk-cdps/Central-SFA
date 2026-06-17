// =============================================================
// CENTRAL SFA - API Client & State Management (FIXED v2)
// =============================================================

const SFA = (() => {

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  const state = {
    user:  JSON.parse(sessionStorage.getItem('sfa_user')  || 'null'),
    token: sessionStorage.getItem('sfa_token') || null,
    currentOutlet: null,
    cart: JSON.parse(sessionStorage.getItem('sfa_cart') || '[]'),
  };

  // ─────────────────────────────────────────────
  // API HELPER
  // ─────────────────────────────────────────────
  async function api(action, params = {}, method = 'GET') {
    const apiUrl = localStorage.getItem('sfa_api_url') || '';

    // FIXED: Validasi ketat
    if (!apiUrl || !apiUrl.includes('script.google.com')) {
      UI.showToast('URL API belum diatur. Klik ⚙ Atur URL API.', 'error');
      throw new Error('API URL belum diatur');
    }

    let fetchUrl, options;

    // FIXED: Semua request pakai GET dengan query string (Apps Script Web App compatible)
    const url = new URL(apiUrl);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
      }
    });
    fetchUrl = url.toString();
    options  = { method: 'GET' };

    UI.showLoader();
    try {
      const res  = await fetch(fetchUrl, options);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Server error');
      return data;
    } catch (err) {
      if (err.message !== 'API URL belum diatur') {
        UI.showToast('Error: ' + err.message, 'error');
      }
      throw err;
    } finally {
      UI.hideLoader();
    }
  }

  // ─────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────
  const Auth = {
    async login(username, password) {
      const res = await api('login', { username, password });
      state.token = res.token;
      state.user  = res.user;
      sessionStorage.setItem('sfa_token', res.token);
      sessionStorage.setItem('sfa_user',  JSON.stringify(res.user));
      return res.user;
    },
    logout() {
      sessionStorage.clear();
      state.token = null;
      state.user  = null;
      Router.go('login');
    },
    isLoggedIn() {
      return !!state.token && !!state.user;
    },
    requireAuth() {
      if (!Auth.isLoggedIn()) {
        Router.go('login');
        return false;
      }
      return true;
    },
  };

  // ─────────────────────────────────────────────
  // DATA FETCHERS
  // ─────────────────────────────────────────────
  const Data = {
    getDashboard:    ()          => api('getDashboard',    { userId: state.user?.id }),
    getRoutes:       ()          => api('getRoutes',       { userId: state.user?.id }),
    getOutletDetail: (outletId)  => api('getOutletDetail', { outletId }),
    checkIn:  (outletId, lat, lng) => api('checkIn',  { salesId: state.user?.id, outletId, lat, lng }),
    checkOut: (outletId, notes)    => api('checkOut', { salesId: state.user?.id, outletId, notes }),
    saveOrder: (outletId, items)   => api('saveOrder', { salesId: state.user?.id, outletId, items }),
    getOrders: (limit = 20)        => api('getOrders', { userId: state.user?.id, limit }),
  };

  // ─────────────────────────────────────────────
  // CART
  // ─────────────────────────────────────────────
  const Cart = {
    items: () => state.cart,
    add(product, qty) {
      const existing = state.cart.find(i => i.sku === product.sku);
      if (qty <= 0) { Cart.remove(product.sku); return; }
      if (existing) { existing.qty = qty; }
      else { state.cart.push({ ...product, qty }); }
      Cart._save();
    },
    remove(sku) {
      state.cart = state.cart.filter(i => i.sku !== sku);
      Cart._save();
    },
    total() { return state.cart.reduce((s, i) => s + i.qty * i.price, 0); },
    count() { return state.cart.reduce((s, i) => s + i.qty, 0); },
    clear() { state.cart = []; Cart._save(); },
    _save() { sessionStorage.setItem('sfa_cart', JSON.stringify(state.cart)); },
  };

  // ─────────────────────────────────────────────
  // ROUTER  (hash-based SPA) — FIXED
  // ─────────────────────────────────────────────
  const Router = {
    routes: {},
    register(name, fn) { 
      this.routes[name] = fn; 
    },
    go(name, params = {}) {
      const qs = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
      window.location.hash = '#' + name + qs;
    },
    init() {
      // Listen hash changes
      window.addEventListener('hashchange', () => Router._resolve());
      // Resolve immediately on load
      setTimeout(() => Router._resolve(), 50);
    },
    _resolve() {
      const raw = window.location.hash.slice(1) || 'login';
      const [name, qs] = raw.split('?');
      const params = Object.fromEntries(new URLSearchParams(qs || ''));

      console.log('🔀 Router resolve:', name, 'params:', params);
      console.log('📋 Available routes:', Object.keys(Router.routes));

      const handler = Router.routes[name];
      if (handler && typeof handler === 'function') {
        handler(params);
      } else {
        console.warn('⚠️ Route not found:', name);
        const fallback = Router.routes['404'] || Router.routes['login'];
        if (fallback) fallback(params);
      }
    },
  };

  // ─────────────────────────────────────────────
  // UI HELPERS
  // ─────────────────────────────────────────────
  const UI = {
    showLoader() {
      document.getElementById('global-loader')?.classList.remove('hidden');
    },
    hideLoader() {
      document.getElementById('global-loader')?.classList.add('hidden');
    },
    showToast(msg, type = 'info') {
      const toast = document.getElementById('toast');
      if (!toast) return;
      const colors = { info: 'bg-gray-900', error: 'bg-red-600', success: 'bg-green-600' };
      toast.className = `fixed bottom-28 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-full text-white text-sm font-medium shadow-lg transition-opacity duration-300 pointer-events-none ${colors[type] || colors.info}`;
      toast.textContent = msg;
      toast.style.opacity = '1';
      clearTimeout(UI._toastTimer);
      UI._toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 3500);
    },
    render(html) {
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = html;
        // Re-trigger animation
        app.style.animation = 'none';
        app.offsetHeight; // trigger reflow
        app.style.animation = '';
      }
    },
    formatRupiah(n) {
      return 'Rp\u00a0' + Number(n || 0).toLocaleString('id-ID');
    },
    formatDate(str) {
      if (!str) return '-';
      return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    getGreeting() {
      const h = new Date().getHours();
      if (h < 12) return 'Selamat Pagi';
      if (h < 15) return 'Selamat Siang';
      if (h < 18) return 'Selamat Sore';
      return 'Selamat Malam';
    },
  };

  // ─────────────────────────────────────────────
  // GEOLOCATION HELPER
  // ─────────────────────────────────────────────
  const Geo = {
    get() {
      return new Promise(resolve => {
        if (!navigator.geolocation) return resolve({ lat: null, lng: null });
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          ()  => resolve({ lat: null, lng: null }),
          { timeout: 6000 }
        );
      });
    },
  };

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return {
    state, Auth, Data, Cart, Router, UI, Geo,
    setApiUrl(url) {
      if (url && url.trim()) {
        localStorage.setItem('sfa_api_url', url.trim());
        location.reload();
      }
    },
    getApiUrl() {
      return localStorage.getItem('sfa_api_url') || '';
    },
  };

})();

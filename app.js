// =============================================================
// CENTRAL SFA - API Client & State Management
// =============================================================

const SFA = (() => {

  // ── Ganti URL ini setelah deploy Apps Script ──
const API_URL = localStorage.getItem('sfa_api_url') || 'https://script.google.com/macros/s/AKfycby1EvEx2IulsP3GtiwGZg9u_YNWxQk2s0UzbbJNMD3AoelxNB2WnbO7PLVBwQgnJ8OFjw/exec';
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
    const apiUrl = localStorage.getItem('sfa_api_url') || API_URL;

    let options;
    if (method === 'GET') {
      url.searchParams.set('action', action);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      options = { method: 'GET' };
    } else {
      options = {
        method: 'POST',
        body: JSON.stringify({ action, ...params }),
      };
    }

    UI.showLoader();
    try {
      const res  = await fetch(url.toString(), options);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Server error');
      return data;
    } catch (err) {
      UI.showToast(err.message, 'error');
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
      const res = await api('login', { username, password }, 'POST');
      state.token = res.token;
      state.user  = res.user;
      sessionStorage.setItem('sfa_token',  res.token);
      sessionStorage.setItem('sfa_user',   JSON.stringify(res.user));
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
      if (!Auth.isLoggedIn()) Router.go('login');
    },
  };

  // ─────────────────────────────────────────────
  // DATA FETCHERS
  // ─────────────────────────────────────────────
  const Data = {
    getDashboard: () => api('getDashboard', { userId: state.user?.id }),
    getRoutes:    () => api('getRoutes',    { userId: state.user?.id }),
    getOutletDetail: (outletId) => api('getOutletDetail', { outletId }),
    checkIn:  (outletId, lat, lng) => api('checkIn',  { salesId: state.user?.id, outletId, lat, lng }, 'POST'),
    checkOut: (outletId, notes)    => api('checkOut', { salesId: state.user?.id, outletId, notes }, 'POST'),
    saveOrder: (outletId, items)   => api('saveOrder', { salesId: state.user?.id, outletId, items }, 'POST'),
    getOrders: (limit = 20)        => api('getOrders', { userId: state.user?.id, limit }),
  };

  // ─────────────────────────────────────────────
  // CART
  // ─────────────────────────────────────────────
  const Cart = {
    items: () => state.cart,
    add(product, qty) {
      const existing = state.cart.find(i => i.sku === product.sku);
      if (existing) { existing.qty = qty; }
      else { state.cart.push({ ...product, qty }); }
      if (qty <= 0) Cart.remove(product.sku);
      Cart._save();
    },
    remove(sku) {
      state.cart = state.cart.filter(i => i.sku !== sku);
      Cart._save();
    },
    total() {
      return state.cart.reduce((sum, i) => sum + i.qty * i.price, 0);
    },
    count() {
      return state.cart.reduce((sum, i) => sum + i.qty, 0);
    },
    clear() {
      state.cart = [];
      Cart._save();
    },
    _save() {
      sessionStorage.setItem('sfa_cart', JSON.stringify(state.cart));
    },
  };

  // ─────────────────────────────────────────────
  // ROUTER  (hash-based SPA)
  // ─────────────────────────────────────────────
  const Router = {
    routes: {},
    register(name, fn) { this.routes[name] = fn; },
    go(name, params = {}) {
      window.location.hash = '#' + name + (Object.keys(params).length ? '?' + new URLSearchParams(params) : '');
    },
    init() {
      window.addEventListener('hashchange', Router._resolve);
      Router._resolve();
    },
    _resolve() {
      const hash    = window.location.hash.slice(1) || 'login';
      const [name, qs] = hash.split('?');
      const params  = Object.fromEntries(new URLSearchParams(qs || ''));
      const handler = Router.routes[name] || Router.routes['404'];
      if (handler) handler(params);
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
      const colors = { info: 'bg-[#1b1c1c]', error: 'bg-red-700', success: 'bg-green-700' };
      toast.className = `fixed bottom-28 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-full text-white text-sm font-medium shadow-lg transition-all duration-300 ${colors[type]}`;
      toast.textContent = msg;
      toast.style.opacity = '1';
      clearTimeout(UI._toastTimer);
      UI._toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
    },
    render(html) {
      document.getElementById('app').innerHTML = html;
    },
    formatRupiah(n) {
      return 'Rp ' + Number(n).toLocaleString('id-ID');
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
      return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve({ lat: null, lng: null });
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          ()  => resolve({ lat: null, lng: null }),
          { timeout: 5000 }
        );
      });
    },
  };

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return { state, Auth, Data, Cart, Router, UI, Geo, API_URL,
    setApiUrl(url) {
      localStorage.setItem('sfa_api_url', url);
      location.reload();
    }
  };

})();

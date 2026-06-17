// =============================================================
// CENTRAL SFA - Page Renderers (FIXED v2)
// =============================================================

// ─────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────
function bottomNav(active) {
  const tabs = [
    { key: 'dashboard', icon: 'dashboard',  label: 'Dashboard' },
    { key: 'routes',    icon: 'route',       label: 'Route' },
    { key: 'orders',    icon: 'history',     label: 'History' },
    { key: 'profile',   icon: 'person',      label: 'Profil' },
  ];
  return `
  <nav class="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 bg-white border-t border-gray-100 z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] pb-2">
    ${tabs.map(t => {
      const isActive = t.key === active;
      return `
      <button onclick="SFA.Router.go('${t.key}')"
        class="flex flex-col items-center justify-center gap-1 px-4 py-1 rounded-2xl transition-all duration-200
               ${isActive ? 'bg-red-50 text-[#bb000f]' : 'text-gray-400 hover:text-gray-600'}">
        <span class="material-symbols-outlined text-[22px]" style="${isActive ? "font-variation-settings:'FILL' 1" : ''}">${t.icon}</span>
        <span class="text-[10px] font-semibold tracking-wide">${t.label}</span>
      </button>`;
    }).join('')}
  </nav>`;
}

function topBar(title, showBack = false, rightSlot = '') {
  return `
  <header class="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
    <div class="flex items-center justify-between h-14 px-4 max-w-xl mx-auto">
      <div class="flex items-center gap-3">
        ${showBack ? `<button onclick="history.back()" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <span class="material-symbols-outlined text-gray-700">arrow_back</span></button>` : ''}
        <span class="font-bold text-gray-900 text-lg">${title}</span>
      </div>
      <div class="flex items-center gap-2">${rightSlot}</div>
    </div>
  </header>`;
}

// ─────────────────────────────────────────────────────────────
// PAGE: LOGIN
// ─────────────────────────────────────────────────────────────
Pages.login = function() {
  SFA.UI.render(`
  <div class="min-h-screen bg-gradient-to-br from-[#bb000f] to-[#7a0009] flex flex-col items-center justify-center px-6 py-12">
    <div class="w-full max-w-sm">

      <!-- Logo -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-5">
          <span class="material-symbols-outlined text-[#bb000f] text-[42px]" style="font-variation-settings:'FILL' 1">storefront</span>
        </div>
        <h1 class="text-white text-3xl font-black tracking-tight">Central SFA</h1>
        <p class="text-red-200 text-sm mt-1 font-medium">Sales Force Automation</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-7">
        <h2 class="text-gray-800 text-xl font-bold mb-6">Masuk ke Akun</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Username / SFA ID</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">person</span>
              <input id="inp-username" type="text" placeholder="Masukkan username"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bb000f]/30 focus:border-[#bb000f] text-gray-800 font-medium transition-all"
                autocomplete="username" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
              <input id="inp-password" type="password" placeholder="••••••••"
                class="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bb000f]/30 focus:border-[#bb000f] text-gray-800 font-medium transition-all"
                autocomplete="current-password" />
              <button onclick="togglePwd()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <span class="material-symbols-outlined text-[20px]" id="pwd-eye">visibility</span>
              </button>
            </div>
          </div>

          <button onclick="doLogin()"
            class="w-full bg-[#bb000f] hover:bg-[#a0000d] text-white font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-red-900/30 mt-2 flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[20px]">login</span>
            Masuk
          </button>
        </div>

        <p class="text-center text-xs text-gray-400 mt-6">
          Akses terbatas untuk personel terotorisasi
        </p>
      </div>

      <!-- API URL setter (dev helper) -->
      <button onclick="setApiUrl()" class="mt-6 text-red-200 text-xs underline w-full text-center">
        ⚙ Atur URL API
      </button>
    </div>
  </div>`);
};

function togglePwd() {
  const el = document.getElementById('inp-password');
  const eye = document.getElementById('pwd-eye');
  if (el.type === 'password') { el.type = 'text'; eye.textContent = 'visibility_off'; }
  else { el.type = 'password'; eye.textContent = 'visibility'; }
}

// FIXED: Login dengan error handling lengkap
async function doLogin() {
  const username = document.getElementById('inp-username').value.trim();
  const password = document.getElementById('inp-password').value;

  if (!username || !password) { 
    SFA.UI.showToast('Username dan password wajib diisi', 'error'); 
    return; 
  }

  console.log('🔑 Attempting login:', username);

  try {
    const user = await SFA.Auth.login(username, password);
    console.log('✅ Login success:', user);
    SFA.UI.showToast('Selamat datang, ' + user.name + '!', 'success');

    // FIXED: Gunakan window.location untuk force redirect
    setTimeout(() => {
      window.location.hash = '#dashboard';
    }, 500);

  } catch(err) {
    console.error('❌ Login failed:', err);
    // Error toast sudah ditampilkan oleh SFA.api()
  }
}

function setApiUrl() {
  const url = prompt('Masukkan URL Apps Script Web App:');
  if (url) SFA.setApiUrl(url);
}

// ─────────────────────────────────────────────────────────────
// PAGE: DASHBOARD
// ─────────────────────────────────────────────────────────────
Pages.dashboard = async function() {
  if (!SFA.Auth.requireAuth()) return;
  const user = SFA.state.user;

  SFA.UI.render(`
  ${topBar(`
    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEpe79vwpkG96zVvso77dmrPFNk8UpwKLEEiZzt5Ckikq996vsxAsL-6w2Qide9ugRavcRuIviBLshQ3bDGnCb4DlGupd_H7Mtda1z6f8T5LkaIki4qUvRnWh_4S9xu7e_ppcZhfAoyrP_xq3xlUDRRWVRWs4sHYd68qSl4vkzdtP_XVOEekpT7pjkt4M91buEoCj3dRPw7zPMNDZqKLu9Mj0JqXVllv3UwS0_Kd2AwJ_sAjehUWYlpijuEf1_5HW32IfJR-yXTIrP" class="h-7 w-auto object-contain">
  `, false, `
    <button onclick="SFA.Router.go('profile')" class="w-9 h-9 rounded-full bg-red-50 border-2 border-[#bb000f]/20 flex items-center justify-center">
      <span class="material-symbols-outlined text-[#bb000f] text-[18px]" style="font-variation-settings:'FILL' 1">person</span>
    </button>
  `)}

  <main class="pb-24 px-4 max-w-xl mx-auto space-y-5 pt-4">

    <!-- Greeting -->
    <div>
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">${SFA.UI.getGreeting()}</p>
      <h2 class="text-2xl font-black text-gray-900 mt-0.5">${user.name.split(' ')[0]} <span class="text-[#bb000f]">👋</span></h2>
      <p class="text-sm text-gray-500">${user.area} · ${new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})}</p>
    </div>

    <!-- KPI Cards – loading state -->
    <div id="kpi-section">
      <div class="grid grid-cols-2 gap-3">
        ${[1,2,3,4].map(() => `<div class="bg-gray-100 animate-pulse h-24 rounded-2xl"></div>`).join('')}
      </div>
    </div>

    <!-- Quick Actions -->
    <div>
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Menu Cepat</h3>
      <div class="grid grid-cols-4 gap-3">
        ${[
          { icon: 'route',          label: 'Rute',     page: 'routes' },
          { icon: 'add_shopping_cart', label: 'Order', page: 'order' },
          { icon: 'history',        label: 'History',  page: 'orders' },
          { icon: 'person',         label: 'Profil',   page: 'profile' },
        ].map(a => `
          <button onclick="SFA.Router.go('${a.page}')"
            class="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md active:scale-95 transition-all">
            <div class="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-[#bb000f] text-[20px]">${a.icon}</span>
            </div>
            <span class="text-[10px] font-semibold text-gray-600">${a.label}</span>
          </button>`).join('')}
      </div>
    </div>

    <!-- Next Outlet placeholder -->
    <div id="next-outlet-section"></div>

  </main>
  ${bottomNav('dashboard')}`);

  // Load KPIs
  try {
    const { data: d } = await SFA.Data.getDashboard();
    const pct = d.achievement;
    document.getElementById('kpi-section').innerHTML = `
      <div class="grid grid-cols-2 gap-3">
        <div class="col-span-2 bg-gradient-to-br from-[#bb000f] to-[#e53935] text-white p-4 rounded-2xl shadow-lg shadow-red-900/20">
          <p class="text-red-200 text-xs font-semibold uppercase tracking-wider">Omzet Hari Ini</p>
          <p class="text-3xl font-black mt-1">${SFA.UI.formatRupiah(d.totalOmzet)}</p>
          <div class="mt-3 bg-white/20 h-2 rounded-full overflow-hidden">
            <div class="bg-white h-full rounded-full transition-all duration-1000" style="width:${pct}%"></div>
          </div>
          <p class="text-red-100 text-xs mt-1">${pct}% dari target harian</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p class="text-gray-400 text-xs font-semibold uppercase">Coverage</p>
          <p class="text-2xl font-black text-gray-900 mt-1">${d.doneCheckins}<span class="text-gray-400 text-base font-normal">/${d.totalOutlets}</span></p>
          <p class="text-xs text-[#bb000f] font-medium mt-1">${d.pendingCheckins} outlet tersisa</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p class="text-gray-400 text-xs font-semibold uppercase">Total Order</p>
          <p class="text-2xl font-black text-gray-900 mt-1">${d.totalOrders}</p>
          <p class="text-xs text-gray-400 mt-1">Transaksi hari ini</p>
        </div>
      </div>`;
  } catch(_) {}

  // Load next outlet from route
  try {
    const { data: routes } = await SFA.Data.getRoutes();
    const next = routes.find(r => r.status === 'Pending');
    if (next) {
      document.getElementById('next-outlet-section').innerHTML = `
        <div>
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Outlet Berikutnya</h3>
          <button onclick="SFA.Router.go('outlet',{id:'${next.outletId}'})"
            class="w-full bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-2xl p-4 text-left active:scale-[0.98] transition-all">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[#bb000f] text-[24px]" style="font-variation-settings:'FILL' 1">location_on</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900 truncate">${next.outletName}</p>
                <p class="text-xs text-gray-500 truncate mt-0.5">${next.address}</p>
                <span class="inline-block mt-1.5 bg-red-50 text-[#bb000f] text-[10px] font-bold px-2 py-0.5 rounded-full">${next.priority}</span>
              </div>
              <span class="material-symbols-outlined text-gray-300">chevron_right</span>
            </div>
          </button>
        </div>`;
    }
  } catch(_) {}
};

// ─────────────────────────────────────────────────────────────
// PAGE: ROUTES
// ─────────────────────────────────────────────────────────────
Pages.routes = async function() {
  if (!SFA.Auth.requireAuth()) return;

  SFA.UI.render(`
  ${topBar('Rencana Rute', false, `
    <span class="text-xs font-medium text-gray-500">${new Date().toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</span>
  `)}
  <main class="pb-24 px-4 max-w-xl mx-auto pt-4">
    <div class="mb-4 relative">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
      <input id="route-search" type="text" placeholder="Cari nama toko..."
        oninput="filterRoutes(this.value)"
        class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bb000f]/30 focus:border-[#bb000f] text-sm transition-all" />
    </div>
    <div id="route-summary" class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-4 animate-pulse h-16"></div>
    <div id="route-list" class="space-y-3">
      ${[1,2,3].map(() => `<div class="bg-gray-100 animate-pulse h-28 rounded-2xl"></div>`).join('')}
    </div>
  </main>
  ${bottomNav('routes')}`);

  try {
    const { data: routes } = await SFA.Data.getRoutes();
    window._routes = routes;
    renderRouteList(routes);
    const done = routes.filter(r => r.status === 'Visited').length;
    document.getElementById('route-summary').innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase">Rute Hari Ini</p>
          <p class="font-bold text-gray-900">${SFA.state.user?.area}</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-black text-[#bb000f]">${done}<span class="text-gray-400 text-base font-normal">/${routes.length}</span></p>
          <p class="text-xs text-gray-400">Outlet Selesai</p>
        </div>
      </div>`;
  } catch(_) {}
};

function renderRouteList(routes) {
  const el = document.getElementById('route-list');
  if (!routes.length) { el.innerHTML = `<div class="text-center py-12 text-gray-400"><span class="material-symbols-outlined text-5xl block mb-2">route</span>Tidak ada rute tersedia</div>`; return; }
  const statusColor = { Visited: 'bg-green-100 text-green-700', CheckedIn: 'bg-blue-100 text-blue-700', Pending: 'bg-amber-100 text-amber-700' };
  const priorityColor = { High: 'bg-red-100 text-[#bb000f]', Normal: 'bg-gray-100 text-gray-600' };
  el.innerHTML = routes.map(r => `
    <button onclick="SFA.Router.go('outlet',{id:'${r.outletId}'})"
      class="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left
             ${r.status === 'Visited' ? 'opacity-60' : ''}">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-sm
          ${r.status === 'Visited' ? 'bg-green-100 text-green-600' : 'bg-red-50 text-[#bb000f]'}">
          ${r.status === 'Visited'
            ? '<span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1">check_circle</span>'
            : r.sequence}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-0.5">
            <p class="font-bold text-gray-900 truncate ${r.status === 'Visited' ? 'line-through' : ''}">${r.outletName}</p>
            <span class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColor[r.priority] || 'bg-gray-100 text-gray-600'}">${r.priority}</span>
          </div>
          <p class="text-xs text-gray-500 truncate">${r.address}</p>
          <span class="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[r.status] || 'bg-gray-100 text-gray-600'}">${r.status}</span>
        </div>
        <span class="material-symbols-outlined text-gray-300 shrink-0">chevron_right</span>
      </div>
    </button>`).join('');
}

function filterRoutes(q) {
  const routes = window._routes || [];
  const filtered = routes.filter(r => r.outletName?.toLowerCase().includes(q.toLowerCase()) || r.address?.toLowerCase().includes(q.toLowerCase()));
  renderRouteList(filtered);
}

// ─────────────────────────────────────────────────────────────
// PAGE: OUTLET DETAIL
// ─────────────────────────────────────────────────────────────
Pages.outlet = async function({ id }) {
  if (!SFA.Auth.requireAuth()) return;
  if (!id) { SFA.Router.go('routes'); return; }

  SFA.UI.render(`
  ${topBar('Detail Outlet', true, `
    <button onclick="SFA.Router.go('order',{outletId:'${id}'})" class="flex items-center gap-1 bg-[#bb000f] text-white text-xs font-bold px-3 py-2 rounded-full">
      <span class="material-symbols-outlined text-[16px]">add_shopping_cart</span> Order
    </button>
  `)}
  <main class="pb-32 px-4 max-w-xl mx-auto pt-4">
    <div id="outlet-content">
      <div class="space-y-3">${[1,2,3].map(()=>`<div class="bg-gray-100 animate-pulse h-24 rounded-2xl"></div>`).join('')}</div>
    </div>
  </main>
  <div id="checkin-bar" class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
    <div class="max-w-xl mx-auto flex gap-3">
      <button onclick="doCheckOut('${id}')" class="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3.5 rounded-xl hover:border-gray-300 transition-colors text-sm flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-[18px]">logout</span> Check Out
      </button>
      <button onclick="doCheckIn('${id}')" id="btn-checkin" class="flex-[2] bg-[#bb000f] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 hover:bg-[#a0000d] transition-colors text-sm active:scale-[0.98]">
        <span class="material-symbols-outlined text-[18px]" style="font-variation-settings:'FILL' 1">location_on</span> CHECK IN SEKARANG
      </button>
    </div>
  </div>`);

  try {
    const { data: { outlet, recentOrders } } = await SFA.Data.getOutletDetail(id);
    SFA.state.currentOutlet = outlet;

    document.getElementById('outlet-content').innerHTML = `
      <!-- Header -->
      <div class="bg-gradient-to-br from-[#bb000f] to-[#e53935] rounded-2xl p-5 text-white shadow-lg mb-4">
        <p class="text-red-200 text-xs font-semibold uppercase tracking-wider">ID: ${outlet.id}</p>
        <h2 class="text-2xl font-black mt-1">${outlet.name}</h2>
        <p class="text-red-100 text-sm mt-1 flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">location_on</span>${outlet.address}
        </p>
        <div class="flex gap-2 mt-3">
          <span class="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full">${outlet.type || 'Retail'}</span>
          <span class="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full">Tier ${outlet.tier || 'A'}</span>
        </div>
      </div>

      <!-- Info -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-4">
        ${[
          { icon: 'person', label: 'Pemilik', value: outlet.ownerName },
          { icon: 'call',   label: 'Telepon', value: outlet.phone },
        ].map(row => `
          <div class="flex items-center gap-3 p-4 border-b border-gray-50 last:border-0">
            <span class="material-symbols-outlined text-gray-400 text-[20px]">${row.icon}</span>
            <div>
              <p class="text-xs text-gray-400">${row.label}</p>
              <p class="font-semibold text-gray-900 text-sm">${row.value || '-'}</p>
            </div>
          </div>`).join('')}
      </div>

      <!-- Recent Orders -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-50 flex justify-between items-center">
          <h3 class="font-bold text-gray-900 text-sm">Riwayat Order</h3>
          <span class="text-xs text-[#bb000f] font-semibold">${recentOrders.length} transaksi</span>
        </div>
        ${recentOrders.length === 0
          ? `<p class="text-center text-gray-400 text-sm py-8">Belum ada order</p>`
          : recentOrders.map(o => `
            <div class="p-4 border-b border-gray-50 last:border-0 flex justify-between items-center">
              <div>
                <p class="font-semibold text-gray-900 text-sm">${SFA.UI.formatDate(o.orderDate)}</p>
                <p class="text-xs text-gray-400 mt-0.5">ID: ${o.id}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-[#bb000f] text-sm">${SFA.UI.formatRupiah(o.totalAmount)}</p>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block
                  ${o.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
                  ${o.status}
                </span>
              </div>
            </div>`).join('')}
      </div>`;
  } catch(_) {}
};

async function doCheckIn(outletId) {
  SFA.UI.showToast('Mengambil lokasi...', 'info');
  const { lat, lng } = await SFA.Geo.get();
  try {
    const { data } = await SFA.Data.checkIn(outletId, lat, lng);
    SFA.UI.showToast(`Check-in berhasil pukul ${data.checkInTime}`, 'success');
    document.getElementById('btn-checkin').textContent = `✓ Sudah Check-in ${data.checkInTime}`;
    document.getElementByCode.gs('btn-checkin').disabled = true;
    document.getElementById('btn-checkin').classList.add('opacity-60');
  } catch(_) {}
}

async function doCheckOut(outletId) {
  if (!confirm('Selesai kunjungan di outlet ini?')) return;
  try {
    const { data } = await SFA.Data.checkOut(outletId);
    SFA.UI.showToast(`Check-out berhasil pukul ${data.checkOutTime}`, 'success');
    setTimeout(() => SFA.Router.go('routes'), 1200);
  } catch(_) {}
}

// ─────────────────────────────────────────────────────────────
// PAGE: INPUT ORDER
// ─────────────────────────────────────────────────────────────
Pages.order = function({ outletId }) {
  if (!SFA.Auth.requireAuth()) return;

  // Sample product catalog – replace with API call if needed
  const catalog = [
    { sku: 'AQ-600-01',  name: 'Aqua Mineral 600ml',     price: 3500,   category: 'Minuman' },
    { sku: 'IND-GO-40',  name: 'Indomie Goreng Original', price: 115000, category: 'Makanan', unit: 'Karton', focus: true },
    { sku: 'RM-KLP-20',  name: 'Roma Kelapa 300g',        price: 8200,   category: 'Makanan' },
    { sku: 'CC-CAN-24',  name: 'Coca Cola 330ml Can',     price: 5000,   category: 'Minuman' },
    { sku: 'BM-SP2L-06', name: 'Bimoli Spesial 2L',       price: 38500,  category: 'Sembako' },
    { sku: 'IND-KR-40',  name: 'Indomie Kuah Rasa Ayam',  price: 110000, category: 'Makanan', unit: 'Karton' },
    { sku: 'SGM-1KG',    name: 'SGM Susu Formula 1kg',    price: 89000,  category: 'Sembako' },
    { sku: 'PNG-SHP-12', name: 'Pantene Shampoo 120ml',   price: 18500,  category: 'Personal Care' },
  ];

  window._catalog   = catalog;
  window._orderOutlet = outletId;

  const categories = ['Semua', ...new Set(catalog.map(p => p.category))];

  SFA.UI.render(`
  ${topBar('Input Order', true, `
    <div class="flex items-center gap-2">
      <span class="text-xs text-gray-500 font-medium">${SFA.state.currentOutlet?.name || outletId || '—'}</span>
    </div>
  `)}
  <main class="pb-36 max-w-xl mx-auto">

    <!-- Search + Category -->
    <div class="sticky top-14 z-30 bg-white/95 backdrop-blur px-4 pt-3 pb-3 border-b border-gray-100">
      <div class="relative mb-2.5">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
        <input type="text" placeholder="Cari produk atau SKU..." oninput="filterProducts(this.value)"
          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#bb000f]/20 focus:border-[#bb000f] transition-all" />
      </div>
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        ${categories.map((c, i) => `
          <button onclick="filterCat(this,'${c}')"
            class="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                   ${i === 0 ? 'bg-[#bb000f] text-white border-[#bb000f]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}">
            ${c}
          </button>`).join('')}
      </div>
    </div>

    <!-- Product List -->
    <div id="product-list" class="px-4 pt-4 space-y-2"></div>

  </main>

  <!-- Cart FAB -->
  <div class="fixed bottom-0 left-0 w-full px-4 pb-4 z-40">
    <button onclick="submitOrder()"
      class="w-full max-w-xl mx-auto flex items-center justify-between bg-[#bb000f] hover:bg-[#a0000d] text-white px-5 py-4 rounded-2xl shadow-xl shadow-red-900/30 transition-all active:scale-[0.98] relative overflow-hidden"
      id="cart-btn">
      <div>
        <p class="text-red-200 text-xs font-semibold">Total Pesanan</p>
        <p class="font-black text-xl" id="cart-total">Rp 0</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <span class="material-symbols-outlined text-[26px]">shopping_cart</span>
          <span id="cart-count" class="absolute -top-2 -right-2 bg-amber-400 text-gray-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center hidden">0</span>
        </div>
        <span class="font-bold text-sm">Simpan Order</span>
        <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
      </div>
    </button>
  </div>`);

  renderProducts(catalog);
};

function renderProducts(products) {
  const el = document.getElementById('product-list');
  const cart = SFA.Cart.items();
  if (!products.length) { el.innerHTML = `<div class="text-center py-12 text-gray-400"><span class="material-symbols-outlined text-5xl block mb-2">search_off</span>Produk tidak ditemukan</div>`; return; }

  el.innerHTML = products.map(p => {
    const inCart = cart.find(i => i.sku === p.sku);
    const qty = inCart ? inCart.qty : 0;
    return `
    <div class="relative bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm
                ${p.focus ? 'border-amber-300 bg-amber-50/50' : 'border-gray-100'}">
      ${p.focus ? `<span class="absolute top-2 right-2 bg-amber-400 text-gray-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Focus</span>` : ''}
      <div class="flex-1 min-w-0">
        <p class="font-bold text-gray-900 text-sm truncate">${p.name}</p>
        <p class="text-gray-400 text-xs mt-0.5">SKU: ${p.sku}</p>
        <p class="text-[#bb000f] font-black text-base mt-1">${SFA.UI.formatRupiah(p.price)} <span class="text-gray-400 text-xs font-normal">${p.unit ? '/ ' + p.unit : ''}</span></p>
      </div>
      <div class="flex items-center gap-1 bg-gray-50 rounded-full border border-gray-200 p-1 shrink-0">
        <button onclick="updateQty('${p.sku}', ${qty - 1})"
          class="w-8 h-8 flex items-center justify-center rounded-full text-[#bb000f] hover:bg-red-50 active:scale-90 transition-all">
          <span class="material-symbols-outlined text-[18px]">remove</span>
        </button>
        <span id="qty-${p.sku}" class="w-8 text-center font-bold text-gray-900 text-sm">${qty}</span>
        <button onclick="updateQty('${p.sku}', ${qty + 1})"
          class="w-8 h-8 flex items-center justify-center rounded-full bg-[#bb000f] text-white hover:bg-[#a0000d] active:scale-90 transition-all shadow-sm">
          <span class="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>
    </div>`;
  }).join('');
}

function updateQty(sku, qty) {
  const product = window._catalog.find(p => p.sku === sku);
  if (!product) return;
  SFA.Cart.add(product, Math.max(0, qty));
  // Update qty display
  const el = document.getElementById('qty-' + sku);
  if (el) el.textContent = Math.max(0, qty);
  // Update cart totals
  const count = SFA.Cart.count();
  const total = SFA.Cart.total();
  const countEl = document.getElementById('cart-count');
  if (countEl) { countEl.textContent = count; count > 0 ? countEl.classList.remove('hidden') : countEl.classList.add('hidden'); }
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = SFA.UI.formatRupiah(total);
}

function filterProducts(q) {
  const filtered = (window._catalog || []).filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())
  );
  renderProducts(filtered);
}

function filterCat(btn, cat) {
  document.querySelectorAll('#product-list').forEach(() => {});
  document.querySelectorAll('.shrink-0.px-3').forEach(b => {
    b.className = b.className.replace('bg-[#bb000f] text-white border-[#bb000f]', 'bg-white text-gray-500 border-gray-200 hover:border-gray-300');
  });
  btn.className = btn.className.replace('bg-white text-gray-500 border-gray-200 hover:border-gray-300', 'bg-[#bb000f] text-white border-[#bb000f]');
  const filtered = cat === 'Semua' ? (window._catalog || []) : (window._catalog || []).filter(p => p.category === cat);
  renderProducts(filtered);
}

async function submitOrder() {
  const items = SFA.Cart.items();
  if (!items.length) { SFA.UI.showToast('Belum ada item di keranjang', 'error'); return; }
  const outletId = window._orderOutlet || SFA.state.currentOutlet?.id;
  if (!outletId) { SFA.UI.showToast('Outlet belum dipilih', 'error'); return; }
  try {
    const { data } = await SFA.Data.saveOrder(outletId, items);
    SFA.Cart.clear();
    SFA.UI.showToast(`Order ${data.orderId} berhasil disimpan!`, 'success');
    setTimeout(() => SFA.Router.go('outlet', { id: outletId }), 1500);
  } catch(_) {}
}

// ─────────────────────────────────────────────────────────────
// PAGE: ORDER HISTORY
// ─────────────────────────────────────────────────────────────
Pages.orders = async function() {
  if (!SFA.Auth.requireAuth()) return;

  SFA.UI.render(`
  ${topBar('Riwayat Aktivitas', false)}
  <main class="pb-24 px-4 max-w-xl mx-auto pt-4 space-y-4">
    <div class="grid grid-cols-3 gap-3" id="stats-bar">
      ${[1,2,3].map(()=>`<div class="bg-gray-100 animate-pulse h-20 rounded-2xl"></div>`).join('')}
    </div>
    <div id="orders-list" class="space-y-3">
      ${[1,2,3].map(()=>`<div class="bg-gray-100 animate-pulse h-24 rounded-2xl"></div>`).join('')}
    </div>
  </main>
  ${bottomNav('orders')}`);

  try {
    const { data: orders } = await SFA.Data.getOrders(30);
    const total    = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
    const done     = orders.filter(o => o.status === 'Selesai').length;
    document.getElementById('stats-bar').innerHTML = `
      <div class="bg-gradient-to-br from-[#bb000f] to-[#e53935] text-white p-3 rounded-2xl text-center">
        <p class="text-red-200 text-[10px] font-semibold uppercase">Total Order</p>
        <p class="text-2xl font-black">${orders.length}</p>
      </div>
      <div class="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm text-center">
        <p class="text-gray-400 text-[10px] font-semibold uppercase">Selesai</p>
        <p class="text-2xl font-black text-green-600">${done}</p>
      </div>
      <div class="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm text-center">
        <p class="text-gray-400 text-[10px] font-semibold uppercase">Omzet</p>
        <p class="text-sm font-black text-[#bb000f]">${SFA.UI.formatRupiah(total)}</p>
      </div>`;

    const statusStyle = { Selesai: 'bg-green-100 text-green-700', Pending: 'bg-amber-100 text-amber-700', Batal: 'bg-red-100 text-red-700' };
    document.getElementById('orders-list').innerHTML = orders.length === 0
      ? `<div class="text-center py-12 text-gray-400"><span class="material-symbols-outlined text-5xl block mb-2">receipt_long</span>Belum ada order</div>`
      : orders.map(o => `
        <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div class="min-w-0">
            <p class="font-bold text-gray-900 text-sm">${o.outletId}</p>
            <p class="text-xs text-gray-400 mt-0.5">${SFA.UI.formatDate(o.orderDate)} · ${o.id}</p>
            <span class="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[o.status] || 'bg-gray-100 text-gray-600'}">${o.status}</span>
          </div>
          <p class="font-black text-[#bb000f] text-base shrink-0 ml-3">${SFA.UI.formatRupiah(o.totalAmount)}</p>
        </div>`).join('');
  } catch(_) {}
};

// ─────────────────────────────────────────────────────────────
// PAGE: PROFILE
// ─────────────────────────────────────────────────────────────
Pages.profile = function() {
  if (!SFA.Auth.requireAuth()) return;
  const user = SFA.state.user;
  SFA.UI.render(`
  ${topBar('Profil Saya', false)}
  <main class="pb-24 px-4 max-w-xl mx-auto pt-4 space-y-4">

    <!-- Avatar -->
    <div class="bg-gradient-to-br from-[#bb000f] to-[#e53935] rounded-2xl p-6 text-white text-center shadow-lg">
      <div class="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 border-4 border-white/30">
        <span class="material-symbols-outlined text-white text-[40px]" style="font-variation-settings:'FILL' 1">person</span>
      </div>
      <h2 class="text-xl font-black">${user?.name}</h2>
      <p class="text-red-200 text-sm mt-0.5">${user?.role}</p>
      <span class="inline-block mt-2 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">${user?.area}</span>
    </div>

    <!-- Info -->
    <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      ${[
        { icon: 'badge',      label: 'SFA ID',  value: user?.id },
        { icon: 'work',       label: 'Role',    value: user?.role },
        { icon: 'location_on',label: 'Wilayah', value: user?.area },
      ].map(row => `
        <div class="flex items-center gap-3 p-4 border-b border-gray-50 last:border-0">
          <span class="material-symbols-outlined text-[#bb000f] text-[20px]">${row.icon}</span>
          <div>
            <p class="text-xs text-gray-400">${row.label}</p>
            <p class="font-semibold text-gray-900 text-sm">${row.value || '-'}</p>
          </div>
        </div>`).join('')}
    </div>

    <!-- Settings -->
    <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <button onclick="setApiUrl()" class="w-full flex items-center gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
        <span class="material-symbols-outlined text-gray-400 text-[20px]">settings</span>
        <span class="text-sm text-gray-700 font-medium flex-1 text-left">Atur URL API</span>
        <span class="material-symbols-outlined text-gray-300">chevron_right</span>
      </button>
      <div class="p-4 flex items-center gap-3">
        <span class="material-symbols-outlined text-gray-400 text-[20px]">info</span>
        <div class="flex-1">
          <p class="text-xs text-gray-400">Versi Aplikasi</p>
          <p class="text-sm text-gray-700 font-medium">Central SFA v1.0.0</p>
        </div>
      </div>
    </div>

    <!-- Logout -->
    <button onclick="SFA.Auth.logout()"
      class="w-full border-2 border-[#bb000f] text-[#bb000f] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors active:scale-[0.98]">
      <span class="material-symbols-outlined text-[20px]">logout</span>
      Keluar
    </button>
  </main>
  ${bottomNav('profile')}`);
};

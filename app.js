/**
 * BarberPro — app.js
 * Lógica principal: armazenamento, navegação, área do cliente, calendário
 * Todos os dados são salvos no localStorage para persistência permanente.
 */

/* ═══════════════════════════════════════════
   STORE — camada de armazenamento persistente
═══════════════════════════════════════════ */
// senha e nome de usuario 

const Store = {
    _prefix: 'barberpro_',

    get(key) {
        try { return JSON.parse(localStorage.getItem(this._prefix + key)); }
        catch { return null; }
    },

    set(key, value) {
        localStorage.setItem(this._prefix + key, JSON.stringify(value));
    },

    // Dados principais
    getBookings() { return this.get('bookings') || []; },

    setBookings(v) { this.set('bookings', v); },

    getServices() { return this.get('services') || Store._defaultServices(); },

    setServices(v) { this.set('services', v); },

    getBlocks() { return this.get('blocks') || []; },

    setBlocks(v) { this.set('blocks', v); },

    getStock() { return this.get('stock') || []; },

    setStock(v) { this.set('stock', v); },

    getClients() { return this.get('clients') || {}; },

    setClients(v) { this.set('clients', v); },

    // ✅ CONFIG CORRIGIDA
    getConfig() {

        // Configuração padrão do código
        const defaultConfig = Store._defaultConfig();

        // Configuração salva
        const savedConfig = this.get('config');

        // Se não existir config salva
        if (!savedConfig) {
            this.set('config', defaultConfig);
            return defaultConfig;
        }

        // Mantém todas as configs antigas
        // MAS atualiza usuário e senha
        const updatedConfig = {
            ...savedConfig,

            user: defaultConfig.user,
            pass: defaultConfig.pass,

            // 🔥 garante que sessionVersion exista sempre
            sessionVersion: savedConfig.sessionVersion || defaultConfig.sessionVersion,
        };

        // Salva novamente
        this.set('config', updatedConfig);

        return updatedConfig;
    },

    setConfig(v) { this.set('config', v); },

    _defaultServices() {
        return [
            { id: 's1', name: 'Corte Clássico', price: 35, duration: 30, icon: '✂', desc: 'Corte tradicional com acabamento perfeito', active: true },
            { id: 's2', name: 'Corte + Barba', price: 55, duration: 50, icon: '🧔', desc: 'Corte completo com barba modelada', active: true },
            { id: 's3', name: 'Barba', price: 25, duration: 25, icon: '🪒', desc: 'Modelagem e acabamento de barba', active: true },
            { id: 's4', name: 'Pigmentação', price: 80, duration: 60, icon: '🎨', desc: 'Pigmentação capilar profissional', active: true },
            { id: 's5', name: 'Sobrancelha', price: 15, duration: 15, icon: '✨', desc: 'Design e alinhamento de sobrancelha', active: true },
            { id: 's6', name: 'Hidratação', price: 45, duration: 40, icon: '💧', desc: 'Tratamento hidratante capilar', active: true },
        ];
    },

    // ════════════════════════════════════════════════════
    // 🔐 EDITAR CREDENCIAIS DE ADMIN AQUI:
    // ════════════════════════════════════════════════════
    _defaultConfig() {
        return {
            user: 'lucas',         // 👤 USUÁRIO DE LOGIN - EDITAR AQUI
            pass: 'lucas123',     // 🔒 SENHA DE LOGIN - EDITAR AQUI

            // 🔥 se você mudar isso manualmente no código,
            // todo mundo perde acesso automaticamente
            sessionVersion: 1,

            openTime: '09:00',
            closeTime: '19:00',
            interval: 30,
            workDays: [1, 2, 3, 4, 5, 6], // 0=Dom,1=Seg...6=Sab
            discount: 0,
            coupon: '',
            barberPhone: '',

            msgConfirmClient:
                'Olá {nome}! Seu agendamento está confirmado ✅\n📅 Serviço: {servico}\n🕐 Data/Hora: {data} às {hora}\n\nAté lá! ✂️ BarberPro',

            msgReminder:
                'Lembrete ⏰ {nome}, seu horário é em 30 minutos!\n📅 {servico} às {hora}\n\nTe esperamos! ✂️ BarberPro',

            colors: {
                gold: '#C9A84C',
                'gold-light': '#E8C97A',
                'gold-dim': 'rgba(201,168,76,0.15)',
                bg: '#0E0E0F',
                bg2: '#181819',
                bg3: '#222224',
                bg4: '#2A2A2D',
                border: 'rgba(255,255,255,0.07)',
                'border-gold': 'rgba(201,168,76,0.3)',
                text: '#F0EDE8',
                text2: '#9A9590',
                text3: '#5C5955',
                green: '#3ECF8E',
                'green-bg': 'rgba(62,207,142,0.1)',
                red: '#FF5C5C',
                'red-bg': 'rgba(255,92,92,0.1)',
                blue: '#4DA6FF',
                'blue-bg': 'rgba(77,166,255,0.1)',
            }
        };
    }
};
/* ═══════════════════════════════════════════
   UTILS
═══════════════════════════════════════════ */
const Utils = {
    // Gera ID único
    uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); },

    // Formata data "YYYY-MM-DD" → "DD/MM/YYYY"
    fmtDate(d) {
        if (!d) return '';
        const [y, m, dd] = d.split('-');
        return `${dd}/${m}/${y}`;
    },

    // Formata data completa por extenso
    fmtDateLong(d) {
        if (!d) return '';
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
        const dt = new Date(d + 'T12:00:00');
        return `${days[dt.getDay()]}, ${dt.getDate()} de ${months[dt.getMonth()]} de ${dt.getFullYear()}`;
    },

    // Data atual no formato YYYY-MM-DD
    today() {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Formata moeda
    brl(v) { return 'R$ ' + parseFloat(v || 0).toFixed(2).replace('.', ','); },

    // Máscara telefone
    maskPhone(el) {
        let v = el.value.replace(/\D/g, '').substr(0, 11);
        if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        el.value = v;
    },

    // Gera horários do dia com base na config
    generateSlots(config) {
        const slots = [];
        const [oh, om] = config.openTime.split(':').map(Number);
        const [ch, cm] = config.closeTime.split(':').map(Number);
        let cur = oh * 60 + om;
        const end = ch * 60 + cm;
        while (cur < end) {
            const h = String(Math.floor(cur / 60)).padStart(2, '0');
            const m = String(cur % 60).padStart(2, '0');
            slots.push(`${h}:${m}`);
            cur += parseInt(config.interval);
        }
        return slots;
    },

    // Verifica se horário está bloqueado
    isBlocked(date, time, blocks) {
        return blocks.some(b =>
            b.date === date && (b.time === '' || b.time === time)
        );
    },

    // Verifica se horário já tem agendamento
    isBooked(date, time, bookings, excludeId = null) {
        return bookings.some(b =>
            b.date === date && b.time === time && b.id !== excludeId && b.status !== 'cancelled'
        );
    },

    // Constrói URL do WhatsApp
    whatsappUrl(phone, msg) {
        const num = phone.replace(/\D/g, '');
        const fullNum = num.startsWith('55') ? num : '55' + num;
        return `https://wa.me/${fullNum}?text=${encodeURIComponent(msg)}`;
    },

    // Substitui variáveis na mensagem
    fillMsg(template, vars) {
        return template
            .replace(/{nome}/g, vars.nome || '')
            .replace(/{servico}/g, vars.servico || '')
            .replace(/{data}/g, vars.data || '')
            .replace(/{hora}/g, vars.hora || '');
    },

    // Exibe toast
    toast(msg, duration = 3000) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.remove('hidden');
        clearTimeout(el._timer);
        el._timer = setTimeout(() => el.classList.add('hidden'), duration);
    },

    // Dia da semana de uma data YYYY-MM-DD (sem fuso horário)
    dayOfWeek(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).getDay();
    }
};

/* ═══════════════════════════════════════════
   MODAL
═══════════════════════════════════════════ */
const Modal = {
    open(id) {
        document.getElementById('modal-overlay').classList.remove('hidden');
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },
    close(id) {
        document.getElementById(id).classList.add('hidden');
        document.getElementById('modal-overlay').classList.add('hidden');
        document.body.style.overflow = '';
    },
    closeOnOverlay(e) {
        if (e.target === document.getElementById('modal-overlay')) {
            document.querySelectorAll('.modal').forEach(m => {
                if (!m.classList.contains('hidden')) Modal.close(m.id);
            });
        }
    }
};

/* ═══════════════════════════════════════════
   APP — navegação principal
═══════════════════════════════════════════ */
const App = {

    // ✅ Gera token com senha + sessionVersion
    generateSessionToken(password, version) {
        const hash = btoa(password + '|' + version);
        return `session_${Date.now()}_${hash}`;
    },

    // ✅ valida token comparando com senha + sessionVersion atual
    isSessionValid(token) {
        if (!token || !token.startsWith('session_')) return false;

        const parts = token.split('_');
        if (parts.length !== 3) return false;

        const hash = parts[2];

        const cfg = Store.getConfig();
        const currentHash = btoa(cfg.pass + '|' + (cfg.sessionVersion || 1));

        return hash === currentHash;
    },

    // Salva sessão (em sessionStorage, expira ao fechar navegador)
    saveSession(token) {
        sessionStorage.setItem('barberpro_session', token);
    },

    // Carrega sessão
    loadSession() {
        return sessionStorage.getItem('barberpro_session');
    },

    // Remove sessão
    clearSession() {
        sessionStorage.removeItem('barberpro_session');
    },

    // Verifica sessão ao carregar página
    checkSession() {
        const token = this.loadSession();
        if (token && this.isSessionValid(token)) {
            this.showScreen('screen-admin');
            Admin.init();
        } else {
            this.clearSession();
            this.showScreen('screen-entry');
        }
    },

    // Mostra/esconde telas
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    },
    goHome() { App.showScreen('screen-entry'); },
    showLogin() { App.showScreen('screen-login'); document.getElementById('login-user').focus(); },
    showClientArea() { App.showScreen('screen-client'); Client.init(); },

    // Login admin
    doLogin() {
        const u = document.getElementById('login-user').value.trim();
        const p = document.getElementById('login-pass').value;
        const cfg = Store.getConfig();

        if (u === cfg.user && p === cfg.pass) {
            document.getElementById('login-error').classList.add('hidden');

            // 🔥 token agora usa senha + sessionVersion
            const token = this.generateSessionToken(cfg.pass, cfg.sessionVersion || 1);
            this.saveSession(token);

            console.log('%c✅ LOGIN ADMIN SUCESSO', 'color: #3ECF8E; font-size: 16px; font-weight: bold;');
            console.log('%c🔐 CREDENCIAIS ATUAIS:', 'color: gold; font-weight: bold;');
            console.log(`Usuário: ${cfg.user}`);
            console.log(`Senha: ${cfg.pass}`);
            console.log('%cAbra a aba Configurações para alterar', 'color: #9A9590; font-style: italic;');

            App.showScreen('screen-admin');
            Admin.init();
        } else {
            document.getElementById('login-error').classList.remove('hidden');
        }
    },

    logout() {
        this.clearSession();
        App.showScreen('screen-entry');
        document.getElementById('login-pass').value = '';
    },

    maskPhone: Utils.maskPhone,
};

// Login com Enter
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.getElementById('screen-login').classList.contains('active')) {
        App.doLogin();
    }
});

/* ═══════════════════════════════════════════
   CLIENT — área do cliente (agendamento)
═══════════════════════════════════════════ */
const Client = {
    state: {
        name: '', phone: '',
        serviceIds: [],
        date: null, time: null,
        calYear: null, calMonth: null,
    },

    init() {
        this.state = { name: '', phone: '', serviceIds: [], date: null, time: null };
        const now = new Date();
        this.state.calYear = now.getFullYear();
        this.state.calMonth = now.getMonth();
        // Volta ao passo 1
        document.querySelectorAll('.client-step').forEach(s => s.classList.remove('active'));
        document.getElementById('client-step-1').classList.add('active');
        document.getElementById('c-name').value = '';
        document.getElementById('c-phone').value = '';
    },

    // Passo 1 → 2
    clientStep2() {
        const name = document.getElementById('c-name').value.trim();
        const phone = document.getElementById('c-phone').value.trim();
        if (!name) { Utils.toast('Informe seu nome.'); return; }
        if (phone.replace(/\D/g, '').length < 10) { Utils.toast('Informe um WhatsApp válido.'); return; }
        this.state.name = name;
        this.state.phone = phone;
        this._showStep(2);
        this._renderServices();
    },

    // Passo 2 → 3
    clientStep3() {
        if (!this.state.serviceIds.length) { Utils.toast('Selecione pelo menos um serviço.'); return; }
        this._showStep(3);
        this._renderCal();
    },

    // Confirmar agendamento
    clientConfirm() {
        if (!this.state.date || !this.state.time) { Utils.toast('Selecione data e horário.'); return; }
        const bookings = Store.getBookings();
        this.state.serviceIds.forEach(serviceId => {
            const booking = {
                id: Utils.uid(),
                name: this.state.name,
                phone: this.state.phone,
                serviceId,
                date: this.state.date,
                time: this.state.time,
                payment: 'pending',
                status: 'confirmed',
                obs: '',
                createdAt: new Date().toISOString(),
                source: 'client',
            };
            bookings.push(booking);
        });
        Store.setBookings(bookings);

        // Atualiza dados do cliente
        const clients = Store.getClients();
        const key = this.state.phone.replace(/\D/g, '');
        if (!clients[key]) clients[key] = { name: this.state.name, phone: this.state.phone, obs: '', visits: 0 };
        clients[key].visits = (clients[key].visits || 0) + 1;
        Store.setClients(clients);

        // Exibe confirmação
        this._showStep(4);
        this._showConfirmDetails(this.state.serviceIds, this.state.date, this.state.time);

        // Abre WhatsApp para confirmação
        const cfg = Store.getConfig();
        const services = this.state.serviceIds.map(id => Store.getServices().find(s => s.id === id)).filter(Boolean);
        const serviceNames = services.map(s => s.name).join(', ');
        const msg = Utils.fillMsg(cfg.msgConfirmClient, {
            nome: this.state.name, servico: serviceNames, data: Utils.fmtDate(this.state.date), hora: this.state.time
        });
        setTimeout(() => {
            if (confirm(`Abrir WhatsApp para enviar confirmação ao cliente?`)) {
                window.open(Utils.whatsappUrl(this.state.phone, msg), '_blank');
            }
        }, 800);
    },

    clientBack(step) { this._showStep(step); },

    clientNewBooking() { Client.init(); },

    _showStep(n) {
        document.querySelectorAll('.client-step').forEach(s => s.classList.remove('active'));
        document.getElementById(`client-step-${n}`).classList.add('active');
        window.scrollTo(0, 0);
    },

    _renderServices() {
        const services = Store.getServices().filter(s => s.active);
        const cfg = Store.getConfig();
        const disc = parseInt(cfg.discount) || 0;
        const grid = document.getElementById('services-grid');
        if (!services.length) { grid.innerHTML = '<p class="empty-state">Nenhum serviço disponível.</p>'; return; }
        grid.innerHTML = services.map(s => {
            const price = disc > 0 ? s.price * (1 - disc / 100) : s.price;
            const discBadge = disc > 0 ? `<span class="svc-old-price" style="text-decoration:line-through;color:var(--text3);font-size:.75rem;">R$${s.price.toFixed(2).replace('.', ',')}</span> ` : '';
            return `
      <div class="service-card ${this.state.serviceIds.includes(s.id) ? 'selected' : ''}" onclick="Client._selectService('${s.id}')">
        <div class="check-badge">✓</div>
        <div class="svc-icon">${s.icon || '✂'}</div>
        <div class="svc-name">${s.name}</div>
        <div class="svc-price">${discBadge}${Utils.brl(price)}</div>
        <div class="svc-dur">⏱ ${s.duration} min</div>
        ${s.desc ? `<div class="svc-dur">${s.desc}</div>` : ''}
      </div>`;
        }).join('');
        document.getElementById('btn-step3').disabled = !this.state.serviceIds.length;
    },

    _selectService(id) {
        if (this.state.serviceIds.includes(id)) {
            this.state.serviceIds = this.state.serviceIds.filter(i => i !== id);
        } else {
            this.state.serviceIds.push(id);
        }
        this._renderServices();
    },

    // ── Calendário do cliente ──
    _renderCal() {
        const year = this.state.calYear;
        const month = this.state.calMonth;
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        document.getElementById('cal-month-label').textContent = `${months[month]} ${year}`;

        const cfg = Store.getConfig();
        const blocks = Store.getBlocks();
        const bookings = Store.getBookings();
        const today = Utils.today();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        let html = days.map(d => `<div class="cal-header">${d}</div>`).join('');

        // Células vazias antes do 1º dia
        for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dow = Utils.dayOfWeek(dateStr);
            const isPast = dateStr < today;
            const isWorkDay = cfg.workDays.includes(dow);
            const isFullBlocked = blocks.some(b => b.date === dateStr && b.time === '');
            const hasBookings = bookings.some(b => b.date === dateStr && b.status !== 'cancelled');

            let cls = 'cal-day';
            if (dateStr === today) cls += ' today';
            if (dateStr === this.state.date) cls += ' selected';
            if (isPast || !isWorkDay || isFullBlocked) cls += ' disabled';
            if (hasBookings && !isPast) cls += ' has-appointments';

            const clickable = !isPast && isWorkDay && !isFullBlocked;
            html += `<div class="${cls}" ${clickable ? `onclick="Client._selectDate('${dateStr}')"` : ''}>${d}</div>`;
        }

        document.getElementById('cal-grid').innerHTML = html;
    },

    _selectDate(dateStr) {
        this.state.date = dateStr;
        this.state.time = null;
        document.getElementById('btn-confirm').disabled = true;
        this._renderCal();
        this._renderTimeSlots(dateStr);
        Modal.open('modal-time-select');
    },

    _renderTimeSlots(dateStr) {
        const cfg = Store.getConfig();
        const blocks = Store.getBlocks();
        const bookings = Store.getBookings();
        const slots = Utils.generateSlots(cfg);
        const now = new Date();
        const todayStr = Utils.today();

        document.getElementById('time-select-title').textContent =
            'Horários para ' + Utils.fmtDateLong(dateStr);

        const html = slots.map(t => {
            const isBlockedSlot = Utils.isBlocked(dateStr, t, blocks);
            const isBooked = Utils.isBooked(dateStr, t, bookings);
            // Se for hoje, bloquear horários passados
            let isPast = false;
            if (dateStr === todayStr) {
                const [h, m] = t.split(':').map(Number);
                isPast = (h * 60 + m) <= (now.getHours() * 60 + now.getMinutes());
            }
            const unavailable = isBlockedSlot || isBooked || isPast;
            const selected = this.state.time === t;
            return `<div class="time-slot ${unavailable ? 'blocked' : ''} ${selected ? 'selected' : ''}"
        ${!unavailable ? `onclick="Client._selectTime('${t}')"` : ''}>${t}${unavailable ? `<br><small style="font-size:.6rem;opacity:.6">${isBooked ? 'Ocupado' : 'Bloqueado'}</small>` : ''}</div>`;
        }).join('');

        document.getElementById('time-slots-modal').innerHTML = html;
    },

    _selectTime(t) {
        this.state.time = t;
        const cfg = Store.getConfig();
        const slots = Utils.generateSlots(cfg);
        const blocks = Store.getBlocks();
        const bookings = Store.getBookings();
        const now = new Date();
        const todayStr = Utils.today();

        document.getElementById('time-slots-modal').innerHTML = slots.map(slot => {
            const isBlockedSlot = Utils.isBlocked(this.state.date, slot, blocks);
            const isBooked = Utils.isBooked(this.state.date, slot, bookings);
            let isPast = false;
            if (this.state.date === todayStr) {
                const [h, m] = slot.split(':').map(Number);
                isPast = (h * 60 + m) <= (now.getHours() * 60 + now.getMinutes());
            }
            const unavailable = isBlockedSlot || isBooked || isPast;
            const selected = this.state.time === slot;
            return `<div class="time-slot ${unavailable ? 'blocked' : ''} ${selected ? 'selected' : ''}"
        ${!unavailable ? `onclick="Client._selectTime('${slot}')"` : ''}>${slot}</div>`;
        }).join('');

        document.getElementById('btn-confirm').disabled = false;
        Modal.close('modal-time-select');
    },

    _showConfirmDetails(serviceIds, date, time) {
        const services = serviceIds.map(id => Store.getServices().find(s => s.id === id)).filter(Boolean);
        const cfg = Store.getConfig();
        const disc = parseInt(cfg.discount) || 0;
        const totalPrice = services.reduce((sum, s) => sum + (disc > 0 ? s.price * (1 - disc / 100) : s.price), 0);
        const serviceNames = services.map(s => s.name).join(', ');
        document.getElementById('confirm-details').innerHTML = `
    <div class="detail-row"><span class="detail-label">Cliente</span><span class="detail-value">${this.state.name}</span></div>
      <div class="detail-row"><span class="detail-label">WhatsApp</span><span class="detail-value">${this.state.phone}</span></div>
      <div class="detail-row"><span class="detail-label">Serviço</span><span class="detail-value">${serviceNames || '-'}</span></div>
      <div class="detail-row"><span class="detail-label">Data</span><span class="detail-value">${Utils.fmtDateLong(date)}</span></div>
      <div class="detail-row"><span class="detail-label">Horário</span><span class="detail-value">${time}</span></div>
      <div class="detail-row"><span class="detail-label">Valor</span><span class="detail-value" style="color:var(--gold);font-weight:700">${Utils.brl(totalPrice)}</span></div>
`;
    },
};

// Navegação do calendário do cliente
App.calPrev = function () {
    Client.state.calMonth--;
    if (Client.state.calMonth < 0) { Client.state.calMonth = 11; Client.state.calYear--; }
    Client.state.date = null;
    Client.state.time = null;
    document.getElementById('btn-confirm').disabled = true;
    Modal.close('modal-time-select');
    Client._renderCal();
};
App.calNext = function () {
    Client.state.calMonth++;
    if (Client.state.calMonth > 11) { Client.state.calMonth = 0; Client.state.calYear++; }
    Client.state.date = null;
    Client.state.time = null;
    document.getElementById('btn-confirm').disabled = true;
    Modal.close('modal-time-select');
    Client._renderCal();
};

// Expor funções ao HTML
App.clientStep2 = () => Client.clientStep2();
App.clientStep3 = () => Client.clientStep3();
App.clientConfirm = () => Client.clientConfirm();
App.clientBack = (n) => Client.clientBack(n);
App.clientNewBooking = () => Client.clientNewBooking();

/* ═══════════════════════════════════════════
   REMINDER SYSTEM — lembretes WhatsApp
   Verifica a cada minuto se há agendamentos
   em ~1h e abre prompt para enviar WA.
═══════════════════════════════════════════ */
setInterval(() => {
    const bookings = Store.getBookings();
    const cfg = Store.getConfig();
    if (!cfg.barberPhone) return;

    const now = new Date();
    const soon = new Date(now.getTime() + 60 * 60 * 1000); // +1h
    const year = soon.getFullYear();
    const month = String(soon.getMonth() + 1).padStart(2, '0');
    const day = String(soon.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const timeStr = `${String(soon.getHours()).padStart(2, '0')}:${String(soon.getMinutes()).padStart(2, '0')} `;

    bookings.filter(b =>
        b.date === dateStr &&
        b.time === timeStr &&
        b.status === 'confirmed' &&
        !b.reminderSent
    ).forEach(b => {
        const svc = Store.getServices().find(s => s.id === b.serviceId);
        const msg = Utils.fillMsg(cfg.msgReminder, {
            nome: b.name, servico: svc?.name || '', data: Utils.fmtDate(b.date), hora: b.time
        });
        // Marca como lembrete enviado
        b.reminderSent = true;
        Store.setBookings(bookings);

        // Envia lembrete automaticamente via WhatsApp
        window.open(Utils.whatsappUrl(b.phone, msg), '_blank');

        // Notifica barbeiro (opcional)
        if (cfg.barberPhone) {
            const barberMsg = `⏰ Lembrete enviado: ${b.name} tem agendamento às ${b.time} (${svc?.name || 'serviço'}).`;
            console.log(barberMsg);
        }
    });
}, 60000);

// Inicializa ao carregar
window.addEventListener('DOMContentLoaded', () => {
    // Verifica sessão existente
    App.checkSession();

    // Garante dados default existam
    Store.getServices();
    Store.getConfig();

    // Add modal overlay if not exists
    if (!document.getElementById('modal-overlay')) {
        const overlayHTML = '<div id="modal-overlay" class="hidden" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;" onclick="Modal.closeOnOverlay(event)"></div>';
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
    }

    // Add modal for time select
    const modalHTML = `
    <div id="modal-time-select" class="modal hidden" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
      <div class="modal-content" style="background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius); max-width: 500px; padding: 2rem;">
        <h3 id="time-select-title" style="margin-bottom: 1rem; text-align: center;">Selecione o horário</h3>
        <div id="time-slots-modal" class="time-slots" style="max-height: 400px; overflow-y: auto;"></div>
        <div style="text-align: center; margin-top: 1rem;">
          <button class="btn" style="color: #000;" onclick="Modal.close('modal-time-select')">Fechar</button>
        </div>
      </div>
    </div>
  `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
});
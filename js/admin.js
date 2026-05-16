/* ─────────────────────────────────────────
   ADMIN — cru.vin
   Full dashboard: routing, modules, data tables, charts
───────────────────────────────────────── */

(function AdminModule() {
  const { qs, qsa, debounce } = window.CruVin;

  /* ════════════════════════════════════════
     ROUTER
  ════════════════════════════════════════ */
  const MODULE_TITLES = {
    dashboard: 'Dashboard', analytics: 'Analytics', cms: 'CMS Editorial',
    wines: 'Base de Vinhos', regions: 'Regiões & Atlas', producers: 'Produtores',
    media: 'Media Assets', lms: 'Academy / LMS', certifications: 'Certificações',
    users: 'Usuários', community: 'Comunidade', ai: 'IA & Modelos',
    revenue: 'Receitas', settings: 'Configurações',
  };

  let currentModule = 'dashboard';

  function navigate(mod) {
    currentModule = mod;

    qsa('.admin-nav__item').forEach(item => {
      item.classList.toggle('active', item.dataset.module === mod);
    });

    const breadcrumb = qs('#breadcrumb-current');
    if (breadcrumb) breadcrumb.textContent = MODULE_TITLES[mod] || mod;

    const moduleEl = qs('#admin-module');
    if (!moduleEl) return;

    moduleEl.style.opacity = '0';
    moduleEl.style.transform = 'translateY(8px)';

    setTimeout(() => {
      renderModule(mod, moduleEl);
      moduleEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      moduleEl.style.opacity = '1';
      moduleEl.style.transform = 'translateY(0)';
    }, 120);
  }

  qsa('.admin-nav__item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (item.dataset.module) navigate(item.dataset.module);
    });
  });

  qs('#sidebar-toggle')?.addEventListener('click', () => {
    qs('#admin-shell')?.classList.toggle('nav-collapsed');
  });

  /* ════════════════════════════════════════
     MODULE RENDERER
  ════════════════════════════════════════ */
  function renderModule(mod, el) {
    switch (mod) {
      case 'dashboard':      el.innerHTML = renderDashboard();      bindDashboard();      break;
      case 'analytics':      el.innerHTML = renderAnalytics();      bindAnalytics();      break;
      case 'cms':            el.innerHTML = renderCMS();            bindCMS();            break;
      case 'wines':          el.innerHTML = renderWines();          bindDataTable('wines-table'); break;
      case 'regions':        el.innerHTML = renderRegions();        bindDataTable('regions-table'); break;
      case 'producers':      el.innerHTML = renderProducers();      bindDataTable('producers-table'); break;
      case 'lms':            el.innerHTML = renderLMS();            bindLMS();            break;
      case 'users':          el.innerHTML = renderUsers();          bindDataTable('users-table'); break;
      case 'ai':             el.innerHTML = renderAI();             bindAI();             break;
      case 'revenue':        el.innerHTML = renderRevenue();        bindRevenue();        break;
      case 'settings':       el.innerHTML = renderSettings();       break;
      default:               el.innerHTML = `<div style="padding:var(--space-8);color:var(--text-muted);font-family:var(--font-mono);font-size:var(--text-xs)">Módulo em desenvolvimento</div>`;
    }
  }

  /* ════════════════════════════════════════
     HELPERS
  ════════════════════════════════════════ */
  function kpiGrid(items) {
    return `<div class="admin-grid-4" style="margin-bottom:var(--space-6)">${items.map(k => `
      <div class="kpi-card">
        <div class="kpi-card__top">
          <span class="kpi-card__label">${k.label}</span>
          <div class="kpi-card__icon" style="color:${k.color}">${k.icon}</div>
        </div>
        <div class="kpi-card__value">${k.value}</div>
        <div class="kpi-card__trend kpi-card__trend--${k.trend > 0 ? 'up' : k.trend < 0 ? 'down' : 'flat'}">
          ${k.trend > 0 ? '▲' : k.trend < 0 ? '▼' : '→'} ${Math.abs(k.trend)}% vs. mês anterior
        </div>
      </div>
    `).join('')}</div>`;
  }

  function dataTable({ id, columns, rows, showPagination = true }) {
    return `
      <div class="admin-table-wrap">
        <table class="admin-table" id="${id}">
          <thead><tr>${columns.map(c => `<th data-col="${c.key}">${c.label}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(row => `
            <tr>${columns.map(c => `<td class="${c.primary ? 'primary' : ''}">${row[c.key] ?? '—'}</td>`).join('')}</tr>
          `).join('')}</tbody>
        </table>
        ${showPagination ? `
          <div class="admin-pagination">
            <span class="admin-pagination__info">Mostrando 1–${rows.length} de ${rows.length} resultados</span>
            <div class="admin-pagination__btns">
              <button class="pagination-btn">‹</button>
              <button class="pagination-btn active">1</button>
              <button class="pagination-btn">2</button>
              <button class="pagination-btn">3</button>
              <button class="pagination-btn">›</button>
            </div>
          </div>
        ` : ''}
      </div>`;
  }

  function sectionHeader(title, actions = '') {
    return `<div class="module-header"><h1 class="module-header__title">${title}</h1><div class="module-header__actions">${actions}</div></div>`;
  }

  function adminCard(title, content, style = '') {
    return `<div class="admin-card" style="${style}"><p class="admin-card__title">${title}</p>${content}</div>`;
  }

  function statusBadge(status) {
    const map = { published: 'Publicado', draft: 'Rascunho', review: 'Em Revisão', scheduled: 'Agendado', archived: 'Arquivado' };
    return `<span class="status-badge status-badge--${status}">${map[status] || status}</span>`;
  }

  function tableActions(id) {
    return `<div class="table-actions">
      <button class="table-action-btn" title="Editar" data-action="edit" data-id="${id}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="table-action-btn table-action-btn--danger" title="Remover" data-action="delete" data-id="${id}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
      </button>
    </div>`;
  }

  /* ════════════════════════════════════════
     DASHBOARD MODULE
  ════════════════════════════════════════ */
  function renderDashboard() {
    const kpis = [
      { label: 'Usuários ativos', value: '8,429', trend: 12.4, color: '#c9a84c', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
      { label: 'Artigos publicados', value: '247', trend: 8.2, color: '#4a90c9', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
      { label: 'Notas de degustação', value: '48,290', trend: 22.1, color: '#9b5a8c', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 22h8M7 10h10l-1.5-7h-7L7 10zM7 10a5 5 0 0 0 10 0"/></svg>' },
      { label: 'Receita mensal', value: '€ 42,800', trend: 6.7, color: '#4caf50', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
    ];

    const activity = [
      { initials: 'MR', color: '#c44060', text: '<strong>Maria R.</strong> publicou <em>"Borgonha 2022: a safra que redefiniu o Pinot Noir"</em>', time: '3m atrás' },
      { initials: 'JS', color: '#4a90c9', text: '<strong>João S.</strong> completou o módulo <em>Degustação Avançada</em>', time: '18m atrás' },
      { initials: 'AI', color: '#c9a84c', text: 'IA adicionou <em>320 perfis de vinho</em> automaticamente via OCR', time: '42m atrás' },
      { initials: 'PL', color: '#9b5a8c', text: '<strong>Paula L.</strong> abriu revisão no artigo <em>"Vinhos naturais: mito ou terroir?"</em>', time: '1h atrás' },
      { initials: 'CM', color: '#4caf50', text: '<strong>Carlos M.</strong> foi promovido para <em>Editorial Director</em>', time: '2h atrás' },
      { initials: 'SY', color: '#d4804a', text: 'Sistema publicou <em>relatório de safra Toscana 2023</em> automaticamente', time: '3h atrás' },
    ];

    return `
      ${sectionHeader('Dashboard <em>geral</em>', `
        <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-muted)">Atualizado agora</span>
        <button class="admin-btn admin-btn--secondary"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Atualizar</button>
      `)}

      ${kpiGrid(kpis)}

      <div class="admin-grid-32">
        <!-- Main chart -->
        <div class="admin-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4)">
            <p class="admin-card__title" style="margin:0">Tráfego & Engajamento</p>
            <div style="display:flex;gap:var(--space-2)">
              <button class="admin-btn admin-btn--ghost chart-period active" data-period="7d">7d</button>
              <button class="admin-btn admin-btn--ghost chart-period" data-period="30d">30d</button>
              <button class="admin-btn admin-btn--ghost chart-period" data-period="90d">90d</button>
            </div>
          </div>
          <canvas id="traffic-chart" height="220" style="width:100%"></canvas>
        </div>

        <!-- Activity feed -->
        <div class="admin-card">
          <p class="admin-card__title">Atividade recente</p>
          <div class="activity-feed">
            ${activity.map(a => `
              <div class="activity-item">
                <div class="activity-item__avatar" style="background:${a.color}">${a.initials}</div>
                <div class="activity-item__body">
                  <span class="activity-item__text">${a.text}</span>
                </div>
                <span class="activity-item__time">${a.time}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Second row -->
      <div class="admin-grid-3" style="margin-top:var(--space-5)">
        ${adminCard('Conteúdo por status', `
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${[['Publicados','247','published',100],['Agendados','18','scheduled',73],['Em revisão','31','review',58],['Rascunhos','64','draft',26],['Arquivados','112','archived',45]].map(([l,v,s,p]) => `
              <div style="display:flex;align-items:center;gap:var(--space-3)">
                ${statusBadge(s)}
                <div class="admin-progress" style="flex:1"><div class="admin-progress__fill" style="width:${p}%"></div></div>
                <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-muted);min-width:28px;text-align:right">${v}</span>
              </div>
            `).join('')}
          </div>
        `)}

        ${adminCard('Top páginas hoje', `
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${[
              ['Atlas · Borgonha','2,840 visitas'],
              ['Artigo: Barolo 2019','1,920 visitas'],
              ['Academy: Tasting Blind','1,450 visitas'],
              ['Guia Champagne 2025','1,310 visitas'],
              ['Roda de Aromas','980 visitas'],
            ].map(([p,v]) => `
              <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--color-border);padding-bottom:var(--space-2)">
                <span style="font-size:var(--text-xs);color:var(--text-secondary)">${p}</span>
                <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--color-gold)">${v}</span>
              </div>
            `).join('')}
          </div>
        `)}

        ${adminCard('Geografias', `
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${[['Portugal','34%'],['Brasil','22%'],['França','18%'],['Itália','10%'],['Outros','16%']].map(([c,p]) => `
              <div style="display:flex;align-items:center;gap:var(--space-3)">
                <span style="font-size:var(--text-xs);color:var(--text-secondary);width:80px">${c}</span>
                <div class="admin-progress" style="flex:1"><div class="admin-progress__fill" style="width:${p}"></div></div>
                <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-muted)">${p}</span>
              </div>
            `).join('')}
          </div>
        `)}
      </div>
    `;
  }

  function bindDashboard() {
    drawTrafficChart('7d');
    qsa('.chart-period').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('.chart-period').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        drawTrafficChart(btn.dataset.period);
      });
    });
  }

  function drawTrafficChart(period) {
    const canvas = qs('#traffic-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.offsetWidth || 600;
    const h = 220;
    canvas.width = w;

    const points = {
      '7d':  [3200,4100,3800,5200,4800,6100,5400],
      '30d': Array.from({length:30}, (_,i) => 2000 + Math.sin(i/3)*1500 + Math.random()*800 + i*100),
      '90d': Array.from({length:90}, (_,i) => 1500 + Math.sin(i/8)*2000 + Math.random()*500 + i*40),
    };

    const data = points[period];
    const maxV = Math.max(...data);
    const pad  = { t: 20, r: 20, b: 30, l: 40 };
    const cw   = w - pad.l - pad.r;
    const ch   = h - pad.t - pad.b;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (ch * (1 - i/4));
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font = '9px "DM Mono", monospace';
      ctx.fillStyle = 'rgba(122,114,104,0.6)';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxV * i / 4).toLocaleString(), pad.l - 6, y + 3);
    }

    // Fill gradient
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch);
    grad.addColorStop(0, 'rgba(201,168,76,0.2)');
    grad.addColorStop(1, 'rgba(201,168,76,0)');

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = pad.l + (i / (data.length - 1)) * cw;
      const y = pad.t + ch - (v / maxV) * ch;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(pad.l + cw, pad.t + ch);
    ctx.lineTo(pad.l, pad.t + ch);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = pad.l + (i / (data.length - 1)) * cw;
      const y = pad.t + ch - (v / maxV) * ch;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /* ════════════════════════════════════════
     ANALYTICS MODULE
  ════════════════════════════════════════ */
  function renderAnalytics() {
    return `
      ${sectionHeader('Analytics <em>& Intelligence</em>', `
        <select class="table-filter-select"><option>Últimos 30 dias</option><option>Últimos 7 dias</option><option>Este ano</option></select>
        <button class="admin-btn admin-btn--secondary">Exportar CSV</button>
      `)}
      <div class="admin-grid-4" style="margin-bottom:var(--space-6)">
        ${[
          {l:'Pageviews',v:'284,920',t:'+18.4%'},
          {l:'Sessões únicas',v:'68,420',t:'+12.1%'},
          {l:'Tempo médio',v:'4m 32s',t:'+8.3%'},
          {l:'Taxa de retenção',v:'38.2%',t:'+3.1%'},
        ].map(k => `
          <div class="kpi-card">
            <p class="kpi-card__label">${k.l}</p>
            <div class="kpi-card__value">${k.v}</div>
            <div class="kpi-card__trend kpi-card__trend--up">${k.t}</div>
          </div>
        `).join('')}
      </div>

      <div class="admin-grid-2" style="margin-bottom:var(--space-5)">
        ${adminCard('Tráfego por módulo', `
          <canvas id="module-chart" height="200" style="width:100%"></canvas>
        `)}
        ${adminCard('Retenção de usuários', `
          <canvas id="retention-chart" height="200" style="width:100%"></canvas>
        `)}
      </div>

      ${adminCard('Buscas populares — últimos 30 dias', `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-4)">
          ${['Barolo 2019','Borgonha Pinot Noir','Chenin Blanc Loire','Champagne vintage','Vinhos naturais','Riesling Mosel','Priorat terroir','Nebbiolo','Champagne blanc de blancs','Rioja Reserva','Napa Cabernet','Syrah Hermitage'].map((q,i) => `
            <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--color-border)">
              <span style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-muted);min-width:20px">${String(i+1).padStart(2,'0')}</span>
              <span style="font-size:var(--text-xs);color:var(--text-secondary)">${q}</span>
            </div>
          `).join('')}
        </div>
      `)}
    `;
  }

  function bindAnalytics() {
    // Module bar chart
    const mc = qs('#module-chart');
    if (mc) {
      const ctx = mc.getContext('2d');
      mc.width = mc.offsetWidth || 400;
      const data = [
        { label: 'Atlas', value: 38, color: '#c9a84c' },
        { label: 'Editorial', value: 28, color: '#4a90c9' },
        { label: 'Academy', value: 18, color: '#9b5a8c' },
        { label: 'Tasting', value: 10, color: '#d4804a' },
        { label: 'Discovery', value: 6, color: '#4caf50' },
      ];
      const w = mc.width, h = 200;
      const bw = (w - 60) / data.length;
      ctx.clearRect(0, 0, w, h);
      data.forEach((d, i) => {
        const bh = (d.value / 40) * (h - 40);
        const x  = 30 + i * bw + 8;
        const y  = h - 25 - bh;
        const grad = ctx.createLinearGradient(0, y, 0, y + bh);
        grad.addColorStop(0, d.color + 'cc');
        grad.addColorStop(1, d.color + '40');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, bw - 16, bh);
        ctx.font = '9px "DM Mono", monospace';
        ctx.fillStyle = 'rgba(184,176,160,0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(d.label, x + (bw-16)/2, h - 8);
        ctx.fillStyle = d.color;
        ctx.fillText(d.value + '%', x + (bw-16)/2, y - 5);
      });
    }

    // Retention line chart
    const rc = qs('#retention-chart');
    if (rc) {
      const ctx = rc.getContext('2d');
      rc.width = rc.offsetWidth || 400;
      const w = rc.width, h = 200;
      const months = ['Jan','Fev','Mar','Abr','Mai','Jun'];
      const vals   = [28, 32, 35, 34, 37, 38];
      ctx.clearRect(0, 0, w, h);
      const pad = {t:20,r:20,b:30,l:40};
      const cw = w-pad.l-pad.r, ch = h-pad.t-pad.b;
      const maxV = 50;

      for (let i=0;i<=4;i++) {
        const y = pad.t + ch*(1-i/4);
        ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(w-pad.r,y);
        ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1; ctx.stroke();
        ctx.font='9px "DM Mono",monospace'; ctx.fillStyle='rgba(122,114,104,0.6)';
        ctx.textAlign='right'; ctx.fillText((maxV*i/4).toFixed(0)+'%', pad.l-4, y+3);
      }

      const grad = ctx.createLinearGradient(0,pad.t,0,pad.t+ch);
      grad.addColorStop(0,'rgba(76,175,80,0.2)');
      grad.addColorStop(1,'rgba(76,175,80,0)');

      const pts = vals.map((v,i) => ({
        x: pad.l + (i/(vals.length-1))*cw,
        y: pad.t + ch - (v/maxV)*ch,
      }));

      ctx.beginPath();
      pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
      ctx.lineTo(pts[pts.length-1].x, pad.t+ch);
      ctx.lineTo(pts[0].x, pad.t+ch);
      ctx.closePath(); ctx.fillStyle=grad; ctx.fill();

      ctx.beginPath();
      pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
      ctx.strokeStyle='#4caf50'; ctx.lineWidth=2; ctx.stroke();

      months.forEach((m,i) => {
        ctx.font='9px "DM Mono",monospace'; ctx.fillStyle='rgba(122,114,104,0.6)';
        ctx.textAlign='center';
        ctx.fillText(m, pts[i].x, h-6);
      });
    }
  }

  /* ════════════════════════════════════════
     CMS MODULE
  ════════════════════════════════════════ */
  const CMS_ARTICLES = [
    { id:1, title:'A reinvenção da Borgonha: nova geração de vignerons', category:'Reportagem', author:'M. Rossi', status:'published', views:'8,420', date:'15 Mai 2025' },
    { id:2, title:'Bioma microbiano e a identidade do vinho', category:'Ciência', author:'J. Santos', status:'review', views:'—', date:'16 Mai 2025' },
    { id:3, title:'Champagne: guia de produtores 2025', category:'Guia', author:'P. Lima', status:'draft', views:'—', date:'16 Mai 2025' },
    { id:4, title:'Rhône Sul: o retorno do Grenache', category:'Região', author:'C. Moura', status:'scheduled', views:'—', date:'20 Mai 2025' },
    { id:5, title:'Vulcões e xisto: solos do sul da Espanha', category:'Terroir', author:'M. Rossi', status:'published', views:'3,290', date:'12 Mai 2025' },
    { id:6, title:'Napa Cabernet 2021: análise da safra', category:'Safra', author:'J. Santos', status:'published', views:'5,810', date:'10 Mai 2025' },
    { id:7, title:'O sommelier como curador cultural', category:'Cultura', author:'A. Ferreira', status:'archived', views:'12,450', date:'02 Mai 2025' },
    { id:8, title:'Barolo vs Barbaresco: uma análise comparativa', category:'Educação', author:'P. Lima', status:'published', views:'7,100', date:'05 Mai 2025' },
  ];

  function renderCMS() {
    const pipeline = [
      { status:'draft', label:'Rascunho', cards:[{type:'Reportagem',title:'Alsace Riesling: a uva esquecida',meta:'J. Santos · 3h'},{type:'Guia',title:'Novos produtores portugueses 2025',meta:'A. Ferreira · 1d'}] },
      { status:'review', label:'Em Revisão', cards:[{type:'Ciência',title:'Microbioma e terroir',meta:'M. Rossi · 6h'},{type:'Cultura',title:'A arte do serviço',meta:'P. Lima · 2h'},{type:'Região',title:'Mosel: elegância em ardósia',meta:'J. Santos · 1d'}] },
      { status:'approved', label:'Aprovado', cards:[{type:'Safra',title:'Borgonha 2022: análise',meta:'M. Rossi · agora'}] },
      { status:'scheduled', label:'Agendado', cards:[{type:'Guia',title:'Champagne guia 2025',meta:'Pub. 20/05'},{type:'Região',title:'Rhône Sul: Grenache',meta:'Pub. 22/05'}] },
      { status:'published', label:'Publicado', cards:[{type:'Reportagem',title:'Reinvenção da Borgonha',meta:'8,420 views'},{type:'Terroir',title:'Vulcões do sul da Espanha',meta:'3,290 views'}] },
    ];

    const cols = pipeline.map(p => `
      <div class="pipeline-col">
        <div class="pipeline-col__header">
          <span class="pipeline-col__label">${p.label}</span>
          <span class="pipeline-col__count">${p.cards.length}</span>
        </div>
        ${p.cards.map(c => `
          <div class="pipeline-card">
            <div class="pipeline-card__type">${c.type}</div>
            <div class="pipeline-card__title">${c.title}</div>
            <div class="pipeline-card__meta">${c.meta}</div>
          </div>
        `).join('')}
      </div>
    `).join('');

    const rows = CMS_ARTICLES.map(a => ({
      ...a,
      status: statusBadge(a.status),
      actions: tableActions(a.id),
    }));

    return `
      ${sectionHeader('CMS <em>Editorial</em>', `
        <button class="admin-btn admin-btn--secondary">Filtros</button>
        <button class="admin-btn admin-btn--primary" id="btn-new-article">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo artigo
        </button>
      `)}

      <h3 style="font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:0.15em;text-transform:uppercase;color:var(--text-muted);margin-bottom:var(--space-4)">Pipeline editorial</h3>
      <div class="pipeline" style="margin-bottom:var(--space-6)">${cols}</div>

      <h3 style="font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:0.15em;text-transform:uppercase;color:var(--text-muted);margin-bottom:var(--space-4)">Todos os artigos</h3>

      <div class="table-filters">
        <div class="table-filter-input">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="cms-search" placeholder="Buscar artigos…" />
        </div>
        <select class="table-filter-select" id="cms-status-filter">
          <option value="">Todos os status</option>
          <option value="published">Publicados</option>
          <option value="draft">Rascunhos</option>
          <option value="review">Em revisão</option>
          <option value="scheduled">Agendados</option>
        </select>
        <select class="table-filter-select">
          <option>Todas as categorias</option>
          <option>Reportagem</option>
          <option>Terroir</option>
          <option>Safra</option>
          <option>Cultura</option>
        </select>
      </div>

      ${dataTable({
        id: 'cms-table',
        columns: [
          { key: 'title', label: 'Título', primary: true },
          { key: 'category', label: 'Categoria' },
          { key: 'author', label: 'Autor' },
          { key: 'status', label: 'Status' },
          { key: 'views', label: 'Visualizações' },
          { key: 'date', label: 'Data' },
          { key: 'actions', label: '' },
        ],
        rows,
      })}
    `;
  }

  function bindCMS() {
    bindDataTable('cms-table');
    qs('#btn-new-article')?.addEventListener('click', () => showToast('Abrindo editor…', 'success'));
    qs('#cms-search')?.addEventListener('input', debounce(() => showToast('Filtrando…', 'success'), 400));
  }

  /* ════════════════════════════════════════
     WINES MODULE
  ════════════════════════════════════════ */
  function renderWines() {
    const wines = [
      {name:'Barolo Monfortino Riserva 2015',region:'Piemonte',producer:'Giacomo Conterno',vintage:'2015',score:100,type:'Tinto'},
      {name:'Romanée-Conti Grand Cru 2018',region:'Borgonha',producer:'DRC',vintage:'2018',score:99,type:'Tinto'},
      {name:'Pétrus 2019',region:'Pomerol',producer:'Château Pétrus',vintage:'2019',score:100,type:'Tinto'},
      {name:'Meursault Les Genevrières PC 2020',region:'Borgonha',producer:'Domaine Roulot',vintage:'2020',score:97,type:'Branco'},
      {name:'Hermitage Rouge 2017',region:'Rhône Norte',producer:'Jean-Louis Chave',vintage:'2017',score:98,type:'Tinto'},
      {name:'Krug Grande Cuvée 170ème',region:'Champagne',producer:'Krug',vintage:'NV',score:99,type:'Espumante'},
      {name:'Sassicaia DOC 2020',region:'Bolgheri',producer:'Tenuta San Guido',vintage:'2020',score:97,type:'Tinto'},
      {name:'Riesling Scharzhofberger TBA',region:'Mosel',producer:'Egon Müller',vintage:'2018',score:100,type:'Branco'},
    ].map(w => ({ ...w, score: `<span style="color:var(--color-gold);font-family:var(--font-mono)">${w.score}</span>`, actions: tableActions(w.name) }));

    return `
      ${sectionHeader('Base de <em>Vinhos</em>', `
        <button class="admin-btn admin-btn--secondary">Importar CSV</button>
        <button class="admin-btn admin-btn--secondary">Importar XLS</button>
        <button class="admin-btn admin-btn--primary">+ Adicionar vinho</button>
      `)}
      <div class="table-filters">
        <div class="table-filter-input">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Buscar vinhos, produtores, regiões…" />
        </div>
        <select class="table-filter-select"><option>Todos os tipos</option><option>Tinto</option><option>Branco</option><option>Espumante</option></select>
        <select class="table-filter-select"><option>Todas as regiões</option><option>Borgonha</option><option>Piemonte</option><option>Champagne</option></select>
      </div>
      ${dataTable({ id:'wines-table', columns:[
        {key:'name',label:'Vinho',primary:true},{key:'region',label:'Região'},{key:'producer',label:'Produtor'},
        {key:'vintage',label:'Safra'},{key:'type',label:'Tipo'},{key:'score',label:'Pontuação'},{key:'actions',label:''},
      ], rows: wines })}
    `;
  }

  /* ════════════════════════════════════════
     REGIONS MODULE
  ════════════════════════════════════════ */
  function renderRegions() {
    const rows = [
      {region:'Borgonha',country:'França',hectares:'28,000',appellations:'84',grapes:'Pinot Noir, Chardonnay',status:statusBadge('published'),actions:tableActions(1)},
      {region:'Bordeaux',country:'França',hectares:'120,000',appellations:'60',grapes:'Cabernet Sauvignon, Merlot',status:statusBadge('published'),actions:tableActions(2)},
      {region:'Piemonte',country:'Itália',hectares:'44,000',appellations:'58',grapes:'Nebbiolo, Barbera',status:statusBadge('published'),actions:tableActions(3)},
      {region:'Champagne',country:'França',hectares:'34,000',appellations:'1',grapes:'Chardonnay, Pinot Noir',status:statusBadge('published'),actions:tableActions(4)},
      {region:'Toscana',country:'Itália',hectares:'63,000',appellations:'41',grapes:'Sangiovese',status:statusBadge('published'),actions:tableActions(5)},
      {region:'Mosel',country:'Alemanha',hectares:'9,000',appellations:'—',grapes:'Riesling',status:statusBadge('review'),actions:tableActions(6)},
    ];
    return `
      ${sectionHeader('Regiões <em>& Atlas</em>', `<button class="admin-btn admin-btn--primary">+ Nova região</button>`)}
      <div class="table-filters">
        <div class="table-filter-input"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input type="text" placeholder="Buscar regiões…" /></div>
        <select class="table-filter-select"><option>Todos os países</option><option>França</option><option>Itália</option><option>Espanha</option></select>
      </div>
      ${dataTable({ id:'regions-table', columns:[
        {key:'region',label:'Região',primary:true},{key:'country',label:'País'},{key:'hectares',label:'Hectares'},
        {key:'appellations',label:'Appellations'},{key:'grapes',label:'Castas principais'},{key:'status',label:'Status'},{key:'actions',label:''},
      ], rows })}
    `;
  }

  /* ════════════════════════════════════════
     PRODUCERS MODULE
  ════════════════════════════════════════ */
  function renderProducers() {
    const rows = [
      {name:'Domaine de la Romanée-Conti',region:'Borgonha',country:'França',tier:'Grand Cru',wines:'8',founded:'1869',actions:tableActions(1)},
      {name:'Giacomo Conterno',region:'Piemonte',country:'Itália',tier:'DOCG Ícone',wines:'6',founded:'1920',actions:tableActions(2)},
      {name:'Krug',region:'Champagne',country:'França',tier:'Grande Maison',wines:'12',founded:'1843',actions:tableActions(3)},
      {name:'Sassicaia / Tenuta San Guido',region:'Bolgheri',country:'Itália',tier:'DOC Ícone',wines:'5',founded:'1944',actions:tableActions(4)},
      {name:'Egon Müller',region:'Mosel',country:'Alemanha',tier:'VDP Grosse Lage',wines:'8',founded:'1797',actions:tableActions(5)},
    ];
    return `
      ${sectionHeader('Produtores', `<button class="admin-btn admin-btn--primary">+ Novo produtor</button>`)}
      ${dataTable({ id:'producers-table', columns:[
        {key:'name',label:'Produtor',primary:true},{key:'region',label:'Região'},{key:'country',label:'País'},
        {key:'tier',label:'Tier'},{key:'wines',label:'Vinhos'},{key:'founded',label:'Fundado'},{key:'actions',label:''},
      ], rows })}
    `;
  }

  /* ════════════════════════════════════════
     LMS MODULE
  ════════════════════════════════════════ */
  function renderLMS() {
    const courses = [
      {id:1,title:'Fundamentos do Vinho',modules:12,students:3240,completion:'72%',status:statusBadge('published')},
      {id:2,title:'Regiões Clássicas da Europa',modules:24,students:1820,completion:'58%',status:statusBadge('published')},
      {id:3,title:'Degustação às Cegas — Avançado',modules:18,students:940,completion:'44%',status:statusBadge('published')},
      {id:4,title:'Preparação WSET Level 3',modules:32,students:620,completion:'31%',status:statusBadge('published')},
      {id:5,title:'Serviço e Sommelier Profissional',modules:16,students:480,completion:'22%',status:statusBadge('review')},
    ].map(c => ({...c, actions: tableActions(c.id)}));

    return `
      ${sectionHeader('Academy <em>/ LMS</em>', `
        <button class="admin-btn admin-btn--secondary">Exportar progresso</button>
        <button class="admin-btn admin-btn--primary">+ Novo curso</button>
      `)}
      <div class="admin-grid-4" style="margin-bottom:var(--space-6)">
        ${[
          {l:'Estudantes ativos',v:'7,100',t:'+18%'},
          {l:'Cursos publicados',v:'14',t:'+2'},
          {l:'Taxa de conclusão',v:'51%',t:'+4%'},
          {l:'Certificados emitidos',v:'1,840',t:'+12%'},
        ].map(k => `
          <div class="kpi-card">
            <p class="kpi-card__label">${k.l}</p>
            <div class="kpi-card__value">${k.v}</div>
            <div class="kpi-card__trend kpi-card__trend--up">▲ ${k.t}</div>
          </div>
        `).join('')}
      </div>
      ${dataTable({ id:'lms-table', columns:[
        {key:'title',label:'Curso',primary:true},{key:'modules',label:'Módulos'},
        {key:'students',label:'Estudantes'},{key:'completion',label:'Conclusão'},{key:'status',label:'Status'},{key:'actions',label:''},
      ], rows: courses })}
    `;
  }

  function bindLMS() { bindDataTable('lms-table'); }

  /* ════════════════════════════════════════
     USERS MODULE
  ════════════════════════════════════════ */
  function renderUsers() {
    const users = [
      {name:'Maria Rossi', email:'m.rossi@cruvin.io', role:'Editorial Director', plan:'Pro', joined:'Jan 2024', status:statusBadge('published')},
      {name:'João Santos', email:'j.santos@cruvin.io', role:'Writer', plan:'Pro', joined:'Feb 2024', status:statusBadge('published')},
      {name:'Paula Lima', email:'p.lima@cruvin.io', role:'Sommelier Educator', plan:'Academy', joined:'Mar 2024', status:statusBadge('published')},
      {name:'Carlos Moura', email:'c.moura@email.com', role:'Subscriber', plan:'Free', joined:'Mai 2025', status:statusBadge('review')},
      {name:'Ana Ferreira', email:'a.ferreira@email.com', role:'Subscriber', plan:'Pro', joined:'Abr 2025', status:statusBadge('published')},
      {name:'Rafael Brito', email:'r.brito@email.com', role:'Producer Partner', plan:'Partner', joined:'Jan 2025', status:statusBadge('published')},
    ].map(u => ({...u, actions: tableActions(u.email)}));

    return `
      ${sectionHeader('Usuários <em>& Membros</em>', `
        <button class="admin-btn admin-btn--secondary">Exportar</button>
        <button class="admin-btn admin-btn--primary">+ Convidar usuário</button>
      `)}
      <div class="table-filters">
        <div class="table-filter-input"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input type="text" placeholder="Buscar usuários…" /></div>
        <select class="table-filter-select"><option>Todos os planos</option><option>Free</option><option>Pro</option><option>Academy</option></select>
        <select class="table-filter-select"><option>Todos os roles</option><option>Admin</option><option>Writer</option><option>Subscriber</option></select>
      </div>
      ${dataTable({ id:'users-table', columns:[
        {key:'name',label:'Nome',primary:true},{key:'email',label:'Email'},{key:'role',label:'Role'},
        {key:'plan',label:'Plano'},{key:'joined',label:'Entrou'},{key:'status',label:'Status'},{key:'actions',label:''},
      ], rows: users })}
    `;
  }

  /* ════════════════════════════════════════
     AI MODULE
  ════════════════════════════════════════ */
  function renderAI() {
    const models = [
      {name:'Tasting Assistant', desc:'Análise de notas de degustação e identificação de aromas', status:true, requests:'28,400/mo'},
      {name:'Semantic Search', desc:'Motor de busca semântica por aromas, regiões e castas', status:true, requests:'142,000/mo'},
      {name:'OCR Label Scanner', desc:'Reconhecimento óptico de rótulos de garrafas via câmera', status:true, requests:'4,200/mo'},
      {name:'Recommendation Engine', desc:'Sugestões personalizadas por mood, occasion e histórico', status:true, requests:'31,800/mo'},
      {name:'Pairing Intelligence', desc:'Harmonização vinho-comida baseada em estrutura sensorial', status:false, requests:'—'},
      {name:'Content Summarization', desc:'Resumo automático de artigos e relatórios de safra', status:false, requests:'—'},
    ];

    return `
      ${sectionHeader('IA <em>& Modelos</em>', ``)}
      <div class="admin-grid-4" style="margin-bottom:var(--space-6)">
        ${[
          {l:'Requests totais/mês',v:'206,400',t:'+34%'},
          {l:'Latência média',v:'240ms',t:'-12%'},
          {l:'Taxa de acerto',v:'94.2%',t:'+2.1%'},
          {l:'Custo mensal',v:'€ 1,840',t:'+8%'},
        ].map(k => `
          <div class="kpi-card">
            <p class="kpi-card__label">${k.l}</p>
            <div class="kpi-card__value">${k.v}</div>
            <div class="kpi-card__trend kpi-card__trend--up">▲ ${k.t}</div>
          </div>
        `).join('')}
      </div>
      <div class="admin-grid-2">
        ${models.map(m => `
          <div class="ai-model-card">
            <div class="ai-model-card__header">
              <div>
                <div class="ai-model-card__name">${m.name}</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">${m.desc}</div>
              </div>
              <div class="ai-toggle ${m.status ? 'on' : ''}" data-model="${m.name}"></div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--space-4)">
              <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-muted)">Requests</span>
              <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--color-gold)">${m.requests}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function bindAI() {
    qsa('.ai-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('on');
        const model = toggle.dataset.model;
        const on = toggle.classList.contains('on');
        showToast(`${model}: ${on ? 'ativado' : 'desativado'}`, on ? 'success' : 'success');
      });
    });
  }

  /* ════════════════════════════════════════
     REVENUE MODULE
  ════════════════════════════════════════ */
  function renderRevenue() {
    return `
      ${sectionHeader('Receitas <em>& Monetização</em>', `
        <select class="table-filter-select"><option>Maio 2025</option><option>Abril 2025</option><option>Q1 2025</option></select>
        <button class="admin-btn admin-btn--secondary">Exportar relatório</button>
      `)}
      <div class="admin-grid-4" style="margin-bottom:var(--space-6)">
        ${[
          {l:'MRR',v:'€ 42,800',t:6.7},
          {l:'ARR',v:'€ 513,600',t:6.7},
          {l:'Assinantes ativos',v:'3,840',t:4.2},
          {l:'Churn rate',v:'2.1%',t:-0.3},
        ].map(k => `
          <div class="kpi-card">
            <p class="kpi-card__label">${k.l}</p>
            <div class="kpi-card__value">${k.v}</div>
            <div class="kpi-card__trend kpi-card__trend--${k.t > 0 ? 'up' : 'down'}">
              ${k.t > 0 ? '▲' : '▼'} ${Math.abs(k.t)}%
            </div>
          </div>
        `).join('')}
      </div>
      <div class="admin-grid-2" style="margin-bottom:var(--space-5)">
        ${adminCard('Receita por plano', `
          <div style="display:flex;flex-direction:column;gap:var(--space-4);margin-top:var(--space-2)">
            ${[['Pro Anual','€ 19,200','45%','#c9a84c'],['Pro Mensal','€ 12,400','29%','#4a90c9'],['Academy','€ 8,800','21%','#9b5a8c'],['Outros','€ 2,400','5%','#7a7268']].map(([plan,rev,pct,color]) => `
              <div>
                <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2)">
                  <span style="font-size:var(--text-xs);color:var(--text-secondary)">${plan}</span>
                  <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:${color}">${rev}</span>
                </div>
                <div class="admin-progress"><div class="admin-progress__fill" style="width:${pct};background:${color}"></div></div>
              </div>
            `).join('')}
          </div>
        `)}
        ${adminCard('MRR — últimos 6 meses', `
          <canvas id="mrr-chart" height="180" style="width:100%;margin-top:var(--space-4)"></canvas>
        `)}
      </div>
    `;
  }

  function bindRevenue() {
    const canvas = qs('#mrr-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 400;
    const w = canvas.width, h = 180;
    const months = ['Dez','Jan','Fev','Mar','Abr','Mai'];
    const vals   = [36200, 37800, 39100, 40300, 41200, 42800];
    const maxV = Math.max(...vals) * 1.1;
    const pad = {t:20,r:20,b:30,l:60};
    const cw = w-pad.l-pad.r, ch = h-pad.t-pad.b;

    ctx.clearRect(0,0,w,h);

    for (let i=0;i<=4;i++) {
      const y = pad.t+ch*(1-i/4);
      ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);
      ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.lineWidth=1;ctx.stroke();
      ctx.font='9px "DM Mono",monospace';ctx.fillStyle='rgba(122,114,104,0.6)';
      ctx.textAlign='right';ctx.fillText('€'+(maxV*i/4/1000).toFixed(0)+'k',pad.l-4,y+3);
    }

    const pts = vals.map((v,i) => ({x:pad.l+(i/(vals.length-1))*cw, y:pad.t+ch-(v/maxV)*ch}));

    const grad = ctx.createLinearGradient(0,pad.t,0,pad.t+ch);
    grad.addColorStop(0,'rgba(76,175,80,0.25)');
    grad.addColorStop(1,'rgba(76,175,80,0)');

    ctx.beginPath();
    pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.lineTo(pts[pts.length-1].x,pad.t+ch);ctx.lineTo(pts[0].x,pad.t+ch);
    ctx.closePath();ctx.fillStyle=grad;ctx.fill();

    ctx.beginPath();
    pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.strokeStyle='#4caf50';ctx.lineWidth=2;ctx.stroke();

    months.forEach((m,i)=>{
      ctx.font='9px "DM Mono",monospace';ctx.fillStyle='rgba(122,114,104,0.6)';
      ctx.textAlign='center';ctx.fillText(m,pts[i].x,h-6);
    });
  }

  /* ════════════════════════════════════════
     SETTINGS MODULE
  ════════════════════════════════════════ */
  function renderSettings() {
    return `
      ${sectionHeader('Configurações <em>do sistema</em>')}
      <div class="admin-grid-2">
        ${adminCard('Geral', `
          <div style="display:flex;flex-direction:column;gap:var(--space-4)">
            <div class="admin-field"><label>Nome da plataforma</label><input type="text" value="Cru.Vin" /></div>
            <div class="admin-field"><label>URL base</label><input type="text" value="https://cru.vin" /></div>
            <div class="admin-field"><label>Idioma padrão</label><select><option selected>Português (PT)</option><option>English (EN)</option><option>Français (FR)</option></select></div>
            <div class="admin-field"><label>Fuso horário</label><select><option>Europe/Lisbon</option><option>America/Sao_Paulo</option></select></div>
            <button class="admin-btn admin-btn--primary" style="width:100%;justify-content:center">Salvar configurações</button>
          </div>
        `)}
        ${adminCard('Permissões & Roles', `
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${['Super Admin','Editorial Director','Sommelier Educator','Writer','Designer','Moderator','Community Manager','Producer Partner','Subscriber Support'].map(role => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--color-border)">
                <span style="font-size:var(--text-xs);color:var(--text-secondary)">${role}</span>
                <button class="admin-btn admin-btn--ghost" style="padding:2px 10px">Editar</button>
              </div>
            `).join('')}
          </div>
        `)}
      </div>
    `;
  }

  /* ════════════════════════════════════════
     DATA TABLE BINDING (sort, filter)
  ════════════════════════════════════════ */
  function bindDataTable(tableId) {
    const table = qs(`#${tableId}`);
    if (!table) return;

    let sortCol = null, sortDesc = false;

    table.querySelectorAll('th').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (!col) return;
        if (sortCol === col) sortDesc = !sortDesc;
        else { sortCol = col; sortDesc = false; }

        table.querySelectorAll('th').forEach(t => {
          t.classList.remove('sorted','desc');
        });
        th.classList.add('sorted');
        if (sortDesc) th.classList.add('desc');

        showToast(`Ordenando por ${th.textContent.trim()}`, 'success');
      });
    });
  }

  /* ════════════════════════════════════════
     TOAST SYSTEM
  ════════════════════════════════════════ */
  function showToast(msg, type = 'success') {
    const container = qs('#admin-toasts');
    if (!container) return;

    const icon = type === 'success'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

    const toast = document.createElement('div');
    toast.className = `admin-toast admin-toast--${type}`;
    toast.innerHTML = `${icon} ${msg}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  window.CruVin.adminShowToast = showToast;

  /* ════════════════════════════════════════
     INIT
  ════════════════════════════════════════ */
  navigate('dashboard');

  // Keyboard shortcut: Cmd+K to focus search
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      qs('.admin-topbar__search input')?.focus();
    }
  });

})();

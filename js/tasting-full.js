/* ─────────────────────────────────────────
   TASTING FULL — cru.vin
   Note management, radar, aromas, AI analysis, analytics
───────────────────────────────────────── */

(function TastingFullModule() {
  const { qs, qsa, debounce } = window.CruVin;

  /* ════════════════════════════════════════
     DATA
  ════════════════════════════════════════ */
  const AROMA_CATEGORIES = [
    {
      name: 'Frutas Vermelhas', color: '#c44060',
      items: ['Cereja', 'Framboesa', 'Morango', 'Groselha', 'Amora'],
    },
    {
      name: 'Frutas Escuras', color: '#6b1525',
      items: ['Ameixa', 'Cassis', 'Mirtilo', 'Figo', 'Passas'],
    },
    {
      name: 'Frutas Cítricas', color: '#c9a84c',
      items: ['Limão', 'Lima', 'Toranja', 'Laranja', 'Bergamota'],
    },
    {
      name: 'Frutas Tropicais', color: '#c9a84c',
      items: ['Maracujá', 'Manga', 'Abacaxi', 'Lichee', 'Banana'],
    },
    {
      name: 'Flores', color: '#9b5a8c',
      items: ['Rosa seca', 'Violeta', 'Jasmim', 'Lavanda', 'Açafrão'],
    },
    {
      name: 'Especiarias', color: '#d4804a',
      items: ['Pimenta preta', 'Canela', 'Cravo', 'Alcaçuz', 'Anis'],
    },
    {
      name: 'Terroir', color: '#8b6f47',
      items: ['Pedra molhada', 'Argila', 'Pólvora', 'Giz', 'Xisto'],
    },
    {
      name: 'Amadeirado', color: '#a08838',
      items: ['Baunilha', 'Carvalho', 'Cedro', 'Defumado', 'Tabaco'],
    },
    {
      name: 'Animal / Complexo', color: '#7a7268',
      items: ['Couro', 'Trufa', 'Alcatrão', 'Caça', 'Cogumelos'],
    },
  ];

  const FOOD_PAIRINGS = [
    { id: 'beef',    icon: '🥩', label: 'Carne vermelha' },
    { id: 'lamb',    icon: '🍖', label: 'Cordeiro' },
    { id: 'duck',    icon: '🦆', label: 'Pato' },
    { id: 'cheese',  icon: '🧀', label: 'Queijo' },
    { id: 'pasta',   icon: '🍝', label: 'Massa' },
    { id: 'fish',    icon: '🐟', label: 'Peixe' },
    { id: 'truffle', icon: '🍄', label: 'Trufa' },
    { id: 'charcuterie', icon: '🥓', label: 'Charcutaria' },
  ];

  const TYPE_COLORS = {
    red: '#c44060', white: '#c9a84c', sparkling: '#d4c878',
    rose: '#e8908a', dessert: '#a08838',
  };

  const TYPE_COLOR_PREVIEW = {
    red: 'linear-gradient(135deg, #6b1525, #3d0e1c)',
    white: 'linear-gradient(135deg, #c9a84c40, #8a7235aa)',
    sparkling: 'linear-gradient(135deg, #d4c87840, #a0904880)',
    rose: 'linear-gradient(135deg, #e8908a, #c06060)',
    dessert: 'linear-gradient(135deg, #a08838, #604a20)',
  };

  const SLIDER_LABELS = {
    'sl-clarity':     { vals: ['Turvo','Levemente turvo','Opaco','Límpido','Brilhante'], field: 'clarity' },
    'sl-intensity-v': { vals: ['Fraco','Pálido','Médio','Intenso','Profundo'], field: 'intensity_v' },
    'sl-nose-clean':  { vals: ['Defeituoso','Com falhas','Aceitável','Limpo','Impecável'], field: 'nose_clean' },
    'sl-nose-intensity': { vals: ['Fraco','Discreto','Médio','Pronunciado','Muito intenso'], field: 'nose_int' },
    'sl-develop':     { vals: ['Jovem','Em evolução','Desenvolvido','Complexo','Exuberante'], field: 'develop' },
    'sl-acidity':     { vals: ['Baixa','Média-baixa','Média','Alta','Muito alta'], field: 'acidity' },
    'sl-tannin':      { vals: ['Suave','Leve','Médio','Firme','Adstringente'], field: 'tannin' },
    'sl-body':        { vals: ['Leve','Médio-leve','Médio','Encorpado','Muito encorpado'], field: 'body' },
    'sl-alcohol':     { vals: ['11%','12%','12.5%','13%','13.5%','14%','14.5%','15%+'], field: 'alcohol' },
    'sl-finish':      { vals: ['Curta','Média-curta','Média','Longa','Muito longa'], field: 'finish' },
  };

  /* ════════════════════════════════════════
     STATE
  ════════════════════════════════════════ */
  let notes = [];
  let currentNoteId = null;
  let activeFilter = 'all';
  let selectedAromas = new Set();
  let selectedPairings = new Set();

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function getSliderValues() {
    const vals = {};
    Object.entries(SLIDER_LABELS).forEach(([id]) => {
      const el = qs(`#${id}`);
      if (el) vals[id] = parseInt(el.value);
    });
    return vals;
  }

  function buildNote(overrides = {}) {
    return {
      id: generateId(),
      type: 'red',
      wine: '',
      producer: '',
      region: '',
      vintage: '',
      score: null,
      quality: 'Superior',
      aging: '5–10 anos',
      notes: '',
      aromas: [],
      pairings: [],
      sliders: { 'sl-clarity':90,'sl-intensity-v':70,'sl-nose-clean':95,'sl-nose-intensity':80,'sl-develop':75,'sl-acidity':85,'sl-tannin':90,'sl-body':80,'sl-alcohol':72,'sl-finish':88 },
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  /* ── Seed notes ─────────────────────── */
  function seedData() {
    notes = [
      buildNote({
        id: 'seed-1',
        type: 'red', wine: 'Barolo DOCG 2017',
        producer: 'Giacomo Conterno', region: 'Piemonte', vintage: '2017',
        score: 97, quality: 'Excepcional', aging: '10–20 anos',
        notes: 'Cor granada profunda com reflexos alaranjados. Nariz extraordinariamente complexo: alcatrão, rosa seca, violeta, especiarias orientais e notas de trufa branca. Paladar monumental, com taninos firmes mas sedosos após 6h de decantação. Persistência interminável. Um Barolo de guarda obrigatória.',
        aromas: ['Alcatrão', 'Rosa seca', 'Violeta', 'Trufa', 'Ameixa', 'Especiarias'],
        pairings: ['beef', 'truffle', 'lamb'],
        sliders: { 'sl-clarity':95,'sl-intensity-v':85,'sl-nose-clean':100,'sl-nose-intensity':95,'sl-develop':90,'sl-acidity':88,'sl-tannin':92,'sl-body':90,'sl-alcohol':75,'sl-finish':97 },
      }),
      buildNote({
        id: 'seed-2',
        type: 'white', wine: 'Meursault Les Narvaux 2020',
        producer: 'Domaine Roulot', region: 'Borgonha', vintage: '2020',
        score: 94, quality: 'Excepcional', aging: '5–10 anos',
        notes: 'Ouro pálido com reflexos esverdeados. Nariz mineral e cremoso: manteiga noisette, mel de acácia, pedra molhada, limão confit. Paladar de acidez viva e cortante, textura viscosa e longa persistência. Chardonnay de referência para a appellation.',
        aromas: ['Limão', 'Baunilha', 'Pedra molhada', 'Giz', 'Bergamota'],
        pairings: ['fish', 'cheese'],
        sliders: { 'sl-clarity':98,'sl-intensity-v':75,'sl-nose-clean':98,'sl-nose-intensity':85,'sl-develop':80,'sl-acidity':92,'sl-tannin':10,'sl-body':65,'sl-alcohol':68,'sl-finish':88 },
      }),
      buildNote({
        id: 'seed-3',
        type: 'sparkling', wine: 'Krug Grande Cuvée 170ème Édition',
        producer: 'Krug', region: 'Champagne', vintage: 'NV',
        score: 99, quality: 'Excepcional', aging: '1–3 anos',
        notes: 'Borbulhamento fino e persistente. Cor dourada com reflexos âmbar. Nariz de extraordinária complexidade: brioche tostado, mel de abelha, frutas secas, especiarias e nuances de giz. Paladar vibrante, cremoso, de acidez estrutural. O epítome do luxo efervescente.',
        aromas: ['Limão', 'Bergamota', 'Baunilha', 'Pimenta preta', 'Giz'],
        pairings: ['cheese', 'fish', 'charcuterie'],
        sliders: { 'sl-clarity':99,'sl-intensity-v':80,'sl-nose-clean':100,'sl-nose-intensity':92,'sl-develop':95,'sl-acidity':90,'sl-tannin':5,'sl-body':70,'sl-alcohol':65,'sl-finish':96 },
      }),
    ];
  }

  /* ════════════════════════════════════════
     RENDER NOTES LIST
  ════════════════════════════════════════ */
  function renderNotesList(search = '') {
    const list = qs('#notes-list');
    if (!list) return;

    const filtered = notes.filter((n) => {
      const matchFilter = activeFilter === 'all' || n.type === activeFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || n.wine.toLowerCase().includes(q) || n.region.toLowerCase().includes(q) || n.producer.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });

    list.innerHTML = filtered.length === 0
      ? `<div style="padding:var(--space-6);text-align:center;font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-mono)">Nenhuma nota encontrada</div>`
      : filtered.map((n) => `
        <div class="tj-note-item ${currentNoteId === n.id ? 'active' : ''}" data-id="${n.id}">
          <div class="tj-note-item__dot" style="background:${TYPE_COLORS[n.type] || '#c9a84c'}"></div>
          <div class="tj-note-item__content">
            <span class="tj-note-item__wine">${n.wine || 'Sem nome'}</span>
            <span class="tj-note-item__meta">${n.region || '—'} · ${n.vintage || '—'}</span>
          </div>
          ${n.score ? `<span class="tj-note-item__score">${n.score}</span>` : ''}
        </div>
      `).join('');

    list.querySelectorAll('.tj-note-item').forEach((el) => {
      el.addEventListener('click', () => openNote(el.dataset.id));
    });

    // Update count
    const countEl = qs('#journal-count');
    if (countEl) countEl.textContent = `${notes.length} nota${notes.length !== 1 ? 's' : ''}`;
  }

  /* ════════════════════════════════════════
     OPEN / LOAD NOTE
  ════════════════════════════════════════ */
  function openNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    currentNoteId = id;

    // Show editor
    qs('#tj-empty').style.display = 'none';
    qs('#tj-editor').style.display = 'block';

    // Set type
    qsa('.wine-type-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.type === note.type);
    });
    updateColorPreview(note.type);

    // Identity fields
    setField('field-wine-name', note.wine);
    setField('field-producer', note.producer);
    setField('field-region', note.region);
    setField('field-vintage', note.vintage);
    setField('field-score', note.score || '');
    setField('field-quality', note.quality, true);
    setField('field-aging', note.aging, true);
    setField('field-notes', note.notes);

    // Date
    const dateEl = qs('#note-date');
    if (dateEl) dateEl.textContent = formatDate(note.createdAt);

    // Sliders
    Object.entries(note.sliders).forEach(([slId, val]) => {
      const sl = qs(`#${slId}`);
      if (sl) {
        sl.value = val;
        updateSliderUI(sl);
      }
    });

    // Aromas
    selectedAromas = new Set(note.aromas);
    renderAromas();

    // Pairings
    selectedPairings = new Set(note.pairings);
    renderPairings();

    // Score ring
    updateScoreRing(note.score);

    // Radar
    updateRadar();

    // Re-render list to show active
    renderNotesList(qs('#journal-search')?.value || '');

    // Analytics
    renderAnalytics();

    // Hide AI panel
    const aiPanel = qs('#ai-panel');
    if (aiPanel) aiPanel.style.display = 'none';
  }

  function setField(id, val, isSelect = false) {
    const el = qs(`#${id}`);
    if (!el) return;
    if (isSelect) {
      const opts = [...el.options];
      const match = opts.find(o => o.value === val || o.textContent === val);
      if (match) el.value = match.value;
    } else {
      el.value = val || '';
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  /* ════════════════════════════════════════
     CREATE NOTE
  ════════════════════════════════════════ */
  function createNote() {
    const note = buildNote();
    notes.unshift(note);
    renderNotesList();
    openNote(note.id);
  }

  /* ════════════════════════════════════════
     SAVE NOTE
  ════════════════════════════════════════ */
  function saveCurrentNote() {
    const idx = notes.findIndex(n => n.id === currentNoteId);
    if (idx === -1) return;

    notes[idx] = {
      ...notes[idx],
      wine:     qs('#field-wine-name')?.value || '',
      producer: qs('#field-producer')?.value || '',
      region:   qs('#field-region')?.value || '',
      vintage:  qs('#field-vintage')?.value || '',
      score:    parseInt(qs('#field-score')?.value) || null,
      quality:  qs('#field-quality')?.value || 'Superior',
      aging:    qs('#field-aging')?.value || '5–10 anos',
      notes:    qs('#field-notes')?.value || '',
      aromas:   [...selectedAromas],
      pairings: [...selectedPairings],
      sliders:  getSliderValues(),
    };

    renderNotesList();
    renderAnalytics();
    showToast('Nota salva');
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:var(--space-8);left:50%;transform:translateX(-50%);background:var(--color-surface-3);border:1px solid var(--color-border-warm);color:var(--color-gold);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:0.1em;padding:var(--space-3) var(--space-6);border-radius:var(--radius-pill);z-index:var(--z-toast);transition:opacity 0.3s;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2000);
  }

  /* ════════════════════════════════════════
     DELETE NOTE
  ════════════════════════════════════════ */
  function deleteCurrentNote() {
    if (!currentNoteId) return;
    if (!confirm('Remover esta nota de degustação?')) return;
    notes = notes.filter(n => n.id !== currentNoteId);
    currentNoteId = null;
    qs('#tj-editor').style.display = 'none';
    qs('#tj-empty').style.display = 'flex';
    renderNotesList();
    renderAnalytics();
  }

  /* ════════════════════════════════════════
     SLIDERS
  ════════════════════════════════════════ */
  function getLabel(slId, val) {
    const config = SLIDER_LABELS[slId];
    if (!config) return val;
    const idx = Math.round((val / 100) * (config.vals.length - 1));
    return config.vals[Math.min(idx, config.vals.length - 1)];
  }

  function updateSliderUI(slider) {
    const id    = slider.id;
    const val   = parseInt(slider.value);
    const fillId = 'fill-' + id.replace('sl-', '');
    const valId  = 'val-'  + id.replace('sl-', '');

    const fill = qs(`#${fillId}`);
    const valEl = qs(`#${valId}`);

    if (fill) fill.style.width = `${val}%`;
    if (valEl) valEl.textContent = getLabel(id, val);

    updateRadar();
    updateScoreRing(qs('#field-score')?.value);
  }

  qsa('.tj-slider').forEach(slider => {
    slider.addEventListener('input', () => updateSliderUI(slider));
    updateSliderUI(slider);
  });

  /* ════════════════════════════════════════
     COLOR PREVIEW
  ════════════════════════════════════════ */
  function updateColorPreview(type) {
    const el = qs('#wine-color-preview');
    if (el) el.style.background = TYPE_COLOR_PREVIEW[type] || TYPE_COLOR_PREVIEW.red;
  }

  qsa('.wine-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.wine-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateColorPreview(btn.dataset.type);
    });
  });

  /* ════════════════════════════════════════
     SCORE RING
  ════════════════════════════════════════ */
  function updateScoreRing(score) {
    const canvas = qs('#score-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 50, cy = 50, r = 40;
    const val = Math.max(50, Math.min(100, parseInt(score) || 0));
    const pct = (val - 50) / 50;

    ctx.clearRect(0, 0, 100, 100);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI/2, Math.PI * 1.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    if (val > 50) {
      // Score arc
      const endAngle = -Math.PI/2 + (Math.PI * 2 * pct);
      const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      grad.addColorStop(0, '#6b1525');
      grad.addColorStop(1, '#c9a84c');
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI/2, endAngle);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  qs('#field-score')?.addEventListener('input', (e) => updateScoreRing(e.target.value));

  /* ════════════════════════════════════════
     RADAR CHART
  ════════════════════════════════════════ */
  function updateRadar() {
    const canvas = qs('#tj-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 140, cy = 140, R = 110;

    const params = [
      { label: 'Acidez',  val: parseInt(qs('#sl-acidity')?.value  || 85) / 100 },
      { label: 'Tanino',  val: parseInt(qs('#sl-tannin')?.value   || 90) / 100 },
      { label: 'Corpo',   val: parseInt(qs('#sl-body')?.value     || 80) / 100 },
      { label: 'Álcool',  val: parseInt(qs('#sl-alcohol')?.value  || 72) / 100 },
      { label: 'Nariz',   val: parseInt(qs('#sl-nose-intensity')?.value || 80) / 100 },
      { label: 'Persistência', val: parseInt(qs('#sl-finish')?.value || 88) / 100 },
    ];

    const N = params.length;
    const angle = (Math.PI * 2) / N;

    function pt(i, v) {
      const a = angle * i - Math.PI / 2;
      return { x: cx + Math.cos(a) * R * v, y: cy + Math.sin(a) * R * v };
    }

    ctx.clearRect(0, 0, 280, 280);

    // Rings
    for (let r = 1; r <= 5; r++) {
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const p = pt(i, r / 5);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axes
    for (let i = 0; i < N; i++) {
      const p = pt(i, 1);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Labels
    ctx.font = '10px "DM Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(184,176,160,0.7)';
    params.forEach((p, i) => {
      const lp = pt(i, 1.2);
      ctx.fillText(p.label, lp.x, lp.y);
    });

    // Data shape
    ctx.beginPath();
    params.forEach((p, i) => {
      const dp = pt(i, p.val);
      i === 0 ? ctx.moveTo(dp.x, dp.y) : ctx.lineTo(dp.x, dp.y);
    });
    ctx.closePath();

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    grad.addColorStop(0, 'rgba(201,168,76,0.3)');
    grad.addColorStop(1, 'rgba(107,21,37,0.15)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,168,76,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Points
    params.forEach((p, i) => {
      const dp = pt(i, p.val);
      ctx.beginPath();
      ctx.arc(dp.x, dp.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#c9a84c';
      ctx.fill();
    });
  }

  /* ════════════════════════════════════════
     AROMAS
  ════════════════════════════════════════ */
  function renderAromas() {
    const container = qs('.tj-aroma-categories');
    if (!container) return;

    container.innerHTML = AROMA_CATEGORIES.map(cat => `
      <div class="aroma-category">
        <p class="aroma-category__name" style="color:${cat.color}">${cat.name}</p>
        <div class="aroma-tags">
          ${cat.items.map(item => `
            <span class="aroma-tag ${selectedAromas.has(item) ? 'selected' : ''}" data-aroma="${item}">${item}</span>
          `).join('')}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.aroma-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const aroma = tag.dataset.aroma;
        if (selectedAromas.has(aroma)) {
          selectedAromas.delete(aroma);
          tag.classList.remove('selected');
        } else {
          selectedAromas.add(aroma);
          tag.classList.add('selected');
        }
        renderSelectedAromas();
      });
    });

    renderSelectedAromas();
  }

  function renderSelectedAromas() {
    const el = qs('#selected-aromas');
    if (!el) return;
    el.innerHTML = [...selectedAromas].map(a =>
      `<span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--color-gold);padding:var(--space-1) var(--space-3);border:1px solid var(--color-border-warm);border-radius:var(--radius-pill)">${a}</span>`
    ).join('');
  }

  /* ════════════════════════════════════════
     FOOD PAIRINGS
  ════════════════════════════════════════ */
  function renderPairings() {
    const grid = qs('#pairing-grid');
    if (!grid) return;

    grid.innerHTML = FOOD_PAIRINGS.map(p => `
      <div class="pairing-item ${selectedPairings.has(p.id) ? 'selected' : ''}" data-id="${p.id}">
        <span class="pairing-item__icon">${p.icon}</span>
        <span class="pairing-item__label">${p.label}</span>
      </div>
    `).join('');

    grid.querySelectorAll('.pairing-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        if (selectedPairings.has(id)) {
          selectedPairings.delete(id);
          item.classList.remove('selected');
        } else {
          selectedPairings.add(id);
          item.classList.add('selected');
        }
      });
    });
  }

  /* ════════════════════════════════════════
     AI ANALYSIS
  ════════════════════════════════════════ */
  function runAIAnalysis() {
    const panel = qs('#ai-panel');
    const body  = qs('#ai-panel-body');
    if (!panel || !body) return;

    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    body.innerHTML = `
      <div class="ai-loading">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        Analisando perfil sensorial
        <div class="ai-loading__dots"><span></span><span></span><span></span></div>
      </div>`;

    // Read current values
    const wineName = qs('#field-wine-name')?.value || 'o vinho';
    const region   = qs('#field-region')?.value;
    const vintage  = qs('#field-vintage')?.value;
    const score    = qs('#field-score')?.value;
    const acidity  = parseInt(qs('#sl-acidity')?.value || 85);
    const tannin   = parseInt(qs('#sl-tannin')?.value  || 90);
    const body     = parseInt(qs('#sl-body')?.value    || 80);
    const finish   = parseInt(qs('#sl-finish')?.value  || 88);
    const aromas   = [...selectedAromas];
    const wineType = qs('.wine-type-btn.active')?.dataset.type || 'red';

    setTimeout(() => {
      // Simulated AI analysis based on slider values
      const origins = deriveOrigins(wineType, acidity, tannin, body, aromas);
      const window  = deriveWindow(tannin, body, score, vintage);
      const foods   = deriveFoods(wineType, tannin, body, aromas);
      const summary = deriveSummary(wineName, wineType, acidity, tannin, body, finish, aromas, score);

      body.innerHTML = `
        <p>${summary}</p>

        <h4>Origem provável</h4>
        <div class="ai-origin-tags">${origins.map(o => `<span>${o}</span>`).join('')}</div>

        <h4>Janela de consumo ideal</h4>
        <div class="ai-window">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span class="ai-window__range">${window.range}</span>
          <span class="ai-window__label">${window.note}</span>
        </div>

        <h4>Harmonizações sugeridas</h4>
        <div class="ai-food-tags">${foods.map(f => `<span>${f}</span>`).join('')}</div>

        <h4>Análise de estrutura</h4>
        <p>Acidez ${acidity > 75 ? 'elevada' : 'moderada'} indica ${acidity > 75 ? 'excelente potencial de guarda e compatibilidade com pratos ricos' : 'adequação para consumo no médio prazo'}. ${tannin > 80 ? `Taninos firmes (${tannin}%) requerem ${vintage ? (2024 - parseInt(vintage)) < 5 ? 'paciência — o vinho está em fase fechada' : 'decantação de 2–3h para abertura plena' : 'decantação adequada'}.` : 'Taninos maduros e integrados.'}</p>
      `;
    }, 2200);
  }

  function deriveOrigins(type, acid, tannin, body, aromas) {
    const hasTruffle = aromas.includes('Trufa') || aromas.includes('Alcatrão');
    const hasFloral  = aromas.includes('Rosa seca') || aromas.includes('Violeta');
    const hasMint    = aromas.includes('Cassis');

    if (type === 'red') {
      if (tannin > 85 && hasTruffle) return ['Piemonte (Nebbiolo)', 'Barolo / Barbaresco', 'Langhe'];
      if (tannin > 80 && hasFloral)  return ['Borgonha (Pinot Noir)', 'Côte de Nuits', 'Côte de Beaune'];
      if (hasMint && acid < 75)      return ['Napa Valley (Cabernet)', 'Bordeaux Rive Gauche'];
      if (acid > 85)                 return ['Borgonha', 'Beaujolais', 'Loire'];
      return ['Rhône (Syrah)', 'Toscana (Sangiovese)', 'Rioja'];
    } else if (type === 'white') {
      if (acid > 85) return ['Borgonha (Chardonnay)', 'Meursault', 'Chablis'];
      return ['Alsace', 'Loire', 'Borgonha'];
    }
    return ['Champagne', 'Crémant d\'Alsace', 'Franciacorta'];
  }

  function deriveWindow(tannin, body, score, vintage) {
    const year = parseInt(vintage) || 2020;
    const now  = 2024;
    const age  = now - year;
    let peak, close;

    if (tannin > 85 && body > 80) {
      peak  = year + 8;
      close = year + 20;
    } else if (tannin > 70) {
      peak  = year + 4;
      close = year + 12;
    } else {
      peak  = year + 1;
      close = year + 5;
    }

    const note = age < 3 ? 'Janela ainda fechando' : age < (peak - year) ? 'Em desenvolvimento' : 'Próximo do pico';
    return { range: `${peak}–${close}`, note };
  }

  function deriveFoods(type, tannin, body, aromas) {
    const hasTruffle = aromas.includes('Trufa');
    if (type === 'red' && tannin > 80) {
      return hasTruffle
        ? ['Bisteca florentina', 'Trufa branca', 'Queijo Parmigiano-Reggiano', 'Cordeiro ao forno']
        : ['Carne assada', 'Cordeiro', 'Queijo maturado', 'Risoto de cogumelos'];
    } else if (type === 'white') {
      return ['Peixe nobre grelhado', 'Frutos do mar', 'Queijo de cabra', 'Lagosta'];
    }
    return ['Ostras', 'Salmão', 'Caviar', 'Canapés'];
  }

  function deriveSummary(name, type, acid, tannin, body, finish, aromas, score) {
    const intensity = acid > 80 && tannin > 80 ? 'alta tensão e densidade' : 'equilíbrio e elegância';
    const aromaStr  = aromas.slice(0, 3).join(', ') || 'complexidade aromática';
    const scoreStr  = score > 95 ? 'excepcional' : score > 90 ? 'muito acima da média' : 'de qualidade superior';

    return `${name || 'Este vinho'} apresenta um perfil de ${intensity}. O nariz é definido por notas de ${aromaStr}, com ${finish > 85 ? 'persistência notável' : 'finalização equilibrada'}. A análise estrutural aponta para um vinho ${scoreStr}${score ? ` (${score} pts)` : ''}, com ${acid > 80 ? 'acidez vivaz' : 'acidez moderada'} e ${tannin > 75 ? 'estrutura tânica presente' : 'taninos maduros'}.`;
  }

  /* ════════════════════════════════════════
     EVOLUTION CHART (Sidebar mini)
  ════════════════════════════════════════ */
  function renderEvolutionChart() {
    const canvas = qs('#evolution-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 280, h = 80;

    ctx.clearRect(0, 0, w, h);

    const scores = notes.filter(n => n.score).slice(-12).map(n => n.score);
    if (scores.length < 2) {
      ctx.font = '10px "DM Mono", monospace';
      ctx.fillStyle = 'rgba(122,114,104,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText('Adicione mais notas para ver a evolução', w/2, h/2);
      return;
    }

    const minS = Math.min(...scores) - 2;
    const maxS = Math.max(...scores) + 2;

    const pts = scores.map((s, i) => ({
      x: (i / (scores.length - 1)) * (w - 20) + 10,
      y: h - 10 - ((s - minS) / (maxS - minS)) * (h - 20),
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(201,168,76,0.2)');
    grad.addColorStop(1, 'rgba(201,168,76,0)');

    ctx.beginPath();
    ctx.moveTo(pts[0].x, h);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length-1].x, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = 'rgba(201,168,76,0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dots
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#c9a84c';
      ctx.fill();
    });
  }

  /* ════════════════════════════════════════
     SCORE DISTRIBUTION CHART
  ════════════════════════════════════════ */
  function renderScoreDistChart() {
    const canvas = qs('#score-dist-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 240, h = 80;
    ctx.clearRect(0, 0, w, h);

    const buckets = { '50-74': 0, '75-84': 0, '85-89': 0, '90-94': 0, '95-100': 0 };
    notes.forEach(n => {
      if (!n.score) return;
      if (n.score < 75)       buckets['50-74']++;
      else if (n.score < 85)  buckets['75-84']++;
      else if (n.score < 90)  buckets['85-89']++;
      else if (n.score < 95)  buckets['90-94']++;
      else                    buckets['95-100']++;
    });

    const keys   = Object.keys(buckets);
    const vals   = Object.values(buckets);
    const maxVal = Math.max(...vals, 1);
    const bw     = w / keys.length;

    keys.forEach((k, i) => {
      const bh = (vals[i] / maxVal) * (h - 24);
      const x  = i * bw + 4;
      const y  = h - 20 - bh;

      const g = ctx.createLinearGradient(0, y, 0, y + bh);
      g.addColorStop(0, 'rgba(201,168,76,0.8)');
      g.addColorStop(1, 'rgba(107,21,37,0.4)');

      ctx.fillStyle = g;
      ctx.fillRect(x, y, bw - 8, bh);

      ctx.font = '8px "DM Mono", monospace';
      ctx.fillStyle = 'rgba(122,114,104,0.8)';
      ctx.textAlign = 'center';
      ctx.fillText(k, x + (bw-8)/2, h - 5);
    });
  }

  /* ════════════════════════════════════════
     ANALYTICS PANEL
  ════════════════════════════════════════ */
  function renderAnalytics() {
    // Stats
    const total = notes.length;
    const scored = notes.filter(n => n.score);
    const avg = scored.length ? Math.round(scored.reduce((s, n) => s + n.score, 0) / scored.length) : null;

    const regionCounts = {};
    notes.forEach(n => { if (n.region) regionCounts[n.region] = (regionCounts[n.region] || 0) + 1; });
    const topRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    const statTotal = qs('#stat-total');
    const statAvg   = qs('#stat-avg');
    const statTopR  = qs('#stat-top-region');
    if (statTotal) statTotal.textContent = total;
    if (statAvg)   statAvg.textContent   = avg || '—';
    if (statTopR)  statTopR.textContent  = topRegion;

    // Type distribution
    const typeCounts = { red: 0, white: 0, sparkling: 0, rose: 0, dessert: 0 };
    notes.forEach(n => { typeCounts[n.type] = (typeCounts[n.type] || 0) + 1; });
    const maxType = Math.max(...Object.values(typeCounts), 1);

    const typeLabels = { red: 'Tinto', white: 'Branco', sparkling: 'Espumante', rose: 'Rosé', dessert: 'Sobremesa' };
    const typeBarsEl = qs('#type-bars');
    if (typeBarsEl) {
      typeBarsEl.innerHTML = Object.entries(typeCounts)
        .filter(([_, v]) => v > 0)
        .map(([type, count]) => `
          <div class="type-bar-row">
            <span class="type-bar-row__label">${typeLabels[type]}</span>
            <div class="type-bar-row__track">
              <div class="type-bar-row__fill" style="width:${(count/maxType)*100}%;background:${TYPE_COLORS[type]}"></div>
            </div>
            <span class="type-bar-row__count">${count}</span>
          </div>
        `).join('');
    }

    // Regions
    const regionsEl = qs('#analytics-regions');
    if (regionsEl) {
      const sorted = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
      regionsEl.innerHTML = sorted.map(([r, c]) => `
        <div class="analytics-region-row">
          <span class="analytics-region-row__name">${r}</span>
          <span class="analytics-region-row__count">${c} nota${c > 1 ? 's' : ''}</span>
        </div>
      `).join('') || '<p style="font-size:var(--text-xs);color:var(--text-muted)">Sem regiões registadas</p>';
    }

    // Top aromas
    const aromaCounts = {};
    notes.forEach(n => n.aromas.forEach(a => { aromaCounts[a] = (aromaCounts[a] || 0) + 1; }));
    const topAromas = Object.entries(aromaCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const topAromasEl = qs('#top-aromas');
    if (topAromasEl) {
      topAromasEl.innerHTML = topAromas.map(([a]) => `<span class="top-aroma-tag">${a}</span>`).join('');
    }

    renderScoreDistChart();
    renderEvolutionChart();
  }

  /* ════════════════════════════════════════
     EVENT BINDINGS
  ════════════════════════════════════════ */
  qs('#btn-new-note')?.addEventListener('click', createNote);
  qs('#btn-new-empty')?.addEventListener('click', createNote);
  qs('#btn-save-note')?.addEventListener('click', saveCurrentNote);
  qs('#btn-delete-note')?.addEventListener('click', deleteCurrentNote);
  qs('#btn-ai-analyze')?.addEventListener('click', runAIAnalysis);
  qs('#ai-panel-close')?.addEventListener('click', () => {
    const p = qs('#ai-panel');
    if (p) p.style.display = 'none';
  });

  // Filters
  qsa('.tj-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.tj-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderNotesList(qs('#journal-search')?.value || '');
    });
  });

  // Search
  qs('#journal-search')?.addEventListener('input', debounce((e) => {
    renderNotesList(e.target.value);
  }, 200));

  // Auto-save on field change
  ['field-wine-name','field-producer','field-region','field-vintage','field-notes'].forEach(id => {
    qs(`#${id}`)?.addEventListener('change', saveCurrentNote);
  });
  qs('#field-score')?.addEventListener('change', saveCurrentNote);

  /* ════════════════════════════════════════
     INIT
  ════════════════════════════════════════ */
  seedData();
  renderNotesList();
  renderAnalytics();
  renderAromas();
  renderPairings();

  // Open first note
  setTimeout(() => {
    if (notes.length > 0) openNote(notes[0].id);
  }, 200);

})();

# Cru.Vin — Wine Intelligence Platform

## Estrutura de Arquivos

```
cru.vin/
├── index.html              # HTML principal
│
├── css/
│   ├── reset.css           # Reset de estilos base
│   ├── tokens.css          # Variáveis CSS (cores, tipografia, espaçamento)
│   ├── layout.css          # Grid, containers, botões, ticker, seções genéricas
│   ├── nav.css             # Navegação + overlay de busca + menu mobile
│   ├── hero.css            # Seção hero (fullscreen) + partículas
│   ├── sections.css        # Editorial, Academy, Discovery
│   ├── cards.css           # Componentes de cards reutilizáveis
│   ├── atlas.css           # Mapa interativo de terroir
│   ├── tasting.css         # Sistema de degustação + radar chart
│   ├── footer.css          # Rodapé completo
│   └── animations.css      # Keyframes + data-reveal + reduced-motion
│
└── js/
    ├── utils.js            # Funções utilitárias compartilhadas (debounce, observer, etc.)
    ├── nav.js              # Scroll behaviour, busca overlay, menu mobile
    ├── hero.js             # Animações de entrada + canvas de partículas
    ├── atlas.js            # Interatividade do mapa (pins, regiões, auto-ciclo)
    ├── tasting.js          # Radar chart canvas + animação de barras
    ├── discovery.js        # Engine de descoberta por humor
    ├── animations.js       # IntersectionObserver (reveals, contadores, stagger)
    └── main.js             # Inicialização geral, tema, acessibilidade
```

## Filosofia de Arquitetura

### CSS
- **tokens.css** é a única fonte de verdade para cores, fontes e espaçamentos
- Cada arquivo de CSS corresponde a uma seção ou componente lógico
- BEM-like naming: `.section__title`, `.hero__eyebrow`, `.tasting-card__wine`
- Responsive breakpoints localizados em cada arquivo (mobile-first)
- `animations.css` inclui `prefers-reduced-motion` para acessibilidade

### JavaScript
- Nenhum framework ou build step necessário — vanilla JS puro
- Módulos em IIFE (Immediately Invoked Function Expression) para escopo
- `utils.js` exporta utilitários para `window.CruVin`
- Cada módulo JS é independente e auto-contido
- IntersectionObserver para todas as animações scroll-triggered

## Design System

### Cores
- `--color-burgundy`: #6b1525 — acento principal
- `--color-gold`: #c9a84c — destaques, labels
- `--color-ivory`: #f4f0e8 — texto principal
- `--color-black`: #080604 — background

### Tipografia
- **Display**: Playfair Display (títulos, editoriais)
- **Body**: Jost (texto corrido, UI)
- **Mono**: DM Mono (labels, código, metadata)

### Componentes Principais
- `[data-reveal]` — qualquer elemento com este atributo recebe animação scroll-reveal
- `[data-count]` — número que se anima via contador ao entrar em viewport
- `.btn-primary`, `.btn-secondary`, `.btn-ghost` — sistema de botões
- `.section__eyebrow` — label de seção com numeração

## Como Usar

Abra `index.html` em qualquer servidor local. Não há dependências externas além das fontes Google Fonts.

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# Use a extensão Live Server
```

## Próximos Passos (Roadmap)

- [ ] Página de Atlas interativo completo (Mapbox)
- [ ] Sistema de autenticação (Supabase)
- [ ] Módulo de degustação completo
- [ ] Admin dashboard
- [ ] PWA / app mobile
- [ ] Integração com API de vinhos
- [ ] Sistema de assinaturas

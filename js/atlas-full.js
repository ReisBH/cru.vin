/* ─────────────────────────────────────────
   ATLAS FULL — cru.vin
   Canvas map engine: pan, zoom, regions, detail panel
───────────────────────────────────────── */

(function AtlasFullModule() {
  const { qs, qsa, debounce } = window.CruVin;

  /* ════════════════════════════════════════
     DATA
  ════════════════════════════════════════ */
  const REGIONS = [
    {
      id: 'burgundy', name: 'Borgonha', country: 'França', countryFull: 'França · Bourgogne-Franche-Comté',
      flag: '🇫🇷', tab: 'france',
      x: 0.495, y: 0.34,
      color: '#c9a84c', radius: 18, intensity: 0.95,
      stats: [
        { val: '28,000 ha', lbl: 'Área' },
        { val: '84', lbl: 'Appellations' },
        { val: '1,500+', lbl: 'Produtores' },
      ],
      grapes: ['Pinot Noir', 'Chardonnay', 'Aligoté', 'Gamay'],
      primaryGrape: 'Pinot Noir',
      overview: 'A Borgonha é a região de referência mundial para Pinot Noir e Chardonnay. Seu sistema de classificação em Grand Cru, Premier Cru, Village e Régional define a hierarquia vinícola mais elaborada do mundo. O conceito de terroir como expressão única de solo, clima e mão humana foi aqui desenvolvido ao longo de séculos.',
      climate: { temp: 82, rain: 60, sun: 70, wind: 40 },
      producers: [
        { name: 'Domaine de la Romanée-Conti', tier: 'Grand Cru' },
        { name: 'Domaine Leroy', tier: 'Grand Cru' },
        { name: 'Domaine Rousseau', tier: 'Grand Cru' },
        { name: 'Coche-Dury', tier: 'Premier Cru' },
        { name: 'Leflaive', tier: 'Premier Cru' },
      ],
      vintages: [
        { year: '2023', score: 94, color: '#c9a84c' },
        { year: '2022', score: 97, color: '#e2c876' },
        { year: '2021', score: 90, color: '#a08838' },
        { year: '2020', score: 96, color: '#c9a84c' },
        { year: '2019', score: 95, color: '#c9a84c' },
        { year: '2018', score: 92, color: '#b09040' },
        { year: '2017', score: 89, color: '#8a7235' },
      ],
      bgGradient: 'linear-gradient(135deg, #2c1810 0%, #4a2020 40%, #1a0a0a 100%)',
      terroir: 'Solos de calcário e argila sobre embasamento de marl jurássico. A variação altitudinal entre 200m e 450m cria microclimas distintos para cada parcela. O Côte d\'Or ("encosta de ouro") é dividido em Côte de Nuits ao norte e Côte de Beaune ao sul.',
      soilTypes: ['Calcário', 'Argila', 'Marl', 'Granito'],
      climateType: 'Continental moderado',
    },
    {
      id: 'bordeaux', name: 'Bordeaux', country: 'França', countryFull: 'França · Nouvelle-Aquitaine',
      flag: '🇫🇷', tab: 'france',
      x: 0.46, y: 0.385,
      color: '#c44060', radius: 22, intensity: 1.0,
      stats: [
        { val: '120,000 ha', lbl: 'Área' },
        { val: '60', lbl: 'Appellations' },
        { val: '7,000+', lbl: 'Châteaux' },
      ],
      grapes: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc', 'Sémillon', 'Sauvignon Blanc'],
      primaryGrape: 'Cabernet Sauvignon',
      overview: 'Bordeaux é a maior região de vinho fino do mundo. As margens esquerda e direita do Gironde e Dordogne definem dois estilos radicalmente distintos: Cabernet-dominant no Médoc e Saint-Émilion, e Merlot-dominant em Pomerol. O sistema de classificação de 1855 ainda dita o mercado global.',
      climate: { temp: 78, rain: 70, sun: 65, wind: 55 },
      producers: [
        { name: 'Pétrus', tier: 'Ícone' },
        { name: 'Château Margaux', tier: '1er Grand Cru' },
        { name: 'Château Latour', tier: '1er Grand Cru' },
        { name: 'Château Mouton Rothschild', tier: '1er Grand Cru' },
        { name: 'Le Pin', tier: 'Ícone' },
      ],
      vintages: [
        { year: '2022', score: 99, color: '#e2c876' },
        { year: '2021', score: 91, color: '#a08838' },
        { year: '2020', score: 100, color: '#c9a84c' },
        { year: '2019', score: 98, color: '#c9a84c' },
        { year: '2018', score: 96, color: '#c9a84c' },
        { year: '2017', score: 90, color: '#8a7235' },
        { year: '2016', score: 99, color: '#e2c876' },
      ],
      bgGradient: 'linear-gradient(135deg, #0d1f2d 0%, #1a3a4a 50%, #0a1520 100%)',
      terroir: 'Solos de cascalho sobre argila e calcário. A proximidade do Atlântico e os rios Garonne, Dordogne e Gironde moderam o clima. O drenagem de cascalho no Médoc é essencial para o estresse hídrico controlado da videira.',
      soilTypes: ['Cascalho', 'Argila calcária', 'Areia', 'Argila azul'],
      climateType: 'Oceânico',
    },
    {
      id: 'rioja', name: 'Rioja', country: 'Espanha', countryFull: 'Espanha · La Rioja',
      flag: '🇪🇸', tab: 'spain',
      x: 0.455, y: 0.415,
      color: '#e08030', radius: 16, intensity: 0.85,
      stats: [
        { val: '65,000 ha', lbl: 'Área' },
        { val: 'DOCa', lbl: 'Classificação' },
        { val: '600+', lbl: 'Adegas' },
      ],
      grapes: ['Tempranillo', 'Garnacha', 'Graciano', 'Mazuelo'],
      primaryGrape: 'Tempranillo',
      overview: 'A Rioja é a região vinícola mais famosa da Espanha, com status DOCa (Denominação de Origem Qualificada). Três sub-zonas — Rioja Alta, Rioja Alavesa e Rioja Oriental — produzem vinhos de perfis distintos. O envelhecimento em carvalho (Crianza, Reserva, Gran Reserva) é parte essencial da identidade.',
      climate: { temp: 75, rain: 45, sun: 85, wind: 35 },
      producers: [
        { name: 'Vega-Sicilia (Alión)', tier: 'Ícone' },
        { name: 'López de Heredia', tier: 'Clássico' },
        { name: 'La Rioja Alta', tier: 'Premium' },
        { name: 'Muga', tier: 'Premium' },
        { name: 'CVNE', tier: 'Premium' },
      ],
      vintages: [
        { year: '2020', score: 95, color: '#c9a84c' },
        { year: '2019', score: 93, color: '#b09040' },
        { year: '2018', score: 96, color: '#e2c876' },
        { year: '2017', score: 88, color: '#8a7235' },
        { year: '2016', score: 97, color: '#e2c876' },
        { year: '2015', score: 95, color: '#c9a84c' },
        { year: '2014', score: 91, color: '#a08838' },
      ],
      bgGradient: 'linear-gradient(135deg, #2d1a08 0%, #4a2e10 40%, #1a1008 100%)',
      terroir: 'Solos de argila ferruginosa, calcário e aluvião. A cadeia montanhosa da Sierra de Cantabria protege contra os ventos atlânticos. A altitude varia de 300m a 700m, criando verões quentes e secos com noites frescas ideais para a maturação do Tempranillo.',
      soilTypes: ['Argila ferruginosa', 'Calcário', 'Aluvião', 'Seixos'],
      climateType: 'Continental com influência atlântica',
    },
    {
      id: 'tuscany', name: 'Toscana', country: 'Itália', countryFull: 'Itália · Toscana',
      flag: '🇮🇹', tab: 'italy',
      x: 0.527, y: 0.435,
      color: '#d4804a', radius: 20, intensity: 0.9,
      stats: [
        { val: '63,000 ha', lbl: 'Área' },
        { val: '41', lbl: 'DOC/DOCG' },
        { val: '3,000+', lbl: 'Produtores' },
      ],
      grapes: ['Sangiovese', 'Cabernet Sauvignon', 'Merlot', 'Vermentino'],
      primaryGrape: 'Sangiovese',
      overview: 'A Toscana é o coração da viticultura italiana, lar do Chianti Classico, Brunello di Montalcino e Bolgheri. O Sangiovese, sob seus muitos clones, expressa desde frescos Chianti de village até majestosos Brunello com décadas de guarda. Os Super Toscanos revolucionaram o mundo do vinho nos anos 1970.',
      climate: { temp: 80, rain: 50, sun: 88, wind: 30 },
      producers: [
        { name: 'Sassicaia', tier: 'DOC · Ícone' },
        { name: 'Ornellaia', tier: 'DOC · Ícone' },
        { name: 'Biondi Santi', tier: 'DOCG · Clássico' },
        { name: 'Antinori', tier: 'DOCG · Histórico' },
        { name: 'Gaja (Ca\' Marcanda)', tier: 'DOC · Premium' },
      ],
      vintages: [
        { year: '2021', score: 97, color: '#e2c876' },
        { year: '2020', score: 93, color: '#b09040' },
        { year: '2019', score: 95, color: '#c9a84c' },
        { year: '2018', score: 96, color: '#e2c876' },
        { year: '2017', score: 91, color: '#a08838' },
        { year: '2016', score: 99, color: '#e2c876' },
        { year: '2015', score: 97, color: '#e2c876' },
      ],
      bgGradient: 'linear-gradient(135deg, #1a1200 0%, #3a2800 40%, #1a1000 100%)',
      terroir: 'Solos de galestro (xisto calcário) e argila no Chianti Classico. Os solos de Montalcino são mais ricos em argila azul (brunello). A altitude varia de 150m a 600m, com encostas que orientam as vinhas para a exposição solar ideal.',
      soilTypes: ['Galestro', 'Alberese', 'Argila azul', 'Calcário'],
      climateType: 'Mediterrâneo com variações continentais',
    },
    {
      id: 'piedmont', name: 'Piemonte', country: 'Itália', countryFull: 'Itália · Piemonte',
      flag: '🇮🇹', tab: 'italy',
      x: 0.513, y: 0.398,
      color: '#9b5a8c', radius: 17, intensity: 0.88,
      stats: [
        { val: '44,000 ha', lbl: 'Área' },
        { val: '58', lbl: 'DOC/DOCG' },
        { val: '2,500+', lbl: 'Produtores' },
      ],
      grapes: ['Nebbiolo', 'Barbera', 'Dolcetto', 'Moscato'],
      primaryGrape: 'Nebbiolo',
      overview: 'O Piemonte é a Borgonha italiana. O Nebbiolo produz Barolo e Barbaresco, dois dos maiores vinhos do mundo. A Langhe e o Monferrato são o epicentro de uma viticultura de altíssima resolução, onde cada comunal tem perfil distinto. A trufa branca de Alba eleva o terroir além da uva.',
      climate: { temp: 72, rain: 65, sun: 68, wind: 45 },
      producers: [
        { name: 'Giacomo Conterno', tier: 'DOCG · Ícone' },
        { name: 'Bruno Giacosa', tier: 'DOCG · Ícone' },
        { name: 'Gaja', tier: 'DOCG · Ícone' },
        { name: 'Bartolo Mascarello', tier: 'DOCG · Clássico' },
        { name: 'Giuseppe Rinaldi', tier: 'DOCG · Clássico' },
      ],
      vintages: [
        { year: '2022', score: 94, color: '#c9a84c' },
        { year: '2021', score: 92, color: '#b09040' },
        { year: '2020', score: 96, color: '#e2c876' },
        { year: '2019', score: 97, color: '#e2c876' },
        { year: '2018', score: 91, color: '#a08838' },
        { year: '2017', score: 93, color: '#b09040' },
        { year: '2016', score: 100, color: '#e2c876' },
      ],
      bgGradient: 'linear-gradient(135deg, #150820 0%, #2a1040 40%, #100818 100%)',
      terroir: 'Solos de margas tufáceas (Tortonian) e calcário de Helvetian. A diferença de solos entre Serralunga d\'Alba (mais calcário) e La Morra (mais argiloso) define dois estilos opostos de Barolo. As colinas Langhe atingem 400-500m de altitude.',
      soilTypes: ['Margas tufáceas', 'Calcário helvetiano', 'Argila', 'Arenito'],
      climateType: 'Continental com névoa outonal (nebbia)',
    },
    {
      id: 'champagne', name: 'Champagne', country: 'França', countryFull: 'França · Grand Est',
      flag: '🇫🇷', tab: 'france',
      x: 0.493, y: 0.30,
      color: '#d4c878', radius: 15, intensity: 0.8,
      stats: [
        { val: '34,000 ha', lbl: 'Área' },
        { val: '320+', lbl: 'Maisons' },
        { val: '5 bi', lbl: 'Garrafas/ano' },
      ],
      grapes: ['Chardonnay', 'Pinot Noir', 'Pinot Meunier'],
      primaryGrape: 'Chardonnay / Pinot Noir',
      overview: 'A Champagne é a única região com denominação exclusiva para espumantes pelo método tradicional. A combinação única de solos cretáceos, clima frio e a arte do assemblage criou o produto de luxo mais icônico do mundo. A distinção entre Grandes Maisons e Récoltants-Manipulants define dois universos estilísticos.',
      climate: { temp: 60, rain: 72, sun: 55, wind: 60 },
      producers: [
        { name: 'Krug', tier: 'Grande Maison' },
        { name: 'Salon', tier: 'Ícone' },
        { name: 'Selosse', tier: 'RM · Artisan' },
        { name: 'Dom Pérignon', tier: 'Prestige Cuvée' },
        { name: 'Bollinger', tier: 'Grande Maison' },
      ],
      vintages: [
        { year: '2019', score: 96, color: '#e2c876' },
        { year: '2018', score: 94, color: '#c9a84c' },
        { year: '2015', score: 97, color: '#e2c876' },
        { year: '2013', score: 93, color: '#b09040' },
        { year: '2012', score: 98, color: '#e2c876' },
        { year: '2008', score: 100, color: '#e2c876' },
        { year: '2002', score: 100, color: '#e2c876' },
      ],
      bgGradient: 'linear-gradient(135deg, #1a1a0d 0%, #3a3510 40%, #12120a 100%)',
      terroir: 'Solo de creta branca do Cretáceo Superior (Belemnita). Esta creta porosa drena bem, retém calor e reflete luz, criando condições ideais para acidez elevada nas uvas. As zonas de Montagne de Reims, Côte des Blancs e Vallée de la Marne têm perfis distintos.',
      soilTypes: ['Creta branca', 'Silex', 'Argila', 'Calcário'],
      climateType: 'Continental frio com influências oceânicas',
    },
    {
      id: 'rhone', name: 'Rhône', country: 'França', countryFull: 'França · Auvergne-Rhône-Alpes',
      flag: '🇫🇷', tab: 'france',
      x: 0.487, y: 0.38,
      color: '#b04040', radius: 14, intensity: 0.75,
      stats: [
        { val: '73,000 ha', lbl: 'Área' },
        { val: '22', lbl: 'Appellations' },
        { val: '3,000+', lbl: 'Produtores' },
      ],
      grapes: ['Syrah', 'Grenache', 'Mourvèdre', 'Viognier', 'Marsanne'],
      primaryGrape: 'Syrah (Norte) / Grenache (Sul)',
      overview: 'O vale do Ródano produz vinhos de poder e especiaria únicos. No norte, a Syrah domina em Hermitage, Côte-Rôtie e Cornas, em solos de granito e xisto. No sul, blends de Grenache definem Châteauneuf-du-Pape. O Viognier de Condrieu é o branco aromático de referência mundial.',
      climate: { temp: 82, rain: 48, sun: 90, wind: 75 },
      producers: [
        { name: 'Chapoutier', tier: 'Norte/Sul' },
        { name: 'Guigal', tier: 'Norte · Ícone' },
        { name: 'Château Rayas', tier: 'CdP · Ícone' },
        { name: 'Chave', tier: 'Hermitage' },
        { name: 'Clape', tier: 'Cornas' },
      ],
      vintages: [
        { year: '2022', score: 98, color: '#e2c876' },
        { year: '2021', score: 90, color: '#a08838' },
        { year: '2020', score: 97, color: '#e2c876' },
        { year: '2019', score: 95, color: '#c9a84c' },
        { year: '2017', score: 96, color: '#e2c876' },
        { year: '2015', score: 97, color: '#e2c876' },
        { year: '2010', score: 100, color: '#e2c876' },
      ],
      bgGradient: 'linear-gradient(135deg, #1f0808 0%, #3a1010 40%, #180606 100%)',
      terroir: 'Granito e xisto no norte (Côte-Rôtie, Hermitage). Areia, calcário e "galets roulés" (seixos rolados) no sul. O Mistral, vento seco do norte, é elemento climático fundamental — seca as uvas e controla doenças fúngicas.',
      soilTypes: ['Granito', 'Xisto', 'Seixos rolados', 'Areia calcária'],
      climateType: 'Mediterrâneo com Mistral',
    },
    {
      id: 'douro', name: 'Douro', country: 'Portugal', countryFull: 'Portugal · Norte',
      flag: '🇵🇹', tab: 'other',
      x: 0.44, y: 0.43,
      color: '#c07040', radius: 14, intensity: 0.78,
      stats: [
        { val: '44,000 ha', lbl: 'Área' },
        { val: 'DOC', lbl: 'Classificação' },
        { val: '1,300+', lbl: 'Quintas' },
      ],
      grapes: ['Touriga Nacional', 'Touriga Franca', 'Tinta Roriz', 'Tinto Cão'],
      primaryGrape: 'Touriga Nacional',
      overview: 'O Douro, em Portugal, é o berço do Vinho do Porto, mas também produz vinhos de mesa secos de enorme qualidade. As encostas xistosas e o calor extremo do interior criam vinhos de grande concentração. O Douro Superior é a fronteira do vinho seco premium.',
      climate: { temp: 90, rain: 35, sun: 92, wind: 20 },
      producers: [
        { name: 'Prats & Symington', tier: 'Premium' },
        { name: 'Quinta do Vale Meão', tier: 'Ícone' },
        { name: 'Niepoort', tier: 'Artisan' },
        { name: 'Ramos Pinto', tier: 'Clássico' },
        { name: 'Quinta do Crasto', tier: 'Premium' },
      ],
      vintages: [
        { year: '2022', score: 95, color: '#c9a84c' },
        { year: '2021', score: 92, color: '#b09040' },
        { year: '2020', score: 97, color: '#e2c876' },
        { year: '2019', score: 96, color: '#e2c876' },
        { year: '2017', score: 95, color: '#c9a84c' },
        { year: '2016', score: 93, color: '#b09040' },
        { year: '2011', score: 98, color: '#e2c876' },
      ],
      bgGradient: 'linear-gradient(135deg, #201008 0%, #3a1e10 40%, #180c06 100%)',
      terroir: 'Xisto pré-câmbrico das formações Filito-quartzíticas e Silúricas. O calor extremo do verão (>40°C) combinado com a ausência de chuva após maio cria um stress hídrico que concentra aromas e taninos. Os socalcos tradicionais dão lugar às vinha ao alto modernamente.',
      soilTypes: ['Xisto', 'Quartzo', 'Granito (norte)', 'Argila'],
      climateType: 'Mediterrâneo continental extremo',
    },
    {
      id: 'napa', name: 'Napa Valley', country: 'EUA', countryFull: 'EUA · Califórnia',
      flag: '🇺🇸', tab: 'other',
      x: 0.16, y: 0.42,
      color: '#6a8c4a', radius: 14, intensity: 0.75,
      stats: [
        { val: '17,000 ha', lbl: 'Área' },
        { val: '16', lbl: 'Sub-AVAs' },
        { val: '500+', lbl: 'Wineries' },
      ],
      grapes: ['Cabernet Sauvignon', 'Chardonnay', 'Merlot', 'Zinfandel'],
      primaryGrape: 'Cabernet Sauvignon',
      overview: 'Napa Valley é o coração da viticultura americana premium. O Julgamento de Paris de 1976, onde vinhos de Napa superaram Bordeaux e Borgonha, catapultou a região ao cenário mundial. Os vinhos de Cabernet Sauvignon de Stags Leap, Rutherford e Oakville são benchmarks internacionais.',
      climate: { temp: 85, rain: 30, sun: 95, wind: 40 },
      producers: [
        { name: 'Screaming Eagle', tier: 'Cult Wine' },
        { name: 'Harlan Estate', tier: 'Cult Wine' },
        { name: 'Opus One', tier: 'Ícone' },
        { name: 'Caymus', tier: 'Premium' },
        { name: 'Far Niente', tier: 'Premium' },
      ],
      vintages: [
        { year: '2022', score: 93, color: '#b09040' },
        { year: '2021', score: 96, color: '#e2c876' },
        { year: '2019', score: 95, color: '#c9a84c' },
        { year: '2018', score: 92, color: '#b09040' },
        { year: '2016', score: 97, color: '#e2c876' },
        { year: '2013', score: 98, color: '#e2c876' },
        { year: '2012', score: 96, color: '#e2c876' },
      ],
      bgGradient: 'linear-gradient(135deg, #0d1f0d 0%, #1a3810 40%, #0a1508 100%)',
      terroir: 'Solos aluviais, vulcânicos e argila Napa Valley. A brisa marinha de São Francisco e o "Fog Belt" refrescam as noites mesmo em verões quentes. A variação de elevação de 0m (floor) a 800m (Howell Mountain) cria dezenas de microterroirs.',
      soilTypes: ['Aluvião', 'Vulcânico', 'Argila', 'Francisquense'],
      climateType: 'Mediterrâneo Califórnia',
    },
    {
      id: 'mosel', name: 'Mosel', country: 'Alemanha', countryFull: 'Alemanha · Renânia-Palatinado',
      flag: '🇩🇪', tab: 'other',
      x: 0.502, y: 0.285,
      color: '#78a8d4', radius: 12, intensity: 0.65,
      stats: [
        { val: '9,000 ha', lbl: 'Área' },
        { val: 'Anbaugebiet', lbl: 'Classificação' },
        { val: '2,000+', lbl: 'Viticultores' },
      ],
      grapes: ['Riesling', 'Müller-Thurgau', 'Elbling'],
      primaryGrape: 'Riesling',
      overview: 'O Mosel produz os Rieslings mais finos do mundo — finos, elétricos, de acidez singular e longevidade extraordinária. As encostas de ardósia azul (Devonian slate) às margens dos rios Mosel, Saar e Ruwer concentram calor solar que permite maturação em um dos climas mais frios da viticultura europeia.',
      climate: { temp: 58, rain: 68, sun: 52, wind: 42 },
      producers: [
        { name: 'Egon Müller', tier: 'Grand Cru · Ícone' },
        { name: 'J.J. Prüm', tier: 'Prädikatsweingut' },
        { name: 'Willi Schaefer', tier: 'Prädikatsweingut' },
        { name: 'Fritz Haag', tier: 'VDP.Grosse Lage' },
        { name: 'Selbach-Oster', tier: 'Premium' },
      ],
      vintages: [
        { year: '2022', score: 95, color: '#c9a84c' },
        { year: '2021', score: 97, color: '#e2c876' },
        { year: '2019', score: 94, color: '#c9a84c' },
        { year: '2017', score: 96, color: '#e2c876' },
        { year: '2015', score: 93, color: '#b09040' },
        { year: '2011', score: 97, color: '#e2c876' },
        { year: '2003', score: 90, color: '#a08838' },
      ],
      bgGradient: 'linear-gradient(135deg, #0a1520 0%, #152535 40%, #080f18 100%)',
      terroir: 'Ardósia azul devoniana (Blauschiefer) — a rocha mais característica do Mosel. Esta ardósia absorve calor durante o dia e o libera à noite, criando termofilia que compensa o frio. As encostas íngremes (até 70° de inclinação) são trabalho manual obrigatório.',
      soilTypes: ['Ardósia azul', 'Ardósia vermelha', 'Quartzo', 'Devon'],
      climateType: 'Continental frio à margem de viabilidade',
    },
  ];

  /* ════════════════════════════════════════
     CANVAS ENGINE
  ════════════════════════════════════════ */
  const canvas    = qs('#atlas-canvas');
  const mapWrap   = qs('#atlas-map-wrap');
  const tooltip   = qs('#atlas-tooltip');
  const ttRegion  = qs('#tt-region');
  const ttCountry = qs('#tt-country');
  const coordLat  = qs('#coords-lat');
  const coordLng  = qs('#coords-lng');
  const app       = qs('#atlas-app');

  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Viewport state
  let state = {
    offsetX: 0, offsetY: 0,
    scale: 1,
    minScale: 0.5, maxScale: 8,
    isDragging: false,
    lastMouseX: 0, lastMouseY: 0,
    width: 0, height: 0,
    satellite: false,
    activeLayers: { regions: true, climate: true, soil: false, elevation: false, grapes: false },
  };

  let activeRegion = null;
  let hoveredRegion = null;

  function resize() {
    state.width  = canvas.width  = mapWrap.clientWidth;
    state.height = canvas.height = mapWrap.clientHeight;
    draw();
  }

  // World-to-canvas projection (simplified Mercator)
  function project(nx, ny) {
    return {
      x: nx * state.width  * state.scale + state.offsetX,
      y: ny * state.height * state.scale + state.offsetY,
    };
  }

  function unproject(cx, cy) {
    return {
      nx: (cx - state.offsetX) / (state.width  * state.scale),
      ny: (cy - state.offsetY) / (state.height * state.scale),
    };
  }

  /* ── Draw land masses (simplified polygons) ── */
  function drawLand() {
    if (state.satellite) {
      // Satellite-style dark earth
      ctx.fillStyle = '#0d1520';
      ctx.fillRect(0, 0, state.width, state.height);

      // Ocean texture
      const oceanGrad = ctx.createRadialGradient(state.width/2, state.height/2, 0, state.width/2, state.height/2, state.width);
      oceanGrad.addColorStop(0, '#0a1428');
      oceanGrad.addColorStop(1, '#060d18');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, state.width, state.height);
    } else {
      // Classic map style
      const bgGrad = ctx.createLinearGradient(0, 0, 0, state.height);
      bgGrad.addColorStop(0, '#080d14');
      bgGrad.addColorStop(1, '#050810');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, state.width, state.height);
    }

    // Grid lines (latitude/longitude simulation)
    if (state.scale > 1.2) {
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 20; i++) {
        const nx = i / 20;
        const p1 = project(nx, 0), p2 = project(nx, 1);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
      for (let i = 0; i <= 12; i++) {
        const ny = i / 12;
        const p1 = project(0, ny), p2 = project(1, ny);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
    }

    // Continents (simplified shapes)
    const continents = [
      // Europe
      { path: [[0.43,0.20],[0.65,0.18],[0.72,0.25],[0.68,0.35],[0.60,0.42],[0.55,0.50],[0.50,0.48],[0.44,0.50],[0.40,0.44],[0.38,0.35],[0.40,0.26]], color: state.satellite ? '#1a2210' : '#0e1a0a' },
      // Africa
      { path: [[0.48,0.52],[0.60,0.50],[0.64,0.60],[0.60,0.72],[0.52,0.78],[0.45,0.72],[0.42,0.62]], color: state.satellite ? '#1a1610' : '#0e1208' },
      // Americas (simplified)
      { path: [[0.12,0.18],[0.25,0.16],[0.30,0.28],[0.28,0.40],[0.22,0.50],[0.18,0.58],[0.14,0.70],[0.10,0.58],[0.08,0.42],[0.10,0.28]], color: state.satellite ? '#0e1a12' : '#0a1208' },
      // Asia
      { path: [[0.60,0.18],[0.85,0.15],[0.92,0.25],[0.90,0.38],[0.82,0.45],[0.72,0.48],[0.65,0.42],[0.62,0.35],[0.58,0.28]], color: state.satellite ? '#1a1a10' : '#0e1208' },
    ];

    continents.forEach(({ path, color }) => {
      ctx.beginPath();
      const first = project(path[0][0], path[0][1]);
      ctx.moveTo(first.x, first.y);
      path.slice(1).forEach(([nx, ny]) => {
        const pt = project(nx, ny);
        ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Coastline
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });
  }

  function drawClimateLayer() {
    if (!state.activeLayers.climate) return;
    // Climate zones as colored halos
    const zones = [
      { nx: 0.485, ny: 0.33, r: 0.12, color: 'rgba(74,144,201,0.06)' },  // Atlantic
      { nx: 0.52, ny: 0.44, r: 0.10, color: 'rgba(220,120,50,0.06)' },   // Mediterranean
      { nx: 0.16, ny: 0.42, r: 0.06, color: 'rgba(100,200,100,0.05)' },  // Pacific
    ];

    zones.forEach(({ nx, ny, r, color }) => {
      const pt = project(nx, ny);
      const radius = r * state.width * state.scale;
      const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });
  }

  function drawRegions() {
    REGIONS.forEach((region) => {
      const pt = project(region.x, region.y);
      const r  = region.radius * state.scale * 0.8;
      const isActive  = activeRegion?.id === region.id;
      const isHovered = hoveredRegion?.id === region.id;

      // Glow
      if (isActive || isHovered) {
        const glowR = r * 3;
        const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowR);
        glow.addColorStop(0, region.color + '40');
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Outer ring
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r * 1.6, 0, Math.PI * 2);
      ctx.strokeStyle = region.color + (isActive ? '60' : '20');
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = region.color + (isActive || isHovered ? 'ff' : 'cc');
      ctx.fill();

      // Pulse ring animation
      if (isActive) {
        const pulseR = r * (1.8 + Math.sin(Date.now() * 0.003) * 0.4);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = region.color + '40';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Label (show when zoomed in enough or active/hovered)
      if (state.scale > 1.2 || isActive || isHovered) {
        const labelY = pt.y - r * 1.8 - 4;
        ctx.font = `${Math.min(11, 8 * state.scale)}px "DM Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = isActive ? region.color : 'rgba(244,240,232,0.7)';
        ctx.fillText(region.name, pt.x, labelY);
      }
    });
  }

  let animFrame;
  function draw() {
    ctx.clearRect(0, 0, state.width, state.height);
    drawLand();
    drawClimateLayer();
    drawRegions();
    animFrame = requestAnimationFrame(draw);
  }

  /* ── Hit testing ─────────────────── */
  function getRegionAtPoint(mx, my) {
    return REGIONS.find((region) => {
      const pt = project(region.x, region.y);
      const r  = region.radius * state.scale * 0.8 * 1.8;
      const dx = mx - pt.x, dy = my - pt.y;
      return Math.sqrt(dx*dx + dy*dy) < r;
    }) || null;
  }

  /* ── Pan ─────────────────────────── */
  function onMouseDown(e) {
    state.isDragging = true;
    state.lastMouseX = e.clientX;
    state.lastMouseY = e.clientY;
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Update coords
    const np = unproject(mx, my);
    const lat = (90  - np.ny * 180).toFixed(2);
    const lng = (np.nx * 360 - 180).toFixed(2);
    if (coordLat) coordLat.textContent = `${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'}`;
    if (coordLng) coordLng.textContent = `${Math.abs(lng)}°${lng >= 0 ? 'E' : 'W'}`;

    // Hover detection
    const found = getRegionAtPoint(mx, my);
    hoveredRegion = found;
    canvas.style.cursor = found ? 'pointer' : (state.isDragging ? 'grabbing' : 'grab');

    if (found && tooltip) {
      tooltip.style.left = `${mx}px`;
      tooltip.style.top  = `${my}px`;
      ttRegion.textContent  = found.name;
      ttCountry.textContent = found.country;
      tooltip.classList.add('visible');
    } else {
      tooltip?.classList.remove('visible');
    }

    if (!state.isDragging) return;
    const dx = e.clientX - state.lastMouseX;
    const dy = e.clientY - state.lastMouseY;
    state.offsetX += dx;
    state.offsetY += dy;
    state.lastMouseX = e.clientX;
    state.lastMouseY = e.clientY;
  }

  function onMouseUp(e) {
    if (!state.isDragging) return;
    state.isDragging = false;
    // Check if it was a click (not a drag)
    const dx = Math.abs(e.clientX - state.lastMouseX);
    const dy = Math.abs(e.clientY - state.lastMouseY);
    if (dx < 4 && dy < 4) {
      const rect = canvas.getBoundingClientRect();
      const region = getRegionAtPoint(e.clientX - rect.left, e.clientY - rect.top);
      if (region) openDetail(region);
    }
  }

  /* ── Zoom ─────────────────────────── */
  function zoom(delta, cx, cy) {
    const factor = delta > 0 ? 1.15 : 0.87;
    const newScale = Math.max(state.minScale, Math.min(state.maxScale, state.scale * factor));
    const ratio = newScale / state.scale;
    state.offsetX = cx - (cx - state.offsetX) * ratio;
    state.offsetY = cy - (cy - state.offsetY) * ratio;
    state.scale = newScale;
  }

  function onWheel(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    zoom(-e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
  }

  /* ── Touch ─────────────────────────── */
  let lastTouchDist = 0;

  function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }

  function onTouchStart(e) {
    if (e.touches.length === 2) lastTouchDist = getTouchDist(e.touches);
    else {
      state.isDragging = true;
      state.lastMouseX = e.touches[0].clientX;
      state.lastMouseY = e.touches[0].clientY;
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dist = getTouchDist(e.touches);
      const delta = dist - lastTouchDist;
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      zoom(delta, cx, cy);
      lastTouchDist = dist;
    } else if (state.isDragging) {
      const dx = e.touches[0].clientX - state.lastMouseX;
      const dy = e.touches[0].clientY - state.lastMouseY;
      state.offsetX += dx;
      state.offsetY += dy;
      state.lastMouseX = e.touches[0].clientX;
      state.lastMouseY = e.touches[0].clientY;
    }
  }

  function onTouchEnd() { state.isDragging = false; }

  // Bind events
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', () => {
    state.isDragging = false;
    tooltip?.classList.remove('visible');
  });
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);

  /* ── Controls ─────────────────────── */
  const cx = () => state.width / 2;
  const cy = () => state.height / 2;

  qs('#ctrl-zoom-in')?.addEventListener('click', () => zoom(-100, cx(), cy()));
  qs('#ctrl-zoom-out')?.addEventListener('click', () => zoom(100, cx(), cy()));
  qs('#ctrl-reset')?.addEventListener('click', () => {
    state.scale = 1; state.offsetX = 0; state.offsetY = 0;
  });
  qs('#ctrl-satellite')?.addEventListener('click', function() {
    state.satellite = !state.satellite;
    this.classList.toggle('active', state.satellite);
  });

  /* ── Layer toggles ───────────────── */
  qsa('[data-layer]').forEach((cb) => {
    cb.addEventListener('change', () => {
      state.activeLayers[cb.dataset.layer] = cb.checked;
    });
  });

  /* ════════════════════════════════════════
     REGION LIST (Sidebar)
  ════════════════════════════════════════ */
  const regionList = qs('#atlas-region-list');
  let activeTab = 'all';

  function renderRegionList(filter = 'all', search = '') {
    if (!regionList) return;
    const filtered = REGIONS.filter((r) => {
      const matchTab = filter === 'all' || r.tab === filter;
      const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
                          r.country.toLowerCase().includes(search.toLowerCase()) ||
                          r.grapes.some(g => g.toLowerCase().includes(search.toLowerCase()));
      return matchTab && matchSearch;
    });

    regionList.innerHTML = filtered.map((r) => `
      <div class="atlas-region-entry ${activeRegion?.id === r.id ? 'active' : ''}" data-id="${r.id}">
        <div class="atlas-region-entry__color" style="background:${r.color}"></div>
        <div class="atlas-region-entry__info">
          <span class="atlas-region-entry__name">${r.name}</span>
          <span class="atlas-region-entry__sub">${r.country} · ${r.primaryGrape}</span>
        </div>
        <span class="atlas-region-entry__badge">${r.stats[0].val}</span>
      </div>
    `).join('');

    regionList.querySelectorAll('.atlas-region-entry').forEach((el) => {
      el.addEventListener('click', () => {
        const region = REGIONS.find(r => r.id === el.dataset.id);
        if (region) {
          flyTo(region);
          openDetail(region);
        }
      });
    });
  }

  qsa('.atlas-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      qsa('.atlas-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      renderRegionList(activeTab);
    });
  });

  const searchInput = qs('#atlas-search-input');
  searchInput?.addEventListener('input', debounce(() => {
    renderRegionList(activeTab, searchInput.value);
  }, 200));

  /* ── Fly to region ───────────────── */
  function flyTo(region) {
    const targetOffX = state.width  * 0.5 - region.x * state.width  * 2;
    const targetOffY = state.height * 0.5 - region.y * state.height * 2;
    const steps = 30;
    let step = 0;
    const startOffX = state.offsetX, startOffY = state.offsetY;
    const startScale = state.scale, targetScale = 2;

    function ease(t) { return 1 - Math.pow(1 - t, 3); }

    function animate() {
      step++;
      const t = ease(step / steps);
      state.offsetX = startOffX + (targetOffX - startOffX) * t;
      state.offsetY = startOffY + (targetOffY - startOffY) * t;
      state.scale   = startScale + (targetScale - startScale) * t;
      if (step < steps) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  /* ════════════════════════════════════════
     DETAIL PANEL
  ════════════════════════════════════════ */
  const detailName    = qs('#detail-name');
  const detailCountry = qs('#detail-country');
  const detailHeroBg  = qs('#detail-hero-bg');
  const detailFlag    = qs('#detail-flag');
  const detailStats   = qs('#detail-stats');
  const detailContent = qs('#detail-tab-content');
  let activeDetailTab = 'overview';

  function openDetail(region) {
    activeRegion = region;
    app?.classList.add('detail-open');

    // Header
    if (detailName)    detailName.textContent    = region.name;
    if (detailCountry) detailCountry.textContent = region.countryFull;
    if (detailFlag)    detailFlag.textContent     = region.flag;
    if (detailHeroBg)  detailHeroBg.style.background = region.bgGradient;

    // Stats
    if (detailStats) {
      detailStats.innerHTML = region.stats.map(s => `
        <div class="detail-stat">
          <span class="detail-stat__val">${s.val}</span>
          <span class="detail-stat__lbl">${s.lbl}</span>
        </div>
      `).join('');
    }

    renderDetailTab(region, activeDetailTab);
    renderRegionList(activeTab);

    // Re-bind detail tabs
    qsa('.detail-tab').forEach((btn) => {
      btn.onclick = () => {
        qsa('.detail-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeDetailTab = btn.dataset.dtab;
        renderDetailTab(region, activeDetailTab);
      };
    });
    // Reset tab active states
    qsa('.detail-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.dtab === activeDetailTab);
    });
  }

  function renderDetailTab(region, tab) {
    if (!detailContent) return;
    let html = '';

    if (tab === 'overview') {
      html = `
        <div class="detail-overview">
          <p>${region.overview}</p>
          <h4>Castas principais</h4>
          <div class="detail-grape-list">
            ${region.grapes.map((g, i) => `
              <span class="detail-grape-tag ${i === 0 ? 'detail-grape-tag--primary' : ''}">${g}</span>
            `).join('')}
          </div>
          <h4>Clima</h4>
          <div class="detail-climate-bars">
            ${[
              { label: 'Temperatura', val: region.climate.temp },
              { label: 'Pluviosidade', val: region.climate.rain },
              { label: 'Insolação', val: region.climate.sun },
              { label: 'Vento', val: region.climate.wind },
            ].map(item => `
              <div class="detail-climate-bar">
                <span class="detail-climate-bar__label">${item.label}</span>
                <div class="detail-climate-bar__track">
                  <div class="detail-climate-bar__fill" style="width:${item.val}%"></div>
                </div>
                <span class="detail-climate-bar__val">${item.val}%</span>
              </div>
            `).join('')}
          </div>
        </div>`;
    } else if (tab === 'terroir') {
      html = `
        <div class="detail-overview">
          <h4>Geologia & Solo</h4>
          <p>${region.terroir}</p>
          <h4>Tipos de solo</h4>
          <div class="detail-grape-list">
            ${region.soilTypes.map(s => `<span class="detail-grape-tag">${s}</span>`).join('')}
          </div>
          <h4>Classificação climática</h4>
          <p>${region.climateType}</p>
        </div>`;
    } else if (tab === 'producers') {
      html = `
        <div class="detail-producers-list">
          ${region.producers.map(p => `
            <div class="detail-producer-item">
              <span class="detail-producer-item__name">${p.name}</span>
              <span class="detail-producer-item__tier">${p.tier}</span>
            </div>
          `).join('')}
        </div>`;
    } else if (tab === 'vintages') {
      const maxScore = 100;
      html = `
        <div class="detail-vintage-chart">
          ${region.vintages.map(v => `
            <div class="detail-vintage-row">
              <span class="detail-vintage-row__year">${v.year}</span>
              <div class="detail-vintage-row__bar-wrap">
                <div class="detail-vintage-row__bar" style="width:${(v.score/maxScore)*100}%; background:${v.color}"></div>
              </div>
              <span class="detail-vintage-row__score">${v.score}</span>
            </div>
          `).join('')}
        </div>`;
    }

    detailContent.innerHTML = html;
  }

  // Close detail
  qs('#detail-close')?.addEventListener('click', () => {
    app?.classList.remove('detail-open');
    activeRegion = null;
    renderRegionList(activeTab);
  });

  /* ════════════════════════════════════════
     INIT
  ════════════════════════════════════════ */
  window.addEventListener('resize', debounce(resize, 150));
  resize();
  renderRegionList('all');

  // Open Borgonha by default after a delay
  setTimeout(() => {
    const defaultRegion = REGIONS.find(r => r.id === 'burgundy');
    if (defaultRegion) openDetail(defaultRegion);
  }, 600);

})();

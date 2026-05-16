/* ─────────────────────────────────────────
   ATLAS — cru.vin
   Interactive map pins & region switching
───────────────────────────────────────── */

(function AtlasModule() {
  const { qs, qsa } = window.CruVin;

  const regionData = {
    'Borgonha': {
      country: 'França',
      hectares: '28,000',
      appellations: '84',
      grape: 'Pinot Noir',
    },
    'Bordeaux': {
      country: 'França',
      hectares: '120,000',
      appellations: '60',
      grape: 'Cabernet Sauv.',
    },
    'Rioja': {
      country: 'Espanha',
      hectares: '65,000',
      appellations: '3',
      grape: 'Tempranillo',
    },
    'Toscana': {
      country: 'Itália',
      hectares: '63,000',
      appellations: '41',
      grape: 'Sangiovese',
    },
    'Piemonte': {
      country: 'Itália',
      hectares: '44,000',
      appellations: '58',
      grape: 'Nebbiolo',
    },
    'Tokaj': {
      country: 'Hungria',
      hectares: '6,000',
      appellations: '27',
      grape: 'Furmint',
    },
  };

  const pins       = qsa('.atlas-pin');
  const regionList = qsa('.atlas-region-item');
  const infoPanel  = qs('#atlas-info');
  const regionName = qs('#atlas-region-name');

  function updateInfoPanel(region) {
    const data = regionData[region];
    if (!data || !infoPanel) return;

    // Update region name
    if (regionName) regionName.textContent = region;

    // Update country
    const countryEl = infoPanel.querySelector('.atlas-info__country');
    if (countryEl) countryEl.textContent = data.country;

    // Update stats
    const statVals = infoPanel.querySelectorAll('.atlas-info__stat-val');
    if (statVals[0]) statVals[0].textContent = data.hectares;
    if (statVals[1]) statVals[1].textContent = data.appellations;
    if (statVals[2]) statVals[2].textContent = data.grape;

    // Animate panel
    infoPanel.style.opacity = '0';
    infoPanel.style.transform = 'translateY(6px)';
    requestAnimationFrame(() => {
      infoPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      infoPanel.style.opacity = '1';
      infoPanel.style.transform = 'translateY(0)';
    });
  }

  function setActiveRegion(regionName) {
    // Update pins
    pins.forEach((pin) => {
      pin.classList.toggle('active', pin.dataset.region === regionName);
    });

    // Update region list
    regionList.forEach((item) => {
      item.classList.toggle('active', item.dataset.region === regionName);
    });

    // Update info panel
    updateInfoPanel(regionName);
  }

  // Pin interactions
  pins.forEach((pin) => {
    pin.addEventListener('click', () => {
      setActiveRegion(pin.dataset.region);
    });

    pin.addEventListener('mouseenter', () => {
      setActiveRegion(pin.dataset.region);
    });
  });

  // Region list interactions
  regionList.forEach((item) => {
    item.addEventListener('click', () => {
      setActiveRegion(item.dataset.region);
    });
  });

  // Auto-cycle through regions
  let currentIndex = 0;
  let autoCycle;

  function startAutoCycle() {
    autoCycle = setInterval(() => {
      const regions = Object.keys(regionData);
      currentIndex = (currentIndex + 1) % regions.length;
      setActiveRegion(regions[currentIndex]);
    }, 4000);
  }

  function stopAutoCycle() {
    clearInterval(autoCycle);
  }

  // Stop auto-cycle on user interaction
  const atlasSection = qs('#atlas');
  if (atlasSection) {
    atlasSection.addEventListener('mouseenter', stopAutoCycle);
    atlasSection.addEventListener('mouseleave', startAutoCycle);
  }

  // Initialize
  updateInfoPanel('Borgonha');
  startAutoCycle();

})();

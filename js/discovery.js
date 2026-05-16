/* ─────────────────────────────────────────
   DISCOVERY — cru.vin
   Mood filter + results switching
───────────────────────────────────────── */

(function DiscoveryModule() {
  const { qsa } = window.CruVin;

  const moodButtons = qsa('.mood-btn');
  const resultsContainer = document.getElementById('discovery-results');

  // Wine recommendations per mood
  const moodData = {
    contemplativo: [
      {
        region: 'Rhône · França',
        wine: 'Hermitage Rouge',
        grape: 'Syrah',
        tags: ['Defumado', 'Azeitona preta', 'Mineral'],
        color: 'linear-gradient(160deg, #3d0e1c, #6b1525)',
      },
      {
        region: 'Piemonte · Itália',
        wine: 'Barolo Castiglione',
        grape: 'Nebbiolo',
        tags: ['Alcatrão', 'Rosa seca', 'Trufas'],
        color: 'linear-gradient(160deg, #1a0a2e, #3d1560)',
      },
      {
        region: 'Borgonha · França',
        wine: 'Gevrey-Chambertin 1er Cru',
        grape: 'Pinot Noir',
        tags: ['Cerejas', 'Terra molhada', 'Especiarias'],
        color: 'linear-gradient(160deg, #0d1f2d, #1a3f50)',
      },
    ],
    celebratorio: [
      {
        region: 'Champagne · França',
        wine: 'Blanc de Blancs Vintage',
        grape: 'Chardonnay',
        tags: ['Brioche', 'Limão', 'Mineral'],
        color: 'linear-gradient(160deg, #1a1a0d, #3a3510)',
      },
      {
        region: 'Franciacorta · Itália',
        wine: 'Satèn DOCG',
        grape: 'Chardonnay',
        tags: ['Creme', 'Pêssego', 'Flores brancas'],
        color: 'linear-gradient(160deg, #0d1f1a, #1a4035)',
      },
      {
        region: 'Napa Valley · EUA',
        wine: 'Reserve Cabernet Sauvignon',
        grape: 'Cabernet Sauvignon',
        tags: ['Cassis', 'Cedro', 'Baunilha'],
        color: 'linear-gradient(160deg, #1f0a0d, #3a0e15)',
      },
    ],
    introspectivo: [
      {
        region: 'Jura · França',
        wine: 'Savagnin Ouillé',
        grape: 'Savagnin',
        tags: ['Amendoim', 'Curry', 'Nuez'],
        color: 'linear-gradient(160deg, #1a150d, #3a2e10)',
      },
      {
        region: 'Alsace · França',
        wine: 'Riesling Grand Cru',
        grape: 'Riesling',
        tags: ['Petróleo', 'Lima', 'Pêssego'],
        color: 'linear-gradient(160deg, #0d1a15, #1a3028)',
      },
      {
        region: 'Mosel · Alemanha',
        wine: 'Spätlese Bernkasteler',
        grape: 'Riesling',
        tags: ['Mel', 'Ardósia', 'Damasco'],
        color: 'linear-gradient(160deg, #0a1520, #152535)',
      },
    ],
    aventureiro: [
      {
        region: 'Santorini · Grécia',
        wine: 'Assyrtiko Basket Press',
        grape: 'Assyrtiko',
        tags: ['Salino', 'Cítrico', 'Vulcânico'],
        color: 'linear-gradient(160deg, #0d1a2e, #152a45)',
      },
      {
        region: 'Canárias · Espanha',
        wine: 'Listán Negro Volcánico',
        grape: 'Listán Negro',
        tags: ['Cinzas', 'Morango', 'Iodo'],
        color: 'linear-gradient(160deg, #1a0a0d, #351015)',
      },
      {
        region: 'Georgia · Geórgia',
        wine: 'Rkatsiteli Amber',
        grape: 'Rkatsiteli',
        tags: ['Taninos', 'Laranja', 'Castanhas'],
        color: 'linear-gradient(160deg, #1a1200, #3a2800)',
      },
    ],
    romantico: [
      {
        region: 'Borgonha · França',
        wine: 'Chambolle-Musigny Village',
        grape: 'Pinot Noir',
        tags: ['Rosa', 'Framboesa', 'Seda'],
        color: 'linear-gradient(160deg, #200a1a, #451520)',
      },
      {
        region: 'Toscana · Itália',
        wine: 'Brunello di Montalcino',
        grape: 'Sangiovese Grosso',
        tags: ['Cereja', 'Couro', 'Balsâmico'],
        color: 'linear-gradient(160deg, #200a08, #401510)',
      },
      {
        region: 'Priorat · Espanha',
        wine: 'Clos Mogador',
        grape: 'Garnacha · Syrah',
        tags: ['Chocolate', 'Licoroso', 'Pedra'],
        color: 'linear-gradient(160deg, #150820, #2a1040)',
      },
    ],
    invernal: [
      {
        region: 'Rhône Sul · França',
        wine: 'Châteauneuf-du-Pape',
        grape: 'Grenache blend',
        tags: ['Garrigue', 'Couro', 'Ameixas'],
        color: 'linear-gradient(160deg, #0a0f1a, #151f30)',
      },
      {
        region: 'Piemonte · Itália',
        wine: 'Amarone della Valpolicella',
        grape: 'Corvina blend',
        tags: ['Figos secos', 'Chocolate', 'Defumado'],
        color: 'linear-gradient(160deg, #180808, #300f0f)',
      },
      {
        region: 'Douro · Portugal',
        wine: 'Vintage Port LBV',
        grape: 'Touriga Nacional',
        tags: ['Tâmaras', 'Mel', 'Nozes'],
        color: 'linear-gradient(160deg, #1a0808, #351215)',
      },
    ],
  };

  function renderResults(mood) {
    if (!resultsContainer) return;
    const wines = moodData[mood] || moodData.contemplativo;

    // Fade out
    resultsContainer.style.opacity = '0';
    resultsContainer.style.transform = 'translateY(12px)';

    setTimeout(() => {
      resultsContainer.innerHTML = wines.map((w) => `
        <div class="discovery-result-card">
          <div class="discovery-result-card__color" style="background: ${w.color};"></div>
          <div class="discovery-result-card__body">
            <div class="discovery-result-card__region">${w.region}</div>
            <h4 class="discovery-result-card__wine">${w.wine}</h4>
            <p class="discovery-result-card__grape">${w.grape}</p>
            <div class="discovery-result-card__tags">
              ${w.tags.map((t) => `<span>${t}</span>`).join('')}
            </div>
          </div>
        </div>
      `).join('');

      // Fade in
      resultsContainer.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      resultsContainer.style.opacity = '1';
      resultsContainer.style.transform = 'translateY(0)';
    }, 250);
  }

  // Bind mood buttons
  moodButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      moodButtons.forEach((b) => b.classList.remove('mood-btn--active'));
      btn.classList.add('mood-btn--active');
      renderResults(btn.dataset.mood);
    });
  });

  // Discovery prompt form
  const promptInput = document.querySelector('.discovery-prompt__input');
  const promptBtn   = document.querySelector('.discovery-prompt__btn');

  if (promptBtn) {
    promptBtn.addEventListener('click', () => {
      const query = promptInput?.value.trim();
      if (!query) return;

      // Visual feedback - loading state
      const originalText = promptBtn.innerHTML;
      promptBtn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;"></span>`;
      promptBtn.disabled = true;

      // Simulate AI response delay
      setTimeout(() => {
        promptBtn.innerHTML = originalText;
        promptBtn.disabled = false;

        // Show a random mood's results as "AI recommendation"
        const moods = Object.keys(moodData);
        const random = moods[Math.floor(Math.random() * moods.length)];
        renderResults(random);

        // Clear input
        if (promptInput) promptInput.value = '';
      }, 1500);
    });
  }

  if (promptInput) {
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') promptBtn?.click();
    });
  }

})();

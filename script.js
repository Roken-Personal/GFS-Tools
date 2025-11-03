/* =========================
   Settings Management
========================= */
function initializeSettings(toolModal) {
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings-modal');
    const themeSelect = document.getElementById('theme-select');
    const resetBtn = document.getElementById('reset-settings');
  
    loadSettings();
  
    if (settingsToggle) {
      settingsToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (toolModal) toolModal.style.display = 'none';
        showSimpleSettingsModal();
      });
    }
    if (closeSettings) {
      closeSettings.addEventListener('click', () => (settingsModal.style.display = 'none'));
    }
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
        saveSettings();
        
        // Update simple settings modal if it's open
        const simpleModal = document.getElementById('simple-settings-modal');
        if (simpleModal) {
          const isDark = e.target.value === 'dark' || (e.target.value === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          updateSimpleModalColors(simpleModal, isDark);
        }
      });
    }
    
    // Function to update simple modal colors (used when theme changes externally)
    function updateSimpleModalColors(modalElement, isDarkMode) {
      const content = modalElement.querySelector('div');
      if (!content) return;
      
      const titleColor = isDarkMode ? '#ffffff' : '#1a1a1a';
      const textColor = isDarkMode ? '#ffffff' : '#1a1a1a';
      const textSecondary = isDarkMode ? '#cccccc' : '#333333';
      const labelColor = isDarkMode ? '#cccccc' : '#333333';
      
      // Update Settings title
      const h2 = content.querySelector('h2');
      if (h2) h2.style.color = titleColor;
      
      // Update section headings
      const h3s = content.querySelectorAll('h3');
      h3s.forEach(h3 => h3.style.color = titleColor);
      
      // Update Light/Dark labels
      const spans = content.querySelectorAll('div > span');
      spans.forEach(span => {
        if (span.textContent === 'Light' || span.textContent === 'Dark') {
          span.style.color = labelColor;
        }
      });
      
      // Update description paragraph
      const p = content.querySelector('p');
      if (p) p.style.color = textSecondary;
      
      // Update close button
      const closeBtn = document.getElementById('close-simple-settings');
      if (closeBtn) closeBtn.style.color = textColor;
      
      // Update slider
      const slider = document.getElementById('theme-toggle-slider');
      if (slider) {
        const knob = slider.querySelector('div');
        if (knob) {
          slider.style.background = isDarkMode ? '#333333' : '#ffffff';
          slider.style.borderColor = isDarkMode ? '#555555' : '#000000';
          knob.style.background = isDarkMode ? '#ffffff' : '#000000';
          knob.style.transform = isDarkMode ? 'translateX(30px)' : 'translateX(0)';
        }
      }
      
      // Re-populate tool list with updated colors
      const toolListContainer = document.getElementById('simple-tool-list');
      if (toolListContainer) {
        populateSimpleToolList();
      }
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', resetSettings);
    }
  
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && settingsModal.style.display === 'block') {
        settingsModal.style.display = 'none';
      }
    });
  }
  
  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('gfs-settings') || '{}');
  
    const theme = settings.theme || 'light';
    applyTheme(theme);
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) themeSelect.value = theme;
  
    const toolOrder = settings.toolOrder || ['range-splitting', 'label-preview', 'range-jumping', 'route-mapping', 'formatter', 'sql-search-macro'];
    const toolVisibility = settings.toolVisibility || {
      'range-splitting': true,
      'label-preview': true,
      'range-jumping': true,
      'route-mapping': true,
      'formatter': true,
      'sql-search-macro': true
    };
  
    applyToolOrder(toolOrder);
    applyToolVisibility(toolVisibility);
  }
  
  function saveSettings() {
    const settings = {
      theme: document.getElementById('theme-select')?.value || 'light',
      toolOrder: getCurrentToolOrder(),
      toolVisibility: getCurrentToolVisibility()
    };
    localStorage.setItem('gfs-settings', JSON.stringify(settings));
  }
  
  function applyTheme(theme) {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.body.setAttribute('data-theme', theme);
    }
  }
  
  function resetSettings() {
    localStorage.removeItem('gfs-settings');
    location.reload();
  }
  
  /* =========================
     Tool Management (Settings)
  ========================= */
  function populateToolOrderList() {
    const toolOrderList = document.getElementById('tool-order-list');
    const settings = JSON.parse(localStorage.getItem('gfs-settings') || '{}');
    const toolOrder = settings.toolOrder || ['range-splitting', 'label-preview', 'range-jumping', 'route-mapping', 'formatter', 'sql-search-macro',];
    const toolVisibility = settings.toolVisibility || {
      'range-splitting': true,
      'label-preview': true,
      'range-jumping': true,
      'route-mapping': true,
      'formatter': true,
      'sql-search-macro': true
    };
  
    const toolData = {
      'range-splitting': { name: 'Range Splitting', description: 'Split ranges into smaller segments', icon: 'fas fa-cut' },
      'label-preview': { name: 'Label Preview', description: 'Preview and generate shipping labels', icon: 'fas fa-tag' },
      'range-jumping': { name: 'Range Jumping', description: 'Generate UPDATE scripts for range numbers', icon: 'fas fa-arrow-right' },
      'route-mapping': { name: 'Route Mapping', description: 'Generate SQL INSERT statements for carrier routes', icon: 'fas fa-route' },
      'sql-search-macro': { name: 'SQL Search Macro', description: 'Build WHERE IN list from consignments', icon: 'fas fa-database' },
      'formatter': { name: 'XML & JSON Formatter', description: 'Pretty-print or minify JSON/XML', icon: 'fas fa-code' }
    };
  
    toolOrderList.innerHTML = '';
    toolOrder.forEach((toolId) => {
      const tool = toolData[toolId];
      if (!tool) return;
      const item = document.createElement('div');
      item.className = 'tool-order-item';
      item.draggable = true;
      item.dataset.toolId = toolId;
      item.innerHTML = `
        <div class="drag-handle"><i class="fas fa-grip-vertical"></i></div>
        <div class="tool-info">
          <div class="tool-icon"><i class="${tool.icon}"></i></div>
          <div class="tool-details">
            <h4>${tool.name}</h4>
            <p>${tool.description}</p>
          </div>
        </div>
        <div class="tool-toggle">
          <div class="toggle-switch ${toolVisibility[toolId] ? 'active' : ''}" data-tool-id="${toolId}"></div>
        </div>`;
      toolOrderList.appendChild(item);
    });
  
    initializeDragAndDrop();
    initializeToolToggles();
  }
  
  function initializeDragAndDrop() {
    const toolOrderList = document.getElementById('tool-order-list');
    let dragged = null;
  
    toolOrderList.addEventListener('dragstart', (e) => {
      dragged = e.target.closest('.tool-order-item');
      if (dragged) dragged.classList.add('dragging');
    });
  
    toolOrderList.addEventListener('dragend', () => {
      if (dragged) dragged.classList.remove('dragging');
      dragged = null;
    });
  
    toolOrderList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const after = getDragAfterElement(toolOrderList, e.clientY);
      if (!dragged) return;
      if (!after) toolOrderList.appendChild(dragged);
      else toolOrderList.insertBefore(dragged, after);
    });
  
    toolOrderList.addEventListener('drop', () => {
      saveSettings();
      applyToolOrder(getCurrentToolOrder());
    });
  }
  
  function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll('.tool-order-item:not(.dragging)')];
    return els.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
  
  function initializeToolToggles() {
    document.querySelectorAll('.toggle-switch').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        saveSettings();
        applyToolVisibility(getCurrentToolVisibility());
      });
    });
  }
  
  function getCurrentToolOrder() {
    const list = document.getElementById('tool-order-list');
    if (!list) return [];
    return Array.from(list.children).map((el) => el.dataset.toolId);
  }
  
  function getCurrentToolVisibility() {
    const vis = {};
    document.querySelectorAll('.toggle-switch').forEach((t) => {
      vis[t.dataset.toolId] = t.classList.contains('active');
    });
    return vis;
  }
  
  function applyToolOrder(order) {
    const grid = document.querySelector('.tools-grid');
    const cards = Array.from(grid.children);
    order.forEach((toolId) => {
      const card = cards.find((c) => c.querySelector(`[data-tool="${toolId}"]`));
      if (card) grid.appendChild(card);
    });
  }
  
  function applyToolVisibility(toolVisibility) {
    Object.entries(toolVisibility).forEach(([toolId, visible]) => {
      const card = document.querySelector(`[data-tool="${toolId}"]`)?.closest('.tool-card');
      if (card) card.style.display = visible ? 'block' : 'none';
    });
  }
  
  /* =========================
     Simple Settings Modal
  ========================= */
  function showSimpleSettingsModal() {
    const existing = document.getElementById('simple-settings-modal');
    if (existing) existing.remove();
  
    const modal = document.createElement('div');
    modal.id = 'simple-settings-modal';
    modal.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:10000;
      display:flex;align-items:center;justify-content:center;`;
    modal.setAttribute('data-theme', document.body.getAttribute('data-theme') || 'light');
  
    const currentTheme = (document.body.getAttribute('data-theme') || 'light') === 'dark';
    const titleColor = currentTheme ? '#ffffff' : '#1a1a1a';
    const textColor = currentTheme ? '#ffffff' : '#1a1a1a';
    const textSecondary = currentTheme ? '#cccccc' : '#333333';
    const labelColor = currentTheme ? '#cccccc' : '#333333';
    
    const content = document.createElement('div');
    content.style.cssText = `
      background:var(--bg-primary,#2a2a2a);color:var(--text-primary,#fff);
      padding:2rem;border-radius:12px;width:90%;max-width:600px;max-height:80vh;
      overflow:auto;border:1px solid var(--border-color,#444)`;
    content.innerHTML = `
      <div style="position:relative;margin-bottom:1rem;">
        <h2 style="margin:0;color:${titleColor};">Settings</h2>
        <button id="close-simple-settings" class="close-modal-btn"
          style="position:absolute;top:0;right:0;width:40px;height:40px;border-radius:50%;
                 border:1px solid var(--border-color);background:var(--bg-tertiary);color:${textColor};">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="height:1px;background:var(--border-color,#666);margin:1rem 0 1.5rem;"></div>
      <h3 style="color:${titleColor};font-weight:600;margin-bottom:1rem;">Theme</h3>
      <div style="display:flex;align-items:center;gap:1rem;">
        <span style="color:${labelColor};font-weight:500;">Light</span>
        <div id="theme-toggle-slider" style="width:60px;height:30px;border-radius:15px;border:1px solid var(--border-color,#666);position:relative;cursor:pointer;">
          <div style="position:absolute;top:2px;left:2px;width:24px;height:24px;border-radius:50%;"></div>
        </div>
        <span style="color:${labelColor};font-weight:500;">Dark</span>
      </div>
      <div style="height:1px;background:var(--border-color,#666);margin:1.5rem 0;"></div>
      <h3 style="color:${titleColor};font-weight:600;margin-bottom:1rem;">Tool Management</h3>
      <p style="color:${textSecondary};margin-bottom:1rem;">Drag tools to reorder them, or toggle to show/hide tools you don't use.</p>
      <div id="simple-tool-list" style="display:flex;flex-direction:column;gap:.5rem;"></div>
      <div style="height:1px;background:var(--border-color,#666);margin:1.5rem 0;"></div>
      <div style="text-align:center;">
        <button id="reset-simple-settings" class="btn btn-outline">Reset to Defaults</button>
      </div>
    `;
    modal.appendChild(content);
    document.body.appendChild(modal);
  
    document.getElementById('close-simple-settings').onclick = () => modal.remove();
    document.getElementById('reset-simple-settings').onclick = () => {
      localStorage.removeItem('gfs-settings'); location.reload();
    };
  
    const slider = document.getElementById('theme-toggle-slider');
    const knob = slider.querySelector('div');
    const isDark = (document.body.getAttribute('data-theme') || 'light') === 'dark';
    const setSlider = (dark) => {
      slider.style.background = dark ? '#333333' : '#ffffff';
      slider.style.borderColor = dark ? '#555555' : '#000000';
      knob.style.background = dark ? '#ffffff' : '#000000';
      knob.style.transform = dark ? 'translateX(30px)' : 'translateX(0)';
    };
    setSlider(isDark);
    
    // Function to update modal colors when theme changes
    const updateModalColors = (isDarkMode) => {
      const titleColor = isDarkMode ? '#ffffff' : '#1a1a1a';
      const textColor = isDarkMode ? '#ffffff' : '#1a1a1a';
      const textSecondary = isDarkMode ? '#cccccc' : '#333333';
      const labelColor = isDarkMode ? '#cccccc' : '#333333';
      
      // Update Settings title
      const h2 = content.querySelector('h2');
      if (h2) h2.style.color = titleColor;
      
      // Update section headings
      const h3s = content.querySelectorAll('h3');
      h3s.forEach(h3 => h3.style.color = titleColor);
      
      // Update Light/Dark labels
      const spans = content.querySelectorAll('div > span');
      spans.forEach(span => {
        if (span.textContent === 'Light' || span.textContent === 'Dark') {
          span.style.color = labelColor;
        }
      });
      
      // Update description paragraph
      const p = content.querySelector('p');
      if (p) p.style.color = textSecondary;
      
      // Update close button
      const closeBtn = document.getElementById('close-simple-settings');
      if (closeBtn) closeBtn.style.color = textColor;
    };
    
    slider.addEventListener('click', () => {
      const dark = !(document.body.getAttribute('data-theme') === 'dark');
      applyTheme(dark ? 'dark' : 'light');
      modal.setAttribute('data-theme', dark ? 'dark' : 'light');
      setSlider(dark);
      updateModalColors(dark);
      saveSettings();
      
      // Also update tool list colors
      populateSimpleToolList();
    });
  
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', esc); }
    });
  
    populateSimpleToolList();
  }
  
  function populateSimpleToolList() {
    const toolList = document.getElementById('simple-tool-list');
    const settings = JSON.parse(localStorage.getItem('gfs-settings') || '{}');
    const toolOrder = (settings.toolOrder && settings.toolOrder.length)
      ? settings.toolOrder
      : ['range-splitting', 'label-preview', 'range-jumping', 'route-mapping', 'formatter', 'sql-search-macro'];
    const toolVisibility = settings.toolVisibility || {
      'range-splitting': true,
      'label-preview': true,
      'range-jumping': true,
      'route-mapping': true,
      'formatter': true,
      'sql-search-macro': true
    };
  
    const toolData = {
      'range-splitting': { name: 'Range Splitting', description: 'Split ranges into smaller segments', icon: 'fas fa-cut' },
      'label-preview': { name: 'Label Preview', description: 'Preview and generate shipping labels', icon: 'fas fa-tag' },
      'range-jumping': { name: 'Range Jumping', description: 'Generate UPDATE scripts for range numbers', icon: 'fas fa-arrow-right' },
      'route-mapping': { name: 'Route Mapping', description: 'Generate SQL INSERT statements for carrier routes', icon: 'fas fa-route' },
      'sql-search-macro': { name: 'SQL Search Macro', description: 'Build WHERE IN list from consignments', icon: 'fas fa-database' },
      'formatter': { name: 'XML & JSON Formatter', description: 'Pretty-print or minify JSON/XML', icon: 'fas fa-code' }
    };
  
  
    toolList.innerHTML = '';
    toolOrder.forEach((toolId) => {
      const tool = toolData[toolId];
      if (!tool) return;
      const item = document.createElement('div');
      item.className = 'simple-tool-item';
      item.draggable = true;
      item.dataset.toolId = toolId;
      item.style.cssText = `
        display:flex;align-items:center;gap:1rem;padding:1rem;
        background:var(--bg-secondary,#333);border:1px solid var(--border-color,#555);
        border-radius:8px;cursor:move`;
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDarkMode ? '#ffffff' : '#1a1a1a';
      const textSecondary = isDarkMode ? '#cccccc' : '#333333';
      const textMuted = isDarkMode ? '#888888' : '#333333';
      item.innerHTML = `
        <div style="color:${textSecondary};cursor:grab;">⋮⋮</div>
        <div style="flex:1;">
          <h4 style="margin:0;color:${textColor};font-weight:600;">${tool.name}</h4>
          <p style="margin:0;color:${textMuted};font-size:.9rem;">${tool.description}</p>
        </div>
        <div style="display:flex;align-items:center;gap:.5rem;">
          <span style="color:${textMuted};font-weight:500;">Show</span>
          <div class="simple-toggle" data-tool-id="${toolId}"
               style="width:44px;height:24px;border-radius:12px;position:relative;cursor:pointer;
                      background:${toolVisibility[toolId] ? '#4CAF50' : '#666'};">
            <div style="position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;
                        background:#fff;transform:translateX(${toolVisibility[toolId] ? '20px' : '0'});"></div>
          </div>
        </div>`;
      toolList.appendChild(item);
    });
  
    initializeSimpleDragAndDrop();
  
    document.querySelectorAll('.simple-toggle').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const toolId = toggle.dataset.toolId;
        const active = toggle.style.background === 'rgb(102, 102, 102)' ? false : true; // #666 vs #4CAF50
        const next = !active;
        toggle.style.background = next ? '#4CAF50' : '#666';
        toggle.querySelector('div').style.transform = next ? 'translateX(20px)' : 'translateX(0)';
  
        const settings = JSON.parse(localStorage.getItem('gfs-settings') || '{}');
        settings.toolVisibility = settings.toolVisibility || {};
        settings.toolVisibility[toolId] = next;
        localStorage.setItem('gfs-settings', JSON.stringify(settings));
  
        const card = document.querySelector(`[data-tool="${toolId}"]`)?.closest('.tool-card');
        if (card) card.style.display = next ? 'block' : 'none';
      });
    });
  }
  
  function initializeSimpleDragAndDrop() {
    const list = document.getElementById('simple-tool-list');
    let dragged = null, indicator = null;
  
    function createIndicator() {
      const d = document.createElement('div');
      d.style.cssText = 'height:2px;background:#4CAF50;margin:2px 0;border-radius:1px;opacity:0;';
      return d;
    }
  
    list.addEventListener('dragstart', (e) => {
      dragged = e.target.closest('.simple-tool-item');
      if (!dragged) return;
      dragged.style.transform = 'scale(1.02)';
      dragged.style.border = '2px solid #4CAF50';
      indicator = createIndicator();
    });
    list.addEventListener('dragend', () => {
      if (dragged) {
        dragged.style.transform = '';
        dragged.style.border = '1px solid var(--border-color,#555)';
      }
      dragged = null;
      indicator?.remove();
      indicator = null;
    });
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!dragged) return;
      const after = getSimpleDragAfterElement(list, e.clientY);
      indicator?.remove();
      indicator = createIndicator();
      if (after) list.insertBefore(indicator, after);
      else list.appendChild(indicator);
      indicator.style.opacity = '1';
    });
    list.addEventListener('drop', () => {
      if (!dragged) return;
      const after = getSimpleDragAfterElement(list, Number.POSITIVE_INFINITY); // place where indicator was
      indicator?.replaceWith(dragged);
      indicator = null;
      const newOrder = Array.from(list.children).map((el) => el.dataset.toolId);
      const settings = JSON.parse(localStorage.getItem('gfs-settings') || '{}');
      settings.toolOrder = newOrder;
      localStorage.setItem('gfs-settings', JSON.stringify(settings));
      applyToolOrder(newOrder);
    });
  }
  
  function getSimpleDragAfterElement(container, y) {
    const els = [...container.querySelectorAll('.simple-tool-item')];
    return els.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
  
  /* =========================
     Utilities
  ========================= */
  window.copyToClipboard = function (text) {
    navigator.clipboard.writeText(text).then(() => {
      showCopyNotification('Copied to clipboard!', 'success');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      showCopyNotification('Copied to clipboard!', 'success');
    });
  };
  
  function showCopyNotification(message, type = 'success') {
    const existing = document.querySelector('.copy-notification');
    existing?.remove();
    const n = document.createElement('div');
    n.className = `copy-notification copy-notification-${type}`;
    n.innerHTML = `<div class="notification-content"><i class="fas fa-check-circle"></i><span>${message}</span></div>`;
    document.body.appendChild(n);
    setTimeout(() => n.classList.add('show'), 100);
    setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 300); }, 2000);
  }
  
  /* =========================
     Tools Initializers
  ========================= */
  function initializeRangeSplitter() {
    const startInput = document.getElementById('start-range');
    const endInput = document.getElementById('end-range');
    const slider = document.getElementById('split-percentage');
    const pctLabel = document.getElementById('percentage-display');
    const calcBtn = document.getElementById('calculate-split');
    const copyBtn = document.getElementById('copy-results');
    const clearBtn = document.getElementById('clear-inputs');
  
    const calc = () => {
      const start = +startInput.value || 0;
      const end = +endInput.value || 0;
      const pct = +slider.value || 50;
      if (start >= end) {
        document.getElementById('total-range').textContent = 'Invalid range';
        document.getElementById('available-numbers').textContent = 'Start must be less than end';
        document.getElementById('first-range').textContent = '-';
        document.getElementById('first-count').textContent = '-';
        document.getElementById('second-range').textContent = '-';
        document.getElementById('second-count').textContent = '-';
        return;
      }
      const total = end - start;
      const firstCount = Math.floor(total * (pct / 100));
      const secondCount = total - firstCount;
      const firstEnd = start + firstCount - 1;
      const secondStart = firstEnd + 1;
  
      document.getElementById('total-range').textContent = `${start} to ${end}`;
      document.getElementById('available-numbers').textContent = total;
  
      const makeBox = (a, b) =>
        `<div class="range-copy-box"><span class="range-text">
          <span class="clickable-number" onclick="copyToClipboard('${a}')">${a}</span>
          <span class="range-separator"> to </span>
          <span class="clickable-number" onclick="copyToClipboard('${b}')">${b}</span>
        </span></div>`;
  
      document.getElementById('first-range').innerHTML = makeBox(start, firstEnd);
      document.getElementById('first-count').textContent = `${firstCount} numbers`;
      document.getElementById('second-range').innerHTML = makeBox(secondStart, end);
      document.getElementById('second-count').textContent = `${secondCount} numbers`;
    };
  
    slider.addEventListener('input', () => { pctLabel.textContent = slider.value + '%'; if (startInput.value && endInput.value) calc(); });
    startInput.addEventListener('input', calc);
    endInput.addEventListener('input', calc);
    calcBtn.addEventListener('click', calc);
  
    copyBtn.addEventListener('click', () => {
      const a = document.getElementById('first-range').textContent;
      const b = document.getElementById('second-range').textContent;
      if (a !== '-' && b !== '-') copyToClipboard(`Range Split Results:\nFirst Range: ${a}\nSecond Range: ${b}`);
    });
  
    clearBtn.addEventListener('click', () => {
      startInput.value = '';
      endInput.value = '';
      slider.value = 50; pctLabel.textContent = '50%';
      document.getElementById('total-range').textContent = '-';
      document.getElementById('available-numbers').textContent = '-';
      document.getElementById('first-range').textContent = '-';
      document.getElementById('first-count').textContent = '-';
      document.getElementById('second-range').textContent = '-';
      document.getElementById('second-count').textContent = '-';
    });
  }
  
  function initializeLabelPreview() {
    const base64Input = document.getElementById('base64-input');
    const dataLengthSpan = document.getElementById('data-length');
    const processBtn = document.getElementById('process-label');
    const clearBtn = document.getElementById('clear-label');
    const processStatus = document.getElementById('process-status');
    const labelResults = document.getElementById('label-results');
    const labelError = document.getElementById('label-error');
    
    base64Input.addEventListener('input', function() {
      const length = this.value.length;
      dataLengthSpan.textContent = `${length.toLocaleString()} characters`;
    });

    processBtn.addEventListener('click', processLabel);
    clearBtn.addEventListener('click', clearLabelInputs);

    function processLabel() {
      const base64Data = base64Input.value.trim();
      if (!base64Data) {
        showError('Please paste your Base64 encoded label data.');
        return;
      }

      hideError();
      hideResults();
      showProcessStatus();
      resetProcessSteps();

      try {
        updateProcessStep('step-decode', 'completed');
        const decodedData = cleanAndDecodeBase64(base64Data);
        
        updateProcessStep('step-convert', 'completed');
        const dataType = identifyDataType(decodedData);
        
        updateProcessStep('step-preview', 'completed');
        generateLabelPreview(decodedData, dataType);
        
        hideProcessStatus();
        showResults();
        
      } catch (error) {
        console.error('Processing error:', error);
        showError(`Processing failed: ${error.message}`);
        hideProcessStatus();
      }
    }

    function cleanAndDecodeBase64(base64String) {
      try {
        let cleaned = base64String;
        
        cleaned = cleaned.replace(/[\s\r\n\t]/g, '');
        cleaned = cleaned.replace(/<\/?Image\/?/g, '');
        cleaned = cleaned.replace(/[^A-Za-z0-9+/=]/g, '');
        cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');
        
        while (cleaned.length % 4 !== 0) {
          cleaned += '=';
        }
        
        cleaned = cleaned.replace(/=+$/, '');
        while (cleaned.length % 4 !== 0) {
          cleaned += '=';
        }
        
        const decoded = atob(cleaned);
        
        const bytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) {
          bytes[i] = decoded.charCodeAt(i);
        }
        
        return bytes;
      } catch (error) {
        console.error('Base64 cleaning/decoding error:', error);
        throw new Error(`Base64 processing failed: ${error.message}. Please check your input format.`);
      }
    }

    function identifyDataType(data) {
      if (data.length >= 4) {
        const header = String.fromCharCode(...data.slice(0, 4));
        
        if (header === '%PDF' || header.startsWith('%PDF')) {
          return 'PDF';
        }
        
        const firstBytes = data.slice(0, 10);
        const firstBytesText = String.fromCharCode(...firstBytes);
        
        if (firstBytesText.includes('%PDF')) {
          return 'PDF';
        }
      }
      
      if (data.length >= 8) {
        const pngHeader = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
        const jpgHeader = [0xFF, 0xD8, 0xFF];
        
        if (pngHeader.every((byte, i) => data[i] === byte)) {
          return 'PNG Image';
        }
        if (jpgHeader.every((byte, i) => data[i] === byte)) {
          return 'JPEG Image';
        }
      }
      
      const text = String.fromCharCode(...data);
      
      if (text.includes('^XA') || text.includes('^FO') || text.includes('^FD') || text.includes('^FS')) {
        return 'ZPL Text';
      }
      
      if (text.match(/^[\x20-\x7E\t\n\r]*$/)) {
        const readableChars = text.replace(/[\x00-\x1F\x7F]/g, '').length;
        const totalChars = text.length;
        const readabilityRatio = readableChars / totalChars;
        
        const binaryPatterns = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\xA0-\xFF]/g;
        const binaryCharCount = (text.match(binaryPatterns) || []).length;
        const binaryRatio = binaryCharCount / totalChars;
        
        if (readabilityRatio > 0.9 && binaryRatio < 0.05) {
          return 'Text';
        } else if (readabilityRatio > 0.8 && binaryRatio < 0.1) {
          return 'Text';
        } else {
          return 'Binary Data';
        }
      }
      
      return 'Binary Data';
    }

    function generateLabelPreview(data, dataType) {
      const previewContainer = document.getElementById('preview-container');
      const dataTypeSpan = document.getElementById('data-type');
      const processedStatus = document.getElementById('processed-status');
      
      dataTypeSpan.textContent = dataType;
      
      if (dataType === 'PDF') {
        processedStatus.textContent = 'Creating PDF preview...';
        
        const pdfBase64 = btoa(String.fromCharCode(...data));
        const pdfDataUrl = `data:application/pdf;base64,${pdfBase64}`;
        
        const previewInfo = previewContainer.querySelector('.preview-info');
        previewContainer.innerHTML = '';
        if (previewInfo) {
          previewContainer.appendChild(previewInfo);
        }
        
        const pdfEmbed = document.createElement('embed');
        pdfEmbed.src = pdfDataUrl;
        pdfEmbed.type = 'application/pdf';
        pdfEmbed.width = '100%';
        pdfEmbed.height = '500';
        pdfEmbed.style.cssText = 'border: 2px solid #e5e7eb; border-radius: 8px; margin: 10px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
        
        previewContainer.appendChild(pdfEmbed);
        
        processedStatus.textContent = 'PDF preview created successfully';
        return;
      }
      
      if (dataType === 'PNG Image') {
        processedStatus.textContent = 'Creating PNG preview...';
        
        const pngBase64 = btoa(String.fromCharCode(...data));
        const pngDataUrl = `data:image/png;base64,${pngBase64}`;
        
        const previewInfo = previewContainer.querySelector('.preview-info');
        previewContainer.innerHTML = '';
        if (previewInfo) {
          previewContainer.appendChild(previewInfo);
        }
        
        const pngImg = document.createElement('img');
        pngImg.src = pngDataUrl;
        pngImg.alt = 'PNG Preview';
        pngImg.style.cssText = 'max-width: 100%; height: auto; border: 2px solid #e5e7eb; border-radius: 8px; margin: 10px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
        
        previewContainer.appendChild(pngImg);
        
        processedStatus.textContent = 'PNG preview created successfully';
        return;
      }
      
      if (dataType === 'JPEG Image') {
        processedStatus.textContent = 'Creating JPEG preview...';
        
        const jpegBase64 = btoa(String.fromCharCode(...data));
        const jpegDataUrl = `data:image/jpeg;base64,${jpegBase64}`;
        
        const previewInfo = previewContainer.querySelector('.preview-info');
        previewContainer.innerHTML = '';
        if (previewInfo) {
          previewContainer.appendChild(previewInfo);
        }
        
        const jpegImg = document.createElement('img');
        jpegImg.src = jpegDataUrl;
        jpegImg.alt = 'JPEG Preview';
        jpegImg.style.cssText = 'max-width: 100%; height: auto; border: 2px solid #e5e7eb; border-radius: 8px; margin: 10px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
        
        previewContainer.appendChild(jpegImg);
        
        processedStatus.textContent = 'JPEG preview created successfully';
        return;
      }
      
      processedStatus.textContent = 'Processing with Labelary API...';
      
      const previewInfo = previewContainer.querySelector('.preview-info');
      previewContainer.innerHTML = '';
      if (previewInfo) {
        previewContainer.appendChild(previewInfo);
      }
      
      const previewImg = document.createElement('img');
      previewImg.id = 'label-preview-img';
      previewImg.alt = 'Label Preview';
      previewImg.style.cssText = 'max-width: 100%; height: auto; border: 2px solid #e5e7eb; border-radius: 8px; margin: 10px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
      previewContainer.appendChild(previewImg);
      
      const text = dataType === 'Text' ? String.fromCharCode(...data) : '';
      const zplData = text ? `^XA^FO50,50^A0N,50,50^FD${text}^FS^XZ` : `^XA^FO50,50^A0N,50,50^FD${dataType} Data^FS^XZ`;
      
      fetch('https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/', {
        method: 'POST',
        headers: {
          'Accept': 'image/png',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: zplData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('image/')) {
          return response.blob();
        } else {
          throw new Error('Response is not an image');
        }
      })
      .then(blob => {
        const imageUrl = URL.createObjectURL(blob);
        previewImg.src = imageUrl;
        processedStatus.textContent = 'Label generated successfully';
        previewImg.style.display = 'block';
        previewImg.style.visibility = 'visible';
      })
      .catch(error => {
        console.error('Labelary API error:', error);
        createPlaceholderImage(previewImg, dataType === 'Binary Data' ? 'Binary Data - Cannot Preview' : `${dataType} Data`, dataType === 'Binary Data' ? '#dc2626' : '#f59e0b');
        processedStatus.textContent = dataType === 'Binary Data' ? 'Binary data cannot be converted to label preview' : 'Processing failed, showing placeholder';
        previewImg.style.display = 'block';
        previewImg.style.visibility = 'visible';
      });
    }

    function createPlaceholderImage(imgElement, text, color) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 400;
      canvas.height = 300;
      
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      
      ctx.fillStyle = color;
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText('Labelary Preview', canvas.width / 2, canvas.height / 2 + 40);
      
      imgElement.src = canvas.toDataURL('image/png');
    }

    function clearLabelInputs() {
      base64Input.value = '';
      dataLengthSpan.textContent = '0 characters';
      hideResults();
      hideError();
      hideProcessStatus();
      
      const previewContainer = document.getElementById('preview-container');
      const dataTypeSpan = document.getElementById('data-type');
      const processedStatus = document.getElementById('processed-status');
      
      if (dataTypeSpan) dataTypeSpan.textContent = '-';
      if (processedStatus) processedStatus.textContent = '';
      
      if (previewContainer) {
        const previewInfo = previewContainer.querySelector('.preview-info');
        previewContainer.innerHTML = '';
        if (previewInfo) {
          previewContainer.appendChild(previewInfo);
        }
      }
    }

    function showProcessStatus() {
      processStatus.style.display = 'block';
    }

    function hideProcessStatus() {
      processStatus.style.display = 'none';
    }

    function showResults() {
      labelResults.style.display = 'block';
    }

    function hideResults() {
      labelResults.style.display = 'none';
    }

    function showError(message) {
      document.getElementById('error-text').textContent = message;
      labelError.style.display = 'block';
    }

    function hideError() {
      labelError.style.display = 'none';
    }

    function resetProcessSteps() {
      document.querySelectorAll('.status-step').forEach(step => {
        step.className = 'status-step';
        step.innerHTML = '<i class="fas fa-circle"></i><span>' + step.querySelector('span').textContent + '</span>';
      });
    }

    function updateProcessStep(stepId, status) {
      const step = document.getElementById(stepId);
      if (step) {
        step.className = `status-step ${status}`;
        if (status === 'completed') {
          step.innerHTML = '<i class="fas fa-check-circle"></i><span>' + step.querySelector('span').textContent + '</span>';
        } else if (status === 'error') {
          step.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>' + step.querySelector('span').textContent + '</span>';
        }
      }
    }
  }
  
  function initializeRouteMapping() {
    const carrierSelect = document.getElementById('carrier-select');
    const generateSqlBtn = document.getElementById('generate-sql');
    const clearBtn = document.getElementById('clear-route');
    const routeResults = document.getElementById('route-results');
    const sqlScript = document.getElementById('sql-script');
    const copyBtn = document.getElementById('copy-sql');
  
    carrierSelect.addEventListener('change', function () {
      const evriFields = document.getElementById('evri-fields');
      evriFields.style.display = this.value === 'Evri' ? 'block' : 'none';
    });
  
    generateSqlBtn.addEventListener('click', () => {
      const carrier = carrierSelect.value;
      if (carrier !== 'Evri') { alert('Only Evri is supported right now.'); return; }
  
      const accountNumber = document.getElementById('evri-account').value;
      const isIOD = document.getElementById('evri-iod').checked;
      const isPOD = document.getElementById('evri-pod').checked;
      const isND = document.getElementById('evri-next-day').checked;
      const is2D = document.getElementById('evri-2-day').checked;
      const routeDesc = document.getElementById('evri-route-desc').value || 'Evri';
  
      if (!accountNumber || accountNumber < 0 || accountNumber > 9) { alert('Enter a valid account number (0-9).'); return; }
      if (!isIOD && !isPOD) { alert('Select at least one delivery type (IOD or POD).'); return; }
      if (!isND && !is2D) { alert('Select at least one service (Next Day or 2 Day).'); return; }
  
      const stmts = [];
      if (isND) {
        if (isIOD) stmts.push(`insert into cust_routes (ROUTE_CODE,Carrier,CONTRACT_NO,SERVICE_CODE,ROUTE_DESC,PACKAGE_CODE,SATURDAY_DELIV) values ('ND${accountNumber}IOD','HERMES','7RY07${accountNumber}','NDAY','${routeDesc} IOD',null,null);`);
        if (isPOD) stmts.push(`insert into cust_routes (ROUTE_CODE,Carrier,CONTRACT_NO,SERVICE_CODE,ROUTE_DESC,PACKAGE_CODE,SATURDAY_DELIV) values ('ND${accountNumber}POD','HERMES','1RY01${accountNumber}','NDAY','${routeDesc} POD',null,null);`);
      }
      if (is2D) {
        if (isIOD) stmts.push(`insert into cust_routes (ROUTE_CODE,Carrier,CONTRACT_NO,SERVICE_CODE,ROUTE_DESC,PACKAGE_CODE,SATURDAY_DELIV) values ('2D${accountNumber}IOD','HERMES','7RY07${accountNumber}','2DAY','${routeDesc} IOD',null,null);`);
        if (isPOD) stmts.push(`insert into cust_routes (ROUTE_CODE,Carrier,CONTRACT_NO,SERVICE_CODE,ROUTE_DESC,PACKAGE_CODE,SATURDAY_DELIV) values ('2D${accountNumber}POD','HERMES','1RY01${accountNumber}','2DAY','${routeDesc} POD',null,null);`);
      }
  
      sqlScript.textContent = stmts.join('\n\n');
      routeResults.style.display = 'block';
      routeResults.scrollIntoView({ behavior: 'smooth' });
    });
  
    clearBtn.addEventListener('click', () => {
      carrierSelect.value = '';
      document.getElementById('evri-fields').style.display = 'none';
      document.getElementById('evri-account').value = '';
      document.getElementById('evri-iod').checked = false;
      document.getElementById('evri-pod').checked = false;
      document.getElementById('evri-next-day').checked = false;
      document.getElementById('evri-2-day').checked = false;
      document.getElementById('evri-route-desc').value = '';
      routeResults.style.display = 'none';
    });
  
    copyBtn.addEventListener('click', () => {
      const text = sqlScript.textContent;
      if (text.trim()) copyToClipboard(text);
    });
  }
  
  function initializeRangeJumping() {
    const copyQueryBtn = document.getElementById('copy-query');
    const insertScriptInput = document.getElementById('insert-script-input');
    const jumpAmountInput = document.getElementById('jump-amount');
    const generateUpdateBtn = document.getElementById('generate-update');
    const clearBtn = document.getElementById('clear-range-jump');
    const resultsBox = document.getElementById('range-jump-results');
    const output = document.getElementById('update-script');
    const copyBtn = document.getElementById('copy-update-script');
  
    const RANGE_QUERY_TEXT = [
      'SELECT',
      '    csc.contract_no,',
      '    csc.RANGE_ID,',
      '    sr.cons_start_no,',
      '    sr.cons_end_no,',
      '    sr.cons_cur_no,',
      '    csc.ITEM_RANGE_ID,',
      '    ir.START_NO,',
      '    ir.END_NO,',
      '    ir.CUR_NO',
      'FROM cust_site_contracts csc',
      'INNER JOIN SHIP_RANGES sr ON csc.RANGE_ID = sr.ID',
      'INNER JOIN ITEM_RANGES ir ON csc.ITEM_RANGE_ID = ir.ID',
      'WHERE NOT (sr.cons_cur_no = 1 AND sr.cons_end_no = 1);'
    ].join('\n');
  
    copyQueryBtn.addEventListener('click', () => copyToClipboard(RANGE_QUERY_TEXT));
  
    generateUpdateBtn.addEventListener('click', () => {
      const insertScript = insertScriptInput.value.trim();
      const jump = parseInt(jumpAmountInput.value, 10) || 0;
      if (!insertScript) return alert('Paste your INSERT script results first.');
      if (jump <= 0) return alert('Enter a valid jump amount (> 0).');
  
      try {
        const lines = insertScript.split('\n').filter(Boolean);
        const updates = [];
        const parseValues = (str) => {
          const vals = []; let cur = '', q = false, qc = '';
          for (const ch of str) {
            if ((ch === "'" || ch === '"') && !q) { q = true; qc = ch; cur += ch; }
            else if (ch === qc && q) { q = false; qc = ''; cur += ch; }
            else if (ch === ',' && !q) { vals.push(cur.trim()); cur = ''; }
            else cur += ch;
          }
          if (cur.trim()) vals.push(cur.trim());
          return vals.map(v => v.replace(/^['"]|['"]$/g, ''));
        };
  
        const gen = (vals) => {
          if (vals.length >= 9) {
            const rangeId = vals[1];
            const consCurNo = vals[4];
            const itemRangeId = vals[5];
            const curNo = vals[8];
            if (rangeId && !isNaN(+consCurNo)) updates.push(`UPDATE SHIP_RANGES SET cons_cur_no = ${+consCurNo + jump} WHERE ID = ${rangeId};`);
            if (itemRangeId && !isNaN(+curNo)) updates.push(`UPDATE ITEM_RANGES SET cur_no = ${+curNo + jump} WHERE ID = ${itemRangeId};`);
          }
        };
  
        for (const line of lines) {
          const l = line.trim();
          if (/^VALUES/i.test(l)) {
            const m = l.match(/VALUES\s*\(([^)]+)\)/i);
            if (m) gen(parseValues(m[1]));
          } else if (l.includes('(') && l.includes(')') && l.includes(',')) {
            const m = l.match(/\(([^)]+)\)/);
            if (m) gen(parseValues(m[1]));
          }
        }
  
        if (!updates.length) throw new Error('No valid INSERT statements found.');
        output.textContent = updates.join('\n\n');
        resultsBox.style.display = 'block';
        resultsBox.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        alert('Error generating update script: ' + err.message);
      }
    });
  
    clearBtn.addEventListener('click', () => {
      insertScriptInput.value = '';
      jumpAmountInput.value = '100';
      resultsBox.style.display = 'none';
    });
  
    copyBtn.addEventListener('click', () => {
      const text = output.textContent;
      if (text.trim()) copyToClipboard(text);
    });
  }
  
  function initializeFormatter() {
    const input = document.getElementById('format-input');
    const out = document.getElementById('format-output');
    const len = document.getElementById('format-len');
    const mode = document.getElementById('format-mode');
    const indentSel = document.getElementById('indent-select');   // NEW
    const trimSel = document.getElementById('format-trim');     // NEW
  
  
    const btnPretty = document.getElementById('format-pretty');
    const btnMinify = document.getElementById('format-minify');
    const btnClear = document.getElementById('format-clear');
    const btnCopy = document.getElementById('format-copy');
    const btnCopy2 = document.getElementById('format-copy-2');
  
    const statusBox = document.getElementById('format-status');
    const errBox = document.getElementById('format-error');
    const errText = document.getElementById('format-error-text');
    const results = document.getElementById('format-results');
  
    async function copyTextFallback(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  
    async function copyOutputToClipboard(btn) {
      const text = (out?.textContent || '').trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        await copyTextFallback(text);
      }
      if (btn) {
        const old = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = old), 1000);
      }
    }
  
    const getIndent = () => {
      const v = parseInt((indentSel?.value ?? '3'), 10);
      return Math.max(0, Math.min(8, isNaN(v) ? 3 : v));
    };
  
    const showError = (msg) => {
      errText.textContent = msg;
      statusBox.style.display = 'block';
      errBox.classList.add('error');
    };
    const clearError = () => { statusBox.style.display = 'none'; };
  
    const setOutput = (text) => {
      out.textContent = text;
      results.style.display = text.trim() ? 'block' : 'none';
    };
  
    const detectMode = (txt) => {
      const s = txt.trim();
      if (!s) return 'auto';
      if (mode && mode.value && mode.value !== 'auto') return mode.value;  // ← guard
      if (s.startsWith('{') || s.startsWith('[')) return 'json';
      if (s.startsWith('<') || /<\/[A-Za-z]/.test(s)) return 'xml';
      return 'json';
    };
  
  
  
    function formatJSON(raw, pretty = true) {
      const obj = JSON.parse(raw);
      return pretty ? JSON.stringify(obj, null, getIndent()) : JSON.stringify(obj);
    }
  
    function formatXML(raw, pretty = true) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(raw, 'application/xml');
      const parseErr = dom.getElementsByTagName('parsererror')[0];
      if (parseErr) {
        const msg = parseErr.textContent.replace(/\s+/g, ' ').trim();
        throw new Error(msg || 'Invalid XML');
      }
  
      // Minified (also removes whitespace between text and closing tag)
      const min = new XMLSerializer().serializeToString(dom)
        .replace(/>\s+</g, '><')
        .replace(/(\S)\s+<\/(?!\?)/g, '$1</')
        .trim();
      if (!pretty) return min;
  
      const IND = ' '.repeat(getIndent());
  
      const escText = (s) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
      const renderAttrs = (el) =>
        Array.from(el.attributes).map(a =>
          ` ${a.name}="${a.value.replace(/"/g, '&quot;')}"`).join('');
  
      // true if element has exactly one non-empty text node (no line breaks)
      const isInlineTextElem = (el) => {
        const children = Array.from(el.childNodes);
        if (children.length !== 1 || children[0].nodeType !== 3) return false; // TEXT_NODE
        const t = children[0].nodeValue ?? '';
        if (!t.trim()) return false;
        return !/\r|\n/.test(t); // no line breaks in the text
      };
  
      const walk = (node, depth) => {
        switch (node.nodeType) {
          case 1: { // ELEMENT_NODE
            const el = node;
            const name = el.nodeName;
            const attrs = renderAttrs(el);
  
            // <Tag/> (no children & no text)
            if (el.childNodes.length === 0) {
              return `${IND.repeat(depth)}<${name}${attrs}/>`;
            }
  
            // <Tag>text</Tag> inline
            if (isInlineTextElem(el)) {
              const text = escText(el.textContent.trim());
              return `${IND.repeat(depth)}<${name}${attrs}>${text}</${name}>`;
            }
  
            // Block-style with children
            const open = `${IND.repeat(depth)}<${name}${attrs}>`;
            const inner = Array.from(el.childNodes)
              .map(ch => walk(ch, depth + 1))
              .filter(Boolean)
              .join('\n');
            const close = `${IND.repeat(depth)}</${name}>`;
            return inner ? `${open}\n${inner}\n${close}` : `${open}${close}`;
          }
          case 3: { // TEXT_NODE
            const t = node.nodeValue ?? '';
            if (!t.trim()) return ''; // ignore pure whitespace
            // If we ever hit text here (inside a complex element), trim ends and show on its own line
            return `${IND.repeat(depth)}${escText(t.trim())}`;
          }
          case 4: { // CDATA_SECTION_NODE
            return `${IND.repeat(depth)}<![CDATA[${node.nodeValue || ''}]]>`;
          }
          case 7: { // PROCESSING_INSTRUCTION_NODE
            return `${IND.repeat(depth)}<?${node.nodeName} ${node.nodeValue || ''}?>`;
          }
          case 8: { // COMMENT_NODE
            return `${IND.repeat(depth)}<!--${node.nodeValue || ''}-->`;
          }
          case 9: { // DOCUMENT_NODE
            return Array.from(node.childNodes).map(ch => walk(ch, depth)).filter(Boolean).join('\n');
          }
          default:
            return '';
        }
      };
  
      return walk(dom, 0).trim();
    }
  
  
  
    function run(pretty) {
      clearError();
      try {
        let txt = input.value;
        
        // Apply text mode trimming based on selection
        const trimMode = trimSel?.value || 'ends';
        switch (trimMode) {
          case 'ends':
            txt = txt.trim();
            break;
          case 'lines':
            txt = txt.split('\n').map(line => line.trim()).join('\n');
            break;
          case 'none':
            // No trimming - keep as-is
            break;
        }
        
        const which = detectMode(txt);
        let result = '';
        if (which === 'json') {
          result = formatJSON(txt, pretty);
        } else if (which === 'xml') {
          result = formatXML(txt, pretty);
        } else {
          // auto -> try JSON then XML
          try { result = formatJSON(txt, pretty); }
          catch (e1) { result = formatXML(txt, pretty); }
        }
        setOutput(result);
      } catch (err) {
        setOutput('');
        showError(err.message || String(err));
      }
    }
  
    input.addEventListener('input', () => { len.textContent = String(input.value.length); });
    btnPretty.addEventListener('click', () => run(true));
    btnMinify.addEventListener('click', () => run(false));
    btnClear.addEventListener('click', () => { input.value = ''; len.textContent = '0'; setOutput(''); clearError(); });
  
    if (btnCopy2) {
      btnCopy2.addEventListener('click', () => copyOutputToClipboard(btnCopy2));
    }
    // (Optional: if btnCopy exists, guard it too)
    if (btnCopy) {
      btnCopy.addEventListener('click', async () => {
        const t = input.value;
        if (!t.trim()) return;
        try { await navigator.clipboard.writeText(t); } catch { await copyTextFallback(t); }
        const old = btnCopy.textContent; btnCopy.textContent = 'Copied!'; setTimeout(() => (btnCopy.textContent = old), 1000);
      });
    }
    // Events
    input.addEventListener('input', () => { len.textContent = String(input.value.length); });
    btnPretty.addEventListener('click', () => run(true));
    btnMinify.addEventListener('click', () => run(false));
    btnClear.addEventListener('click', () => { input.value = ''; len.textContent = '0'; setOutput(''); clearError(); });
    btnCopy.addEventListener('click', async () => {
      if (!input.value.trim()) return;
      await navigator.clipboard.writeText(input.value);
      btnCopy.textContent = 'Copied!'; setTimeout(() => (btnCopy.textContent = 'Copy'), 1000);
    });
    btnCopy2.addEventListener('click', async () => {
      const t = out.textContent || '';
      if (!t.trim()) return;
      await navigator.clipboard.writeText(t);
      btnCopy2.textContent = 'Copied!'; setTimeout(() => (btnCopy2.textContent = 'Copy'), 1000);
    });
  
    // Initial UI state
    len.textContent = String(input.value.length || 0);
    setOutput('');
    clearError();
  }
  
  
  
  function initializeSqlSearchMacro() {
    const outEl = document.getElementById('sql-macro-output');
    const btnGen = document.getElementById('sql-macro-generate');
    const btnClear = document.getElementById('sql-macro-clear');
    const btnCopy = document.getElementById('sql-macro-copy');
    const results = document.getElementById('sql-macro-results');
  
    const dateFrom = document.getElementById('sql-date-from');
    const dateTo = document.getElementById('sql-date-to');
  
    const criteriaList = document.getElementById('criteria-list');
    const addRowBtn = document.getElementById('add-criteria-row');
  
    if (!criteriaList || !btnGen || !outEl) return;
  
    if (initializeSqlSearchMacro._wired) return;
    initializeSqlSearchMacro._wired = true;
  
    const btnDateClear = document.getElementById('sql-date-clear');
    btnDateClear?.addEventListener('click', () => {
      if (dateFrom) dateFrom.value = '';
      if (dateTo) dateTo.value = '';
      // If the results panel is already visible, rebuild SQL without date filters
      if (results && results.style.display === 'block') {
        outEl.textContent = (typeof buildSql === 'function')
          ? buildSql('', '')
          : outEl.textContent;
      }
    });
  
    // --- Field definitions ---
    const FIELD_DEFS = [
      { col: 'CONS_NO', label: 'CONS_NO', type: 'text' },
      { col: 'CONTRACT_NO', label: 'CONTRACT_NO', type: 'numeric' },
      { col: 'METRE_NO', label: 'METRE_NO', type: 'numeric' },
      { col: 'CUSTOMER_ID', label: 'CUSTOMER_ID', type: 'numeric' },
      { col: 'CUST_ID', label: 'CUST_ID', type: 'numeric' },
      { col: 'CARRIER', label: 'CARRIER', type: 'text' }, // special handling
      { col: 'SHIP_REF', label: 'SHIP_REF', type: 'text' },
      { col: 'CONS_REF', label: 'CONS_REF', type: 'text' },
    ];
  
    // --- Date bounds: last 12 months up to today ---
    (function setDateBounds() {
      if (!dateFrom || !dateTo) return;
      const today = new Date();
      const maxStr = toInputDate(today);
      const min = new Date(today);
      min.setMonth(min.getMonth() - 12);
      const minStr = toInputDate(min);
      dateFrom.setAttribute('max', maxStr);
      dateTo.setAttribute('max', maxStr);
      dateFrom.setAttribute('min', minStr);
      dateTo.setAttribute('min', minStr);
    })();
  
    function toInputDate(d) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  
    function formatOracleDate(isoStr) {
      if (!isoStr) return '';
      const [y, m, d] = isoStr.split('-').map(s => parseInt(s, 10));
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const mon = months[(m - 1) || 0];
      return `${String(d).padStart(2, '0')}-${mon}-${y}`;
    }
  
    // --- UI: create a criteria row ---
    function addCriteriaRow(defaultField = 'CONS_NO') {
      const row = document.createElement('div');
      row.className = 'criteria-row';
  
      const select = document.createElement('select');
      select.className = 'form-select field-select';
      FIELD_DEFS.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.col;
        opt.textContent = f.label;
        if (f.col === defaultField) opt.selected = true;
        select.appendChild(opt);
      });
  
      const valueBox = document.createElement('div');
      valueBox.className = 'value-box';
  
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-outline remove-row';
      removeBtn.type = 'button';
      removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
  
      row.appendChild(select);
      row.appendChild(valueBox);
      row.appendChild(removeBtn);
      criteriaList.appendChild(row);
  
      function renderInput() {
        const field = FIELD_DEFS.find(f => f.col === select.value);
        valueBox.innerHTML = '';
  
        // --- Create the right input box based on field type ---
        if (field?.type === 'text' && field.col === 'CARRIER') {
          // CARRIER: single-line input; force uppercase
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'criteria-input';
          input.placeholder = 'e.g., DPD, HERMES';
          input.style.textTransform = 'uppercase';
          input.addEventListener('input', () => {
            const pos = input.selectionStart;
            input.value = input.value.toUpperCase();
            input.setSelectionRange(pos, pos);
          });
          valueBox.appendChild(input);
  
        } else if (['CONS_NO', 'SHIP_REF', 'CONS_REF'].includes(field.col)) {
          // These fields: allow letters/numbers; multi-line; uppercase
          const ta = document.createElement('textarea');
          ta.className = 'criteria-input';
          ta.placeholder = 'One or many values (comma/space/newline separated). Letters allowed.';
          ta.style.textTransform = 'uppercase';
          ta.addEventListener('input', () => {
            const start = ta.selectionStart, end = ta.selectionEnd;
            ta.value = ta.value.toUpperCase();
            ta.setSelectionRange(start, end);
          });
          valueBox.appendChild(ta);
  
        } else {
          // Numeric-type fallback (existing behavior)
          const ta = document.createElement('textarea');
          ta.className = 'criteria-input';
          ta.placeholder = 'Paste values (any format); we keep digits only';
          valueBox.appendChild(ta);
        }
  
      }
  
      renderInput();
      select.addEventListener('change', renderInput);
  
      removeBtn.addEventListener('click', () => {
        if (criteriaList.children.length > 1) row.remove(); // keep at least one row
      });
  
      return row;
    }
    // Start with a default CONS_NO row (only if none exist)
    if (!criteriaList.querySelector('.criteria-row')) {
      addCriteriaRow('CONS_NO');
    }
  
    // Bind the "Add Filter" button only once
    if (addRowBtn && !addRowBtn.dataset.bound) {
      addRowBtn.dataset.bound = '1';
      addRowBtn.addEventListener('click', () => addCriteriaRow('CONS_NO'));
    }
  
    // Start with a default CONS_NO row (only if none exist)
    if (!criteriaList.querySelector('.criteria-row')) {
      addCriteriaRow('CONS_NO');
    }
  
    // Bind the "Add Filter" button only once
    if (addRowBtn && !addRowBtn.dataset.bound) {
      addRowBtn.dataset.bound = '1';
      addRowBtn.addEventListener('click', () => addCriteriaRow('CONS_NO'));
    }
  
  
    // --- Parsing helpers ---
    function parseNumericList(raw) {
      const parts = String(raw || '').split(/[\s,;|\t\r\n]+/);
      const seen = new Set();
      const out = [];
      for (const p of parts) {
        const digits = p.replace(/\D+/g, '');
        if (digits && !seen.has(digits)) {
          seen.add(digits);
          out.push(digits);
        }
      }
      return out;
    }
  
    function parseTextList(raw) {
      // Split, trim, strip user quotes, uppercase, de-dupe (case-insensitive)
      const parts = String(raw || '')
        .split(/[\s,;|\t\r\n]+/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => s.replace(/^['"]|['"]$/g, ''))
        .map(s => s.toUpperCase());
  
      const seen = new Set();
      const out = [];
      for (const p of parts) {
        if (!seen.has(p)) { seen.add(p); out.push(p); }
      }
      return out;
    }
  
    function escapeSqlString(value) {
      return String(value).replace(/'/g, "''");
    }
  
    // --- Build SQL ---
    function buildSql(fromISO, toISO) {
      const clauses = [];
      const rows = Array.from(criteriaList.children);
  
      for (const row of rows) {
        const fieldSel = row.querySelector('.field-select');
        const valEl = row.querySelector('.criteria-input');
        if (!fieldSel || !valEl) continue;
  
        const field = FIELD_DEFS.find(f => f.col === fieldSel.value);
        if (!field) continue;
  
        if (field.type === 'text') {
          // Any text field (CARRIER, CONS_NO, CONS_REF, SHIP_REF)
          const list = parseTextList(valEl.value); // allows letters & numbers; uppercased + de-duped
          if (!list.length) continue;
          const escaped = list.map(v => `'${escapeSqlString(v)}'`);
          clauses.push(
            escaped.length === 1
              ? `${field.col} = ${escaped[0]}`
              : `${field.col} IN (${escaped.join(',')})`
          );
        } else {
          // Numeric fields: keep digits-only and build IN (...)
          const list = parseNumericList(valEl.value);
          if (!list.length) continue;
          const inList = '(' + list.map(v => `'${v}'`).join(',') + ')';
          clauses.push(`${field.col} IN ${inList}`);
        }
      }
  
      if (!clauses.length) {
        return '-- Add at least one filter row and click Generate';
      }
  
      // Date filters (optional) — leave exactly as-is per your requirement
      if (fromISO) clauses.push(`insert_date >= '${formatOracleDate(fromISO)}'`);
      if (toISO) clauses.push(`insert_date <= '${formatOracleDate(toISO)}'`);
  
      return `SELECT *\nFROM shipments\nWHERE ${clauses.join('\n  AND ')}`;
    }
  
  
    // --- Events ---
    btnGen.addEventListener('click', () => {
      const fromValue = dateFrom?.value || '';
      const toValue = dateTo?.value || '';
      outEl.textContent = buildSql(fromValue, toValue);
      results.style.display = 'block';
    });
  
    btnClear.addEventListener('click', () => {
      criteriaList.innerHTML = '';
      addCriteriaRow('CONS_NO');
      if (dateFrom) dateFrom.value = '';
      if (dateTo) dateTo.value = '';
      outEl.textContent = '';
      results.style.display = 'none';
    });
  
    btnCopy.addEventListener('click', async () => {
      const text = outEl.textContent || '';
      if (!text.trim()) return;
      try {
        await navigator.clipboard.writeText(text);
        btnCopy.textContent = 'Copied!';
        setTimeout(() => (btnCopy.textContent = 'Copy'), 1200);
      } catch {
        window.copyToClipboard(text);
      }
    });
  }
  
  /* =========================
     App Bootstrap
  ========================= */
  document.addEventListener('DOMContentLoaded', () => {
    const toolModal = document.getElementById('tool-modal');
    const modalTitle = document.getElementById('modal-title');
    initializeSettings(toolModal);
  
    // Open a tool
    document.querySelectorAll('.open-tool').forEach((btn) => {
      btn.addEventListener('click', function () {
        document.getElementById('settings-modal').style.display = 'none';
        const toolType = this.getAttribute('data-tool');
        const toolName = this.closest('.tool-card').querySelector('h3').textContent;
        modalTitle.textContent = toolName;
        toolModal.style.display = 'block';
        showToolContent(toolType);
        this.style.transform = 'scale(0.95)'; setTimeout(() => (this.style.transform = 'scale(1)'), 150);
      });
    });
  
    // Close modal
    document.querySelectorAll('.close-modal-btn').forEach((b) =>
      b.addEventListener('click', () => (toolModal.style.display = 'none'))
    );
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toolModal.style.display = 'none'; });
  
    // Header effect
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.header');
      if (window.scrollY > 100) {
        header.style.background = 'rgba(255,255,255,0.98)';
        header.style.boxShadow = '0 2px 30px rgba(0,0,0,0.15)';
      } else {
        header.style.background = 'rgba(255,255,255,0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
      }
    });
  
    populateToolOrderList();
  
    function showToolContent(toolType) {
      document.querySelectorAll('.tool-content').forEach((c) => (c.style.display = 'none'));
      document.getElementById('default-wip').style.display = 'block';
  
      const show = (id, init) => {
        document.getElementById('default-wip').style.display = 'none';
        document.getElementById(id).style.display = 'block';
        init && init();
      };
  
      if (toolType === 'range-splitting') show('range-splitting-content', initializeRangeSplitter);
      else if (toolType === 'label-preview') show('label-preview-content', initializeLabelPreview);
      else if (toolType === 'range-jumping') show('range-jumping-content', initializeRangeJumping);
      else if (toolType === 'route-mapping') show('route-mapping-content', initializeRouteMapping);
      else if (toolType === 'formatter') show('formatter-content', initializeFormatter);
      else if (toolType === 'sql-search-macro') show('sql-search-macro-content', initializeSqlSearchMacro);
    }
  });
  
(function() {
  'use strict';

  // ==================== CONFIG ====================
  var CONFIG = {
    appName: 'World Cup 2026',
    storageKey: 'mdg_worldcup2026',
    dataUrl: 'data/worldcup-2026.json',
  };

  var KNOCKOUT_ROUNDS = [
    'Round of 32', 'Round of 16', 'Quarter-final',
    'Semi-final', 'Match for third place', 'Final'
  ];

  var FLAGS = {
    'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷',
    'Czech Republic': '🇨🇿', 'Canada': '🇨🇦', 'Bosnia & Herzegovina': '🇧🇦',
    'United States': '🇺🇸', 'USA': '🇺🇸'
  };

  // ==================== STATE ====================
  var state = {
    currentScreen: 'home',
    screenHistory: [],
    activeTab: 'today',
    matches: [],
    data: {},
  };

  var screens = {};

  function collectScreens() {
    document.querySelectorAll('.screen').forEach(function(s) {
      if (s.id) screens[s.id] = s;
    });
  }

  // ==================== NAVIGATION ====================
  function navigateTo(screenId, options) {
    options = options || {};
    var addToHistory = options.addToHistory !== false;
    if (addToHistory && state.currentScreen) {
      state.screenHistory.push(state.currentScreen);
    }
    Object.values(screens).forEach(function(s) { s.classList.add('hidden'); });
    if (screens[screenId]) {
      screens[screenId].classList.remove('hidden');
      state.currentScreen = screenId;
      onScreenEnter(screenId, options);
      focusFirst(screens[screenId]);
    }
  }

  function navigateBack() {
    if (state.screenHistory.length > 0) {
      navigateTo(state.screenHistory.pop(), { addToHistory: false });
    }
  }

  // ==================== FOCUS MANAGEMENT ====================
  function focusFirst(container) {
    var el = container.querySelector('.focusable:not([disabled]):not(.hidden)');
    if (el) el.focus();
  }

  function moveFocus(direction) {
    var container = screens[state.currentScreen];
    if (!container) return;
    var focusables = Array.from(
      container.querySelectorAll('.focusable:not([disabled]):not(.hidden)')
    );
    if (focusables.length === 0) return;
    var current = document.activeElement;
    var idx = focusables.indexOf(current);
    if (idx === -1) { focusFirst(container); return; }
    var nextIdx;
    if (direction === 'up' || direction === 'left') {
      nextIdx = idx > 0 ? idx - 1 : focusables.length - 1;
    } else {
      nextIdx = idx < focusables.length - 1 ? idx + 1 : 0;
    }
    focusables[nextIdx].focus();
    focusables[nextIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // ==================== DATA ====================
  function loadMatches() {
    setStatus('Loading…');
    return fetch(CONFIG.dataUrl)
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(json) {
        var matches = (json.matches || []).slice();
        matches.forEach(function(m, i) { m._id = i; });
        // stable chronological sort by date + time
        matches.sort(function(a, b) {
          if (a.date !== b.date) return a.date < b.date ? -1 : 1;
          return (a.time || '') < (b.time || '') ? -1 : 1;
        });
        state.matches = matches;
        setStatus(matches.length + ' matches');
        return matches;
      })
      .catch(function(err) {
        setStatus('Offline');
        console.error('[Data] load failed', err);
        return [];
      });
  }

  function todayISO() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  // Matches for "today", or — if the tournament hasn't started / is over —
  // the next upcoming matchday, falling back to the very first matches.
  function todaysMatches() {
    var today = todayISO();
    var same = state.matches.filter(function(m) { return m.date === today; });
    if (same.length) return { label: 'Today', matches: same };
    var upcoming = state.matches.filter(function(m) { return m.date >= today; });
    if (upcoming.length) {
      var nextDate = upcoming[0].date;
      return {
        label: 'Next · ' + formatDate(nextDate),
        matches: upcoming.filter(function(m) { return m.date === nextDate; })
      };
    }
    var firstDate = state.matches.length ? state.matches[0].date : null;
    return {
      label: firstDate ? 'Kickoff · ' + formatDate(firstDate) : 'Schedule',
      matches: state.matches.filter(function(m) { return m.date === firstDate; })
    };
  }

  function groups() {
    var seen = {};
    var out = [];
    state.matches.forEach(function(m) {
      var g = m.group;
      if (g && g.indexOf('Group') === 0 && !seen[g]) { seen[g] = true; out.push(g); }
    });
    out.sort();
    return out;
  }

  function knockoutRoundsPresent() {
    return KNOCKOUT_ROUNDS.filter(function(r) {
      return state.matches.some(function(m) { return m.round === r; });
    });
  }

  // ==================== FORMATTING ====================
  function formatDate(iso) {
    var parts = iso.split('-');
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[parseInt(parts[1], 10) - 1] + ' ' + parseInt(parts[2], 10);
  }

  function teamLabel(name) {
    var flag = FLAGS[name];
    return (flag ? flag + ' ' : '') + name;
  }

  // ==================== RENDERING ====================
  function matchItemHTML(m) {
    var badge = m.group && m.group.indexOf('Group') === 0
      ? m.group.replace('Group ', 'Grp ')
      : (m.round || '');
    return '' +
      '<button class="list-item match-item focusable" data-action="match" data-id="' + m._id + '">' +
        '<div class="match-when">' +
          '<div class="match-date">' + formatDate(m.date) + '</div>' +
          '<div class="match-time">' + (m.time || '') + '</div>' +
        '</div>' +
        '<div class="list-item-content">' +
          '<div class="match-teams">' + teamLabel(m.team1) + ' <span class="vs">v</span> ' + teamLabel(m.team2) + '</div>' +
          '<div class="list-item-meta">' + (m.ground || '') + '</div>' +
        '</div>' +
        '<span class="list-item-badge badge-info">' + badge + '</span>' +
      '</button>';
  }

  function navItemHTML(action, dataAttr, value, icon, title, meta) {
    return '' +
      '<button class="list-item focusable" data-action="' + action + '" data-' + dataAttr + '="' + value + '">' +
        '<div class="list-item-icon">' + icon + '</div>' +
        '<div class="list-item-content">' +
          '<div class="list-item-title">' + title + '</div>' +
          '<div class="list-item-meta">' + meta + '</div>' +
        '</div>' +
        '<span class="chevron">&#8250;</span>' +
      '</button>';
  }

  function renderHome() {
    var container = document.getElementById('home-list');
    if (!container) return;
    var html = '';

    if (state.activeTab === 'today') {
      var t = todaysMatches();
      setStatus(t.label);
      if (!t.matches.length) {
        html = '<div class="error-container"><div class="error-message">No matches scheduled.</div></div>';
      } else {
        html = t.matches.map(matchItemHTML).join('');
      }
    } else if (state.activeTab === 'groups') {
      var gs = groups();
      setStatus(gs.length + ' groups');
      html = gs.map(function(g) {
        var n = state.matches.filter(function(m) { return m.group === g; }).length;
        return navItemHTML('group', 'group', g, '⚽', g, n + ' matches');
      }).join('');
    } else if (state.activeTab === 'knockout') {
      var rs = knockoutRoundsPresent();
      setStatus('Knockout stage');
      html = rs.map(function(r) {
        var n = state.matches.filter(function(m) { return m.round === r; }).length;
        var icon = r === 'Final' ? '🏆' : (r === 'Semi-final' ? '🥇' : '🎯');
        return navItemHTML('round', 'round', encodeURIComponent(r), icon, r, n + ' matches');
      }).join('');
    }

    container.innerHTML = html;
  }

  function renderListDetail(title, matches) {
    document.getElementById('list-detail-title').textContent = title;
    var container = document.getElementById('detail-list');
    container.innerHTML = matches.length
      ? matches.map(matchItemHTML).join('')
      : '<div class="error-container"><div class="error-message">No matches.</div></div>';
  }

  function renderMatchDetail(m) {
    document.getElementById('match-detail-title').textContent =
      m.group && m.group.indexOf('Group') === 0 ? m.group : (m.round || 'Match');
    var body = document.getElementById('match-detail-body');
    var stage = (m.round || '') + (m.num ? ' · Match ' + m.num : '');
    body.innerHTML = '' +
      '<div class="card vs-card">' +
        '<div class="vs-team">' + (FLAGS[m.team1] || '⚽') + '<span>' + m.team1 + '</span></div>' +
        '<div class="vs-mid">VS</div>' +
        '<div class="vs-team">' + (FLAGS[m.team2] || '⚽') + '<span>' + m.team2 + '</span></div>' +
      '</div>' +
      detailRow('📅', 'Date', formatDate(m.date) + ', 2026') +
      detailRow('🕐', 'Kickoff', m.time || 'TBD') +
      detailRow('📍', 'Venue', m.ground || 'TBD') +
      detailRow('🏟️', 'Stage', stage);
  }

  function detailRow(icon, label, value) {
    return '' +
      '<div class="card detail-row">' +
        '<div class="list-item-icon">' + icon + '</div>' +
        '<div class="list-item-content">' +
          '<div class="list-item-meta">' + label + '</div>' +
          '<div class="list-item-title">' + value + '</div>' +
        '</div>' +
      '</div>';
  }

  // ==================== ACTIONS ====================
  function handleAction(action, el) {
    switch (action) {
      case 'back':
        navigateBack();
        break;
      case 'tab':
        state.activeTab = el.dataset.tab;
        document.querySelectorAll('#tab-bar .tab-item').forEach(function(t) {
          t.classList.toggle('active', t.dataset.tab === state.activeTab);
        });
        renderHome();
        break;
      case 'group': {
        var g = el.dataset.group;
        var gm = state.matches.filter(function(m) { return m.group === g; });
        navigateTo('list-detail');
        renderListDetail(g, gm);
        focusFirst(screens['list-detail']);
        break;
      }
      case 'round': {
        var r = decodeURIComponent(el.dataset.round);
        var rm = state.matches.filter(function(m) { return m.round === r; });
        navigateTo('list-detail');
        renderListDetail(r, rm);
        focusFirst(screens['list-detail']);
        break;
      }
      case 'match': {
        var m = state.matches[parseInt(el.dataset.id, 10)];
        if (m) {
          navigateTo('match-detail');
          renderMatchDetail(m);
          focusFirst(screens['match-detail']);
        }
        break;
      }
    }
  }

  function onScreenEnter(screenId) {
    if (screenId === 'home') renderHome();
  }

  // ==================== UI HELPERS ====================
  function setStatus(text) {
    var el = document.getElementById('status-indicator');
    if (el) el.textContent = text;
  }

  // ==================== EVENTS ====================
  function setupEvents() {
    document.addEventListener('click', function(e) {
      var el = e.target.closest('[data-action]');
      if (el) handleAction(el.dataset.action, el);
    });

    document.addEventListener('keydown', function(e) {
      switch (e.key) {
        case 'ArrowUp': moveFocus('up'); e.preventDefault(); break;
        case 'ArrowDown': moveFocus('down'); e.preventDefault(); break;
        case 'ArrowLeft': moveFocus('left'); e.preventDefault(); break;
        case 'ArrowRight': moveFocus('right'); e.preventDefault(); break;
        case 'Enter':
          if (document.activeElement && document.activeElement.classList.contains('focusable')) {
            document.activeElement.click();
          }
          e.preventDefault();
          break;
        case 'Escape': navigateBack(); e.preventDefault(); break;
      }
    });
  }

  // ==================== INIT ====================
  function init() {
    collectScreens();
    setupEvents();
    loadMatches().then(function() {
      navigateTo('home', { addToHistory: false });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

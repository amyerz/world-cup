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
    'Algeria':'🇩🇿','Argentina':'🇦🇷','Australia':'🇦🇺','Austria':'🇦🇹','Belgium':'🇧🇪',
    'Bosnia & Herzegovina':'🇧🇦','Brazil':'🇧🇷','Canada':'🇨🇦','Cape Verde':'🇨🇻','Colombia':'🇨🇴',
    'Croatia':'🇭🇷','Curaçao':'🇨🇼','Czech Republic':'🇨🇿','DR Congo':'🇨🇩','Ecuador':'🇪🇨',
    'Egypt':'🇪🇬','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','France':'🇫🇷','Germany':'🇩🇪','Ghana':'🇬🇭','Haiti':'🇭🇹',
    'Iran':'🇮🇷','Iraq':'🇮🇶','Ivory Coast':'🇨🇮','Japan':'🇯🇵','Jordan':'🇯🇴','Mexico':'🇲🇽',
    'Morocco':'🇲🇦','Netherlands':'🇳🇱','New Zealand':'🇳🇿','Norway':'🇳🇴','Panama':'🇵🇦',
    'Paraguay':'🇵🇾','Portugal':'🇵🇹','Qatar':'🇶🇦','Saudi Arabia':'🇸🇦','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'Senegal':'🇸🇳','South Africa':'🇿🇦','South Korea':'🇰🇷','Spain':'🇪🇸','Sweden':'🇸🇪',
    'Switzerland':'🇨🇭','Tunisia':'🇹🇳','Turkey':'🇹🇷','USA':'🇺🇸','Uruguay':'🇺🇾','Uzbekistan':'🇺🇿'
  };

  // ==================== STATE ====================
  var state = {
    currentScreen: 'home',
    screenHistory: [],
    activeTab: 'calendar',
    matches: [],
    teams: [],
    data: { favorites: [], saved: [] },
  };

  var screens = {};

  function collectScreens() {
    document.querySelectorAll('.screen').forEach(function(s) {
      if (s.id) screens[s.id] = s;
    });
  }

  // ==================== PERSISTENCE ====================
  function loadData() {
    try {
      var saved = localStorage.getItem(CONFIG.storageKey);
      if (saved) {
        var d = JSON.parse(saved);
        if (Array.isArray(d.favorites)) state.data.favorites = d.favorites;
        // `saved` = matches manually added to the calendar (migrates old `watch`)
        if (Array.isArray(d.saved)) state.data.saved = d.saved;
        else if (Array.isArray(d.watch)) state.data.saved = d.watch;
      }
    } catch (e) { console.error('[Storage] load', e); }
  }
  function saveData() {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.data)); }
    catch (e) { console.error('[Storage] save', e); }
  }

  function isFav(team) { return state.data.favorites.indexOf(team) !== -1; }
  function toggleFav(team) {
    var i = state.data.favorites.indexOf(team);
    if (i === -1) state.data.favorites.push(team); else state.data.favorites.splice(i, 1);
    saveData();
  }
  function isSaved(id) { return state.data.saved.indexOf(id) !== -1; }
  function toggleSaved(id) {
    var i = state.data.saved.indexOf(id);
    if (i === -1) state.data.saved.push(id); else state.data.saved.splice(i, 1);
    saveData();
  }
  // A match is in the calendar if it features a favorite team OR was added by tap.
  function inCalendar(m) { return isFav(m.team1) || isFav(m.team2) || isSaved(m._id); }

  // ==================== NAVIGATION ====================
  function navigateTo(screenId, options) {
    options = options || {};
    if (options.addToHistory !== false && state.currentScreen) {
      state.screenHistory.push(state.currentScreen);
    }
    Object.values(screens).forEach(function(s) { s.classList.add('hidden'); });
    if (screens[screenId]) {
      screens[screenId].classList.remove('hidden');
      state.currentScreen = screenId;
      onScreenEnter(screenId);
      focusFirst(screens[screenId]);
    }
  }
  function navigateBack() {
    if (state.screenHistory.length > 0) {
      navigateTo(state.screenHistory.pop(), { addToHistory: false });
    }
  }

  // ==================== FOCUS ====================
  function focusFirst(container) {
    var el = container.querySelector('.focusable:not([disabled]):not(.hidden)');
    if (el) el.focus();
  }
  function moveFocus(direction) {
    var container = screens[state.currentScreen];
    if (!container) return;
    var f = Array.from(container.querySelectorAll('.focusable:not([disabled]):not(.hidden)'));
    if (!f.length) return;
    var idx = f.indexOf(document.activeElement);
    if (idx === -1) { focusFirst(container); return; }
    var next = (direction === 'up' || direction === 'left')
      ? (idx > 0 ? idx - 1 : f.length - 1)
      : (idx < f.length - 1 ? idx + 1 : 0);
    f[next].focus();
    f[next].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // ==================== DATA ====================
  function loadMatches() {
    return fetch(CONFIG.dataUrl)
      .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(json) {
        var matches = (json.matches || []).slice();
        matches.forEach(function(m, i) { m._id = i; });
        matches.sort(function(a, b) {
          if (a.date !== b.date) return a.date < b.date ? -1 : 1;
          return (a.time || '') < (b.time || '') ? -1 : 1;
        });
        state.matches = matches;
        var t = {};
        matches.forEach(function(m) {
          if (String(m.group || '').indexOf('Group') === 0) { t[m.team1] = 1; t[m.team2] = 1; }
        });
        state.teams = Object.keys(t).sort();
        return matches;
      })
      .catch(function(e) { console.error('[Data] load', e); return []; });
  }

  function todayISO() {
    var d = new Date(), mm = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  // Calendar = favorite-team matches + any match the user added by tapping.
  function calendarMatches() {
    return state.matches.filter(inCalendar);
  }
  function groups() {
    var seen = {}, out = [];
    state.matches.forEach(function(m) {
      var g = m.group;
      if (g && g.indexOf('Group') === 0 && !seen[g]) { seen[g] = true; out.push(g); }
    });
    return out.sort();
  }
  function knockoutRoundsPresent() {
    return KNOCKOUT_ROUNDS.filter(function(r) {
      return state.matches.some(function(m) { return m.round === r; });
    });
  }

  // ==================== FORMAT ====================
  function formatDate(iso) {
    var p = iso.split('-');
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[parseInt(p[1], 10) - 1] + ' ' + parseInt(p[2], 10);
  }
  function flag(name) { return FLAGS[name] || '⚽'; }
  function teamLabel(name) {
    var star = isFav(name) ? '<span class="star-inline">★</span>' : '';
    return flag(name) + ' ' + name + star;
  }

  // ==================== RENDER: shared ====================
  function matchItemHTML(m) {
    var badge = String(m.group || '').indexOf('Group') === 0
      ? m.group.replace('Group ', 'Grp ') : (m.round || '');
    var added = inCalendar(m);
    var byFav = isFav(m.team1) || isFav(m.team2);
    // Star = in calendar. Locked (no toggle hint) when it's there via a favorite team.
    var star = '<span class="cal-star' + (added ? ' on' : '') + (byFav ? ' locked' : '') + '">' +
               (added ? '★' : '☆') + '</span>';
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
        '<span class="list-item-badge badge-info">' + badge + '</span>' + star +
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

  function emptyState(icon, msg) {
    return '<div class="empty-state"><div class="empty-icon">' + icon + '</div>' +
      '<div class="empty-msg">' + msg + '</div></div>';
  }

  // ==================== RENDER: home tabs ====================
  function renderHome() {
    var c = document.getElementById('home-list');
    if (!c) return;
    var html = '';

    if (state.activeTab === 'calendar') {
      var cm = calendarMatches();
      setStatus(cm.length ? cm.length + ' matches' : '');
      if (!cm.length) {
        html = emptyState('⭐', 'Pick favorite teams in <b>Teams</b> to auto-build your calendar, or tap any match in <b>Groups</b> to add it.');
      } else {
        html = cm.map(matchItemHTML).join('');
      }
    } else if (state.activeTab === 'browse') {
      setStatus('All ' + state.matches.length + ' matches');
      html =
        '<div class="section-label">Groups</div>' +
        groups().map(function(g) {
          var n = state.matches.filter(function(m) { return m.group === g; }).length;
          return navItemHTML('group', 'group', g, '⚽', g, n + ' matches');
        }).join('') +
        '<div class="section-label">Knockout</div>' +
        knockoutRoundsPresent().map(function(r) {
          var n = state.matches.filter(function(m) { return m.round === r; }).length;
          var icon = r === 'Final' ? '🏆' : (r === 'Semi-final' ? '🥇' : '🎯');
          return navItemHTML('round', 'round', encodeURIComponent(r), icon, r, n + ' matches');
        }).join('');
    } else if (state.activeTab === 'teams') {
      var favN = state.data.favorites.length;
      setStatus(favN ? favN + ' selected' : 'Select teams');
      html = state.teams.map(function(t) {
        var on = isFav(t);
        return '' +
          '<button class="list-item team-item focusable' + (on ? ' selected' : '') + '" data-action="fav" data-team="' + encodeURIComponent(t) + '">' +
            '<div class="list-item-icon">' + flag(t) + '</div>' +
            '<div class="list-item-content"><div class="list-item-title">' + t + '</div></div>' +
            '<span class="star-toggle">' + (on ? '★' : '☆') + '</span>' +
          '</button>';
      }).join('');
    }
    c.innerHTML = html;
  }

  // ==================== RENDER: list detail (group / round) ====================
  // Holds the current group/round list so we can re-render in place after a tap.
  var detailCtx = { title: '', matches: [] };

  function renderListDetail(title, matches) {
    detailCtx = { title: title, matches: matches };
    document.getElementById('list-detail-title').textContent = title;
    document.getElementById('detail-list').innerHTML = matches.length
      ? matches.map(matchItemHTML).join('')
      : emptyState('📭', 'No matches.');
  }

  // ==================== ACTIONS ====================
  function handleAction(action, el) {
    switch (action) {
      case 'back': navigateBack(); break;
      case 'tab':
        state.activeTab = el.dataset.tab;
        document.querySelectorAll('#tab-bar .tab-item').forEach(function(t) {
          t.classList.toggle('active', t.dataset.tab === state.activeTab);
        });
        renderHome();
        break;
      case 'group': {
        var g = el.dataset.group;
        navigateTo('list-detail');
        renderListDetail(g, state.matches.filter(function(m) { return m.group === g; }));
        focusFirst(screens['list-detail']);
        break;
      }
      case 'round': {
        var r = decodeURIComponent(el.dataset.round);
        navigateTo('list-detail');
        renderListDetail(r, state.matches.filter(function(m) { return m.round === r; }));
        focusFirst(screens['list-detail']);
        break;
      }
      case 'match': {
        // Tapping a match adds/removes it from the calendar, in place.
        var id = parseInt(el.dataset.id, 10);
        toggleSaved(id);
        if (state.currentScreen === 'list-detail') {
          renderListDetail(detailCtx.title, detailCtx.matches);
        } else {
          renderHome();
        }
        refocusMatch(id);
        break;
      }
      case 'fav': {
        var team = decodeURIComponent(el.dataset.team);
        toggleFav(team);
        renderHome();
        refocusTeam(team);
        break;
      }
    }
  }

  function refocusTeam(team) {
    var el = screens.home.querySelector('[data-team="' + encodeURIComponent(team) + '"]');
    if (el) el.focus();
  }
  function refocusMatch(id) {
    var el = screens[state.currentScreen].querySelector('[data-id="' + id + '"]');
    if (el) el.focus();
  }

  function onScreenEnter(screenId) {
    if (screenId === 'home') renderHome();
  }

  // ==================== UI ====================
  function setStatus(text) {
    var el = document.getElementById('status-indicator');
    if (el) el.textContent = text || '';
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
    loadData();
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

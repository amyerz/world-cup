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
    data: { favorites: [], watch: [] },
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
        if (Array.isArray(d.watch)) state.data.watch = d.watch;
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
  function isWatched(id) { return state.data.watch.indexOf(id) !== -1; }
  function toggleWatch(id) {
    var i = state.data.watch.indexOf(id);
    if (i === -1) state.data.watch.push(id); else state.data.watch.splice(i, 1);
    saveData();
  }

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

  // Matches that include at least one favorite team (group stage, by exact name).
  function calendarMatches() {
    if (!state.data.favorites.length) return [];
    return state.matches.filter(function(m) {
      return isFav(m.team1) || isFav(m.team2);
    });
  }
  function watchMatches() {
    return state.matches.filter(function(m) { return isWatched(m._id); });
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
    var watchPip = isWatched(m._id) ? '<span class="pip-watch">👁</span>' : '';
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
        '<span class="list-item-badge badge-info">' + badge + '</span>' + watchPip +
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
      setStatus(state.data.favorites.length ? cm.length + ' matches' : '');
      if (!state.data.favorites.length) {
        html = emptyState('⭐', 'Pick your favorite teams to auto-build your match calendar. Open the <b>Teams</b> tab to start.');
      } else if (!cm.length) {
        html = emptyState('📅', 'No scheduled matches yet for your teams.');
      } else {
        html = cm.map(matchItemHTML).join('');
      }
    } else if (state.activeTab === 'watch') {
      var wm = watchMatches();
      setStatus(wm.length + ' watching');
      html = wm.length
        ? wm.map(matchItemHTML).join('')
        : emptyState('👁', 'Add key matches between other teams from <b>Browse</b> to track how your group advances.');
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

  // ==================== RENDER: detail ====================
  function renderListDetail(title, matches) {
    document.getElementById('list-detail-title').textContent = title;
    document.getElementById('detail-list').innerHTML = matches.length
      ? matches.map(matchItemHTML).join('')
      : emptyState('📭', 'No matches.');
  }

  function renderMatchDetail(m) {
    document.getElementById('match-detail-title').textContent =
      String(m.group || '').indexOf('Group') === 0 ? m.group : (m.round || 'Match');
    var inCalendar = isFav(m.team1) || isFav(m.team2);
    var stage = (m.round || '') + (m.num ? ' · Match ' + m.num : '');
    var realTeams = FLAGS[m.team1] && FLAGS[m.team2];

    var body = document.getElementById('match-detail-body');
    var html = '' +
      '<div class="card vs-card">' +
        teamBlock(m.team1) +
        '<div class="vs-mid">VS</div>' +
        teamBlock(m.team2) +
      '</div>';

    if (inCalendar) {
      html += '<div class="calendar-flag">📅 In your calendar</div>';
    }

    html +=
      detailRow('📅', 'Date', formatDate(m.date) + ', 2026') +
      detailRow('🕐', 'Kickoff', m.time || 'TBD') +
      detailRow('📍', 'Venue', m.ground || 'TBD') +
      detailRow('🏟️', 'Stage', stage);

    // Actions
    html += '<div class="action-row">';
    if (realTeams) {
      html += '<button class="action-btn focusable" data-action="fav-team1" data-team="' + encodeURIComponent(m.team1) + '">' +
              (isFav(m.team1) ? '★ ' : '☆ ') + m.team1 + '</button>';
      html += '<button class="action-btn focusable" data-action="fav-team2" data-team="' + encodeURIComponent(m.team2) + '">' +
              (isFav(m.team2) ? '★ ' : '☆ ') + m.team2 + '</button>';
    }
    html += '</div>';
    if (!inCalendar) {
      html += '<button class="action-btn wide ' + (isWatched(m._id) ? 'on' : 'primary') + ' focusable" ' +
              'data-action="watch" data-id="' + m._id + '">' +
              (isWatched(m._id) ? '👁 Remove from Watch' : '👁 Add to Watch') + '</button>';
    }
    body.innerHTML = html;
  }

  function teamBlock(name) {
    return '<div class="vs-team"><div class="vs-flag">' + flag(name) + '</div><span>' + name + '</span></div>';
  }
  function detailRow(icon, label, value) {
    return '<div class="card detail-row"><div class="list-item-icon">' + icon + '</div>' +
      '<div class="list-item-content"><div class="list-item-meta">' + label + '</div>' +
      '<div class="list-item-title">' + value + '</div></div></div>';
  }

  // ==================== ACTIONS ====================
  var lastMatchId = null;

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
        var m = state.matches[parseInt(el.dataset.id, 10)];
        if (m) {
          lastMatchId = m._id;
          navigateTo('match-detail');
          renderMatchDetail(m);
          focusFirst(screens['match-detail']);
        }
        break;
      }
      case 'fav': {
        // teams tab toggle — keep focus position
        var team = decodeURIComponent(el.dataset.team);
        toggleFav(team);
        renderHome();
        refocusTeam(team);
        break;
      }
      case 'fav-team1':
      case 'fav-team2': {
        toggleFav(decodeURIComponent(el.dataset.team));
        var cur = state.matches[lastMatchId];
        if (cur) renderMatchDetail(cur);
        focusAction(action);
        break;
      }
      case 'watch': {
        toggleWatch(parseInt(el.dataset.id, 10));
        var cur2 = state.matches[lastMatchId];
        if (cur2) renderMatchDetail(cur2);
        focusAction('watch');
        break;
      }
    }
  }

  function refocusTeam(team) {
    var el = screens.home.querySelector('[data-team="' + encodeURIComponent(team) + '"]');
    if (el) el.focus();
  }
  function focusAction(action) {
    var el = screens['match-detail'].querySelector('[data-action="' + action + '"]');
    if (el) el.focus(); else focusFirst(screens['match-detail']);
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

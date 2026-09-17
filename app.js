(() => {
  'use strict';

  const PATHS = {
    arrow: 'M5 12h14m-6-6 6 6-6 6',
    back: 'm14 6-6 6 6 6',
    chevron: 'm9 5 7 7-7 7',
    check: 'm5 12 4 4L19 6',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    close: 'm6 6 12 12M6 18 18 6',
    med: 'm9 15 6-6M6 18a4.3 4.3 0 0 1 0-6l6-6a4.3 4.3 0 0 1 6 6l-6 6a4.3 4.3 0 0 1-6 0Z',
    clock: 'M12 8v5l3 2|circle:12,12,9',
    sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5|circle:12,12,4',
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
    family: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3a4 4 0 0 1 0 8|circle:9,7,4',
    person: 'M20 21v-2a7 7 0 0 0-14 0v2|circle:13,7,4',
    heart: 'M20 4a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 5 3 11 8 15 5-4 12-10 8-15Z',
    shield: 'M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7ZM8 12l3 3 5-6',
    lock: 'M6 10h12v11H6ZM8 10V6a4 4 0 0 1 8 0v4',
    spark: 'm12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z',
    chart: 'M4 3v17h17M8 15v-4m5 4V6m5 9V9',
    settings: 'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17m10-10 1.4-1.4|circle:12,12,6|circle:12,12,2',
    document: 'M14 2H5v20h14V7ZM14 2v5h5M8 11h8M8 15h8M8 18h5',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z|circle:12,12,3',
    info: 'M12 11v6M12 7v.2|circle:12,12,9',
    wifi: 'M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0M12 20v.1',
    battery: 'M2 7h18v10H2ZM23 10v4M5 10h12v4H5Z',
    signal: 'M3 20v-4m5 4v-8m5 8V8m5 12V4',
    box: 'm3 7 9-5 9 5v11l-9 5-9-5ZM3 7l9 5 9-5M12 12v11M8 4l9 5',
    search: 'm16 16 5 5|circle:10,10,7',
    history: 'M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v6l3 2',
    edit: 'm16 3 5 5-12 12-6 1 1-6ZM13 6l5 5',
    scan: 'M3 8V3h5m8 0h5v5M3 16v5h5m8 0h5v-5M7 8h10M7 12h10M7 16h7'
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  function icon(name, cls = '') {
    const parts = (PATHS[name] || PATHS.info).split('|');
    return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${parts.map((p) => {
      if (p.startsWith('circle:')) {
        const [cx, cy, r] = p.slice(7).split(',');
        return `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
      }
      return `<path d="${p}"/>`;
    }).join('')}</svg>`;
  }

  const MEDS = [
    { id: 'm1', name: 'Metformin', strength: '500 mg', time: '8:00 AM', note: '1 tablet · With food', condition: 'Diabetes care', color: '' },
    { id: 'l1', name: 'Lisinopril', strength: '10 mg', time: '8:00 AM', note: '1 tablet · As prescribed', condition: 'Blood pressure', color: 'blue' },
    { id: 'v1', name: 'Vitamin D3', strength: '2,000 IU', time: '8:00 AM', note: '1 capsule · With food', condition: 'Daily supplement', color: 'peach' },
    { id: 'm2', name: 'Metformin', strength: '500 mg', time: '12:30 PM', note: '1 tablet · With food', condition: 'Diabetes care', color: '' },
    { id: 'a1', name: 'Atorvastatin', strength: '20 mg', time: '9:00 PM', note: '1 tablet · As prescribed', condition: 'Cholesterol care', color: 'blue' }
  ];

  const defaultState = () => ({
    doses: {
      m1: { status: 'unconfirmed' },
      l1: { status: 'unconfirmed' },
      v1: { status: 'taken', time: '8:04 AM', actor: 'Margaret' },
      m2: { status: 'scheduled' },
      a1: { status: 'scheduled' }
    },
    filter: 'condition',
    plan: 'annual',
    subscribed: false,
    reportPeriod: 'week',
    extraMeds: [],
    selectedDose: 'm1',
    medSearch: ''
  });

  const STORAGE = 'medello-ship21-v1';
  let state = defaultState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE));
    if (saved) state = { ...defaultState(), ...saved, doses: { ...defaultState().doses, ...(saved.doses || {}) } };
  } catch (_) {}

  let route = new URLSearchParams(location.search).get('screen') || 'today';
  let homeTime = '8:00 AM';
  let toast = '';
  let sheet = null; // { type: 'dose'|'share'|'add', id? }

  const TAB_ROUTES = new Set(['today', 'medicines', 'family', 'progress', 'settings']);
  const SHIP_ROUTES = new Set([...TAB_ROUTES, 'paywall', 'add', 'manual']);

  function persist() {
    try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch (_) {}
  }

  function go(id) {
    if (id === 'billing') id = 'paywall';
    if (!SHIP_ROUTES.has(id)) {
      notify('Not in 2.1 — preview only.');
      return;
    }
    route = id;
    sheet = null;
    const u = new URL(location.href);
    u.searchParams.set('screen', id);
    history.replaceState(null, '', u);
    render();
    const sc = document.querySelector('.app-content');
    if (sc) sc.scrollTop = 0;
  }

  function notify(msg) {
    toast = msg;
    render();
    setTimeout(() => { if (toast === msg) { toast = ''; render(); } }, 2200);
  }

  function btn(label, action = 'go', value = '', cls = '', ic = '') {
    return `<button class="button ${cls}" data-action="${action}" data-value="${esc(value)}">${ic ? icon(ic) : ''}${label}</button>`;
  }

  function header(title, subtitle = '', right = '') {
    return `<header class="app-header"><div>${subtitle ? `<div class="eyebrow">${subtitle}</div>` : ''}<h1>${title}</h1></div>${right}</header>`;
  }

  function badge(t, cls = '', ic = '') {
    return `<span class="badge ${cls}">${ic ? icon(ic) : ''}${t}</span>`;
  }

  function avatar(who = 'Margaret', cls = '') {
    return `<div class="avatar ${who === 'Alex' ? 'alex ' : ''}${cls}">${who[0]}</div>`;
  }

  function topbar(label, back = 'today', right = '') {
    return `<div class="topline"><button class="icon-button" data-nav="${back}" aria-label="Back">${icon('back')}</button><span>${label}</span>${right || '<span style="width:39px"></span>'}</div>`;
  }

  function section(t) {
    return `<div class="section-title"><h3>${t}</h3></div>`;
  }

  function doseMinutes(time) {
    const m = /^(\d+):(\d+)\s*(AM|PM)$/.exec(time);
    if (!m) return 0;
    return (Number(m[1]) % 12 + (m[3] === 'PM' ? 12 : 0)) * 60 + Number(m[2]);
  }

  function homeGroups() {
    const times = [...new Set(MEDS.map((m) => m.time))].sort((a, b) => doseMinutes(a) - doseMinutes(b));
    return times.map((time) => ({
      time,
      minutes: doseMinutes(time),
      doses: MEDS.filter((m) => m.time === time).map((m) => ({
        ...m,
        record: state.doses[m.id] || { status: 'scheduled' }
      }))
    }));
  }

  function homeTimeline(groups) {
    const hasSkipped = groups.some((g) => g.doses.some((d) => d.record.status === 'skipped'));
    const summary = (g) => {
      const c = { taken: 0, skipped: 0, unconfirmed: 0, scheduled: 0, snoozed: 0 };
      g.doses.forEach((d) => { c[d.record.status] = (c[d.record.status] || 0) + 1; });
      if (c.taken === g.doses.length) return 'Taken';
      if (c.skipped === g.doses.length) return 'Skipped';
      if (c.scheduled === g.doses.length) return 'Upcoming';
      if (c.taken) return `${c.taken}/${g.doses.length} taken`;
      if (c.snoozed) return 'Snoozed';
      if (c.skipped) return `${c.skipped} skipped`;
      return 'Unconfirmed';
    };
    return `<section class="home-timeline" aria-label="Today’s dose timeline">
      <div class="home-timeline-heading"><h2>Today’s timeline</h2><span>${icon('clock')}Now 9:05 AM</span></div>
      <div class="timeline-stops"><div class="timeline-rail" aria-hidden="true"></div>
      ${groups.map((g, i) => {
        const pos = groups.length === 1 ? 50 : 14 + (72 * i) / (groups.length - 1);
        return `<button class="dose-stop" style="--stop:${pos}%" data-action="homeTime" data-value="${g.time}" aria-pressed="${homeTime === g.time}">
          <span class="stop-time">${g.time}</span>
          <span class="stop-markers" aria-hidden="true">${g.doses.map((d) => `<span class="dose-marker ${d.record.status}">${d.record.status === 'taken' ? icon('check') : (d.record.status === 'unconfirmed' || d.record.status === 'snoozed') ? icon('clock') : d.record.status === 'skipped' ? icon('minus') : ''}</span>`).join('')}</span>
          <span class="stop-status">${summary(g)}</span>
        </button>`;
      }).join('')}
      </div>
      <div class="timeline-legend">
        <span><i class="dose-marker taken">${icon('check')}</i>Taken</span>
        <span><i class="dose-marker unconfirmed">${icon('clock')}</i>Unconfirmed</span>
        <span><i class="dose-marker scheduled"></i>Upcoming</span>
        ${hasSkipped ? `<span><i class="dose-marker skipped">${icon('minus')}</i>Skipped</span>` : ''}
      </div>
    </section>`;
  }

  function medRow(m) {
    const s = m.record || state.doses[m.id] || { status: 'scheduled' };
    const statusLabel = s.status === 'taken' ? `Taken · ${esc(s.time)}`
      : s.status === 'unconfirmed' ? 'Not confirmed'
      : s.status === 'skipped' ? 'Recorded as skipped'
      : s.status === 'snoozed' ? `Snoozed · ${esc(s.until || 'later')}`
      : m.time;
    const right = s.status === 'taken'
      ? `<button class="icon-button" data-action="openDose" data-value="${m.id}" aria-label="View ${esc(m.name)} record"><span class="check-done">${icon('check')}</span></button>`
      : s.status === 'scheduled'
        ? `<button class="icon-button" data-action="openDose" data-value="${m.id}" aria-label="View ${esc(m.name)}">${icon('chevron')}</button>`
        : `<button class="log-button" data-action="openDose" data-value="${m.id}">Log</button>`;
    return `<div class="medicine-row">
      <div class="med-icon ${m.color}">${icon('med')}</div>
      <div class="grow">
        <div class="med-name">${esc(m.name)} <span style="font-weight:500">${esc(m.strength)}</span></div>
        <div class="med-detail">${esc(m.note)}</div>
        <div class="dose-status ${s.status}">${icon(s.status === 'taken' ? 'check' : (s.status === 'unconfirmed' || s.status === 'snoozed') ? 'clock' : 'minus')}${statusLabel}</div>
      </div>
      ${right}
    </div>`;
  }

  function todayScreen() {
    const groups = homeGroups();
    const active = groups.find((g) => g.time === homeTime) || groups[0];
    const records = groups.flatMap((g) => g.doses);
    const count = records.filter((d) => d.record.status === 'taken').length;
    const activeUnconfirmed = active.doses.filter((d) => d.record.status === 'unconfirmed' || d.record.status === 'snoozed').length;
    const future = active.doses.every((d) => d.record.status === 'scheduled');
    const skipped = active.doses.filter((d) => d.record.status === 'skipped').length;
    const groupRecorded = active.doses.every((d) => ['taken', 'skipped'].includes(d.record.status));
    const label = active.minutes < 720 ? 'Morning' : active.minutes < 1080 ? 'Midday' : 'Evening';
    const next = groups.find((g) => g.minutes > 545 && g.doses.some((d) => d.record.status === 'scheduled'));

    return {
      content: `<div class="home-surface">${header('Your day.', 'Monday, September 7', `<button class="icon-button" data-nav="settings" aria-label="Margaret’s profile">${avatar()}</button>`)}
        <div class="home-overview">
          <span class="subtle">Good morning, Margaret</span>
          <span class="home-count">${icon('check')}<strong>${count}<span> / ${MEDS.length} taken</span></strong></span>
        </div>
        ${homeTimeline(groups)}
        <section class="home-dose-group" aria-label="${label} medicines at ${active.time}">
          <div class="home-group-heading">
            <div><span class="eyebrow">${label} medicines</span><h2>${active.time}</h2></div>
            ${badge(activeUnconfirmed ? `${activeUnconfirmed} unconfirmed` : future ? 'Upcoming' : skipped ? `${skipped} skipped` : 'Recorded', activeUnconfirmed ? 'amber' : '', activeUnconfirmed ? 'clock' : groupRecorded ? 'check' : '')}
          </div>
          ${activeUnconfirmed
            ? `<div class="home-review-note"><span>Already taken them? Log each dose below.</span></div>`
            : future
              ? '<p class="home-schedule-note">Your reminder follows this saved time.</p>'
              : '<p class="home-schedule-note">Taken times are shown beside each medicine.</p>'}
          <div class="card home-dose-card">${active.doses.map((d) => medRow(d)).join('')}</div>
        </section>
        ${next && next.time !== active.time
          ? `<button class="home-next" data-action="homeTime" data-value="${next.time}"><span class="home-next-icon">${icon('clock')}</span><span class="grow"><span class="micro">Next scheduled dose</span><strong>${next.time} <span>· ${next.doses.map((d) => d.name).join(', ')}</span></strong></span>${icon('chevron')}</button>`
          : ''}
        <div style="margin-top:18px">${btn('Add a medicine', 'openAdd', '', 'secondary', 'plus')}</div>
      </div>`,
      nav: 'Today',
      footer: ''
    };
  }

  function medicineCards() {
    const all = [...MEDS.filter((m) => m.id !== 'm2'), ...state.extraMeds];
    const q = (state.medSearch || '').toLowerCase();
    const filtered = all.filter((m) => (`${m.name} ${m.strength}`).toLowerCase().includes(q));
    if (!filtered.length) {
      return `<div class="card"><h3>No matching medicines.</h3><p class="subtle">Try a different name or add a medicine.</p></div>`;
    }
    if (state.filter === 'condition') {
      const by = {};
      filtered.forEach((m) => {
        const c = m.condition || 'Your routine';
        (by[c] = by[c] || []).push(m);
      });
      return Object.entries(by).map(([cond, list]) => `<div class="card" style="margin-bottom:12px">
        <div class="row between"><h3>${esc(cond)}</h3>${badge('Ongoing')}</div>
        <div class="divider"></div>
        ${list.map((m) => {
          const times = MEDS.filter((x) => x.name === m.name).map((x) => x.time).join(' · ');
          return `<button class="setting-row" data-action="noop" data-value="${m.id}">
            <div class="med-icon ${m.color || ''}">${icon('med')}</div>
            <div class="grow"><div class="med-name">${esc(m.name)} <span style="font-weight:500">${esc(m.strength)}</span></div>
            <div class="med-detail">${esc(times || m.time)}</div></div>${icon('chevron')}
          </button>`;
        }).join('')}
      </div>`).join('');
    }
    return filtered.map((m) => `<div class="card" style="margin-bottom:10px">
      <button class="setting-row" data-action="noop" data-value="${m.id}">
        <div class="med-icon ${m.color || ''}">${icon('med')}</div>
        <div class="grow"><div class="med-name">${esc(m.name)} <span style="font-weight:500">${esc(m.strength)}</span></div>
        <div class="med-detail">${esc(m.time)}</div></div>${icon('chevron')}
      </button>
    </div>`).join('');
  }

  function medsScreen() {
    return {
      content: header('Your medicines.', 'Made for your routine', `<button class="icon-button soft" data-action="openAdd" aria-label="Add a medicine">${icon('plus')}</button>`)
        + `<div class="searchbox">${icon('search')}<input class="input" id="medicine-search" placeholder="Find a medicine" aria-label="Find a medicine" value="${esc(state.medSearch)}"></div>
        <div class="tabstrip">
          <button class="${state.filter === 'condition' ? 'active' : ''}" data-action="medfilter" data-value="condition">By condition</button>
          <button class="${state.filter === 'all' ? 'active' : ''}" data-action="medfilter" data-value="all">All medicines</button>
        </div>
        <div id="medicine-results">${medicineCards()}</div>
        ${btn('Add a medicine', 'openAdd', '', 'secondary', 'plus')}`,
      nav: 'Meds',
      footer: ''
    };
  }

  function familyScreen() {
    return {
      content: header('Your people.', 'Family & caregivers', `<button class="icon-button soft" data-action="oos" data-value="invite" aria-label="Add">${icon('plus')}</button>`)
        + `<p class="subtle">A little support. On your terms.</p>
        <div class="card green">
          <div class="row">${avatar('Alex', 'large')}<div class="grow"><h2 style="margin:0 0 3px">Alex</h2><span class="subtle">Your son · Connected</span></div>${icon('shield')}</div>
          <div class="divider" style="background:#3a5e4d"></div>
          <div class="row between"><span style="font-size:14px">When a dose isn’t confirmed</span><strong>60 min</strong></div>
          <p class="micro" style="margin-top:9px">Quiet hours: 10 PM – 7 AM</p>
        </div>
        <div class="card">
          <button class="setting-row" data-action="openShare" data-value="see">${icon('eye')}<span>What Alex can see</span><span class="end">Review${icon('chevron')}</span></button>
          <button class="setting-row" data-action="openShare" data-value="rules">${icon('bell')}<span>Check-in rules</span><span class="end">60 min${icon('chevron')}</span></button>
          <button class="setting-row" data-action="openShare" data-value="activity">${icon('history')}<span>Shared activity</span><span class="end">${icon('chevron')}</span></button>
          <button class="setting-row" data-action="openShare" data-value="privacy">${icon('lock')}<span>Privacy & access</span><span class="end">${icon('chevron')}</span></button>
        </div>
        <div class="card soft"><h3>You stay in control.</h3><p>AI conversations and private notes are not shared with Alex.</p></div>
        <div style="margin-top:14px"><span class="oos-pill">Not in 2.1</span>
          <p class="micro" style="margin-top:8px">Full caregiver invite, consent scopes, escalation, and live sync are out of this App Store review build.</p>
        </div>`,
      nav: 'Family',
      footer: ''
    };
  }

  function progressScreen() {
    const week = state.reportPeriod === 'week';
    return {
      content: header('Your week.', 'Small routines, clearer patterns', `<button class="icon-button soft" data-action="noop" aria-label="Open report">${icon('document')}</button>`)
        + `<div class="tabstrip">
          <button class="${week ? 'active' : ''}" data-action="period" data-value="week">This week</button>
          <button class="${!week ? 'active' : ''}" data-action="period" data-value="month">This month</button>
        </div>
        <div class="card">
          <div class="row between"><div>
            <div class="eyebrow">${week ? 'Aug 31 – Sep 6' : 'August 2026'}</div>
            <h2>${week ? '29 of 35' : '128 of 155'}</h2>
            <span class="subtle">doses recorded as taken</span>
          </div>${badge('Logged history')}</div>
          <div class="week-chart">${[80, 100, 60, 100, 80, 80, 80].map((v, i) => `<div class="week-column ${i === 6 ? 'current' : ''}"><i style="height:${v}%"></i><span>${['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span></div>`).join('')}</div>
          <div class="legend"><span><i></i>Recorded as taken</span><span><i class="dark"></i>Sunday</span></div>
        </div>
        <div class="metric-grid">
          <div class="metric"><strong>${week ? '2' : '8'}</strong><span>Recorded as skipped</span></div>
          <div class="metric"><strong>${week ? '4' : '19'}</strong><span>Still unconfirmed</span></div>
        </div>
        <div class="card soft" style="margin-top:14px">
          <div class="row">${icon('sun')}<h3 style="margin:0">A pattern to look at</h3></div>
          <p>3 of last week’s 4 unconfirmed entries were in the morning. Would an easier logging routine help?</p>
        </div>`,
      nav: 'Progress',
      footer: ''
    };
  }

  function settingsScreen() {
    return {
      content: header('Your settings.', 'Just the way you need it')
        + `<div class="card"><div class="row">${avatar('Margaret')}<div class="grow"><h3>Margaret</h3><span class="subtle" style="font-size:13px">Personal account</span></div>${badge(state.subscribed ? 'Premium' : 'Personal')}</div></div>
        ${section('Everyday care')}
        <div class="card">
          <button class="setting-row" data-action="noop">${icon('bell')}<span>Reminders</span><span class="end">On${icon('chevron')}</span></button>
          <button class="setting-row" data-nav="family">${icon('family')}<span>Family & caregivers</span><span class="end">Alex connected${icon('chevron')}</span></button>
          <button class="setting-row" data-action="oos" data-value="assistant">${icon('spark')}<span>Ask Medello</span><span class="end">${icon('chevron')}</span></button>
          <button class="setting-row" data-action="oos" data-value="refill">${icon('box')}<span>Refill planning</span><span class="end">${icon('chevron')}</span></button>
        </div>
        ${section('Account & privacy')}
        <div class="card">
          <button class="setting-row" data-action="oos" data-value="profile">${icon('person')}<span>Profile & time zone</span><span class="end">${icon('chevron')}</span></button>
          <button class="setting-row" data-action="oos" data-value="privacy">${icon('lock')}<span>Data & sharing</span><span class="end">${icon('chevron')}</span></button>
          <button class="setting-row" data-nav="paywall">${icon('heart')}<span>Medello Premium</span><span class="end">${state.subscribed ? 'Active' : 'Explore'}${icon('chevron')}</span></button>
        </div>
        <p class="micro center" style="margin-top:24px">Medello · Designed around your everyday</p>`,
      nav: 'Settings',
      footer: ''
    };
  }

  function paywallScreen() {
    return {
      content: topbar('Medello Premium', 'settings')
        + `<div class="center" style="padding-top:8px">
          <div class="icon-feature">${icon('heart')}</div>
          <div class="premium-mark">Medello Premium</div>
          <h1 style="margin-top:6px">Care, clarified.</h1>
          <p class="subtle">Reminders, history, and calm routines — when you want a little more.</p>
        </div>
        <ul class="check-list">
          <li>${icon('check')}Clearer dose history and week patterns</li>
          <li>${icon('check')}Appointment-ready summaries</li>
          <li>${icon('check')}Refill planning estimates</li>
          <li>${icon('check')}Priority product updates</li>
        </ul>
        <div class="button-row" style="margin-top:26px">
          <button class="price-choice ${state.plan === 'monthly' ? 'selected' : ''}" data-action="plan" data-value="monthly"><span>Monthly</span><strong>$6.99</strong><span>per month</span></button>
          <button class="price-choice ${state.plan === 'annual' ? 'selected' : ''}" data-action="plan" data-value="annual">${badge('Save 40%')}<span>Yearly</span><strong>$49.99</strong><span>per year · $4.17/mo</span></button>
        </div>
        <div class="paywall-legal">
          <a href="https://getmedello.com/terms" target="_blank" rel="noopener">Terms</a>
          <a href="https://getmedello.com/privacy" target="_blank" rel="noopener">Privacy</a>
          <a href="#" data-action="restore">Restore</a>
        </div>
        <p class="micro center" style="margin-top:14px">Design preview only. No payment starts in this prototype.</p>`,
      nav: '',
      footer: btn('Continue', 'subscribe', '', '', 'heart')
        + `<p class="micro">Proposed offer: then ${state.plan === 'annual' ? '$49.99/year' : '$6.99/month'}. Auto-renews until cancelled.</p>`
    };
  }

  function addScreen() {
    return {
      content: topbar('Add a medicine', 'medicines')
        + header('Let’s add your<br>next medicine.')
        + `<p class="subtle">Choose what’s easiest. You’ll review every detail before saving.</p>
        <button class="card green" style="width:100%;text-align:left;padding:24px" data-action="oos" data-value="scan">
          <div class="row between">${icon('scan')}${icon('arrow')}</div>
          <h2>Scan a prescription</h2>
          <p class="subtle">Start with a photo or screenshot. <span class="oos-pill">Not in 2.1</span></p>
        </button>
        <div class="medicine-grid" style="margin-top:14px">
          <button class="option" data-nav="manual">${icon('edit')}<span class="grow"><strong>Enter manually</strong><p>Name, strength and timing.</p></span>${icon('chevron')}</button>
        </div>
        <div class="card soft" style="margin-top:23px"><div class="row">${icon('eye')}<strong>You stay in control.</strong></div><p>Nothing is scheduled automatically in this preview.</p></div>`,
      nav: '',
      footer: ''
    };
  }

  function manualScreen() {
    return {
      content: topbar('Add medicine', 'add')
        + header('Your medicine details.')
        + `<p class="subtle">Copy the details from your prescription or medicine label.</p>
        <div class="form-group"><label for="med-name">Medicine name</label><input class="input" id="med-name" placeholder="e.g. Metformin"></div>
        <div class="form-group"><label for="med-strength">Strength</label><input class="input" id="med-strength" placeholder="e.g. 500 mg"></div>
        <div class="form-group"><label for="med-time">Reminder time</label><input class="input" id="med-time" type="time" value="08:00"></div>
        <div class="card soft"><p class="micro">Demo only — saves a sample entry in this browser session.</p></div>`,
      nav: '',
      footer: btn('Save medicine', 'saveMed', '', '', 'check')
    };
  }

  function screenPack() {
    switch (route) {
      case 'today': return todayScreen();
      case 'medicines': return medsScreen();
      case 'family': return familyScreen();
      case 'progress': return progressScreen();
      case 'settings': return settingsScreen();
      case 'paywall': return paywallScreen();
      case 'add': return addScreen();
      case 'manual': return manualScreen();
      default: return todayScreen();
    }
  }

  function tabBar(active) {
    if (!active) return '';
    const items = [
      ['Today', 'sun', 'today'],
      ['Meds', 'med', 'medicines'],
      ['Family', 'family', 'family'],
      ['Progress', 'chart', 'progress'],
      ['Settings', 'settings', 'settings']
    ];
    return `<nav class="app-nav" aria-label="App navigation">${items.map(([label, ic, to]) =>
      `<button class="nav-item ${label === active ? 'active' : ''}" data-nav="${to}"><span class="nav-icon">${icon(ic)}</span>${label}</button>`
    ).join('')}</nav>`;
  }

  function doseSheet() {
    const m = MEDS.find((x) => x.id === state.selectedDose) || MEDS[0];
    const s = state.doses[m.id] || { status: 'scheduled' };
    return `<div class="sheet-scrim" data-action="closeSheet">
      <div class="sheet" role="dialog" aria-label="Log dose">
        <div class="sheet-handle"></div>
        <div class="row" style="gap:12px">
          <div class="med-icon ${m.color}">${icon('med')}</div>
          <div class="grow">
            <div class="eyebrow">Dose log</div>
            <h2 style="margin:0">${esc(m.name)} ${esc(m.strength)}</h2>
            <p class="subtle" style="margin:4px 0 0">Scheduled ${m.time}</p>
          </div>
          <button class="icon-button" data-action="closeSheet" aria-label="Close">${icon('close')}</button>
        </div>
        <p class="subtle" style="margin-top:14px">Status: <strong>${esc(s.status)}</strong>${s.time ? ` · ${esc(s.time)}` : ''}</p>
        <div class="sheet-actions">
          ${btn('Taken', 'doseTaken', m.id, '', 'check')}
          ${btn('Snooze 15 min', 'doseSnooze', m.id, 'snooze', 'clock')}
          ${btn('Skip', 'doseSkip', m.id, 'skip', 'minus')}
          ${btn('Cancel', 'closeSheet', '', 'outline')}
        </div>
      </div>
    </div>`;
  }

  function shareSheet() {
    const titles = {
      see: 'What Alex can see',
      rules: 'Check-in rules',
      activity: 'Shared activity',
      privacy: 'Privacy & access'
    };
    const title = titles[sheet.id] || 'Share settings';
    return `<div class="sheet-scrim" data-action="closeSheet">
      <div class="sheet" role="dialog" aria-label="${esc(title)}">
        <div class="sheet-handle"></div>
        <div class="row between">
          <h2 style="margin:0">${esc(title)}</h2>
          <button class="icon-button" data-action="closeSheet" aria-label="Close">${icon('close')}</button>
        </div>
        <p class="subtle" style="margin-top:10px">One-time share sheet mock for App Store 2.1 review.</p>
        <div class="card soft" style="margin-top:14px">
          <div class="row">${icon('shield')}<strong>Stub only</strong></div>
          <p>Invite flows, consent scopes, escalation timing, and live caregiver sync are <strong>Not in 2.1</strong>.</p>
        </div>
        <div class="card" style="margin-top:12px">
          <div class="row between"><span>Alex</span><strong>Connected</strong></div>
          <div class="divider"></div>
          <div class="row between"><span>Dose status</span><strong>Shared</strong></div>
          <div class="row between" style="margin-top:10px"><span>Private notes</span><strong>Not shared</strong></div>
        </div>
        ${btn('Done', 'closeSheet', '', '', 'check')}
      </div>
    </div>`;
  }

  function addSheet() {
    return `<div class="sheet-scrim" data-action="closeSheet">
      <div class="sheet" role="dialog" aria-label="Add medicine">
        <div class="sheet-handle"></div>
        <div class="row between"><h2 style="margin:0">Add a medicine</h2>
          <button class="icon-button" data-action="closeSheet" aria-label="Close">${icon('close')}</button>
        </div>
        <p class="subtle" style="margin-top:8px">Quick path from Today or Meds.</p>
        <div class="sheet-actions">
          ${btn('Enter manually', 'go', 'manual', '', 'edit')}
          ${btn('Open full add flow', 'go', 'add', 'secondary', 'plus')}
          ${btn('Cancel', 'closeSheet', '', 'outline')}
        </div>
      </div>
    </div>`;
  }

  function render() {
    if (!SHIP_ROUTES.has(route)) route = 'today';
    const pack = screenPack();
    document.getElementById('root').innerHTML = `
      <div class="ship-stage">
        <div class="ship-toolbar">
          <div>
            <h1>Medello 2.1</h1>
            <p class="subtle">App Store review · Patient chrome</p>
          </div>
          <div class="ship-actions">
            <button class="button secondary" data-action="reset">Reset sample day</button>
          </div>
        </div>
        <div class="ship-device">
          <div class="phone" data-screen="${route}">
            <div class="statusbar"><span>9:05</span><div class="island"></div><div class="status-icons">${icon('signal')}${icon('wifi')}${icon('battery')}</div></div>
            <div class="app-content">${pack.content}</div>
            ${pack.footer ? `<div class="app-footer">${pack.footer}</div>` : ''}
            ${tabBar(pack.nav)}
            <div class="home-bar"></div>
            ${toast ? `<div class="toast"><span>${esc(toast)}</span></div>` : ''}
            ${sheet && sheet.type === 'dose' ? doseSheet() : ''}
            ${sheet && sheet.type === 'share' ? shareSheet() : ''}
            ${sheet && sheet.type === 'add' ? addSheet() : ''}
          </div>
        </div>
        <div class="ship-note">
          <strong>In scope:</strong> Today · Meds · Family stub · Progress · Settings · Add medicine · Premium paywall.
          <br><strong>Out of scope:</strong> caregiver invite/consent/escalation/dashboard, Family Plus beyond Premium, full onboarding.
        </div>
      </div>`;
  }

  function nowLabel() { return '9:12 AM'; }

  document.addEventListener('input', (e) => {
    if (e.target.id === 'medicine-search') {
      state.medSearch = e.target.value;
      const el = document.getElementById('medicine-results');
      if (el) el.innerHTML = medicineCards();
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList && e.target.classList.contains('sheet-scrim')) {
      sheet = null;
      render();
      return;
    }
    const el = e.target.closest('button, [data-action="closeSheet"], a[data-action]');
    if (!el) return;
    if (el.dataset.nav) { go(el.dataset.nav); return; }
    const a = el.dataset.action;
    const v = el.dataset.value;
    if (!a) return;
    switch (a) {
      case 'go': go(v); break;
      case 'reset':
        homeTime = '8:00 AM';
        state = defaultState();
        persist();
        go('today');
        notify('Sample day restored.');
        break;
      case 'homeTime':
        if (MEDS.some((m) => m.time === v)) { homeTime = v; render(); }
        break;
      case 'openDose':
        state.selectedDose = v;
        sheet = { type: 'dose', id: v };
        render();
        break;
      case 'closeSheet':
        sheet = null;
        render();
        break;
      case 'doseTaken':
        state.doses[v] = { status: 'taken', time: nowLabel(), actor: 'Margaret' };
        persist();
        sheet = null;
        render();
        notify('Recorded as taken.');
        break;
      case 'doseSnooze':
        state.doses[v] = { status: 'snoozed', until: '9:20 AM' };
        persist();
        sheet = null;
        render();
        notify('Snoozed for 15 minutes.');
        break;
      case 'doseSkip':
        state.doses[v] = { status: 'skipped', actor: 'Margaret', reason: 'Prefer not to say' };
        persist();
        sheet = null;
        render();
        notify('Recorded as skipped.');
        break;
      case 'openShare':
        sheet = { type: 'share', id: v };
        render();
        break;
      case 'openAdd':
        sheet = { type: 'add' };
        render();
        break;
      case 'medfilter':
        state.filter = v;
        persist();
        render();
        break;
      case 'period':
        state.reportPeriod = v;
        persist();
        render();
        break;
      case 'plan':
        state.plan = v;
        persist();
        render();
        break;
      case 'subscribe':
        state.subscribed = true;
        persist();
        go('settings');
        notify('Premium preview activated (demo).');
        break;
      case 'restore':
        e.preventDefault();
        notify('No purchases to restore in this demo.');
        break;
      case 'saveMed': {
        const name = document.getElementById('med-name')?.value?.trim() || 'Medicine A';
        const strength = document.getElementById('med-strength')?.value?.trim() || '10 mg';
        const timeVal = document.getElementById('med-time')?.value || '08:00';
        const [hh, mm] = timeVal.split(':').map(Number);
        const ampm = hh >= 12 ? 'PM' : 'AM';
        const h12 = ((hh + 11) % 12) + 1;
        const time = `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;
        state.extraMeds.push({
          id: `x${Date.now()}`, name, strength, time, note: '1 · As entered', condition: 'Your routine', color: ''
        });
        persist();
        go('medicines');
        notify(`${name} added (demo).`);
        break;
      }
      case 'oos':
        notify('Not in 2.1 — preview only.');
        break;
      case 'noop':
        break;
      default:
        break;
    }
  });

  if (!SHIP_ROUTES.has(route)) route = 'today';
  render();
})();

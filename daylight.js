/* Medello Daylight interactive prototype.
   Sample day from the old phones. Ask / Tell AI replies are placeholder copy, not a model. */
(function () {
  "use strict";

  var phone = document.getElementById("phone");
  var screen = document.getElementById("screen");
  var sheet = document.getElementById("sheet");
  var scrim = document.getElementById("scrim");
  var overlay = document.getElementById("overlay");
  var toastEl = document.getElementById("toast");
  var fab = document.getElementById("fab");

  var MEDS = [
    {
      id: "amox",
      condition: "Sinus infection",
      who: "Dr. Okafor · 5-day course",
      badge: "2 days left",
      tone: "teal",
      name: "Amoxicillin 500 mg",
      times: "8:20 AM · 8:00 PM",
      pill: "cap",
      about: {
        does: "Amoxicillin is an antibiotic used here for a short sinus course. This is sample copy, not medical advice.",
        how: "The sample schedule is twice a day, after meals, through day 5. Finish the course unless a clinician says otherwise.",
        sides: "Stomach upset is the note people mention most. Contact a clinician for rash, swelling, or trouble breathing.",
        know: "4 tablets left in this sample. At two a day, that runs out Thursday."
      }
    },
    {
      id: "met",
      condition: "Diabetes care",
      who: "Dr. Whitfield · since July",
      badge: "On track",
      tone: "mint",
      name: "Metformin 500 mg",
      times: "8:00 AM · 1:00 PM",
      pill: "round white",
      about: {
        does: "Metformin helps lower blood sugar. On this sample day the next tablet is with lunch.",
        how: "1 tablet with food. The card says Glucophage, 28 left, refill Aug 24.",
        sides: "Some people feel queasy if they take it without food. This preview does not personalize side effects.",
        know: "Morning metformin is already marked taken. Lunch is the dose on Today."
      }
    },
    {
      id: "lis",
      condition: "Blood pressure",
      who: "Dr. Whitfield · since July",
      badge: "Check dose",
      tone: "warn",
      name: "Lisinopril 10 mg",
      times: "8:00 AM",
      pill: "diamond",
      about: {
        does: "Lisinopril is a blood-pressure medicine in this sample regimen.",
        how: "Once each morning. Today’s 8:00 AM dose is already in the taken cluster.",
        sides: "A dry cough is a commonly described effect. This sheet is placeholder text only.",
        know: "The Check dose badge is the old-phone status — it does not mean a live alert."
      }
    },
    {
      id: "ator",
      condition: "Cholesterol",
      who: "Atorvastatin 20 mg",
      badge: "On track",
      tone: "mint",
      name: "Atorvastatin 20 mg",
      times: "9:00 PM",
      pill: "round",
      about: {
        does: "Atorvastatin lowers cholesterol. In this sample it sits after dinner.",
        how: "One tablet in the evening. Progress notes the 9 PM slot was the one that slipped.",
        sides: "Muscle aches are the effect people are usually told to mention to a clinician.",
        know: "Moving it to 7:30 PM with dinner is the insight on Progress — still sample data."
      }
    }
  ];

  var state = {
    tab: "today",
    medView: "cond",
    nextTaken: false,
    nextSkipped: false,
    snooze: 0,
    later: { amox: false, ator: false },
    atorTime: "9:00 PM",
    atorSub: "after dinner",
    moved: false,
    refill: true,
    notif: true,
    meals: { Breakfast: "7:30 AM", Lunch: "12:30 PM", Dinner: "7:30 PM" },
    mealEdit: "Breakfast",
    sheet: null,
    askId: "",
    askLog: [],
    plan: "year",
    overlay: null,
    manual: { name: "", strength: "500 mg", time: "8:00 AM" }
  };

  var holdTimer = null;
  var holding = false;
  var scanTimer = null;
  var toastTimer = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2200);
  }

  function takenCount() {
    var n = 3;
    if (state.nextTaken) n += 1;
    if (state.later.amox) n += 1;
    if (state.later.ator) n += 1;
    return n;
  }

  function nextClock() {
    var mins = 13 * 60 + state.snooze * 15;
    var h24 = Math.floor(mins / 60);
    var m = mins % 60;
    var ap = h24 >= 12 ? "PM" : "AM";
    var h = h24 % 12 || 12;
    return { hm: h + ":" + String(m).padStart(2, "0"), ap: ap };
  }

  function nextUpLine() {
    if (!state.later.amox) return "Next up: Amoxicillin at 8:00 PM";
    if (!state.later.ator) return "Next up: Atorvastatin at " + state.atorTime;
    return "Nothing else scheduled today.";
  }

  function pillHTML(kind) {
    if (kind === "cap") return '<span class="pill" aria-hidden="true"><i class="cap"></i></span>';
    if (kind === "diamond") return '<span class="pill" aria-hidden="true"><i class="diamond"></i></span>';
    if (kind === "round white") return '<span class="pill" aria-hidden="true"><i class="round white"></i></span>';
    return '<span class="pill" aria-hidden="true"><i class="round"></i></span>';
  }

  function sparkBtn(id) {
    return '<button class="spark" type="button" data-act="ask" data-arg="' + esc(id) + '" aria-label="Ask about this medicine">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 2.6 13.4 8a2.4 2.4 0 0 0 1.6 1.6L20.4 11l-5.4 1.4a2.4 2.4 0 0 0-1.6 1.6L12 19.4l-1.4-5.4a2.4 2.4 0 0 0-1.6-1.6L3.6 11l5.4-1.4A2.4 2.4 0 0 0 10.6 8L12 2.6z"/></svg></button>';
  }

  function findMed(id) {
    for (var i = 0; i < MEDS.length; i++) if (MEDS[i].id === id) return MEDS[i];
    return null;
  }

  function arcY(pct) {
    var t = pct / 100;
    return 54 - 44 * (4 * t * (1 - t));
  }

  function horizon() {
    var pts = [
      { x: 8, taken: true },
      { x: 16, taken: true },
      { x: 24, taken: true },
      { x: 40, next: true, taken: state.nextTaken, skip: state.nextSkipped && !state.nextTaken },
      { x: 74, taken: state.later.amox },
      { x: 86, taken: state.later.ator }
    ];
    var now = 34;
    var d = "";
    for (var i = 0; i <= 24; i++) {
      var p = now * i / 24;
      d += (i ? " L" : "M") + (p / 100 * 340).toFixed(1) + " " + arcY(p).toFixed(1);
    }
    var dots = pts.map(function (p) {
      var cls = "arc-dot";
      if (p.taken) cls += " is-taken";
      else if (p.next && p.skip) cls += " is-skip";
      else if (p.next) cls += " is-next";
      var y = (arcY(p.x) / 72 * 100);
      return '<i class="' + cls + '" style="left:' + p.x + '%;top:' + y.toFixed(1) + '%"></i>';
    }).join("");
    var sunY = (arcY(now) / 72 * 100);
    return (
      '<div class="arc-wrap">' +
        '<svg viewBox="0 0 340 72" preserveAspectRatio="none" aria-hidden="true">' +
          '<path d="M0 54 Q85 12 170 12 T340 54 L340 72 L0 72 Z" fill="rgba(226,196,150,0.28)"></path>' +
          '<path d="M0 54 Q85 12 170 12 T340 54" fill="none" stroke="#D3DDD1" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>' +
          '<path d="' + d + '" fill="none" stroke="#3E8578" stroke-width="2.5" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>' +
        '</svg>' +
        '<i class="arc-sun" style="left:' + now + '%;top:' + sunY.toFixed(1) + '%"></i>' +
        dots +
      '</div>' +
      '<div class="arc-scale"><span>6 AM</span><span>NOON</span><span>11 PM</span></div>'
    );
  }

  function renderToday() {
    var n = takenCount();
    var clock = nextClock();
    var kicker = state.snooze && !state.nextTaken && !state.nextSkipped
      ? "Snoozed · with lunch"
      : "Next · with lunch";
    var hero;
    if (state.nextTaken) {
      hero = '<section class="taken-card" aria-live="polite">' +
        '<div class="taken-mark" aria-hidden="true">✓</div>' +
        '<h2 class="taken-title">Lunch dose taken. <em>Rest easy.</em></h2>' +
        '<p class="taken-sub">' + esc(nextUpLine()) + '</p></section>';
    } else if (state.nextSkipped) {
      hero = '<section class="skip-card" aria-live="polite">' +
        '<h3>Lunch dose skipped</h3>' +
        '<p>Still unconfirmed — you can mark it taken, or leave it skipped.</p>' +
        '<button class="cta" type="button" data-act="mark-taken">Mark taken</button></section>';
    } else {
      hero = '<section class="card next-card">' +
        '<div class="next-kicker"><i class="pulse" aria-hidden="true"></i>' + esc(kicker) + '</div>' +
        '<p class="dose-time">' + esc(clock.hm) + ' <small>' + esc(clock.ap) + '</small></p>' +
        '<h2 class="dose-name">Metformin 500 mg</h2>' +
        '<p class="dose-sub">1 tablet · Glucophage · 28 left · refill Aug 24</p>' +
        '<button class="hold" type="button" data-hold aria-label="Hold to take Metformin">' +
          '<span class="hold-fill" aria-hidden="true"></span>' +
          '<span class="hold-label" data-hold-label>Hold to take</span>' +
        '</button>' +
        '<div class="next-links">' +
          '<button class="linkish" type="button" data-act="snooze">Snooze 15 min</button>' +
          '<button class="linkish is-acc" type="button" data-act="reminder">Preview reminder ›</button>' +
        '</div></section>';
    }
    var later = [
      { id: "amox", time: "8:00 PM", name: "Amoxicillin 500 mg", sub: "after dinner · day 3 of 5", pill: "cap" },
      { id: "ator", time: state.atorTime, name: "Atorvastatin 20 mg", sub: state.atorSub, pill: "round" }
    ].map(function (d) {
      var on = state.later[d.id];
      return '<button class="later-row' + (on ? " is-taken" : "") + '" type="button" data-act="later" data-arg="' + d.id + '" aria-pressed="' + (on ? "true" : "false") + '">' +
        '<span class="later-time">' + esc(d.time) + '</span>' +
        pillHTML(d.pill) +
        '<span class="later-copy"><span class="later-name">' + esc(d.name) + '</span><span class="later-sub">' + esc(d.sub) + '</span></span>' +
        '<span class="check" aria-hidden="true">' + (on ? "✓" : "") + '</span></button>';
    }).join("");

    screen.innerHTML =
      '<p class="eyebrow">Tuesday · August 11</p>' +
      '<h1 class="h-serif">Good morning,<br><em>Margaret.</em></h1>' +
      '<section class="day-card"><div class="day-card-head"><span class="eyebrow">Your day</span><span class="day-count">' + n + ' of 6 taken</span></div>' +
      horizon() + '</section>' +
      hero +
      '<h2 class="section-label">Later today</h2>' +
      '<div class="with-fab">' + later +
      '<h2 class="section-label">Earlier</h2>' +
      '<div class="earlier"><span class="earlier-time">8:00 AM</span><span class="earlier-name">Lisinopril · Vitamin D3 · Metformin</span><span class="mini-check" aria-label="Taken">✓</span></div></div>';
  }

  function renderMeds() {
    var body;
    if (state.medView === "all") {
      body = '<div class="card flat">' + MEDS.map(function (m) {
        return '<div class="flat-row">' + pillHTML(m.pill) +
          '<span><strong>' + esc(m.name) + '</strong><span>' + esc(m.times) + ' · ' + esc(m.condition) + '</span></span>' +
          sparkBtn(m.id) + '</div>';
      }).join("") + '</div>' +
        '<p class="hint">Standalone medicines live here too — a condition group is optional.</p>';
    } else {
      body = MEDS.map(function (m) {
        return '<article class="card cond">' +
          '<div class="cond-top"><div><h3>' + esc(m.condition) + '</h3><p class="who">' + esc(m.who) + '</p></div>' +
          '<span class="badge ' + m.tone + '">' + esc(m.badge) + '</span></div>' +
          '<div class="med-line">' + pillHTML(m.pill) +
          '<span><strong>' + esc(m.name) + '</strong><span>' + esc(m.times) + '</span></span>' +
          sparkBtn(m.id) + '</div></article>';
      }).join("");
    }
    screen.innerHTML =
      '<div class="meds-head"><h1 class="screen-title">Medicines</h1>' +
      '<button class="add-chip" type="button" data-act="add">+ Add</button></div>' +
      '<div class="seg" role="tablist">' +
        '<button type="button" role="tab" data-act="medview" data-arg="cond" class="' + (state.medView === "cond" ? "is-on" : "") + '" aria-selected="' + (state.medView === "cond") + '">By condition</button>' +
        '<button type="button" role="tab" data-act="medview" data-arg="all" class="' + (state.medView === "all" ? "is-on" : "") + '" aria-selected="' + (state.medView === "all") + '">All medicines</button>' +
      '</div>' + body;
  }

  function renderProgress() {
    var n = takenCount();
    var c = 2 * Math.PI * 46;
    var offset = c * (1 - n / 6);
    var week = [
      ["W", "all", "✓"], ["T", "all", "✓"], ["F", "partial", "5"],
      ["S", "all", "✓"], ["S", "all", "✓"], ["M", "missed", "×"], ["T", "partial", "3"]
    ];
    var bars = [
      ["Metformin", 98, false],
      ["Lisinopril", 96, false],
      ["Amoxicillin", 100, false],
      ["Atorvastatin", 88, true]
    ];
    var refill = state.refill
      ? '<section class="refill"><div class="refill-n">4</div><div><h3>Amoxicillin is running low</h3>' +
        '<p>4 left — at 2 a day you’ll run out Thursday.</p>' +
        '<div class="refill-actions"><button class="linkish is-acc" type="button" data-act="refill-set">Set refill reminder</button>' +
        '<button class="linkish" type="button" data-act="refill-dismiss">Dismiss</button></div></div></section>'
      : "";
    screen.innerHTML =
      '<p class="eyebrow">August</p>' +
      '<h1 class="h-serif" style="font-size:32px">12-day <em>streak.</em></h1>' +
      '<section class="card hero"><div class="ring">' +
        '<svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">' +
          '<circle cx="56" cy="56" r="46" fill="none" stroke="#EDF2EA" stroke-width="8"></circle>' +
          '<circle cx="56" cy="56" r="46" fill="none" stroke="#3E8578" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + offset.toFixed(2) + '" transform="rotate(-90 56 56)"></circle>' +
        '</svg><div class="ring-label"><strong>' + n + '<span>/6</span></strong><small>Today</small></div></div>' +
        '<div><div class="adh">96%<i>▲ 3%</i></div><div class="adh-k">Adherence · August</div><div class="hairline"></div>' +
        '<div class="stats"><div><strong>94%</strong><span>On time</span></div><div><strong>168</strong><span>Doses taken</span></div><div><strong>3</strong><span>Missed</span></div></div></div></section>' +
      '<section class="card week"><div class="week-row">' + week.map(function (w) {
        return '<div class="week-day"><em>' + w[0] + '</em><div class="bub ' + w[1] + '">' + w[2] + '</div></div>';
      }).join("") + '</div>' +
      '<div class="legend"><span><i class="a"></i>All taken</span><span><i class="p"></i>Partial</span><span><i class="m"></i>Missed</span></div></section>' +
      refill +
      '<section class="insight"><div class="k">✦ Insight</div>' +
      '<p>' + (state.moved
        ? "Atorvastatin now shows with dinner at 7:30 PM on Today. This preview does not change a real schedule."
        : "All 3 missed doses this month were the 9 PM Atorvastatin. Moving it to dinner could fix your evenings.") +
      '</p>' +
      (state.moved ? "" : '<button class="linkish is-acc" type="button" data-act="move">Move to 7:30 PM with dinner ›</button>') +
      '</section>' +
      '<div class="row-between" style="margin-top:16px"><h2 class="section-label" style="margin:0">By medicine</h2>' +
      '<button class="linkish is-acc" type="button" data-act="premium">Full history ›</button></div>' +
      '<div class="card bars">' + bars.map(function (b) {
        return '<div class="bar-row"><strong>' + b[0] + '</strong><div class="track"><b class="' + (b[2] ? "warn" : "") + '" style="width:' + b[1] + '%"></b></div><em class="' + (b[2] ? "warn" : "") + '">' + b[1] + '%</em></div>';
      }).join("") + '</div>';
  }

  function switchHTML(on, locked) {
    return '<span class="switch' + (on ? " is-on" : "") + (locked ? " is-locked" : "") + '" aria-hidden="true"><i></i></span>';
  }

  function renderSettings() {
    var meals = ["Breakfast", "Lunch", "Dinner"].map(function (name) {
      return '<button class="set-row" type="button" data-act="meal" data-arg="' + name + '"><strong>' + name + '</strong><span class="time">' + esc(state.meals[name]) + '</span></button>';
    }).join("");
    screen.innerHTML =
      '<h1 class="screen-title">Settings</h1>' +
      '<section class="card profile"><div class="avatar" aria-hidden="true">M</div>' +
      '<div><strong>Margaret</strong><span>Free plan · 3 of 3 medicines used</span></div>' +
      '<button class="add-chip" type="button" data-act="premium">Upgrade</button></section>' +
      '<h2 class="section-label">Meal times</h2><div class="card group">' + meals + '</div>' +
      '<p class="fine">Doses anchor to meals — change a meal and its doses follow.</p>' +
      '<h2 class="section-label">Reminders</h2><div class="card group">' +
        '<button class="set-row" type="button" data-act="notif" aria-pressed="' + state.notif + '"><strong>Notifications</strong>' + switchHTML(state.notif, false) + '</button>' +
        '<button class="set-row" type="button" data-act="premium"><span><strong>Follow-up nudges <span class="prem">PREMIUM</span></strong><small>One extra nudge if a dose slips</small></span>' + switchHTML(false, true) + '</button>' +
        '<button class="set-row" type="button" data-act="premium"><span><strong>Critical alerts <span class="prem">PREMIUM</span></strong><small>Break through Silent &amp; Do Not Disturb</small></span>' + switchHTML(false, true) + '</button>' +
        '<button class="set-row" type="button" data-act="premium"><span><strong>Caregiver alert <span class="prem">PREMIUM</span></strong><small>Tell someone you trust if 2 doses are missed</small></span>' + switchHTML(false, true) + '</button>' +
      '</div>' +
      '<div class="data-head"><h2 class="section-label" style="margin:0">Data</h2><span>Local-first — stays on this phone</span></div>' +
      '<div class="card group" style="margin-top:8px">' +
        '<button class="set-row" type="button" data-act="premium"><strong>Caregiver sharing <span class="prem">PREMIUM</span></strong><span class="chev" aria-hidden="true">›</span></button>' +
        '<button class="set-row" type="button" data-act="premium"><strong>Doctor report (PDF) <span class="prem">PREMIUM</span></strong><span class="chev" aria-hidden="true">›</span></button>' +
      '</div>';
  }

  function renderScreen(keepScroll) {
    if (state.tab === "today") renderToday();
    else if (state.tab === "meds") renderMeds();
    else if (state.tab === "progress") renderProgress();
    else renderSettings();
    if (!keepScroll) screen.scrollTop = 0;
    ["today", "meds", "progress", "settings"].forEach(function (id) {
      var el = document.getElementById("tab-" + id);
      var on = state.tab === id;
      el.classList.toggle("is-on", on);
      if (on) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
    var hideFab = state.tab !== "today" || state.overlay;
    fab.hidden = hideFab;
  }

  function openSheet(name, arg) {
    state.sheet = name;
    if (name === "ask") {
      state.askId = arg || "";
      state.askLog = [];
    }
    if (name === "meal") state.mealEdit = arg || "Breakfast";
    scrim.hidden = false;
    sheet.hidden = false;
    renderSheet();
  }

  function closeSheet() {
    state.sheet = null;
    scrim.hidden = true;
    sheet.hidden = true;
    sheet.innerHTML = "";
  }

  function renderSheet() {
    if (state.sheet === "reminder") {
      var clock = nextClock();
      sheet.innerHTML =
        '<div class="grab"></div>' +
        '<div class="next-kicker"><i class="pulse"></i>' + esc(clock.hm) + " " + esc(clock.ap) + " · With lunch</div>" +
        '<h2>Metformin 500 mg</h2>' +
        '<p class="lead">1 tablet — take with food. 28 left after this dose.</p>' +
        '<button class="cta" type="button" data-act="rem-taken">Taken</button>' +
        '<div class="pair"><button class="ghost" type="button" data-act="rem-snooze">Snooze 15</button>' +
        '<button class="ghost quiet" type="button" data-act="rem-skip">Skip</button></div>';
    } else if (state.sheet === "ask") {
      var med = findMed(state.askId);
      var title = med ? med.name : "Ask Medello";
      var kicker = med ? "✦ About your medicine" : "✦ Medello";
      var blocks = "";
      if (med) {
        blocks =
          '<div class="ai-block"><div class="k">What it does</div><p>' + esc(med.about.does) + '</p></div>' +
          '<div class="ai-block"><div class="k">How to take it</div><p>' + esc(med.about.how) + '</p></div>' +
          '<div class="ai-block"><div class="k">Common side effects</div><p>' + esc(med.about.sides) + '</p></div>' +
          '<div class="ai-block"><div class="k">Good to know</div><p>' + esc(med.about.know) + '</p></div>';
      }
      var log = state.askLog.map(function (line) {
        return '<div class="bubble' + (line.who === "you" ? " user" : "") + '">' + esc(line.text) + '</div>';
      }).join("");
      var chips = med ? "" :
        '<div class="chips">' +
          '<button type="button" data-act="q" data-arg="next">What’s next?</button>' +
          '<button type="button" data-act="q" data-arg="low">Anything running low?</button>' +
          '<button type="button" data-act="q" data-arg="miss">Why the evening misses?</button>' +
        '</div>';
      sheet.innerHTML =
        '<div class="grab"></div>' +
        '<div class="next-kicker"><i class="pulse"></i>' + kicker + '</div>' +
        '<h2>' + esc(title) + '</h2>' +
        '<p class="lead">Placeholder copy for this prototype. Not a live model, and not medical advice.</p>' +
        blocks + log + chips +
        '<button class="ghost" type="button" data-act="close-sheet" style="margin-top:16px">Close</button>';
    } else if (state.sheet === "premium") {
      sheet.innerHTML =
        '<div class="grab"></div>' +
        '<p class="eyebrow" style="text-align:center;color:var(--acc)">Medello Premium</p>' +
        '<h2 style="text-align:center">Care that <em>carries you.</em></h2>' +
        '<div class="perk"><i>✓</i><div><strong>Follow-up nudges</strong><span>One extra nudge if a dose slips</span></div></div>' +
        '<div class="perk"><i>✓</i><div><strong>Critical alerts</strong><span>Break through Silent and Do Not Disturb</span></div></div>' +
        '<div class="perk"><i>✓</i><div><strong>Caregiver alert</strong><span>After two missed doses, not before</span></div></div>' +
        '<div class="perk"><i>✓</i><div><strong>Doctor report</strong><span>A PDF of this sample month</span></div></div>' +
        '<div class="plans">' +
          '<button class="plan' + (state.plan === "month" ? " is-on" : "") + '" type="button" data-act="plan" data-arg="month"><span>Monthly</span><b>$3.99</b></button>' +
          '<button class="plan' + (state.plan === "year" ? " is-on" : "") + '" type="button" data-act="plan" data-arg="year"><span>Yearly</span><b>$29.99</b></button>' +
        '</div>' +
        '<button class="cta" type="button" data-act="trial">Start 14-day free trial</button>' +
        '<button class="linkish" type="button" data-act="close-sheet" style="display:block;margin:12px auto 0">Maybe later</button>';
    } else if (state.sheet === "meal") {
      var name = state.mealEdit;
      sheet.innerHTML =
        '<div class="grab"></div>' +
        '<p class="eyebrow">' + esc(name) + '</p>' +
        '<h2>' + esc(state.meals[name]) + '</h2>' +
        '<p class="lead">Doses anchored to ' + esc(name.toLowerCase()) + ' follow this time. Sample only.</p>' +
        '<div class="stepper"><button type="button" data-act="meal-step" data-arg="-30" aria-label="30 minutes earlier">−</button>' +
        '<strong>' + esc(state.meals[name]) + '</strong>' +
        '<button type="button" data-act="meal-step" data-arg="30" aria-label="30 minutes later">+</button></div>' +
        '<button class="cta" type="button" data-act="close-sheet">Done</button>';
    }
  }

  function openOverlay(name) {
    clearTimeout(scanTimer);
    state.overlay = name;
    overlay.hidden = false;
    fab.hidden = true;
    renderOverlay();
    if (name === "scan") {
      scanTimer = setTimeout(function () {
        if (state.overlay === "scan") {
          state.overlay = "scan-done";
          renderOverlay();
        }
      }, 1500);
    }
  }

  function closeOverlay() {
    clearTimeout(scanTimer);
    state.overlay = null;
    overlay.hidden = true;
    overlay.innerHTML = "";
    fab.hidden = state.tab !== "today";
  }

  function renderOverlay() {
    if (state.overlay === "add") {
      overlay.innerHTML =
        '<div class="ov-head"><h2 class="ov-title">Add a medicine</h2>' +
        '<button class="icon-btn" type="button" data-act="close-overlay" aria-label="Close">✕</button></div>' +
        '<p class="lead">The easiest way: point your camera at the prescription — Medello fills everything in.</p>' +
        '<button class="snap" type="button" data-act="snap"><span class="snap-ico">' +
          '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h3l1.4-2h7.2L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.2"/></svg></span>' +
          '<span><strong>Snap the prescription</strong><span>Photo or screenshot — AI reads names, doses &amp; timings</span></span><span aria-hidden="true">›</span></button>' +
        '<div class="path-row">' +
          '<button class="choice" type="button" data-act="tell"><span class="ico" aria-hidden="true">✦</span><strong>Tell AI</strong><span>“Metformin 500 twice a day with food”</span></button>' +
          '<button class="choice" type="button" data-act="manual"><span class="ico" aria-hidden="true">✎</span><strong>Enter manually</strong><span>Pick name, strength &amp; times yourself</span></button>' +
        '</div>' +
        '<p class="center-copy">Whichever path you choose, you review everything before it’s saved.</p>';
    } else if (state.overlay === "scan") {
      overlay.innerHTML =
        '<div class="scan-stage"><div class="paper-doc" aria-hidden="true"><b style="width:70%"></b><b style="width:92%"></b><b style="width:54%"></b><b style="width:80%;margin-top:16px"></b><b style="width:62%"></b><div class="scanline"></div></div>' +
        '<h2 class="ov-title" style="margin-top:24px;font-size:22px">Reading the prescription…</h2>' +
        '<p class="lead">Found <strong style="color:var(--ink)">Metformin 500 mg</strong> — checking it against the medicines database.</p></div>';
    } else if (state.overlay === "scan-done") {
      overlay.innerHTML =
        '<div class="ov-head"><div class="back-title"><button class="icon-btn" type="button" data-act="add" aria-label="Back">‹</button><h2 class="ov-title" style="font-size:24px">Review</h2></div>' +
        '<button class="icon-btn" type="button" data-act="close-overlay" aria-label="Close">✕</button></div>' +
        '<div class="ai-block" style="margin-top:16px"><div class="k">AI read · sample</div><p><strong style="color:var(--ink)">Metformin 500 mg</strong> — 1 tablet with lunch. This medicine is already on Margaret’s list, so nothing new is saved.</p></div>' +
        '<p class="note">Placeholder reading, not a live model. You would confirm every field before a real save.</p>' +
        '<button class="cta" type="button" data-act="close-overlay">Done</button>';
    } else if (state.overlay === "tell") {
      overlay.innerHTML =
        '<div class="ov-head"><div class="back-title"><button class="icon-btn" type="button" data-act="add" aria-label="Back">‹</button><h2 class="ov-title" style="font-size:24px">Tell AI</h2></div>' +
        '<button class="icon-btn" type="button" data-act="close-overlay" aria-label="Close">✕</button></div>' +
        '<p class="lead">Tell Medello in your own words — name, dose, timing. This box does not call a model.</p>' +
        '<div class="field"><label for="tell-text">In your words</label><textarea id="tell-text" placeholder="Metformin 500 twice a day with food">Metformin 500 twice a day with food</textarea></div>' +
        '<div class="chips"><button type="button" data-act="chip" data-arg="with food">with food</button>' +
        '<button type="button" data-act="chip" data-arg="for 7 days">for 7 days</button>' +
        '<button type="button" data-act="chip" data-arg="8 am">8 am</button></div>' +
        '<div class="ai-block"><div class="k">Sample reading</div><p id="tell-read">Medello would read: Metformin 500 mg, twice a day, with food. You still review before anything is saved.</p></div>' +
        '<button class="cta" type="button" data-act="tell-save">Review details</button>';
    } else if (state.overlay === "manual") {
      overlay.innerHTML =
        '<div class="ov-head"><div class="back-title"><button class="icon-btn" type="button" data-act="add" aria-label="Back">‹</button><h2 class="ov-title" style="font-size:24px">Enter manually</h2></div>' +
        '<button class="icon-btn" type="button" data-act="close-overlay" aria-label="Close">✕</button></div>' +
        '<div class="field"><label for="m-name">Name</label><input id="m-name" value="' + esc(state.manual.name) + '" placeholder="Medicine name"></div>' +
        '<div class="field"><label for="m-str">Strength</label><select id="m-str">' +
          ["250 mg", "500 mg", "10 mg", "20 mg", "Not sure"].map(function (s) {
            return '<option' + (s === state.manual.strength ? " selected" : "") + '>' + s + '</option>';
          }).join("") + '</select></div>' +
        '<div class="field"><label for="m-time">Time</label><select id="m-time">' +
          ["7:30 AM", "8:00 AM", "12:30 PM", "1:00 PM", "7:30 PM", "9:00 PM"].map(function (s) {
            return '<option' + (s === state.manual.time ? " selected" : "") + '>' + s + '</option>';
          }).join("") + '</select></div>' +
        '<p class="note">Nothing is stored outside this preview. You would confirm the card before a real save.</p>' +
        '<button class="cta" type="button" data-act="manual-save">Save medicine</button>';
    }
  }

  function shiftMeal(delta) {
    var name = state.mealEdit;
    var parts = state.meals[name].match(/(\d+):(\d+)\s*(AM|PM)/);
    if (!parts) return;
    var h = parseInt(parts[1], 10) % 12;
    if (parts[3] === "PM") h += 12;
    var mins = h * 60 + parseInt(parts[2], 10) + delta;
    mins = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
    var hh = Math.floor(mins / 60);
    var mm = mins % 60;
    var ap = hh >= 12 ? "PM" : "AM";
    var h12 = hh % 12 || 12;
    state.meals[name] = h12 + ":" + String(mm).padStart(2, "0") + " " + ap;
  }

  function answers(key) {
    if (key === "next") return "Next is Metformin 500 mg with lunch. After that, Amoxicillin at 8:00 PM and Atorvastatin in the evening.";
    if (key === "low") return "Amoxicillin is the one running low — 4 left, about Thursday at two a day. Metformin still shows 28, refill Aug 24.";
    return "The three misses this month were the 9 PM Atorvastatin. The insight suggests 7:30 PM with dinner. This is the sample month, not a live chart.";
  }

  function markTaken() {
    state.nextTaken = true;
    state.nextSkipped = false;
    holding = false;
    clearTimeout(holdTimer);
    toast("Well done — Metformin taken");
    closeSheet();
    renderScreen();
  }

  function onAct(act, arg, target) {
    if (act === "tab") {
      closeOverlay();
      closeSheet();
      state.tab = arg;
      if (history.replaceState) history.replaceState(null, "", "#" + arg);
      renderScreen();
      return;
    }
    if (act === "add") { openOverlay("add"); return; }
    if (act === "close-overlay") { closeOverlay(); return; }
    if (act === "snap") { openOverlay("scan"); return; }
    if (act === "tell") { openOverlay("tell"); return; }
    if (act === "manual") { openOverlay("manual"); return; }
    if (act === "close-sheet") { closeSheet(); return; }
    if (act === "medview") { state.medView = arg; renderScreen(); return; }
    if (act === "snooze") {
      state.snooze += 1;
      var c = nextClock();
      toast("Snoozed to " + c.hm + " " + c.ap);
      renderScreen();
      return;
    }
    if (act === "reminder") { openSheet("reminder"); return; }
    if (act === "rem-taken" || act === "mark-taken") { markTaken(); return; }
    if (act === "rem-snooze") {
      state.snooze += 1;
      closeSheet();
      toast("Snoozed 15 min");
      renderScreen();
      return;
    }
    if (act === "rem-skip") {
      state.nextSkipped = true;
      state.nextTaken = false;
      closeSheet();
      toast("Skipped — still unconfirmed");
      renderScreen();
      return;
    }
    if (act === "later") {
      state.later[arg] = !state.later[arg];
      renderScreen();
      return;
    }
    if (act === "ask") { openSheet("ask", arg || ""); return; }
    if (act === "q") {
      var q = arg === "next" ? "What’s next?" : arg === "low" ? "Anything running low?" : "Why the evening misses?";
      state.askLog.push({ who: "you", text: q });
      state.askLog.push({ who: "ai", text: answers(arg) });
      renderSheet();
      return;
    }
    if (act === "premium") { openSheet("premium"); return; }
    if (act === "plan") { state.plan = arg; renderSheet(); return; }
    if (act === "trial") { toast("Prototype only — no checkout"); return; }
    if (act === "notif") { state.notif = !state.notif; toast(state.notif ? "Notifications on" : "Notifications off"); renderScreen(); return; }
    if (act === "meal") { openSheet("meal", arg); return; }
    if (act === "meal-step") { shiftMeal(parseInt(arg, 10)); renderSheet(); renderScreen(true); return; }
    if (act === "refill-dismiss") { state.refill = false; renderScreen(); return; }
    if (act === "refill-set") { toast("Refill reminder set for Thursday"); return; }
    if (act === "move") {
      state.moved = true;
      state.atorTime = "7:30 PM";
      state.atorSub = "with dinner";
      var ator = findMed("ator");
      if (ator) ator.times = "7:30 PM";
      toast("Atorvastatin moved to 7:30 PM");
      renderScreen();
      return;
    }
    if (act === "chip") {
      var box = document.getElementById("tell-text");
      if (box && box.value.indexOf(arg) === -1) box.value = (box.value + " " + arg).trim();
      return;
    }
    if (act === "tell-save") {
      toast("Reviewed — nothing saved in this preview");
      closeOverlay();
      return;
    }
    if (act === "manual-save") {
      var name = (document.getElementById("m-name") || {}).value || "";
      state.manual.name = name.trim();
      state.manual.strength = (document.getElementById("m-str") || {}).value || state.manual.strength;
      state.manual.time = (document.getElementById("m-time") || {}).value || state.manual.time;
      if (!state.manual.name) { toast("Add a name to review it"); return; }
      toast(state.manual.name + " reviewed — not saved");
      closeOverlay();
    }
  }

  function startHold(btn) {
    if (holding || state.nextTaken || state.nextSkipped) return;
    holding = true;
    btn.classList.add("is-holding");
    var label = btn.querySelector("[data-hold-label]");
    if (label) label.textContent = "Keep holding…";
    clearTimeout(holdTimer);
    holdTimer = setTimeout(function () {
      holding = false;
      markTaken();
    }, 900);
  }

  function endHold() {
    if (!holding) return;
    holding = false;
    clearTimeout(holdTimer);
    var btn = screen.querySelector("[data-hold]");
    if (!btn) return;
    btn.classList.remove("is-holding");
    var label = btn.querySelector("[data-hold-label]");
    if (label) label.textContent = "Hold to take";
  }

  phone.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act]");
    if (!t || !phone.contains(t)) return;
    onAct(t.getAttribute("data-act"), t.getAttribute("data-arg") || "", t);
  });

  phone.addEventListener("pointerdown", function (e) {
    var btn = e.target.closest("[data-hold]");
    if (!btn) return;
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    try { btn.setPointerCapture(e.pointerId); } catch (err) {}
    startHold(btn);
  });
  phone.addEventListener("pointerup", endHold);
  phone.addEventListener("pointercancel", endHold);

  scrim.addEventListener("click", closeSheet);

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (state.sheet) closeSheet();
    else if (state.overlay) closeOverlay();
  });

  var hashTab = (location.hash || "").replace("#", "");
  if (hashTab === "add" || hashTab === "meds" || hashTab === "progress" || hashTab === "settings" || hashTab === "today") {
    state.tab = hashTab === "add" ? "today" : hashTab;
  }
  renderScreen();
  if (hashTab === "add") openOverlay("add");
})();

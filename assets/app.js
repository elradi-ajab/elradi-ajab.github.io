(function () {
  var BASE = window.BASE || '';
  var T = window.I18N || {};
  var root = document.documentElement;

  /* theme toggle */
  var tbtn = document.getElementById('theme-toggle');
  if (tbtn) tbtn.addEventListener('click', function () {
    var cur = root.getAttribute('data-theme') ||
      (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  function getJSON(name) {
    return fetch(BASE + name, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });
  }
  function okUrl(u) { return typeof u === 'string' && /^https?:\/\//.test(u.trim()); }

  /* project links from links.json */
  var ICONS = {
    website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
    appStore: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.2 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.300 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z"/></svg>',
    googlePlay: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.6 2.2c-.3.3-.4.7-.4 1.2v17.2c0 .5.1.9.4 1.2l9.5-9.8L3.6 2.2zm10.6 8.7 2.7-2.8L5.2 1.4c-.3-.2-.6-.2-.9-.1l9.9 9.6zm0 2.2-9.9 9.6c.3.1.6.1.9-.1l11.7-6.7-2.7-2.8zm6.2-2.7-2.6-1.5-3 3.1 3 3.1 2.6-1.5c.8-.5.8-1.7 0-3.2z"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C17 4.8 18 5.1 18 5.1c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>',
    demo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z" fill="currentColor"/></svg>'
  };
  var KINDS = ['website', 'appStore', 'googlePlay', 'github', 'demo'];
  getJSON('links.json').then(function (data) {
    document.querySelectorAll('[data-links]').forEach(function (box) {
      var seen = {};
      box.getAttribute('data-links').split(' ').forEach(function (id) {
        var l = data[id]; if (!l) return;
        KINDS.forEach(function (k) {
          var url = l[k]; if (!okUrl(url) || seen[url]) return; seen[url] = 1;
          var a = document.createElement('a');
          a.href = url.trim(); a.target = '_blank'; a.rel = 'noopener';
          a.innerHTML = ICONS[k] + '<span>' + (T['link_' + k] || k) + '</span>';
          box.appendChild(a);
        });
      });
    });
  });

  /* project images from images.json */
  var lb = document.getElementById('lightbox');
  function openLb(src) {
    if (!lb || !lb.showModal) { window.open(src, '_blank'); return; }
    lb.querySelector('img').src = src; lb.showModal();
  }
  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-close')) lb.close(); });
  }
  getJSON('images.json').then(function (data) {
    document.querySelectorAll('[data-media]').forEach(function (box) {
      var entry = data[box.getAttribute('data-media')];
      if (!entry || !entry.images || !entry.images.length) return;
      var type = entry.type || box.getAttribute('data-type') || 'phone';
      var max = parseInt(box.getAttribute('data-max'), 10) || 3;
      var list = entry.images.filter(function (s) { return typeof s === 'string' && s.trim(); }).slice(0, max)
        .map(function (s) { return /^https?:\/\//.test(s) ? s : BASE + s.replace(/^\//, ''); });
      if (!list.length) return;
      box.setAttribute('data-type', type);
      if (box.hasAttribute('data-gallery')) {
        var sc = document.createElement('div'); sc.className = 'gscroll';
        list.forEach(function (src) {
          var b = document.createElement('button'); b.type = 'button';
          var im = new Image(); im.src = src; im.alt = ''; im.loading = 'lazy';
          b.appendChild(im); b.addEventListener('click', function () { openLb(src); });
          sc.appendChild(b);
        });
        box.innerHTML = ''; box.appendChild(sc);
      } else if (type === 'web') {
        box.innerHTML = '<div class="mweb"><img alt="" loading="lazy" src="' + list[0] + '"></div>';
      } else {
        var shown = list.slice(0, 3);
        box.innerHTML = '<div class="mstrip">' + shown.map(function (s) { return '<img alt="" loading="lazy" src="' + s + '">'; }).join('') + '</div>';
      }
    });
  });

  /* copy email */
  var cbtn = document.getElementById('copy-email');
  if (cbtn) cbtn.addEventListener('click', function () {
    var el = document.getElementById('email'); var text = el ? el.textContent.trim() : '';
    function done() { cbtn.textContent = T.copied || 'Copied'; setTimeout(function () { cbtn.textContent = T.copy || 'Copy'; }, 1600); }
    function fallback() { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  });

  var yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
})();

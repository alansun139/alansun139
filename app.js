/* =========================================================
   Alan — bookshelf & flip-book albums
   Home shows a shelf; each book opens a flip album that
   pages left / right (arrows, keyboard, swipe).
   Native JS, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Album data (derived from the Figma layout) ---------- */
  var BOOKS = {
    1: {
      title: 'Photography · animals',
      cover: 'img/cover_blue.jpg',
      coverNote: 'Wildlife shots — a field notebook',
      photos: [
        { src: 'img/DSC03728.jpg',     cap: 'A small bird, waiting on a bare branch' },
        { src: 'img/shot_010800.jpg',  cap: 'Mallard ducks and koi in the shallows' },
        { src: 'img/shot_010828.jpg',  cap: 'A magpie, sharp against the branches' },
        { src: 'img/shot_010940.jpg',  cap: 'Night heron after dark' },
        { src: 'img/shot_011014.jpg',  cap: 'A duck keeps watch from the reeds' },
        { src: 'img/IMG7458.jpg',      cap: 'Egret on an old wooden boat' },
        { src: 'img/shot_011902.jpg',  cap: 'A green moth, perfectly still' }
      ]
    },
    2: {
      title: 'Scenery',
      cover: 'img/cover_yellow.jpg',
      coverNote: 'Places and light — a scenery notebook',
      photos: [
        { src: 'img/JK2A1530.jpg', cap: 'Dusk light over the mountains' },
        { src: 'img/JK2A1303.jpg', cap: 'Open grassland under a quiet sky' },
        { src: 'img/DSC07118.jpg', cap: 'Pagoda and its still reflection' },
        { src: 'img/DSC07059.jpg', cap: 'Valley roads through the green' },
        { src: 'img/weixin.jpg',   cap: 'Stone cairns beneath the high hills' },
        { src: 'img/shot_012206.jpg', cap: 'A waterfall folding over stone terraces' }
      ]
    },
    3: {
      title: 'What can I help',
      cover: 'img/cover_green.jpg',
      coverNote: 'Three ways I can help — a small notebook',
      photos: [],
      template: 'helpPage'
    }
  };

  /* ---------- Elements ---------- */
  var shelfView = document.querySelector('[data-view="home"]');
  var albumView = document.querySelector('[data-view="album"]');
  var backBtn = document.querySelector('[data-back]');
  var albumTitle = document.querySelector('[data-album-title]');
  var pagesEl = document.querySelector('[data-pages]');
  var countEl = document.querySelector('[data-count]');
  var dotsEl = document.querySelector('[data-dots]');
  var prevBtn = document.querySelector('[data-flip="prev"]');
  var nextBtn = document.querySelector('[data-flip="next"]');

  /* ---------- Album state ---------- */
  var currentBook = null;
  var pageEls = [];
  var dotEls = [];
  var index = 0;
  var flipping = false;

  /* ---------- Build pages for a book ---------- */
  function buildPages(book) {
    pagesEl.innerHTML = '';
    dotsEl.innerHTML = '';
    pageEls = [];
    dotEls = [];

    // cover page
    var cover = document.createElement('div');
    cover.className = 'page page-cover';
    cover.innerHTML =
      '<img src="' + book.cover + '" alt="' + book.title + ' album cover">' +
      '<div class="cover-text">' +
        '<p class="cover-title">' + book.title + '</p>' +
        '<p class="cover-note">' + book.coverNote + '</p>' +
      '</div>';
    pagesEl.appendChild(cover);
    pageEls.push(cover);

    // photo pages
    book.photos.forEach(function (p) {
      var page = document.createElement('div');
      page.className = 'page page-photo';
      page.innerHTML =
        '<div class="page-img-wrap"><img src="' + p.src + '" alt="' + p.cap + '"></div>' +
        '<div class="page-meta">' +
          '<span class="page-caption">' + p.cap + '</span>' +
          '<span class="page-idx"></span>' +
        '</div>';
      pagesEl.appendChild(page);
      pageEls.push(page);
    });

    // custom content page (from a <template> in index.html)
    if (book.template) {
      var tpl = document.getElementById(book.template);
      if (tpl) {
        var page2 = document.createElement('div');
        page2.className = 'page page-custom';
        page2.appendChild(tpl.content.cloneNode(true));
        pagesEl.appendChild(page2);
        pageEls.push(page2);
      }
    }

    // page number labels
    pageEls.forEach(function (el, i) {
      var idx = el.querySelector('.page-idx');
      if (idx) idx.textContent = 'page ' + (i + 1);
    });

    // dots
    pageEls.forEach(function (_, i) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Page ' + (i + 1));
      b.addEventListener('click', function () { go(i); });
      dotsEl.appendChild(b);
      dotEls.push(b);
    });
  }

  /* ---------- Flip navigation ---------- */
  function paint() {
    countEl.textContent = 'Page ' + (index + 1) + ' of ' + pageEls.length;
    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= pageEls.length - 1;
    dotEls.forEach(function (d, i) { d.classList.toggle('on', i === index); });
  }

  function go(i) {
    if (flipping || !pageEls.length) return;
    if (i < 0 || i > pageEls.length - 1) return;
    var oldEl = pageEls[index];
    var newEl = pageEls[i];
    flipping = true;

    if (oldEl !== newEl) {
      oldEl.classList.remove('active');
      oldEl.classList.add('leaving');
      newEl.classList.add('active');
      window.setTimeout(function () {
        oldEl.classList.remove('leaving');
        flipping = false;
      }, 560);
    } else {
      flipping = false;
    }
    index = i;
    paint();
  }

  prevBtn.addEventListener('click', function () { go(index - 1); });
  nextBtn.addEventListener('click', function () { go(index + 1); });

  /* keyboard + swipe on the album */
  albumView.setAttribute('tabindex', '0');
  albumView.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(index - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { go(index + 1); e.preventDefault(); }
  });
  var touchX = null;
  albumView.addEventListener('touchstart', function (e) {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  albumView.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

  /* ---------- View router ---------- */
  function show(name) {
    shelfView.classList.toggle('active', name === 'home');
    albumView.classList.toggle('active', name === 'album');
    backBtn.hidden = name !== 'album';
  }

  function openAlbum(id) {
    var book = BOOKS[id];
    if (!book) return;
    currentBook = id;
    albumTitle.textContent = book.title;
    buildPages(book);
    index = 0;
    flipping = false;
    pageEls[0].classList.add('active');
    paint();
    show('album');
    document.title = 'Alan — ' + book.title;
    if (window.scrollY > 0) window.scrollTo(0, 0);
  }

  function showHome() {
    show('home');
    document.title = 'Alan — My Albums';
    if (window.scrollY > 0) window.scrollTo(0, 0);
  }

  /* books on the shelf */
  Array.prototype.slice.call(document.querySelectorAll('[data-open]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-open');
      window.location.hash = '#/album/' + id;
    });
  });
  backBtn.addEventListener('click', function () {
    window.location.hash = '#/home';
  });

  /* router */
  function route() {
    var m = /^#\/album\/(\d+)$/.exec(window.location.hash);
    if (m) { openAlbum(Number(m[1])); }
    else { showHome(); }
  }
  window.addEventListener('hashchange', route);
  route();

  /* ---------- 鼠标跟随的轻微 3D 转动 ---------- */
  (function tilt3d() {
    var scene = document.querySelector('.scene-inner');
    if (!scene) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var MAX_X = 6.5;   // 左右最大角度
    var MAX_Y = 4.2;   // 上下最大角度
    var targetX = 0, targetY = 0, curX = 0, curY = 0, raf = null;

    /* 每本书各自一个深度，用位移模拟层间视差（避免 translateZ 的透视放大破坏对位） */
    var DEPTH = [
      { sel: '.layer-blue, .spot-blue',     z: 10 },
      { sel: '.layer-orange, .spot-orange, .spot-yellow', z: 88 },
      { sel: '.layer-green, .spot-green',   z: 52 }
    ];
    var RAD = Math.PI / 180;
    var parts = DEPTH.map(function (d) {
      return { z: d.z, els: Array.prototype.slice.call(document.querySelectorAll(d.sel)) };
    });

    function applyDepth(rx, ry) {
      var sx = Math.sin(ry * RAD), sy = Math.sin(rx * RAD);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var dx = sx * p.z, dy = -sy * p.z;
        for (var j = 0; j < p.els.length; j++) {
          p.els[j].style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0)';
        }
      }
    }

    function frame() {
      curX += (targetX - curX) * 0.09;
      curY += (targetY - curY) * 0.09;
      scene.style.transform =
        'rotateX(' + curY.toFixed(3) + 'deg) rotateY(' + curX.toFixed(3) + 'deg)';
      applyDepth(curY, curX);
      if (Math.abs(targetX - curX) > 0.02 || Math.abs(targetY - curY) > 0.02) {
        raf = window.requestAnimationFrame(frame);
      } else {
        curX = targetX; curY = targetY;
        scene.style.transform =
          'rotateX(' + curY.toFixed(3) + 'deg) rotateY(' + curX.toFixed(3) + 'deg)';
        applyDepth(curY, curX);
        raf = null;
      }
    }

    function kick() {
      if (!raf) raf = window.requestAnimationFrame(frame);
    }

    window.addEventListener('mousemove', function (e) {
      if (!shelfView.classList.contains('active')) return;
      var nx = (e.clientX / window.innerWidth - 0.5) * 2;
      var ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetX = Math.max(-1, Math.min(1, nx)) * MAX_X;
      targetY = -Math.max(-1, Math.min(1, ny)) * MAX_Y;
      kick();
    });

    document.addEventListener('mouseleave', function () {
      targetX = 0; targetY = 0; kick();
    });
  })();
})();

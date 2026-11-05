"""Build public/ from src/Main.dc.html (the design source).\nTurn the Design-canvas page (Main.dc.html) into a plain static site for Vercel:
index.html + app.js (tiny runtime: holes, <sc-if>, delegated events, morphdom diffing) + media/."""
import json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# usage: python3 tools/build.py [src/Main.dc.html] [public]   (a sub-folder build, e.g. public/v2, links media from ../media)
SRC = os.path.join(ROOT, sys.argv[1]) if len(sys.argv) > 1 else ROOT + '/src/Main.dc.html'
OUT = os.path.join(ROOT, sys.argv[2]) if len(sys.argv) > 2 else ROOT + '/public'
SUB = os.path.relpath(OUT, ROOT + '/public') != '.'
os.makedirs(OUT + '/media', exist_ok=True)

src = open(SRC, encoding='utf-8').read()
xdc = src[src.index('<x-dc>') + 6: src.index('</x-dc>')]
helmet = xdc[xdc.index('<helmet>') + 8: xdc.index('</helmet>')]
tpl = xdc[xdc.index('</helmet>') + 9:]
m = re.search(r"<script type=\"text/x-dc\" data-dc-script data-props='([^']*)'>([\s\S]*?)</script>", src)
props_def = json.loads(m.group(1)); logic = m.group(2)
props = {k: v.get('default') for k, v in props_def.items()}

# only the fonts the page actually uses
helmet = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com/[^"]*">',
                '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
                '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&amp;family=JetBrains+Mono:wght@500&amp;display=swap">', helmet)

# media files live in public/media and the source already points at media/<file>
left = re.findall(r'/_blob/[0-9a-f]+', tpl + logic)
assert not left, 'source still has artifact blob urls: %s' % left[:3]

morph = open(ROOT + '/tools/vendor/morphdom-umd.min.js', encoding='utf-8').read()
runtime = r'''
class DCLogic { constructor(p) { this.props = p; this.state = {}; } setState(u) { const n = typeof u === 'function' ? u(this.state) : u; Object.assign(this.state, n); window.__dcRender && window.__dcRender(); } }
''' + logic + r'''
(function () {
  const props = __PROPS__;
  const comp = new Component(props);
  const tpl = document.getElementById('dc-tpl');
  const root = document.getElementById('dc-root');
  let vals = {};
  const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), vals);
  const hole = (expr) => { expr = expr.trim(); if (expr === 'true') return true; if (expr === 'false') return false; return get(expr); };
  const fill = (s) => s.replace(/{{(.*?)}}/g, (_, e) => { const v = hole(e); return v == null || v === false ? '' : String(v); });
  const EV = { click: 'click', change: 'input', input: 'input', keydown: 'keydown', submit: 'submit' };
  function build() {
    vals = comp.renderVals();
    const frag = tpl.content.cloneNode(true);
    const walk = (node) => {
      for (const el of Array.from(node.children)) {
        if (el.tagName === 'SC-IF') {
          const h = (el.getAttribute('value') || '').match(/^{{(.*)}}$/);
          if (!(h && hole(h[1]))) { el.remove(); continue; }
          walk(el); el.replaceWith(...el.childNodes); continue;
        }
        for (const a of Array.from(el.attributes)) {
          if (!a.value.includes('{{')) continue;
          if (/^on[a-z]+$/i.test(a.name)) {
            const ev = EV[a.name.slice(2).toLowerCase()] || a.name.slice(2).toLowerCase();
            el.removeAttribute(a.name);
            el.setAttribute('data-on-' + ev, a.value.slice(2, -2).trim());
            continue;
          }
          el.setAttribute(a.name, fill(a.value));
        }
        walk(el);
      }
    };
    walk(frag);
    const tw = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);
    let n; while ((n = tw.nextNode())) if (n.nodeValue.includes('{{')) n.nodeValue = fill(n.nodeValue);
    const next = document.createElement('div'); next.id = 'dc-root'; next.appendChild(frag);
    return next;
  }
  function render() {
    morphdom(root, build(), {
      onBeforeElUpdated(from, to) {
        if (from.isEqualNode(to)) return false;
        // never wipe what a visitor is typing
        if ((from.tagName === 'TEXTAREA' || (from.tagName === 'INPUT' && from.type !== 'range')) && !to.hasAttribute('value')) to.value = from.value;
        return true;
      },
    });
  }
  let pending = false;
  window.__dcRender = () => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; render(); }); };
  for (const ev of ['click', 'input', 'keydown', 'submit']) {
    document.addEventListener(ev, (e) => {
      const el = e.target && e.target.closest ? e.target.closest('[data-on-' + ev + ']') : null;
      if (!el || !root.contains(el)) return;
      const fn = get(el.getAttribute('data-on-' + ev));
      if (typeof fn === 'function') fn(e);
    });
  }
  render();
  comp.componentDidMount && comp.componentDidMount();
})();
'''.replace('__PROPS__', json.dumps(props, ensure_ascii=False))

contact_fix = r'''
// contact form: the "שליחה" button opens WhatsApp with the details filled in
document.addEventListener('click', (e) => {
  const b = e.target && e.target.closest ? e.target.closest('button.send') : null;
  if (!b) return;
  const v = (id) => ((document.getElementById(id) || {}).value || '').trim();
  const name = v('f-name'), mail = v('f-email'), need = v('f-need');
  const hasMail = !!document.getElementById('f-email');
  const needPhone = !hasMail && !!document.getElementById('f-phone');
  if (!name || (hasMail && !mail) || (needPhone && !v('f-phone')) || !need) {
    let t = document.getElementById('form-toast');
    if (!t) { t = document.createElement('div'); t.id = 'form-toast'; t.setAttribute('role', 'status'); t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:300;background:#111319;color:#fff;font:700 16px Heebo,sans-serif;padding:14px 20px;border-radius:14px;border:1px solid rgba(255,255,255,0.16);box-shadow:0 20px 50px -14px rgba(0,0,0,0.85)'; document.body.appendChild(t); }
    t.textContent = hasMail ? 'נא למלא שם, מייל ומה הייתם רוצים לבנות' : 'נא למלא שם טלפון ומה הייתם רוצים לבנות'; t.hidden = false;
    clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 2800);
    return;
  }
  const lines = ['היי רובי, אשמח לשמוע עוד.', 'שם: ' + name];
  if (mail) lines.push('מייל: ' + mail);
  if (v('f-phone')) lines.push('טלפון: ' + v('f-phone'));
  if (v('f-biz')) lines.push('עסק: ' + v('f-biz'));
  lines.push('מה אני רוצה לבנות: ' + need);
  const wa = document.querySelector('a.fab');
  const base = wa ? wa.href.split('?')[0] : 'https://wa.me/972547714300';
  window.open(base + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
});
'''

title = re.search(r'<title>(.*?)</title>', src).group(1)
# link previews (WhatsApp, Facebook, LinkedIn). Change SITE when the real domain is connected.
SITE = 'https://rubix-site-two.vercel.app'
page_url = SITE + '/' + (os.path.relpath(OUT, ROOT + '/public') + '/' if SUB else '')
og_title = 'Rubix Solutions | פחות עבודה ידנית, יותר זמן לעסק'
og_desc = 'כלים חכמים לעסקים קטנים: דשבורדים, אתרים, אוטומציות וסוכני AI שעושים לבד את העבודה החוזרת. שיחת היכרות חינם.'
og_tags = (f'<meta property="og:type" content="website">\n<meta property="og:locale" content="he_IL">\n'
           f'<meta property="og:site_name" content="Rubix Solutions">\n<meta property="og:url" content="{page_url}">\n'
           f'<meta property="og:title" content="{og_title}">\n<meta property="og:description" content="{og_desc}">\n'
           f'<meta property="og:image" content="{SITE}/media/og.jpg">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
           f'<meta property="og:image:alt" content="Rubix Solutions – פחות עבודה ידנית, יותר זמן לעסק">\n<meta name="twitter:card" content="summary_large_image">')
html = f'''<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="רובי בונה לעסקים דשבורדים לניהול, אתרי תדמית ומידע, אוטומציות ב-Make וסוכני AI שחוסכים שעות עבודה כל שבוע.">
<meta name="robots" content="noindex, nofollow">
{og_tags}
<meta name="theme-color" content="#07080C">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
{helmet}
</head>
<body>
<div id="dc-root"></div>
<template id="dc-tpl">{tpl}</template>
<script src="app.js" defer></script>
</body>
</html>
'''
appjs = morph + '\n' + runtime + '\n' + contact_fix
# cache-busting: media is cached for a week, so every reference carries the file's content hash
import hashlib
def _ver(m):
    f = os.path.join(ROOT, 'public', 'media', m.group(2))
    if not os.path.exists(f): return m.group(0)
    return m.group(1) + 'media/' + m.group(2) + '?v=' + hashlib.md5(open(f, 'rb').read()).hexdigest()[:8]
html = re.sub(r'(["\'(])media/([\w.-]+\.(?:mp4|jpg|webp))', _ver, html)
appjs = re.sub(r'(["\'(])media/([\w.-]+\.(?:mp4|jpg|webp))', _ver, appjs)
if SUB:  # media and favicon live once, in public/
    html = re.sub(r'(["\'(])media/', r'\1../media/', html).replace('href="favicon.svg"', 'href="../favicon.svg"')
    appjs = re.sub(r'(["\'(])media/', r'\1../media/', appjs)
open(OUT + '/index.html', 'w', encoding='utf-8').write(html)
open(OUT + '/app.js', 'w', encoding='utf-8').write(appjs)
if not SUB: open(OUT + '/favicon.svg', 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="11" fill="#C8F45A"/><text x="20" y="28" font-family="Arial" font-weight="900" font-size="22" text-anchor="middle" fill="#07080C">R</text></svg>')
if not SUB: open(OUT + '/robots.txt', 'w').write('User-agent: *\nDisallow: /\n')
print('built', OUT)

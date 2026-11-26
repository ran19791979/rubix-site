"""Pre-render: save the page's first render into index.html.

The site is built in the browser by JavaScript (app.js fills #dc-root from <template id="dc-tpl">).
People never notice, but tools that read only the raw HTML (many AI tools, link readers) see an
empty page. This opens the freshly built page in headless Chrome, takes #dc-root right after the
first render, and writes it into index.html. In the browser, app.js then diffs against it (morphdom),
so visitors get the same page as before, just with the content already there.

usage: python3 tools/prerender.py public        (or public/v2)
"""
import functools, http.server, os, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ROOT + '/public')
PUBLIC = ROOT + '/public'
sub = os.path.relpath(OUT, PUBLIC)
path = '/' if sub == '.' else '/' + sub.replace(os.sep, '/') + '/'
index = OUT + '/index.html'
EMPTY = '<div id="dc-root"></div>'

html = open(index, encoding='utf-8').read()
assert html.count(EMPTY) == 1, 'index.html must hold one empty #dc-root (run build.py first)'

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
handler = functools.partial(Quiet, directory=PUBLIC)
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()

GRAB = '''() => {
  const r = document.getElementById('dc-root').cloneNode(true);
  // scroll-reveal state belongs to the visitor's browser, not to the saved page
  r.querySelectorAll('.rv-in').forEach((el) => el.classList.remove('rv-in'));
  return r.innerHTML;
}'''

try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True)
        pg = b.new_page(viewport={'width': 1280, 'height': 900})
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        # only the page itself matters here: skip video, fonts and anything off-site
        pg.route('**/*', lambda r: r.abort() if (r.request.resource_type in ('media', 'font')
                 or not r.request.url.startswith('http://127.0.0.1')) else r.continue_())
        pg.goto(f'http://127.0.0.1:{srv.server_address[1]}{path}', wait_until='domcontentloaded')
        pg.wait_for_function("document.getElementById('dc-root').children.length > 0")
        inner = pg.evaluate(GRAB)
        b.close()
    assert not errors, 'page errors while pre-rendering: %s' % errors
    assert '{{' not in inner, 'pre-rendered page still has template holes'
finally:
    srv.shutdown()

open(index, 'w', encoding='utf-8').write(html.replace(EMPTY, '<div id="dc-root">' + inner + '</div>'))
print('pre-rendered', index, '(%d KB of page content)' % (len(inner.encode()) // 1024))

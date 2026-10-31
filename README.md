# Rubix Solutions — אתר

האתר השיווקי של Rubix Solutions: דשבורדים, אתרים, אוטומציות וסוכני AI לעסקים.

## מבנה

- `src/Main.dc.html` — המקור של האתר: התבנית, העיצוב והלוגיקה.
- `tools/build.py` — בונה מהמקור את `public/index.html` ואת `public/app.js`.
- `public/` — מה שעולה לאוויר. Vercel מגיש את התיקייה הזו כמו שהיא, בלי שלב build.
- `public/media/` — הסרטונים (9:16), התצוגות המקדימות (16:9, WebP מונפש), תמונות פוסטר ותמונות סטטיות למי שביקש פחות תנועה.

## עדכון

```bash
python3 tools/build.py   # אחרי כל שינוי ב-src/Main.dc.html
git add -A && git commit -m "..." && git push   # Vercel מעלה אוטומטית
```

## הערות

- כרגע האתר מסומן `noindex` (מטא-תג ו-`robots.txt`), כי הוא עדיין לא בשימוש עסקי. כשעוברים ל-Vercel Pro ומחברים דומיין, מסירים את שניהם.
- המוזיקה בסרטונים הולחנה במיוחד, עם דגימות FluidR3 GM של Frank Wen (CC BY 3.0). הקרדיט מופיע בתחתית האתר.
- `tools/vendor/morphdom-umd.min.js` — ספריית morphdom (רישיון MIT).

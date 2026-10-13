// Layout component'i: tüm sayfaların ortak iskeleti
// Her sayfa sadece kendi içeriğini (content) ve kodunu (script) verir,
// <head> ve tasarım (style) burada bir kere yazılır.

function layout(title, content, script) {
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; background: #1e1e2e; margin: 0; padding: 40px 16px; color: #cdd6f4; }

        /* ---------- Anasayfa ---------- */
        .home { max-width: 720px; margin: 40px auto 0; }
        .eyebrow { display: inline-block; font-size: 13px; letter-spacing: 3px; color: #fab387; border: 1px solid #45475a; border-radius: 999px; padding: 6px 14px; }
        .home h1 { font-size: 48px; line-height: 1.1; margin: 24px 0 16px; font-weight: 800; letter-spacing: -1px; }
        .home h1 .accent { color: #fab387; }
        .lead { font-size: 18px; line-height: 1.6; color: #a6adc8; max-width: 520px; margin: 0 0 40px; }

        .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .tile { display: block; background: #2b2b3c; border: 1px solid #45475a; border-radius: 20px; padding: 28px; text-decoration: none; color: inherit; transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
        .tile:hover { transform: translateY(-4px); border-color: #fab387; box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
        .tile-number { font-size: 14px; font-weight: bold; color: #fab387; letter-spacing: 2px; }
        .tile h3 { font-size: 26px; margin: 12px 0 8px; }
        .tile p { color: #a6adc8; line-height: 1.5; margin: 0 0 24px; }
        .tile-link { font-weight: bold; color: #fab387; border-bottom: 2px solid #fab387; padding-bottom: 2px; }

        /* ---------- Kart (sayaç ve hesap makinesi) ---------- */
        .card { background: #2b2b3c; border-radius: 24px; padding: 24px; width: 300px; max-width: 100%; box-sizing: border-box; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; }
        h2 { margin: 0 0 16px; font-weight: normal; letter-spacing: 1px; }
        .back { display: inline-block; margin-top: 20px; color: #a6adc8; text-decoration: none; }
        .back:hover { color: #fab387; }

        /* Ekran (sonuç) */
        .screen { background: #11111b; border-radius: 12px; padding: 16px; margin-bottom: 16px; text-align: right; }
        .screen .small { color: #7f849c; font-size: 16px; min-height: 20px; }
        .screen .big { color: #a6e3a1; font-size: 40px; font-weight: bold; overflow-x: auto; }
        .screen .big.error { color: #f38ba8; font-size: 18px; }

        /* Sayı kutuları */
        input { width: 100%; box-sizing: border-box; font-size: 22px; padding: 12px; margin-bottom: 10px; border: 2px solid #45475a; border-radius: 12px; background: #313244; color: #cdd6f4; text-align: right; outline: none; }
        input:focus { border-color: #fab387; }

        /* Butonlar */
        .buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px; }
        .buttons.three { grid-template-columns: 1fr 1fr 1fr; }
        .btn { display: block; font-size: 24px; padding: 14px; border: none; border-radius: 12px; background: #fab387; color: #1e1e2e; cursor: pointer; text-decoration: none; }
        .btn:hover { background: #f9c49f; }
        .btn:active { transform: scale(0.95); }
        .btn.gray { background: #45475a; color: #cdd6f4; font-size: 18px; }
        .btn.gray:hover { background: #585b70; }

        /* Telefon ekranı */
        @media (max-width: 500px) {
            .home { margin-top: 0; }
            .home h1 { font-size: 34px; }
        }
    </style>
</head>
<body>
    ${content}

    <script>
        ${script}
    </script>
</body>
</html>
    `;
}

module.exports = layout;

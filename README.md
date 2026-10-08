# HOWXM Server — noticias en tiempo real

Servidor sin dependencias (solo Node 18+) que junta noticias, las etiqueta y las empuja por **WebSocket** a la página HOWXM (`public/index.html`).

## Arrancar
```
node server.js          # o: npm start
MOCK=1 node server.js   # modo demo con noticias falsas (para ver la interfaz)
```
Abre http://localhost:3000 . La página y el WebSocket (`/ws`) salen del mismo servidor, así que se conectan solos.
Copia `.env.example` a `.env` si quieres añadir claves de API.

## Qué hace
- Lee feeds RSS (FXStreet, Investing.com, MarketWatch, Benzinga, Cointelegraph, CoinDesk) cada 60 s. Los que fallen se omiten y se reintentan más despacio. **Verifica en tu red cuáles responden**: algunos medios bloquean servidores o cambian sus URLs.
- Opcional con clave gratuita: Finnhub (60/min), Alpha Vantage (25/día, trae sentimiento), Polygon (5/min), NewsAPI (solo desarrollo).
- Calendario económico de hoy (alto y medio impacto) desde un JSON **no oficial** de Forex Factory. Puede dejar de funcionar; apágalo con `CALENDAR=0`.
- Quita duplicados y **filtra ruido** (bajo impacto y sin activo relacionado). `FILTER_NOISE=0` para verlo todo.
- Etiqueta por activo (#XAUUSD, #BTCUSD, #EURUSD, #USD, #OIL, #TSLA...), impacto (alto/medio/bajo) y tono (alcista/bajista/neutral) con reglas locales sobre el titular.
- Guarda solo titular, enlace y fuente. Cada noticia enlaza a su fuente original ("Fuente: ...").
- Las claves viven solo en el servidor; el navegador nunca las ve.

## Publicarlo (para que funcione 24/7)
Cualquier hosting con Node: Render, Railway, Fly.io o un VPS. Comando de inicio `node server.js`. Las variables de `.env` se ponen en el panel del hosting. Usa HTTPS: la página usará `wss://` automáticamente.

## Límites reales (léelos)
- **No es tick a tick.** RSS cada 60 s implica 30–60 s de retraso típico. Para publicar un dato como el IPC al segundo hacen falta fuentes de pago (Benzinga Pro, Polygon de pago, Bloomberg/Reuters licenciados). No prometas velocidad que el plan gratis no da.
- **Reuters y Bloomberg no tienen RSS público**; no están incluidos. Trading Economics, Tiingo y Financial Modeling Prep no se incluyen porque no pude confirmar que sus noticias sean gratuitas: añádelos con `EXTRA_RSS` o ampliando `server.js` si tienes plan.
- NewsAPI gratis: retraso de 24 h y prohibido en producción. Déjalo vacío al publicar.
- Etiquetas, impacto y tono son **reglas automáticas**: orientativas, con errores. No son opinión de inversión.
- Revisa los términos de uso de cada fuente antes de publicar comercialmente.

## Pruebas hechas
Servidor, WebSocket, deduplicación, filtro de ruido, etiquetado y la conexión de la página se probaron con un feed local y modo MOCK. **No pude probar contra las APIs ni los medios reales** (el entorno donde se construyó no tiene internet): al arrancar, la consola indica con `[!]` qué fuente falló.

## Aviso legal
La información contenida en este sitio no constituye asesoramiento financiero ni recomendación de inversión. El trading con CFD implica alto riesgo de pérdida.

const express = require('express');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const ai = new GoogleGenAI({ apiKey: apiKey });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const AFFILIATE_CONFIG = {
  booking_cj_base: process.env.BOOKING_CJ_URL || 'https://www.tkqlhce.com/click-101855046-15734352',
  civitatis_id: process.env.CIVITATIS_ID || 'TU_ID_CIVITATIS',
  getyourguide_id: process.env.GYG_ID || 'TU_ID_GETYOURGUIDE'
};

const ADSENSE_CLIENT = 'ca-pub-8779323563449877';

function generarLinkBooking(destino) {
  const urlDestino = `https://www.booking.com/searchresults.es.html?ss=${encodeURIComponent(destino)}`;
  return `${AFFILIATE_CONFIG.booking_cj_base}?url=${encodeURIComponent(urlDestino)}`;
}

// ---------------------------------------------------------------------------
// Artículos Editoriales Fijos para Google AdSense
// ---------------------------------------------------------------------------
const GUIAS_EDITORIALES = {
  roma: {
    titulo: "Guía completa de Roma en 4 días: qué ver y consejos de transporte",
    descripcion: "Plan de viaje paso a paso para visitar Roma: Coliseo, Trastevere, Vaticano y los mejores rincones gastronómicos.",
    contenido: `
      <h2>Cómo planificar tu escapada a Roma</h2>
      <p>Roma es un museo al aire libre que combina milenios de historia imperial y renacentista. Para aprovechar una estancia de 4 días al máximo, la clave reside en agrupar las visitas por cercanía geográfica y evitar cruzar el centro histórico innecesariamente.</p>
      <h3>Día 1: El corazón imperial y el barrio de Monti</h3>
      <p>Comienza tu recorrido descubriendo el Coliseo Romano y los Foros Imperiales. Al terminar, la colina del Palatino ofrece unas de las mejores vistas panorámicas. Por la tarde, piérdete por las calles adoquinadas del barrio de Monti, uno de los distritos con más encanto bohemio.</p>
      <h3>Día 2: El centro barroco y el Trastevere</h3>
      <p>Dedica la mañana al Panteón de Agripa y a la monumental Piazza Navona. Al cruzar el río Tíber al atardecer, el barrio de Trastevere cobra vida con sus pintorescas plazas ideales para cenar.</p>
      <h3>Día 3: Museos Vaticanos y Castel Sant'Angelo</h3>
      <p>Visita la Basílica de San Pedro y los Museos Vaticanos. Tras contemplar la Capilla Sixtina, camina junto al río hasta llegar a Castel Sant'Angelo.</p>
    `
  },
  paris: {
    titulo: "Guía de París en 4 días: ruta paso a paso y consejos para viajeros",
    descripcion: "Descubre cómo organizar tu viaje a París visitando la Torre Eiffel, Montmartre, el Barrio Latino y los museos esenciales.",
    contenido: `
      <h2>Organización básica para tu primer viaje a París</h2>
      <p>París se divide en 20 distritos en espiral. La mejor estrategia para recorrer la capital francesa sin cansancio es dedicar cada jornada a dos o tres distritos contiguos.</p>
      <h3>Día 1: Île de la Cité y el Barrio Latino</h3>
      <p>Descubre la Catedral de Notre-Dame y la impresionante Sainte-Chapelle. Pasea por las librerías históricas del Barrio Latino y el río Sena.</p>
      <h3>Día 2: Campos Elíseos y Torre Eiffel</h3>
      <p>Desde la Plaza de la Concordia hasta el Arco del Triunfo y el Campo de Marte para ver la Torre Eiffel iluminada.</p>
      <h3>Día 3: El arte bohemio de Montmartre</h3>
      <p>Sube a la Basílica del Sagrado Corazón, recorre la Place du Tertre y baja hacia el Palais Garnier.</p>
    `
  },
  londres: {
    titulo: "Guía de Londres en 4 días: imprescindibles, museos y barrios",
    descripcion: "Itinerario optimizado para visitar Londres: Westminster, la City, Tower Bridge, Camden y Kensington.",
    contenido: `
      <h2>Consejos clave para moverte por Londres</h2>
      <p>Londres es accesible gracias a su red de metro y autobuses. Pagar con tarjeta contactless es la forma más rápida de viajar.</p>
      <h3>Día 1: Westminster y Buckingham Palace</h3>
      <p>Visita el Big Ben, el Parlamento y la Abadía de Westminster. Pasea por St. James's Park hasta Buckingham.</p>
      <h3>Día 2: La City y Tower Bridge</h3>
      <p>Catedral de San Pablo, el cruce de Tower Bridge y la histórica Torre de Londres.</p>
    `
  },
  praga: {
    titulo: "Guía de Praga: ruta por la Ciudad Vieja y el Castillo",
    descripcion: "Todo lo que necesitas saber para visitar la Ciudad de las Cien Torres.",
    contenido: `
      <h2>Por qué Praga es el destino perfecto para una escapada</h2>
      <p>Praga destaca por su casco histórico patrimonio de la UNESCO y su facilidad para recorrerla a pie.</p>
      <h3>Día 1: Ciudad Vieja y Puente de Carlos</h3>
      <p>Reloj Astronómico, Plaza de la Ciudad Vieja y cruce sobre el Moldava hacia Malá Strana.</p>
      <h3>Día 2: El Castillo de Praga</h3>
      <p>Catedral de San Vito, Palacio Real y los miradores de Letná.</p>
    `
  }
};

const ITINERARIOS_BASE = {
  praga: [
    {
      titulo: "Ciudad Vieja, Torre del Ayuntamiento y Puente de Carlos",
      actividades: [
        { hora: "16:00", nombre: "Plaza de la Ciudad Vieja y Reloj Astronómico", descripcion: "Paseo por el centro neurálgico admirando la arquitectura gótica.", tipo: "atraccion", busqueda: "Plaza de la Ciudad Vieja Praga" },
        { hora: "17:30", nombre: "Torre del Ayuntamiento Antiguo", descripcion: "Subida al mirador panorámico sobre los tejados del casco antiguo.", tipo: "tour", busqueda: "Torre del Ayuntamiento Antiguo Praga" },
        { hora: "19:00", nombre: "Paseo por el Puente de Carlos", descripcion: "Cruce a pie sobre el río Moldava.", tipo: "atraccion", busqueda: "Puente de Carlos Praga" },
        { hora: "20:30", nombre: "Cena en Laboratorio della pinsa", descripcion: "Pinsas artesanales en el entorno histórico.", tipo: "resto" }
      ]
    },
    {
      titulo: "Castillo de Praga, Malá Strana e Isla de Kampa",
      actividades: [
        { hora: "09:30", nombre: "Desayuno en Mistcoffee", descripcion: "Punto de partida hacia la colina del Castillo.", tipo: "resto" },
        { hora: "10:30", nombre: "Complejo del Castillo de Praga y Catedral de San Vito", descripcion: "Recorrido por los patios del castillo y el Callejón del Oro.", tipo: "tour", busqueda: "Castillo de Praga" },
        { hora: "13:30", nombre: "Almuerzo en Malostranská Beseda", descripcion: "Gastronomía tradicional checa.", tipo: "resto" },
        { hora: "16:30", nombre: "Isla de Kampa y Muro de John Lennon", descripcion: "Paseo por el canal del Diablo.", tipo: "atraccion", busqueda: "Muro de John Lennon Praga" }
      ]
    }
  ],
  viena: [
    {
      titulo: "Palacios de la Ringstraße, Arte y Centro Barroco",
      actividades: [
        { hora: "15:15", nombre: "Palacio Belvedere", descripcion: "Recorrido por los jardines barrocos y la colección de Gustav Klimt.", tipo: "tour", busqueda: "Palacio Belvedere Viena" },
        { hora: "18:00", nombre: "Peterskirche", descripcion: "Visita al templo barroco con mejor decoración interior.", tipo: "atraccion", busqueda: "Peterskirche Viena" },
        { hora: "20:30", nombre: "Cena en Pinsatore", descripcion: "Pinsa y cocina italiana en el centro de Viena.", tipo: "resto" }
      ]
    }
  ],
  roma: [
    {
      titulo: "Barrio de Monti, San Juan de Letrán y Vistas al Coliseo",
      actividades: [
        { hora: "11:30", nombre: "Archibasílica de San Juan de Letrán", descripcion: "Visita a la catedral de Roma y primera basílica mayor.", tipo: "atraccion", busqueda: "San Juan de Letran Roma" },
        { hora: "13:30", nombre: "Monumento a Vittorio Emanuele II", descripcion: "Paseo hacia el altar de la Patria con vistas a la Piazza Venezia.", tipo: "atraccion", busqueda: "Monumento Vittorio Emanuele Roma" },
        { hora: "14:15", nombre: "Almuerzo en Tonnarello", descripcion: "Pasta tradicional romana.", tipo: "resto" },
        { hora: "17:00", nombre: "Paseo exterior por el Coliseo Romano", descripcion: "El anfiteatro Flavio al atardecer.", tipo: "tour", busqueda: "Coliseo Romano" }
      ]
    }
  ],
  granada: [
    {
      titulo: "Casco Histórico y Albaicín",
      actividades: [
        { hora: "12:45", nombre: "Plaza Nueva y Carrera del Darro", descripcion: "Paseo por una de las calles más bonitas de España.", tipo: "atraccion", busqueda: "Carrera del Darro Granada" },
        { hora: "14:00", nombre: "Comida de tapas en Bar Aixa", descripcion: "Tapas tradicionales en el Albaicín.", tipo: "resto" },
        { hora: "18:00", nombre: "Mirador de San Nicolás", descripcion: "Atardecer panorámico con la Alhambra de fondo.", tipo: "atraccion", busqueda: "Mirador de San Nicolas Granada" }
      ]
    },
    {
      titulo: "La Alhambra y el Realejo",
      actividades: [
        { hora: "09:00", nombre: "Conjunto Monumental de la Alhambra", descripcion: "Visita completa a los Palacios Nazaríes, Generalife y Alcazaba.", tipo: "tour", busqueda: "Entradas Alhambra de Granada" },
        { hora: "14:00", nombre: "Comida en Los Manueles", descripcion: "Cocina tradicional andaluza.", tipo: "resto" },
        { hora: "17:00", nombre: "Barrio del Realejo", descripcion: "Paseo por el antiguo barrio judío.", tipo: "atraccion", busqueda: "Barrio Realejo Granada" }
      ]
    }
  ]
};

const CIUDADES_SUGERIDAS = [
  "Madrid", "Barcelona", "Sevilla", "Valencia", "Granada", "Bilbao", "San Sebastián",
  "París", "Londres", "Roma", "Viena", "Praga", "Oporto", "Lisboa", "Berlín", "Múnich",
  "Ámsterdam", "Bruselas", "Budapest", "Venecia", "Florencia", "Tokio", "Nueva York"
];

function normalizarCiudad(texto) {
  return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function capitalizar(texto) {
  return (texto || '').trim().split(/\s+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatearItinerario(destinoFormateado, diasPlantilla) {
  const bookingLink = generarLinkBooking(destinoFormateado);

  return diasPlantilla.map((plantilla, index) => {
    const actividadesFormateadas = (plantilla.actividades || []).map(act => {
      const linkAfiliado = (act.tipo === 'tour' || act.tipo === 'atraccion')
        ? `https://www.civitatis.com/es/buscar/?q=${encodeURIComponent((act.busqueda || act.nombre) + ' ' + destinoFormateado)}&a=${AFFILIATE_CONFIG.civitatis_id}`
        : null;

      return {
        hora: act.hora || "10:00",
        nombre: act.nombre,
        descripcion: act.descripcion,
        link_afiliado: linkAfiliado,
        texto_boton: act.tipo === 'tour' ? '🎟️ Ver visitas guiadas' : '🎟️ Reservar entradas'
      };
    });

    return {
      dia: index + 1,
      titulo: plantilla.titulo,
      actividades: actividadesFormateadas,
      hotel_recomendado: {
        nombre: `Alojamiento céntrico en ${destinoFormateado}`,
        descripcion: "Hoteles recomendados con valoración excelente y cancelación flexible.",
        booking_link: bookingLink,
        texto_boton: "🏨 Ver hoteles en Booking"
      }
    };
  });
}

// ---------------------------------------------------------------------------
// IA con el modelo original que tenías funcionando
// ---------------------------------------------------------------------------
async function generarItinerarioIA(destinoFormateado) {
  const prompt = `
    Eres un guía de viajes experto que diseña itinerarios turísticos optimizados por cercanía geográfica.
    Crea un itinerario turístico completo y realista para la ciudad de "${destinoFormateado}", de entre 3 y 4 días,
    agrupando cada día por zonas cercanas entre sí para minimizar desplazamientos.
    Incluye los monumentos, museos y lugares más emblemáticos, así como recomendaciones de restaurantes
    reales para desayuno/almuerzo/cena cuando tenga sentido en el horario.

    Devuelve ÚNICAMENTE un objeto JSON válido, sin bloques markdown, con esta forma exacta:
    {
      "dias": [
        {
          "titulo": "Título breve y descriptivo de la zona o temática del día",
          "actividades": [
            {
              "hora": "09:00",
              "nombre": "Nombre del lugar, atracción o restaurante",
              "descripcion": "Descripción concisa y útil (una o dos frases)",
              "tipo": "atraccion",
              "busqueda": "Nombre corto y preciso del lugar para buscarlo (sin la ciudad)"
            }
          ]
        }
      ]
    }

    Usa "tipo": "resto" para comidas, "tipo": "tour" para visitas guiadas o monumentos con entrada,
    y "tipo": "atraccion" para paseos, miradores, plazas o lugares de acceso libre.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  let textoLimpio = (response.text || '').trim();
  if (textoLimpio.startsWith('```')) {
    textoLimpio = textoLimpio.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
  }

  const datos = JSON.parse(textoLimpio);
  if (!datos.dias || !Array.isArray(datos.dias) || datos.dias.length === 0) {
    throw new Error("La IA no devolvió un itinerario válido.");
  }
  return datos.dias;
}

async function obtenerItinerarioCompleto(destinoRaw) {
  const destinoNormalizado = normalizarCiudad(destinoRaw);
  if (!destinoNormalizado) throw new Error("Indica el nombre de una ciudad.");

  const destinoFormateado = capitalizar(destinoRaw);
  let diasPlantilla = ITINERARIOS_BASE[destinoNormalizado] || await generarItinerarioIA(destinoFormateado);

  const itinerario = formatearItinerario(destinoFormateado, diasPlantilla);
  return { destino: destinoFormateado, duracion_dias: itinerario.length, itinerario };
}

const PAGE_STYLES = `
  :root {
    --bg: #0c1120; --bg-elevated: #121933; --bg-ticket: #141b38;
    --line: #2a3358; --line-soft: #1c2444; --brass: #c9a55c;
    --cream: #f3efe3; --slate: #a4abc4; --slate-dim: #6d7492;
    --radius: 14px;
    --font-display: 'Fraunces', serif; --font-body: 'Inter', sans-serif;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--cream); font-family: var(--font-body); min-height: 100vh; display: flex; flex-direction: column; }
  a { color: inherit; text-decoration: none; }
  .site-header { position: sticky; top: 0; z-index: 40; border-bottom: 1px solid var(--line-soft); background: rgba(12, 17, 32, 0.95); }
  .header-inner { max-width: 1080px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.8rem; }
  .brand { font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; }
  .brand span { color: var(--brass); }
  .nav-links { display: flex; gap: 1rem; font-size: 0.85rem; }
  .nav-links a:hover { color: var(--brass); }
  .hero { max-width: 1080px; margin: 0 auto; padding: 3rem 1.5rem 2rem; }
  .hero h1 { font-family: var(--font-display); font-size: 2.4rem; margin: 0 0 1rem; }
  .hero h1 em { font-style: italic; color: var(--brass); }
  .ticket-search { display: flex; background: var(--bg-ticket); border: 1px solid var(--line); border-radius: 10px; padding: 0.4rem; gap: 0.4rem; max-width: 560px; }
  .ticket-search input { background: transparent; border: none; color: var(--cream); font-size: 1rem; padding: 0.6rem 1rem; width: 100%; outline: none; }
  .btn-primary { background: var(--brass); color: #241a06; border: none; border-radius: 8px; padding: 0.7rem 1.4rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
  .content-wrap { max-width: 860px; margin: 0 auto; padding: 1.5rem 1.5rem 4rem; line-height: 1.6; color: var(--slate); }
  .content-wrap h1, .content-wrap h2, .content-wrap h3 { color: var(--cream); font-family: var(--font-display); }
  .ticket-card { background: var(--bg-ticket); border: 1px solid var(--line); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 1.5rem; }
  .ticket-day-title { font-family: var(--font-display); font-size: 1.2rem; margin: 0 0 1rem; color: var(--cream); }
  .activity { padding: 0.8rem 0; border-bottom: 1px solid var(--line-soft); }
  .activity:last-child { border-bottom: none; }
  .hotel-strip { display: flex; justify-content: space-between; align-items: center; background: var(--bg-elevated); padding: 1rem; border-radius: 8px; margin-top: 1rem; flex-wrap: wrap; gap: 0.6rem; }
  .btn-secondary { background: var(--brass); color: #241a06; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; font-size: 0.82rem; }
  .site-footer { border-top: 1px solid var(--line-soft); padding: 2rem 1.5rem; text-align: center; font-size: 0.8rem; color: var(--slate-dim); margin-top: auto; }
  .footer-links { display: flex; justify-content: center; gap: 1rem; margin-top: 0.6rem; }
`;

function layoutHTML({ title, description, bodyContent, adsEnabled }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="google-adsense-account" content="${ADSENSE_CLIENT}">
  <meta name="google-site-verification" content="Vii3WeiNwCTwLypr6cLhZhTmONQ_7LN3WWs970TQt0c" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)">
  <link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossorigin>
  <link href="[https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600&display=swap](https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600&display=swap)" rel="stylesheet">
  <style>${PAGE_STYLES}</style>
  ${adsEnabled ? `<script async src="[https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=$](https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=$){ADSENSE_CLIENT}" crossorigin="anonymous"></script>` : ''}
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="/">Itinerario<span>.</span></a>
      <nav class="nav-links">
        <a href="/">Inicio</a>
        <a href="/guia/roma">Guía Roma</a>
        <a href="/guia/paris">Guía París</a>
        <a href="/guia/londres">Guía Londres</a>
        <a href="/guia/praga">Guía Praga</a>
      </nav>
    </div>
  </header>

  ${bodyContent}

  <footer class="site-footer">
    <p>Itinerario — Rutas estructuradas por cercanía geográfica.</p>
    <div class="footer-links">
      <a href="/privacidad.html">Política de privacidad</a>
      <a href="/avisolegal.html">Aviso legal</a>
      <a href="/cookies.html">Política de cookies</a>
    </div>
  </footer>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Rutas
// ---------------------------------------------------------------------------

app.get('/', (req, res) => {
  const bodyContent = `
    <section class="hero">
      <h1>Tu próximo viaje,<br><em>trazado</em> como un guía local.</h1>
      <p style="color:var(--slate); margin-bottom:1.5rem;">Escribe una ciudad para obtener una ruta optimizada día a día:</p>
      <form class="ticket-search" action="/itinerario" method="GET">
        <input type="text" name="destino" list="ciudades-sugeridas" placeholder="Roma, Tokio, Granada, París..." required />
        <datalist id="ciudades-sugeridas">
          ${CIUDADES_SUGERIDAS.map(c => `<option value="${escapeHtml(c)}"></option>`).join('')}
        </datalist>
        <button type="submit" class="btn-primary">Trazar ruta</button>
      </form>
    </section>
    <main class="content-wrap">
      <h2>Guías editoriales destacadas</h2>
      <p>Explora nuestras guías completas para escapadas urbanas paso a paso:</p>
      <ul>
        <li style="margin-bottom:0.5rem;"><a href="/guia/roma" style="color:var(--brass);"><strong>Guía de Roma en 4 días:</strong> Coliseo, Trastevere y ruta Vaticana &rarr;</a></li>
        <li style="margin-bottom:0.5rem;"><a href="/guia/paris" style="color:var(--brass);"><strong>Guía de París en 4 días:</strong> Torre Eiffel, Montmartre y Museo del Louvre &rarr;</a></li>
        <li style="margin-bottom:0.5rem;"><a href="/guia/londres" style="color:var(--brass);"><strong>Guía de Londres en 4 días:</strong> Westminster, la City y museos &rarr;</a></li>
        <li style="margin-bottom:0.5rem;"><a href="/guia/praga" style="color:var(--brass);"><strong>Guía de Praga en 3 días:</strong> Casco Antiguo y el Castillo &rarr;</a></li>
      </ul>
    </main>
  `;

  res.send(layoutHTML({
    title: "Itinerario — Rutas y Guías de Viaje Detalladas",
    description: "Generador de itinerarios de viaje y guías turísticas completas.",
    bodyContent,
    adsEnabled: false
  }));
});

app.get('/guia/:ciudad', (req, res) => {
  const ciudad = (req.params.ciudad || '').toLowerCase();
  const guia = GUIAS_EDITORIALES[ciudad];

  if (!guia) return res.redirect('/');

  const bodyContent = `
    <main class="content-wrap">
      <h1>${escapeHtml(guia.titulo)}</h1>
      ${guia.contenido}
      <div style="margin-top:2rem; padding:1.2rem; background:var(--bg-elevated); border-radius:10px; border:1px solid var(--line);">
        <p style="margin:0 0 0.8rem 0; font-weight:600; color:var(--cream);">¿Quieres ver el itinerario completo con hoteles recomendados?</p>
        <a href="/itinerario?destino=${encodeURIComponent(ciudad)}" class="btn-primary">Ver itinerario de ${capitalizar(ciudad)}</a>
      </div>
    </main>
  `;

  res.send(layoutHTML({
    title: `${guia.titulo} | Itinerario`,
    description: guia.descripcion,
    bodyContent,
    adsEnabled: true
  }));
});

app.get('/itinerario', async (req, res) => {
  const destino = (req.query.destino || '').toString().trim();
  if (!destino) return res.redirect('/');

  try {
    const data = await obtenerItinerarioCompleto(destino);
    const bodyContent = `
      <main class="content-wrap">
        <h1>Ruta recomendada en <em>${escapeHtml(data.destino)}</em></h1>
        <p style="margin-bottom:2rem;">Itinerario de ${data.duracion_dias} días organizado por cercanía geográfica:</p>
        
        ${data.itinerario.map(dia => `
          <article class="ticket-card">
            <h3 class="ticket-day-title">DÍA ${dia.dia}: ${escapeHtml(dia.titulo)}</h3>
            <div>
              ${dia.actividades.map(act => `
                <div class="activity">
                  <strong>${escapeHtml(act.hora)} - ${escapeHtml(act.nombre)}</strong>
                  <p style="margin:0.2rem 0; font-size:0.88rem;">${escapeHtml(act.descripcion)}</p>
                  ${act.link_afiliado ? `<a href="${escapeHtml(act.link_afiliado)}" target="_blank" rel="nofollow" style="color:var(--brass); font-size:0.8rem;">${escapeHtml(act.texto_boton)} &rarr;</a>` : ''}
                </div>
              `).join('')}
            </div>
            ${dia.hotel_recomendado ? `
              <div class="hotel-strip">
                <div>
                  <strong>${escapeHtml(dia.hotel_recomendado.nombre)}</strong>
                  <p style="margin:0; font-size:0.8rem; color:var(--slate-dim);">${escapeHtml(dia.hotel_recomendado.descripcion)}</p>
                </div>
                <a href="${escapeHtml(dia.hotel_recomendado.booking_link)}" target="_blank" rel="nofollow" class="btn-secondary">${escapeHtml(dia.hotel_recomendado.texto_boton)}</a>
              </div>
            ` : ''}
          </article>
        `).join('')}
      </main>
    `;

    res.send(layoutHTML({
      title: `Itinerario en ${data.destino} | Itinerario`,
      description: `Ruta turística completa por ${data.destino} día a día.`,
      bodyContent,
      adsEnabled: true
    }));
  } catch (error) {
    console.error("Error en /itinerario:", error);
    res.redirect('/');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
const express = require('express');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const ai = new GoogleGenAI({ apiKey: apiKey });

app.use(express.json());
app.use(express.static('public'));

const AFFILIATE_CONFIG = {
  // Tu enlace oficial de afiliado CJ para Booking.com
  booking_cj_base: process.env.BOOKING_CJ_URL || 'https://www.tkqlhce.com/click-101855046-15734352',
  civitatis_id: process.env.CIVITATIS_ID || 'TU_ID_CIVITATIS',
  getyourguide_id: process.env.GYG_ID || 'TU_ID_GETYOURGUIDE'
};

const ADSENSE_CLIENT = 'ca-pub-8779323563449877';

// ---------------------------------------------------------------------------
// Función para generar enlace oficial de comisiones de Booking mediante CJ
// ---------------------------------------------------------------------------
function generarLinkBooking(destino) {
  const urlDestino = `https://www.booking.com/searchresults.es.html?ss=${encodeURIComponent(destino)}`;
  return `${AFFILIATE_CONFIG.booking_cj_base}?url=${encodeURIComponent(urlDestino)}`;
}

// ---------------------------------------------------------------------------
// Artículos Editoriales Fijos para Google AdSense (Contenido de Alto Valor)
// ---------------------------------------------------------------------------
const GUIAS_EDITORIALES = {
  roma: {
    titulo: "Guía completa de Roma en 4 días: qué ver y consejos de transporte",
    descripcion: "Plan de viaje paso a paso para visitar Roma: Coliseo, Trastevere, Vaticano y los mejores rincones gastronómicos.",
    contenido: `
      <h2>Cómo planificar tu escapada a Roma</h2>
      <p>Roma es un museo al aire libre que combina milenios de historia imperial y renacentista. Para aprovechar una estancia de 4 días al máximo, la clave reside en agrupar las visitas por cercanía geográfica y evitar cruzar el centro histórico innecesariamente.</p>
      
      <h3>Día 1: El corazón imperial y el barrio de Monti</h3>
      <p>Comienza tu recorrido descubriendo el Coliseo Romano y los Foros Imperiales. Al terminar, la colina del Palatino ofrece unas de las mejores vistas panorámicas. Por la tarde, piérdete por las calles adoquinadas del barrio de Monti, uno de los distritos con más encanto bohemio, repleto de trattorias familiares y tiendas vintage.</p>

      <h3>Día 2: El centro barroco y el Trastevere</h3>
      <p>Dedica la mañana al Panteón de Agripa, una de las obras de ingeniería mejor conservadas de la antigüedad, y a la monumental Piazza Navona. Al cruzar el río Tíber al atardecer, el barrio de Trastevere cobra vida con sus pintorescas plazas, como Santa Maria in Trastevere, ideales para cenar pinsa o pasta tradicional.</p>

      <h3>Día 3: Museos Vaticanos y Castel Sant'Angelo</h3>
      <p>Es indispensable madrugar para visitar la Basílica de San Pedro y los Museos Vaticanos. Tras contemplar la Capilla Sixtina, camina junto al río hasta llegar a Castel Sant'Angelo para ver la puesta de sol sobre el puente de los Ángeles.</p>

      <h3>Consejos prácticos de transporte y alojamiento</h3>
      <p>El centro de Roma se recorre preferentemente a pie. Si buscas alojamiento, las zonas de Monti y Prati ofrecen una excelente relación entre cercanía a los monumentos y tranquilidad nocturna.</p>
    `
  },
  paris: {
    titulo: "Guía de París en 4 días: ruta paso a paso y consejos para viajeros",
    descripcion: "Descubre cómo organizar tu viaje a París visitando la Torre Eiffel, Montmartre, el Barrio Latino y los museos esenciales.",
    contenido: `
      <h2>Organización básica para tu primer viaje a París</h2>
      <p>París se divide en 20 distritos (arrondissements) en espiral. La mejor estrategia para recorrer la capital francesa sin cansancio es dedicar cada jornada a dos o tres distritos vecinos.</p>

      <h3>Día 1: Los orígenes en Île de la Cité y el Barrio Latino</h3>
      <p>El punto neurálgico es la Catedral de Notre-Dame y la impresionante Sainte-Chapelle, famosa por sus vidrieras góticas. Pasea después por las librerías históricas del Barrio Latino y termina con una caminata junto a los muelles del río Sena.</p>

      <h3>Día 2: El eje monumental y la Torre Eiffel</h3>
      <p>Comienza en la Plaza de la Concordia, recorre la avenida de los Campos Elíseos hasta el Arco del Triunfo y llega al Campo de Marte para ver la Torre Eiffel iluminarse al anochecer.</p>

      <h3>Día 3: El arte bohemio de Montmartre</h3>
      <p>Sube hasta la Basílica del Sagrado Corazón para admirar las vistas panorámicas. Explora la Place du Tertre y baja hacia las elegantes galerías comerciales de la Ópera Garnier.</p>

      <h3>Consejos de transporte y presupuesto</h3>
      <p>La red de metro de París es rápida y económica con abonos diarios. Para comer bien sin exceder el presupuesto, busca los menús del día (menu du jour) en bistrós de Le Marais.</p>
    `
  },
  londres: {
    titulo: "Guía de Londres en 4 días: imprescindibles, museos y barrios",
    descripcion: "Itinerario optimizado para visitar Londres: Westminster, la City, Tower Bridge, Camden y Kensington.",
    contenido: `
      <h2>Consejos clave para moverte por Londres</h2>
      <p>Londres es una metrópoli inmensa pero sumamente accesible gracias a su red de metro (Underground) y autobuses. Pagar con tarjeta contactless es la forma más rápida y económica de desplazarse.</p>

      <h3>Día 1: Westminster y la realeza británica</h3>
      <p>Inicia tu ruta en el Big Ben, el Palacio de Westminster y la Abadía de Westminster. Continúa cruzando St. James's Park hasta llegar al Palacio de Buckingham y The Mall.</p>

      <h3>Día 2: La City histórica y Tower Bridge</h3>
      <p>Descubre el contraste entre los rascacielos financieros y la Catedral de San Pablo. Cruza el icónico Tower Bridge y visita la histórica Torre de Londres a orillas del río Támesis.</p>

      <h3>Día 3: Museos gratuitos y el West End</h3>
      <p>Aprovecha la entrada libre al Museo Británico o a los museos de South Kensington. Al caer la tarde, pasea por las luces de Piccadilly Circus, Leicester Square y el animado mercado de Covent Garden.</p>
    `
  },
  praga: {
    titulo: "Guía de Praga: ruta por la Ciudad Vieja y el Castillo",
    descripcion: "Todo lo que necesitas saber para visitar la Ciudad de las Cien Torres: rutas, miradores y gastronomía tradicional checa.",
    contenido: `
      <h2>Por qué Praga es el destino perfecto para una escapada</h2>
      <p>Conocida como la Ciudad de las Cien Torres, Praga destaca por su casco histórico protegido por la UNESCO y por ser una de las ciudades más cómodas de recorrer a pie en Europa Central.</p>

      <h3>Día 1: Casco Antiguo y el Puente de Carlos</h3>
      <p>Comienza en la Plaza de la Ciudad Vieja para admirar el Reloj Astronómico. Al caer la tarde, cruza el emblemático Puente de Carlos hacia el barrio histórico de Malá Strana.</p>

      <h3>Día 2: El imponente Castillo de Praga</h3>
      <p>Sube a la colina del Castillo para visitar la Catedral de San Vito, el Palacio Real y el pintoresco Callejón del Oro. Termina con las vistas panorámicas desde los jardines de Letná.</p>
    `
  }
};

// ---------------------------------------------------------------------------
// Itinerarios curados a mano (sin coste de IA)
// ---------------------------------------------------------------------------
const ITINERARIOS_BASE = {
  praga: [
    {
      titulo: "Ciudad Vieja, Torre del Ayuntamiento y Puente de Carlos",
      actividades: [
        { hora: "16:00", nombre: "Plaza de la Ciudad Vieja y Reloj Astronómico", descripcion: "Paseo inicial por el centro neurálgico de Praga admirando la arquitectura gótica y barroca.", tipo: "atraccion", busqueda: "Plaza de la Ciudad Vieja Praga" },
        { hora: "17:30", nombre: "Torre del Ayuntamiento Antiguo", descripcion: "Subida al mirador panorámico para contemplar el atardecer sobre los tejados del casco antiguo.", tipo: "tour", busqueda: "Torre del Ayuntamiento Antiguo Praga" },
        { hora: "19:00", nombre: "Paseo por el Puente de Carlos", descripcion: "Cruce a pie sobre el río Moldava para descubrir las esculturas y el ambiente nocturno hacia Malá Strana.", tipo: "atraccion", busqueda: "Puente de Carlos Praga" },
        { hora: "20:30", nombre: "Cena en Laboratorio della pinsa", descripcion: "Pinsas artesanales en el entorno del barrio histórico.", tipo: "resto" }
      ]
    },
    {
      titulo: "Castillo de Praga, Malá Strana e Isla de Kampa",
      actividades: [
        { hora: "09:30", nombre: "Desayuno en Mistcoffee (Coffee Story)", descripcion: "Punto de partida antes de subir hacia la colina del Castillo.", tipo: "resto" },
        { hora: "10:30", nombre: "Complejo del Castillo de Praga y Catedral de San Vito", descripcion: "Recorrido por los patios del castillo, la catedral gótica y el Callejón del Oro.", tipo: "tour", busqueda: "Castillo de Praga" },
        { hora: "13:30", nombre: "Almuerzo en Malostranská Beseda", descripcion: "Gastronomía tradicional checa en la plaza principal de Malá Strana.", tipo: "resto" },
        { hora: "15:00", nombre: "Iglesia de San Nicolás e Iglesia de Sta. María de la Victoria", descripcion: "Visita al templo barroco monumental y a la famosa figura del Niño Jesús de Praga.", tipo: "atraccion", busqueda: "Iglesia de San Nicolas Mala Strana" },
        { hora: "16:30", nombre: "Isla de Kampa, Muro de John Lennon y Molino del Gran Prior", descripcion: "Paseo relajado por el canal del Diablo y la zona más bohemia a orillas del río.", tipo: "atraccion", busqueda: "Muro de John Lennon Praga" },
        { hora: "18:00", nombre: "Mirador del Parque Letná", descripcion: "Subida al parque elevado para obtener la foto icónica de todos los puentes de Praga alineados.", tipo: "atraccion", busqueda: "Mirador de Letna" },
        { hora: "20:30", nombre: "Cena en The Street burger", descripcion: "Hamburguesas de autor en un ambiente relajado.", tipo: "resto" }
      ]
    }
  ],
  viena: [
    {
      titulo: "Palacios de la Ringstraße, Arte y Centro Barroco",
      actividades: [
        { hora: "15:15", nombre: "Palacio Belvedere (Alto y Bajo)", descripcion: "Recorrido por los jardines barrocos y el palacio con la icónica colección de Gustav Klimt.", tipo: "tour", busqueda: "Palacio Belvedere Viena" },
        { hora: "18:00", nombre: "Peterskirche (Iglesia de San Pedro)", descripcion: "Visita a uno de los templos barrocos con mejor decoración interior de la ciudad.", tipo: "atraccion", busqueda: "Peterskirche Viena" },
        { hora: "19:00", nombre: "Museo Albertina", descripcion: "Exploración de las galerías artísticas situadas sobre uno de los bastiones de la muralla histórica.", tipo: "tour", busqueda: "Museo Albertina Viena" },
        { hora: "20:30", nombre: "Cena en Pinsatore", descripcion: "Pinsa y cocina italiana en el centro de Viena.", tipo: "resto" }
      ]
    }
  ],
  roma: [
    {
      titulo: "Barrio de Monti, San Juan de Letrán y Vistas al Coliseo",
      actividades: [
        { hora: "11:30", nombre: "Archibasílica de San Juan de Letrán", descripcion: "Visita a la catedral de Roma y primera basílica mayor de la cristiandad.", tipo: "atraccion", busqueda: "San Juan de Letran Roma" },
        { hora: "13:30", nombre: "Monumento a Vittorio Emanuele II y Piazza Venezia", descripcion: "Paseo hacia el altar de la Patria con sus imponentes terrazas de mármol.", tipo: "atraccion", busqueda: "Monumento Vittorio Emanuele Roma" },
        { hora: "14:15", nombre: "Almuerzo en Tonnarello", descripcion: "Comida de pasta tradicional en el entorno del barrio histórico.", tipo: "resto" },
        { hora: "17:00", nombre: "Paseo exterior por el Coliseo Romano al atardecer", descripcion: "Primera toma de contacto con el anfiteatro Flavio iluminado.", tipo: "tour", busqueda: "Coliseo Romano" }
      ]
    }
  ]
};

const CIUDADES_SUGERIDAS = [
  "Madrid", "Barcelona", "Sevilla", "Valencia", "Granada", "Bilbao", "San Sebastián",
  "París", "Londres", "Roma", "Viena", "Praga", "Oporto", "Lisboa", "Berlín", "Múnich",
  "Ámsterdam", "Bruselas", "Budapest", "Venecia", "Florencia", "Tokio", "Nueva York"
];

// ---------------------------------------------------------------------------
// Utilidades compartidas
// ---------------------------------------------------------------------------
function normalizarCiudad(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function capitalizar(texto) {
  return texto.trim().split(/\s+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function limpiarUrl(url) {
  if (!url) return null;
  let limpia = url.replace(/[\[\]\(\)]/g, '').trim();
  const match = limpia.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : limpia;
}

function codigoCiudad(nombre) {
  const limpio = (nombre || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const palabras = limpio.split(/\s+/).filter(Boolean);
  if (palabras.length > 1) return (palabras[0][0] + palabras[1].slice(0, 2)).toUpperCase();
  return limpio.slice(0, 3).toUpperCase();
}

function esActividadResto(act) {
  return act.link_afiliado === null && (
    act.descripcion.toLowerCase().includes('cena') ||
    act.descripcion.toLowerCase().includes('almuerzo') ||
    act.descripcion.toLowerCase().includes('comida') ||
    act.descripcion.toLowerCase().includes('desayuno')
  );
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
        direccion: `${destinoFormateado}, Centro`,
        valoracion: (4.6 + (Math.random() * 0.3)).toFixed(1),
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

async function generarItinerarioIA(destinoFormateado) {
  const prompt = `
    Eres un guía de viajes experto que diseña itinerarios turísticos optimizados por cercanía geográfica.
    Crea un itinerario turístico completo para "${destinoFormateado}", de 3 o 4 días,
    agrupando paradas por zonas cercanas para minimizar desplazamientos.
    Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura:
    {
      "dias": [
        {
          "titulo": "Título de la zona o día",
          "actividades": [
            {
              "hora": "09:00",
              "nombre": "Nombre del monumento o restaurante",
              "descripcion": "Descripción concisa y de utilidad",
              "tipo": "atraccion" | "tour" | "resto",
              "busqueda": "Nombre corto de búsqueda"
            }
          ]
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  let textoLimpio = response.text.trim();
  if (textoLimpio.startsWith('```')) {
    textoLimpio = textoLimpio.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
  }

  const datos = JSON.parse(textoLimpio);
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

// ---------------------------------------------------------------------------
// Vistas HTML y Estilos
// ---------------------------------------------------------------------------
const PAGE_STYLES = `
  :root {
    --bg: #0c1120; --bg-elevated: #121933; --bg-ticket: #141b38;
    --line: #2a3358; --line-soft: #1c2444; --brass: #c9a55c; --brass-soft: rgba(201, 165, 92, 0.14);
    --teal: #57a693; --cream: #f3efe3; --slate: #a4abc4; --slate-dim: #6d7492;
    --radius: 16px; --shadow: 0 20px 60px -20px rgba(0,0,0,0.6);
    --font-display: 'Fraunces', serif; --font-body: 'Inter', -apple-system, sans-serif; --font-mono: 'IBM Plex Mono', monospace;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--cream); font-family: var(--font-body); min-height: 100vh; display: flex; flex-direction: column; }
  a { color: inherit; text-decoration: none; }
  .site-header { position: sticky; top: 0; z-index: 40; border-bottom: 1px solid var(--line-soft); background: rgba(12, 17, 32, 0.88); backdrop-filter: blur(10px); }
  .header-inner { max-width: 1080px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.8rem; }
  .brand { display: flex; align-items: center; gap: 0.6rem; font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; }
  .brand span { color: var(--brass); }
  .nav-links { display: flex; gap: 1rem; font-size: 0.85rem; flex-wrap: wrap; }
  .nav-links a:hover { color: var(--brass); }
  .hero { max-width: 1080px; margin: 0 auto; padding: 3.5rem 1.5rem 2.5rem; }
  .hero h1 { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); margin: 0 0 1rem; }
  .hero h1 em { font-style: italic; color: var(--brass); }
  .ticket-search { display: flex; background: var(--bg-ticket); border: 1px solid var(--line); border-radius: 12px; padding: 0.4rem; gap: 0.4rem; max-width: 560px; }
  .ticket-search input { background: transparent; border: none; color: var(--cream); font-size: 1rem; padding: 0.6rem 1rem; width: 100%; outline: none; }
  .btn-primary { background: var(--brass); color: #241a06; border: none; border-radius: 8px; padding: 0.7rem 1.4rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
  .btn-primary:hover { background: #d9b874; }
  .content-wrap { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem 5rem; line-height: 1.7; color: var(--slate); }
  .content-wrap h1, .content-wrap h2, .content-wrap h3 { color: var(--cream); font-family: var(--font-display); }
  .content-wrap p { margin-bottom: 1.2rem; font-size: 0.96rem; }
  .ticket-card { background: var(--bg-ticket); border: 1px solid var(--line); border-radius: var(--radius); padding: 1.8rem; margin-bottom: 1.8rem; }
  .ticket-day-title { font-family: var(--font-display); font-size: 1.3rem; margin: 0 0 1.2rem; color: var(--cream); }
  .activity { padding: 0.8rem 0; border-bottom: 1px solid var(--line-soft); }
  .activity:last-child { border-bottom: none; }
  .hotel-strip { display: flex; justify-content: space-between; align-items: center; background: var(--bg-elevated); padding: 1.2rem; border-radius: 10px; margin-top: 1.2rem; flex-wrap: wrap; gap: 0.8rem; }
  .btn-secondary { background: var(--brass); color: #241a06; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; font-size: 0.82rem; }
  .site-footer { border-top: 1px solid var(--line-soft); padding: 2rem 1.5rem; text-align: center; font-size: 0.8rem; color: var(--slate-dim); }
  .footer-links { display: flex; justify-content: center; gap: 1rem; margin-top: 0.6rem; flex-wrap: wrap; }
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
  <link href="[https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap](https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap)" rel="stylesheet">
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
    <p>Itinerario — Guías de viaje y rutas estructuradas por expertos y algoritmos de cercanía.</p>
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
// Rutas de la Aplicación
// ---------------------------------------------------------------------------

// 1. Portada con Buscador y Enlaces Editoriales
app.get('/', (req, res) => {
  const bodyContent = `
    <section class="hero">
      <h1>Tu próximo viaje,<br><em>trazado</em> como un guía local.</h1>
      <p style="color:var(--slate); margin-bottom:1.8rem;">Escribe una ciudad para obtener una ruta optimizada día a día por cercanía geográfica:</p>
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
      <p>Explora nuestras guías completas para escapadas urbanas organizadas paso a paso con recomendaciones verificadas:</p>
      <ul>
        <li style="margin-bottom:0.6rem;"><a href="/guia/roma" style="color:var(--brass);"><strong>Guía de Roma en 4 días:</strong> Coliseo, Trastevere y ruta Vaticana &rarr;</a></li>
        <li style="margin-bottom:0.6rem;"><a href="/guia/paris" style="color:var(--brass);"><strong>Guía de París en 4 días:</strong> Torre Eiffel, Montmartre y Museo del Louvre &rarr;</a></li>
        <li style="margin-bottom:0.6rem;"><a href="/guia/londres" style="color:var(--brass);"><strong>Guía de Londres en 4 días:</strong> Westminster, la City y museos &rarr;</a></li>
        <li style="margin-bottom:0.6rem;"><a href="/guia/praga" style="color:var(--brass);"><strong>Guía de Praga en 3 días:</strong> Casco Antiguo y el Castillo &rarr;</a></li>
      </ul>
    </main>
  `;

  res.send(layoutHTML({
    title: "Itinerario — Rutas y Guías de Viaje Detalladas",
    description: "Generador de itinerarios de viaje y guías turísticas completas con alojamiento recomendado.",
    bodyContent,
    adsEnabled: false
  }));
});

// 2. Páginas de Guías Editoriales (Supera el filtro de "Poco valor" de AdSense)
app.get('/guia/:ciudad', (req, res) => {
  const ciudad = (req.params.ciudad || '').toLowerCase();
  const guia = GUIAS_EDITORIALES[ciudad];

  if (!guia) return res.redirect('/');

  const bodyContent = `
    <main class="content-wrap">
      <h1>${escapeHtml(guia.titulo)}</h1>
      ${guia.contenido}
      <div style="margin-top:2.5rem; padding:1.5rem; background:var(--bg-elevated); border-radius:12px; border:1px solid var(--line);">
        <h3>¿Quieres un itinerario interactivo día a día para esta ciudad?</h3>
        <p>Genera la ruta personalizada con paradas exactas, horarios y alojamientos:</p>
        <a href="/itinerario?destino=${encodeURIComponent(ciudad)}" class="btn-primary" style="margin-top:0.5rem;">Ver itinerario de ${capitalizar(ciudad)}</a>
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

// 3. Ruta de Itinerarios con Enlaces de Comisión de Booking y Civitatis
app.get('/itinerario', async (req, res) => {
  const destino = (req.query.destino || '').toString().trim();
  if (!destino) return res.redirect('/');

  try {
    const data = await obtenerItinerarioCompleto(destino);
    const bodyContent = `
      <main class="content-wrap">
        <h1>Ruta recomendada en <em>${escapeHtml(data.destino)}</em></h1>
        <p>Itinerario de ${data.duracion_dias} días organizado por cercanía geográfica:</p>
        
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
      title: `Itinerario en ${data.destino} (${data.duracion_dias} días) | Itinerario`,
      description: `Ruta turística completa por ${data.destino} día a día.`,
      bodyContent,
      adsEnabled: true
    }));
  } catch (error) {
    console.error("Error generando itinerario:", error);
    res.redirect('/');
  }
});

// APIs auxiliares
app.get('/api/sugerencias-ciudades', (req, res) => {
  res.json(CIUDADES_SUGERIDAS);
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
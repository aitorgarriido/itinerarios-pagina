const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const AFFILIATE_CONFIG = {
  booking_aid: process.env.BOOKING_AID || 'TU_ID_BOOKING',
  civitatis_id: process.env.CIVITATIS_ID || 'TU_ID_CIVITATIS',
  getyourguide_id: process.env.GYG_ID || 'TU_ID_GETYOURGUIDE'
};

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
    },
    {
      titulo: "Excursión a Dresde: El Barroco a Orillas del Elba",
      actividades: [
        { hora: "09:30", nombre: "Palacio Zwinger y Baño de las Ninfas", descripcion: "Exploración de los patios barrocos, los pabellones y las terrazas superiores del palacio.", tipo: "atraccion", busqueda: "Palacio Zwinger Dresde" },
        { hora: "11:30", nombre: "Theaterplatz y Semperoper", descripcion: "Contemplación de la emblemática plaza del teatro y la ópera de Dresde.", tipo: "atraccion", busqueda: "Semperoper Dresde" },
        { hora: "12:30", nombre: "Castillo de Dresde (Residenzschloss) y Stallhof", descripcion: "Recorrido por la antigua residencia real de los reyes de Sajonia y el patio de caballería.", tipo: "tour", busqueda: "Residenzschloss Dresde" },
        { hora: "14:30", nombre: "Almuerzo en Bosporus Döner & Pizzeria", descripcion: "Parada gastronómica ágil en el centro histórico.", tipo: "resto" },
        { hora: "15:45", nombre: "Catedral de la Santísima Trinidad y Frauenkirche", descripcion: "Visita a las dos iglesias más icónicas y reconstruidas de la ciudad.", tipo: "atraccion", busqueda: "Frauenkirche Dresde" },
        { hora: "17:30", nombre: "El Desfile de los Príncipes (Fürstenzug) y Schlossplatz", descripcion: "Mural gigante de azulejos de porcelana y paseo final hacia el puente de Augusto.", tipo: "atraccion", busqueda: "Furstenzug Dresde" }
      ]
    },
    {
      titulo: "Patrimonio Gótico, Fortaleza de Vyšehrad y Gastronomía",
      actividades: [
        { hora: "09:30", nombre: "Desayuno en Coffee & Waffles", descripcion: "Especialidades de desayuno en la zona comercial del centro.", tipo: "resto" },
        { hora: "10:30", nombre: "Iglesia de San Francisco de Asís y Sta. María de Týn", descripcion: "Ruta por dos de las iglesias con mayor valor arquitectónico del casco antiguo.", tipo: "atraccion", busqueda: "Iglesia de Nuestra Senora de Tyn" },
        { hora: "12:00", nombre: "Fortaleza e Iglesia de Vyšehrad", descripcion: "Visita al recinto amurallado románico sobre el río Moldava y su histórico cementerio.", tipo: "atraccion", busqueda: "Vysehrad Praga" },
        { hora: "14:30", nombre: "Comida en Pasta fresca ambiente", descripcion: "Pasta fresca artesanal en un restaurante abovedado en el centro.", tipo: "resto" },
        { hora: "16:00", nombre: "Paseo por la Calle Karlova", descripcion: "Recorrido final por una de las vías peatonales más históricas y pintorescas de la ciudad.", tipo: "atraccion", busqueda: "Calle Karlova Praga" }
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
        { hora: "20:30", nombre: "Cena en Pinsatore", descripcion: "Pinsa y cocina italiana en el centro de Viena.", tipo: "resto" },
        { hora: "22:00", nombre: "MuseumsQuartier y paseo por Naschmarkt", descripcion: "Caminata nocturna por el distrito de arte moderno y el mercado tradicional.", tipo: "atraccion", busqueda: "MuseumsQuartier Viena" }
      ]
    },
    {
      titulo: "Excursión a Budapest: La Joya del Danubio",
      actividades: [
        { hora: "10:30", nombre: "Bastión de los Pescadores e Iglesia de Matías", descripcion: "Mirador neogótico monumental y la emblemática iglesia con tejados de cerámica policromada.", tipo: "tour", busqueda: "Bastion de los Pescadores Budapest" },
        { hora: "12:30", nombre: "Castillo de Buda y Puente de las Cadenas", descripcion: "Exploración del palacio real sobre la colina y cruce peatonal del icónico puente de hierro.", tipo: "atraccion", busqueda: "Castillo de Buda Budapest" },
        { hora: "14:15", nombre: "Almuerzo en la Zona Peatonal de Váci Utca", descripcion: "Gastronomía en la arteria comercial más animada de Pest.", tipo: "resto" },
        { hora: "16:00", nombre: "Parlamento de Hungría", descripcion: "Visita al majestuoso edificio neogótico a orillas del río Danubio.", tipo: "tour", busqueda: "Parlamento de Budapest" },
        { hora: "17:15", nombre: "Basílica de San Esteban, Plaza de la Libertad y Monumento Soviético", descripcion: "Recorrido por la catedral neoclásica principal y el entorno monumental del centro.", tipo: "atraccion", busqueda: "Basilica San Esteban Budapest" }
      ]
    },
    {
      titulo: "El Corazón Imperial de Viena (Hofburg y Stephansdom)",
      actividades: [
        { hora: "10:00", nombre: "Ópera Estatal de Viena (Wiener Staatsoper)", descripcion: "Visita monumental a uno de los teatros líricos más famosos del mundo.", tipo: "tour", busqueda: "Opera Estatal Viena" },
        { hora: "11:30", nombre: "Palacio Imperial de Hofburg, Michaelerplatz y Looshaus", descripcion: "Recorrido por la antigua residencia invernal de los Habsburgo y la arquitectura histórica de la plaza.", tipo: "tour", busqueda: "Palacio Hofburg Viena" },
        { hora: "13:30", nombre: "Catedral de San Esteban (Stephansdom)", descripcion: "El símbolo gótico de Viena, ubicándose en el epicentro del casco antiguo.", tipo: "atraccion", busqueda: "Catedral de San Esteban Viena" },
        { hora: "15:15", nombre: "Comida en San Carlo Ristorante", descripcion: "Almuerzo en el centro histórico de la ciudad.", tipo: "resto" },
        { hora: "16:45", nombre: "Biblioteca Nacional de Austria (Prunksaal) e Iglesia de San Agustín", descripcion: "Entrada a la sala barroca de la biblioteca imperial y al templo renacentista contiguo.", tipo: "tour", busqueda: "Biblioteca Nacional Austria Prunksaal" },
        { hora: "18:20", nombre: "Karlskirche (Iglesia de San Carlos Borromeo)", descripcion: "Templo barroco icónico con su gran cúpula y columnas inspiradas en la Columna Trajana.", tipo: "tour", busqueda: "Karlskirche Viena" },
        { hora: "19:30", nombre: "Parlamento de Austria, Ayuntamiento (Rathaus) y Calles Comerciales", descripcion: "Paseo final contemplando los edificios de la Ringstraße y las elegantes vías Graben y Kohlmarkt.", tipo: "atraccion", busqueda: "Rathaus Viena" }
      ]
    },
    {
      titulo: "Palacio de Schönbrunn y Joyas Modernistas",
      actividades: [
        { hora: "08:30", nombre: "Palacio de Schönbrunn y Jardines Imperiales", descripcion: "Recorrido por los salones de la residencia de verano de la emperatriz Sissi y subida a la Glorieta.", tipo: "tour", busqueda: "Palacio de Schonbrunn Viena" },
        { hora: "11:30", nombre: "Parque Volksgarten y Theseustempel", descripcion: "Paseo por la rosaleda imperial y el templo neoclásico réplica del templo de Hefesto.", tipo: "atraccion", busqueda: "Volksgarten Viena" },
        { hora: "13:00", nombre: "Iglesia de San Leopoldo (Kirche am Steinhof)", descripcion: "Visita opcional a la joya del Jugendstil modernista diseñada por Otto Wagner.", tipo: "atraccion", busqueda: "Kirche am Steinhof Viena" }
      ]
    }
  ],
  oporto: [
    {
      titulo: "Oporto Medieval, Ribera y Miradores de Gaia",
      actividades: [
        { hora: "10:00", nombre: "Capilla de las Almas e Iglesia de San Ildefonso", descripcion: "Recorrido inicial admirando las fachadas de azulejos azules tradicionales portugueses.", tipo: "atraccion", busqueda: "Capilla de las Almas Oporto" },
        { hora: "10:45", nombre: "Estación de São Bento", descripcion: "Visita al vestíbulo principal revestido con más de 20.000 azulejos históricos.", tipo: "atraccion", busqueda: "Estacion Sao Bento Oporto" },
        { hora: "11:10", nombre: "Catedral de Oporto (Sé) y Barrio Histórico", descripcion: "Exploración del templo románico y descenso a pie por las callejuelas medievales hacia el río.", tipo: "tour", busqueda: "Catedral de Oporto" },
        { hora: "13:30", nombre: "Comida en Casa Guedes", descripcion: "Especialidad en los tradicionales bocadillos de pernil con queso de Serra da Estrela.", tipo: "resto" },
        { hora: "15:00", nombre: "Paseo Fluvial por la Ribeira y Puente Don Luis I", descripcion: "Cruce peatonal por el nivel superior del emblemático puente de hierro.", tipo: "atraccion", busqueda: "Puente Don Luis I Oporto" },
        { hora: "15:30", nombre: "Jardim do Morro y Mosteiro da Serra do Pilar", descripcion: "Los mejores miradores panorámicos de la ciudad al otro lado del río Duero.", tipo: "atraccion", busqueda: "Mosteiro da Serra do Pilar" },
        { hora: "16:45", nombre: "Paseo por la ribera de Vila Nova de Gaia", descripcion: "Descenso hacia el paseo de las bodegas históricas contemplando el casco antiguo al atardecer.", tipo: "atraccion", busqueda: "Vila Nova de Gaia" }
      ]
    },
    {
      titulo: "El Oporto Barroco, Palacio de la Bolsa y Miragaia",
      actividades: [
        { hora: "10:00", nombre: "Iglesia y Torre de los Clérigos", descripcion: "Subida al campanario barroco más alto de Oporto con vistas 360° sobre la ciudad.", tipo: "tour", busqueda: "Torre de los Clerigos Oporto" },
        { hora: "10:50", nombre: "Librería Lello e Iglesias del Carmen y Carmelitas", descripcion: "Visita a la icónica librería neogótica y la curiosa iglesia dividida por la casa más estrecha.", tipo: "tour", busqueda: "Libreria Lello Oporto" },
        { hora: "12:15", nombre: "Iglesia de San Francisco", descripcion: "Impresionante templo gótico con un interior recubierto casi en su totalidad de pan de oro barroco.", tipo: "atraccion", busqueda: "Iglesia de San Francisco Oporto" },
        { hora: "13:15", nombre: "Paseo por el Barrio de Miragaia", descripcion: "Recorrido por las pintorescas fachadas coloridas del antiguo barrio de pescadores.", tipo: "atraccion", busqueda: "Barrio Miragaia Oporto" },
        { hora: "14:00", nombre: "Almuerzo en Incontro Bistrot", descripcion: "Propuesta gastronómica en el entorno histórico de Oporto.", tipo: "resto" },
        { hora: "15:00", nombre: "Palacio de la Bolsa", descripcion: "Recorrido monumental por la joya neoclásica de la ciudad y su deslumbrante Sala Árabe.", tipo: "tour", busqueda: "Palacio de la Bolsa Oporto" },
        { hora: "16:00", nombre: "Mirador de la Vitória", descripcion: "Balcón panorámico sobre los tejados de la zona baja de la ciudad y el río.", tipo: "atraccion", busqueda: "Mirador de la Vitoria Oporto" }
      ]
    },
    {
      titulo: "Excursión a Braga y Guimarães",
      actividades: [
        { hora: "09:30", nombre: "Catedral de Braga y Palacio Episcopal", descripcion: "Visita a la catedral más antigua de Portugal y paseo por sus jardines circundantes.", tipo: "atraccion", busqueda: "Catedral de Braga" },
        { hora: "11:15", nombre: "Santuario de Bom Jesus do Monte", descripcion: "Impresionante santuario barroco famoso por su escalinata monumental en zig-zag.", tipo: "tour", busqueda: "Bom Jesus do Monte Braga" },
        { hora: "13:30", nombre: "Comida en Mora Burger", descripcion: "Parada gastronómica ágil durante la ruta.", tipo: "resto" },
        { hora: "15:00", nombre: "Palacio de los Duques de Braganza y Castillo de Guimarães", descripcion: "Exploración de la cuna de Portugal, su fortaleza medieval e imponente palacio neogótico.", tipo: "tour", busqueda: "Castillo de Guimaraes" },
        { hora: "16:15", nombre: "Centro Histórico de Guimarães", descripcion: "Recorrido a pie por las plazas medievales conservadas y peatonales de la ciudad patrimonio.", tipo: "atraccion", busqueda: "Centro historico Guimaraes" }
      ]
    },
    {
      titulo: "Matosinhos, Mercado do Bolhão y Avenida dos Aliados",
      actividades: [
        { hora: "10:30", nombre: "Iglesia del Buen Jesús y Distrito Marinero de Matosinhos", descripcion: "Visita al templo barroco monumental poco turístico y paseo por la zona costera.", tipo: "atraccion", busqueda: "Iglesia Buen Jesus Matosinhos" },
        { hora: "13:30", nombre: "Comida en Don Pepe", descripcion: "Almuerzo de despedida cerca de la Ribera.", tipo: "resto" },
        { hora: "14:30", nombre: "Mercado do Bolhão", descripcion: "Paseo por el mercado tradicional recién rehabilitado lleno de vida local y productos típicos.", tipo: "atraccion", busqueda: "Mercado do Bolhao Oporto" },
        { hora: "15:15", nombre: "Avenida dos Aliados y Plaza de la Libertad", descripcion: "Recorrido por la arteria principal contemplando la arquitectura de la Casa Consistorial.", tipo: "atraccion", busqueda: "Avenida dos Aliados Oporto" },
        { hora: "16:00", nombre: "Paseo final entre São Bento y la Ribeira", descripcion: "Última caminata por las rúas históricas para disfrutar del ambiente de la ciudad.", tipo: "atraccion", busqueda: "Ribeira Oporto" }
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
        { hora: "15:30", nombre: "Basílica de Santa Maria della Neve y San Pietro in Vincoli", descripcion: "Recorrido a pie por el barrio de Monti para contemplar el famoso Moisés de Miguel Ángel.", tipo: "atraccion", busqueda: "San Pietro in Vincoli Roma" },
        { hora: "17:00", nombre: "Paseo exterior por el Coliseo Romano al atardecer", descripcion: "Primera toma de contacto con el anfiteatro Flavio iluminado.", tipo: "tour", busqueda: "Coliseo Romano" }
      ]
    },
    {
      titulo: "Templo del Panteón, Barroco Centro e Il Trastevere",
      actividades: [
        { hora: "10:30", nombre: "Iglesia del Gesù, San Ignacio de Loyola y Sta. Maria Sopra Minerva", descripcion: "Ruta de iglesias monumentales barrocas destacadas por sus ilusiones ópticas y frescos.", tipo: "atraccion", busqueda: "Iglesia de San Ignacio de Loyola Roma" },
        { hora: "13:15", nombre: "Comida en L'Antica Birreria Peroni", descripcion: "Cervecería y casa de comidas histórica muy cerca de la Via del Corso.", tipo: "resto" },
        { hora: "14:30", nombre: "Panteón de Agripa", descripcion: "Visita al templo romano mejor conservado de la antigüedad.", tipo: "tour", busqueda: "Panteon de Agripa Roma" },
        { hora: "15:30", nombre: "Trastevere: Basílica de Santa Cecilia y Santa María in Trastevere", descripcion: "Cruce hacia la orilla del Tíber para explorar las callejuelas y plazas del barrio bohemio.", tipo: "atraccion", busqueda: "Santa Maria in Trastevere" },
        { hora: "17:00", nombre: "Mirador de la Plaza del Gianicolo y Piazza Navona", descripcion: "Subida a la colina para contemplar la vista panorámica de la ciudad y final en la famosa plaza barroca.", tipo: "atraccion", busqueda: "Piazza Navona Roma" }
      ]
    },
    {
      titulo: "Roma Antigua, Ribera del Tíber, Fontana di Trevi y Plaza de España",
      actividades: [
        { hora: "10:30", nombre: "Basílica de San Pablo Extramuros y Circo Máximo", descripcion: "Recorrido por la majestuosa basílica patriarcal y el antiguo estadio de carreras romano.", tipo: "atraccion", busqueda: "San Pablo Extramuros Roma" },
        { hora: "12:00", nombre: "Templo de Hércules Víctor, Teatro di Marcello y Sta. María en Aracoeli", descripcion: "Ruta arqueológica a pie subiendo la escalinata hacia la colina del Capitolio.", tipo: "atraccion", busqueda: "Teatro di Marcello Roma" },
        { hora: "13:30", nombre: "Almuerzo en Mastroccia", descripcion: "Parada gastronómica para degustar especialidades de la cocina romana.", tipo: "resto" },
        { hora: "15:00", nombre: "Castel Sant'Angelo", descripcion: "Fortaleza papal a orillas del río Tíber con vistas panorámicas sobre el puente de los Ángeles.", tipo: "tour", busqueda: "Castel Sant Angelo Roma" },
        { hora: "16:30", nombre: "Piazza del Popolo, Iglesias Gemelas y Plaza de España", descripcion: "Caminata por el tridente romano y la icónica escalinata de la Trinità dei Monti.", tipo: "atraccion", busqueda: "Plaza de España Roma" },
        { hora: "20:00", nombre: "Cena en Pinsitaly", descripcion: "Pinsa romana artesanal en el corazón del centro nocturno.", tipo: "resto" },
        { hora: "21:30", nombre: "Fontana di Trevi y paseo nocturno hacia el Coliseo", descripcion: "Espectacular cierre viendo la fuente barroca y el foro iluminado de noche.", tipo: "atraccion", busqueda: "Fontana di Trevi Roma" }
      ]
    },
    {
      titulo: "Ciudad del Vaticano y Gastronomía",
      actividades: [
        { hora: "09:00", nombre: "Plaza y Basílica de San Pedro en el Vaticano", descripcion: "Exploración del epicentro del Estado Vaticano y la imponente columnata de Bernini.", tipo: "tour", busqueda: "Basilica de San Pedro Vaticano" },
        { hora: "14:00", nombre: "Almuerzo en Mercato Centrale Roma", descripcion: "Mercado gastronómico con múltiples puestos de especialidades italianas e internacionales.", tipo: "resto" }
      ]
    }
  ]
};

app.get('/api/ciudades', (req, res) => {
  const ciudades = Object.keys(ITINERARIOS_BASE).map(slug => ({
    slug,
    nombre: slug.charAt(0).toUpperCase() + slug.slice(1),
    dias: ITINERARIOS_BASE[slug].length
  }));
  res.json(ciudades);
});

app.get('/api/itinerario/:destino', async (req, res) => {
  const { destino } = req.params;
  const destinoNormalizado = destino.toLowerCase().trim();

  if (!ITINERARIOS_BASE[destinoNormalizado]) {
    return res.status(404).json({ error: "Ciudad no disponible por el momento." });
  }

  const destinoFormateado = destino.charAt(0).toUpperCase() + destino.slice(1).toLowerCase();
  const destinoLimpio = encodeURIComponent(destinoFormateado);
  const bookingLink = `https://www.booking.com/searchresults.es.html?ss=${destinoLimpio}&aid=${AFFILIATE_CONFIG.booking_aid}`;

  const plantillasDias = ITINERARIOS_BASE[destinoNormalizado];
  const itinerarioGenerado = plantillasDias.map((plantilla, index) => {
    const actividadesFormateadas = plantilla.actividades.map(act => ({
      hora: act.hora,
      nombre: act.nombre,
      descripcion: act.descripcion,
      direccion: `${destinoFormateado}, Centro`,
      valoracion: (4.6 + (Math.random() * 0.3)).toFixed(1),
      link_afiliado: (act.tipo === 'tour' || act.tipo === 'atraccion') 
        ? `https://www.civitatis.com/es/buscar/?q=${encodeURIComponent(act.busqueda || act.nombre)}&a=${AFFILIATE_CONFIG.civitatis_id}` 
        : null,
      texto_boton: act.tipo === 'tour' ? '🎟️ Ver visitas guiadas' : '🎟️ Reservar entradas'
    }));

    return {
      dia: index + 1,
      titulo: plantilla.titulo,
      actividades: actividadesFormateadas,
      hotel_recomendado: {
        nombre: `Alojamiento recomendado en ${destinoFormateado}`,
        descripcion: "Hoteles céntricos con buenas opiniones y cancelación flexible.",
        booking_link: bookingLink,
        texto_boton: "🏨 Ver disponibilidad en Booking"
      }
    };
  });

  res.json({
    destino: destinoFormateado,
    duracion_dias: itinerarioGenerado.length,
    itinerario: itinerarioGenerado
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de viajes ejecutándose en http://localhost:${PORT}`);
});
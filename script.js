// Exact clinic pin supplied by the clinic.
const CLINIC = {
  latitude: -5.773978986883983,
  longitude: -35.27340940058038,
};
const WHATSAPP_PHONE = "5584998035995";
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const whatsappUrl = (message) => "https://api.whatsapp.com/send?phone=" +
  WHATSAPP_PHONE + "&text=" + encodeURIComponent(message);

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = whatsappUrl("Olá, Dra. Rani! Gostaria de saber mais e agendar uma consulta no Espaço Sorriso.");
});
document.querySelector("#currentYear").textContent = new Date().getFullYear();

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#mainNav");
function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  mainNav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}
menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuToggle.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
});
window.matchMedia("(min-width: 701px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});
const header = document.querySelector(".site-header");
const secondSection = document.querySelector("#cuidado");
function updateHeaderVisibility() {
  const secondSectionTop = secondSection.getBoundingClientRect().top + window.scrollY;
  const showHeader = window.scrollY >= secondSectionTop - 1;
  header.classList.toggle("is-visible", showHeader);
  header.classList.toggle("is-scrolled", showHeader);
  header.inert = !showHeader;
}
updateHeaderVisibility();
let scrollScheduled = false;
window.addEventListener("scroll", () => {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(() => {
    updateHeaderVisibility();
    scrollScheduled = false;
  });
}, { passive: true });
window.addEventListener("load", updateHeaderVisibility, { once: true });

document.querySelectorAll("[data-care-message]").forEach((link) => {
  link.href = whatsappUrl(link.dataset.careMessage);
});

let map;
let mapReadyPromise;
let clinicMarker;
let visitorMarker;
let routeSource;
let lastRouteRequestAt = 0;
const mapFrame = document.querySelector(".location-map-frame");
const mapElement = document.querySelector("#clinicMap");
const distanceButton = document.querySelector("#distanceButton");
const distanceButtonLabel = document.querySelector("#distanceButtonLabel");
const distanceResult = document.querySelector("#distanceResult");

function createMarker(className, label) {
  const element = document.createElement("div");
  element.className = className;
  element.setAttribute("role", "img");
  element.setAttribute("aria-label", label);
  if (className === "clinic-marker") {
    const glyph = document.createElement("span");
    glyph.className = "marker-glyph";
    glyph.setAttribute("aria-hidden", "true");
    const logo = document.createElement("img");
    logo.src = "assets/logo-espaco-sorriso.png";
    logo.alt = "";
    logo.setAttribute("aria-hidden", "true");
    glyph.append(logo);
    element.append(glyph);
  }
  return element;
}

function initializeMap() {
  if (map || !window.maplibregl) return;
  map = new maplibregl.Map({
    container: mapElement,
    style: "https://tiles.openfreemap.org/styles/liberty",
    center: [CLINIC.longitude, CLINIC.latitude],
    zoom: 15,
    attributionControl: false,
    cooperativeGestures: false,
    scrollZoom: true,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.addControl(new maplibregl.AttributionControl({
    compact: true,
    customAttribution: [
      '<a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noopener noreferrer">Rotas FOSSGIS/OSRM</a>',
      '<a href="https://www.openstreetmap.org/edit?editor=id#map=17/-5.773978986883983/-35.27340940058038" target="_blank" rel="noopener noreferrer">Corrigir mapa</a>',
    ],
  }), "bottom-right");

  mapReadyPromise = new Promise((resolve) => map.once("load", () => {
    clinicMarker = new maplibregl.Marker({
      element: createMarker("clinic-marker", "Espaço Sorriso RN"),
      anchor: "bottom",
    }).setLngLat([CLINIC.longitude, CLINIC.latitude])
      .setPopup(new maplibregl.Popup({ offset: 24 }).setText("Espaço Sorriso RN · localização informada pela clínica"))
      .addTo(map);
    mapFrame.classList.add("map-ready");
    mapElement.setAttribute("aria-hidden", "false");
    mapElement.tabIndex = 0;
    mapFrame.querySelector("iframe").setAttribute("aria-hidden", "true");
    map.resize();
    resolve(true);
  }));
}

if ("IntersectionObserver" in window) {
  const mapObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      initializeMap();
      mapObserver.disconnect();
    }
  }, { rootMargin: "250px" });
  mapObserver.observe(mapElement);
} else initializeMap();

window.addEventListener("load", initializeMap, { once: true });

function locationError(message) {
  distanceButton.disabled = false;
  distanceButtonLabel.textContent = "Tentar novamente";
  distanceResult.classList.add("is-error");
  distanceResult.textContent = message;
}

function clearDisplayedRoute() {
  if (routeSource) routeSource.setData({ type: "FeatureCollection", features: [] });
  if (visitorMarker) {
    visitorMarker.remove();
    visitorMarker = undefined;
  }
}

function updateDirectionsLink(latitude, longitude) {
  const routeUrl = new URL("https://www.google.com/maps/dir/");
  routeUrl.searchParams.set("api", "1");
  routeUrl.searchParams.set("destination", CLINIC.latitude + "," + CLINIC.longitude);
  routeUrl.searchParams.set("origin", latitude + "," + longitude);
  routeUrl.searchParams.set("travelmode", "driving");
  document.querySelector("#directionsLink").href = routeUrl.toString();
}

async function drawRoute(route, origin, accuracy) {
  initializeMap();
  if (!map || !mapReadyPromise) return false;
  const ready = await Promise.race([
    mapReadyPromise,
    new Promise((resolve) => window.setTimeout(() => resolve(false), 12000)),
  ]);
  if (!ready || !map.isStyleLoaded()) return false;

  const feature = { type: "Feature", properties: {}, geometry: route.geometry };
  if (routeSource) routeSource.setData(feature);
  else {
    map.addSource("clinic-driving-route", { type: "geojson", data: feature });
    const firstSymbolLayer = map.getStyle().layers.find((layer) => layer.type === "symbol");
    const beforeLayer = firstSymbolLayer && firstSymbolLayer.id;
    map.addLayer({
      id: "clinic-driving-route-casing", type: "line", source: "clinic-driving-route",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#fffdf5", "line-width": 9, "line-opacity": .96 },
    }, beforeLayer);
    map.addLayer({
      id: "clinic-driving-route", type: "line", source: "clinic-driving-route",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#d6a654", "line-width": 5, "line-opacity": 1 },
    }, beforeLayer);
    routeSource = map.getSource("clinic-driving-route");
  }

  if (visitorMarker) visitorMarker.remove();
  const accuracyInMeters = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(accuracy);
  const visitorLabel = "Sua localização (precisão informada pelo navegador: até ±" + accuracyInMeters + " m)";
  visitorMarker = new maplibregl.Marker({
    element: createMarker("visitor-marker", visitorLabel),
    anchor: "center",
  }).setLngLat(origin)
    .setPopup(new maplibregl.Popup({ offset: 14 }).setText(visitorLabel))
    .addTo(map);

  const bounds = new maplibregl.LngLatBounds();
  route.geometry.coordinates.forEach((coordinate) => bounds.extend(coordinate));
  map.fitBounds(bounds, {
    padding: { top: 54, right: 54, bottom: 54, left: 54 },
    maxZoom: 16,
    duration: motionPreference.matches ? 0 : 650,
  });
  return true;
}

async function requestDrivingRoute(latitude, longitude, accuracy) {
  updateDirectionsLink(latitude, longitude);
  const endpoint = "https://routing.openstreetmap.de/routed-car/route/v1/driving/" +
    longitude + "," + latitude + ";" + CLINIC.longitude + "," + CLINIC.latitude +
    "?overview=full&geometries=geojson&steps=false";
  let routeSucceeded = false;
  try {
    const waitForRateLimit = Math.max(0, 1000 - (Date.now() - lastRouteRequestAt));
    if (waitForRateLimit) await new Promise((resolve) => window.setTimeout(resolve, waitForRateLimit));
    lastRouteRequestAt = Date.now();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    let result;
    try {
      const response = await fetch(endpoint, { signal: controller.signal });
      if (!response.ok) throw new Error("route service unavailable");
      result = await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
    const route = result.code === "Ok" && result.routes && result.routes[0];
    if (!route) throw new Error("route not found");

    const kilometers = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(route.distance / 1000);
    const minutes = Math.max(1, Math.round(route.duration / 60));
    distanceResult.classList.remove("is-error");
    distanceResult.textContent = "Rota de carro: " + kilometers + " km · cerca de " + minutes +
      " min, sem considerar o trânsito em tempo real. Localização com precisão de até ±" +
      new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(accuracy) + " m.";
    const routeDrawn = await drawRoute(route, [longitude, latitude], accuracy);
    routeSucceeded = routeDrawn;
    if (!routeDrawn) distanceResult.textContent += " O mapa não carregou; abra o Google Maps para ver o traçado.";
  } catch {
    distanceResult.classList.add("is-error");
    distanceResult.textContent = "Não foi possível traçar a rota agora. Abra o Google Maps para ver o percurso.";
  } finally {
    distanceButton.disabled = false;
    distanceButtonLabel.textContent = routeSucceeded ? "Atualizar minha rota" : "Tentar novamente";
  }
}

function getBestLocationFix() {
  return new Promise((resolve, reject) => {
    let watchId;
    let bestPosition;
    const finish = (position, error) => {
      window.clearTimeout(timer);
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
      if (position) resolve(position);
      else reject(error || { code: 2 });
    };
    const timer = window.setTimeout(() => finish(bestPosition, { code: 3 }), 8000);
    try {
      watchId = navigator.geolocation.watchPosition((position) => {
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) bestPosition = position;
        const accuracy = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(position.coords.accuracy);
        distanceResult.textContent = "Precisão atual: ±" + accuracy + " m. Buscando uma leitura mais exata…";
        if (position.coords.accuracy <= 75) finish(bestPosition);
      }, (error) => finish(bestPosition, error), {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      });
    } catch (error) {
      finish(bestPosition, error);
    }
  });
}

distanceButton.addEventListener("click", async () => {
  if (!navigator.geolocation) return locationError("Seu navegador não oferece localização. Abra a rota no Google Maps.");
  if (!window.isSecureContext) return locationError("Abra o site em HTTPS para usar sua localização. A rota no Google Maps continua disponível.");
  distanceButton.disabled = true;
  clearDisplayedRoute();
  distanceButtonLabel.textContent = "Localizando…";
  distanceResult.classList.remove("is-error");
  distanceResult.textContent = "Aguardando uma leitura atual da localização…";
  try {
    const position = await getBestLocationFix();
    const { latitude, longitude, accuracy } = position.coords;
    distanceButtonLabel.textContent = "Traçando rota…";
    await requestDrivingRoute(latitude, longitude, accuracy);
  } catch (error) {
    const messages = {
      1: "A localização não foi permitida. Libere o acesso ou abra o Google Maps.",
      2: "Não foi possível localizar você agora. Confira o GPS ou abra o Google Maps.",
      3: "A localização demorou a responder. Tente novamente ou abra o Google Maps.",
    };
    locationError(messages[error.code] || "Não foi possível calcular a rota. Tente novamente.");
  }
});

const mobileContact = document.querySelector(".mobile-contact");
if ("IntersectionObserver" in window) {
  let heroVisible = true;
  let contactVisible = false;
  function updateMobileContact() {
    mobileContact.classList.toggle("is-visible", !heroVisible && !contactVisible);
    mobileContact.inert = heroVisible || contactVisible;
  }
  mobileContact.inert = true;
  const actionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.target.classList.contains("hero")) heroVisible = entry.isIntersecting;
      else contactVisible = entry.isIntersecting;
    });
    updateMobileContact();
  }, { threshold: 0 });
  actionObserver.observe(document.querySelector(".hero"));
  actionObserver.observe(document.querySelector(".contact-section"));
}

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, (context) => {
    if (context.conditions.reduceMotion) return;
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro.from(".identity-hero .hero-copy > *", { y: 18, autoAlpha: 0, duration: .72, stagger: .1 })
      .from(".rani-photo-frame", { y: 16, scale: .985, autoAlpha: 0, duration: .9, ease: "power2.out" }, .12)
      .from(".rani-caption", { y: 8, autoAlpha: 0, duration: .5 }, .55);

    const reveals = [
      [".care-image-frame", ".care-section", 0],
      [".care-copy > *", ".care-section", .08],
      [".location-copy > *", ".location-section", .07],
      [".location-panel", ".location-section", 0],
      [".faq-intro > *", ".faq-section", .07],
      [".faq-list details", ".faq-list", .08],
      [".contact-copy", ".contact-section", 0],
      [".contact-action", ".contact-section", 0],
      [".footer-logo, .footer-license, .footer-instagram, .footer-copyright", ".site-footer", .06],
    ];
    reveals.forEach(([target, trigger, stagger]) => {
      const elements = gsap.utils.toArray(target);
      if (!elements.length) return;
      gsap.from(elements, {
        y: 18,
        autoAlpha: 0,
        duration: .68,
        ease: "power2.out",
        stagger,
        scrollTrigger: { trigger, start: "top 88%", once: true },
      });
    });
  });
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

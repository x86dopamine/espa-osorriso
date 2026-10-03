// The supplied address has no street number. Replace these coordinates when
// the exact clinic pin is confirmed. This is currently a reference for the CEP.
const CLINIC = {
  latitude: -5.77139,
  longitude: -35.26867,
  address: "Av. Benedito Santana, Amarante, São Gonçalo do Amarante - RN, 59296-515",
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
let scrollScheduled = false;
window.addEventListener("scroll", () => {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(() => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
    scrollScheduled = false;
  });
}, { passive: true });

const careOptions = {
  health: {
    label: "Seu primeiro passo", title: "Vamos cuidar da sua saúde bucal.",
    description: "Uma avaliação para entender seu sorriso e conversar sobre o cuidado de que você precisa.",
    points: ["Conte o que está sentindo", "Entenda os próximos passos"],
    action: "Conversar sobre meu cuidado",
    message: "Olá, Dra. Rani! Gostaria de agendar uma avaliação odontológica no Espaço Sorriso.",
    icon: "i-tooth", caption: "Cuidado que começa com você.",
  },
  smile: {
    label: "Um sorriso com a sua personalidade", title: "Seu sorriso merece essa conversa.",
    description: "Conte o que você gostaria de melhorar. A avaliação é o primeiro passo para conhecer as possibilidades para o seu sorriso.",
    points: ["Compartilhe seus desejos", "Conheça as possibilidades"],
    action: "Conversar sobre meu sorriso",
    message: "Olá, Dra. Rani! Gostaria de conversar sobre as possibilidades para melhorar meu sorriso.",
    icon: "i-smile", caption: "Mais espaço para sorrir.",
  },
  question: {
    label: "Pode perguntar", title: "A gente começa ouvindo você.",
    description: "Quer saber sobre horários, atendimento ou como marcar sua consulta? Fale diretamente com a clínica e tire suas dúvidas.",
    points: ["Pergunte sem pressa", "Combine o melhor horário"],
    action: "Tirar minha dúvida",
    message: "Olá, Dra. Rani! Tenho uma dúvida sobre o atendimento no Espaço Sorriso.",
    icon: "i-chat", caption: "Uma boa conversa faz diferença.",
  },
};
const careTabs = Array.from(document.querySelectorAll(".care-tab"));
const carePanel = document.querySelector("#carePanel");
const careContent = document.querySelector(".care-content");
const careArt = document.querySelector(".care-art");
const indicator = document.querySelector(".tab-indicator");
let selectedCare = "health";

function positionTabIndicator() {
  const tab = careTabs.find((item) => item.dataset.care === selectedCare);
  indicator.style.left = tab.offsetLeft + "px";
  indicator.style.width = tab.offsetWidth + "px";
}
function selectCare(tab, moveFocus = false) {
  const key = tab.dataset.care;
  if (selectedCare === key) {
    if (moveFocus) tab.focus();
    return;
  }
  selectedCare = key;
  const option = careOptions[key];
  careTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  carePanel.setAttribute("aria-labelledby", tab.id);
  document.querySelector("#careLabel").textContent = option.label;
  document.querySelector("#carePanelTitle").textContent = option.title;
  document.querySelector("#carePanelDescription").textContent = option.description;
  const points = document.querySelector("#carePoints");
  points.replaceChildren(...option.points.map((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    return item;
  }));
  const cta = document.querySelector("#careCta");
  cta.firstChild.textContent = option.action + " ";
  cta.href = whatsappUrl(option.message);
  careArt.dataset.art = key;
  careArt.querySelector(".care-art-icon use").setAttribute("href", "#" + option.icon);
  document.querySelector("#artCaption").textContent = option.caption;
  positionTabIndicator();
  if (moveFocus) tab.focus();
  if (window.gsap && !motionPreference.matches) {
    gsap.killTweensOf([careContent, ".care-art-icon"]);
    gsap.fromTo(careContent, { opacity: .35, y: 8 }, { opacity: 1, y: 0, duration: .35, ease: "power2.out" });
    gsap.fromTo(".care-art-icon", { scale: .87, rotate: -6 }, { scale: 1, rotate: 0, duration: .55, ease: "power3.out" });
  }
}
careTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectCare(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % careTabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + careTabs.length) % careTabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = careTabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectCare(careTabs[next], true);
    }
  });
});
positionTabIndicator();
if (window.ResizeObserver) new ResizeObserver(positionTabIndicator).observe(document.querySelector(".care-tabs"));
else window.addEventListener("resize", positionTabIndicator);
document.fonts?.ready.then(positionTabIndicator);

let map;
let visitorMarker;
let distanceLine;
function initializeMap() {
  if (map || !window.L) return;
  const point = [CLINIC.latitude, CLINIC.longitude];
  map = L.map("clinicMap", { scrollWheelZoom: false, zoomControl: false }).setView(point, 15);
  L.control.zoom({ position: "topright" }).addTo(map);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  const icon = L.divIcon({
    className: "", iconSize: [44, 44], iconAnchor: [22, 22],
    html: '<div class="clinic-marker"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 22c2 12 10 19 17 19s15-7 17-19M12 11v5m24-5v5"/></svg></div>',
  });
  L.marker(point, { icon, title: "Espaço Sorriso — referência aproximada pelo CEP", alt: "Referência aproximada da clínica" })
    .addTo(map).bindPopup('<div class="map-popup"><strong>Espaço Sorriso</strong><p>Referência aproximada no Amarante.<br>Confirme o ponto exato com a clínica.</p></div>');
  document.querySelector(".map-visual").classList.add("map-ready");
  requestAnimationFrame(() => map.invalidateSize());
}
const mapElement = document.querySelector("#clinicMap");
if ("IntersectionObserver" in window) {
  const mapObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      initializeMap();
      mapObserver.disconnect();
    }
  }, { rootMargin: "250px" });
  mapObserver.observe(mapElement);
} else initializeMap();

// Great-circle distance; no location request is made until the visitor clicks.
function distanceKm(latitude, longitude) {
  const radians = (value) => value * Math.PI / 180;
  const deltaLat = radians(CLINIC.latitude - latitude);
  const deltaLng = radians(CLINIC.longitude - longitude);
  const a = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radians(latitude)) * Math.cos(radians(CLINIC.latitude)) * Math.sin(deltaLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}
const distanceButton = document.querySelector("#distanceButton");
const distanceButtonLabel = document.querySelector("#distanceButtonLabel");
const distanceResult = document.querySelector("#distanceResult");
function locationError(message) {
  distanceButton.disabled = false;
  distanceButtonLabel.textContent = "Tentar novamente";
  distanceResult.classList.add("is-error");
  distanceResult.textContent = message;
}
distanceButton.addEventListener("click", () => {
  if (!navigator.geolocation) return locationError("Seu navegador não oferece localização. Você pode abrir a rota no Google Maps.");
  if (!window.isSecureContext) return locationError("Abra o site em HTTPS para calcular a distância. A rota no Google Maps continua disponível.");
  distanceButton.disabled = true;
  distanceButtonLabel.textContent = "Encontrando você…";
  distanceResult.classList.remove("is-error");
  distanceResult.textContent = "Permita o acesso à localização no navegador para continuar.";
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude, accuracy } = position.coords;
    const distance = distanceKm(latitude, longitude);
    const inMeters = distance < 1;
    const value = inMeters ? Math.round(distance * 1000) : distance;
    const formatted = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: inMeters ? 0 : 1 }).format(value);
    document.querySelector("#distanceValue").textContent = formatted;
    document.querySelector("#distanceUnit").textContent = inMeters ? "m" : "km";
    distanceResult.textContent = "Você está a aproximadamente " + formatted + (inMeters ? " m" : " km") +
      " da referência da clínica, em linha reta." +
      (accuracy > 1000 ? " Sua localização tem baixa precisão; o resultado é uma estimativa." : "");
    distanceButton.disabled = false;
    distanceButtonLabel.textContent = "Atualizar minha distância";
    const routeUrl = new URL("https://www.google.com/maps/dir/");
    routeUrl.searchParams.set("api", "1");
    routeUrl.searchParams.set("destination", CLINIC.address);
    routeUrl.searchParams.set("origin", latitude + "," + longitude);
    document.querySelector("#directionsLink").href = routeUrl.toString();
    initializeMap();
    if (map) {
      const visitor = [latitude, longitude];
      const clinic = [CLINIC.latitude, CLINIC.longitude];
      if (visitorMarker) map.removeLayer(visitorMarker);
      if (distanceLine) map.removeLayer(distanceLine);
      visitorMarker = L.marker(visitor, {
        title: "Sua localização aproximada", alt: "Sua localização",
        icon: L.divIcon({ className: "", html: '<div class="visitor-marker"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
      }).addTo(map).bindPopup("Sua localização aproximada");
      distanceLine = L.polyline([visitor, clinic], { color: "#184be9", weight: 2, dashArray: "6 8" }).addTo(map);
      map.fitBounds(distanceLine.getBounds(), { padding: [55, 55], maxZoom: 16, animate: !motionPreference.matches });
    }
  }, (error) => {
    const messages = {
      1: "A localização não foi permitida. Você pode liberar o acesso no navegador ou abrir a rota no Google Maps.",
      2: "Não foi possível localizar você agora. Confira o GPS ou abra a rota no Google Maps.",
      3: "A localização demorou a responder. Tente novamente ou abra a rota no Google Maps.",
    };
    locationError(messages[error.code] || "Não foi possível calcular a distância. Tente novamente.");
  }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
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
  mm.add({ desktop: "(min-width: 901px)", reduceMotion: "(prefers-reduced-motion: reduce)" }, (context) => {
    if (context.conditions.reduceMotion) return;
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro.from(".hero-place", { y: 12, opacity: 0, duration: .55 })
      .from(".hero h1 span", { y: 35, opacity: 0, duration: .8, stagger: .1 }, .1)
      .from([".hero-description", ".hero-actions", ".hero-address"], { y: 18, opacity: 0, duration: .65, stagger: .1 }, .4)
      .from(".hero-photo", { y: 25, opacity: 0, duration: .9 }, .15)
      .from([".hello-label", ".hero-corner"], { scale: .8, opacity: 0, duration: .6, stagger: .1 }, .6);
    document.querySelectorAll(".section-heading, .doctor-copy, .location-heading, .faq-heading, .contact-inner").forEach((section) => {
      gsap.from(section, { y: 22, opacity: 0, duration: .7, ease: "power2.out",
        scrollTrigger: { trigger: section, start: "top 91%", once: true } });
    });
    if (context.conditions.desktop) {
      gsap.fromTo(".hero-photo > img", { yPercent: -2, scale: 1.06 }, {
        yPercent: 4, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
      });
    }
  });
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}


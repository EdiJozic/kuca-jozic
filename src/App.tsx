
import { useCallback, useEffect, useState } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShoppingBasket,
  Utensils,
  UsersRound,
  X,
} from "lucide-react";
import logo from "./assets/logo-dark.png";
import "leaflet/dist/leaflet.css";
import "./App.css";

type Language = "en" | "de" | "hr";
type Category = "all" | "restaurant" | "shop";

type Place = {
  id: number;
  name: string;
  category: Exclude<Category, "all">;
  distance: string;
  image: string;
  description: Record<Language, string>;
  tip: Record<Language, string>;
  address: string;
  phone?: string;
  maps: string;
};

type GalleryCategory = {
  folder: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
};

const galleryCategories: GalleryCategory[] = [
  {
    folder: "kuca_vani",
    title: { en: "The house & outdoors", de: "Haus & Außenbereich", hr: "Kuća i vanjski prostor" },
    description: {
      en: "A first look at your private countryside retreat.",
      de: "Ein erster Blick auf Ihren privaten Rückzugsort auf dem Land.",
      hr: "Zavirite u svoju privatnu kuću za odmor u prirodi.",
    },
  },
  {
    folder: "bazen",
    title: { en: "Pool", de: "Pool", hr: "Bazen" },
    description: {
      en: "Slow afternoons, cool water and sunshine.",
      de: "Entspannte Nachmittage, kühles Wasser und Sonnenschein.",
      hr: "Opuštena poslijepodneva uz osvježavajuću vodu i sunce.",
    },
  },
  {
    folder: "dnevni boravak",
    title: { en: "Living room", de: "Wohnzimmer", hr: "Dnevni boravak" },
    description: {
      en: "Comfortable corners made for spending time together.",
      de: "Gemütliche Ecken für gemeinsame Zeit.",
      hr: "Udobni kutci stvoreni za zajedničke trenutke.",
    },
  },
  {
    folder: "kuhinja",
    title: { en: "Kitchen", de: "Küche", hr: "Kuhinja" },
    description: {
      en: "Everything you need for an easy meal at home.",
      de: "Alles, was Sie für eine entspannte Mahlzeit brauchen.",
      hr: "Sve što vam treba za opušten obrok kod kuće.",
    },
  },
  {
    folder: "spavaca soba",
    title: { en: "Bedrooms", de: "Schlafzimmer", hr: "Spavaće sobe" },
    description: {
      en: "Quiet, welcoming spaces to recharge.",
      de: "Ruhige, einladende Räume zum Auftanken.",
      hr: "Mirne i ugodne sobe za odmor i novi početak dana.",
    },
  },
  {
    folder: "spa zona",
    title: { en: "Spa area", de: "Wellnessbereich", hr: "Spa zona" },
    description: {
      en: "A little extra time to unwind and reset.",
      de: "Ein wenig mehr Zeit zum Entspannen und Abschalten.",
      hr: "Malo više vremena za opuštanje i predah.",
    },
  },
  {
    folder: "wc",
    title: { en: "Bathrooms", de: "Badezimmer", hr: "Kupaonice" },
    description: {
      en: "Clean, considered details for your stay.",
      de: "Klare, durchdachte Details für Ihren Aufenthalt.",
      hr: "Uredni i pažljivo osmišljeni detalji za ugodan boravak.",
    },
  },
];

type AvailabilityRange = { from: string; to: string };

const galleryImageFiles = import.meta.glob<string>(
  "./assets/*/*.{avif,jpg,jpeg,png,webp}",
  { eager: true, query: "?url", import: "default" },
);

const gallery = galleryCategories.map((category) => ({
  ...category,
  images: Object.entries(galleryImageFiles)
    .filter(([path]) => path.includes(`/${category.folder}/`))
    .sort(([pathA], [pathB]) =>
      pathA.localeCompare(pathB, undefined, { numeric: true, sensitivity: "base" }),
    )
    .map(([, src], index) => ({
      src,
      alt: `${category.title.en} ${index + 1}`,
    })),
}));

const places: Place[] = [
  {
    id: 1,
    name: "Zlatne Gorice",
    category: "restaurant",
    distance: "8 km",
    image:
      "https://www.zlatne-gorice.eu/assets/images/home-hero.jpg",
    description: {
      en: "Local flavours, thoughtful cooking and a beautiful countryside setting.",
      de: "Regionale Aromen, sorgfältige Küche und eine wunderschöne ländliche Umgebung.",
      hr: "Lokalni okusi, pažljivo pripremljena jela i prekrasno seosko okruženje.",
    },
    tip: {
      en: "Ask about the local seasonal specialities.",
      de: "Fragen Sie nach den saisonalen Spezialitäten der Region.",
      hr: "Raspitajte se o lokalnim sezonskim specijalitetima.",
    },
    address: "Zlatne Gorice, Varaždin",
    phone: "+385 42 123 456",
    maps: "https://www.google.com/maps/search/?api=1&query=Zlatne+Gorice",
  },
  {
    id: 2,
    name: "Pizzeria Špan",
    category: "restaurant",
    distance: "6 km",
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1000&q=85",
    description: {
      en: "A relaxed local favourite for pizza, pasta and an easy-going evening.",
      de: "Ein beliebter Ort für Pizza, Pasta und einen entspannten Abend.",
      hr: "Omiljeno lokalno mjesto za pizzu, tjesteninu i opuštenu večer.",
    },
    tip: {
      en: "A lovely choice for a casual family dinner.",
      de: "Eine schöne Wahl für ein entspanntes Abendessen mit der Familie.",
      hr: "Odličan izbor za opuštenu obiteljsku večeru.",
    },
    address: "Pizzeria Špan, Varaždin area",
    phone: "+385 42 345 678",
    maps: "https://www.google.com/maps/search/?api=1&query=Pizzeria+Span",
  },
  {
    id: 3,
    name: "Restaurant Bernarda",
    category: "restaurant",
    distance: "11 km",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85",
    description: {
      en: "Traditional home-style cooking in a warm, welcoming atmosphere.",
      de: "Traditionelle Hausmannskost in einer warmen, einladenden Atmosphäre.",
      hr: "Tradicionalna domaća kuhinja u toplom i ugodnom ambijentu.",
    },
    tip: {
      en: "Consider reserving a table on weekends.",
      de: "Am Wochenende empfiehlt sich eine Tischreservierung.",
      hr: "Vikendom preporučujemo rezervaciju stola.",
    },
    address: "Restaurant Bernarda",
    phone: "+385 42 234 567",
    maps: "https://www.google.com/maps/search/?api=1&query=Restaurant+Bernarda",
  },
  {
    id: 4,
    name: "KTC Jalžabet",
    category: "shop",
    distance: "3 km",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ9f8Wcv-ZGSZmv6Oy-LVOTvrF7ye6tdT0o6wu4t_QuEh4OvLAb-5PUnPi&s=10",
    description: {
      en: "Your nearby stop for groceries, fresh produce and everyday essentials.",
      de: "Ihr Supermarkt in der Nähe für Lebensmittel und Dinge des täglichen Bedarfs.",
      hr: "Trgovina u blizini za namirnice, svježe proizvode i svakodnevne potrepštine.",
    },
    tip: {
      en: "A convenient option for stocking up after arrival.",
      de: "Ideal, um sich nach der Ankunft mit allem Nötigen einzudecken.",
      hr: "Praktično mjesto za nabavu nakon dolaska.",
    },
    address: "Jalžabet, Croatia",
    phone: "+385 42 456 789",
    maps: "https://www.google.com/maps/search/?api=1&query=KTC+Jalzabet",
  },
  {
    id: 5,
    name: "KFC Varaždin",
    category: "restaurant",
    distance: "13 km",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5AgrEcypvoW2hU8_D3gjC_gI__Of4OsdaKDbslCaWLhuXqajQvgNLKOn2&s=10",
    description: {
      en: "A familiar fast-food option when you want something quick and easy.",
      de: "Eine bekannte Fast-Food-Option für eine schnelle und unkomplizierte Mahlzeit.",
      hr: "Poznati fast-food izbor kada želite brz i jednostavan obrok.",
    },
    tip: {
      en: "Useful for a quick meal while visiting Varaždin.",
      de: "Praktisch für eine schnelle Mahlzeit bei einem Besuch in Varaždin.",
      hr: "Dobro za brz obrok tijekom posjeta Varaždinu.",
    },
    address: "Varaždin, Croatia",
    maps: "https://www.google.com/maps/search/?api=1&query=KFC+Varazdin",
  },
  {
    id: 6,
    name: "Lumini",
    category: "shop",
    distance: "14 km",
    image:
      "https://gipsmont-m.hr/wp-content/uploads/2020/11/Tvornica-zdrave-hrane-Biotrgovina-Lumini-centar-Varazdin-1.jpg",
    description: {
      en: "Shopping, dining and entertainment all in one place.",
      de: "Shopping, Gastronomie und Unterhaltung an einem Ort.",
      hr: "Kupovina, gastronomija i zabava na jednom mjestu.",
    },
    tip: {
      en: "A good rainy-day option for the whole family.",
      de: "Eine gute Idee für einen Regentag mit der ganzen Familie.",
      hr: "Dobar izbor za kišni dan s cijelom obitelji.",
    },
    address: "Lumini Shopping Centre",
    maps: "https://www.google.com/maps/search/?api=1&query=Lumini+Varazdin",
  },
  {
    id: 7,
    name: "Kaufland Varaždin",
    category: "shop",
    distance: "8 km",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/65/Kaufland_Deutschland.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
    description: {
      en: "A large supermarket with a wide range of groceries and essentials.",
      de: "Ein großer Supermarkt mit einer breiten Auswahl an Lebensmitteln.",
      hr: "Veliki supermarket s bogatom ponudom namirnica i potrepština.",
    },
    tip: {
      en: "Convenient for a larger grocery shop.",
      de: "Praktisch für einen größeren Einkauf.",
      hr: "Praktično za veću kupovinu namirnica.",
    },
    address: "Koprivnička 17, Varaždin",
    phone: "0800 223 223",
    maps: "https://www.google.com/maps/search/?api=1&query=Kaufland+Varazdin",
  },
  {
    id: 8,
    name: "Plodine Ludbreg",
    category: "shop",
    distance: "15 km",
    image:
      "https://familymall.hr/wp-content/uploads/2021/04/Plodine-logo.png.webp",
    description: {
      en: "A practical supermarket for groceries and daily essentials.",
      de: "Ein praktischer Supermarkt für Lebensmittel und Dinge des täglichen Bedarfs.",
      hr: "Praktičan supermarket za namirnice i svakodnevne potrepštine.",
    },
    tip: {
      en: "Combine your shopping with a visit to Ludbreg.",
      de: "Verbinden Sie den Einkauf mit einem Besuch in Ludbreg.",
      hr: "Spojite kupovinu s posjetom Ludbregu.",
    },
    address: "Ludbreg, Croatia",
    phone: "+385 42 272 100",
    maps: "https://www.google.com/maps/search/?api=1&query=Plodine+Ludbreg",
  },
  {
    id: 9,
    name: "STOP SHOP Ludbreg",
    category: "shop",
    distance: "15 km",
    image:
      "https://cdn-emedjimurje.net.hr/wp-content/uploads/a6cf90e7b2ff4107c8d104c7e93d034b.jpg",
    description: {
      en: "A retail park with several stores for fashion, home and everyday shopping.",
      de: "Ein Einkaufspark mit Geschäften für Mode, Wohnen und den täglichen Bedarf.",
      hr: "Trgovački park s trgovinama za modu, dom i svakodnevnu kupovinu.",
    },
    tip: {
      en: "Several useful shops in one convenient stop.",
      de: "Mehrere praktische Geschäfte an einem Ort.",
      hr: "Više korisnih trgovina na jednome mjestu.",
    },
    address: "STOP SHOP Ludbreg",
    maps: "https://www.google.com/maps/search/?api=1&query=STOP+SHOP+Ludbreg",
  },
];

const copy = {
  en: {
    eyebrow: "A PRIVATE STAY · A LOCAL PERSPECTIVE",
    headline: "Discover the art\nof slowing down.",
    intro:
      "A little guide to the places we love. Thoughtfully selected for your stay at Kuća za odmor Jožić.",
    explore: "EXPLORE THE GUIDE",
    scroll: "SCROLL TO DISCOVER",
    label: "THE NEIGHBOURHOOD",
    backToTop: "BACK TO TOP",
    menuToggle: "Toggle navigation",
    previousPhoto: "Previous photo",
    nextPhoto: "Next photo",
    county: "VARAŽDIN COUNTY · CROATIA",
    family: "Jožić family",
    curatedWithCare: "CURATED WITH CARE",
    placesCount: "PLACES",
    dining: "DINING",
    shopping: "SHOPPING",
    quoteFirst: "The best memories are made",
    quoteSecond: "when you have time to enjoy them.",
    quoteCaption: "A LITTLE MORE TIME. A LITTLE MORE LIFE.",
    modalImageLabel: "THE LOCAL EDIT",
    homeNav: "Home",
    neighborhoodTitle: "The neighbourhood",
    neighborhoodHeadline: "Good places.\nBeautiful moments.",
    neighborhoodIntro:
      "From relaxed dinners to everyday essentials, discover the best of the area at your own pace.",
    title: "A stay to\nmake your own.",
    subtitle:
      "Enjoy slow mornings by the pool, unwind in the spa and settle into the easy comfort of a home made for sharing.",
    all: "Everything",
    restaurant: "Restaurants",
    shop: "Shopping",
    view: "Discover place",
    distance: "FROM YOUR STAY",
    close: "Close",
    tip: "LOCAL TIP",
    address: "ADDRESS",
    directions: "GET DIRECTIONS",
    call: "CALL",
    footer: "Made for memorable stays.",
    home: "YOUR HOME AWAY FROM HOME",
    count: "ROOM TO UNWIND",
    homeIntroEyebrow: "A PLACE TO FEEL AT HOME",
    gallery: "Gallery",
    galleryEyebrow: "A CLOSER LOOK",
    galleryTitle: "The house,\nfrom every angle.",
    galleryIntro:
      "Explore the spaces that make Kuća za odmor Jožić a place to slow down, settle in and feel at home.",
    galleryBack: "BACK TO HOME",
    galleryPhotos: "PHOTOS",
    galleryEmpty: "Photos coming soon.",
    contact: "Contact",
    availability: "Availability",
    availabilityEyebrow: "PLAN YOUR STAY",
    availabilityTitle: "Find your dates\nfor a little escape.",
    availabilityIntro:
      "See the latest stay dates offered for Kuća za odmor Jožić.",
    availabilityOpen: "Available",
    availabilityClosed: "Unavailable",
    availabilityLoading: "Loading live availability…",
    availabilityError: "Live availability could not be loaded.",
    availabilityContact: "ASK ABOUT YOUR DATES",
    availabilityNote:
      "Up to 6 guests · Private heated pool · No pets",
    contactEyebrow: "WE'D LOVE TO HEAR FROM YOU",
    contactTitle: "A warm welcome\nstarts here.",
    contactIntro:
      "Have a question about your stay? Get in touch or follow along for a glimpse of life at Kuća za odmor Jožić.",
    contactEmail: "EMAIL",
    contactPhone: "PHONE",
    contactWhatsapp: "WHATSAPP",
    contactSocial: "FOLLOW OUR STORY",
    contactNote: "We look forward to welcoming you.",
    homeFeatureEyebrow: "YOUR PRIVATE RETREAT",
    homeFeatureTitle: "Space to slow down.",
    homeFeatureText:
      "Make yourself at home, find your favourite corner and enjoy a stay shaped around your own pace.",
    homeGalleryLink: "EXPLORE THE HOUSE",
    homeNeighborhoodLink: "DISCOVER THE NEIGHBOURHOOD",
    homeMapEyebrow: "FIND YOUR WAY HERE",
    homeMapTitle: "Your stay, right here.",
    homeMapAddress: "Novakovščak 98",
    homeMapLink: "OPEN IN GOOGLE MAPS",
    amenitiesEyebrow: "THE HOUSE AT A GLANCE",
    amenitiesTitle: "A home with room for six.",
    amenitiesIntro: "Stone-built, surrounded by nature and thoughtfully equipped for relaxed family holidays.",
    guestCapacity: "GUESTS",
    propertyFacts: "Property facts",
    roomsAndBeds: "Rooms & sleeping",
    kitchenAndLaundry: "Kitchen & laundry",
    comfortAndEntertainment: "Comfort & entertainment",
    gardenAndPool: "Garden & pool",
    nearbyTitle: "Close to nature. Close to everything.",
    nearbyIntro: "A quiet setting by the forest, with walks, local essentials and day trips all within easy reach.",
    nearbyNature: "Nature & outdoors",
    nearbyActivities: "Activities & recreation",
    nearbyEssentials: "Everyday essentials",
    nearbyTravel: "Around the region",
    distanceLabel: "DISTANCE",
  },
  de: {
    eyebrow: "EIN BESONDERER AUFENTHALT · LOKALE TIPPS",
    headline: "Entdecken Sie\ndie Kunst der Ruhe.",
    intro:
      "Ein kleiner Guide zu unseren Lieblingsorten. Mit Sorgfalt für Ihren Aufenthalt im Ferienhaus Jožić ausgewählt.",
    explore: "GUIDE ENTDECKEN",
    scroll: "WEITER ENTDECKEN",
    label: "DIE UMGEBUNG",
    backToTop: "NACH OBEN",
    menuToggle: "Navigation umschalten",
    previousPhoto: "Vorheriges Foto",
    nextPhoto: "Nächstes Foto",
    county: "GES PANSCHAFT VARAŽDIN · KROATIEN",
    family: "Familie Jožić",
    curatedWithCare: "MIT SORGFALT AUSGEWÄHLT",
    placesCount: "ORTE",
    dining: "GASTRONOMIE",
    shopping: "EINKAUFEN",
    quoteFirst: "Die schönsten Erinnerungen entstehen,",
    quoteSecond: "wenn man Zeit hat, sie zu genießen.",
    quoteCaption: "MEHR ZEIT. MEHR LEBEN.",
    modalImageLabel: "LOKALE EMPFEHLUNG",
    homeNav: "Startseite",
    neighborhoodTitle: "Die Umgebung",
    neighborhoodHeadline: "Schöne Orte.\nBesondere Momente.",
    neighborhoodIntro:
      "Von entspannten Abendessen bis zum täglichen Einkauf – entdecken Sie die Region in Ihrem eigenen Tempo.",
    title: "Ein Aufenthalt\nganz nach Ihrem Geschmack.",
    subtitle:
      "Genießen Sie ruhige Morgen am Pool, entspannen Sie im Wellnessbereich und fühlen Sie sich wie zu Hause.",
    all: "Alle Orte",
    restaurant: "Restaurants",
    shop: "Einkaufen",
    view: "Ort entdecken",
    distance: "VON IHRER UNTERKUNFT",
    close: "Schließen",
    tip: "LOKALER TIPP",
    address: "ADRESSE",
    directions: "ROUTE PLANEN",
    call: "ANRUFEN",
    footer: "Für unvergessliche Aufenthalte.",
    home: "IHR ZUHAUSE AUF ZEIT",
    count: "RAUM ZUM ENTSPANNEN",
    homeIntroEyebrow: "EIN ORT ZUM WOHLFÜHLEN",
    gallery: "Galerie",
    galleryEyebrow: "EIN NÄHERER BLICK",
    galleryTitle: "Das Haus,\naus jedem Blickwinkel.",
    galleryIntro:
      "Entdecken Sie die Räume, die das Ferienhaus Jožić zu einem Ort der Ruhe und des Wohlfühlens machen.",
    galleryBack: "ZURÜCK ZUR STARTSEITE",
    galleryPhotos: "FOTOS",
    galleryEmpty: "Fotos folgen in Kürze.",
    contact: "Kontakt",
    availability: "Verfügbarkeit",
    availabilityEyebrow: "PLANEN SIE IHREN AUFENTHALT",
    availabilityTitle: "Finden Sie Ihre Reisedaten\nfür eine kleine Auszeit.",
    availabilityIntro:
      "Sehen Sie die aktuell verfügbaren Termine für das Ferienhaus Jožić.",
    availabilityOpen: "Verfügbar",
    availabilityClosed: "Nicht verfügbar",
    availabilityLoading: "Aktuelle Verfügbarkeit wird geladen…",
    availabilityError: "Die aktuelle Verfügbarkeit konnte nicht geladen werden.",
    availabilityContact: "TERMIN ANFRAGEN",
    availabilityNote:
      "Bis zu 6 Gäste · Privater beheizter Pool · Keine Haustiere",
    contactEyebrow: "WIR FREUEN UNS AUF IHRE NACHRICHT",
    contactTitle: "Ein herzliches Willkommen\nbeginnt hier.",
    contactIntro:
      "Haben Sie eine Frage zu Ihrem Aufenthalt? Schreiben Sie uns oder folgen Sie unserem Alltag im Ferienhaus Jožić.",
    contactEmail: "E-MAIL",
    contactPhone: "TELEFON",
    contactWhatsapp: "WHATSAPP",
    contactSocial: "FOLGEN SIE UNS",
    contactNote: "Wir freuen uns darauf, Sie willkommen zu heißen.",
    homeFeatureEyebrow: "IHR PRIVATER RÜCKZUGSORT",
    homeFeatureTitle: "Raum zum Entspannen.",
    homeFeatureText:
      "Fühlen Sie sich wie zu Hause, finden Sie Ihren Lieblingsplatz und genießen Sie Ihren Aufenthalt in Ihrem eigenen Tempo.",
    homeGalleryLink: "DAS HAUS ENTDECKEN",
    homeNeighborhoodLink: "UMGEBUNG ENTDECKEN",
    homeMapEyebrow: "SO FINDEN SIE UNS",
    homeMapTitle: "Ihr Aufenthalt, genau hier.",
    homeMapAddress: "Novakovščak 98",
    homeMapLink: "IN GOOGLE MAPS ÖFFNEN",
    amenitiesEyebrow: "DAS HAUS AUF EINEN BLICK",
    amenitiesTitle: "Ein Zuhause mit Platz für sechs.",
    amenitiesIntro: "Ein Haus aus Stein, umgeben von Natur und ausgestattet für entspannte Familienferien.",
    guestCapacity: "GÄSTE",
    propertyFacts: "Über das Haus",
    roomsAndBeds: "Zimmer & Schlafplätze",
    kitchenAndLaundry: "Küche & Wäsche",
    comfortAndEntertainment: "Komfort & Unterhaltung",
    gardenAndPool: "Garten & Pool",
    nearbyTitle: "Nah an der Natur. Nah an allem.",
    nearbyIntro: "Ruhig am Waldrand gelegen – Wanderwege, Einkaufsmöglichkeiten und Ausflugsziele sind gut erreichbar.",
    nearbyNature: "Natur & draußen",
    nearbyActivities: "Aktivitäten & Freizeit",
    nearbyEssentials: "Einkauf & Gastronomie",
    nearbyTravel: "In der Region",
    distanceLabel: "ENTFERNUNG",
  },
  hr: {
    eyebrow: "PRIVATNI SMJEŠTAJ · LOKALNI DOŽIVLJAJ",
    headline: "Otkrijte ljepotu\nsporijeg ritma.",
    intro:
      "Mali vodič kroz naša omiljena mjesta, pažljivo odabrana za vaš boravak u Kući za odmor Jožić.",
    explore: "ISTRAŽITE VODIČ",
    scroll: "POMAKNITE ZA VIŠE",
    label: "OKOLICA",
    backToTop: "POVRATAK NA VRH",
    menuToggle: "Otvori ili zatvori navigaciju",
    previousPhoto: "Prethodna fotografija",
    nextPhoto: "Sljedeća fotografija",
    county: "VARAŽDINSKA ŽUPANIJA · HRVATSKA",
    family: "Obitelj Jožić",
    curatedWithCare: "PAŽLJIVO ODABRANO",
    placesCount: "MJESTA",
    dining: "GASTRONOMIJA",
    shopping: "KUPNJA",
    quoteFirst: "Najljepše uspomene nastaju",
    quoteSecond: "kad imamo vremena uživati u njima.",
    quoteCaption: "MALO VIŠE VREMENA. MALO VIŠE ŽIVOTA.",
    modalImageLabel: "LOKALNA PREPORUKA",
    homeNav: "Početna",
    neighborhoodTitle: "Okolica",
    neighborhoodHeadline: "Lijepa mjesta.\nPosebni trenuci.",
    neighborhoodIntro:
      "Od opuštenih večera do svakodnevnih potrepština, istražite najbolje u okolici svojim tempom.",
    title: "Boravak po\nvašoj mjeri.",
    subtitle:
      "Uživajte u mirnim jutrima uz bazen, opustite se u spa zoni i osjećajte se kao kod kuće.",
    all: "Sve",
    restaurant: "Restorani",
    shop: "Trgovine",
    view: "Otkrijte mjesto",
    distance: "OD SMJEŠTAJA",
    close: "Zatvori",
    tip: "LOKALNI SAVJET",
    address: "ADRESA",
    directions: "PRIKAŽI RUTU",
    call: "NAZOVITE",
    footer: "Za boravke za pamćenje.",
    home: "VAŠ DOM IZVAN DOMA",
    count: "PROSTOR ZA OPUŠTANJE",
    homeIntroEyebrow: "MJESTO U KOJEM SE OSJEĆATE KAO KOD KUĆE",
    gallery: "Galerija",
    galleryEyebrow: "ZAVIRITE UNUTRA",
    galleryTitle: "Kuća,\niz svakog kuta.",
    galleryIntro:
      "Istražite prostore zbog kojih je Kuća za odmor Jožić savršeno mjesto za predah i osjećaj doma.",
    galleryBack: "POVRATAK NA POČETNU",
    galleryPhotos: "FOTOGRAFIJE",
    galleryEmpty: "Fotografije uskoro stižu.",
    contact: "Kontakt",
    availability: "Dostupnost",
    availabilityEyebrow: "ISPLANIRAJTE BORAVAK",
    availabilityTitle: "Pronađite svoj termin\nza mali bijeg.",
    availabilityIntro:
      "Provjerite aktualnu dostupnost Kuće za odmor Jožić.",
    availabilityOpen: "Dostupno",
    availabilityClosed: "Zauzeto",
    availabilityLoading: "Učitavanje aktualne dostupnosti…",
    availabilityError: "Dostupnost trenutačno nije moguće učitati.",
    availabilityContact: "PITAJTE ZA TERMIN",
    availabilityNote:
      "Do 6 gostiju · Privatni grijani bazen · Kućni ljubimci nisu dopušteni",
    contactEyebrow: "VESELIMO SE VAŠOJ PORUCI",
    contactTitle: "Srdačna dobrodošlica\npočinje ovdje.",
    contactIntro:
      "Imate pitanje o boravku? Javite nam se ili zapratite svakodnevicu u Kući za odmor Jožić.",
    contactEmail: "E-POŠTA",
    contactPhone: "TELEFON",
    contactWhatsapp: "WHATSAPP",
    contactSocial: "PRATITE NAS",
    contactNote: "Veselimo se što ćemo vas ugostiti.",
    homeFeatureEyebrow: "VAŠE PRIVATNO UTOČIŠTE",
    homeFeatureTitle: "Prostor za predah.",
    homeFeatureText:
      "Osjećajte se kao kod kuće, pronađite svoj omiljeni kutak i uživajte u boravku vlastitim tempom.",
    homeGalleryLink: "ISTRAŽITE KUĆU",
    homeNeighborhoodLink: "OTKRIJTE OKOLICU",
    homeMapEyebrow: "KAKO DO NAS",
    homeMapTitle: "Vaš smještaj, upravo ovdje.",
    homeMapAddress: "Novakovščak 98",
    homeMapLink: "OTVORI U GOOGLE MAPS-U",
    amenitiesEyebrow: "KUĆA UKRATKO",
    amenitiesTitle: "Dom s prostorom za šestero.",
    amenitiesIntro: "Kamena kuća okružena prirodom, pažljivo opremljena za opušten obiteljski odmor.",
    guestCapacity: "GOSTIJU",
    propertyFacts: "O kući",
    roomsAndBeds: "Sobe i ležajevi",
    kitchenAndLaundry: "Kuhinja i praonica",
    comfortAndEntertainment: "Udobnost i zabava",
    gardenAndPool: "Vrt i bazen",
    nearbyTitle: "Blizu prirode. Blizu svega.",
    nearbyIntro: "Mirna lokacija uz šumu, s idealnim mogućnostima za šetnje, izlete i svakodnevne potrebe.",
    nearbyNature: "Priroda i boravak na otvorenom",
    nearbyActivities: "Aktivnosti i rekreacija",
    nearbyEssentials: "Svakodnevne potrepštine",
    nearbyTravel: "U okolici",
    distanceLabel: "UDALJENOST",
  },
};

type Copy = (typeof copy)[Language];

const normalizeAvailabilityPayload = (payload: unknown): AvailabilityRange[] => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Availability response has an unexpected format");
  }

  if ("availableRanges" in payload && Array.isArray(payload.availableRanges)) {
    const ranges = payload.availableRanges;
    if (
      !ranges.every(
        (range) =>
          !!range &&
          typeof range === "object" &&
          "from" in range &&
          "to" in range &&
          typeof range.from === "string" &&
          typeof range.to === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(range.from) &&
          /^\d{4}-\d{2}-\d{2}$/.test(range.to) &&
          range.from <= range.to,
      )
    ) {
      throw new Error("Availability response has invalid date ranges");
    }
    return ranges;
  }

  if ("datesRanges" in payload && Array.isArray(payload.datesRanges)) {
    const ranges = payload.datesRanges;
    if (
      !ranges.every(
        (range) =>
          !!range &&
          typeof range === "object" &&
          "from" in range &&
          "to" in range &&
          typeof range.from === "string" &&
          typeof range.to === "string" &&
          /^\d{8}$/.test(range.from) &&
          /^\d{8}$/.test(range.to) &&
          range.from <= range.to,
      )
    ) {
      throw new Error("NOVASOL response has invalid date ranges");
    }

    const sortedRanges = ranges
      .map((range) => ({
        from: `${range.from.slice(0, 4)}-${range.from.slice(4, 6)}-${range.from.slice(6, 8)}`,
        to: `${range.to.slice(0, 4)}-${range.to.slice(4, 6)}-${range.to.slice(6, 8)}`,
      }))
      .sort((left, right) => left.from.localeCompare(right.from) || left.to.localeCompare(right.to));
    const mergedRanges: AvailabilityRange[] = [];

    for (const range of sortedRanges) {
      const lastRange = mergedRanges.at(-1);
      if (lastRange && range.from <= lastRange.to) {
        if (range.to > lastRange.to) lastRange.to = range.to;
      } else {
        mergedRanges.push(range);
      }
    }

    return mergedRanges;
  }

  throw new Error("Availability response does not contain date ranges");
};

function AvailabilityCalendar({
  language,
  labels,
}: {
  language: Language;
  labels: Pick<
    Copy,
    | "availabilityOpen"
    | "availabilityClosed"
    | "availabilityLoading"
    | "availabilityError"
  >;
}) {
  const [availableRanges, setAvailableRanges] = useState<AvailabilityRange[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    const controller = new AbortController();
    const loadAvailability = async () => {
      try {
        const availabilityEndpoint = import.meta.env.DEV
          ? "/api/novasol-availability"
          : "/.netlify/functions/novasol-availability";
        const response = await fetch(availabilityEndpoint, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Availability request failed with HTTP ${response.status}`);
        }

        const payload: unknown = await response.json();
        setAvailableRanges(normalizeAvailabilityPayload(payload));
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Could not load live NOVASOL availability:", error);
        setAvailabilityError(true);
      } finally {
        if (!controller.signal.aborted) setAvailabilityLoading(false);
      }
    };

    void loadAvailability();
    return () => controller.abort();
  }, []);

  const locale = language === "en" ? "en-GB" : language === "de" ? "de-DE" : "hr-HR";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstWeekday = (date: Date) => (date.getDay() + 6) % 7;
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, index + 1)),
  );
  const months = [
    visibleMonth,
    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
  ];

  const shiftMonth = (offset: number) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
  };

  return (
    <div className="availability-calendar-card">
      <div className="availability-calendar-header">
        <div>
          <span className="amenity-index">
            {language === "en"
              ? "BOOKING CALENDAR"
              : language === "de"
                ? "BELEGUNGSKALENDER"
                : "KALENDAR DOSTUPNOSTI"}
          </span>
          <h2>
            {language === "en"
              ? "Find your moment."
              : language === "de"
                ? "Finden Sie Ihren Moment."
                : "Pronađite svoj trenutak."}
          </h2>
        </div>
        <div className="availability-calendar-controls">
          <button
            type="button"
            aria-label={
              language === "en" ? "Previous month" : language === "de" ? "Vorheriger Monat" : "Prethodni mjesec"
            }
            disabled={
              visibleMonth.getFullYear() === today.getFullYear() &&
              visibleMonth.getMonth() === today.getMonth()
            }
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label={
              language === "en" ? "Next month" : language === "de" ? "Nächster Monat" : "Sljedeći mjesec"
            }
            onClick={() => shiftMonth(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="availability-months">
        {months.map((month) => {
          const year = month.getFullYear();
          const monthNumber = month.getMonth();
          const daysInMonth = new Date(year, monthNumber + 1, 0).getDate();
          const blanks = firstWeekday(month);

          return (
            <section className="availability-month" key={`${year}-${monthNumber}`}>
              <h3>
                {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month)}
              </h3>
              <div className="availability-days availability-weekdays">
                {weekdays.map((weekday, index) => (
                  <span key={`${weekday}-${index}`}>{weekday}</span>
                ))}
              </div>
              <div className="availability-days">
                {Array.from({ length: blanks }, (_, index) => (
                  <span className="availability-day-empty" key={`empty-${index}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const date = new Date(year, monthNumber, day);
                  const dateKey = [
                    year,
                    String(monthNumber + 1).padStart(2, "0"),
                    String(day).padStart(2, "0"),
                  ].join("-");
                  const inKnownPeriod = availableRanges.length > 0 &&
                    dateKey >= availableRanges[0].from &&
                    dateKey <= availableRanges[availableRanges.length - 1].to;
                  const isAvailable = !availabilityLoading &&
                    !availabilityError &&
                    inKnownPeriod &&
                    availableRanges.some((range) => dateKey >= range.from && dateKey <= range.to);
                  const isUnknown = availabilityLoading || availabilityError || !inKnownPeriod;
                  const isPast = date < today;
                  const status = isAvailable ? labels.availabilityOpen : labels.availabilityClosed;
                  const statusClass = isAvailable ? "open" : isUnknown ? "unknown" : "closed";

                  return (
                    <span
                      aria-label={`${new Intl.DateTimeFormat(locale, {
                        dateStyle: "long",
                      }).format(date)}: ${status}`}
                      className={`availability-day availability-day-${statusClass}${isPast ? " availability-day-past" : ""}`}
                      key={dateKey}
                      title={`${day}: ${status}`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="availability-calendar-footer">
        <div className="availability-legend">
          <span><i className="availability-legend-open" />{labels.availabilityOpen}</span>
          <span><i className="availability-legend-closed" />{labels.availabilityClosed}</span>
        </div>
        {(availabilityLoading || availabilityError) && (
          <p>{availabilityLoading ? labels.availabilityLoading : labels.availabilityError}</p>
        )}
      </div>
    </div>
  );
}

const amenityGroups: {
  title: Record<Language, string>;
  items: Record<Language, string[]>;
}[] = [
  {
    title: { en: copy.en.propertyFacts, de: copy.de.propertyFacts, hr: copy.hr.propertyFacts },
    items: {
      en: [
        "Stone-built holiday home; built in 1992, renovated in 2024",
        "Quality rating: 4",
        "For holiday stays only; youth groups are not permitted",
        "Near the forest",
        "Pets: not allowed",
        "Sleeps up to 6 guests (4 + 2)",
        "Children’s beds: 0 · free stays for children under 4: 0",
        "Baby cot: 1 · high chair: 1",
      ],
      de: [
        "Ferienhaus aus Stein; Baujahr 1992, renoviert 2024",
        "Qualitätsbewertung: 4",
        "Nur für Ferienaufenthalte; Jugendgruppen sind nicht erlaubt",
        "In Waldnähe",
        "Haustiere: nicht erlaubt",
        "Für bis zu 6 Gäste (4 + 2)",
        "Kinderbetten: 0 · kostenlose Aufenthalte für Kinder unter 4: 0",
        "Babybett: 1 · Hochstuhl: 1",
      ],
      hr: [
        "Kamena kuća za odmor; izgrađena 1992., renovirana 2024.",
        "Kategorija kvalitete: 4",
        "Namijenjena samo za odmor; grupe mladih nisu dopuštene",
        "U blizini šume",
        "Kućni ljubimci nisu dopušteni",
        "Za najviše 6 gostiju (4 + 2)",
        "Dječji kreveti: 0 · besplatan boravak djece mlađe od 4 godine: 0",
        "Dječji krevetić: 1 · hranilica: 1",
      ],
    },
  },
  {
    title: { en: copy.en.roomsAndBeds, de: copy.de.roomsAndBeds, hr: copy.hr.roomsAndBeds },
    items: {
      en: [
        "Living room: sofa bed for 2",
        "Bedroom 1: double bed for 2",
        "Bedroom 2: single bed, capacity 2",
        "2 bathrooms, each with a shower and hot & cold water",
      ],
      de: [
        "Wohnzimmer: Schlafsofa für 2 Personen",
        "Schlafzimmer 1: Doppelbett für 2 Personen",
        "Schlafzimmer 2: Einzelbett, Kapazität 2",
        "2 Badezimmer, jeweils mit Dusche sowie Warm- und Kaltwasser",
      ],
      hr: [
        "Dnevni boravak: kauč na razvlačenje za 2 osobe",
        "Spavaća soba 1: bračni krevet za 2 osobe",
        "Spavaća soba 2: krevet za 2 osobe",
        "2 kupaonice, svaka s tušem te toplom i hladnom vodom",
      ],
    },
  },
  {
    title: { en: copy.en.kitchenAndLaundry, de: copy.de.kitchenAndLaundry, hr: copy.hr.kitchenAndLaundry },
    items: {
      en: [
        "Kitchen and dining area; hot & cold water",
        "4-zone induction hob, oven, extractor hood",
        "Refrigerator with 80 L freezer, microwave",
        "Coffee maker, dishwasher, cooking basics, dishes & silverware",
        "Washer, dryer, vacuum cleaner",
        "Hair dryer, iron, hangers",
      ],
      de: [
        "Küche und Essbereich; Warm- und Kaltwasser",
        "Induktionskochfeld mit 4 Kochzonen, Backofen, Dunstabzug",
        "Kühlschrank mit 80-L-Gefrierfach, Mikrowelle",
        "Kaffeemaschine, Geschirrspüler, Kochgrundlagen, Geschirr & Besteck",
        "Waschmaschine, Trockner, Staubsauger",
        "Haartrockner, Bügeleisen, Kleiderbügel",
      ],
      hr: [
        "Kuhinja i blagovaonica; topla i hladna voda",
        "Indukcijska ploča s 4 zone, pećnica i napa",
        "Hladnjak sa zamrzivačem od 80 l, mikrovalna pećnica",
        "Aparat za kavu, perilica posuđa, posuđe i pribor za jelo",
        "Perilica i sušilica rublja, usisavač",
        "Sušilo za kosu, glačalo i vješalice",
      ],
    },
  },
  {
    title: { en: copy.en.comfortAndEntertainment, de: copy.de.comfortAndEntertainment, hr: copy.hr.comfortAndEntertainment },
    items: {
      en: [
        "3 TVs, Smart TV, Netflix and stereo system",
        "PlayStation 5, ping pong table and board games",
        "Indoor and outdoor toys; children’s books",
        "Free Wi-Fi",
        "Central heating, full thermal insulation",
        "3 air-conditioning units (heating & cooling)",
        "Smoke alarm",
      ],
      de: [
        "3 Fernseher, Smart-TV, Netflix und Stereoanlage",
        "PlayStation 5, Tischtennisplatte und Gesellschaftsspiele",
        "Spielzeug für drinnen und draußen; Kinderbücher",
        "Kostenloses WLAN",
        "Zentralheizung, vollständige Wärmedämmung",
        "3 Klimaanlagen (Heizen & Kühlen)",
        "Rauchmelder",
      ],
      hr: [
        "3 televizora, Smart TV, Netflix i stereo sustav",
        "PlayStation 5, stolni tenis i društvene igre",
        "Igračke za unutarnji i vanjski prostor; dječje knjige",
        "Besplatan Wi-Fi",
        "Centralno grijanje i potpuna toplinska izolacija",
        "3 klima-uređaja za grijanje i hlađenje",
        "Detektor dima",
      ],
    },
  },
  {
    title: { en: copy.en.gardenAndPool, de: copy.de.gardenAndPool, hr: copy.hr.gardenAndPool },
    items: {
      en: [
        "Private heated outdoor pool (20 m²), open June–September",
        "1 outdoor shower",
        "1,500 m² natural garden / plot, not fenced",
        "Covered terrace and balcony",
        "Garden furniture, 4 sun loungers",
        "Masonry BBQ and electric grill",
        "Outdoor toys and games",
        "Free on-site parking for 2 cars",
        "Hot tub and sauna",
      ],
      de: [
        "Privater beheizter Außenpool (20 m²), geöffnet Juni–September",
        "1 Außendusche",
        "1.500 m² Naturgrundstück / Garten, nicht eingezäunt",
        "Überdachte Terrasse und Balkon",
        "Gartenmöbel, 4 Sonnenliegen",
        "Gemauerter Grill und Elektrogrill",
        "Spielzeug und Spiele für draußen",
        "Kostenloser Parkplatz für 2 Autos auf dem Grundstück",
        "Whirlpool und Sauna",
      ],
      hr: [
        "Privatni grijani vanjski bazen (20 m²), otvoren od lipnja do rujna",
        "Vanjski tuš",
        "Prirodno zemljište/vrt od 1.500 m², nije ograđeno",
        "Natkrivena terasa i balkon",
        "Vrtni namještaj i 4 ležaljke",
        "Zidani roštilj i električni grill",
        "Igračke i igre za vanjski prostor",
        "Besplatno parkiralište za 2 automobila u sklopu objekta",
        "Hidromasažna kada i sauna",
      ],
    },
  },
];

const nearbyGroups: {
  title: Record<Language, string>;
  places: { name: Record<Language, string>; distance: string }[];
}[] = [
  {
    title: { en: copy.en.nearbyNature, de: copy.de.nearbyNature, hr: copy.hr.nearbyNature },
    places: [
      { name: { en: "Walking trails", de: "Wanderwege", hr: "Staze za šetnju" }, distance: "10 m" },
      { name: { en: "Marked hiking trails (5–10 km)", de: "Markierte Wanderwege (5–10 km)", hr: "Označene pješačke staze (5–10 km)" }, distance: "10 m" },
      { name: { en: "Mountain bike trails (5–10 km)", de: "Mountainbike-Strecken (5–10 km)", hr: "Staze za brdski biciklizam (5–10 km)" }, distance: "10 m" },
      { name: { en: "Cycling routes (5–10 km)", de: "Radwege (5–10 km)", hr: "Biciklističke staze (5–10 km)" }, distance: "10 m" },
      { name: { en: "Lake / swimming area", de: "See / Badebereich", hr: "Jezero / kupalište" }, distance: "10 km" },
      { name: { en: "Fishing", de: "Angeln", hr: "Ribolov" }, distance: "10 km" },
    ],
  },
  {
    title: { en: copy.en.nearbyActivities, de: copy.de.nearbyActivities, hr: copy.hr.nearbyActivities },
    places: [
      { name: { en: "Tennis courts", de: "Tennisplätze", hr: "Teniski tereni" }, distance: "2,5 km" },
      { name: { en: "Children’s playground", de: "Kinderspielplatz", hr: "Dječje igralište" }, distance: "2 km" },
      { name: { en: "Public swimming pool", de: "Öffentliches Schwimmbad", hr: "Javni bazen" }, distance: "8 km" },
      { name: { en: "Outdoor swimming pool", de: "Freibad", hr: "Vanjski bazen" }, distance: "8 km" },
      { name: { en: "Water park", de: "Wasserpark", hr: "Aquapark" }, distance: "8 km" },
      { name: { en: "Bowling", de: "Bowling", hr: "Kuglana" }, distance: "11 km" },
      { name: { en: "Bicycle rental", de: "Fahrradverleih", hr: "Najam bicikala" }, distance: "18 km" },
      { name: { en: "Recreation centre", de: "Freizeitzentrum", hr: "Rekreacijski centar" }, distance: "18 km" },
      { name: { en: "Fitness centre", de: "Fitnessstudio", hr: "Fitness centar" }, distance: "18 km" },
      { name: { en: "Running / fitness trail", de: "Lauf- / Trimmpfad", hr: "Staza za trčanje / trim-staza" }, distance: "18 km" },
      { name: { en: "Thermal baths", de: "Therme", hr: "Terme" }, distance: "8 km" },
    ],
  },
  {
    title: { en: copy.en.nearbyEssentials, de: copy.de.nearbyEssentials, hr: copy.hr.nearbyEssentials },
    places: [
      { name: { en: "Grocery shop", de: "Geschäft", hr: "Trgovina" }, distance: "2 km" },
      { name: { en: "Restaurant", de: "Restaurant", hr: "Restoran" }, distance: "2,5 km" },
      { name: { en: "Nearest neighbour", de: "Nächster Nachbar", hr: "Najbliži susjed" }, distance: "50 m" },
    ],
  },
  {
    title: { en: copy.en.nearbyTravel, de: copy.de.nearbyTravel, hr: copy.hr.nearbyTravel },
    places: [
      { name: { en: "Varaždin city centre", de: "Stadtzentrum Varaždin", hr: "Središte Varaždina" }, distance: "18 km" },
      { name: { en: "Zagreb Airport (ZAG)", de: "Flughafen Zagreb (ZAG)", hr: "Zračna luka Zagreb (ZAG)" }, distance: "77 km" },
    ],
  },
];

function NeighborhoodPage({
  t,
  language,
  category,
  onCategoryChange,
  filteredPlaces,
  onSelectPlace,
}: {
  t: Copy;
  language: Language;
  category: Category;
  onCategoryChange: (category: Category) => void;
  filteredPlaces: Place[];
  onSelectPlace: (place: Place) => void;
}) {
  return (
    <section className="guide-section" id="neighborhood">
      <header className="neighborhood-intro">
        <div className="eyebrow dark-eyebrow">
          <span className="eyebrow-line" />
          {t.homeIntroEyebrow}
        </div>
        <h1>
          {t.neighborhoodHeadline.split("\n")[0]}
          <br />
          <em>{t.neighborhoodHeadline.split("\n")[1]}</em>
        </h1>
        <p>{t.neighborhoodIntro}</p>
      </header>

      <div className="filter-row reveal">
        <div className="filter-buttons">
          {(["all", "restaurant", "shop"] as Category[]).map((item) => (
            <button
              key={item}
              className={`filter-button ${category === item ? "filter-active" : ""}`}
              onClick={() => onCategoryChange(item)}
            >
              {item === "restaurant" ? (
                <Utensils size={14} />
              ) : item === "shop" ? (
                <ShoppingBasket size={14} />
              ) : null}
              {t[item]}
            </button>
          ))}
        </div>
        <span className="result-count">
          {String(filteredPlaces.length).padStart(2, "0")} {t.placesCount}
        </span>
      </div>

      <div className="places-grid">
        {filteredPlaces.map((place, index) => (
          <article
            className={`place-card reveal ${index === 0 ? "place-featured" : ""}`}
            key={place.id}
            style={{ transitionDelay: `${(index % 3) * 90}ms` }}
          >
            <button
              className="place-image-button"
              onClick={() => onSelectPlace(place)}
              aria-label={`${t.view}: ${place.name}`}
            >
              <img
                className="place-image"
                src={place.image}
                alt={place.name}
                loading={index < 3 ? "eager" : "lazy"}
              />
              <span className="image-number">0{index + 1}</span>
              <span className="image-arrow">
                <ArrowUpRight size={19} strokeWidth={1.5} />
              </span>
            </button>
            <div className="place-meta">
              <span className="place-category">
                {place.category === "restaurant" ? t.dining : t.shopping}
              </span>
              <span className="place-distance">
                <MapPin size={12} />
                {place.distance}
              </span>
            </div>
            <button className="place-title-button" onClick={() => onSelectPlace(place)}>
              <h3>{place.name}</h3>
              <ArrowRight size={18} strokeWidth={1.3} />
            </button>
            <p className="place-description">{place.description[language]}</p>
            <button className="discover-link" onClick={() => onSelectPlace(place)}>
              {t.view} <span>↗</span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>("hr");
  const [category, setCategory] = useState<Category>("all");
  const [selected, setSelected] = useState<Place | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    () => {
      if (window.location.hash === "#neighborhood" || window.location.hash === "#guide") return "neighborhood";
      if (window.location.hash.startsWith("#gallery")) return "gallery";
      if (window.location.hash === "#contact") return "contact";
      if (window.location.hash === "#availability") return "availability";
      return "home";
    },
  );
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<{
    categoryIndex: number;
    imageIndex: number;
  } | null>(null);
  const t = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const filteredPlaces = places.filter(
    (place) => category === "all" || place.category === category,
  );

  const moveGalleryImage = useCallback((direction: number) => {
    setSelectedGalleryImage((current) => {
      if (!current) return current;
      const images = gallery[current.categoryIndex].images;
      const nextImageIndex = (current.imageIndex + direction + images.length) % images.length;
      return { ...current, imageIndex: nextImageIndex };
    });
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [category, currentPage]);

  useEffect(() => {
    const syncPage = () => {
      const nextPage = window.location.hash === "#neighborhood" || window.location.hash === "#guide"
        ? "neighborhood"
        : window.location.hash.startsWith("#gallery")
          ? "gallery"
          : window.location.hash === "#contact"
            ? "contact"
            : window.location.hash === "#availability"
              ? "availability"
              : "home";
      if (nextPage !== currentPage) window.scrollTo(0, 0);
      setCurrentPage(nextPage);
    };
    window.addEventListener("hashchange", syncPage);
    window.addEventListener("popstate", syncPage);
    return () => {
      window.removeEventListener("hashchange", syncPage);
      window.removeEventListener("popstate", syncPage);
    };
  }, [currentPage]);

  useEffect(() => {
    if (!selectedGalleryImage) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedGalleryImage(null);
      if (event.key === "ArrowLeft") moveGalleryImage(-1);
      if (event.key === "ArrowRight") moveGalleryImage(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedGalleryImage, moveGalleryImage]);

  const navigateTo = (page: "home" | "neighborhood" | "gallery" | "contact" | "availability") => {
    const hash = page === "neighborhood"
      ? "#neighborhood"
      : page === "gallery"
        ? "#gallery"
        : page === "contact"
          ? "#contact"
          : page === "availability"
            ? "#availability"
          : "#home";
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
    setCurrentPage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToNeighborhood = () => {
    navigateTo("neighborhood");
  };

  return (
    <main>
      <nav className="navbar">
        <a
          className="brand"
          href="#home"
          aria-label="Stay Guide home"
          onClick={(event) => {
            event.preventDefault();
            navigateTo("home");
          }}
        >
          <img className="brand-logo" src={logo} alt="Kuća za odmor Jožić" />
          <span className="brand-text">
            STAY GUIDE
            <small>KUĆA ZA ODMOR JOŽIĆ</small>
          </span>
        </a>

        <div className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
          <a
            className={currentPage === "home" ? "nav-link-active" : ""}
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              navigateTo("home");
            }}
          >
            {t.homeNav}
          </a>
          <a
            className={currentPage === "neighborhood" ? "nav-link-active" : ""}
            href="#neighborhood"
            onClick={(event) => {
              event.preventDefault();
              navigateToNeighborhood();
            }}
          >
            {t.label}
          </a>
          <a
            className={currentPage === "gallery" ? "nav-link-active" : ""}
            href="#gallery"
            onClick={(event) => {
              event.preventDefault();
              navigateTo("gallery");
            }}
          >
            {t.gallery}
          </a>
          <a
            className={currentPage === "availability" ? "nav-link-active" : ""}
            href="#availability"
            onClick={(event) => {
              event.preventDefault();
              navigateTo("availability");
            }}
          >
            {t.availability}
          </a>
          <a
            className={currentPage === "contact" ? "nav-link-active" : ""}
            href="#contact"
            onClick={(event) => {
              event.preventDefault();
              navigateTo("contact");
            }}
          >
            {t.contact}
          </a>
        </div>

        <div className="nav-right">
          <Globe2 size={16} strokeWidth={1.5} />
          <button
            className={language === "hr" ? "language active-language" : "language"}
            onClick={() => setLanguage("hr")}
          >
            HR
          </button>
          <span className="language-divider">/</span>
          <button
            className={language === "en" ? "language active-language" : "language"}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
          <span className="language-divider">/</span>
          <button
            className={language === "de" ? "language active-language" : "language"}
            onClick={() => setLanguage("de")}
          >
            DE
          </button>
          <button
            className="menu-button"
            aria-label={t.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>

      {currentPage === "gallery" ? (
        <section className="gallery-page">
          <header className="gallery-intro">
            <span className="eyebrow gallery-eyebrow">
              <span className="eyebrow-line" />
              {t.galleryEyebrow}
            </span>
            <h1>
              {t.galleryTitle.split("\n")[0]}
              <br />
              <em>{t.galleryTitle.split("\n")[1]}</em>
            </h1>
            <p>{t.galleryIntro}</p>
            <nav className="gallery-index" aria-label={t.gallery}>
              {gallery.map((section, index) => (
                <a key={section.folder} href={`#gallery-${section.folder}`}>
                  <span>0{index + 1}</span>
                  {section.title[language]}
                </a>
              ))}
            </nav>
          </header>
          <div className="gallery-sections">
            {gallery.map((section, sectionIndex) => (
              <section
                className="gallery-section"
                id={`gallery-${section.folder}`}
                key={section.folder}
              >
                <div className="gallery-section-heading">
                  <div>
                    <span className="gallery-section-index">0{sectionIndex + 1}</span>
                    <h2>{section.title[language]}</h2>
                    <p>{section.description[language]}</p>
                  </div>
                  <span className="gallery-photo-count">
                    {String(section.images.length).padStart(2, "0")} {t.galleryPhotos}
                  </span>
                </div>
                {section.images.length > 0 ? (
                  <div className="gallery-grid">
                    {section.images.map((image, imageIndex) => (
                      <button
                        className="gallery-image-button"
                        key={image.src}
                        onClick={() => setSelectedGalleryImage({ categoryIndex: sectionIndex, imageIndex })}
                        aria-label={`${section.title[language]} ${imageIndex + 1}`}
                        style={{ animationDelay: `${Math.min(imageIndex, 5) * 70}ms` }}
                      >
                        <img src={image.src} alt={`${section.title[language]} ${imageIndex + 1}`} loading="lazy" />
                        <span className="gallery-image-overlay">
                          <span>{section.title[language]}</span>
                          <span>0{imageIndex + 1}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="gallery-empty">{t.galleryEmpty}</p>
                )}
              </section>
            ))}
          </div>
        </section>
      ) : currentPage === "availability" ? (
        <section className="availability-page">
          <header className="availability-intro">
            <span className="eyebrow gallery-eyebrow">
              <span className="eyebrow-line" />
              {t.availabilityEyebrow}
            </span>
            <h1>
              {t.availabilityTitle.split("\n")[0]}
              <br />
              <em>{t.availabilityTitle.split("\n")[1]}</em>
            </h1>
            <p>{t.availabilityIntro}</p>
          </header>
          <div className="availability-content">
            <AvailabilityCalendar language={language} labels={t} />
            <div className="availability-source-note">
              <span>{t.availabilityNote}</span>
              <a href="mailto:kucajozic1@gmail.com?subject=Availability%20inquiry">
                {t.availabilityContact}
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>
      ) : currentPage === "contact" ? (
        <section className="contact-page">
          <header className="contact-intro">
            <span className="eyebrow gallery-eyebrow">
              <span className="eyebrow-line" />
              {t.contactEyebrow}
            </span>
            <h1>
              {t.contactTitle.split("\n")[0]}
              <br />
              <em>{t.contactTitle.split("\n")[1]}</em>
            </h1>
            <p>{t.contactIntro}</p>
          </header>
          <div className="contact-content">
            <div className="contact-cards">
              <a className="contact-card" href="mailto:kucajozic1@gmail.com">
                <span className="contact-card-icon"><Mail size={20} /></span>
                <span className="contact-card-label">{t.contactEmail}</span>
                <strong>kucajozic1@gmail.com</strong>
                <ArrowUpRight className="contact-card-arrow" size={18} />
              </a>
              <a className="contact-card" href="tel:+38598412618">
                <span className="contact-card-icon"><Phone size={20} /></span>
                <span className="contact-card-label">{t.contactPhone}</span>
                <strong>098 412 618</strong>
                <ArrowUpRight className="contact-card-arrow" size={18} />
              </a>
              <a
                className="contact-card"
                href="https://wa.me/38598412618"
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-card-icon"><MessageCircle size={20} /></span>
                <span className="contact-card-label">{t.contactWhatsapp}</span>
                <strong>098 412 618</strong>
                <ArrowUpRight className="contact-card-arrow" size={18} />
              </a>
            </div>
            <div className="contact-social">
              <span className="contact-card-label">{t.contactSocial}</span>
              <div className="contact-social-links">
                <a
                  href="https://www.facebook.com/profile.php?id=100092562744029"
                  target="_blank"
                  rel="noreferrer"
                >
                  <UsersRound size={18} />
                  Facebook
                  <ArrowUpRight size={15} />
                </a>
                <a
                  href="https://www.instagram.com/kuca_za_odmor_jozic/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Camera size={18} />
                  Instagram
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
            <p className="contact-note">{t.contactNote}</p>
          </div>
        </section>
      ) : currentPage === "neighborhood" ? (
        <>
          <NeighborhoodPage
            t={t}
            language={language}
            category={category}
            onCategoryChange={setCategory}
            filteredPlaces={filteredPlaces}
            onSelectPlace={setSelected}
          />
          <section className="quote-section reveal">
            <div className="quote-decoration">“</div>
            <p>
              {t.quoteFirst}
              <br />
              <em>{t.quoteSecond}</em>
            </p>
            <span className="quote-caption">{t.quoteCaption}</span>
          </section>
        </>
      ) : <>
      <section className="hero" id="home">
        <div className="hero-image" />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="eyebrow hero-eyebrow">
            <span className="eyebrow-line" />
            {t.eyebrow}
          </div>
          <h1>
            {t.headline.split("\n")[0]}
            <br />
            <em>{t.headline.split("\n")[1]}</em>
          </h1>
          <p className="hero-intro">{t.intro}</p>
          <a
            className="hero-button"
            href="#neighborhood"
            onClick={(event) => {
              event.preventDefault();
              navigateToNeighborhood();
            }}
          >
            {t.explore}
            <ArrowDownRight size={18} strokeWidth={1.5} />
          </a>
        </div>

        <div className="hero-bottom">
          <span>46°14'36.0"N&nbsp; 16°29'39.8"E</span>
          <span className="hero-scroll">
            {t.scroll} <span className="scroll-line" />
          </span>
          <span>{t.county}</span>
        </div>
        <div className="hero-index">01 <span>/ 03</span></div>
      </section>

      <section className="intro-section reveal">
        <div className="intro-overline">
          <span className="gold-dot" />
          {t.label}
        </div>
        <div className="intro-layout">
          <h2>
            {t.title.split("\n")[0]}
            <br />
            <em>{t.title.split("\n")[1]}</em>
          </h2>
          <div className="intro-copy">
            <p>{t.subtitle}</p>
            <div className="intro-signature">
              <span className="signature-line" />
              <span>{t.family}</span>
            </div>
          </div>
        </div>
        <div className="intro-rule">
          <span>01</span>
          <span>{t.count}</span>
          <span>{t.curatedWithCare}</span>
        </div>
      </section>

      <section className="home-highlights reveal">
        <div className="home-highlights-heading">
          <div>
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-line" />
              {t.homeFeatureEyebrow}
            </span>
            <h2>{t.homeFeatureTitle}</h2>
          </div>
          <p>{t.homeFeatureText}</p>
        </div>
        <div className="home-highlight-grid">
          {[gallery[1], gallery[5], gallery[2]].map((section, index) => {
            const image = section.images[0];
            if (!image) return null;
            return (
              <a
                className="home-highlight-card reveal"
                href="#gallery"
                key={section.folder}
                onClick={(event) => {
                  event.preventDefault();
                  navigateTo("gallery");
                }}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <img src={image.src} alt={section.title[language]} loading="lazy" />
                <span className="home-highlight-overlay">
                  <span>0{index + 1} / {section.images.length.toString().padStart(2, "0")}</span>
                  <strong>{section.title[language]}</strong>
                  <ArrowUpRight size={18} />
                </span>
              </a>
            );
          })}
        </div>
        <div className="home-highlight-actions">
          <button className="home-text-link" onClick={() => navigateTo("gallery")}>
            {t.homeGalleryLink} <ArrowUpRight size={16} />
          </button>
          <button className="home-text-link" onClick={navigateToNeighborhood}>
            {t.homeNeighborhoodLink} <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      <section className="home-map-section reveal">
        <div className="home-map-heading">
          <div>
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-line" />
              {t.homeMapEyebrow}
            </span>
            <h2>{t.homeMapTitle}</h2>
          </div>
          <a
            className="home-map-link"
            href="https://www.google.com/maps/search/?api=1&query=Novakov%C5%A1%C4%8Dak+98"
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={16} />
            {t.homeMapLink}
            <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="home-map-frame">
          <MapContainer
            center={[46.2433, 16.4944]}
            zoom={11}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[46.2433, 16.4944]}
              icon={divIcon({
                className: "home-map-marker",
                html: '<span class="home-map-pin"></span>',
                iconSize: [24, 34],
                iconAnchor: [12, 34],
              })}
            >
              <Popup>{t.homeMapAddress}</Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="home-map-caption">
          <MapPin size={16} />
          <strong>{t.homeMapAddress}</strong>
          <span>{t.county}</span>
        </div>
      </section>

      <section className="amenities-section">
        <div className="amenities-heading reveal">
          <div>
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-line" />
              {t.amenitiesEyebrow}
            </span>
            <h2>{t.amenitiesTitle}</h2>
          </div>
          <p>{t.amenitiesIntro}</p>
          <div className="guest-capacity">
            <strong>4 + 2</strong>
            <span>6 {t.guestCapacity}</span>
          </div>
        </div>
        <div className="amenities-grid">
          {amenityGroups.map((group, index) => (
            <article
              className="amenity-card reveal"
              key={group.title.en}
              style={{ transitionDelay: `${(index % 4) * 70}ms` }}
            >
              <span className="amenity-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{group.title[language]}</h3>
              <ul>
                {group.items[language].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="nearby-section">
        <header className="nearby-heading reveal">
          <div>
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-line" />
              {t.label}
            </span>
            <h2>{t.nearbyTitle}</h2>
          </div>
          <p>{t.nearbyIntro}</p>
        </header>
        <div className="nearby-grid">
          {nearbyGroups.map((group, index) => (
            <article className="nearby-card reveal" key={group.title.en}>
              <span className="amenity-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{group.title[language]}</h3>
              <ul>
                {group.places.map((place) => (
                  <li key={place.name.en}>
                    <span>{place.name[language]}</span>
                    <strong>{place.distance}</strong>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="quote-section reveal">
        <div className="quote-decoration">“</div>
        <p>
          {t.quoteFirst}
          <br />
          <em>{t.quoteSecond}</em>
        </p>
        <span className="quote-caption">{t.quoteCaption}</span>
      </section>
      </>}

      <footer className="footer">
        <a className="brand footer-brand" href="#home" aria-label="Stay Guide home" onClick={(event) => {
          event.preventDefault();
          navigateTo("home");
        }}>
          <img className="brand-logo" src={logo} alt="Kuća za odmor Jožić" />
        </a>
        <span className="footer-note">{t.footer}</span>
        <a
          className="back-top"
          href={currentPage === "home" ? "#home" : `#${currentPage}`}
          onClick={(event) => {
            event.preventDefault();
            if (currentPage !== "home") {
              if (window.location.hash !== `#${currentPage}`) {
                window.history.replaceState(null, "", `#${currentPage}`);
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              navigateTo("home");
            }
          }}
        >
          {t.backToTop} <ArrowUpRight size={15} />
        </a>
      </footer>

      {selectedGalleryImage && (
        <div className="gallery-lightbox" onClick={() => setSelectedGalleryImage(null)}>
          <button
            className="gallery-lightbox-close"
            aria-label={t.close}
            onClick={() => setSelectedGalleryImage(null)}
          >
            <X size={22} />
          </button>
          <button
            className="gallery-lightbox-arrow gallery-lightbox-prev"
            aria-label={t.previousPhoto}
            onClick={(event) => {
              event.stopPropagation();
              moveGalleryImage(-1);
            }}
          >
            <ChevronLeft size={25} />
          </button>
          <img
            src={gallery[selectedGalleryImage.categoryIndex].images[selectedGalleryImage.imageIndex].src}
            alt={gallery[selectedGalleryImage.categoryIndex].images[selectedGalleryImage.imageIndex].alt}
            onClick={(event) => event.stopPropagation()}
          />
          <button
            className="gallery-lightbox-arrow gallery-lightbox-next"
            aria-label={t.nextPhoto}
            onClick={(event) => {
              event.stopPropagation();
              moveGalleryImage(1);
            }}
          >
            <ChevronRight size={25} />
          </button>
          <p>
            {gallery[selectedGalleryImage.categoryIndex].title[language]}
            <span>
              {selectedGalleryImage.imageIndex + 1} / {gallery[selectedGalleryImage.categoryIndex].images.length}
            </span>
          </p>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section
            className="place-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-image-wrap">
              <img src={selected.image} alt={selected.name} className="modal-image" />
              <button className="modal-close" onClick={() => setSelected(null)} aria-label={t.close}>
                <X size={21} />
              </button>
              <span className="modal-image-label">{t.modalImageLabel} · 0{selected.id}</span>
            </div>
            <div className="modal-content">
              <div className="eyebrow dark-eyebrow">
                <span className="eyebrow-line" />
                {selected.category === "restaurant" ? t.dining : t.shopping}
              </div>
              <h2>{selected.name}</h2>
              <p className="modal-description">{selected.description[language]}</p>
              <div className="modal-info">
                <div>
                  <span className="info-label">{t.distance}</span>
                  <strong><MapPin size={15} /> {selected.distance}</strong>
                </div>
                <div>
                  <span className="info-label">{t.address}</span>
                  <strong>{selected.address}</strong>
                </div>
                {selected.phone && (
                  <div>
                    <span className="info-label">{t.contactPhone}</span>
                    <strong><Phone size={15} /> {selected.phone}</strong>
                  </div>
                )}
              </div>
              <div className="local-tip">
                <span className="tip-icon"><Clock3 size={17} /></span>
                <div>
                  <span className="info-label">{t.tip}</span>
                  <p>{selected.tip[language]}</p>
                </div>
              </div>
              <a
                className="modal-directions"
                href={selected.maps}
                target="_blank"
                rel="noreferrer"
              >
                {t.directions} <ArrowUpRight size={17} />
              </a>
              {selected.phone && (
                <a className="modal-call" href={`tel:${selected.phone.replace(/\s/g, "")}`}>
                  {t.call} <Phone size={15} />
                </a>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
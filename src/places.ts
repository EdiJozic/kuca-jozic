
export type Language = "en" | "de";
export type PlaceType = "restaurant" | "shop";

export type Place = {
  id: string;
  name: string;
  type: PlaceType;
  lat: number;
  lng: number;
  image: string;
  google: string;
  phone: string;
  desc: Record<Language, string>;
  distance: Record<Language, string>;
  tip: Record<Language, string>;
  hours: { day: number; open: string; close: string }[];
};

const maps = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const home = {
  lat: 46.2433,
  lng: 16.4944,
};

export const places: Place[] = [
  {
    id: "zlatne",
    name: "Restaurant Zlatne Gorice",
    type: "restaurant",
    lat: 46.2369,
    lng: 16.4023,
    image: "https://www.zlatne-gorice.eu/assets/images/home-hero.jpg",
    google: maps("Zlatne Gorice"),
    phone: "",
    desc: { en: "Local cuisine & grill", de: "Lokale Küche & Grill" },
    distance: { en: "8 km from your stay", de: "8 km von Ihrer Unterkunft" },
    tip: {
      en: "Enjoy local dishes and the countryside setting.",
      de: "Genießen Sie regionale Gerichte und die ländliche Umgebung.",
    },
    hours: [
      { day: 0, open: "", close: "" },
      ...[1, 2, 3, 4].map(day => ({ day, open: "11:00", close: "22:00" })),
      { day: 5, open: "11:00", close: "23:00" },
      { day: 6, open: "11:00", close: "23:00" },
    ],
  },
  {
    id: "bernarda",
    name: "Restaurant Bernarda",
    type: "restaurant",
    lat: 46.2082,
    lng: 16.4229,
    image: "https://www.pizzeria-bernarda.eu/img/gal4.jpg",
    google: maps("Restaurant Bernarda"),
    phone: "",
    desc: { en: "Traditional home cooking", de: "Traditionelle Hausmannskost" },
    distance: { en: "11 km from your stay", de: "11 km von Ihrer Unterkunft" },
    tip: {
      en: "Consider booking ahead on weekends.",
      de: "Am Wochenende empfiehlt sich eine Reservierung.",
    },
    hours: [
      { day: 0, open: "12:00", close: "21:00" },
      { day: 1, open: "", close: "" },
      ...[2, 3, 4].map(day => ({ day, open: "11:00", close: "22:00" })),
      { day: 5, open: "11:00", close: "23:00" },
      { day: 6, open: "11:00", close: "23:00" },
    ],
  },
  {
    id: "span",
    name: "Pizzeria Špan",
    type: "restaurant",
    lat: 46.248049,
    lng: 16.385875,
    image: "https://contimonti.com/images/djcl/0/969_span3_thm.jpg",
    google: maps("Pizzeria Špan"),
    phone: "",
    desc: { en: "Pizza & pasta", de: "Pizza & Pasta" },
    distance: { en: "6 km from your stay", de: "6 km von Ihrer Unterkunft" },
    tip: {
      en: "A convenient choice for pizza and pasta.",
      de: "Eine gute Wahl für Pizza und Pasta.",
    },
    hours: [
      { day: 0, open: "12:00", close: "22:00" },
      ...[1, 2, 3, 4].map(day => ({ day, open: "11:00", close: "22:00" })),
      { day: 5, open: "11:00", close: "23:00" },
      { day: 6, open: "11:00", close: "23:00" },
    ],
  },
  {
    id: "ktc",
    name: "KTC Jalžabet",
    type: "shop",
    lat: 46.2603,
    lng: 16.4784,
    image: "https://direktorij.hr/wp-content/uploads/2022/01/jalzabez.jpg",
    google: maps("KTC Jalžabet"),
    phone: "",
    desc: { en: "Supermarket & bakery", de: "Supermarkt & Bäckerei" },
    distance: { en: "3 km from your stay", de: "3 km von Ihrer Unterkunft" },
    tip: {
      en: "Useful for groceries and everyday essentials.",
      de: "Praktisch für Lebensmittel und Dinge des täglichen Bedarfs.",
    },
    hours: [
      { day: 0, open: "08:00", close: "14:00" },
      ...[1, 2, 3, 4, 5].map(day => ({ day, open: "07:00", close: "21:00" })),
      { day: 6, open: "07:00", close: "20:00" },
    ],
  },
  {
    id: "kfc",
    name: "KFC Varaždin",
    type: "restaurant",
    lat: 46.2644165,
    lng: 16.3775097,
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=700",
    google: maps("KFC Varaždin"),
    phone: "",
    desc: { en: "Fast food restaurant", de: "Schnellimbiss" },
    distance: { en: "13 km from your stay", de: "13 km von Ihrer Unterkunft" },
    tip: {
      en: "A quick meal when you are on the go.",
      de: "Eine schnelle Mahlzeit für unterwegs.",
    },
    hours: Array.from({ length: 7 }, (_, day) => ({
      day, open: "09:00", close: "00:00",
    })),
  },
  {
    id: "lumini",
    name: "Lumini Shopping Centre",
    type: "shop",
    lat: 46.264961,
    lng: 16.375125,
    image: "https://travelcroatia.live/wp-content/uploads/2021/11/DSC_0118.jpg",
    google: maps("Lumini Shopping Centre"),
    phone: "",
    desc: { en: "Shopping & entertainment", de: "Einkaufen & Unterhaltung" },
    distance: { en: "14 km from your stay", de: "14 km von Ihrer Unterkunft" },
    tip: {
      en: "A good option for shopping and a rainy day.",
      de: "Eine gute Wahl zum Einkaufen und für Regentage.",
    },
    hours: Array.from({ length: 7 }, (_, day) => ({
      day, open: "09:00", close: "21:00",
    })),
  },
  {
    id: "kaufland",
    name: "Kaufland Varaždin",
    type: "shop",
    lat: 46.3146,
    lng: 16.3476,
    image: "https://www.across-magazine.com/wp-content/uploads/2023/11/cover_600x400-12.jpg",
    google: maps("Kaufland Varaždin"),
    phone: "",
    desc: { en: "Large supermarket", de: "Großer Supermarkt" },
    distance: { en: "8 km from your stay", de: "8 km von Ihrer Unterkunft" },
    tip: {
      en: "Useful for a larger grocery shop.",
      de: "Praktisch für einen größeren Einkauf.",
    },
    hours: [
      { day: 0, open: "08:00", close: "15:00" },
      ...Array.from({ length: 6 }, (_, i) => ({
        day: i + 1, open: "07:00", close: "21:00",
      })),
    ],
  },
  {
    id: "plodine",
    name: "Plodine Ludbreg",
    type: "shop",
    lat: 46.2429519,
    lng: 16.629416,
    image: "https://www.plodine.hr/uploads/img_2127.jpg",
    google: maps("Plodine Ludbreg"),
    phone: "",
    desc: { en: "Supermarket", de: "Supermarkt" },
    distance: { en: "15 km from your stay", de: "15 km von Ihrer Unterkunft" },
    tip: {
      en: "Convenient if you are visiting Ludbreg.",
      de: "Praktisch bei einem Besuch in Ludbreg.",
    },
    hours: Array.from({ length: 7 }, (_, day) => ({
      day,
      open: day === 0 ? "07:00" : "07:00",
      close: day === 0 ? "14:00" : "21:00",
    })),
  },
  {
    id: "stopshop",
    name: "STOP SHOP Ludbreg",
    type: "shop",
    lat: 46.2479627,
    lng: 16.6269047,
    image: "https://cdn.cpi-europe.com/uploads/production/602b986b5851a4f31d39b6b0/kova8328.jpg",
    google: maps("STOP SHOP Ludbreg"),
    phone: "",
    desc: { en: "Retail park with several shops", de: "Einkaufspark mit mehreren Geschäften" },
    distance: { en: "15 km from your stay", de: "15 km von Ihrer Unterkunft" },
    tip: {
      en: "Several stores in one convenient location.",
      de: "Mehrere Geschäfte an einem praktischen Standort.",
    },
    hours: [
      { day: 0, open: "", close: "" },
      ...Array.from({ length: 6 }, (_, i) => ({
        day: i + 1, open: "09:00", close: "20:00",
      })),
    ],
  },
];
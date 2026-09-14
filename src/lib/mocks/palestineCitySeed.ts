/**
 * Palestinian governorates’ cities (PCBS / MoLG list, Wikipedia “List of cities in Palestine”)
 * plus Salfit. Coordinates: rounded from GeoNames / Wikipedia infoboxes.
 */
export type PalestineCitySeed = {
  name: string
  nameAr: string
  lat: number
  lng: number
  elevationM: number
}

export const PALESTINE_CITY_SEEDS: PalestineCitySeed[] = [
  { name: "Abasan al-Kabira", nameAr: "عبسان الكبيرة", lat: 31.342, lng: 34.342, elevationM: 40 },
  { name: "Abu Dis", nameAr: "أبو ديس", lat: 31.7581, lng: 35.2697, elevationM: 575 },
  { name: "Bani Na'im", nameAr: "بني نعيم", lat: 31.5444, lng: 35.1644, elevationM: 937 },
  { name: "Bani Suheila", nameAr: "بني سهيلا", lat: 31.347, lng: 34.321, elevationM: 40 },
  { name: "Beit Hanoun", nameAr: "بيت حانون", lat: 31.5356, lng: 34.5367, elevationM: 55 },
  { name: "Beit Jala", nameAr: "بيت جالا", lat: 31.7147, lng: 35.1875, elevationM: 751 },
  { name: "Beit Lahia", nameAr: "بيت لاهيا", lat: 31.546, lng: 34.505, elevationM: 8 },
  { name: "Beit Sahour", nameAr: "بيت ساحور", lat: 31.7035, lng: 35.2272, elevationM: 589 },
  { name: "Beit Ummar", nameAr: "بيت أُمّر", lat: 31.6153, lng: 35.1008, elevationM: 669 },
  { name: "Beitunia", nameAr: "بيتونيا", lat: 31.8966, lng: 35.1687, elevationM: 861 },
  { name: "al-Bireh", nameAr: "البيرة", lat: 31.9056, lng: 35.2164, elevationM: 890 },
  { name: "Deir al-Balah", nameAr: "دير البلح", lat: 31.4172, lng: 34.3428, elevationM: 35 },
  { name: "ad-Dhahiriya", nameAr: "الظاهرية", lat: 31.4097, lng: 34.9728, elevationM: 607 },
  { name: "Dura", nameAr: "دورا", lat: 31.5075, lng: 35.0328, elevationM: 708 },
  { name: "Halhul", nameAr: "حلحول", lat: 31.5803, lng: 35.0989, elevationM: 916 },
  { name: "Idhna", nameAr: "إذنا", lat: 31.5392, lng: 34.9667, elevationM: 406 },
  { name: "Jabalia", nameAr: "جباليا", lat: 31.5278, lng: 34.4844, elevationM: 35 },
  { name: "Jenin", nameAr: "جنين", lat: 32.4611, lng: 35.3006, elevationM: 248 },
  { name: "Khan Yunis", nameAr: "خان يونس", lat: 31.3461, lng: 34.3028, elevationM: 45 },
  { name: "Qabatiya", nameAr: "قباطية", lat: 32.4108, lng: 35.2808, elevationM: 387 },
  { name: "Qalqilya", nameAr: "قلقيلية", lat: 32.1897, lng: 34.9706, elevationM: 57 },
  { name: "Rafah", nameAr: "رفح", lat: 31.2889, lng: 34.2517, elevationM: 60 },
  { name: "Salfit", nameAr: "سلفيت", lat: 32.1713, lng: 35.1819, elevationM: 570 },
  { name: "Sa'ir", nameAr: "سعير", lat: 31.5836, lng: 35.1764, elevationM: 861 },
  { name: "as-Samu", nameAr: "السموع", lat: 31.3972, lng: 35.0672, elevationM: 482 },
  { name: "Surif", nameAr: "صوريف", lat: 31.6508, lng: 35.0664, elevationM: 671 },
  { name: "Tubas", nameAr: "طوباس", lat: 32.3211, lng: 35.3699, elevationM: 322 },
  { name: "Tulkarm", nameAr: "طولكرم", lat: 32.3108, lng: 35.0286, elevationM: 144 },
  { name: "Ya'bad", nameAr: "يعبد", lat: 32.4503, lng: 35.1717, elevationM: 344 },
  { name: "al-Yamun", nameAr: "اليامون", lat: 32.4881, lng: 35.2003, elevationM: 307 },
  { name: "Yatta", nameAr: "يطا", lat: 31.4503, lng: 35.0939, elevationM: 694 },
  { name: "az-Zawayda", nameAr: "الزوايدة", lat: 31.467, lng: 34.367, elevationM: 38 },
]

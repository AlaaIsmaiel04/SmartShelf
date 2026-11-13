import type {
  ListResponse,
  PublicPharmacy,
  MedicineSearchFilters,
} from '@smartshelf/contracts';
import { SERVICE_AREA } from '../directory/duty-schedule';

// Fictional pharmacies and availability: never derived from the published duty notice.
const pharmacies = [
  {
    name: 'صيدلية الندى التجريبية',
    address: 'عنوان تجريبي — شارع حماة، سلمية',
    onDuty: true,
  },
  {
    name: 'صيدلية الزيتون التجريبية',
    address: 'عنوان تجريبي — شارع حمص، سلمية',
    onDuty: false,
  },
  {
    name: 'صيدلية الياسمين التجريبية',
    address: 'عنوان تجريبي — قرب الساحة العامة، سلمية',
    onDuty: true,
  },
  {
    name: 'صيدلية الشفاء التجريبية',
    address: 'عنوان تجريبي — حي المساكن، سلمية',
    onDuty: false,
  },
  {
    name: 'صيدلية الحياة التجريبية',
    address: 'عنوان تجريبي — شارع الثورة، سلمية',
    onDuty: false,
  },
];
export const demoMedicines = [
  {
    name: 'Panadol',
    arabic: 'بانادول',
    aliases: ['paracetamol', 'acetaminophen', 'باراسيتامول', 'بنادول'],
    stock: [0, 1, 2, 4],
  },
  {
    name: 'Brufen',
    arabic: 'بروفين',
    aliases: ['ibuprofen', 'ايبوبروفين', 'إيبوبروفين'],
    stock: [1, 2, 3],
  },
  {
    name: 'Augmentin',
    arabic: 'أوغمنتين',
    aliases: [
      'amoxicillin',
      'clavulanic acid',
      'اموكسيسيلين',
      'أموكسيسيلين',
      'اوجمنتين',
    ],
    stock: [0, 3],
  },
  {
    name: 'Glucophage',
    arabic: 'غلوكوفاج',
    aliases: ['metformin', 'ميتفورمين', 'جلوكوفاج'],
    stock: [1, 2, 4],
  },
  {
    name: 'Norvasc',
    arabic: 'نورفاسك',
    aliases: ['amlodipine', 'أملوديبين', 'املوديبين'],
    stock: [0, 4],
  },
  {
    name: 'Zyrtec',
    arabic: 'زيرتك',
    aliases: ['cetirizine', 'سيتريزين'],
    stock: [0, 2, 3],
  },
  {
    name: 'Ventolin',
    arabic: 'فنتولين',
    aliases: ['salbutamol', 'سالبوتامول'],
    stock: [1, 4],
  },
  {
    name: 'Gaviscon',
    arabic: 'جافيسكون',
    aliases: ['sodium alginate', 'ألجينات الصوديوم', 'الجينات الصوديوم'],
    stock: [0, 1, 3],
  },
  {
    name: 'Vitamin D',
    arabic: 'فيتامين د',
    aliases: ['cholecalciferol', 'vitamin d3', 'فيتامين د3'],
    stock: [0, 1, 2, 3, 4],
  },
  {
    name: 'Omeprazole',
    arabic: 'أوميبرازول',
    aliases: ['omeprazole', 'اوميبرازول'],
    stock: [2, 3, 4],
  },
];
const normalize = (value: string) =>
  value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .trim();

export function searchDemoMedicines(
  filters: MedicineSearchFilters,
  now = new Date(),
): ListResponse<PublicPharmacy> {
  const query = normalize(filters.q);
  if (!query || (filters.area && filters.area !== SERVICE_AREA))
    return { items: [], total: 0 };
  const matches = demoMedicines.filter((medicine) =>
    [medicine.name, medicine.arabic, ...medicine.aliases].some((name) =>
      normalize(name).includes(query),
    ),
  );
  const stocked = new Set(matches.flatMap((medicine) => medicine.stock));
  const instant = (hours: number) =>
    new Date(now.getTime() + hours * 3600000).toISOString();
  const items: PublicPharmacy[] = pharmacies.flatMap((pharmacy, index) => {
    if (!stocked.has(index) || (filters.onDutyNow && !pharmacy.onDuty))
      return [];
    return [
      {
        name: pharmacy.name,
        address: pharmacy.address,
        area: SERVICE_AREA,
        phone: '',
        onDutyNow: pharmacy.onDuty,
        currentDuty: pharmacy.onDuty
          ? { startsAt: instant(-2), endsAt: instant(4) }
          : null,
        nextDuty: pharmacy.onDuty
          ? null
          : { startsAt: instant(8), endsAt: instant(14) },
        inventoryUpdatedAt: instant(-index - 1),
      },
    ];
  });
  return { items, total: items.length };
}

import type { Category } from '../types/catalog';

export const categories: Category[] = [
  {
    slug: 'general-surgery',
    name: 'General Surgery',
    shortDescription: 'Dissecting scissors, hemostatic clamps, needle holders, tissue forceps, and retractors.',
    image: '/src/assets/images/cat_general_surgery_1795254590012.jpg',
    imageAlt: 'Surgical Mayo dissecting scissors and Rochester-Pean hemostatic forceps in brushed satin stainless steel',
    featuredOrder: 1,
    isDemo: true,
  },
  {
    slug: 'dental-instruments',
    name: 'Dental Instruments',
    shortDescription: 'Extracting forceps, periodontal curettes, elevators, and diagnostic mirrors.',
    image: '/src/assets/images/cat_dental_instruments_1795254588695.jpg',
    imageAlt: 'Stainless-steel dental extracting forceps, hollow-handle periodontal curette, and dental examination mirror',
    featuredOrder: 2,
    isDemo: true,
  },
  {
    slug: 'orthopedic-instruments',
    name: 'Orthopedic Instruments',
    shortDescription: 'Bone rongeurs, periosteal elevators, and bone-holding instruments.',
    image: '/src/assets/images/cat_orthopedic_instruments_1795254583662.jpg',
    imageAlt: 'Stainless-steel orthopedic bone rongeur forceps and periosteal bone elevator in satin finish',
    featuredOrder: 3,
    isDemo: true,
  },
  {
    slug: 'ent-instruments',
    name: 'ENT Instruments',
    shortDescription: 'Micro-alligator ear forceps, nasal specula, and bayonet dressing forceps.',
    image: '/src/assets/images/cat_ent_instruments_1795254585109.jpg',
    imageAlt: 'ENT stainless-steel Hartmann alligator micro-forceps, Vienna nasal speculum, and bayonet dressing forceps',
    featuredOrder: 4,
    isDemo: true,
  },
  {
    slug: 'diagnostic-instruments',
    name: 'Diagnostic Instruments',
    shortDescription: 'Percussion reflex hammers, precision tuning forks, and examination probes.',
    image: '/src/assets/images/cat_diagnostic_instruments_1795254584566.jpg',
    imageAlt: 'Stainless-steel reflex percussion hammer, precision medical tuning fork, and diagnostic examination probe',
    featuredOrder: 5,
    isDemo: true,
  },
  {
    slug: 'instrument-sets',
    name: 'Instrument Sets',
    shortDescription: 'Curated surgical procedure trays and perforated sterilization containers.',
    image: '/src/assets/images/cat_instrument_sets_1795254592195.jpg',
    imageAlt: 'Open perforated surgical stainless-steel sterilization tray holding neatly arranged clamps, scissors, and forceps',
    featuredOrder: 6,
    isDemo: true,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

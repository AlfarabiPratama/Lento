// Habit Templates - Pre-defined habits for quick creation

export const HABIT_TEMPLATES = [
  {
    id: 'exercise',
    name: 'Olahraga Pagi',
    description: 'Latihan fisik atau cardio minimal 30 menit',
    category: 'olahraga',
    icon: 'IconRun',
    frequency: 'daily',
    tags: ['kesehatan', 'pagi']
  },
  {
    id: 'reading',
    name: 'Membaca Buku',
    description: 'Baca buku minimal 20 halaman setiap hari',
    category: 'belajar',
    icon: 'IconBook',
    frequency: 'daily',
    tags: ['belajar', 'pengembangan-diri']
  },
  {
    id: 'meditation',
    name: 'Meditasi',
    description: 'Meditasi atau mindfulness 10-15 menit',
    category: 'mindfulness',
    icon: 'IconYoga',
    frequency: 'daily',
    tags: ['mindfulness', 'kesehatan-mental']
  },
  {
    id: 'water',
    name: 'Minum Air 8 Gelas',
    description: 'Minum air putih minimal 2 liter per hari',
    category: 'kesehatan',
    icon: 'IconGlass',
    frequency: 'daily',
    tags: ['kesehatan', 'hidrasi']
  },
  {
    id: 'sleep',
    name: 'Tidur Cukup',
    description: 'Tidur 7-8 jam setiap malam',
    category: 'kesehatan',
    icon: 'IconMoon',
    frequency: 'daily',
    tags: ['kesehatan', 'tidur']
  },
  {
    id: 'journal',
    name: 'Journaling',
    description: 'Tulis jurnal refleksi harian',
    category: 'mindfulness',
    icon: 'IconNotes',
    frequency: 'daily',
    tags: ['journaling', 'refleksi']
  },
  {
    id: 'learning',
    name: 'Belajar Skill Baru',
    description: 'Dedikasikan 30 menit untuk belajar skill atau bahasa baru',
    category: 'belajar',
    icon: 'IconBulb',
    frequency: 'daily',
    tags: ['belajar', 'skill']
  },
  {
    id: 'gratitude',
    name: 'Gratitude Practice',
    description: 'Catat 3 hal yang disyukuri hari ini',
    category: 'mindfulness',
    icon: 'IconHeart',
    frequency: 'daily',
    tags: ['gratitude', 'positif']
  },
  {
    id: 'stretching',
    name: 'Peregangan',
    description: 'Lakukan peregangan atau yoga ringan 10 menit',
    category: 'olahraga',
    icon: 'IconYoga',
    frequency: 'daily',
    tags: ['fleksibilitas', 'kesehatan']
  },
  {
    id: 'healthy-meal',
    name: 'Makan Sehat',
    description: 'Konsumsi makanan bergizi seimbang',
    category: 'kesehatan',
    icon: 'IconApple',
    frequency: 'daily',
    tags: ['nutrisi', 'kesehatan']
  },
  {
    id: 'call-family',
    name: 'Hubungi Keluarga',
    description: 'Telepon atau video call dengan keluarga',
    category: 'sosial',
    icon: 'IconPhone',
    frequency: 'weekly',
    tags: ['keluarga', 'koneksi']
  },
  {
    id: 'budget-review',
    name: 'Review Budget',
    description: 'Cek dan catat pengeluaran harian',
    category: 'keuangan',
    icon: 'IconChartLine',
    frequency: 'daily',
    tags: ['keuangan', 'budgeting']
  },
  {
    id: 'creative-time',
    name: 'Waktu Kreatif',
    description: 'Luangkan waktu untuk aktivitas kreatif (menulis, menggambar, dll)',
    category: 'kreatif',
    icon: 'IconPalette',
    frequency: 'weekly',
    tags: ['kreativitas', 'hobi']
  },
  {
    id: 'no-social-media',
    name: 'Digital Detox',
    description: 'Kurangi waktu screen time dan social media',
    category: 'mindfulness',
    icon: 'IconBan',
    frequency: 'daily',
    tags: ['digital-detox', 'fokus']
  },
  {
    id: 'morning-routine',
    name: 'Rutinitas Pagi',
    description: 'Bangun dan mulai hari dengan rutinitas positif',
    category: 'produktivitas',
    icon: 'IconSun',
    frequency: 'daily',
    tags: ['pagi', 'rutinitas']
  },
  {
    id: 'walk',
    name: 'Jalan Kaki',
    description: 'Jalan kaki santai 20-30 menit',
    category: 'olahraga',
    icon: 'IconRun',
    frequency: 'daily',
    tags: ['olahraga', 'outdoor']
  }
];

export function getTemplateById(templateId) {
  return HABIT_TEMPLATES.find(t => t.id === templateId);
}

export function getTemplatesByCategory(categoryId) {
  if (!categoryId) return HABIT_TEMPLATES;
  return HABIT_TEMPLATES.filter(t => t.category === categoryId);
}

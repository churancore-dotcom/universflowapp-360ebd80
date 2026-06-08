import a1 from '@/assets/avatars/avatar-1.jpg';
import a2 from '@/assets/avatars/avatar-2.jpg';
import a3 from '@/assets/avatars/avatar-3.jpg';
import a4 from '@/assets/avatars/avatar-4.jpg';
import a5 from '@/assets/avatars/avatar-5.jpg';
import a6 from '@/assets/avatars/avatar-6.jpg';
import a7 from '@/assets/avatars/avatar-7.jpg';
import a8 from '@/assets/avatars/avatar-8.jpg';
import a9 from '@/assets/avatars/avatar-9.jpg';
import a10 from '@/assets/avatars/avatar-10.jpg';

export interface PresetAvatar {
  id: string;
  url: string;
  name: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  { id: 'hoodie-guy', url: a1, name: 'Hoodie' },
  { id: 'sweater-girl', url: a2, name: 'Wavy' },
  { id: 'glasses-beard', url: a3, name: 'Specs' },
  { id: 'leather-bob', url: a4, name: 'Rockstar' },
  { id: 'chain-guy', url: a5, name: 'Chain' },
  { id: 'pink-sweater', url: a6, name: 'Sundown' },
  { id: 'white-hoodie', url: a7, name: 'Crisp' },
  { id: 'afro-yellow', url: a8, name: 'Sunny' },
  { id: 'headphones-boy', url: a9, name: 'Beats' },
  { id: 'pink-beanie', url: a10, name: 'Cozy' },
];

export const resolveAvatar = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const preset = PRESET_AVATARS.find(a => a.id === url);
  if (preset) return preset.url;
  return url;
};

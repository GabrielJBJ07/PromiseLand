import { CharacterPreset } from '../types';

export const CHARACTER_PRESETS: CharacterPreset[] = [
  // 성경 인물 프리셋
  {
    id: 'joshua',
    name: '여호수아',
    title: '정복 대장',
    hairColor: '#4A2E1A',
    skinColor: '#F2D3B4',
    outfitColor: '#2B5797',
    hatType: 'helmet',
    accessory: 'sword',
  },
  {
    id: 'moses',
    name: '모세',
    title: '믿음의 인도자',
    hairColor: '#E0E0E0',
    skinColor: '#E2B897',
    outfitColor: '#9C27B0',
    hatType: 'turban',
    accessory: 'staff',
  },
  {
    id: 'david',
    name: '다윗',
    title: '찬양의 찬란한 왕',
    hairColor: '#D97706',
    skinColor: '#F5D0A9',
    outfitColor: '#059669',
    hatType: 'crown',
    accessory: 'harp',
  },
  {
    id: 'paul',
    name: '바울',
    title: '복음의 전도자',
    hairColor: '#78350F',
    skinColor: '#F3D5B5',
    outfitColor: '#2563EB',
    hatType: 'tunic',
    accessory: 'scroll',
  },
  {
    id: 'esther',
    name: '에스더',
    title: '결단의 왕후',
    hairColor: '#1E1B18',
    skinColor: '#FCE7F3',
    outfitColor: '#DB2777',
    hatType: 'crown',
    accessory: 'scroll',
  },
  {
    id: 'mary',
    name: '마리아',
    title: '순종의 여종',
    hairColor: '#312E81',
    skinColor: '#FFF1F2',
    outfitColor: '#0284C7',
    hatType: 'ribbon',
    accessory: 'branch',
  },
  {
    id: 'deborah',
    name: '드보라',
    title: '용기의 여선지자',
    hairColor: '#DC2626',
    skinColor: '#FDE047',
    outfitColor: '#7C3AED',
    hatType: 'ribbon',
    accessory: 'shield',
  },
  {
    id: 'ruth',
    name: '룻',
    title: '신실한 순종의 여인',
    hairColor: '#7C2D12',
    skinColor: '#FCE7F3',
    outfitColor: '#0D9488',
    hatType: 'ribbon',
    accessory: 'branch',
  },
];

/**
 * Draws a pixel-art character onto a 2D HTML5 canvas context.
 * Inspired by procedural pixel generator (sprite-gen).
 */
export function drawPixelSprite(
  ctx: CanvasRenderingContext2D,
  preset: CharacterPreset,
  x: number,
  y: number,
  size: number = 32, // target width/height
  direction: 'down' | 'left' | 'right' | 'up' = 'down',
  walkFrame: number = 0,
  hasAura: boolean = false
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const pSize = size / 16; // pixel size grid (16x16 grid)

  // Clear bounding box or center draw
  const startX = Math.round(x);
  const startY = Math.round(y);

  // 1. Holy Aura effect if unlocked
  if (hasAura) {
    ctx.beginPath();
    ctx.arc(startX + size / 2, startY + size / 2 + 2, size * 0.65, 0, Math.PI * 2);
    const auraGrad = ctx.createRadialGradient(
      startX + size / 2,
      startY + size / 2,
      size * 0.2,
      startX + size / 2,
      startY + size / 2,
      size * 0.7
    );
    auraGrad.addColorStop(0, 'rgba(253, 224, 71, 0.6)');
    auraGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
    ctx.fillStyle = auraGrad;
    ctx.fill();
  }

  // Shadow at feet
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(startX + size / 2, startY + size - pSize * 2, pSize * 5, pSize * 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Walking bob vertical offset
  const bobY = (walkFrame % 2 === 1) ? -1 * pSize : 0;

  // Helper pixel drawer function
  const p = (gridX: number, gridY: number, color: string, w = 1, h = 1) => {
    ctx.fillStyle = color;
    ctx.fillRect(
      startX + gridX * pSize,
      startY + (gridY * pSize) + bobY,
      w * pSize,
      h * pSize
    );
  };

  const safePreset = preset || CHARACTER_PRESETS[0];
  const defaultPreset = CHARACTER_PRESETS[0];
  const skinColor = safePreset.skinColor || defaultPreset.skinColor;
  const hairColor = safePreset.hairColor || defaultPreset.hairColor;
  const outfitColor = safePreset.outfitColor || defaultPreset.outfitColor;
  const hatType = safePreset.hatType || defaultPreset.hatType;
  const accessory = safePreset.accessory || defaultPreset.accessory;

  // Body & Clothes (grid: 16x16)
  // Legs/Shoes
  const legOffset = (walkFrame === 1) ? -1 : (walkFrame === 3) ? 1 : 0;
  p(5 + legOffset, 13, '#332211', 2, 3);
  p(9 - legOffset, 13, '#332211', 2, 3);

  // Outfit Main Robe/Tunic
  p(4, 8, outfitColor, 8, 5);
  p(3, 9, outfitColor, 10, 3);
  p(6, 7, outfitColor, 4, 2); // collar

  // Gold Trim / Belt
  p(4, 11, '#EAB308', 8, 1);

  // Hands / Arms
  if (direction === 'down' || direction === 'up') {
    p(2, 9 + (walkFrame % 2), skinColor, 2, 2);
    p(12, 9 - (walkFrame % 2), skinColor, 2, 2);
  } else if (direction === 'right') {
    p(11, 9 + legOffset, skinColor, 2, 2);
  } else {
    p(3, 9 - legOffset, skinColor, 2, 2);
  }

  // Head (Skin base 8x7)
  p(4, 2, skinColor, 8, 6);
  p(5, 1, skinColor, 6, 1);

  // Face details (Eyes & Mouth)
  if (direction === 'down') {
    // Eyes
    p(5, 4, '#1E293B', 2, 2);
    p(9, 4, '#1E293B', 2, 2);
    p(5, 4, '#FFFFFF', 1, 1);
    p(9, 4, '#FFFFFF', 1, 1);
    // Cheeks
    p(4, 5, 'rgba(244, 114, 182, 0.5)', 1, 1);
    p(11, 5, 'rgba(244, 114, 182, 0.5)', 1, 1);
    // Smile
    p(7, 6, '#9A3412', 2, 1);
  } else if (direction === 'left') {
    p(4, 4, '#1E293B', 2, 2);
    p(4, 4, '#FFFFFF', 1, 1);
    p(6, 6, '#9A3412', 1, 1);
  } else if (direction === 'right') {
    p(10, 4, '#1E293B', 2, 2);
    p(11, 4, '#FFFFFF', 1, 1);
    p(9, 6, '#9A3412', 1, 1);
  }

  // Hair Style
  if (hatType !== 'turban' && hatType !== 'helmet' && hatType !== 'pirate_hat') {
    p(3, 1, hairColor, 10, 2); // top hair
    p(3, 2, hairColor, 2, 4);  // left side hair
    p(11, 2, hairColor, 2, 4); // right side hair
    p(5, 0, hairColor, 6, 1);  // crown hair puff
  }

  // Headgear / Hats
  if (hatType === 'crown') {
    p(4, 0, '#FACD15', 8, 2);
    p(4, -1, '#FACD15', 2, 1);
    p(7, -1, '#FACD15', 2, 1);
    p(10, -1, '#FACD15', 2, 1);
    p(7, 0, '#EF4444', 2, 1); // ruby jewel
  } else if (hatType === 'pirate_hat') {
    p(2, -1, '#1E1B18', 12, 3);
    p(1, 1, '#1E1B18', 14, 1);
    p(7, 0, '#FFFFFF', 2, 1); // skull / emblem
    p(2, -1, '#F59E0B', 12, 1); // gold rim
  } else if (hatType === 'helmet') {
    p(3, -1, '#94A3B8', 10, 3);
    p(7, -2, '#EF4444', 2, 2); // red plume
  } else if (hatType === 'turban') {
    p(3, -1, '#F8FAFC', 10, 3);
    p(6, -1, '#3B82F6', 4, 2); // blue jewel center
  } else if (hatType === 'ribbon') {
    p(3, 1, '#EC4899', 10, 1);
    p(2, 0, '#F472B6', 2, 2);
  }

  // Accessory in hand
  if (accessory === 'staff') {
    p(13, 2, '#78350F', 1, 12);
    p(12, 1, '#D97706', 3, 2);
  } else if (accessory === 'sword') {
    p(13, 3, '#CBD5E1', 1, 8);
    p(12, 10, '#B45309', 3, 1); // hilt
    p(13, 2, '#F8FAFC', 1, 1); // tip
  } else if (accessory === 'shield') {
    p(1, 8, '#B45309', 3, 5);
    p(2, 9, '#F59E0B', 1, 3);
  } else if (accessory === 'harp') {
    p(1, 7, '#D97706', 3, 5);
    p(2, 8, '#FFFFFF', 1, 3);
  } else if (accessory === 'scroll') {
    p(13, 8, '#FEF08A', 2, 4);
    p(12, 8, '#B45309', 4, 1);
  } else if (accessory === 'branch') {
    p(13, 6, '#15803D', 2, 4);
    p(12, 5, '#22C55E', 3, 3);
  }

  ctx.restore();
}

import { createCanvas, loadImage, registerFont } from 'canvas';
import { AttachmentBuilder } from 'discord.js';
import { join } from 'path';
import sharp from 'sharp';
import { PackData } from 'types/Packs';
import prices from '@lib/assets/prices.json';

export const getPackSection = async (section: string, index: number) => {
  let bg: string;
  let packs: PackData[];
  const undefinedPack = join(process.cwd(), 'images', 'undefined_pack.png');

  switch (section) {
    case 'promo':
      bg = join(process.cwd(), 'images', 'promo_packs.png');
      const iconPack = join(process.cwd(), 'images', 'icon_pack.png');

      packs = [
        {
          file: undefinedPack,
          name: 'Undefined Pack',
        },
        {
          file: iconPack,
          name: 'Icon Pack',
        },
        {
          file: undefinedPack,
          name: 'Undefined Pack',
        },
      ];
      break;

    case 'gold':
      bg = join(process.cwd(), 'images', 'gold_packs.png');
      const goldPack = join(process.cwd(), 'images', 'gold_pack.png');
      const superGoldPack = join(
        process.cwd(),
        'images',
        'super_gold_pack.png'
      );

      packs = [
        {
          file: undefinedPack,
          name: 'Undefined Pack',
        },
        {
          file: goldPack,
          name: 'Gold Pack',
        },
        {
          file: superGoldPack,
          name: 'Super Gold Pack',
        },
      ];
      break;

    case 'classic':
      bg = join(process.cwd(), 'images', 'classic_packs.png');
      const silverPack = join(process.cwd(), 'images', 'silver_pack.png');
      const superSilverPack = join(
        process.cwd(),
        'images',
        'super_silver_pack.png'
      );

      packs = [
        {
          file: undefinedPack,
          name: 'Undefined Pack',
        },
        {
          file: silverPack,
          name: 'Silver Pack',
        },
        {
          file: superSilverPack,
          name: 'Super Silver Pack',
        },
      ];
      break;
  }

  if (index !== 0) {
    for (let i = 0; i < index; i++) {
      packs.push(packs[0]);
      packs.shift();
    }
  }

  const font = join(process.cwd(), 'fonts', 'RadioCanada.ttf');
  registerFont(font, { family: 'Radio Canada' });

  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 30px Radio Canada';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(packs[1].name.toUpperCase(), 161, 203);
  const buffer = canvas.toBuffer();

  const image = sharp(bg)
    .composite([
      {
        input: await sharp(packs[1].file).resize(215, 337).toBuffer(),
        left: 669,
        top: 176,
      },
      {
        input: await sharp(packs[2].file).resize(180, 282).toBuffer(),
        left: 946,
        top: 206,
      },
      {
        input: await sharp(packs[0].file).resize(180, 282).toBuffer(),
        left: 427,
        top: 206,
      },
      {
        input: buffer,
        left: 615,
        top: 371,
      },
    ])
    .toFormat('jpg');

  const result = await image.toBuffer();
  const attachment = new AttachmentBuilder(result, {
    name: 'packs-store.jpg',
  });

  const packName = packs[1].name.split(' ');
  packName.pop();

  return {
    attachment: attachment,
    section: section,
    packName: packName.join(' '),
    price: prices.packs[packName.join(' ')],
    packs: packs.filter((p) => !p.name.toLowerCase().includes('undefined'))
      .length,
  };
};

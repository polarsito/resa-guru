import { RGEmbed } from '@lib/structures/RGEmbed';
import { AttachmentBuilder } from 'discord.js';
import { join } from 'path';
import { PackInformation, PackInformationResponse } from 'types/Information';
import { toLocaleString } from './toLocaleString';

export const getPackInfo = (pack: string): PackInformationResponse => {
  let data: PackInformation;

  switch (pack.toLowerCase()) {
    case 'icon':
      data = {
        name: 'Icon Pack',
        image: join(process.cwd(), 'images', 'icon_pack.png'),
        description: 'Este paquete otorga un jugador icono asegurado',
        price: 650000,
        probabilities: {
          'X-/X/X+': '15%',
          S: '3%',
        },
      };
      break;
  }

  const attachment = new AttachmentBuilder(data.image, {
    name: 'pack.jpg',
  });

  const embed = new RGEmbed()
    .setTitle(data.name)
    .setThumbnail('attachment://pack.jpg')
    .addFields(
      {
        name: 'Description',
        value: data.description,
      },
      {
        name: 'Price',
        value: `$${toLocaleString(data.price)}`,
      },
      {
        name: 'Probabilities',
        value: Object.keys(data.probabilities)
          .map((k) => `\`${k}:\` ${data.probabilities[k]}`)
          .join('\n'),
      }
    );

  return {
    embed: embed,
    attachment: attachment,
  };
};

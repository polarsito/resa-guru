import { RGEmbed } from '@lib/structures/RGEmbed';
import { AttachmentBuilder } from 'discord.js';

export interface PackInformation {
  name: string;
  description: string;
  price: number;
  image: string;
  probabilities: {
    [key: string]: string;
  };
}

export interface PackInformationResponse {
  embed: RGEmbed;
  attachment: AttachmentBuilder;
}

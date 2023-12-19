import { EmbedBuilder } from '@discordjs/builders';
import { Colors } from 'discord.js';

export class ErrorEmbed extends EmbedBuilder {
  constructor(error: string) {
    super({
      color: Colors.Red,
      description: error,
      title: 'An error has occurred',
    });
  }
}

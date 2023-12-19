import { EmbedBuilder } from '@discordjs/builders';
import { User } from 'discord.js';

export class RGEmbed extends EmbedBuilder {
  constructor(user?: User) {
    super({
      color: parseInt('280800', 16),
      footer: user
        ? {
            text: user.username,
            icon_url: user.displayAvatarURL(),
          }
        : undefined,
    });
    this.setTimestamp();
  }
}

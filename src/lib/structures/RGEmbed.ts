import { EmbedBuilder } from '@discordjs/builders';
import { Colors, User } from 'discord.js';

export class RGEmbed extends EmbedBuilder {
  constructor(user: User) {
    super({
      color: Colors.White,
      footer: {
        text: user.username,
        icon_url: user.displayAvatarURL(),
      },
    });
    this.setTimestamp();
  }
}

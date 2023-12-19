import { EmbedBuilder } from '@discordjs/builders';
import { LanguageKeys } from '@lib/i18n/language';
import { Command } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { Colors } from 'discord.js';

export class CooldownEmbed extends EmbedBuilder {
  constructor(interaction: Command.ChatInputCommandInteraction, date: number) {
    super({
      color: Colors.Red,
      description: `:x: | ${resolveKey(
        interaction,
        LanguageKeys.Errors.Cooldown
      ).then((m) => m.replace('{date}', Math.floor(date / 1000).toString()))}`,
    });
  }
}

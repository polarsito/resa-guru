import { EmbedBuilder } from '@discordjs/builders';
import { LanguageKeys } from '@lib/i18n/language';
import { Command } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { Colors } from 'discord.js';

export class CooldownEmbed extends EmbedBuilder {
  private interaction: Command.ChatInputCommandInteraction;
  private date: number;

  constructor(interaction: Command.ChatInputCommandInteraction, date: number) {
    super({
      color: Colors.Red,
    });

    this.interaction = interaction;
    this.date = date;
  }

  public async get() {
    this.setTitle(await getTranslatedError(this.interaction, 'title'));
    this.setDescription(
      await getTranslatedError(this.interaction, 'description', this.date)
    );

    return this;
  }
}

async function getTranslatedError(
  interaction: Command.ChatInputCommandInteraction,
  type: 'title' | 'description',
  date?: number
): Promise<string> {
  let error: string;
  switch (type) {
    case 'title':
      error = await resolveKey(interaction, LanguageKeys.Utils.SlowDown);
      break;

    case 'description':
      error = (
        await resolveKey(interaction, LanguageKeys.Errors.Cooldown)
      ).replace('{date}', Math.floor((Date.now() + date) / 1000).toString());
      break;
  }

  return error;
}

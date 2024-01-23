import { Precondition } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { bot } from '@config';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';

export class DeveloperOnlyPrecondition extends Precondition {
  public override async chatInputRun(interaction: CommandInteraction) {
    return this.checkDeveloper(interaction);
  }

  private async checkDeveloper(interaction: CommandInteraction) {
    return bot.owners!.includes(interaction.user.id)
      ? this.ok()
      : this.error({
          message: await resolveKey(
            interaction,
            LanguageKeys.Errors.DeveloperOnly
          ),
        });
  }
}

import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Colors } from 'discord.js';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { toLocaleString } from '@lib/utils/toLocaleString';
import { LanguageKeys } from '@lib/i18n/language';
import { resolveKey } from '@sapphire/plugin-i18next';
@ApplyOptions<Command.Options>({
  name: 'balance',
  description: 'Show your credit balance',
  preconditions: [],
})
export class BalanceCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
    });
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description)
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();
    const money = await this.container.db.getBalance(interaction.user.id);

    const embed = new RGEmbed(interaction.user)
      .setColor(Colors.White)
      .setDescription(
        `<@${interaction.user.id}> ${await resolveKey(
          interaction,
          LanguageKeys.Utils.Balance
        )} **${toLocaleString(money)}** :moneybag:`
      );

    return interaction.followUp({
      embeds: [embed],
    });
  }
}

import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { cooldowns } from '../../models/cooldowns';
import { getTimeObject } from 'quick-ms/lib';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';

@ApplyOptions<Command.Options>({
  name: 'cooldowns',
  description: 'Lists the status of all your cooldowns',
  preconditions: [],
})
export class CooldownsCommand extends Command {
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

  public async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();

    const data = await cooldowns
      .findOne({
        userId: interaction.user.id,
      })
      .lean();

    const claimCooldown =
      data?.claim?.cooldown! && Date.now() - data?.claim?.date! < 0
        ? getTimeObject(data?.claim?.date! - Date.now())
        : null;
    const dailyCooldown =
      data?.daily?.cooldown! && Date.now() - data?.daily?.date! < 0
        ? getTimeObject(data?.daily?.date! - Date.now())
        : null;
    const friendlyCooldown =
      data?.friendly?.cooldown! && Date.now() - data?.friendly?.date! < 0
        ? getTimeObject(data?.friendly?.date! - Date.now())
        : null;

    const embed = new RGEmbed(interaction.user)
      .setTitle(`⏲️ Cooldowns | ${interaction.user.username}`)
      .addFields(
        {
          name: '<:card:1077687775731654727> Claim',
          value: claimCooldown
            ? `**${claimCooldown.hours}:${claimCooldown.minutes}:${claimCooldown.seconds}**`
            : `**${await resolveKey(interaction, LanguageKeys.Utils.Ready)}**`,
        },
        {
          name: '🌥️ Daily',
          value: dailyCooldown
            ? `**${dailyCooldown.hours}:${dailyCooldown.minutes}:${dailyCooldown.seconds}**`
            : `**${await resolveKey(interaction, LanguageKeys.Utils.Ready)}**`,
        },
        {
          name: '⚽ Friendly',
          value: friendlyCooldown
            ? `**${friendlyCooldown.minutes}:${friendlyCooldown.seconds}**`
            : `**${await resolveKey(interaction, LanguageKeys.Utils.Ready)}**`,
        }
      );

    return void interaction.followUp({
      embeds: [embed],
    });
  }
}

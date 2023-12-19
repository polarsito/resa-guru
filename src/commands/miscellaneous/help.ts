import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from '@discordjs/builders';
import { Colors } from 'discord.js';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '../../lib/i18n/language';

@ApplyOptions<Command.Options>({
  name: 'help',
  description: 'List all commands',
  preconditions: [],
})
export class FaqsCommand extends Command {
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
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor(Colors.White)
      .setAuthor({
        name: await resolveKey(interaction, LanguageKeys.Information.GuruHelp),
        iconURL: this.container.client.user!.displayAvatarURL(),
      })
      .setDescription(
        await resolveKey(interaction, LanguageKeys.Information.GuruHelp)
      )
      .addFields({
        name: await resolveKey(interaction, 'commands'),
        value: `> \`/balance\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.BalanceDescription
        )}\n> \`/claim\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.ClaimDescription
        )}\n> \`/daily\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.DailyDescription
        )}\n> \`/buy\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.BuyDescription
        )}\n> \`/sell\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.SellDescription
        )}\n> \`/multisell\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.MultisellDescription
        )}\n> \`/club\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.ClubDescription
        )}\n> \`/11 show\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.XIShowDescription
        )}\n> \`/11 add\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.XIAddDescription
        )}\n> \`/11 remove\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.XIRemoveDescription
        )}\n> \`/cooldowns\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.CooldownsDescription
        )}\n> \`/faqs\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.FaqsDescription
        )}\n> \`/flip\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.FlipDescription
        )}\n> \`/info\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.InfoDescription
        )}\n> \`/show\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.ShowDescription
        )}\n> \`/swap\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.SwapDescription
        )}\n> \`/leaderboard balance\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.LeaderboardBalanceDescription
        )}\n> \`/language\` - ${await resolveKey(
          interaction,
          LanguageKeys.Descriptions.LanguageDescription
        )}`,
      });

    return void interaction.followUp({
      embeds: [embed],
    });
  }
}

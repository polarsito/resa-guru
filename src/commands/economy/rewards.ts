import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';
import { getTaskProgress } from '@lib/utils/tasks';
import { bot } from '@config';

@ApplyOptions<Command.Options>({
  name: 'rewards',
  description: 'Complete tasks for rewards',
  preconditions: [],
})
export class RewardsCommand extends Command {
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
    const emojis = bot.emojis;
    const data = await this.container.db.getPlayerTasks(interaction.user.id);

    const playerClaims = data?.claims!;
    const embed = new RGEmbed()
      .setAuthor({
        iconURL: this.container.client.user.displayAvatarURL(),
        name: await resolveKey(interaction, LanguageKeys.Utils.RGRewards),
      })
      .setDescription(
        await resolveKey(
          interaction,
          LanguageKeys.Descriptions.RewardsDescription
        )
      )
      .addFields(
        {
          name: `${emojis.card} ${await resolveKey(
            interaction,
            LanguageKeys.Rewards.Claim100Times
          )}`,
          value: await getTaskProgress(
            interaction.user.id,
            playerClaims?.total! ?? 0,
            100
          ),
        },
        {
          name: `${emojis.cardB} ${await resolveKey(
            interaction,
            LanguageKeys.Rewards.Claim85Plus
          )}`,
          value: '0',
        },
        {
          name: `:trophy: ${await resolveKey(
            interaction,
            LanguageKeys.Rewards.Win50Matches
          )}`,
          value: await getTaskProgress(
            interaction.user.id,
            data?.matchWins! ?? 0,
            5
          ),
        },
        {
          name: `:goal: ${await resolveKey(
            interaction,
            LanguageKeys.Rewards.Score25Penalties
          )}`,
          value: await getTaskProgress(
            interaction.user.id,
            data?.scoredPens! ?? 0,
            25
          ),
        },
        {
          name: `:star: ${await resolveKey(
            interaction,
            LanguageKeys.Rewards.UpgradeToLvl5
          )}`,
          value: await getTaskProgress(interaction.user.id, 0, 5),
        }
      )
      .setFooter({
        text: `${await resolveKey(interaction, LanguageKeys.Utils.Page)} 1/1`,
      })
      .setTimestamp();

    return interaction.followUp({
      embeds: [embed],
    });
  }
}

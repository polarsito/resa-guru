import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { toLocaleString } from '@lib/utils/toLocaleString';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';

@ApplyOptions<Command.Options>({
  name: 'leaderboard',
  description: 'Shows leaderboard',
  preconditions: [],
})
export class LeaderboardCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
    });
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommand((cmd) =>
          cmd.setName('balance').setDescription('Shows balance leaderboard')
        )
    );
  }

  public async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();

    const subCommand = interaction.options.getSubcommand(true);
    if (subCommand === 'balance') {
      const users = await this.container.db.getAllUsersData(['money']);
      const data = users.sort((a, b) => b.money - a.money);
      const sortedUsers = data.slice(0, 5);

      const fields: string[] = [];

      for (let u of sortedUsers) {
        let user = this.container.client.users.cache.get(u.userId);
        if (!user) user = await this.container.client.users.fetch(u.userId);

        fields.push(
          `> **${sortedUsers.indexOf(u) + 1}.** ${user.tag} ${
            sortedUsers.indexOf(u) === 0
              ? '🏆'
              : sortedUsers.indexOf(u) === 1
              ? '🥈'
              : sortedUsers.indexOf(u) === 2
              ? '🥉'
              : ''
          }\n﹂ ${toLocaleString(u.money)} ${await resolveKey(
            interaction,
            LanguageKeys.Utils.Credits
          )}`
        );
      }

      const embed = new RGEmbed(interaction.user)
        .setAuthor({
          name: await resolveKey(
            interaction,
            LanguageKeys.Utils.BalanceLeaderboard
          ),
          iconURL: this.container.client.user!.displayAvatarURL(),
        })
        .setDescription(fields.join('\n\n'));

      return void interaction.followUp({
        embeds: [embed],
      });
    }
  }
}

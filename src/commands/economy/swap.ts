import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { ErrorEmbed } from '@lib/structures/ErrorEmbed';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';

@ApplyOptions<Command.Options>({
  name: 'swap',
  description: 'Move players around in your team',
  preconditions: [],
})
export class SwapCommand extends Command {
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
        .addIntegerOption((option) =>
          option
            .setName('first')
            .setDescription('Location of first player to swap')
            .setMinValue(1)
            .setMaxValue(11)
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('second')
            .setDescription('Location of second player to swap')
            .setMinValue(1)
            .setMaxValue(11)
            .setRequired(true)
        )
    );
  }

  public async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();
    const data = await this.container.db.getUserData(interaction.user.id, [
      'starters',
    ]);

    if (!data.starters! || Object.keys(data.starters).length < 1)
      return void interaction.followUp({
        embeds: [
          new ErrorEmbed(
            await resolveKey(interaction, LanguageKeys.Errors.NeedStarter)
          ),
        ],
      });

    const firstPosition = interaction.options.getInteger('first')?.toString()!;
    const secondPosition = interaction.options
      .getInteger('second')
      ?.toString()!;

    if (!data.starters[firstPosition] && !data.starters[secondPosition])
      return void interaction
        .editReply({
          embeds: [
            new ErrorEmbed(
              await resolveKey(
                interaction,
                LanguageKeys.Errors.NoPlayersInPositions
              )
            ),
          ],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 1000 * 5));

    if (firstPosition === secondPosition)
      return void interaction
        .editReply({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.SamePositions)
            ),
          ],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 1000 * 5));

    await this.container.db.swap(
      interaction.user.id,
      firstPosition,
      secondPosition
    );

    return void interaction.followUp({
      embeds: [
        new RGEmbed(interaction.user).setDescription(
          await resolveKey(interaction, LanguageKeys.Success.PlayersSwap)
        ),
      ],
    });
  }
}

import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';

@ApplyOptions<Command.Options>({
  name: 'clubname',
  description: 'Change the name of your club',
  preconditions: [],
})
export class ClubnameCommand extends Command {
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
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('New name of your club')
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(16)
        )
    );
  }

  public async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();

    const name = interaction.options.getString('name');
    await this.container.db.setClubName(interaction.user.id, name!);

    return void interaction.followUp({
      embeds: [
        new RGEmbed(interaction.user).setDescription(
          (
            await resolveKey(interaction, LanguageKeys.Success.ClubName)
          ).replace('{name}', name!)
        ),
      ],
    });
  }
}

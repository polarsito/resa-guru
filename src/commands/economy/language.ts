import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { LanguageKeys } from '@lib/i18n/language';
import { resolveKey } from '@sapphire/plugin-i18next';

@ApplyOptions<Command.Options>({
  name: 'language',
  description: 'Choose your desired language',
  preconditions: [],
})
export class LanguageCommand extends Command {
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
            .setName('language')
            .setRequired(true)
            .setDescription('The language you want')
            .addChoices(
              {
                name: 'English',
                value: 'en-US',
              },
              {
                name: 'Spanish',
                value: 'es-ES',
              }
            )
        )
    );
  }

  public async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();

    const languages = {
      'en-US': 'English',
      'es-ES': 'Spanish',
    };

    const language = interaction.options.getString('language');
    await this.container.db.setUserLanguage(interaction.user.id, language!);

    return void interaction.followUp({
      embeds: [
        new RGEmbed(interaction.user).setDescription(
          (
            await resolveKey(interaction, LanguageKeys.Success.LanguageSet)
          ).replace('{language}', languages[language!])
        ),
      ],
    });
  }
}

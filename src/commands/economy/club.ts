import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { ErrorEmbed } from '@lib/structures/ErrorEmbed';
import { renderClub } from '@lib/utils/renderClub';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Interaction,
} from 'discord.js';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';

@ApplyOptions<Command.Options>({
  name: 'club',
  description: 'List players from our club',
  preconditions: [],
})
export class ClubCommand extends Command {
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

    const userData = await this.container.db.getUserData(interaction.user.id, [
      'club',
    ]);
    if (!userData || !userData.club || Object.keys(userData.club!).length <= 0)
      return void interaction
        .editReply({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.XIEmpty)
            ),
          ],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 1000 * 5));

    let attachments = await renderClub(Object.keys(userData.club));

    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('previous-club-page')
        .setLabel('◀')
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('next-club-page')
        .setLabel('▶')
        .setDisabled(attachments.length > 1 ? false : true)
        .setStyle(ButtonStyle.Secondary)
    );

    let page = 1;

    const reply = await interaction.followUp({
      files: [attachments[0]],
      components: [row],
    });

    const collector = reply.createMessageComponentCollector({
      idle: 1000 * 60,
      filter: (i: Interaction) => i.user.id === interaction.user.id,
    });

    collector.on('collect', async (i: ButtonInteraction) => {
      await i.deferUpdate();

      if (i.customId === 'previous-club-page') {
        if (page !== 1) {
          row.components[1].setDisabled(false);
          page--;
          if (page === 1) {
            row.components[0].setDisabled(true);
            reply.edit({
              files: [attachments[page - 1]],
              components: [row],
            });
          } else {
            reply.edit({
              files: [attachments[page - 1]],
              components: [row],
            });
          }
        }
      } else if (i.customId === 'next-club-page') {
        if (page !== attachments.length) {
          page++;
          row.components[0].setDisabled(false);
          if (page === attachments.length) {
            row.components[1].setDisabled(true);
            reply.edit({
              files: [attachments[page - 1]],
              components: [row],
            });
          } else {
            reply.edit({
              files: [attachments[page - 1]],
              components: [row],
            });
          }
        }
      }
    });

    collector.on('end', (_collected, reason) => {
      if (reason === 'idle') {
        row.components[0].setDisabled(true);
        row.components[1].setDisabled(true);

        reply.edit({
          components: [row],
        });
      }
    });
  }
}

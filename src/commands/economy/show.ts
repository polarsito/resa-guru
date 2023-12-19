import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { ErrorEmbed } from '@lib/structures/ErrorEmbed';
import {
  getPlayerData,
  getPlayerKey,
  hasPlayer,
  playerExists,
} from '@lib/utils/players';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';
import { getPlayerCard } from '@lib/utils/getPlayerCard';
import type { PlayerData } from 'types/PlayerData';
import {
  ButtonInteraction,
  ButtonStyle,
  Colors,
  Interaction,
  Message,
} from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} from '@discordjs/builders';
import { toLocaleString } from '@lib/utils/toLocaleString';

@ApplyOptions<Command.Options>({
  name: 'show',
  description: 'Show a player from your club from the current season',
  preconditions: [],
})
export class ShowCommand extends Command {
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
            .setName('player')
            .setDescription('The name of the player')
            .setRequired(true)
        )
    );
  }

  public async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();

    const playerName = interaction.options.getString('player')!;

    if (!playerExists(playerName))
      return void interaction
        .editReply({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.PlayerNotExist)
            ),
          ],
        })
        .then((msg) => setTimeout(() => msg.delete(), 1000 * 5));

    const playerData: PlayerData[] = getPlayerData(playerName);
    const players: PlayerData[] = [];
    for (let dt of playerData) {
      const has = await hasPlayer(
        interaction.user.id,
        getPlayerKey(dt.name, dt.type)
      );
      if (has) players.push(dt);
    }

    if (players.length! === 0)
      return void interaction
        .editReply({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.PlayerNotOnClub)
            ),
          ],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 1000 * 5));

    let reply: Message;
    let row: ActionRowBuilder<ButtonBuilder>;
    const embeds: EmbedBuilder[] = [];
    if (players.length === 1) {
      const player = players[0];
      const cardImage = await getPlayerCard(player);

      const embed = new RGEmbed(interaction.user)
        .setImage(cardImage)
        .setDescription(
          `\`${await resolveKey(
            interaction,
            LanguageKeys.Utils.Value
          )} ${toLocaleString(player.value)}\`\n\`${await resolveKey(
            interaction,
            LanguageKeys.Utils.Position
          )}: ${player.position}\``
        )
        .setTitle(
          `${await resolveKey(interaction, LanguageKeys.Utils.OwnedBy)} ${
            interaction.user.tag
          }`
        );

      reply = await interaction.editReply({
        embeds: [embed],
      });
    } else {
      row = new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
          .setCustomId('back')
          .setLabel('◄')
          .setDisabled(true)
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('►')
          .setStyle(ButtonStyle.Secondary)
      );

      for (const player of players) {
        const cardImage = await getPlayerCard(player);
        embeds.push(
          new EmbedBuilder()
            .setColor(Colors.White)
            .setImage(cardImage)
            .setDescription(
              `\`Value: ${toLocaleString(player.value)}\`\n\`Position: ${
                player.position
              }\``
            )
            .setTitle(
              `${await resolveKey(interaction, LanguageKeys.Utils.OwnedBy)} ${
                interaction.user.tag
              }`
            )
            .setFooter({
              iconURL: interaction.user.displayAvatarURL(),
              text: `Page ${players.indexOf(player) + 1}/${players.length}`,
            })
        );
      }

      reply = await interaction.editReply({
        embeds: [embeds[0]],
        components: [row],
      });

      const collector = reply.createMessageComponentCollector({
        idle: 1000 * 30,
        filter: (i: Interaction) => i.user.id === interaction.user.id,
      });

      let page = 1;
      collector.on('collect', async (i: ButtonInteraction) => {
        await i.deferUpdate();

        if (i.user.id === interaction.user.id) {
          if (i.customId === 'next' && page !== embeds.length) {
            page++;
            if (page === embeds.length) {
              row.components[1].setDisabled(true);
              row.components[0].setDisabled(false);
            }

            interaction.editReply({
              embeds: [embeds[page - 1]],
              components: [row],
            });
          } else if (i.customId === 'back' && page !== 1) {
            page--;
            if (page === 1) {
              row.components[0].setDisabled(true);
              row.components[1].setDisabled(false);
            }

            interaction.editReply({
              embeds: [embeds[page - 1]],
              components: [row],
            });
          }
        }
      });

      collector.on('end', (_collected, reason) => {
        if (reason === 'idle') {
          if (row.components.length === 1) row.components[0].setDisabled(true);
          else {
            row.components[0].setDisabled(true);
            row.components[1].setDisabled(true);
          }

          interaction.editReply({
            components: [row],
          });
        }
      });
    }
  }
}

import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { ErrorEmbed } from '@lib/structures/ErrorEmbed';
import {
  getPlayerData,
  getPlayerKey,
  playerExists,
  promotePlayer,
  removeFromStarters,
} from '@lib/utils/players';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { renderXI } from '@lib/utils/renderXI';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';
import type { PlayerData } from '../../types/PlayerData';
import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} from '@discordjs/builders';
import {
  ButtonInteraction,
  ButtonStyle,
  Colors,
  Interaction,
} from 'discord.js';
import { getPlayerCard } from '@lib/utils/getPlayerCard';
import { toLocaleString } from '@lib/utils/toLocaleString';

@ApplyOptions<Command.Options>({
  name: '11',
  description: 'Your team',
  preconditions: [],
})
export class XICommand extends Command {
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
          cmd
            .setName('remove')
            .setDescription('Remove a player from your starting 11')
            .addStringOption((option) =>
              option
                .setName('player')
                .setDescription('Name of the player')
                .setRequired(true)
            )
        )
        .addSubcommand((cmd) =>
          cmd.setName('show').setDescription('Shows your current active team')
        )
        .addSubcommand((cmd) =>
          cmd
            .setName('add')
            .setDescription('Add a player to your starting 11')
            .addStringOption((option) =>
              option
                .setName('player')
                .setDescription('Name of the player')
                .setRequired(true)
            )
        )
    );
  }

  public async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();

    const subCommand = interaction.options.getSubcommand(true);
    if (subCommand === 'add') {
      const playerName = interaction.options.getString('player');
      if (!playerName) return;

      if (!playerExists(playerName))
        return void interaction.followUp({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.PlayerNotExist)
            ),
          ],
        });

      const data = await this.container.db.getUserData(interaction.user.id, [
        'club',
        'starters',
      ]);

      const players = data.club.filter((p) =>
        p.toLowerCase().includes(playerName.toLowerCase())
      );

      if (
        !data.club?.some((p) =>
          p.toLowerCase().includes(playerName.toLowerCase())
        )
      )
        return void interaction.followUp({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.PlayerNotOnClub)
            ),
          ],
        });

      if (
        Object.keys(data.starters!)?.length! >= 1 &&
        Object.keys(data.starters).some((k) =>
          data.starters[k].includes(playerName)
        )
      )
        return void interaction.followUp({
          embeds: [
            new ErrorEmbed(
              await resolveKey(
                interaction,
                LanguageKeys.Errors.PlayerAlreadyStarter
              )
            ),
          ],
        });

      if (
        Object.keys(data.starters!)?.length! === 11 &&
        Object.keys(data.starters).some((k) => data.starters[k] === null)
      )
        return void interaction.followUp({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.XIFull)
            ),
          ],
        });

      const plrs = this.container.players;
      const playersData = Object.keys(plrs)
        .filter((p) => p.toLowerCase().includes(playerName.toLowerCase()))
        .map((p) => plrs[p]);

      if (players.length === 1) {
        const playerToPromote = playersData[0];
        const result = await promotePlayer(
          interaction.user.id,
          getPlayerKey(playerToPromote.name, playerToPromote.type)
        );
        if (!result)
          return void interaction.editReply({
            embeds: [
              new ErrorEmbed(
                await resolveKey(interaction, LanguageKeys.Errors.ErrorOcurred)
              ),
            ],
          });

        return void interaction.editReply({
          embeds: [
            new RGEmbed(interaction.user).setDescription(
              (
                await resolveKey(
                  interaction,
                  LanguageKeys.Success.PlayerPromoted
                )
              ).replace('{player}', playerToPromote.name)
            ),
          ],
        });
      } else {
        const embeds: EmbedBuilder[] = [];
        for (const plr of playersData) {
          const cardImage = await getPlayerCard(plr);

          embeds.push(
            new EmbedBuilder()
              .setColor(Colors.White)
              .setTitle('Select a player to promote')
              .setImage(cardImage)
              .setFooter({
                iconURL: interaction.user.displayAvatarURL(),
                text: `Page ${players.indexOf(plr) + 1}/${players.length}`,
              })
              .setDescription(
                `\`Value: ${toLocaleString(plr.value)}\`\n\`Position: ${
                  plr.position
                }\``
              )
          );
        }

        const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setCustomId('back')
            .setLabel('◄')
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('►')
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId('promote')
            .setLabel('Promote')
            .setStyle(ButtonStyle.Success)
        );

        const reply = await interaction.editReply({
          embeds: [embeds[0]],
          components: [row],
        });
        let page = 1;

        const collector = reply.createMessageComponentCollector({
          idle: 1000 * 60,
          filter: (u: Interaction) => u.user.id === interaction.user.id,
        });

        collector.on('collect', async (i: ButtonInteraction): Promise<void> => {
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
            } else if (i.customId === 'promote') {
              row.components[0].setDisabled(true);
              row.components[1].setDisabled(true);
              interaction.editReply({
                components: [row],
              });

              const playerToPromote = playersData[page - 1];
              const result = await promotePlayer(
                interaction.user.id,
                getPlayerKey(playerToPromote.name, playerToPromote.type)
              );
              if (!result)
                return void interaction.editReply({
                  embeds: [
                    new ErrorEmbed(
                      await resolveKey(
                        interaction,
                        LanguageKeys.Errors.ErrorOcurred
                      )
                    ),
                  ],
                });

              interaction.editReply({
                embeds: [
                  new RGEmbed(interaction.user).setDescription(
                    (
                      await resolveKey(
                        interaction,
                        LanguageKeys.Success.PlayerPromoted
                      )
                    ).replace('{player}', playerToPromote.name)
                  ),
                ],
                components: [],
              });

              return void collector.stop();
            }
          }
        });

        collector.on('end', async (_collected, reason) => {
          if (reason === 'idle') await interaction.deleteReply();
        });
      }
    } else if (subCommand === 'remove') {
      const player = interaction.options.getString('player');
      if (!player) return;

      if (!playerExists(player))
        return void interaction.followUp({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.PlayerNotExist)
            ),
          ],
        });

      const data = await this.container.db.getUserData(interaction.user.id, [
        'starters',
      ]);
      const dataToFilter = getPlayerData(player);
      let plrdt: PlayerData | null = null;
      for (let dt of dataToFilter) {
        if (
          Object.keys(data?.starters!)?.some(
            (d) => data.starters[d] === getPlayerKey(dt.name, dt.type)
          )
        )
          plrdt = dt;
      }

      if (!plrdt)
        return void interaction.followUp({
          embeds: [
            new ErrorEmbed(
              await resolveKey(
                interaction,
                LanguageKeys.Errors.PlayerNotStarter
              )
            ),
          ],
        });

      const result = await removeFromStarters(
        interaction.user.id,
        getPlayerKey(plrdt.name, plrdt.type)
      );
      if (!result)
        return void interaction.followUp({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.ErrorOcurred)
            ),
          ],
        });

      return void interaction.followUp({
        embeds: [
          new RGEmbed(interaction.user).setDescription(
            (
              await resolveKey(
                interaction,
                LanguageKeys.Success.PlayerUnPromoted
              )
            ).replace('{player}', plrdt.name)
          ),
        ],
      });
    } else if (subCommand === 'show') {
      const data = await this.container.db.getUserData(interaction.user.id, [
        'starters',
      ]);

      if (!data.starters! || Object.keys(data.starters).length! < 1)
        return void interaction.followUp({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.XIEmpty)
            ),
          ],
        });

      const attachment = await renderXI(
        interaction.user.id,
        interaction.user.username,
        data.starters
      );

      return void interaction.followUp({
        files: [attachment],
      });
    }
  }
}

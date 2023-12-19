import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { ErrorEmbed } from '@lib/structures/ErrorEmbed';
import {
  getPlayerData,
  getPlayerKey,
  hasPlayer,
  playerExists,
} from '@lib/utils/players';
import type { PlayerData } from 'types/PlayerData';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Interaction,
} from 'discord.js';
import { toLocaleString } from '@lib/utils/toLocaleString';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';
import { getPlayerCard } from '@lib/utils/getPlayerCard';
import {
  getPaginationButtonsRow,
  playerPagination,
} from '@lib/utils/paginations';
import { getPlayerSellValue } from '@lib/utils/getPlayerSellValue';
import { RGEmbed } from '@lib/structures/RGEmbed';

@ApplyOptions<Command.Options>({
  name: 'sell',
  description: 'Sell a player from your club',
  preconditions: [],
})
export class SellCommand extends Command {
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
        .then(() => setTimeout(() => interaction.deleteReply(), 1000 * 5));

    const dataToFilter: PlayerData[] = getPlayerData(playerName);
    const data: PlayerData[] = [];
    for (let dt of dataToFilter) {
      const has = await hasPlayer(
        interaction.user.id,
        getPlayerKey(dt.name, dt.type)
      );
      if (has) data.push(dt);
    }

    if (data?.length! === 0)
      return void interaction
        .editReply({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.PlayerNotOnClub)
            ),
          ],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 1000 * 5));

    const embeds = playerPagination(data, {
      title: '{playerName}',
      description: (
        await resolveKey(interaction, LanguageKeys.Utils.SalePrice)
      ).replace('{value}', '{playerSellValue}'),
    });

    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
      ...getPaginationButtonsRow().components,
      new ButtonBuilder()
        .setCustomId('confirm-sell')
        .setLabel(
          await resolveKey(interaction, LanguageKeys.Confirmations.Confirm)
        )
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('✅')
    );

    const reply = await interaction.editReply({
      embeds: [embeds[0]],
      components: [row],
    });

    if (embeds.length > 1) {
      let page = 1;
      const collector = reply!.createMessageComponentCollector({
        idle: 1000 * 60,
        filter: (i: Interaction) => i.user.id === interaction.user.id,
      });
      collector.on('collect', async (i: ButtonInteraction): Promise<void> => {
        await i.deferUpdate();

        if (i.customId === 'confirm-sell') {
          const player = data.length === 1 ? data[0] : data[page - 1];
          const sellPrice = getPlayerSellValue(player.value);
          const cardImage = await getPlayerCard(player);

          const userData = await this.container.db.getUserData(
            interaction.user.id,
            ['club']
          );
          const key = getPlayerKey(player.name, player.type);
          await this.container.db.sellPlayer(
            interaction.user.id,
            key,
            userData.club.lastIndexOf(key)
          );
          return void interaction.editReply({
            embeds: [
              new RGEmbed()
                .setTitle(
                  await resolveKey(interaction, LanguageKeys.Utils.PlayerSold)
                )
                .setDescription(
                  `<@${i.user.id}>\n${(
                    await resolveKey(
                      interaction,
                      LanguageKeys.Success.PlayerSoldForCredits
                    )
                  )
                    .replace('{player}', player.name)
                    .replace('{value}', toLocaleString(sellPrice))}`
                )
                .setImage(cardImage)
                .setFooter({
                  text: interaction.user.username,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp(),
            ],
            components: [],
          });
        } else if (i.customId === 'next' && page !== embeds.length) {
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
      });

      collector.on('end', (_collected, reason) => {
        if (reason === 'idle') {
          if (row.components.length === 1) row.components[0].setDisabled(true);
          else {
            row.components[0].setDisabled(true);
            row.components[1].setDisabled(true);
            row.components[2].setDisabled(true);
          }
          interaction.editReply({ components: [row] });
        }
      });
    }
  }
}

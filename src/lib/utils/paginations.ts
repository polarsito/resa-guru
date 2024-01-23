import { RGEmbed } from '@lib/structures/RGEmbed';
import { PlayerData } from 'types/PlayerData';
import { getPlayerCard } from './getPlayerCard';
import { PlayerPaginationOptions } from 'types/Pagination';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { toLocaleString } from './toLocaleString';
import { getPlayerSellValue } from './getPlayerSellValue';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';

export const playerPagination = async (
  players: PlayerData[],
  options: PlayerPaginationOptions
): Promise<RGEmbed[]> => {
  const embeds: RGEmbed[] = await Promise.all(
    players.map(async (player) => {
      const img = await getPlayerCard(player);

      return new RGEmbed()
        .setTitle(options.title.replaceAll('{playerName}', player.name))
        .setImage(img)
        .setDescription(
          options.description
            .replaceAll('{playerValue}', toLocaleString(player.value))
            .replaceAll(
              '{playerSellValue}',
              toLocaleString(getPlayerSellValue(player.value))
            )
            .replaceAll('{playerPosition}', player.position)
        )
        .setFooter({
          text: `${await resolveKey(
            options.interaction,
            LanguageKeys.Utils.Page
          )} ${players.indexOf(player) + 1}/${players.length.toLocaleString()}`,
        });
    })
  );

  return embeds;
};

export const getPaginationButtonsRow = (
  pages: number
): ActionRowBuilder<ButtonBuilder> => {
  const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
    new ButtonBuilder()
      .setCustomId('back')
      .setLabel('◄')
      .setDisabled(true)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('next')
      .setLabel('►')
      .setDisabled(pages === 1)
      .setStyle(ButtonStyle.Secondary)
  );

  return row;
};

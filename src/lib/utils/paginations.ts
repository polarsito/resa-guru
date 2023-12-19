import { RGEmbed } from '@lib/structures/RGEmbed';
import { PlayerData } from 'types/PlayerData';
import { getPlayerCard } from './getPlayerCard';
import { PlayerPaginationOptions } from 'types/Pagination';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { toLocaleString } from './toLocaleString';

export const playerPagination = (
  players: PlayerData[],
  options: PlayerPaginationOptions
): RGEmbed[] => {
  const embeds: RGEmbed[] = [];

  players.forEach(async (player) => {
    embeds.push(
      new RGEmbed()
        .setTitle(options.title.replaceAll('{playerName}', player.name))
        .setImage(await getPlayerCard(player))
        .setDescription(
          options.description.replaceAll(
            '{playerValue}',
            toLocaleString(player.value)
              .replaceAll('{playerPosition}', player.position)
              .replaceAll(
                '{playerSellValue}',
                toLocaleString(player.value * 0.55)
              )
          )
        )
        .setFooter({
          text: `Page ${
            players.indexOf(player) + 1
          }/${players.length.toLocaleString()}`,
        })
    );
  });

  return embeds;
};

export const getPaginationButtonsRow = (): ActionRowBuilder<ButtonBuilder> => {
  const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
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

  return row;
};

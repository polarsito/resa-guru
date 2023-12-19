import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { ErrorEmbed } from '@lib/structures/ErrorEmbed';
import {
  getPlayerData,
  getPlayerKey,
  hasPlayer,
  playerExists,
} from '@lib/utils/players';
import type { PlayerData } from '../../types/PlayerData';
import { EmbedBuilder } from '@discordjs/builders';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Colors,
  Interaction,
  Message,
} from 'discord.js';
import { toLocaleString } from '@lib/utils/toLocaleString';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';
import { getPlayerCard } from '@lib/utils/getPlayerCard';

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

    let row: ActionRowBuilder<ButtonBuilder>;
    let reply: Message;
    let embeds: EmbedBuilder[] = [];

    if (data.length === 1) {
      const player = data[0];
      const sellPrice = Math.round(player.value * 0.55);
      const cardImage = await getPlayerCard(player);

      const embed = new RGEmbed(interaction.user)
        .setTitle(player.name)
        .setDescription(
          (await resolveKey(interaction, LanguageKeys.Utils.SalePrice)).replace(
            '{value}',
            toLocaleString(sellPrice)
          )
        )
        .setImage(cardImage);

      row = new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
          .setCustomId('confirm-sell')
          .setLabel(
            await resolveKey(interaction, LanguageKeys.Confirmations.Confirm)
          )
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('✅')
      );

      reply = await interaction.editReply({
        embeds: [embed],
        components: [row],
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
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId('confirm-sell')
          .setLabel(
            await resolveKey(interaction, LanguageKeys.Confirmations.Confirm)
          )
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('✅')
      );

      for (const player of data) {
        const sellPrice = Math.round(player.value * 0.55);
        const cardImage = await getPlayerCard(player);

        embeds.push(
          new EmbedBuilder()
            .setTitle(player.name)
            .setDescription(
              (
                await resolveKey(interaction, LanguageKeys.Utils.SalePrice)
              ).replace('{value}', toLocaleString(sellPrice))
            )
            .setImage(cardImage)
            .setFooter({
              iconURL: interaction.user.displayAvatarURL(),
              text: `Page ${data.indexOf(player) + 1}/${data.length}`,
            })
        );

        reply = await interaction.editReply({
          embeds: [embeds[0]],
          components: [row],
        });
      }
    }

    let page = 1;
    const collector = reply!.createMessageComponentCollector({
      idle: 1000 * 60,
      filter: (i: Interaction) => i.user.id === interaction.user.id,
    });
    collector.on('collect', async (i: ButtonInteraction): Promise<void> => {
      await i.deferUpdate();

      if (i.customId === 'confirm-sell') {
        const player = data.length === 1 ? data[0] : data[page - 1];
        const sellPrice = Math.round(player.value * 0.55);
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
            new EmbedBuilder()
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
              .setColor(Colors.White)
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

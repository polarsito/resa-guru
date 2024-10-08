import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { ErrorEmbed } from '@lib/structures/ErrorEmbed';
import { getPlayerData, getPlayerKey, playerExists } from '@lib/utils/players';
import type { PlayerData } from 'types/PlayerData';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Interaction,
} from 'discord.js';
import { toLocaleString } from '@lib/utils/toLocaleString';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';
import { getPlayerCard } from '@lib/utils/getPlayerCard';
import {
  getPaginationButtonsRow,
  playerPagination,
} from '@lib/utils/paginations';

@ApplyOptions<Command.Options>({
  name: 'buy',
  description: 'Buy a player to join your club',
  preconditions: [],
})
export class BuyCommand extends Command {
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
    const plrName = interaction.options.getString('player')!;
    if (!playerExists(plrName))
      return void interaction
        .editReply({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.PlayerNotExist)
            ),
          ],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 1000 * 5));

    const data: PlayerData[] = getPlayerData(plrName).filter(
      (d) => !d.exclusive
    );

    let embeds = await playerPagination(data, {
      title: '{playerName}',
      interaction: interaction,
      description: `${await resolveKey(
        interaction,
        LanguageKeys.Utils.Value
      )} - \`{playerValue}\` / ${await resolveKey(
        interaction,
        LanguageKeys.Utils.SellsFor
      )} - \`{playerSellValue}\``,
    });

    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
      ...getPaginationButtonsRow(embeds.length).components,
      new ButtonBuilder()
        .setCustomId('confirm-buy')
        .setLabel(
          await resolveKey(interaction, LanguageKeys.Confirmations.Confirm)
        )
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('✅')
    );

    const reply = await interaction.followUp({
      embeds: [embeds[0]],
      components: [row],
    });

    let page = 1;
    const userData = await this.container.db.getUserData(interaction.user.id, [
      'money',
    ]);

    const collector = reply!.createMessageComponentCollector({
      idle: 1000 * 60,
      filter: (i: Interaction) => i.user.id === interaction.user.id,
    });
    collector.on('collect', async (i: ButtonInteraction): Promise<void> => {
      await i.deferUpdate();

      row.components[0].setDisabled(true);
      interaction.editReply({
        components: [row],
      });

      if (i.customId === 'confirm-buy') {
        let player: PlayerData = data.length === 1 ? data[0] : data[page - 1];
        const cardImage = await getPlayerCard(player);

        if (!userData || (userData && userData.money < player.value))
          return void interaction.editReply({
            embeds: [
              new RGEmbed(interaction.user)
                .setTitle(
                  await resolveKey(
                    interaction,
                    LanguageKeys.Utils.TransferBrokeDown
                  )
                )
                .setDescription(
                  `<@${i.user.id}>\n${(
                    await resolveKey(
                      interaction,
                      LanguageKeys.Errors.NotEnoughCreditsToBuy
                    )
                  )
                    .replace('{player}', player.name)
                    .replace(
                      '{value}',
                      toLocaleString(player.value - userData!.money)
                    )}`
                )
                .setImage(cardImage),
            ],
            components: [],
          });

        await this.container.db.buyPlayer(
          interaction.user.id,
          getPlayerKey(player.name, player.type)
        );
        interaction.editReply({
          embeds: [
            new RGEmbed(interaction.user)
              .setTitle(
                `${player.name} ${await resolveKey(
                  interaction,
                  LanguageKeys.Utils.JoinsClub
                )}`
              )
              .setDescription(
                `<@${i.user.id}>\n${(
                  await resolveKey(
                    interaction,
                    LanguageKeys.Success.JoinedClubForCredits
                  )
                )
                  .replace('{player}', player.name)
                  .replace('{value}', toLocaleString(player.value))}`
              )
              .setImage(cardImage),
          ],
          components: [],
        });

        return void collector.stop();
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

        interaction.editReply({
          components: [row],
        });
      }
    });
  }
}

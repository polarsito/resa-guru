import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { getClaimedPlayer } from '@lib/utils/getClaimedPlayer';
import { EmbedBuilder } from '@discordjs/builders';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Colors,
  Interaction,
} from 'discord.js';
import {
  addPlayerToClub,
  getPlayerKey,
  promotePlayer,
  sellPlayer,
} from '@lib/utils/players';
import { CooldownEmbed } from '@lib/structures/CooldownEmbed';
import { toLocaleString } from '@lib/utils/toLocaleString';
import { ErrorEmbed } from '@lib/structures/ErrorEmbed';
import { RGEmbed } from '@lib/structures/RGEmbed';
import users from '../../models/users';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';
import { getPlayerCard } from '@lib/utils/getPlayerCard';

@ApplyOptions<Command.Options>({
  name: 'claim',
  description: 'Claim a new player every hour',
  preconditions: [],
})
export class ClaimCommand extends Command {
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

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const cooldown = await this.container.db.checkCooldown(
      interaction.user.id,
      this.name
    );
    if (cooldown && typeof cooldown === 'number') {
      return interaction.followUp({
        embeds: [new CooldownEmbed(interaction, cooldown)],
      });
    }

    const player = getClaimedPlayer();
    const cardImage = await getPlayerCard(player);
    const embed = new RGEmbed(interaction.user)
      .setTitle(
        `${player.name} ${await resolveKey(
          interaction,
          LanguageKeys.Utils.JoinsClub
        )}`
      )
      .setDescription(
        `${await resolveKey(
          interaction,
          LanguageKeys.Utils.Value
        )} - \`${toLocaleString(player.value)}\` / ${await resolveKey(
          interaction,
          LanguageKeys.Utils.SellsFor
        )} - \`${toLocaleString(
          Math.round(player.value * 0.55)
        )}\`\n:coin: \`${await resolveKey(
          interaction,
          LanguageKeys.Utils.QuickSell
        )}\`\n⬆️ \`${await resolveKey(
          interaction,
          LanguageKeys.Utils.Promote
        )}\`\n`
      )
      .setImage(cardImage);

    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('quick-sell')
        .setLabel(await resolveKey(interaction, LanguageKeys.Utils.QuickSell))
        .setEmoji('🪙')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('promote-starters')
        .setLabel(await resolveKey(interaction, LanguageKeys.Utils.Promote))
        .setEmoji('⬆️')
        .setStyle(ButtonStyle.Secondary)
    );

    const reply = await interaction.followUp({
      embeds: [embed],
      components: [row],
    });

    await addPlayerToClub(
      interaction.user.id,
      getPlayerKey(player.name, player.type)
    );
    await this.container.db.setCooldown(
      interaction.user.id,
      this.name,
      1000 * 60 * 60
    );

    const collector = reply.createMessageComponentCollector({
      idle: 1000 * 60,
      filter: (i: Interaction) => i.user.id === interaction.user.id,
      max: 1,
    });

    collector.on('collect', async (i: ButtonInteraction): Promise<void> => {
      const sellPrice = Math.round(player.value * 0.55);

      if (i.customId === 'quick-sell') {
        const confirmationEmbed = new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(
            `${await resolveKey(
              interaction,
              LanguageKeys.Confirmations.SureAboutSell
            )} \`${player.name}\` ${await resolveKey(
              interaction,
              LanguageKeys.Utils.For
            )} \`${toLocaleString(sellPrice)}\`?`
          );

        const confirmationRow =
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId('confirm-sell')
              .setLabel(
                await resolveKey(
                  interaction,
                  LanguageKeys.Confirmations.Confirm
                )
              )
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('✅')
          );

        const confirmReply = await i.reply({
          embeds: [confirmationEmbed],
          components: [confirmationRow],
        });

        const confirmationCollector =
          confirmReply.createMessageComponentCollector({
            idle: 1000 * 60,
            filter: (ins: Interaction) => ins.user.id === i.user.id,
            max: 1,
          });

        confirmationCollector.on(
          'collect',
          async (collected: ButtonInteraction) => {
            await collected.deferUpdate();
            if (collected.user.id === interaction.user.id) {
              const userData = await this.container.db.getUserData(
                interaction.user.id,
                ['club']
              );
              const sell = await sellPlayer(
                collected.user.id,
                player.name,
                userData.club.lastIndexOf(player.name)
              );
              if (sell) {
                const newEmbed = new RGEmbed(collected.user)
                  .setTitle(
                    await resolveKey(interaction, LanguageKeys.Utils.SoldTitle)
                  )
                  .setDescription(
                    `<@${collected.user.id}>\n${(
                      await resolveKey(
                        interaction,
                        LanguageKeys.Success.PlayerSoldForCredits
                      )
                    )
                      .replace('{player}', `\`${player.name}\``)
                      .replace('{value}', `\`${toLocaleString(sellPrice)}\``)}`
                  )
                  .setImage(cardImage);

                i.deleteReply();
                interaction.editReply({
                  embeds: [newEmbed],
                  components: [],
                });

                collector.stop();
              } else {
                i.editReply({
                  embeds: [
                    new ErrorEmbed(await resolveKey(interaction, 'error')),
                  ],
                });

                collector.stop();
              }
            }
          }
        );
      } else if (i.customId === 'promote-starters') {
        const data = await users.findOne({ userId: i.user.id }).lean();
        if (
          Object.values(data?.starters!)?.filter((k) => k !== null).length ===
          11
        )
          return void i.followUp({
            embeds: [
              new ErrorEmbed(
                await resolveKey(interaction, LanguageKeys.Errors.XIFull)
              ),
            ],
          });

        if (Object.values(data?.starters!)?.includes(player.name))
          return void i.followUp({
            embeds: [
              new ErrorEmbed(
                await resolveKey(
                  interaction,
                  LanguageKeys.Errors.PlayerAlreadyStarter
                )
              ),
            ],
          });

        const promoted = await promotePlayer(i.user.id, player.name);
        if (!promoted)
          return void i.followUp({
            embeds: [
              new ErrorEmbed(
                await resolveKey(interaction, LanguageKeys.Errors.ErrorOcurred)
              ),
            ],
          });
        else
          interaction.editReply({
            embeds: [
              new RGEmbed(interaction.user)
                .setImage(cardImage)
                .setTitle(
                  await resolveKey(
                    interaction,
                    LanguageKeys.Success.SuccessfullyPromoted
                  )
                )
                .setDescription(
                  `<@${i.user.id}>\n${(
                    await resolveKey(
                      interaction,
                      LanguageKeys.Success.PlayerQuickPromoted
                    )
                  ).replace('{player}', player.name)}`
                ),
            ],
            components: [],
          });

        return void collector.stop();
      }
    });

    collector.on('end', (_collected, reason) => {
      if (reason === 'idle') {
        row.components[0].setDisabled(true);
        row.components[1].setDisabled(true);
        interaction.editReply({
          components: [row],
        });
      }
    });

    return true;
  }
}

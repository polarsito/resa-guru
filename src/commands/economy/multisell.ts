import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { ErrorEmbed } from '@lib/structures/ErrorEmbed';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  Interaction,
} from 'discord.js';
import { toLocaleString } from '@lib/utils/toLocaleString';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';
import { getPlayerSellValue } from '@lib/utils/getPlayerSellValue';

@ApplyOptions<Command.Options>({
  name: 'multisell',
  description: 'Sell multiple players from your club simultaneously',
  preconditions: [],
})
export class MultisellCommand extends Command {
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
        .addIntegerOption((option) =>
          option
            .setName('starting_id')
            .setDescription('First id of player from club page')
            .setRequired(true)
            .setMinValue(1)
        )
        .addIntegerOption((option) =>
          option
            .setName('ending_id')
            .setDescription('Last id of player from club page')
            .setRequired(true)
            .setMinValue(1)
        )
    );
  }

  public async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();

    const startingId = interaction.options.getInteger('starting_id');
    let endingId = interaction.options.getInteger('ending_id');
    if (!startingId || !endingId) return;

    const data = await this.container.db.getUserData(interaction.user.id, [
      'club',
    ]);
    if (!data.club! || !data.club[startingId - 1])
      return void interaction
        .editReply({
          embeds: [
            new ErrorEmbed(
              await resolveKey(interaction, LanguageKeys.Errors.ClubEmptyOrNoId)
            ),
          ],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 1000 * 5));

    if (startingId > endingId)
      return void interaction
        .editReply({
          embeds: [
            new ErrorEmbed(
              await resolveKey(
                interaction,
                LanguageKeys.Errors.EndingIdNotHigher
              )
            ),
          ],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 1000 * 5));

    if (endingId > data.club.length) endingId = data.club.length;
    const plrs = data.club
      .slice(startingId - 1, endingId)
      .filter((d) => typeof d === 'string');
    console.log(plrs);
    const values = plrs.map((p: string) =>
      getPlayerSellValue(this.container.players[p].value)
    );
    const total = values.reduce((a, b) => a + b);

    const embed = new RGEmbed(interaction.user).setDescription(
      `${await resolveKey(
        interaction,
        LanguageKeys.Confirmations.SureMultisell
      )}\n\n${plrs
        .map(
          (p) =>
            `\`${this.container.players[p].name} | ${
              this.container.players[p].rating
            } | ${toLocaleString(values[plrs.indexOf(p)])} | ${
              this.container.players[p].type
            }\` ⚠️`
        )
        .join('\n')}\n\n${await resolveKey(
        interaction,
        LanguageKeys.Utils.TotalValue
      )} \`${toLocaleString(total)}\``
    );

    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('confirm-multisell')
        .setLabel('✔️')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('deny-multisell')
        .setLabel('❌')
        .setStyle(ButtonStyle.Secondary)
    );

    const reply = await interaction.followUp({
      embeds: [embed],
      components: [row],
    });

    const collector = reply.createMessageComponentCollector({
      idle: 1000 * 60,
      filter: (i: Interaction) => i.user.id === interaction.user.id,
      max: 1,
    });

    collector.on('collect', async (i: ButtonInteraction) => {
      await i.deferUpdate();

      if (i.customId === 'deny-multisell') {
        i.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.White)
              .setDescription(
                await resolveKey(interaction, LanguageKeys.Utils.SaleCancelled)
              ),
          ],
        });

        interaction.editReply({
          components: [],
        });
        collector.stop();
      } else if (i.customId === 'confirm-multisell') {
        await this.container.db.multisellPlayers(
          interaction.user.id,
          startingId,
          endingId!,
          total
        );

        interaction.editReply({
          components: [],
        });

        const newData = await this.container.db.getUserData(
          interaction.user.id,
          ['money']
        );

        i.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.White)
              .setDescription(
                (
                  await resolveKey(
                    interaction,
                    LanguageKeys.Success.SuccessMultisell
                  )
                )
                  .replace('{amount}', plrs.length.toString())
                  .replace('{value}', toLocaleString(total))
                  .replace('{balance}', toLocaleString(newData.money))
              ),
          ],
        });
      }
    });

    collector.on('end', (_collected, reason) => {
      if (reason === 'idle') {
        row.components[0].setDisabled(true);
        row.components[1].setDisabled(true);
        interaction.editReply({ components: [row] });
      }
    });
  }
}

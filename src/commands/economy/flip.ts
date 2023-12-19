import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from '@discordjs/builders';
import { Colors } from 'discord.js';
import { toLocaleString } from '@lib/utils/toLocaleString';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';

@ApplyOptions<Command.Options>({
  name: 'flip',
  description: 'Bet credits',
  preconditions: [],
  cooldownDelay: 1000 * 60 + 1000 * 30,
  cooldownLimit: 1,
})
export class FlipCommand extends Command {
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
            .setName('tails')
            .setDescription('Pick tails')
            .addIntegerOption((option) =>
              option
                .setName('amount')
                .setDescription('Amount of credits to bet')
                .setRequired(true)
                .setMinValue(100)
                .setMaxValue(2000)
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName('heads')
            .setDescription('Pick heads')
            .addIntegerOption((option) =>
              option
                .setName('amount')
                .setDescription('Amount of credits to bet')
                .setRequired(true)
                .setMinValue(100)
                .setMaxValue(2000)
            )
        )
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const subCommand = interaction.options.getSubcommand(true);
    let amount = interaction.options.getInteger('amount');
    if (!amount) amount = 0;

    const arr =
      subCommand === 'tails'
        ? [...Array(4).fill('tails'), ...Array(6).fill('heads')]
        : [...Array(4).fill('heads'), ...Array(6).fill('tails')];

    const result = arr[Math.floor(Math.random() * arr.length)];
    const win = result === subCommand;

    let embed: EmbedBuilder;

    if (win) {
      embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(
          (await resolveKey(interaction, LanguageKeys.Utils.FlipWin))
            .replace('{result}', subCommand)
            .replace('{value}', toLocaleString(amount))
        );

      await this.container.db.addMoney(interaction.user.id, amount);
    } else {
      embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setDescription(
          (await resolveKey(interaction, LanguageKeys.Utils.FlipLost))
            .replace('{result}', subCommand === 'tails' ? 'heads' : 'tails')
            .replace('{value}', toLocaleString(amount))
        );

      await this.container.db.addMoney(interaction.user.id, -amount);
    }

    return interaction.followUp({
      embeds: [embed],
    });
  }
}

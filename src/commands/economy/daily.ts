import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { CooldownEmbed } from '@lib/structures/CooldownEmbed';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '@lib/i18n/language';

@ApplyOptions<Command.Options>({
  name: 'daily',
  description: 'Claim a daily credit reward',
  preconditions: [],
})
export class DailyCommand extends Command {
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
    if (cooldown)
      return interaction
        .editReply({
          embeds: [await new CooldownEmbed(interaction, cooldown).get()],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 1000 * 5));

    await this.container.db.addMoney(interaction.user.id, 2500);
    const embed = new RGEmbed(interaction.user)
      .setDescription(
        await resolveKey(interaction, LanguageKeys.Success.DailyReward)
      )
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();
    await this.container.db.setCooldown(
      interaction.user.id,
      this.name,
      1000 * 60 * 60 * 24
    );

    return interaction.followUp({
      embeds: [embed],
    });
  }
}

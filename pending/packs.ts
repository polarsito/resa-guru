/* import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { BotEmbed } from '../../lib/structures/BotEmbed';
import { ActionRowBuilder, SelectMenuBuilder } from '@discordjs/builders';
import { getLang } from '../../lib/utils/users';

@ApplyOptions<Command.Options>({
  name: 'packs',
  description: 'Buy and open packs to get multiple cards at once',
  preconditions: ['DevelopmentOnly'],
})
export class PacksCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
    });
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      {
        guildIds: ['1075860905457373194'],
      }
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const embed = new BotEmbed(interaction.user)
      .setTitle(getLang(interaction.locale, 'packShop'))
      .setThumbnail('https://imgur.com/4sD4uov.png')
      .setDescription(getLang(interaction.locale, 'packDescription'));

    const row = new ActionRowBuilder<SelectMenuBuilder>().setComponents(
      new SelectMenuBuilder()
        .setCustomId('packs-menu')
        .setPlaceholder(getLang(interaction.locale, 'packPlaceholder'))
        .setOptions(
          {
            label: 'North America Two Players - 110,000',
            value: 'northamerica',
          },
          {
            label: 'Asia Two Players - 110,000',
            value: 'asia',
          },
          {
            label: 'Africa Two Players - 110,000',
            value: 'africa',
          },
          {
            label: 'South America Two Players - 110,000',
            value: 'southamerica',
          },
          {
            label: 'Europe Two Players - 110,000',
            value: 'europe',
          }
        )
    );

    await interaction.followUp({
      embeds: [embed],
      components: [row],
    });
  }
}
*/

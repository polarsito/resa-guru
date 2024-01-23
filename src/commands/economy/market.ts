import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { join } from 'path';
import sharp from 'sharp';
import { getMarketPlayers } from '@lib/utils/market';
import {
  ActionRowBuilder,
  AttachmentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { get } from 'axios';
import { createCanvas } from 'canvas';

@ApplyOptions<Command.Options>({
  name: 'market',
  description: 'Daily market where you can buy players with discounts',
  preconditions: [],
})
export class MarketCommand extends Command {
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

    const marketImage = join(process.cwd(), 'images', 'market.png');
    //const players = await getMarketPlayers();
    const card = await get('https://imgur.com/uqP4gGD.png', {
      responseType: 'arraybuffer',
    });

    const players = [
      {
        price: 500000,
        discount: 20,
        image: card.data,
      },
    ];

    const canvas = createCanvas(1920, 1003);
    const ctx = canvas.getContext('2d');
    ctx.textDrawingMode = 'path';
    ctx.antialias = 'subpixel';

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Radio Canada';
    ctx.fillText('$500,000', 200, 920);
    ctx.fillText('$500,000', 580, 920);
    ctx.fillText('$500,000', 958, 920);
    ctx.fillText('$500,000', 1340, 920);
    ctx.fillText('$500,000', 1713, 920);

    ctx.fillText(`Refresh on 00:00:00`.toUpperCase(), 958, 250);

    const buffer = canvas.toBuffer();

    const image = sharp(marketImage)
      .composite([
        {
          input: await sharp(players[0].image).resize(280, 439).toBuffer(),
          top: 378,
          left: 65,
        },
        {
          input: await sharp(players[0].image).resize(280, 439).toBuffer(),
          top: 378,
          left: 442,
        },
        {
          input: await sharp(players[0].image).resize(280, 439).toBuffer(),
          top: 378,
          left: 819,
        },
        {
          input: await sharp(players[0].image).resize(280, 439).toBuffer(),
          top: 378,
          left: 1196,
        },
        {
          input: await sharp(players[0].image).resize(280, 439).toBuffer(),
          top: 378,
          left: 1572,
        },
        {
          input: buffer,
          left: 0,
          top: 0,
        },
      ])
      .toFormat('jpg');

    const result = await image.toBuffer();
    const attachment = new AttachmentBuilder(result, {
      name: 'daily-market.jpg',
    });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
      new StringSelectMenuBuilder()
        .setCustomId('buy-market-player')
        .setPlaceholder('Buy from market')
        .setOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('SebzqRodriguez - $500,000')
            .setValue('SebzqRodriguez')
        )
    );

    return interaction.followUp({
      components: [row],
      files: [attachment],
    });
  }
}

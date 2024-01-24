import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { bot } from '@config';
import { getPackSection } from '@lib/utils/packs';
import { getPackInfo } from '@lib/utils/information';
import { RGEmbed } from '@lib/structures/RGEmbed';
import { join } from 'path';
import sharp from 'sharp';
import { ErrorEmbed } from '@lib/structures/ErrorEmbed';
import { toLocaleString } from '@lib/utils/toLocaleString';
import probabilities from '@lib/assets/probabilities.json';
import { getPlayerKey } from '@lib/utils/players';
import { getPlayerSellValue } from '@lib/utils/getPlayerSellValue';
import { getPlayerCard } from '@lib/utils/getPlayerCard';

@ApplyOptions<Command.Options>({
  name: 'packs',
  description: 'Packs system',
  preconditions: [],
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
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommand((subCommand) =>
          subCommand.setName('store').setDescription('Packs store')
        )
        .addSubcommand((subCommand) =>
          subCommand
            .setName('inventory')
            .setDescription("Your pack's inventory")
        )
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();
    const subCmd = interaction.options.getSubcommand(true);

    if (subCmd === 'store') {
      const emojis = bot.emojis;
      const rowMenu =
        new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
          new StringSelectMenuBuilder()
            .setCustomId('packs-menu')
            .setPlaceholder('Select a pack section')
            .setOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel('Promo Packs')
                .setDefault()
                .setEmoji(emojis.packs.promo)
                .setValue('promo'),
              new StringSelectMenuOptionBuilder()
                .setLabel('Gold Packs')
                .setEmoji(emojis.packs.gold)
                .setValue('gold'),
              new StringSelectMenuOptionBuilder()
                .setLabel('Classic Packs')
                .setEmoji(emojis.packs.classic)
                .setValue('classic')
            )
        );

      const rowButtons = new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
          .setCustomId('left-arrow')
          .setEmoji(emojis.arrows.left_arrow)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('right-arrow')
          .setEmoji(emojis.arrows.right_arrow)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('buy-pack')
          .setLabel('Buy')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('pack-info')
          .setEmoji(emojis.info)
          .setStyle(ButtonStyle.Secondary)
      );

      let pack = 0;
      let packData = await getPackSection('promo', pack);
      switch (packData.packs) {
        case 2:
          rowButtons.components[0].setDisabled(true);
          break;

        case 1:
          rowButtons.components[0].setDisabled(true);
          rowButtons.components[1].setDisabled(true);
          break;
      }

      const msg = await interaction.followUp({
        files: [packData.attachment],
        components: [rowButtons, rowMenu],
      });

      const collector = msg.createMessageComponentCollector({
        filter: (i: ButtonInteraction) => i.user.id === interaction.user.id,
        idle: 1000 * 60,
      });

      collector.on('collect', async (collected) => {
        await collected.deferUpdate();

        if (collected.isButton()) {
          switch (collected.customId) {
            case 'left-arrow':
              if (packData.packs >= 3 || pack !== 0) {
                pack--;

                rowButtons.components[1].setDisabled(false);
                if (pack === 0 && packData.packs === 2) {
                  rowButtons.components[0].setDisabled(true);
                }

                packData = await getPackSection(packData.section, pack);

                msg.edit({
                  files: [packData.attachment],
                  components: [rowButtons, rowMenu],
                });
              }
              break;

            case 'right-arrow':
              if (packData.packs >= 3 || pack !== 1) {
                pack++;

                rowButtons.components[0].setDisabled(false);
                if (pack === 1 && packData.packs === 2) {
                  rowButtons.components[1].setDisabled(true);
                }

                packData = await getPackSection(packData.section, pack);

                msg.edit({
                  files: [packData.attachment],
                  components: [rowButtons, rowMenu],
                });
              }
              break;

            case 'pack-info':
              const info = getPackInfo(packData.packName);
              collected.followUp({
                embeds: [info.embed],
                files: [info.attachment],
                ephemeral: true,
              });
              break;

            case 'buy-pack':
              const pName = packData.packName + ' Pack';

              const embed = new RGEmbed().setDescription(
                `Are you sure to buy \`${pName}\` for \`${toLocaleString(
                  packData.price
                )}\`?`
              );

              const confirmRow =
                new ActionRowBuilder<ButtonBuilder>().setComponents(
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('✅')
                    .setCustomId('confirm-buy-pack')
                );

              const reply = await interaction.followUp({
                embeds: [embed],
                components: [confirmRow],
              });

              const colle = reply.createMessageComponentCollector({
                filter: (u: ButtonInteraction) =>
                  u.user.id === interaction.user.id,
                idle: 1000 * 60,
              });

              colle.on('collect', async (col) => {
                if (col.customId === 'confirm-buy-pack') {
                  reply.edit({
                    embeds: [
                      new RGEmbed().setDescription(
                        `<@${
                          interaction.user.id
                        }> successfully bought \`${pName}\` for \`${toLocaleString(
                          packData.price
                        )}\``
                      ),
                    ],
                    components: [],
                  });

                  await this.container.db.buyPack(
                    interaction.user.id,
                    packData.packName,
                    packData.price
                  );
                }
              });
              break;
          }
        } else if (collected.isStringSelectMenu()) {
          pack = 0;
          packData = await getPackSection(collected.values[0], pack);

          switch (collected.values[0]) {
            case 'promo':
              rowMenu.components[0].options[0].setDefault(true);
              rowMenu.components[0].options[1].setDefault(false);
              rowMenu.components[0].options[2].setDefault(false);
              break;

            case 'gold':
              rowMenu.components[0].options[0].setDefault(false);
              rowMenu.components[0].options[1].setDefault(true);
              rowMenu.components[0].options[2].setDefault(false);
              break;

            case 'classic':
              rowMenu.components[0].options[0].setDefault(false);
              rowMenu.components[0].options[1].setDefault(false);
              rowMenu.components[0].options[2].setDefault(true);
              break;
          }

          switch (packData.packs) {
            case 1:
              rowButtons.components[0].setDisabled(true);
              rowButtons.components[1].setDisabled(true);
              break;

            case 2:
              rowButtons.components[0].setDisabled(true);
              rowButtons.components[1].setDisabled(false);
              break;

            default:
              rowButtons.components[0].setDisabled(false);
              rowButtons.components[1].setDisabled(false);
              break;
          }

          msg.edit({
            files: [packData.attachment],
            components: [rowButtons, rowMenu],
          });
        }
      });

      collector.on('end', (_collected, reason) => {
        if (reason === 'idle') {
          rowButtons.components[0].setDisabled(true);
          rowButtons.components[1].setDisabled(true);
          rowButtons.components[2].setDisabled(true);
          rowButtons.components[3].setDisabled(true);
          rowMenu.components[0].setDisabled(true);

          msg.edit({
            components: [rowButtons, rowMenu],
          });
        }
      });
    } else if (subCmd === 'inventory') {
      const packs = await this.container.db.getInventoryPacks(
        interaction.user.id
      );

      if (!packs || Object.keys(packs!)?.length! <= 0)
        return interaction
          .followUp({
            embeds: [new ErrorEmbed("Your pack's inventory is empty")],
          })
          .then((m) => setTimeout(() => m.delete(), 1000 * 5));

      const invBackground = join(
        process.cwd(),
        'images',
        'packs_inventory.png'
      );

      const keys = Object.keys(packs);
      const imgPacks = keys.slice(0, keys.length > 4 ? 4 : keys.length);

      const positions = {
        1: {
          left: 138,
          top: 287,
        },
        2: {
          left: 581,
          top: 287,
        },
        3: {
          left: 1022,
          top: 287,
        },
        4: {
          left: 1463,
          top: 287,
        },
      };

      const graphicPacks = [];

      for (let i = 0; i < imgPacks.length; i++) {
        let packImg: string;
        switch (imgPacks[i].toLowerCase()) {
          case 'icon':
            packImg = join(process.cwd(), 'images', 'icon_pack.png');
            break;

          case 'super gold':
            packImg = join(process.cwd(), 'images', 'super_gold_pack.png');
            break;

          case 'gold':
            packImg = join(process.cwd(), 'images', 'gold_pack.png');

          case 'super silver':
            packImg = join(process.cwd(), 'images', 'super_silver_pack.png');
            break;

          case 'silver':
            packImg = join(process.cwd(), 'images', 'silver_pack.png');
            break;
        }

        graphicPacks.push({
          input: await sharp(packImg).resize(300, 471).toBuffer(),
          top: positions[i + 1].top,
          left: positions[i + 1].left,
        });
      }

      const emojis = {
        Silver: '<:ClassicPacks:1193602511089705041>',
        'Super Silver': '<:ClassicPacks:1193602511089705041>',
        Gold: '<:GoldPacks:1193602514214465676>',
        'Super Gold': '<:GoldPacks:1193602514214465676>',
        Icon: '<:PromoPacks:1193602509789466735>',
      };

      const img = await sharp(invBackground)
        .composite(graphicPacks)
        .toFormat('jpg')
        .toBuffer();

      const attachment = new AttachmentBuilder(img, {
        name: 'packs-inventory.jpg',
      });

      const packsOptions = keys?.map((p) => {
        const pName = p + ' Pack';

        return {
          label: `${pName} (x${packs[p]})`,
          value: p,
          emoji: emojis[p],
        };
      });

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
        new StringSelectMenuBuilder()
          .setCustomId('packs-inv-menu')
          .setPlaceholder('Open a pack')
          .addOptions(packsOptions)
      );

      const msg = await interaction.followUp({
        files: [attachment],
        components: [row],
      });

      const collector = msg.createMessageComponentCollector({
        filter: (i: StringSelectMenuInteraction) =>
          i.user.id === interaction.user.id,
        idle: 1000 * 60,
      });

      collector.on(
        'collect',
        async (collected: StringSelectMenuInteraction) => {
          await collected.deferReply();

          if (collected.customId === 'packs-inv-menu') {
            const pack = collected.values[0];
            let gif: string;

            const reply = await collected.followUp({
              content: `${emojis[pack]} **Opening pack...**`,
            });
            await this.container.db.removePack(interaction.user.id, pack);

            switch (pack.toLowerCase()) {
              case 'icon':
                gif = join(process.cwd(), 'images', 'icon_pack_opening.gif');
                break;

              case 'super gold':
                gif = join(
                  process.cwd(),
                  'images',
                  'super_gold_pack_opening.gif'
                );
                break;

              case 'gold':
                gif = join(process.cwd(), 'images', 'gold_pack_opening.gif');
                break;

              case 'super silver':
                gif = join(
                  process.cwd(),
                  'images',
                  'super_silver_pack_opening.gif'
                );
                break;

              case 'silver':
                gif = join(process.cwd(), 'images', 'silver_pack_opening.gif');
                break;
            }

            const probs = probabilities.packs;
            const keys = Object.keys(probs);

            const players = Object.values(this.container.players);
            const plrs = [];

            for (let i = 0; i < keys.length; i++) {
              const rs = Object.keys(probs[keys[i]]);
              for (let y = 0; y < rs.length; y++) {
                const rr = rs[y].split('-');
                const r1 = Number(rr[0]);
                const r2 = Number(rr[1]);

                players
                  .filter(
                    (p) =>
                      p.rating >= r1 &&
                      p.rating <= r2 &&
                      (pack.toLowerCase() === 'icon' && p.type !== 'ICN'
                        ? false
                        : true)
                  )
                  .forEach((p) => {
                    for (
                      let x = 0;
                      x < probs[keys[i]][Object.keys(probs[keys[i]])[i]];
                      x++
                    ) {
                      plrs.push(getPlayerKey(p.name, p.type));
                    }
                  });
              }
            }

            const pickedPlayer = plrs[Math.floor(Math.random() * plrs.length)];
            const player = this.container.players[pickedPlayer];

            const embed = new RGEmbed()
              .setTitle(`${player.name} joins your club!`)
              .setImage(await getPlayerCard(player))
              .setDescription(
                `Value \`${toLocaleString(
                  player.value
                )}\` -  / Sells for - \`${toLocaleString(
                  getPlayerSellValue(player.value)
                )}\``
              );

            const gifAttachment = new AttachmentBuilder(gif, {
              name: 'pack-opening.gif',
            });

            await reply.edit({
              files: [gifAttachment],
              content: '',
            });

            setTimeout(async () => {
              reply.edit({
                embeds: [embed],
                files: [],
              });

              await this.container.db.addPlayerToClub(
                interaction.user.id,
                getPlayerKey(player.name, player.type)
              );
            }, 4480);
          }
        }
      );

      collector.on('end', (_collected, reason) => {
        if (reason === 'idle') {
          row.components[0].setDisabled(true);
          msg.edit({
            components: [row],
          });
        }
      });
    }
  }
}

import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { match } from '@lib/utils/match';
import { ErrorEmbed } from '@lib/structures/ErrorEmbed';
import { CooldownEmbed } from '@lib/structures/CooldownEmbed';
import { RGEmbed } from '@lib/structures/RGEmbed';

@ApplyOptions<Command.Options>({
  name: 'friendly',
  description: 'Play a friendly match',
  preconditions: [],
})
export class FriendlyCommand extends Command {
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
        .addUserOption((option) =>
          option
            .setName('mention')
            .setDescription('The opponents mention')
            .setRequired(true)
        )
    );
  }

  public async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();

    const cooldown = await this.container.db.checkCooldown(
      interaction.user.id,
      this.name
    );
    if (cooldown && typeof cooldown === 'number') {
      return void interaction.followUp({
        embeds: [new CooldownEmbed(interaction, cooldown)],
      });
    }

    const user = interaction.options.getUser('mention');
    if (!user) return;

    const homeData = await this.container.db.getUserData(interaction.user.id, [
      'clubName',
      'userId',
      'starters',
    ]);

    const opponentData = await this.container.db.getUserData(user.id, [
      'clubName',
      'userId',
      'starters',
    ]);

    if (
      Object.values(homeData?.starters!)?.filter((k) => k !== null).length! < 11
    )
      return void interaction.followUp({
        embeds: [new ErrorEmbed('You need 11 players to play')],
      });

    if (
      Object.values(opponentData?.starters!)?.filter((k) => k !== null)
        .length! < 11
    )
      return void interaction.followUp({
        embeds: [new ErrorEmbed('Your opponent needs 11 players to play')],
      });

    const embed = new RGEmbed()
      .setDescription(
        `\`🟢\` **${
          homeData?.clubName! ?? `${interaction.user.username} FC`
        }** \`0-0\` **${
          opponentData?.clubName! ?? `${user.username} FC`
        }** \`🔴\`\n\nStatus - ***Starting***`
      )
      .addFields(
        {
          name: 'Home',
          value: `Manager: <@${interaction.user.id}>`,
          inline: true,
        },
        {
          name: 'Away',
          value: `Manager: <@${user.id}>`,
          inline: true,
        }
      );

    const matchResult = await match(homeData!, opponentData!);
    let minute = 0;

    const reply = await interaction.followUp({
      embeds: [embed],
    });
    await this.container.db.setCooldown(
      interaction.user.id,
      this.name,
      1000 * 60 * 10
    );

    let p1Goals = 0;
    let p2Goals = 0;
    let lastGoal: string | null = null;
    let skips = 0;

    const interval = setInterval(async () => {
      minute++;

      if (
        Object.values(matchResult.goals).some((arr) => arr.includes(minute))
      ) {
        const goalBy = Object.keys(matchResult.goals).find((k) =>
          matchResult.goals[k].includes(minute)
        );

        let scoredBy = await getPlayerScored(goalBy!);
        if (scoredBy.includes('*')) scoredBy = scoredBy.split('*')[0];

        if (goalBy === interaction.user.id) {
          embed.data.fields![0].value = `${embed.data.fields![0].value}\n${
            p2Goals - p1Goals >= 0 ? '‎\n'.repeat(p2Goals - p1Goals) : ''
          }**${minute}'** :soccer: **${scoredBy}**`;

          skips = lastGoal === interaction.user.id ? skips + 1 : 1;
          lastGoal = interaction.user.id;
          p1Goals++;
        } else {
          embed.data.fields![1].value = `${
            embed.data.fields![1].value
          }\n${'‎\n'.repeat(skips)}**${minute}'** :soccer: **${scoredBy}**`;

          skips = lastGoal === user.id ? skips + 1 : 1;
          lastGoal = user.id;
          p2Goals++;
        }
      }

      embed.setDescription(
        `\`🟢\` **${
          homeData?.clubName! ?? `${interaction.user.username} FC`
        }** \`${p1Goals}-${p2Goals}\` **${
          opponentData?.clubName! ?? `${user.username} FC`
        }** \`🔴\`\n\nStatus - ***${minute}'***`
      );

      if (minute === 45) {
        embed.data.fields![0].value = `${
          embed.data.fields![0].value
        }\n${'‎\n'.repeat(
          lastGoal !== interaction.user.id ? skips : 1
        )}\`--- Half Time ---\``;

        embed.data.fields![1].value = `${
          embed.data.fields![1].value
        }${'‎\n'.repeat(
          lastGoal !== user.id ? skips : 1
        )}\`--- Half Time ---\``;
      }

      if (minute === 90) {
        embed.setDescription(
          `\`🟢\` **${
            homeData?.clubName! ?? `${interaction.user.username} FC`
          }** \`${p1Goals}-${p2Goals}\` **${
            opponentData?.clubName! ?? `${user.username} FC`
          }** \`🔴\`\n\nStatus - ***Full Time***`
        );

        reply.edit({
          embeds: [embed],
        });

        return clearInterval(interval);
      } else {
        reply.edit({
          embeds: [embed],
        });
      }
    }, 750);

    async function getPlayerScored(userId: string): Promise<string> {
      const plrData = userId === interaction.user.id ? homeData : opponentData;
      if (!plrData)
        return (
          userId === interaction.user.id
            ? interaction.user?.username!
            : user?.username!
        ) as string;

      const starters = plrData.starters;
      let players: string[] = [];

      for (let i = 6; i <= 11; i++) {
        if (Object.keys(starters).includes(i.toString())) {
          const plr: string = starters[i.toString()];
          players.push(plr);
        }
      }

      const player = players[Math.floor(Math.random() * players.length)];
      return player;
    }
  }
}

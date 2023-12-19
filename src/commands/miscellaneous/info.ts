import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from '@discordjs/builders';
import { Colors } from 'discord.js';
import { getRealTime } from '../../lib/utils/getRealTime';
import os from 'os';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '../../lib/i18n/language';

@ApplyOptions<Command.Options>({
  name: 'info',
  description: 'Information about the bot',
  preconditions: [],
})
export class FaqsCommand extends Command {
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

  public async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const ramUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    const cpus: os.CpuInfo[] = os.cpus();
    const cpu = cpus[0];

    const total = Object.values(cpu.times).reduce(
      (acc: number, tv: number) => acc + tv,
      0
    );
    const usage = process.cpuUsage();
    const currentCpuUsage = (usage.user + usage.system) / 1000;
    const perc = (currentCpuUsage / total) * 100;

    const embed = new EmbedBuilder()
      .setColor(Colors.White)
      .setThumbnail(this.container.client.user!.displayAvatarURL())
      .setAuthor({
        name: await resolveKey(
          interaction,
          LanguageKeys.Information.GuruInformation
        ),
      })
      .setDescription(
        await resolveKey(interaction, LanguageKeys.Information.UseHelp)
      )
      .addFields(
        {
          name: await resolveKey(interaction, LanguageKeys.Information.BotInfo),
          value: (
            await resolveKey(interaction, LanguageKeys.Information.BotInfoValue)
          )
            .replace(
              '{uptime}',
              getRealTime(this.container.client!.uptime as number).toString()
            )
            .replace('{latency}', this.container.client!.ws.ping.toString()),
        },
        {
          name: await resolveKey(
            interaction,
            LanguageKeys.Information.BotProcessInfo
          ),
          value: (
            await resolveKey(
              interaction,
              LanguageKeys.Information.BotProcessInfoValue
            )
          )
            .replace('{ramUsage}', (Math.round(ramUsed * 100) / 100).toString())
            .replace('{cpuUsage}', perc.toFixed(1)),
        },
        {
          name: await resolveKey(
            interaction,
            LanguageKeys.Information.ExtraInfo
          ),
          value: (
            await resolveKey(
              interaction,
              LanguageKeys.Information.ExtraInfoValue
            )
          ).replace('{guildLink}', 'https://discord.gg/kJAUmmxKF6'),
        }
      );

    return void interaction.followUp({
      embeds: [embed],
    });
  }
}

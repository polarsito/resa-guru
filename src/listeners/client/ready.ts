import type { RESAGuru } from '@lib/structures/RESAGuru';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import chalk from 'chalk';
import { ActivityType } from 'discord.js';

@ApplyOptions<Listener.Options>({
  event: Events.ClientReady,
  name: 'Client Ready',
})
export class ClientReadyListener extends Listener {
  public async run(client: RESAGuru) {
    this.container.logger.info(
      `${chalk.red('[Client]:')} Logged in as ${client.user?.tag}`
    );

    await this.setPresence();
    setInterval(async () => {
      await this.setPresence();
    }, 1000 * 60 * 5);
  }

  async setPresence(): Promise<void> {
    const guilds = await this.container.client.guilds.fetch();
    let users = 0;
    for (const [_s, guild] of guilds) {
      users += (await guild.fetch()).memberCount;
    }
    this.container.client.user?.setPresence({
      status: 'dnd',
      activities: [
        {
          name: `${users.toLocaleString()} users and ${guilds.size.toLocaleString()} servers`,
          type: ActivityType.Watching,
        },
      ],
    });
  }
}

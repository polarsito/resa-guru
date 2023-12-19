import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { ChatInputCommandDeniedPayload, Events } from '@sapphire/framework';
import { Listener, UserError } from '@sapphire/framework';
import { Colors } from 'discord.js';
import { getRealTime } from '@lib/utils/getRealTime';

@ApplyOptions<Listener.Options>({
  event: Events.ChatInputCommandDenied,
  name: 'ChatInputCommandDenied',
})
export class ChatInputCommandDenied extends Listener {
  public async run(
    { context, message: _content, identifier }: UserError,
    { interaction }: ChatInputCommandDeniedPayload
  ): Promise<void> {
    if (Reflect.get(Object(context), 'silent')) return;

    if (identifier! === 'preconditionCooldown') {
      // @ts-ignore
      const remaining = getRealTime(context.remaining);

      return void interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.White)
            .setDescription(
              `There is a cooldown in effect for this chat input command. It'll be available in ${remaining}`
            ),
        ],
        ephemeral: true,
        allowedMentions: { repliedUser: false },
      });
    }
  }
}

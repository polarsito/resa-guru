import { CooldownEmbed } from '@lib/structures/CooldownEmbed';
import { ErrorEmbed } from '@lib/structures/ErrorEmbed';
import { ApplyOptions } from '@sapphire/decorators';
import { ChatInputCommandDeniedPayload, Events } from '@sapphire/framework';
import { Listener, UserError } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
  event: Events.ChatInputCommandDenied,
  name: 'ChatInputCommandDenied',
})
export class ChatInputCommandDenied extends Listener {
  public async run(
    error: UserError,
    { interaction }: ChatInputCommandDeniedPayload
  ) {
    if (Reflect.get(Object(error.context), 'silent')) return;

    switch (error.identifier!) {
      case 'preconditionCooldown':
        const embed = await new CooldownEmbed(
          interaction,
          // @ts-ignore
          error.context.remaining
        ).get();

        interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
        break;

      case 'DeveloperOnly':
        interaction.reply({
          embeds: [new ErrorEmbed(error.message)],
          ephemeral: true,
        });
        break;
    }
  }
}

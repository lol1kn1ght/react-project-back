import { MessageEmbed, type CommandInteraction } from 'discord.js';
import { type Interaction_settings, args_type } from '../../types';
import { InteractionTemplate } from '../../config/templates_list';
import { time } from '@discordjs/builders';

export const settings: Readonly<Interaction_settings> = {
  interaction: {
    name: 'status',
    description: 'Просмотреть статус бота',
  },
};

export class Execute extends InteractionTemplate {
  constructor(
    private args: args_type,
    private interaction: CommandInteraction
  ) {
    super(interaction);
    this.execute();
  }

  async execute() {
    try {
      const status_embed = new MessageEmbed({
        title: `Статус бота ${this.args.client.user?.tag}:`,
        color: this.interaction.guild?.me?.roles.highest.color,
        fields: [
          {
            name: '🕰️Время запуска:',
            value: `${time(new Date(this.args.client.readyTimestamp!), 'R')}`,
            inline: true,
          },
          {
            name: '🏓Пинг:',
            value: F.number_discharge(this.args.client.ws.ping),
            inline: true,
          },
          {
            name: '📝/-комманды:',
            value: `${F.number_discharge(Bot.interaction_commands.size)}`,
            inline: false,
          },
          {
            name: '📎Комманды сообщений:',
            value: `${F.number_discharge(Bot.message_commands.size)}`,
            inline: true,
          },
        ],
        thumbnail: {
          url: this.args.client.user?.displayAvatarURL(),
        },
      });

      return this.interaction.editReply({
        embeds: [status_embed],
      });
    } catch (err) {
      F.handle_error(<Error>err, `/-команда ${this.interaction.commandName}`);
      return this.replyFalseH(
        `При выполнении команды возникла ошибка. Обратитесь к <@${F.config.owner}>`
      );
    }
  }
}

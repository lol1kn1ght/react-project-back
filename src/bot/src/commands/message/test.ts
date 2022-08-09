import { Message } from 'discord.js';
import { type Message_command_settings, args_type } from '../../types';
import { Message_template } from '../../config/templates_list';

export const settings: Readonly<Message_command_settings> = {
  name: 'test',
  description: 'EXAMPLE',
};

export class Execute extends Message_template {
  constructor(private args: args_type, private message: Message) {
    super(message);
    this.execute();
  }

  async execute() {
    this.message.reply('Test interactions');
  }
}

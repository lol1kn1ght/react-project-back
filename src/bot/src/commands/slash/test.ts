import { GuildMember, type CommandInteraction } from 'discord.js';
import { type Interaction_settings, args_type } from '../../types';
import { InteractionTemplate } from '../../config/templates_list';
import parse_duration from 'parse-duration';

export const settings: Readonly<Interaction_settings> = {
  interaction: {
    name: 'test',
    description: 'EXAMPLE',
  },
  permissions: {
    custom_permissions: 'OWNER',
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
    this.replyTrue('тест успешен');
  }
}

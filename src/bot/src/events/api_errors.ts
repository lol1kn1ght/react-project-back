import { APIErrors, CommandInteraction } from 'discord.js';
import { args_type, Event_settings } from '../types';

export const settings: Readonly<Event_settings> = {
  name: 'error',
  description: '',
};

export class Execute {
  constructor(private args: args_type, private err: Error) {
    this.execute();
  }

  async execute() {
    F.handle_error(this.err, 'API');
  }
}

import {
  CommandInteraction,
  GuildChannel,
  GuildMember,
  GuildMemberRoleManager,
  Permissions,
  TextChannel,
} from 'discord.js';
import { args_type, Event_settings } from '../types';
import { InteractionTemplate } from '../config/templates_list';

export const settings: Readonly<Event_settings> = {
  name: 'interactionCreate',
  description: '',
};

export class Execute extends InteractionTemplate {
  constructor(
    private args: args_type,
    private interaction: CommandInteraction
  ) {
    super(interaction);
    this.execute();
  }

  async execute(): Promise<boolean> {
    if (this.interaction.isSelectMenu()) return false;
    const interaction = this.interaction;

    if (interaction.isContextMenu()) {
      if (
        !(this.interaction.member as GuildMember)!
          .permissionsIn(this.interaction.channel as TextChannel)
          ?.has('SEND_MESSAGES')
      )
        return this.response('У вас недостаточно прав для этого действия.');
    }

    F.Logger.log(
      `[interactionCreate] Вызвана /-команда ${interaction.commandName} игроком ${interaction.user.id}, на сервере ${interaction.guildId}, в канале ${interaction.channelId}`
    );

    const command_name = interaction.commandName;
    const Command = Bot.interaction_commands.get(command_name);
    if (!Command) return false;
    const { Execute, settings } = Command;
    const command_permissions = settings.permissions;

    if (command_permissions) {
      const { dev } = F.config;

      let {
        custom_permissions,
        allowed_roles,
        allowed_channels,
        restricted_channels,
        restricted_roles,
        permissions
      } = command_permissions;

      if (dev) {
        const {
          dev_custom_permissions,
          dev_allowed_channels,
          dev_allowed_roles,
          dev_restricted_channels,
          dev_restricted_roles,
          dev_permissions
        } = command_permissions;

        custom_permissions = dev_custom_permissions;
        allowed_channels = dev_allowed_channels;
        allowed_roles = dev_allowed_roles;
        restricted_channels = dev_restricted_channels;
        restricted_roles = dev_restricted_roles;
        permissions = dev_permissions;

      }

      const member = interaction.member;
      if (custom_permissions != 'OWNER') {
        const member_roles = <GuildMemberRoleManager>member?.roles;

        const member_allowed_roles = member_roles.cache.filter(
          (role_id) => allowed_roles?.includes(role_id.id) || false
        );
        const member_restricted_roles = member_roles.cache.filter(
          (role_id) => restricted_roles?.includes(role_id.id) || false
        );

        let has_permission: boolean | undefined;

        if (permissions && member?.permissions) {
          has_permission = !!permissions.filter(permission => (member.permissions as Readonly<Permissions>).has(permission))[0];
        }

        if (allowed_roles && allowed_roles[0]) {
          if (!member_allowed_roles.first() && !permissions)
            return this.response(
              'You dont have permission for this action (1)'
            );
        }

        if (restricted_roles && restricted_roles[0]) {
          if (member_restricted_roles.first() && !member_allowed_roles.first())
            return this.response(
              'You dont have permission for this action (2)'
            );
        }
      }

      if (custom_permissions === 'OWNER') {
        if (interaction.member?.user.id != F.config.owner)
          return this.response('You dont have permission for this action (3)');
      }

      if (allowed_channels && allowed_channels[0]) {
        if (!allowed_channels.includes(interaction.channel!.id))
          return this.response('You can not do this in this channel');
      }

      if (restricted_channels && restricted_channels[0]) {
        if (
          !allowed_channels?.includes(interaction.channel!.id) &&
          restricted_channels.includes(interaction.channel!.id)
        )
          return this.response('You can not do this action in this channel(2)');
      }
    }
    interaction.deferReply().then(() => new Execute(this.args, interaction));
    return true;
  }

  async response(content: string) {
    this.replyFalseH(content);
    return false;
  }
}

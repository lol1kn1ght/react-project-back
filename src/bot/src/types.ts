import {
  Client,
  Collection,
  CommandInteraction,
  Message,
  PermissionString,
} from 'discord.js';
import { Db, MongoClient } from 'mongodb';

type Custom_permissions = 'OWNER' | 'TESTER';

type Command_permissions = {
  permissions?: PermissionString[];
  restricted_roles?: string[];
  allowed_roles?: string[];
  restricted_channels?: string[];
  allowed_channels?: string[];
  custom_permissions?: Custom_permissions;

  dev_permissions?: PermissionString[];
  dev_restricted_roles?: string[];
  dev_allowed_roles?: string[];
  dev_restricted_channels?: string[];
  dev_allowed_channels?: string[];
  dev_custom_permissions?: Custom_permissions;
};
export interface Bot_Builder {
  /** Список команд по сообщениям */
  message_commands: Collection<string, Message_command>;
  /** Список /-команд */
  interaction_commands: Collection<string, Interaction_command>;
  /** Дискорд аккаунт бота */
  client: Client;
  /** База данных */
  mongo: MongoClient;

  /** Презагрузить все эвенты */
  load_events(): Promise<void>;
  /** Перезагрузить все команды */
  load_commands(): Promise<void>;
}

// export type Interaction_command = {
//   /** Опции для /-команды */
//   settings: Interaction_settings;
//   execute: (args: args_type, interaction: CommandInteraction) => Promise<void>;
// };

export type Interaction_command = {
  settings: Interaction_settings;
  Execute: Interaction_execute;
};

type Interaction_execute = {
  new (args: args_type, interaction: CommandInteraction): void;
  execute(): Promise<void>;
};

export type Interaction_settings = {
  interaction: {
    name: string;
    description?: string;
    options?: optionType[];
    /**
     * 1 - CHAT_INPUT (default)
     * 2 - USER
     * 3 - MESSAGE
     */
    type?: 1 | 2 | 3;
  };
  permissions?: Command_permissions;
};

export type Message_command_settings = {
  name: string;
  description: string;
  permissions?: Command_permissions;
};

export abstract class Message_command {
  abstract settings: Message_command_settings;
  abstract execute(args: args_type, message: Message): Promise<any>;
}

type choice_type = {
  name: string;
  value: string;
};

type optionType = {
  description: string;
  name: string;
  /**
   * 3 - STRING
   * 4 - INTEGER (Целое число)
   * 5 - BOOLEAN
   * 6 - USER
   * 7 - CHANNEL
   * 8 - ROLE
   * 9 - MENTIONABLE
   * 10 - NUMBER (Дробное число)
   * 11 - ATTACHMENT
   */
  type: 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  required?: boolean;
  choices?: choice_type[];
};

export type Event_type = {
  settings: Event_settings;
  Execute: Event_execute;
};

interface Event_execute {
  new (command_args: args_type, ...args: any): void;
  execute(): Promise<void>;
}

export type Event_settings = {
  name:
    | 'apiRequest'
    | 'apiResponse'
    | 'applicationCommandCreateD'
    | 'applicationCommandDeleteD'
    | 'applicationCommandUpdateD'
    | 'channelCreate'
    | 'channelDelete'
    | 'channelPinsUpdate'
    | 'channelUpdate'
    | 'debug'
    | 'emojiCreate'
    | 'emojiDelete'
    | 'emojiUpdate'
    | 'error'
    | 'guildBanAdd'
    | 'guildBanRemove'
    | 'guildCreate'
    | 'guildDelete'
    | 'guildIntegrationsUpdate'
    | 'guildMemberAdd'
    | 'guildMemberAvailable'
    | 'guildMemberRemove'
    | 'guildMembersChunk'
    | 'guildMemberUpdate'
    | 'guildScheduledEventCreate'
    | 'guildScheduledEventDelete'
    | 'guildScheduledEventUpdate'
    | 'guildScheduledEventUserAdd'
    | 'guildScheduledEventUserRemove'
    | 'guildUnavailable'
    | 'guildUpdate'
    | 'interactionD'
    | 'interactionCreate'
    | 'invalidated'
    | 'invalidRequestWarning'
    | 'inviteCreate'
    | 'inviteDelete'
    | 'messageD'
    | 'messageCreate'
    | 'messageDelete'
    | 'messageDeleteBulk'
    | 'messageReactionAdd'
    | 'messageReactionRemove'
    | 'messageReactionRemoveAll'
    | 'messageReactionRemoveEmoji'
    | 'messageUpdate'
    | 'presenceUpdate'
    | 'rateLimit'
    | 'ready'
    | 'roleCreate'
    | 'roleDelete'
    | 'roleUpdate'
    | 'shardDisconnect'
    | 'shardError'
    | 'shardReady'
    | 'shardReconnecting'
    | 'shardResume'
    | 'stageInstanceCreate'
    | 'stageInstanceDelete'
    | 'stageInstanceUpdate'
    | 'stickerCreate'
    | 'stickerDelete'
    | 'stickerUpdate'
    | 'threadCreate'
    | 'threadDelete'
    | 'threadListSync'
    | 'threadMembersUpdate'
    | 'threadMemberUpdate'
    | 'threadUpdate'
    | 'typingStart'
    | 'userUpdate'
    | 'voiceStateUpdate'
    | 'warn'
    | 'webhookUpdate'
    | 'raw'
    | 'EXAMPLE';
  description: string;
};

export type args_type = {
  client: Client;
  db: Db;
};

export type mongodb_url_type = {
  url: string;
  db: string;
  ip: string;
  pass: string;
  port: number;
};

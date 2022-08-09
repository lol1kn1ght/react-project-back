import 'colors';
import './prototypes';
import { readdirSync, readFileSync } from 'fs';
import {
  Event_type,
  Message_command,
  args_type,
  Interaction_command,
  mongodb_url_type,
} from './types';
import { Collection, Client, Intents } from 'discord.js';
import { dev_token, token, dev_mongo, mongo } from './config/constants.json';
import { modules_settings, socket_port } from './config/config.json';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as config from './config/config.json';
import { MongoClient } from 'mongodb';
import './cli';
import { createServer } from 'http';
import { Server } from 'socket.io';

type modified_client = {
  _events: {
    shardDisconnect: () => void;
  };
};

const https_server = createServer({
  // key: readFileSync('../../../ssl/localhost.key'),
  // cert: readFileSync('../../../ssl/localhost.crt'),
});

export const io = new Server(https_server);

io.on('connection', (socket) => {
  console.log('НОВОЕ ПОДКЛЮЧЕНИЕ');
});

https_server.listen(3002, () => {
  console.log('\nSocket запущен на порту 3002\n');
  global.Bot = new Bot_Builder();
});

class Bot_Builder implements Bot_Builder {
  message_commands: Collection<string, Message_command> = new Collection();
  interaction_commands: Collection<string, Interaction_command> =
    new Collection();
  message_commands_stats: string[][] = [];
  interaction_commands_stats: string[][] = [];
  client = <Client & modified_client>new Client({
    intents: Object.values(Intents.FLAGS),
  });
  mongo: MongoClient = new MongoClient(this.get_mongo_connection_url().url);

  constructor() {
    this.launch();
  }
  private async launch() {
    console.log('Запуск Бота'.green);
    console.time('Запуск Бота'.green);
    await this.connect_db();
    await this.load_commands();
    console.log();
    await this.load_events();
    await this.login();
    console.log();
    console.groupEnd();
    if (F.config.cli_settings.listener.value) F.Chagnes_Listener.setup();
    console.log();
    await this._push_slash_commands();
    console.log();
    console.timeEnd('Запуск Бота'.green);
    console.log();
  }

  async connect_db(): Promise<void> {
    console.group();
    console.log('Подключение к базе данных');
    console.group();
    try {
      await this.mongo.connect();
      const { ip, port } = this.get_mongo_connection_url();
      console.log(`Успешно подключен к базе данных: ${ip}: ${port}`.green);
    } catch (err) {
      console.error(
        `При подключении к базе данных произошла ошибка: ${
          (<Error>err).message
        }`
      );
      console.error(err);
      throw err;
    }
    console.groupEnd();
    console.log('Подключение к базе данных закончено');
    console.groupEnd();
  }

  private get_mongo_connection_url(): mongodb_url_type {
    const { dev } = config;
    const mongo_config = dev ? dev_mongo : mongo;

    if (mongo_config.auth) {
      const { user, pass, ip, port, db } = mongo_config;
      const url = `mongodb://${user}:${pass}@${ip}:${port}/${db}`;
      return { url, db, ip, pass, port };
    } else {
      const url = 'mongodb://localhost:27017';
      return { url, db: 'gtaEZ', ip: 'localhost', pass: '', port: 27017 };
    }
  }

  async load_events(): Promise<void> {
    console.group();
    console.log('Загрузка эвентов');
    const events_files = await readdirSync('./events');
    console.group();
    this.client._events = {
      shardDisconnect: this.client._events.shardDisconnect,
    };

    for (const event_file of events_files) {
      try {
        if (!event_file.endsWith('.js')) continue;
        const cache = require.cache[require.resolve(`./events/${event_file}`)];
        if (cache)
          delete require.cache[require.resolve(`./events/${event_file}`)];

        const Event: Event_type = await import(`./events/${event_file}`);
        if (Event.settings.name === 'EXAMPLE')
          throw new Error('Стандартное название эвента не изменено');

        const command_args: args_type = {
          client: this.client,
          db: this.mongo.db('gtaEZ'),
        };
        const exec_function = (args: args_type, ...other: any[]) => {
          new Event.Execute(args, ...other);
        };

        this.client.on(
          <string>Event.settings.name,
          exec_function.bind(null, command_args)
        );

        console.log(
          `+ Успешно загружен эвент ${event_file} [${Event.settings.name}]`
            .green
        );
      } catch (err) {
        console.error(
          `- Ошибка при загрузке файла ${event_file} ` +
            (<Error>err).message.red
        );
      }
    }

    console.groupEnd();
    console.log('Загрузка эвентов закончена');
    console.log();
  }

  async load_commands() {
    console.group();
    console.log('Загрузка команд');
    if (modules_settings.message) {
      console.group();

      console.log('Загрузка комманд: сообщения');
      await this._load_message_commands();
      console.log('Загрузка комманд: сообщения закончена');
      console.log();

      console.groupEnd();
    }

    if (modules_settings.slash) {
      console.group();
      console.log('Загрузка комманд: интеракшионы');
      await this._load_slash_commands();
      console.log('Загрузка комманд: интеракшионы закончена');
      console.groupEnd();

      // if (this.client.user) {
      //   console.log();
      //   await this._push_slash_commands();
      //   console.log();
      // }
    }
    console.log('Загрузка команд закончена');
    console.groupEnd();
  }

  private async _load_message_commands() {
    console.group();

    this.message_commands = new Collection();
    console.log('Команды по сообщениям');
    try {
      const commands_folder = await readdirSync('./commands/message');
      console.group();

      for (const file_name of commands_folder) {
        if (!file_name.endsWith('.js')) continue;

        try {
          const cache =
            require.cache[require.resolve(`./commands/message/${file_name}`)];
          if (cache)
            delete require.cache[
              require.resolve(`./commands/message/${file_name}`)
            ];

          const Command: Message_command = await import(
            `./commands/message/${file_name}`
          );

          const { settings } = Command;
          let command_name = settings.name;
          this.message_commands.set(command_name, Command);

          const command_aliases = command_name.split(' ');
          if (command_aliases.length > 1) {
            command_name = `${command_aliases[0]} (+${
              command_aliases.length - 1
            })`;
          }
          console.log(`+ Успешно загружена команда: ${command_name}`.green);
        } catch (err) {
          console.error(
            `- Ошибка при загрузке файла ${file_name} ` +
              (<Error>err).message.red
          );
          console.error(err);

          this.message_commands_stats.push(['', file_name, 'ошибка'.red]);
        }
      }

      console.groupEnd();
    } catch (err) {
      console.error((<Error>err).message.red);
    }

    console.log('Команды по сообщениям');
    console.groupEnd();
  }

  private async _load_slash_commands() {
    console.group();
    console.log('Команды по интеракшионам');
    this.interaction_commands = new Collection();

    try {
      const commands_folder = await readdirSync('./commands/slash');

      console.group();
      for (const command_file of commands_folder) {
        if (!command_file.endsWith('.js')) continue;

        try {
          const cache =
            require.cache[require.resolve(`./commands/slash/${command_file}`)];
          if (cache)
            delete require.cache[
              require.resolve(`./commands/slash/${command_file}`)
            ];

          const Command = await import(`./commands/slash/${command_file}`);

          const { settings } = <Interaction_command>Command;

          this.interaction_commands.set(settings.interaction.name, Command);

          console.log(
            `+ Успешно загружена /-команда ${settings.interaction.name}`.green
          );
        } catch (err) {
          console.error(
            `- Ошибка при загрузке файла ${command_file} ` +
              (<Error>err).message.red
          );
          console.error(err);
          this.message_commands_stats.push(['', command_file, 'ошибка'.red]);
        }
      }
      console.groupEnd();
    } catch (err) {
      console.error((<Error>err).message.red);
    }
    console.log('Команды по интеракшионам');
    console.groupEnd();
  }

  private async login() {
    await this.client.login(config.dev ? dev_token : token);
    console.log(`${this.client.user?.tag} Успешно запущен`.green);
    console.log();
  }

  private async _push_slash_commands() {
    console.log('Инициализация комманд на сервер');
    console.group();

    const rest = new REST({
      version: '9',
    }).setToken(config.dev ? dev_token : token);

    try {
      console.log('Начал загрузку /-команд.');

      const commands_list = this.interaction_commands.map(
        (c) => c.settings.interaction
      );

      if (this.client.user)
        await rest.put(
          Routes.applicationGuildCommands(
            this.client.user.id,
            F.config.guild_id
          ),
          {
            body: commands_list,
          }
        );

      console.log('Успешно загрузил /-команды.'.green);
    } catch (err) {
      console.error('Ошибка при инциализации /-команд:'.red);
      console.error((<Error>err).message.red);
      console.error(err);
    }

    console.groupEnd();
    console.log('Инициализация комманд на сервер');
  }
}

import { CommandInteraction, GuildChannel } from 'discord.js';
import { args_type, Event_settings } from '../types';
import http from 'http';
import fs from 'fs';

export const settings: Readonly<Event_settings> = {
  name: 'ready',
  description: '',
};

export class Execute {
  constructor(private args: args_type) {
    this.execute();
  }

  async execute() {
    console.log(`\n${Bot.client.user!.tag} Запущен успешно.`);

    const logs_channel = Bot.client.channels.cache.get('432890572269813760');
    if (logs_channel && logs_channel.isText()) logs_channel.send('Запустился');

    const server = http.createServer(function (req, res) {
      res.writeHead(200);
      res.end();
    });
    server.listen(7072);
    const guild = Bot.client.guilds.cache.get('314105293682376707');

    setInterval(function () {
      if (!guild) return;
      const online = guild.members.cache.filter(
        (member) => !!(member.presence && member.presence.clientStatus != null)
      ).size;
      const voice = guild.members.cache.filter(
        (member) => !!member.voice.channel
      ).size;
      const date = new Date();
      const daten = `${date.getDate()}.${
        date.getMonth() + 1
      }.${date.getFullYear()}`;
      const text = `\n[${
        date.getHours() + 3
      }:${date.getMinutes()}:${date.getSeconds()}] ${
        guild.memberCount
      }:${online}:${voice}`;
      //console.log(text);
      fs.access(`./data/stat_logs/${daten}.txt`, function (error) {
        if (error) {
          fs.appendFile(
            `./data/stat_logs/${daten}.txt`,
            `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] Начато логирование статистики.\n[Время] Всего:Онлайн:Подключено` +
              text,
            function (error) {
              if (error) console.log(error);
            }
          );
        } else {
          fs.appendFile(
            `./data/stat_logs/${daten}.txt`,
            text,
            function (error) {
              if (error) console.log(error);
            }
          );
        }
      });
    }, 15 * 60 * 1000);

    const muted_users = await this.args.db
      .collection('users')
      .find({
        'muted.is': true,
      })
      .toArray();

    for (const user of muted_users) {
      F.muted_members[user.login] = user.muted.till;
    }

    type domain_type = { domains: string[] };

    const utils_db = this.args.db.collection('utils');
    const domains_data: domain_type =
      (await utils_db.findOne<domain_type>({
        name: 'domains',
      })) || ({} as domain_type);

    F.domains = domains_data.domains;
  }
}

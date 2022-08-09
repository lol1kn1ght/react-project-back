import { Request, Response } from 'express';
import { decrypt } from '../../../functions/decrypt';
import {
  api_guild_type,
  def_api_req_data,
  headers_type,
  session_id_type,
} from '@server/types';
import { Route_template } from '../../route_template';
import axios from 'axios';
import { socket } from '../../../server';
import { io } from 'socket.io-client';

type api_guilds_type = Partial<def_api_req_data>;

export class GuildsRouter extends Route_template {
  constructor(private req: Request, private res: Response) {
    super(req, res);
  }

  async get_guilds() {
    const headers = this.req.headers as headers_type;

    if (!headers || !headers.authorisation) {
      this.response_err({
        message: 'Данные для авторизации не указаны',
        code: 401,
      });
      return;
    }

    const session_data = decrypt<session_id_type>(headers.authorisation);

    if (!session_data) {
      this.response_err({
        message: 'Данные для авторизации указаны неверно',
        code: 401,
      });
      return;
    }

    const { expired_at, token, member_id } = session_data;
    if (!expired_at || !token || !member_id) {
      this.response_err({
        code: 400,
        message: 'Данные указаны некорректно',
      });
      return;
    }

    const guilds_response = await axios
      .get('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((err) => {
        return undefined;
      });

    if (!guilds_response) {
      this.response_err({
        code: 404,
        message: 'Для указанного участника не найдены сервера',
      });
      return;
    }

    const guilds_data = guilds_response.data as api_guild_type[] | undefined;

    if (!guilds_data) {
      this.response_err({
        code: 404,
        message: 'Для указанного участника не найдены сервера',
      });
      return;
    }
    console.log(socket);

    socket.send({
      function_name: 'get_guilds',
      args: {
        guilds: guilds_data.map((guild) => guild.id),
        member_id,
      },
    });

    socket.on('message', (message: { data: api_guild_type[] }) => {
      console.log(message);
    });

    // if (!result_data) {
    //   this.response_err({
    //     code: 500,
    //     message: 'При обработке списка серверов произошла ошибка',
    //   });
    //   return;
    // }

    // this.response({
    //   data: result_data,
    //   code: 200,
    // });
  }
}

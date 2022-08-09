import { Request, Response } from 'express';
import {
  db_user_type,
  api_user_data_type,
  api_autorise_data_type,
  session_id_type,
} from '@server/types';
import { Route_template } from '../../route_template';
import { db } from '../../../server';
import axios from 'axios';
import crypto from 'crypto-js';
import duration from 'parse-duration';
import { hash_key } from '../../../../config/constants.json';

export class LoginRoute extends Route_template {
  constructor(private req: Request, private res: Response) {
    super(req, res);
    this.validate();
  }

  async validate() {
    const data = this.req.body as api_autorise_data_type;

    const { access_token, token_type } = data;

    if (!access_token || !token_type) {
      this.response_err({
        code: 400,
        message: 'Одно из полей указано неверно',
      });
      return;
    }

    if (typeof access_token != 'string' || typeof token_type != 'string') {
      this.response_err({
        code: 400,
        message: 'Переданные данные указаны в неверном типе',
      });
      return;
    }

    if (access_token.length === 0 || token_type.length === 0) {
      this.response_err({
        code: 400,
        message: 'Переданные данные указаны неверно',
      });
      return;
    }

    this.register(data);
  }

  async register(data: api_autorise_data_type) {
    const { access_token, token_type } =
      data as Required<api_autorise_data_type>;

    const user_api_data = (await axios
      .get('https://discord.com/api/v10/users/@me', {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      })
      .catch((err) => {
        console.log(err.body);
      })) as unknown as { data?: api_user_data_type };

    const user = user_api_data.data;
    const users_collection = db.collection('users');

    if (!user) {
      this.response_err({
        code: 404,
        message: 'Указан несуществующий пользователь',
      });
      return;
    }

    const user_data = (await users_collection.findOne(
      {
        login: user?.id,
      },
      {
        projection: {
          _id: 0,
        },
      }
    )) as db_user_type | null;

    const session_id: session_id_type = {
      token: access_token,
      expired_at: new Date().getTime() + duration('1w'),
      member_id: user.id,
    };
    const enc_session_id = crypto.AES.encrypt(
      JSON.stringify(session_id),
      hash_key
    ).toString();

    const response_data = {
      session_id: enc_session_id,
      db_user_data: user_data,
      api_user_data: user,
    };

    if (user_data) {
      this.response({
        code: 200,
        data: response_data,
      });
    } else {
      const new_data: db_user_type = {
        login: user.id,
        session_id: enc_session_id,
        token: access_token,
      };

      response_data.db_user_data = new_data;
      await users_collection.insertOne(new_data);

      this.response({
        code: 200,
        data: response_data,
      });
    }
  }
}

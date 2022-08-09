import { NextFunction, Request, Response } from 'express';
import { headers_type, session_id_type } from '@server/types';
import { decrypt } from './decrypt';
import { db } from '../../server/server';

export async function check_authorisation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const headers = req.headers as headers_type;

  if (!headers || !headers.authorisation) {
    res.status(401);
    res.send({
      message: 'Данные для авторизации не указаны',
    });
    return;
  }

  const decrypted_header = decrypt<session_id_type>(headers.authorisation);

  if (!decrypted_header) {
    res.status(401);
    res.send({
      message: 'Данные для авторизации не указаны',
    });
    return;
  }

  const { expired_at, token } = decrypted_header;

  if (!expired_at || !token) {
    res.status(401);
    res.send({
      message: 'Данные для авторизации указаны некорректно',
    });
    return;
  }

  if (expired_at < new Date().getTime()) {
    res.status(401);
    res.send({
      message: 'Ваша сессия истекла, авторизируйтесь снова',
    });
    return;
  }

  if (token != 'authorisation') {
    const user_data =
      (await db
        .collection('users')
        .find(
          {
            token,
          },
          {
            projection: {
              _id: 0,
              login: 1,
            },
          }
        )
        .toArray()) || [];

    console.log(user_data);

    if (!user_data[0]) {
      res.status(401);
      res.send({
        message: 'Указан некорректный токен',
      });
      return;
    }
  }

  next();
}

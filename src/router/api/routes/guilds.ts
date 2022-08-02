import { Request, Response } from 'express';
import { api_guild_type, def_api_req_data } from 'types';
import { Route_template } from '../../route_template';

type api_guilds_type = Partial<def_api_req_data>;

export class GuildsRouter extends Route_template {
  constructor(private req: Request, private res: Response) {
    super(req, res);
  }

  async get_guilds() {
    const data = this.req.body as api_guilds_type;

    const { session_id } = data;
    const { expired_at, token } = session_id || {};

    if (!expired_at || !token) {
      this.response_err({
        code: 400,
        message: 'Данные указаны некорректно',
      });
      return;
    }
  }
}

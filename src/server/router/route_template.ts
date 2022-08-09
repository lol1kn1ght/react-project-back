import { Request, Response } from 'express';

type err_response_type = {
  code: number;
  message: string;
};

type response_type<T extends object> = {
  code: number;
  data: T;
};

export class Route_template {
  constructor(private _req: Request, private _res: Response) {}

  response_err(response_data: err_response_type) {
    const { code, message } = response_data;
    this._res.status(code);
    this._res.send({ message });
  }

  response<T extends object>(response_data: response_type<T>) {
    const { code, data } = response_data;
    this._res.status(code);
    this._res.send(data);
  }
}

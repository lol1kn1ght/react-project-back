import { app } from '../server';
import { Router } from 'express';
import { api_router } from './api/api';

const router = Router();

export class router_handler {
  bind_routes() {
    app.use('/api', api_router);

    app.get('*', function (req, res) {
      res.status(404);
      res.send('Указан неверный путь запроса');
    });
  }
}

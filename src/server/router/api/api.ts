import { Router } from 'express';
import { GuildsRouter } from './routes/guilds';
import { LoginRoute } from './routes/login';

const api_router = Router();

api_router.post('/login', (req, res) => {
  new LoginRoute(req, res);
});

api_router.get('/guilds', (req, res) => {
  new GuildsRouter(req, res).get_guilds();
});

export { api_router };

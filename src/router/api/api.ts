import { Router } from 'express';

const api_router = Router();

api_router.post('/login', (req, res) => {
  const data = req.body;

  console.log(data);

  res.status(200);
  res.send('ABOBA');
});

export { api_router };

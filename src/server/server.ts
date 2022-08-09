import { MongoClient, ServerOptions } from 'mongodb';
import constants from '../config/constants.json';
import { connection_url_type } from './types';
import express from 'express';
import { server as server_config } from '../config/config.json';
import { router_handler } from './router/index';
import cors from 'cors';
import { json } from 'body-parser';
import { createServer } from 'https';
import { readFileSync } from 'fs';
import { check_authorisation } from './functions/check-authorisation';
import { exec } from 'child_process';
import { io } from 'socket.io-client';

export const socket = io('https://localhost:3002');

console.log('Сокет успешно подключен');

const { port } = server_config;

function _get_db_connection_url(): connection_url_type {
  const { dev, dev_db, db } = constants;
  const mongo_config = dev ? dev_db : db;

  if (mongo_config.auth) {
    const { user, pass, ip, port, db } = mongo_config;
    const url = `mongodb://${user}:${pass}@${ip}:${port}/${db}`;
    return { url, db, ip, pass, port };
  } else {
    const url = 'mongodb://localhost:27017';
    return {
      url,
      db: 'react-project',
      ip: 'localhost',
      pass: '',
      port: 27017,
    };
  }
}

export const mongo = new MongoClient(_get_db_connection_url().url);
export const db = mongo.db('react-project');

export const app = express();

app.use(cors({ origin: ['https://localhost:3000', 'http://localhost:3000'] }));
app.use(check_authorisation);
app.use(json());

const server_options: Partial<ServerOptions> = {
  key: readFileSync('../../ssl/localhost.key'),
  cert: readFileSync('../../ssl/localhost.crt'),
};

class Server {
  constructor() {
    this.start();
  }

  async start() {
    console.log('Начал запуск сервера');

    await this._connect_db();
    await this._start_server();
    await console.log('Сервер запущен успешно');
    await this._start_bot();
  }

  private async _connect_db() {
    console.log('Идет подключение базы данных');
    await mongo.connect();

    console.log('База данных подключена');
  }

  private async _start_server() {
    console.log('Начинаю запуск сервера');
    new router_handler().bind_routes();
    createServer(server_options, app).listen(port, () => {
      console.log(`Сервер запущен на порту: ${port}`);
    });
  }

  private async _start_bot() {
    console.log('Начинаю запуск бота');

    const bot_child = exec('node Main.js', {
      cwd: '../bot/src/',
    });

    bot_child.stdout?.on('data', (data) => process.stdout.write(data));
    bot_child.stdout?.on('error', (error) => console.error(error));

    bot_child.stderr?.on('error', (error) => console.error(error));
    bot_child.stderr?.on('data', (data) => process.stdout.write(data));

    setTimeout(() => socket.connect(), 5000);
  }
}

new Server();

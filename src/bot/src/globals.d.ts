import { Bot_Builder } from './types';
import { f } from './config/modules';

/* eslint-disable */

declare global {
  /** Класс-билдер бота */
  var Bot: Bot_Builder;
  /** "Сумка" для хранения разных данных и быстрого доступа к функциям */
  var F: typeof f;
}

/* eslint-enable */
export {};

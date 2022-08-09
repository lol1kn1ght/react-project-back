import { f } from './config/modules';
global.F = f;

const args = process.argv.slice(2);

type cli_commands = {
  /**
   * Слушатель обновлений файлов.
   * Следит за изменениеями файлов и перезапускает модули или бота
   */
  listener: {
    description: string;
    value: boolean;
  };
};

type propertyes_list = 'listener';

const settings: cli_commands = F.config.cli_settings;

for (const arg of args) {
  const property = arg.split('=');

  if (property.length != 2) continue;

  const key = property[0] as propertyes_list;
  const value = property[1];

  edit_setting(key, JSON.parse(value));
}

f.config.cli_settings = settings;

function edit_setting(key: propertyes_list, value: string) {
  switch (key) {
    case 'listener':
      f.config.cli_settings[key].value = JSON.parse(value);
      break;
    default:
      /* eslint-disable */
      const checker: never = key;
      checker;
      /* eslint-enable */

      break;
  }
}

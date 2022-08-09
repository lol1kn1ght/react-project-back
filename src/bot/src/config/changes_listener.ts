import { watch } from 'chokidar';
import { transformFile } from '@swc/core';
import { writeFileSync } from 'fs';
import { fork, exec } from 'child_process';

type file_types = 'events' | 'commands' | 'other';

class Chagnes_Listener {
  setup(): void {
    try {
      const listener = watch('../src', {
        persistent: true,
        ignored: '../dist',
      });

      const listener_callback = async (path: string) => {
        try {
          console.log();

          const file_name = path.split('\\')[path.split('\\').length - 1];
          console.log(
            `[ChangesListener] Уловил изменения файла ${file_name}`.green
          );
          console.log();

          console.log('[ChangesListener] Запускаю процесс обновления файла');
          console.group();
          console.log(`Трансформация файла ${file_name}`);
          const result = await transformFile(path);

          await writeFileSync(
            path.replace('src', 'dist').replace('.ts', '.js'),
            result.code
          );

          console.log(
            `Трансформация файла ${file_name} успешно завершена`.green
          );

          console.groupEnd();
          console.groupEnd();
          console.log('[ChangesListener] Закончил процесс обновления файла');
          console.log();
          console.log('Перезагружаю файлы...'.green);
          console.log();

          this.reload_file(path);
        } catch (err) {
          console.error(
            `При трансформации файла произошла ошибка: ${
              (<{ message: string }>err).message
            }`
          );
          console.error(err);
          console.groupEnd();
          console.groupEnd();
        }
      };
      listener.on('change', listener_callback);
      // listener.on("add", listener_callback);
      console.log(
        '[ChangesListener] Слушатель изменений загружен и работает'.green
      );
      console.groupEnd();
    } catch (err) {
      console.error(
        `[ChangesListener] Произошла ошибка в слушателе изменений: ${
          (<{ message: string }>err).message
        }`
      );
      console.error(err);
    }
  }

  reload_file(path: string) {
    let file_type = path.split('\\')[2] as file_types;

    if (!['commands', 'events'].includes(file_type)) {
      file_type = 'other';
    }

    switch (file_type) {
      case 'commands':
        Bot.load_commands();
        break;
      case 'events':
        Bot.load_events();
        break;
      case 'other':
        // Reload Bot with pm2
        if (process.env.pm_id) {
          exec(`pm2 restart ${process.env.pm_id}`, (err, stdout, stderr) => {
            console.log(err);
            console.log(stdout);
            console.log(stderr);
          });
        } else {
          setTimeout(function () {
            process.on('exit', function () {
              fork(process.title, {
                cwd: process.cwd(),
                detached: true,
                stdio: ['pipe', 'pipe', 'pipe'],
              });
            });
            process.exit();
          }, 1000);
        }

        break;
    }
  }
}

export { Chagnes_Listener };

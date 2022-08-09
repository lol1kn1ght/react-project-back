import { TextChannel } from 'discord.js';

export function handle_error<object_type extends object>(
  error: Error | string,
  place_name: string,
  options?: { emit_data?: object_type }
) {
  const errors_channel = Bot.client.channels.cache.get(
    F.config.errors_channel
  ) as TextChannel;
  let err_text = `⚠️ Возникла ошибка в \`${place_name}\`: \`${error}\``;

  if (options) {
    if (options.emit_data)
      err_text += `\n\n Параметры запроса:\n\`\`\`json\n${JSON.stringify(
        options.emit_data,
        null,
        '\t'
      )}\`\`\``;
  }

  if (!errors_channel) {
    const owner = Bot.client.users.cache.get(F.config.owner);
    if (owner) owner.send(`Канал с ошибками не указан!\n ${err_text}`);

    return;
  }

  console.error(
    `${place_name}: ${typeof error === 'string' ? error : error.message}`
  );
  console.error(error);
  F.Logger.error(
    `${place_name}: ${typeof error === 'string' ? error : error.message} ${
      options?.emit_data
        ? `\n${JSON.stringify(options.emit_data, null, '\t')}`
        : ''
    }`
  );
  errors_channel.send(err_text);
}

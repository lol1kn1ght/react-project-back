import {
  ColorResolvable,
  CommandInteraction,
  InteractionReplyOptions,
  Message,
  MessageEmbed,
  MessageEmbedOptions,
  ContextMenuInteraction,
} from 'discord.js';

export class InteractionTemplate {
  private _embed_sample: MessageEmbedOptions = {
    footer: {
      text: this._interaction.user.tag,
      icon_url: this._interaction.user.displayAvatarURL({ dynamic: true }),
    },
  };
  constructor(
    private _interaction: CommandInteraction | ContextMenuInteraction
  ) {}

  get_argument(argument_name: string) {
    return this._interaction.options.data.filter(
      (arg) => arg.name === argument_name
    )[0];
  }

  async replyTrue(
    content: string,
    options?: InteractionReplyOptions
  ): Promise<Message<boolean>> {
    try {
      if (typeof content === 'string') {
        const embed_true = this._get_true(content);
        if (!embed_true)
          throw new Error('Что-то пошло не так при создании ембеда');
        return this._send(embed_true, options) as Promise<Message<boolean>>;
      } else if (typeof content != 'string') {
        return this._send(content, options) as Promise<Message<boolean>>;
      } else {
        throw new Error('Не указан контент для ембеда или ембед');
      }
    } catch (err) {
      const error = err as Error;
      F.handle_error(error, '[Interaction_template] method replyTrue', {
        emit_data: {
          content,
          options,
        },
      });
      throw err;
    }
  }

  /** Отправить ембед ошибки, видимый только для участника, вызвавшего команду */
  async replyFalseH(
    content: string,
    options: InteractionReplyOptions = {}
  ): ReturnType<typeof this.replyFalse> {
    options.ephemeral = true;

    return this.replyFalse(content, options);
  }

  /** Отправить ембед успеха, видимый только для участника, вызвавшего команду */
  async replyTrueH(
    content: string,
    options: InteractionReplyOptions = {}
  ): ReturnType<typeof this.replyTrue> {
    options.ephemeral = true;

    return this.replyTrue(content, options);
  }

  replyFalse(
    content: string,
    options?: InteractionReplyOptions
  ): Promise<Message<boolean>> {
    try {
      const embed_false = this._get_false(content);
      if (!embed_false)
        throw new Error('Что-то пошло не так при создании ембеда');

      return this._send(embed_false, options) as Promise<Message<boolean>>;
    } catch (err) {
      const error = err as Error;
      F.handle_error(error, '[Interaction_template] method replyFalse', {
        emit_data: {
          content,
          options,
        },
      });
      throw err;
    }
  }

  private _get_false(content: string) {
    try {
      const false_embed = this._generate_embed({
        description: content,
        color: F.config.colorEmbedFalse as ColorResolvable,
        ...this._embed_sample,
      });

      return false_embed;
    } catch (err) {
      const error = err as Error;
      F.handle_error(error, '[Interaction_template] method replyTrue', {
        emit_data: {
          content,
        },
      });
      throw err;
    }
  }
  private _get_true(content: string) {
    try {
      const true_embed = this._generate_embed({
        description: content,
        color: F.config.colorEmbed as ColorResolvable,
        ...this._embed_sample,
      });

      return true_embed;
    } catch (err) {
      const error = err as Error;
      F.handle_error(error, '[Interaction_template] method replyTrue', {
        emit_data: {
          content,
        },
      });
      throw err;
    }
  }

  private _generate_embed(options: MessageEmbedOptions) {
    return new MessageEmbed(options);
  }

  private _send(embed: MessageEmbed, options?: InteractionReplyOptions) {
    try {
      if (this._interaction.replied || this._interaction.deferred) {
        return this._interaction
          .editReply({
            embeds: [embed],
            ...options,
          })
          .catch((err) => err);
      } else {
        return this._interaction
          .reply({
            embeds: [embed],
            ...options,
          })
          .catch((err) => err);
      }
    } catch (err) {
      const error = err as Error;
      F.handle_error(error, '[Interaction_template] method replyTrue', {
        emit_data: {
          embed,
          options,
        },
      });
      return error;
    }
  }
}

import {
  ButtonInteraction,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
} from 'discord.js';

type pages_args_type = {
  pages: MessageEmbed[];
  interaction: CommandInteraction;
  filter: (interaction: MessageComponentInteraction) => boolean;
};
export function pages_builder(args: pages_args_type) {
  if (!args || typeof args != 'object')
    throw new Error('Аргументы не переданы');

  const { pages, filter, interaction } = args;

  if (!pages || !interaction || !filter) {
    return new Error('Один из аргументов не передан.');
  }

  class Pages {
    pages = pages;
    filter = filter;
    interaction = interaction;
    current_page = 0;
    menu: Message | undefined;
    menu_message: Message | undefined;
    prev_page = new MessageButton({
      type: 'BUTTON',
      label: 'Назад',
      customId: 'prev_page',
      style: 'PRIMARY',
      disabled: true,
    });
    next_page = new MessageButton({
      type: 'BUTTON',
      label: 'Вперед',
      customId: 'next_page',
      style: 'PRIMARY',
      disabled: false,
    });

    async setup() {
      const row = new MessageActionRow();

      row.addComponents(this.prev_page, this.next_page);

      const menu = (await this.interaction.editReply({
        embeds: [this.pages[this.current_page]],
        components: this.pages[1] ? [row] : undefined,
      })) as Message;

      if (!this.pages[1]) return menu;
      this.menu = menu;
      this.collectComponents();

      return menu;
    }

    async collectComponents() {
      let menu = this.menu;

      if (!menu) {
        menu = await this.setup();
      }

      const collector = menu.createMessageComponentCollector({
        filter: (interaction: MessageComponentInteraction) =>
          filter(interaction),
        time: 180000,
      });

      collector.on('collect', async (button) => {
        if (!button.isButton()) return;
        const pages_count = this.pages.length - 1;

        switch (button.customId) {
          case 'next_page':
            {
              if (this.current_page + 1 > pages_count)
                return this.updateButton(button);

              if (this.current_page === 0) this.prev_page.disabled = false;

              this.current_page++;

              const row = new MessageActionRow();

              if (this.current_page === pages_count) {
                this.next_page.disabled = true;
              }

              row.addComponents(this.prev_page, this.next_page);

              this.interaction.editReply({
                embeds: [this.pages[this.current_page]],
                components: [row],
              });
              this.updateButton(button, row);
            }
            break;
          case 'prev_page':
            {
              if (this.current_page - 1 < 0) return this.updateButton(button);

              if (this.current_page === pages_count)
                this.next_page.disabled = false;

              this.current_page--;

              const row = new MessageActionRow();

              if (this.current_page === 0) this.prev_page.disabled = true;

              row.addComponents(this.prev_page, this.next_page);

              await this.interaction.editReply({
                embeds: [this.pages[this.current_page]],
                components: [row],
              });
              await this.updateButton(button, row);
            }
            break;
          default:
        }
      });

      collector.on('end', () => {
        this.interaction.editReply({ components: [] });
      });
    }

    async updateButton(button: ButtonInteraction, row?: MessageActionRow) {
      return button.update({
        components: row ? [row] : undefined,
      });
    }
  }

  return new Pages().setup();
}

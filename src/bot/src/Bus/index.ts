import { io } from '../Main';

import { get_guilds } from './functions/get_guilds';

type socket_data_type = {
  function_name: string;
  args: any[];
};

type function_result_type = {
  data: any;
};

type functions_list_type = {
  [k: string]: (...args: any[]) => Promise<function_result_type>;
};

export class Bus {
  private functions_list: functions_list_type = {};

  constructor() {
    this.setup();
  }

  private setup() {
    this.functions_list['get_guilds'] = get_guilds;
  }

  async call_function(
    function_name: string,
    ...args: any[]
  ): Promise<function_result_type | undefined> {
    if (function_name in this.functions_list)
      return await this.functions_list[function_name](...args);
    return undefined;
  }
}

const bus = new Bus();

io.on('connection', (connection) => {
  connection.on('message', async (data: socket_data_type) => {
    const result = await bus.call_function(data.function_name, ...data.args);

    console.log(result);

    connection.send({
      data: result,
    });
  });
});

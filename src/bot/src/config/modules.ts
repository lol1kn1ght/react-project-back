import * as config from './config.json';
import * as dev_config from './dev_config.json';
import { handle_error } from '../functions/handle_error';
import { Chagnes_Listener } from './changes_listener';
import { number_discharge } from '../functions/number_discharge';
import { ms_to_string } from '../functions/ms_to_string';
import { pages_builder } from '../functions/pages';
import { Logger } from './logger';

const { dev } = config;

const cfg: typeof config = dev ? dev_config : config;

type module_type = {
  config: typeof config;
  handle_error: <Object_Type extends object>(
    err: Error | string,
    place_name: string,
    options?: { emit_data?: Object_Type }
  ) => void;
  domains: string[];
  authoirse_members_cooldown: number;
  flood: {
    [k: string]: {
      amount: number;
      till: number;
    };
  };
  anti_link_muted: {
    [k: string]: boolean;
  };
  muted_members: {
    [k: string]: {
      amount: number;
      till: number;
    };
  };
  Chagnes_Listener: Chagnes_Listener;
  Logger: Logger;
  pages: typeof pages_builder;
  number_discharge: (number: number) => string;
  ms_to_string: (number: number) => string;
};

const f: module_type = {
  ms_to_string,
  config: cfg,
  domains: [],
  flood: {},
  handle_error,
  pages: pages_builder,
  anti_link_muted: {},
  muted_members: {},
  Logger: new Logger(),
  Chagnes_Listener: new Chagnes_Listener(),
  number_discharge,
  authoirse_members_cooldown: 0,
};

export { f };

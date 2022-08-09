export type connection_url_type = {
  url: string;
  db: string;
  ip: string;
  pass: string;
  port: number;
};

export type session_id_type = {
  token: string;
  expired_at: number;
  member_id: string;
};

export type def_api_req_data = {
  session_id: session_id_type;
};

export type headers_type =
  | Partial<{
      authorisation: string;
    }>
  | undefined;

export type api_user_data_type = {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string;
  banner_color?: string;
  accent_color?: number;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags: number;
  premium_type?: number;
  public_flags?: number;
};

export type login_data_type = {
  token: string;
  user: api_user_data_type;
};

export type db_user_type = {
  login: string;
  session_id: string;
  token: string;
};

export type api_guild_type = {
  id: string;
  name: string;
  icon?: string;
  owner?: boolean;
  parmissions?: string;
  owner_id: string;
  manageable: boolean;
  on_server: boolean;
};

export type api_autorise_data_type = Partial<{
  token_type: string;
  access_token: string;
}>;

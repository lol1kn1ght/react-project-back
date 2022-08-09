type get_guilds_req_type = Partial<{
  member_id: string;
  guilds: string[];
}>;

const client = Bot.client;

type result_guild_type = {
  name?: string;
  id: string;
  icon_url?: string | null;
  banner?: string | null;
  manageable?: boolean;
  on_server?: boolean;
};

type result_data_type = {
  data: result_guild_type[] | undefined;
};

export async function get_guilds(
  req_data: get_guilds_req_type
): Promise<result_data_type> {
  const { member_id, guilds } = req_data;

  if (!member_id || !guilds || !guilds[0])
    return {
      data: undefined,
    };

  const result_guilds: result_guild_type[] = [];

  for (const guild_id of guilds) {
    let on_server = false;

    const guild = client.guilds.cache.get(guild_id);

    if (guild) on_server = true;

    let manageable = false;

    if (guild) {
      const member = await guild.members.fetch(member_id);

      if (member) {
        manageable = member.permissions.has('MANAGE_GUILD');
      }

      const result: result_guild_type = {
        manageable,
        on_server,
        id: guild.id,
        banner: guild.bannerURL(),
        icon_url: guild.iconURL({ dynamic: true }),
        name: guild.name,
      };

      result_guilds.push(result);
      continue;
    }

    result_guilds.push({
      id: guild_id,
    });
  }

  return { data: result_guilds };
}

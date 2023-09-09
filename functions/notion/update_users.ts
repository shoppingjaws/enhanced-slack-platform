// /slack-samples/deno-hello-world/functions/greeting_function.ts
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  APIResponseError,
} from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts";
import {
  GetUserIdsFromNotionPageProp,
  ListAllNotionUsers,
} from "../../libs/notion.ts";
import { CreateMetadata } from "../../libs/metadata.ts";
import { GetEmailsFromSlackUsers } from "../../libs/slack.ts";

export const UpdateUsers = DefineFunction({
  callback_id: "update_notion_users",
  title: "Update notion users from Slack users",
  description: "Update notion users from Slack users",
  source_file: "./functions/notion/update_users.ts",
  input_parameters: {
    properties: {
      users: {
        title: "Users to edit",
        type: Schema.types.array,
        items: { "type": Schema.slack.types.user_id },
      },
      users_prop_name: {
        title: "User Property Name in Notion",
        type: Schema.types.string,
      },
      type: {
        title: "Manipulation name of edit",
        type: Schema.types.string,
        enum: ["Set", "Add", "Remove", "Clear"],
        choices: [{
          value: "Set",
          title: "Set users",
        }, {
          value: "Add",
          title: "Add new users",
        }, {
          value: "Remove",
          title: "Remove users",
        }, {
          value: "Clear",
          title: "Clear users",
        }],
        default: "Set",
      },
      page_id: {
        type: Schema.types.string,
        title: "Notion page ID",
      },
    },
    required: ["users", "users_prop_name", "type", "page_id"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  UpdateUsers,
  async ({ inputs, env, token }) => {
    const meta = CreateMetadata(env, token);
    if ("error" in meta) return meta;
    const emails = await GetEmailsFromSlackUsers(inputs.users, meta);
    if ("error" in emails) return emails;
    const notionAllUsers = (await ListAllNotionUsers(meta.notion)).filter((f) =>
      f.type === "person" && emails.includes(f.person.email ?? "")
    );
    const notionUserIds = notionAllUsers.map((u) => {
      return u.id;
    });
    const existingUsers = await GetUserIdsFromNotionPageProp(
      inputs.page_id,
      inputs.users_prop_name,
      meta,
    );
    if ("error" in existingUsers) return existingUsers;

    const ids = Array.from(
      new Set((() => {
        if (inputs.type === "Add") {
          return notionUserIds.concat(existingUsers);
        }
        if (inputs.type === "Remove") {
          return notionUserIds.filter((n) => !existingUsers.includes(n));
        }
        if (inputs.type === "Clear") return [];
        else return notionUserIds;
      })()),
    );
    const prop: { [K: string]: { people: { id: string }[] } } = {};
    prop[inputs.users_prop_name] = {
      people: [...ids.map((n) => {
        return { id: n };
      })],
    };
    const res = await meta.notion.pages.update({
      "page_id": inputs.page_id ?? "",
      properties: prop,
    }).catch((e: APIResponseError) => {
      if (
        e.message ===
          "Unsaved transactions: Invalid value for property with limit"
      ) {
        return {
          error:
            `Notion User Propperty (=${inputs.users_prop_name}) is set as single user mode`,
        };
      }
      return { error: e.body };
    });
    if ("error" in res) return res;

    return { outputs: {} };
  },
);

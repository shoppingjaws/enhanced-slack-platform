// /slack-samples/deno-hello-world/functions/greeting_function.ts
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  APIResponseError,
} from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts";
import { CreateMetadata } from "../../libs/metadata.ts";

export const UpdateTitle = DefineFunction({
  callback_id: "update_notion_title",
  title: "Update notion title",
  description: "Update notion title",
  source_file: "./functions/notion/update_title.ts",
  input_parameters: {
    properties: {
      title: {
        title: "Title name to update",
        type: Schema.types.string,
      },
      title_prop_name: {
        title: "Title Property Name in Notion",
        type: Schema.types.string,
      },
      page_id: {
        type: Schema.types.string,
        title: "Notion page ID",
      },
    },
    required: ["title", "title_prop_name", "page_id"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  UpdateTitle,
  async ({ inputs, env, token }) => {
    const meta = CreateMetadata(env, token);
    if ("error" in meta) return meta;
    const prop: {
      [K: string]: { title: { text: { content: string } }[] };
    } = {};
    prop[inputs.title_prop_name] = {
      title: [{ text: { content: inputs.title } }],
    };
    const res = await meta.notion.pages.update({
      "page_id": inputs.page_id ?? "",
      properties: prop,
    }).catch((e: APIResponseError) => {
      return { error: e.body };
    });
    if ("error" in res) return res;
    return { outputs: {} };
  },
);

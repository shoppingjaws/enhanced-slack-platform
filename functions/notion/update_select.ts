// /slack-samples/deno-hello-world/functions/greeting_function.ts
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  APIResponseError,
} from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts";
import { CreateMetadata } from "../../libs/metadata.ts";

export const UpdateSelect = DefineFunction({
  callback_id: "update_notion_select",
  title: "Update notion select",
  description: "Update notion select",
  source_file: "./functions/notion/update_select.ts",
  input_parameters: {
    properties: {
      select: {
        title: "Select name to update",
        type: Schema.types.string,
      },
      select_prop_name: {
        title: "Select Property Name in Notion",
        type: Schema.types.string,
      },
      page_id: {
        type: Schema.types.string,
        title: "Notion page ID",
      },
    },
    required: ["select", "select_prop_name", "page_id"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  UpdateSelect,
  async ({ inputs, env, token }) => {
    const meta = CreateMetadata(env, token);
    if ("error" in meta) return meta;
    const prop: { [K: string]: { select: { name: string } } } = {};
    prop[inputs.select_prop_name] = { select: { name: inputs.select } };
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

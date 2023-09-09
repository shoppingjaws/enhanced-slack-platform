import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  APIResponseError,
} from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts";
import { CreateMetadata } from "../../libs/metadata.ts";

export const UpdateStatus = DefineFunction({
  callback_id: "update_notion_status",
  title: "Update status into given one",
  description: "Update status into given one",
  source_file: "./functions/notion/update_status.ts",
  input_parameters: {
    properties: {
      status: {
        type: Schema.types.string,
      },
      status_prop_name: {
        type: Schema.types.string,
      },
      page_id: {
        type: Schema.types.string,
      },
    },
    required: ["status", "status_prop_name", "page_id"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  UpdateStatus,
  async ({ inputs, env, token }) => {
    const meta = CreateMetadata(env, token);
    if ("error" in meta) return meta;
    const prop: { [K: string]: { status: { name: string } } } = {};
    prop[inputs.status_prop_name] = { status: { name: inputs.status } };
    await meta.notion.pages.update({
      "page_id": inputs.page_id ?? "",
      properties: prop,
    }).catch((e: APIResponseError) => {
      return { error: e.body };
    });
    return { outputs: {} };
  },
);

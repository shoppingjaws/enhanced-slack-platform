// /slack-samples/deno-hello-world/functions/greeting_function.ts
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { CreateMetadata } from "../../libs/metadata.ts";

export const CreatePage = DefineFunction({
  callback_id: "create_page",
  title: "Create a notinon page",
  description: "Create a notion page",
  source_file: "./functions/notion/create_page.ts",
  input_parameters: {
    properties: {
      database_id: {
        title: "Notion database id to create",
        type: Schema.types.string,
      },
    },
    required: ["database_id"],
  },
  output_parameters: {
    properties: {
      page_id: {
        title: "Created notion page id",
        type: Schema.types.string,
      },
    },
    required: ["page_id"],
  },
});

export default SlackFunction(
  CreatePage,
  async ({ inputs, env, token }) => {
    const meta = CreateMetadata(env, token);
    if ("error" in meta) return meta;
    const page = await meta.notion.pages.create({
      "parent": { "database_id": inputs.database_id },
      "properties": {},
    });
    return { outputs: { page_id: page.id } };
  },
);

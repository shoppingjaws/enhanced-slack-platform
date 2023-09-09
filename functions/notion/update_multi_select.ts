// /slack-samples/deno-hello-world/functions/greeting_function.ts
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  APIResponseError,
} from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts";
import { CreateMetadata } from "../../libs/metadata.ts";
import { GetMultiSelectsFromNotionPageProp } from "../../libs/notion.ts";

export const UpdateMultiSelect = DefineFunction({
  callback_id: "update_notion_multi_select",
  title: "Update notion multi-select",
  description: "Update notion multi-select",
  source_file: "./functions/notion/update_multi_select.ts",
  input_parameters: {
    properties: {
      multi_select: {
        title: "Multi-Select name to update",
        type: Schema.types.array,
        items: { type: Schema.types.string },
      },
      multi_select_prop_name: {
        title: "Multi-Select Property Name in Notion",
        type: Schema.types.string,
      },
      type: {
        title: "Manipulation name of edit",
        type: Schema.types.string,
        enum: ["Set", "Add", "Remove", "Clear"],
        choices: [{
          value: "Set",
          title: "Set multi-selects",
        }, {
          value: "Add",
          title: "Add new multi-selects",
        }, {
          value: "Remove",
          title: "Remove multi-selects",
        }, {
          value: "Clear",
          title: "Clear all multi-select",
        }],
        default: "Set",
      },
      page_id: {
        type: Schema.types.string,
        title: "Notion page ID",
      },
    },
    required: ["multi_select", "multi_select_prop_name", "type", "page_id"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  UpdateMultiSelect,
  async ({ inputs, env, token }) => {
    const meta = CreateMetadata(env, token);
    if ("error" in meta) return meta;
    const existingMultiSelects = await GetMultiSelectsFromNotionPageProp(
      inputs.page_id,
      inputs.multi_select_prop_name,
      meta,
    );
    if ("error" in existingMultiSelects) return existingMultiSelects;
    const multSelects = Array.from(
      new Set((() => {
        if (inputs.type === "Add") {
          return existingMultiSelects.concat(inputs.multi_select);
        } else if (inputs.type === "Remove") {
          return existingMultiSelects.filter((s) =>
            !inputs.multi_select.includes(s)
          );
        } else if (inputs.type === "Clear") return [];
        else return inputs.multi_select;
      })()),
    );
    console.log(multSelects);
    const prop: { [K: string]: { multi_select: { name: string }[] } } = {};
    prop[inputs.multi_select_prop_name] = {
      multi_select: [...multSelects.map((s) => {
        return { name: s };
      })],
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

import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { CreateMetadata } from "../../libs/metadata.ts";
import { APIResponseError } from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts";
import { GetEmailsFromSlackUsers } from "../../libs/slack.ts";
import { GetUserIdsFromEmail } from "../../libs/notion.ts";

export const AddComment = DefineFunction({
  callback_id: "add_comment",
  title: "Add a comment to notion page",
  description: "Add a comment to notion page",
  source_file: "./functions/notion/add_comment.ts",
  input_parameters: {
    properties: {
      page_id: {
        title: "Notion page id to comment",
        type: Schema.types.string,
      },
      mention: {
        title: "Users to mention",
        type: Schema.types.array,
        items: { type: Schema.slack.types.user_id },
      },
      message: {
        type: Schema.types.string,
      },
      author: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["page_id", "message", "author"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  AddComment,
  async ({ inputs, env, token }) => {
    const meta = CreateMetadata(env, token);
    if ("error" in meta) return meta;
    // email[0] = author, email[1...] = mention
    const emails = await GetEmailsFromSlackUsers(
      [inputs.author].concat(inputs.mention ?? []),
      meta,
    );
    console.log(emails);
    if ("error" in emails) return emails;
    const users = await GetUserIdsFromEmail(emails, meta);
    if ("error" in users) return users;
    // email[0] = author, email[1...] = mention
    const commentUsers = users.map((u) => {
      return { mention: { user: { id: u.id } } };
    });
    const [author, ...mentioned] = commentUsers;
    const res = await meta.notion.comments.create({
      parent: { page_id: inputs.page_id },
      rich_text: [
        ...mentioned,
        {
          text: { content: " " + String(inputs.message) },
        },
        { text: { content: " by " } },
        author,
      ],
    }).catch((e: APIResponseError) => {
      return { error: e.body };
    });
    if ("error" in res) return res;
    return { outputs: {} };
  },
);

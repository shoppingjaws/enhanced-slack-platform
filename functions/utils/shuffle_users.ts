// /slack-samples/deno-hello-world/functions/greeting_function.ts
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const ShuffleUsers = DefineFunction({
  callback_id: "shuffle_users",
  title: "Shuffle Users",
  description: "Shuffle Users",
  source_file: "./functions/utils/shuffle_users.ts",
  input_parameters: {
    properties: {
      users: {
        title: "Users who draw lot",
        type: Schema.types.array,
        items: { type: Schema.slack.types.user_id },
      },
    },
    required: ["users"],
  },
  output_parameters: {
    properties: {
      user: {
        title: "Who won the lottery",
        type: Schema.slack.types.user_id,
      },
    },
    required: ["user"],
  },
});

export default SlackFunction(
  ShuffleUsers,
  ({ inputs }) => {
    const chosen =
      inputs.users[Math.floor(Math.random() * inputs.users.length)];
    return { outputs: { user: chosen } };
  },
);

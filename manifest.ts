import { Manifest } from "deno-slack-sdk/mod.ts";
import { UpdateStatus } from "./functions/notion/update_status.ts";
import { UpdateUsers } from "./functions/notion/update_users.ts";
import { UpdateSelect } from "./functions/notion/update_select.ts";
import { UpdateMultiSelect } from "./functions/notion/update_multi_select.ts";
import { ShuffleUsers } from "./functions/utils/shuffle_users.ts";
import { UpdateTitle } from "./functions/notion/update_title.ts";
import { AddComment } from "./functions/notion/add_comment.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "awsome-custom-workflow",
  description: "custom workflow sets that enhances slack experience",
  icon: "assets/jaws.png",
  functions: [
    UpdateStatus,
    UpdateUsers,
    UpdateSelect,
    UpdateMultiSelect,
    ShuffleUsers,
    UpdateTitle,
    AddComment,
  ],
  workflows: [],
  outgoingDomains: ["api.notion.com"],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "users:read",
    "users:read.email",
  ],
});

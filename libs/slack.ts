import { BaseResponse } from "deno-slack-api/types.ts";
import { ErrorResult, Metadata } from "./metadata.ts";

export async function GetEmailsFromSlackUsers(userIds:string[],meta:Metadata):Promise<string[]|ErrorResult> {
  const tasks: Promise<BaseResponse>[] = [];
  userIds.forEach((u: string) => {
    tasks.push(meta.slack.users.info({ user: u }));
  });
  const slack_user_emails: string[] = (await Promise.all(tasks)).map(
    (res) => {
      return res.user.profile.email;
    },
  )
  if(userIds.length !== slack_user_emails.length) return {error:`Some users have no emails ${slack_user_emails}`}
  return slack_user_emails
}

import { SlackAPI, SlackAPIClient } from "deno-slack-sdk/deps.ts";
import { Env } from "deno-slack-sdk/types.ts";
import { Client } from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts";

export interface Metadata {
  notion: Client
  slack:SlackAPIClient
}
export interface ErrorResult {
  error:string
}

export function CreateMetadata(env:Env,token:string):Metadata|ErrorResult{
  const authKey = env.NOTION_TOKEN ?? Deno.env.get("NOTION_TOKEN");
  if (!authKey) {
    return { error: "NOTION_TOKEN env value is missing!" };
  }
  const notion = new Client({
    auth: authKey,
  });
  return {notion:notion,slack:SlackAPI(token) }
}

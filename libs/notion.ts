import { BaseResponse } from "deno-slack-api/types.ts";
import { Client } from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts";
import { ErrorResult, Metadata } from "./metadata.ts";

// Returns all non-bot users in notion
export async function ListAllNotionUsers(notion:Client,cursor?:string){
  const res = await notion.users.list({"start_cursor":cursor})
  const users = res.results
  if(res.next_cursor !==null){
    const recursiveRes = await ListAllNotionUsers(notion,res.next_cursor)
    users.push(...recursiveRes)
  }
  return users.filter(u=>u.type === "person")
}

export async function GetUserIdsFromEmail(emails:string[],meta:Metadata):Promise<{id:string,email:string}[]|ErrorResult>{
  const allUsers = await ListAllNotionUsers(meta.notion)
  allUsers.filter(u=>
    u.type === "person" &&  emails.includes(u.person.email ?? "")
  )
  const res = emails.map(e=>{
    const user = allUsers.find(a=>a.type==="person" && a.person.email ===e)
    if(user?.type==="person"){return {id:user.id,email:user.person.email??""}}
    return {id:"",email:""}
  }).filter(f=>f.email!=="")
  if( res.length !== emails.length)return {error:`Specified users (author/mention) are not in Notion. Given are ${emails}`}
  return res
}

export async function GetUserIdsFromNotionPageProp(pageId:string,propName:string,meta:Metadata,cursor?:string):Promise<string[]|ErrorResult>{
  try{
    const prop = await meta.notion.pages.properties.retrieve({
      "page_id": pageId,
      "property_id": propName,
      start_cursor: cursor,
    })
    const ids = prop.object === "list"
      ? prop.results.map((r) => {
        if (r.type === "people" && r.people.object === "user") {
          return r.people.id;
        }
        return null;
      }).filter((f) => f) as string[]
      : [];
    if (prop.object === "list" && prop.next_cursor !== null) {
      const next_ids = await GetUserIdsFromNotionPageProp(pageId,propName,meta,prop.next_cursor);
      if("error" in next_ids) {return next_ids}
      ids.push(...next_ids);
    }
    return ids;
  }catch(e){
    return {error:"Failed to retrieve user properties in Notion"}
  }
}
export async function GetMultiSelectsFromNotionPageProp(pageId:string,propName:string,meta:Metadata):Promise<string[]|ErrorResult>{
  const prop = await meta.notion.pages.properties.retrieve({"page_id":pageId,"property_id":propName})
  if(prop.type==="multi_select"){
    return prop.multi_select.map(s=>s.name)
  }
  else return {error:"Failed to retrieve multi-select properties in Notion"}
}

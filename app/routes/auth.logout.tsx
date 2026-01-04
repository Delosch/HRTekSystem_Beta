import { json, LoaderFunction } from "@remix-run/node";

import { logout, requireUserSession } from "~/lib/session.server"; // Your session.server.ts functions

export const loader: LoaderFunction = async ({ request }) => {

  const user = await requireUserSession(request); 
  if(user)
  return await logout(request);
  else
    return json("No session found")
};
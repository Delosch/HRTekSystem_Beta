import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export async function action() {
  return redirect("/logout");
}

export async function loader() {
  return redirect("/logout");
}
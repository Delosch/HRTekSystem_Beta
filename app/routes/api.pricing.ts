import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { calculatePricing, getEmployeeTiers, type EngineType } from "~/services/pricing.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({ tiers: getEmployeeTiers() });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const engine = formData.get("engine") as EngineType;
  const employeeCount = Number(formData.get("employeeCount"));
  const months = formData.get("months") ? Number(formData.get("months")) : 1;

  if (!engine || isNaN(employeeCount)) {
    return json({ error: "Invalid parameters" }, { status: 400 });
  }

  const result = calculatePricing({ engine, employeeCount, months });

  return json(result);
}

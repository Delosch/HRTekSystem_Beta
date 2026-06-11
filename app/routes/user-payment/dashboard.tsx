import { LoaderFunction, redirect } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  return redirect("/payment/status");
};

export default function UserPaymentDashboardRedirect() {
  return null;
}

import { useState, useEffect, useMemo } from "react";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { LoaderFunction, ActionFunction, redirect, json } from "@remix-run/node";
import { Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import Sidebar from "../components/DashboardComponents/Sidebar";
import { getCartItems, deleteCartItem } from "~/models/cart.model"; // Assuming deleteCartItem exists
import { requireUserSession } from "~/lib/session.server";
import { getEnhancedUser } from "~/utils/user.server";

// Define the type for items coming from the loader
interface CartItem {
  pk: string;
  sk: 'CART';
  productName: string;
  price: number;
  addedBy: string;
  addedAt: string;
}

// 1. LOADER: Fetches cart items and enhanced user profile
export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  const user = await getEnhancedUser(request);
  if (!user.organisationId) {
    return redirect('/auth');
  }

  // Assuming getCartItems returns data in the specified format
  const items = await getCartItems(user.organisationId || "");
  return json({ items, user });
};

// 2. ACTION: Handles removing an item from the cart and adding test items
export const action: ActionFunction = async ({ request }: { request: Request }) => {
  const user = await requireUserSession(request);
  if (!user) return redirect('/auth');

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "removeItem") {
    const pk = formData.get("pk") as string;
    const sk = formData.get("sk") as string;

    if (!pk || !sk) {
      return json({ error: "Missing item identifiers" }, { status: 400 });
    }

    // Delete item from cart
    await deleteCartItem(pk, sk);
    console.log("SUCCESS: Item deleted from cart:", { pk, sk });

    return json({ success: true });
  }

  // Removed addTestItem logic for production clean up

  return json({ error: "Invalid intent" }, { status: 400 });
};

// --- UI COMPONENTS ---

const OrderSummary = ({ subtotal, gst, total }: { subtotal: number; gst: number; total: number }) => (
  <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 h-fit">
    <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Order Summary</h3>
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">GST (18%)</span>
        <span className="font-medium text-gray-900">₹{gst.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-base font-semibold border-t pt-3 mt-3">
        <span className="text-gray-900">Total</span>
        <span className="text-blue-600">₹{total.toFixed(2)}</span>
      </div>
    </div>
    <Link
      to="/payment/checkout"
      className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 block text-center"
    >
      Proceed to Payment
    </Link>
  </div>
);

const getEngineIcon = (productName: string) => {
  const icons: Record<string, string> = {
    "Intelligent Change Management": "🔄",
    "HR Transformation Roadmap": "🗺️",
    "HR Transformation Roadmap Generator": "🗺️",
    "Shared Service Designer": "🏢",
    "Shared Services Designer": "🏢",
    "SSC/COE Shared Service Planner": "🏢",
    "HR Technology Maturity Analysis": "📊",
    "HR Technology Maturity Assessment": "📊",
    "HCM Vendor Fit Engine": "🎯",
    "Digital Maturity Assessment": "📈",
    "HR Digital Transformation": "🚀"
  };
  return icons[productName] || "📦";
};

const CartItemRow = ({ item }: { item: CartItem }) => {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state === 'submitting';

  return (
    <div className={`flex items-center justify-between gap-4 border-b pb-4 transition-opacity ${isDeleting ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-center gap-4 flex-grow">
        <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl shadow-sm border border-gray-100">
          {getEngineIcon(item.productName)}
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-800">{item.productName}</h3>
          <p className="text-sm text-gray-500">Added on: {new Date(item.addedAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 flex-shrink-0">
        <span className="text-lg font-bold text-gray-900 w-28 text-right">
          ₹{item.price.toFixed(2)}
        </span>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="removeItem" />
          <input type="hidden" name="pk" value={item.pk} />
          <input type="hidden" name="sk" value={item.sk} />
          <button
            type="submit"
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed transition"
            aria-label="Remove item"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
};

const CostBreakdownChart = ({ data }: { data: { name: string; value: number }[] }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A23CFE', '#FE3C72'];
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Cost Breakdown</h3>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// 3. MAIN COMPONENT: Ties everything together
export default function CartDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { items: cartItems, user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  // Calculate totals with GST
  const { subtotal, gst, total } = useMemo(() => {
    const currentSubtotal = cartItems.reduce((acc: number, item: any) => acc + item.price, 0);
    const currentGst = currentSubtotal * 0.18;
    const currentTotal = currentSubtotal + currentGst;
    return { subtotal: currentSubtotal, gst: currentGst, total: currentTotal };
  }, [cartItems]);

  const chartData = useMemo(() =>
    cartItems.map((item: any) => ({ name: item.productName, value: item.price })),
    [cartItems]
  );

  useEffect(() => {
    const handleResize = () => setIsSidebarCollapsed(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {!isSidebarCollapsed && <Sidebar user={user} />}

      <main className="flex-1 md:ml-64 p-6 sm:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-gray-300 pb-4 mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Shopping Cart</h2>
            <p className="text-md text-gray-600 mt-2">Review your items and proceed to checkout.</p>
          </div>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6 sm:p-8 space-y-6 border border-gray-200">
                {cartItems.map((item) => (
                  <CartItemRow key={item.pk} item={item} />
                ))}
              </div>

              <div className="lg:col-span-1 space-y-8">
                <OrderSummary subtotal={subtotal} gst={gst} total={total} />
                <CostBreakdownChart data={chartData} />
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-md border">
              <h3 className="text-2xl font-semibold text-gray-800">Your Cart is Empty</h3>
              <p className="text-gray-500 mt-2 mb-6">Looks like you haven't added any items yet.</p>

              {/* Test Button for Development */}
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Complete an assessment engine to add items to your cart.
                </p>
                <Link
                  to="/startTransformationDashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
                >
                  Browse Engines
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

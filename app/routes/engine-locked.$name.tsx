import { useLoaderData, Link } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";
import { LockClosedIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

export async function loader({ params, request }: LoaderFunctionArgs) {
    const session = await requireUserSession(request);
    const engineName = params.name || "Unknown Engine";

    return json({
        engineName,
        userEmail: session.email,
        orgId: session.organisationId
    });
}

export default function EngineLocked() {
    const { engineName } = useLoaderData<typeof loader>();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Lock Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <LockClosedIcon className="w-10 h-10 text-red-600" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
                    Engine Access Restricted
                </h1>

                {/* Engine Name */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-center text-gray-600 text-sm mb-2">
                        You're trying to access:
                    </p>
                    <p className="text-center text-xl font-semibold text-gray-900">
                        {engineName}
                    </p>
                </div>

                {/* Message */}
                <div className="mb-8">
                    <p className="text-center text-gray-600 mb-4">
                        This assessment engine requires a verified payment to access.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            To unlock this engine:
                        </h3>
                        <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                            <li>Add the engine to your cart</li>
                            <li>Complete the payment process</li>
                            <li>Wait for admin verification</li>
                            <li>Access will be granted automatically</li>
                        </ol>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/cartDashboard"
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <ShoppingCartIcon className="w-5 h-5" />
                        Go to Cart
                    </Link>
                    <Link
                        to="/dashboard"
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-500">
                        Need help? Contact support at{" "}
                        <a
                            href="mailto:support@hrteksystem.com"
                            className="text-blue-600 hover:underline"
                        >
                            support@hrteksystem.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

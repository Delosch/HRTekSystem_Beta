import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { requireUserSession } from "~/lib/session.server";
import { ArrowLeft } from "lucide-react";

export const loader: LoaderFunction = async ({ request }) => {
    // Ensure admin checks
    const user = await requireUserSession(request);
    const userWithRole = user as any;
    if (userWithRole.role !== "admin" && process.env.NODE_ENV === "production") {
        throw new Response("Unauthorized", { status: 403 });
    }

    const ddb = getDynamoDBDocumentClient();
    const result = await ddb.send(new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        FilterExpression: "profile_type = :pt",
        ExpressionAttributeValues: {
            ":pt": "CONTACT_MSG"
        }
    }));

    // Sort by createdAt desc
    const messages = result.Items?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

    return json({ messages });
};

export default function AdminMessages() {
    const { messages } = useLoaderData<any>();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/users" className="text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
                            <p className="text-gray-600">View inquiries received from the website</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Date/Time</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Email</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Phone</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Company</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900 w-1/3">Message</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {messages.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No messages found yet.
                                        </td>
                                    </tr>
                                ) : (
                                    messages.map((msg: any) => (
                                        <tr key={msg.pk} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                                {new Date(msg.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {msg.firstName} {msg.lastName}
                                                {!msg.firstName && !msg.lastName && msg.name}
                                            </td>
                                            <td className="px-6 py-4 text-blue-600">
                                                <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                                {msg.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {msg.company || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-800">
                                                <div className="max-h-20 overflow-y-auto pr-2 scrollbar-hide text-ellipsis">
                                                    {msg.message}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

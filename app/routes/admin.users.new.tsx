import { ActionFunction, json, redirect, LoaderFunction } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { ArrowLeftIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { signupUser } from "~/models/user.model.server";
import { sendWelcomeEmail } from "~/lib/email.service.server";
import { requireUserSession } from "~/lib/session.server";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const loader: LoaderFunction = async ({ request }) => {
    // Ensure only admin accesses this
    const user = await requireUserSession(request);
    const userWithRole = user as any;
    if (userWithRole.role !== "admin" && process.env.NODE_ENV === "production") {
        return redirect("/admin/users");
    }

    // Fetch organizations for dropdown
    const ddb = getDynamoDBDocumentClient();
    const companies = await ddb.send(new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        FilterExpression: "begins_with(pk, :pk) AND sk = :sk",
        ExpressionAttributeValues: {
            ":pk": "COMPANY#",
            ":sk": "PROFILE"
        }
    }));

    return json({
        companies: companies.Items || []
    });
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const country_code = formData.get("country_code") as string; // e.g. 91
    const role = formData.get("role") as string;
    const organizationId = formData.get("organizationId") as string;

    if (!first_name || !last_name || !email || !phone || !role) {
        return json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        // 1. Generate secure random password
        // Use a mix of chars to pass complexity checks if any
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
        let tempPassword = "";
        for (let i = 0; i < 12; i++) {
            tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Format phone for schema: (+Code)Number
        // e.g. (+91)9876543210
        const formattedPhone = `(+${country_code.replace('+', '')})${phone}`;

        // 2. Create User (Standard Signup)
        const newUser = await signupUser({
            first_name,
            last_name,
            email,
            password: tempPassword,
            phone: formattedPhone,
            is_term_agree: true,
            is_marketing_allowed: false,
            country_iso: "IN", // Defaulting to IN for simplicity, or add field
            password_strength_score: 4, // trusted admin creation
            signup_timestamp: Date.now()
        });

        console.log(`[Admin] Created user ${newUser.userId}`);

        // 3. Update Admin-only fields (Role, Organization, Status)
        const ddb = getDynamoDBDocumentClient();

        // Define update expression
        let updateExpression = "SET #role = :role, onboardingStatus = :status, is_verified_email = :verified";
        const expressionnames: any = { "#role": "role" };
        const expressionvalues: any = {
            ":role": role,
            ":status": "Verified",
            ":verified": true
        };

        if (organizationId) {
            updateExpression += ", organisationId = :orgId";
            expressionvalues[":orgId"] = organizationId;
        }

        await ddb.send(new UpdateCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: { pk: `USER#${newUser.userId}`, sk: "PROFILE" },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionnames,
            ExpressionAttributeValues: expressionvalues
        }));

        // 4. Send Welcome Email
        const loginUrl = process.env.APP_URL ? `${process.env.APP_URL}/auth` : "http://localhost:5173/auth";

        const emailSent = await sendWelcomeEmail({
            email,
            firstName: first_name,
            password: tempPassword,
            role,
            loginUrl
        });

        if (!emailSent) {
            // We don't rollback user creation, but we warn via session/url? 
            // Ideally use session flash, but here we'll just redirect.
            console.warn("Welcome email failed to send");
        }

        return redirect("/admin/users");

    } catch (error: any) {
        console.error("Error creating user:", error);
        return json({ error: error.message || "Failed to create user" }, { status: 500 });
    }
};

export default function AdminNewUser() {
    const actionData = useActionData<{ error?: string }>();
    const loaderData = useLoaderData<any>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link to="/admin/users" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Users
                    </Link>
                    <div className="flex items-center gap-3">
                        <UserPlusIcon className="w-8 h-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
                            <p className="text-gray-600">Create a new user account and send credentials via email.</p>
                        </div>
                    </div>
                </div>

                {actionData?.error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                        <p className="text-red-700">{actionData.error}</p>
                    </div>
                )}

                <Form method="post" className="bg-white rounded-lg shadow p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input name="first_name" required className="w-full rounded border-gray-300 px-3 py-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input name="last_name" required className="w-full rounded border-gray-300 px-3 py-2 border" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input name="email" type="email" required className="w-full rounded border-gray-300 px-3 py-2 border" />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dial Code</label>
                            <select name="country_code" className="w-full rounded border-gray-300 px-3 py-2 border">
                                <option value="91">+91 (IN)</option>
                                <option value="1">+1 (US)</option>
                                <option value="44">+44 (UK)</option>
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input name="phone" required className="w-full rounded border-gray-300 px-3 py-2 border" placeholder="9876543210" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select name="role" required className="w-full rounded border-gray-300 px-3 py-2 border">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="consultant">Consultant</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Organization (Optional)</label>
                            <select name="organizationId" className="w-full rounded border-gray-300 px-3 py-2 border">
                                <option value="">None / Independent</option>
                                {loaderData.companies.map((c: any) => (
                                    <option key={c.pk} value={c.pk.replace("COMPANY#", "")}>
                                        {c.company_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isSubmitting ? "Creating & Sending Email..." : "Create User"}
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    );
}

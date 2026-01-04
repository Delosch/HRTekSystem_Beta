import React, { useState, useEffect } from "react";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { json, unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import type { ActionFunction, LoaderFunction, UploadHandler } from "@remix-run/node";
import Sidebar from "../components/DashboardComponents/Sidebar";
import { requireUserSession, commitSession, getSession } from "~/lib/session.server";
import { updateUser } from "~/models/user.model";
import { AlertTriangle, Shield, Trash2, Camera, Save, User, Mail } from "lucide-react";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  return json({ user });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = await requireUserSession(request);

  // Custom upload handler to save files to public/uploads
  const uploadHandler: UploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      directory: "./public/uploads", // Ensure this directory exists
      file: ({ filename }) => filename,
      maxPartSize: 5_000_000, // 5MB
    }),
    // fallback to memory for other fields
    unstable_createMemoryUploadHandler()
  );

  let formData;
  try {
    formData = await unstable_parseMultipartFormData(request, uploadHandler);
  } catch (error) {
    // Fallback if not multipart (e.g. simple update without file)
    formData = await request.formData();
  }

  const intent = formData.get("intent") as string;
  console.log("📝 Action Intent:", intent); // Debug logging

  if (intent === "update_profile") {
    const first_name = formData.get("first_name") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const photo = formData.get("photo"); // This might be a File object node ref

    const updateData: any = {};
    if (first_name) {
      // Split if user enters full name
      const parts = first_name.split(' ');
      updateData.first_name = parts[0];
      if (parts.length > 1) updateData.last_name = parts.slice(1).join(' ');
      else updateData.first_name = first_name;
    }
    if (username) updateData.username = username;
    if (email && email !== user.email) updateData.email = email;

    // Handle photo upload success
    if (photo && typeof photo === 'object' && 'name' in photo && (photo as any).size > 0) {
      // Construct public URL. Assuming standard remix public mapping
      updateData.photoUrl = `/uploads/${(photo as any).name}`;
    }

    if (Object.keys(updateData).length > 0) {
      try {
        const updatedUser = await updateUser(user.userId, updateData);

        // Update Session
        if (updatedUser.first_name) session.set("first_name", updatedUser.first_name);
        if (updatedUser.last_name) session.set("last_name", updatedUser.last_name);
        if (updatedUser.email) session.set("email", updatedUser.email);
        if (updatedUser.photoUrl) session.set("photoUrl", updatedUser.photoUrl);
        if (updatedUser.username) session.set("username", updatedUser.username);

        return json(
          { success: true, message: "Profile updated successfully" },
          { headers: { "Set-Cookie": await commitSession(session) } }
        );

      } catch (error: any) {
        return json({ error: error.message || "Failed to update profile" }, { status: 400 });
      }
    }
    return json({ success: true, message: "No changes made" });
  }

  // ... (Keep existing delete logic placeholders)
  if (intent === "send_otp") {
    return json({ success: true, message: "OTP sent (Placeholder)", otpSent: true });
  }
  if (intent === "delete_account") {
    return json({ success: true, message: "Account deleted (Placeholder)", accountDeleted: true });
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function UserSettingsDashboard() {
  const { user } = useLoaderData<typeof loader>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(user.photoUrl || null);

  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    const handleResize = () => setIsSidebarCollapsed(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F7F6F3]">
      {!isSidebarCollapsed && <Sidebar />}

      <main className="flex-1 md:ml-64 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-semibold text-gray-800">User Settings</h1>

          {/* Messages */}
          {actionData?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{actionData.message}</p>
            </div>
          )}
          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{actionData.error}</p>
            </div>
          )}

          {/* Profile Form */}
          <Form method="post" encType="multipart/form-data" className="bg-white p-6 rounded-2xl shadow">
            <input type="hidden" name="intent" value="update_profile" />
            <h2 className="text-xl font-semibold mb-6 text-gray-700 flex items-center gap-2">
              <User className="w-5 h-5" /> Profile
            </h2>

            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <img
                    src={previewImage || "/assets/avatar-placeholder.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                    <input type="file" name="photo" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
                <span className="text-xs text-gray-500">Click to upload</span>
              </div>

              {/* Info Fields */}
              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="first_name"
                      defaultValue={`${user.first_name} ${user.last_name}`}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username / Display Name</label>
                    <input
                      type="text"
                      name="username"
                      defaultValue={user.username || ""}
                      placeholder="@username"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-xs text-gray-400">(Changing this may require re-verification)</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      defaultValue={user.email}
                      className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </Form>

          {/* Placeholder for Delete Account */}
          <section className="bg-red-50 p-6 rounded-2xl shadow border border-red-200 opacity-70">
            <h2 className="text-xl font-semibold mb-2 text-red-700 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Danger Zone
            </h2>
            <p className="text-sm text-red-600 mb-4">Account deletion is disabled for this demo.</p>
          </section>

        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { json, redirect, unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import type { ActionFunction, LoaderFunction, UploadHandler } from "@remix-run/node";
import { Layout } from "~/components/Layout";
import { requireUserSession, commitSession, getSession } from "~/lib/session.server";
import { updateUser, deleteUser, saveOTP, verifyStoredOTP } from "~/models/user.model";
import { AlertTriangle, Shield, Trash2, Camera, Save, User, Mail, CheckCircle, Smartphone, Key } from "lucide-react";
import { sendLoginOTP } from "~/services/sms.server";

import { getEnhancedUser } from "~/utils/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getEnhancedUser(request);
  return json({ user });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = await requireUserSession(request);

  const uploadHandler: UploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      directory: "./public/uploads",
      file: ({ filename }) => filename,
      maxPartSize: 5_000_000,
    }),
    unstable_createMemoryUploadHandler()
  );

  let formData;
  try {
    formData = await unstable_parseMultipartFormData(request, uploadHandler);
  } catch (error) {
    formData = await request.formData();
  }

  const intent = formData.get("intent") as string;

  if (intent === "update_profile") {
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const photo = formData.get("photo");

    const updateData: any = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (username) updateData.username = username;
    if (email && email !== user.email) updateData.email = email;

    if (photo && typeof photo === 'object' && 'name' in photo && (photo as any).size > 0) {
      updateData.photoUrl = `/uploads/${(photo as any).name}`;
    }

    if (Object.keys(updateData).length > 0) {
      try {
        const updatedUser = await updateUser(user.userId, updateData);

        if (updatedUser.first_name) session.set("first_name", updatedUser.first_name);
        if (updatedUser.last_name) session.set("last_name", updatedUser.last_name);
        if (updatedUser.email) session.set("email", updatedUser.email);
        if (updatedUser.photoUrl) session.set("photoUrl", updatedUser.photoUrl);
        if (updatedUser.username) session.set("username", updatedUser.username);

        return json(
          { success: true, message: "Profile successfully updated!" },
          { headers: { "Set-Cookie": await commitSession(session) } }
        );
      } catch (error: any) {
        return json({ error: error.message || "Failed to update profile" }, { status: 400 });
      }
    }
    return json({ success: true, message: "No data changed." });
  }

  if (intent === "request_delete_otp") {
    try {
      if (!user.phone) {
        return json({ error: "No registered phone number found. Please contact support." }, { status: 400 });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Save to DB
      await saveOTP(user.userId, otp);

      // Send SMS
      const cleanPhone = user.phone.replace(/\D/g, "");
      const smsResult = await sendLoginOTP(cleanPhone, otp);

      if (!smsResult.success) {
        return json({ error: "Failed to send verification code. Please try again." }, { status: 500 });
      }

      return json({ success: true, otpSent: true, message: "Verification code sent to your registered number." });
    } catch (error: any) {
      return json({ error: error.message || "Failed to request verification code" }, { status: 400 });
    }
  }

  if (intent === "verify_delete_otp") {
    const otp = formData.get("otp") as string;
    if (!otp) {
      return json({ error: "Verification code is required" }, { status: 400 });
    }

    try {
      const isValid = await verifyStoredOTP(user.userId, otp);
      if (isValid) {
        // Delete user
        await deleteUser(user.userId);

        // Clear session and redirect to logout
        return redirect("/auth/logout");
      } else {
        return json({ error: "Invalid or expired verification code" }, { status: 400 });
      }
    } catch (error: any) {
      return json({ error: error.message || "Failed to verify code" }, { status: 400 });
    }
  }

  if (intent === "delete_account") {
    return json({ error: "Use OTP-based deletion instead." }, { status: 403 });
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function UserSettingsDashboard() {
  const { user } = useLoaderData<typeof loader>();
  const [previewImage, setPreviewImage] = useState<string | null>(user.photoUrl || null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"confirm" | "otp">("confirm");
  const [otpValue, setOtpValue] = useState("");

  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.otpSent) {
      setDeleteStep("otp");
    }
  }, [actionData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteStep("confirm");
    setOtpValue("");
  };

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-500 mt-2">Manage your personal information and preferences.</p>
          </div>

          {actionData?.success && actionData?.message && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-5 h-5" />
              {actionData.message}
            </div>
          )}
          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-5 h-5" />
              {actionData.error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <Form method="post" encType="multipart/form-data" className="p-8 space-y-8">
              <input type="hidden" name="intent" value="update_profile" />

              <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-100">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                    <img
                      src={previewImage || "/assets/avatar-placeholder.png"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                    <Camera className="w-8 h-8 text-white" />
                    <input type="file" name="photo" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500 mt-1">Accepts JPG, PNG or GIF up to 5MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    defaultValue={user.first_name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    defaultValue={user.last_name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-gray-400 font-medium">@</span>
                    <input
                      type="text"
                      name="username"
                      defaultValue={user.username || ""}
                      placeholder="username"
                      className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      defaultValue={user.email}
                      className="w-full pl-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">If you change your email, you may need to verify it again.</p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">Saving...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </Form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-red-600 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Permanently delete your account and all of your content. This action is not reversible.
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg font-medium text-sm border border-red-200 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>

                {deleteStep === "confirm" ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-red-600">
                      <div className="p-3 bg-red-100 rounded-full">
                        <Trash2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold">Delete Account?</h3>
                    </div>

                    <div className="space-y-4">
                      <p className="text-gray-600 leading-relaxed">
                        Are you sure you want to delete your account? All of your data, including company profiles and reports, will be <span className="font-bold text-gray-900">permanently removed</span>.
                      </p>

                      <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex gap-3 text-sm text-yellow-800">
                        <Shield className="w-5 h-5 shrink-0" />
                        <p>We will send a verification code to your registered number <span className="font-bold">{user.phone}</span> to confirm this action.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        onClick={closeDeleteModal}
                        className="px-6 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <Form method="post">
                        <input type="hidden" name="intent" value="request_delete_otp" />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-md shadow-red-200 transition-all flex items-center gap-2"
                        >
                          {isSubmitting ? "Sending..." : (
                            <>
                              <Smartphone className="w-4 h-4" />
                              Send Code
                            </>
                          )}
                        </button>
                      </Form>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-orange-600">
                      <div className="p-3 bg-orange-100 rounded-full">
                        <Key className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold">Verify Deletion</h3>
                    </div>

                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Enter the 6-digit code sent to your mobile device to complete account deletion.
                      </p>

                      <Form method="post" className="space-y-4">
                        <input type="hidden" name="intent" value="verify_delete_otp" />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                          <input
                            type="text"
                            name="otp"
                            maxLength={6}
                            placeholder="000000"
                            required
                            className="w-full px-4 py-3 text-center text-3xl font-mono tracking-[0.5em] border-2 border-orange-100 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
                            autoFocus
                          />
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                          <button
                            type="button"
                            onClick={() => setDeleteStep("confirm")}
                            className="px-6 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-md shadow-red-200 transition-all flex items-center gap-2"
                          >
                            {isSubmitting ? "Verifying..." : "Confirm Deletion"}
                          </button>
                        </div>
                      </Form>

                      <div className="text-center">
                        <Form method="post">
                          <input type="hidden" name="intent" value="request_delete_otp" />
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="text-sm text-gray-500 hover:text-orange-600 transition-colors"
                          >
                            Didn't receive code? Resend
                          </button>
                        </Form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}

// app/routes/admin.profile._index.tsx
import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import {
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightStartOnRectangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// Dummy Data
interface AdminProfile {
  name: string;
  email: string;
  role: string;
  assignedCompanies: string[];
  lastLogin: string;
  status: "Active" | "Suspended";
  twoFactorEnabled: boolean;
  notificationPreferences: {
    companyActivity: boolean;
    aiReportApprovals: boolean;
    blogSchedule: boolean;
    securityAlerts: boolean;
  };
  newsletterSubscription: boolean;
  themeMode: "light" | "dark";
  language: "English" | "Spanish";
  sidebarCollapsePreference: boolean;
  apiToken?: string;
}

interface LoginSession {
  ip: string;
  device: string;
  location: string;
  timestamp: string;
}

const dummyProfile: AdminProfile = {
  name: "John Doe",
  email: "john.doe@yourcompany.com",
  role: "Super Admin",
  assignedCompanies: ["All Companies"],
  lastLogin: "2025-07-26 10:30 AM (from 192.168.1.1)",
  status: "Active",
  twoFactorEnabled: false,
  notificationPreferences: {
    companyActivity: true,
    aiReportApprovals: false,
    blogSchedule: true,
    securityAlerts: true,
  },
  newsletterSubscription: true,
  themeMode: "light",
  language: "English",
  sidebarCollapsePreference: true,
  apiToken: "sk_abc123def456ghi789jkl012mno345pqr", // Optional for power users
};

const dummyLoginSessions: LoginSession[] = [
  { ip: "203.0.113.45", device: "Chrome on macOS", location: "Lucknow, India", timestamp: "2025-07-26 10:30 AM" },
  { ip: "198.51.100.20", device: "Firefox on Windows", location: "New York, USA", timestamp: "2025-07-25 04:15 PM" },
  { ip: "192.0.2.10", device: "Safari on iOS", location: "London, UK", timestamp: "2025-07-24 09:00 AM" },
  { ip: "203.0.113.45", device: "Chrome on macOS", location: "Lucknow, India", timestamp: "2025-07-23 07:00 PM" },
  { ip: "198.51.100.20", device: "Firefox on Windows", location: "New York, USA", timestamp: "2025-07-22 11:00 AM" },
];

export const loader = async () => {
  // In a real app, fetch admin profile data and login sessions from a database
  return json({
    profile: dummyProfile,
    loginSessions: dummyLoginSessions,
    // For 2FA, you'd typically generate a QR code URI here if 2FA is not enabled
    // For demo, we'll just simulate it.
    qrCodeSvg: "https://via.placeholder.com/150?text=QR+Code", // Placeholder for actual QR code
    backupCodes: ["CODE-1234", "CODE-5678", "CODE-9012"], // Placeholder
  });
};

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");

  // Simulate delays for network requests
  await new Promise((resolve) => setTimeout(resolve, 500));

  switch (actionType) {
    case "updateBasicInfo": {
      const name = formData.get("name");
      const email = formData.get("email"); // If email is editable
      // Validate and save to DB
      console.log("Updating basic info:", { name, email });
      return json({ success: true, message: "Basic info updated successfully!" });
    }
    case "changePassword": {
      const currentPassword = formData.get("currentPassword");
      const newPassword = formData.get("newPassword");
      const confirmNewPassword = formData.get("confirmNewPassword");

      if (newPassword !== confirmNewPassword) {
        return json({ success: false, message: "New passwords do not match." }, { status: 400 });
      }
      // In a real app: Verify current password, hash new password, update DB
      console.log("Changing password:", { currentPassword, newPassword });
      return json({ success: true, message: "Password changed successfully!" });
    }
    case "toggle2FA": {
      const isEnabled = formData.get("twoFactorEnabled") === "on";
      // Update 2FA status in DB
      console.log("2FA toggled to:", isEnabled);
      return json({ success: true, message: `2FA ${isEnabled ? "enabled" : "disabled"} successfully!` });
    }
    case "logoutAllDevices": {
      // Invalidate all active sessions for this user in DB
      console.log("Logging out from all devices");
      return json({ success: true, message: "Logged out from all devices." });
    }
    case "updateNotifications": {
      const companyActivity = formData.get("companyActivity") === "on";
      const aiReportApprovals = formData.get("aiReportApprovals") === "on";
      const blogSchedule = formData.get("blogSchedule") === "on";
      const securityAlerts = formData.get("securityAlerts") === "on";
      const newsletterSubscription = formData.get("newsletterSubscription") === "on";
      // Update notification preferences in DB
      console.log("Updating notification preferences:", { companyActivity, aiReportApprovals, blogSchedule, securityAlerts, newsletterSubscription });
      return json({ success: true, message: "Notification preferences updated!" });
    }
    case "updatePersonalPreferences": {
      const themeMode = formData.get("themeMode");
      const language = formData.get("language");
      const sidebarCollapsePreference = formData.get("sidebarCollapsePreference") === "on";
      // Update personal preferences in DB
      console.log("Updating personal preferences:", { themeMode, language, sidebarCollapsePreference });
      return json({ success: true, message: "Personal preferences updated!" });
    }
    case "deleteAccount": {
      // In a real app: Perform strong verification (password, 2FA) before deletion
      // This is a destructive action and should be handled with extreme care.
      console.log("Attempting to delete admin account");
      // Simulate successful deletion and redirect to logout/home page
      return redirect("/logout"); // Or a confirmation page
    }
    default:
      return json({ success: false, message: "Invalid action." }, { status: 400 });
  }
};

// Helper for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminProfileSettings() {
  const { profile, loginSessions, qrCodeSvg, backupCodes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [isEditingEmail, setIsEditingEmail] = useState(false); // State to manage email edit

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Profile Settings</h1>

      {actionData?.success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.857a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4.25-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{actionData.message}</p>
            </div>
          </div>
        </div>
      )}
      {!actionData?.success && actionData?.message && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94l-1.72-1.72z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{actionData.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- Basic Info --- */}
      <section className="mb-8 border-b border-gray-200 pb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <UserCircleIcon className="h-7 w-7 mr-2 text-indigo-600" /> Basic Information
        </h2>
        <Form method="post" className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6" onSubmit={() => alert('Updating basic info...')}>
          <input type="hidden" name="_action" value="updateBasicInfo" />
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={profile.name}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="email"
                name="email"
                id="email"
                defaultValue={profile.email}
                readOnly={!isEditingEmail} // Read-only by default
                className={classNames(
                  "block w-full rounded-md border-gray-300 sm:text-sm",
                  !isEditingEmail ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "focus:border-indigo-500 focus:ring-indigo-500"
                )}
                required
              />
              {/* This button toggles editability, actual save button is below */}
              <button
                type="button"
                onClick={() => setIsEditingEmail(!isEditingEmail)}
                className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title={isEditingEmail ? "Cancel Edit" : "Edit Email"}
              >
                {isEditingEmail ? "Cancel" : "Edit"}
              </button>
            </div>
            {isEditingEmail && (
                <p className="mt-1 text-xs text-gray-500">Note: Changing email might require re-verification.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded-md">{profile.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned Companies</label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded-md">
              {profile.assignedCompanies.join(", ")}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Login</label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded-md">{profile.lastLogin}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <p className="mt-1 text-sm">
              <span
                className={classNames(
                  profile.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800",
                  "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                )}
              >
                {profile.status}
              </span>
            </p>
          </div>
          <div className="sm:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save Basic Info
            </button>
          </div>
        </Form>
      </section>

      {/* --- Password & Security --- */}
      <section className="mb-8 border-b border-gray-200 pb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <KeyIcon className="h-7 w-7 mr-2 text-indigo-600" /> Password & Security
        </h2>

        {/* Change Password */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Change Password</h3>
          <Form method="post" className="grid grid-cols-1 gap-y-4 max-w-lg" onSubmit={() => alert('Changing password...')}>
            <input type="hidden" name="_action" value="changePassword" />
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                autoComplete="current-password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                autoComplete="new-password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                name="confirmNewPassword"
                id="confirmNewPassword"
                autoComplete="new-password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Change Password
              </button>
            </div>
          </Form>
        </div>

        {/* Enable / Manage 2FA */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Two-Factor Authentication (2FA)</h3>
          <Form method="post" className="space-y-4" onSubmit={() => alert(`2FA will be ${profile.twoFactorEnabled ? 'disabled' : 'enabled'}.`)}>
            <input type="hidden" name="_action" value="toggle2FA" />
            <div className="flex items-center">
              <input
                id="twoFactorEnabled"
                name="twoFactorEnabled"
                type="checkbox"
                defaultChecked={profile.twoFactorEnabled}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                onChange={(e) => {
                  // This is a client-side visual update, actual change happens on form submit
                  console.log("2FA checkbox changed:", e.target.checked);
                }}
              />
              <label htmlFor="twoFactorEnabled" className="ml-2 block text-sm font-medium text-gray-700">
                {profile.twoFactorEnabled ? "2FA is currently ENABLED" : "2FA is currently DISABLED"}
              </label>
            </div>

            {!profile.twoFactorEnabled ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-w-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">To enable 2FA:</p>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 mb-3">
                  <li>Scan the QR code below with your authenticator app (e.g., Google Authenticator, Authy).</li>
                  <li>Enter the 6-digit code from your app into the verification field (not shown in this demo).</li>
                  <li>Click 'Enable 2FA'.</li>
                </ol>
                <div className="flex justify-center my-4">
                  <img src={qrCodeSvg} alt="2FA QR Code" className="w-32 h-32 border border-gray-300 p-1" />
                </div>
                {/* In a real app, there would be an input for the 2FA code here */}
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Enable 2FA
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-w-lg">
                <p className="text-sm text-gray-700 mb-2">
                  2FA is active. Keep your backup codes safe!
                </p>
                <p className="text-sm font-medium text-gray-800">Backup Codes:</p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                  {backupCodes.map((code) => (
                    <li key={code} className="bg-white p-2 rounded-md border border-dashed border-gray-300">{code}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => alert('Generating new backup codes...')}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-2"
                >
                  Generate New Backup Codes
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Disable 2FA
                </button>
              </div>
            )}
          </Form>
        </div>

        {/* Login Activity */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Login Activity</h3>
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    IP Address
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Device / Browser
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Location
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loginSessions.map((session, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {session.ip}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{session.device}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{session.location}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{session.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Form method="post" onSubmit={() => confirm("Are you sure you want to log out from all other devices?")}>
              <input type="hidden" name="_action" value="logoutAllDevices" />
              <button
                type="submit"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Logout from all devices
              </button>
            </Form>
          </div>
        </div>
      </section>

      {/* --- Notification Preferences --- */}
      <section className="mb-8 border-b border-gray-200 pb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <BellIcon className="h-7 w-7 mr-2 text-indigo-600" /> Notification Preferences
        </h2>
        <Form method="post" className="max-w-lg space-y-4" onSubmit={() => alert('Updating notification preferences...')}>
          <input type="hidden" name="_action" value="updateNotifications" />
          <fieldset>
            <legend className="sr-only">Email Notifications</legend>
            <div className="text-base font-medium text-gray-900 mb-2">Email Notifications</div>
            <div className="space-y-3">
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="companyActivity"
                    name="companyActivity"
                    type="checkbox"
                    defaultChecked={profile.notificationPreferences.companyActivity}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="companyActivity" className="font-medium text-gray-900">Company activity</label>
                  <p className="text-gray-500">New user joined, invoice requested, status changes, etc.</p>
                </div>
              </div>
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="aiReportApprovals"
                    name="aiReportApprovals"
                    type="checkbox"
                    defaultChecked={profile.notificationPreferences.aiReportApprovals}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="aiReportApprovals" className="font-medium text-gray-900">AI Report Approvals Pending</label>
                  <p className="text-gray-500">Notify when AI-generated reports are awaiting your review.</p>
                </div>
              </div>
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="blogSchedule"
                    name="blogSchedule"
                    type="checkbox"
                    defaultChecked={profile.notificationPreferences.blogSchedule}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="blogSchedule" className="font-medium text-gray-900">Blog Publish Schedule</label>
                  <p className="text-gray-500">Reminders for upcoming blog posts or content deadlines.</p>
                </div>
              </div>
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="securityAlerts"
                    name="securityAlerts"
                    type="checkbox"
                    defaultChecked={profile.notificationPreferences.securityAlerts}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="securityAlerts" className="font-medium text-gray-900">Security Alerts</label>
                  <p className="text-gray-500">Notifications for suspicious login attempts or new device logins.</p>
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <div className="text-base font-medium text-gray-900 mb-2 mt-4">Internal Newsletter</div>
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="newsletterSubscription"
                  name="newsletterSubscription"
                  type="checkbox"
                  defaultChecked={profile.newsletterSubscription}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="newsletterSubscription" className="font-medium text-gray-900">Subscribe to internal updates</label>
                <p className="text-gray-500">Receive emails about new features, system updates, and important announcements.</p>
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save Notification Preferences
            </button>
          </div>
        </Form>
      </section>

      {/* --- Account Actions --- */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <SwatchIcon className="h-7 w-7 mr-2 text-indigo-600" /> Account Actions
        </h2>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Logout</h3>
          <p className="text-sm text-gray-600 mb-3">
            Clicking this button will securely log you out of the current session.
          </p>
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to log out?")) {
                window.location.href = "/logout"; // Redirect to a logout route
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <ArrowRightStartOnRectangleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Logout
          </button>
        </div>

        <div className="border border-red-300 bg-red-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-red-800 mb-2">Delete My Admin Account</h3>
          <p className="text-sm text-red-700 mb-3">
            This action is irreversible and will permanently delete your admin account and all associated data.
            Please proceed with extreme caution.
          </p>
          <Form method="post" onSubmit={() => confirm("Are you absolutely sure you want to delete your admin account? This action cannot be undone and is highly destructive.")}>
            <input type="hidden" name="_action" value="deleteAccount" />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700"
            >
              <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Delete My Admin Account
            </button>
          </Form>
        </div>
      </section>
    </div>
  );
}



import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Layout } from "~/components/Layout";

export default function SettingsPage() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sessions] = useState([
    { id: 1, device: "Chrome on Mac", lastActive: "Just now" },
    { id: 2, device: "Safari on iPhone", lastActive: "2 days ago" },
  ]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setAvatar(e.target.files[0]);
  };

  return (
    <Layout>
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-semibold">Settings</h1>

      {/* ✅ Two-Factor Authentication */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Enable Two-Factor Authentication</h2>
          <p className="text-gray-500 text-sm">Extra security with an authenticator app</p>
        </div>
        <Switch
          checked={twoFAEnabled}
          onCheckedChange={(v) => {
            setTwoFAEnabled(v);
            if (v) setIs2FAModalOpen(true);
          }}
        />
      </div>

      {/* ✅ Change Password */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-medium">Change Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-cyan-500"
        />
        <button className="bg-cyan-600 text-white px-4 py-2 rounded-xl hover:bg-cyan-700 transition">
          Update Password
        </button>
      </div>

      {/* ✅ Avatar Upload */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-medium">Profile Picture</h2>
        <div className="flex items-center space-x-4">
          {avatar ? (
            <img src={URL.createObjectURL(avatar)} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500">?</div>
          )}
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* ✅ Email & Phone Verification */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 space-y-2">
        <h2 className="text-lg font-medium">Contact Verification</h2>
        <div className="flex items-center justify-between">
          <span>Email: user@example.com</span>
          {emailVerified ? (
            <span className="text-green-500 font-medium">Verified</span>
          ) : (
            <button className="text-cyan-600 hover:underline">Verify</button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span>Phone: +1234567890</span>
          {phoneVerified ? (
            <span className="text-green-500 font-medium">Verified</span>
          ) : (
            <button className="text-cyan-600 hover:underline">Verify</button>
          )}
        </div>
      </div>

      {/* ✅ Active Sessions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-medium">Active Sessions</h2>
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between text-sm">
              <span>{s.device}</span>
              <span className="text-gray-500">{s.lastActive}</span>
            </li>
          ))}
        </ul>
        <button className="text-red-600 hover:underline text-sm">Log out all other sessions</button>
      </div>

      {/* ✅ Danger Zone */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="text-lg font-medium text-red-600">Danger Zone</h2>
        <button className="mt-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition">
          Delete Account
        </button>
      </div>

      {/* ✅ 2FA Modal */}
      <Dialog open={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)}>
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-xl"
          >
            <Dialog.Title className="text-lg font-medium mb-4">Set up Two-Factor Authentication</Dialog.Title>
            <p className="text-sm text-gray-500 mb-4">Scan the QR with your authenticator app & enter the code.</p>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 mb-4 flex items-center justify-center">QR CODE</div>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              className="w-full mb-4 rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-cyan-500"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => { setIs2FAModalOpen(false); setTwoFAEnabled(false); }} className="text-gray-500 hover:underline">Cancel</button>
              <button className="bg-cyan-600 text-white px-4 py-2 rounded-xl hover:bg-cyan-700 transition">Confirm</button>
            </div>
          </motion.div>
        </div>
      </Dialog>
    </div>
    </Layout>
  );
}

function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  className = "",
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className={`
          w-11 h-6 rounded-full
          bg-gray-400 peer-checked:bg-cyan-600
          peer-focus:ring-2 peer-focus:ring-cyan-500 dark:bg-gray-700
          transition
        `}
      ></div>
      <div
        className={`
          absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition
          peer-checked:translate-x-5
        `}
      ></div>
    </label>
  );
}
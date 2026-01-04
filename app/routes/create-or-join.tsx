import { useState } from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { redirect, json, type ActionFunctionArgs } from "@remix-run/node";
import { motion, AnimatePresence } from "framer-motion";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("_intent");

  if (intent === "join") {
    const code = formData.get("inviteCode")?.toString().trim();
    if (!code) {
      return json({ errors: { inviteCode: "Invite code is required" } }, { status: 400 });
    }

    // Simulate lookup
    const orgId = "org-join-456";
    return redirect(`/orgs/${orgId}/dashboard`);
  }

  if (intent === "create") {
    // Simulate creation logic and backend-generated name
    return redirect("/onboarding");
  }

  return json({ errors: { form: "Invalid submission" } }, { status: 400 });
}

export default function OrgEntryDiscordStyle() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-gray-900 to-indigo-950 flex flex-col items-center justify-center px-4 py-10 text-white relative overflow-hidden">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        What would you like to do?
      </motion.h1>

      <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Create */}
        <Form method="post">
          <input type="hidden" name="_intent" value="create" />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full h-44 bg-white/10 backdrop-blur-md rounded-2xl flex flex-col justify-center items-center shadow-md hover:shadow-xl transition"
          >
            <span className="text-xl font-semibold">Create New Organization</span>
            <span className="text-sm text-gray-300 mt-2">Set it up in the next step</span>
          </motion.button>
        </Form>

        {/* Join */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowJoinModal(true)}
          className="w-full h-44 bg-white/10 backdrop-blur-md rounded-2xl flex flex-col justify-center items-center shadow-md hover:shadow-xl transition"
        >
          <span className="text-xl font-semibold">Join with Invite</span>
          <span className="text-sm text-gray-300 mt-2">Already invited? Use your code</span>
        </motion.button>
      </div>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl text-gray-900 relative"
            >
              <h2 className="text-lg font-semibold mb-4">Join Organization</h2>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="_intent" value="join" />
                <div>
                  <label className="block text-sm mb-1">Invite Code</label>
                  <input
                    name="inviteCode"
                    required
                    placeholder="e.g. 9X2FJQ"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {actionData?.errors?.inviteCode && (
                    <p className="text-sm text-red-600 mt-1">{actionData.errors.inviteCode}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Joining..." : "Join"}
                  </button>
                </div>
              </Form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
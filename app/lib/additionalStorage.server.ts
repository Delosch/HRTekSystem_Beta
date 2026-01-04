import { getSession } from "./session.server";

/**
 * Get the current additional_storage object from session.
 */
export async function getAdditionalStorage(request) {
  const session = await getSession(request.headers.get("Cookie"));
  return session.get("additional_storage") ?? {};
}

/**
 * Replace the whole additional_storage object in session.
 */
export async function setAdditionalStorage(request, newStorage) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("additional_storage", newStorage);
  return {
    session,
    newStorage,
  };
}

/**
 * Merge/patch one or more keys into additional_storage object.
 */
export async function patchAdditionalStorage(request, updates) {
  const session = await getSession(request.headers.get("Cookie"));
  const current = session.get("additional_storage") ?? {};
  const merged = { ...current, ...updates };
  session.set("additional_storage", merged);
  return {
    session,
    newStorage: merged,
  };
}

/**
 * Remove one or many keys from additional_storage.
 */
export async function removeFromAdditionalStorage(request, keys) {
  const session = await getSession(request.headers.get("Cookie"));
  const current = session.get("additional_storage") ?? {};
  for (const key of keys) {
    delete current[key];
  }
  session.set("additional_storage", current);
  return {
    session,
    newStorage: current,
  };
}

// === USAGE EXAMPLES (in your loader or action) ===

/**
 * Add or update keys in additional_storage
 */
export const action = async ({ request }) => {
  // Add or update
  const { session, newStorage } = await patchAdditionalStorage(request, {
    organizations: ["org-123", "org-567"],
    activeOrganizationId: "org-123",
    preferredTheme: "dark",
  });

  // Always commit the session in your response headers!
  return new Response(JSON.stringify(newStorage), {
    headers: { "Set-Cookie": await commitSession(session) },
  });
};

/**
 * Remove a key
 */
export const removeThemeAction = async ({ request }) => {
  const { session, newStorage } = await removeFromAdditionalStorage(
    request,
    ["preferredTheme"]
  );
  return new Response(JSON.stringify(newStorage), {
    headers: { "Set-Cookie": await commitSession(session) },
  });
};

/**
 * Read current additional_storage
 */
export const loader = async ({ request }) => {
  const data = await getAdditionalStorage(request);
  return new Response(JSON.stringify(data));
};
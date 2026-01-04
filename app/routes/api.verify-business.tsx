import { ActionFunction, json } from "@remix-run/node";
import { verifyBusinessId } from "~/services/decentro.server";
import { requireUserSession } from "~/lib/session.server";

export const action: ActionFunction = async ({ request }) => {
    // 1. Verify User Session
    const user = await requireUserSession(request);
    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Request
    const formData = await request.formData();
    const type = formData.get("type") as "GST" | "PAN" | "CIN"; // CIN isn't in frontend yet, but supported
    const id = formData.get("id") as string;

    if (!type || !id) {
        return json({ error: "Type and ID are required" }, { status: 400 });
    }

    try {
        // 3. Call Decentro Service
        const result = await verifyBusinessId(type, id);

        if (result.status === "success") {
            // Map the response data to a common structure for the frontend
            let mappedData = {};

            if (type === "GST") {
                const addr = result.data?.primaryBusinessAddress;
                let addressString = "";
                let pin = "";

                if (addr && typeof addr === 'object') {
                    const parts = [
                        addr.buildingNumber, addr.buildingName, addr.floorNo,
                        addr.street, addr.location, addr.city, addr.district
                    ].filter(Boolean);
                    addressString = parts.join(", ");
                    pin = addr.pincode;
                } else {
                    addressString = String(result.data?.primaryBusinessAddress || "");
                }

                mappedData = {
                    companyName: result.data?.legalName || result.data?.tradeName || "",
                    companyAddress: addressString,
                    pincode: pin || result.data?.pincode || "",
                };
            } else if (type === "PAN") {
                // Example mapping for PAN
                mappedData = {
                    companyName: result.data?.name || "",
                    // PAN API usually returns less address info, but we can try
                };
            } else if (type === "CIN") {
                mappedData = {
                    companyName: result.data?.companyName || "",
                    companyAddress: result.data?.registeredAddress || "",
                };
            }

            return json({ success: true, data: result.data, mapped: mappedData });
        } else {
            return json({ error: result.message || "Verification failed" }, { status: 400 });
        }

    } catch (error) {
        console.error("Verification API Error:", error);
        return json({ error: "Internal server error" }, { status: 500 });
    }
};

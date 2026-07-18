import dotenv from "dotenv";
dotenv.config();
import { getPendingApprovals, getAllHTIReports } from "./app/models/hti.model.server.js";

async function run() {
    try {
        console.log("Starting model check...");
        const [pendingReports, allReports] = await Promise.all([
            getPendingApprovals(),
            getAllHTIReports()
        ]);
        console.log("Pending reports count:", pendingReports.length);
        console.log("All reports count:", allReports.length);
    } catch (e) {
        console.error("Error in model calls:", e);
    }
}
run();

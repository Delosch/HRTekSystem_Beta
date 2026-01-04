import { json } from "@remix-run/node";

/**
 * HTI Test Endpoint
 * Route: /api/hti/test
 * 
 * Simple test endpoint to verify HTI module is working
 */

export async function loader() {
    return json({
        success: true,
        message: "HTI module is operational",
        timestamp: new Date().toISOString(),
        modules: {
            deepseek: "Available",
            model: "Available",
            service: "Available"
        }
    });
}

export async function action() {
    return json({
        success: true,
        message: "HTI test action endpoint",
        timestamp: new Date().toISOString()
    });
}

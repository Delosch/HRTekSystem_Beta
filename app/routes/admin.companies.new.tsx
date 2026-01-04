import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { ArrowLeftIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { createCompanyProfile } from "~/models/company.model";

export const loader: LoaderFunction = async () => {
    return json({});
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    const companyData = {
        company_name: formData.get("company_name") as string,
        industry: formData.get("industry") as string,
        company_size: formData.get("company_size") as string,
        location: formData.get("location") as string,
        pan_gst_adhaar: formData.get("pan_gst_adhaar") as string,
        contact_person: formData.get("contact_person") as string,
        contact_email: formData.get("contact_email") as string,
        contact_phone: formData.get("contact_phone") as string,
    };

    // Validate required fields
    if (!companyData.company_name || !companyData.industry || !companyData.company_size) {
        return json({ error: "Please fill in all required fields" }, { status: 400 });
    }

    try {
        // Generate a unique organization ID
        const orgId = `ORG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await createCompanyProfile(orgId, companyData);

        return redirect(`/admin/companies/${orgId}`);
    } catch (error) {
        console.error("Error creating company:", error);
        return json({ error: "Failed to create company. Please try again." }, { status: 500 });
    }
};

export default function AddNewCompany() {
    const actionData = useActionData<{ error?: string }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link
                    to="/admin"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    <BuildingOffice2Icon className="w-8 h-8 text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Company</h1>
                        <p className="text-gray-600 mt-1">Onboard a new client to the platform</p>
                    </div>
                </div>
            </div>

            {actionData?.error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{actionData.error}</p>
                </div>
            )}

            <Form method="post" className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
                <div className="space-y-6">
                    {/* Company Information Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                            Company Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="company_name"
                                    name="company_name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., Acme Corporation"
                                />
                            </div>

                            <div>
                                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                                    Industry <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="industry"
                                    name="industry"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Select Industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Education">Education</option>
                                    <option value="Consulting">Consulting</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="company_size" className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Size <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="company_size"
                                    name="company_size"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Select Size</option>
                                    <option value="1-50">1-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="501-1000">501-1000 employees</option>
                                    <option value="1001-5000">1001-5000 employees</option>
                                    <option value="5000+">5000+ employees</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., Mumbai, India"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="pan_gst_adhaar" className="block text-sm font-medium text-gray-700 mb-2">
                                    PAN / GST / Aadhaar
                                </label>
                                <input
                                    type="text"
                                    id="pan_gst_adhaar"
                                    name="pan_gst_adhaar"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., AAACR1234F or 27AAACR1234F1Z5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                            Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Person Name
                                </label>
                                <input
                                    type="text"
                                    id="contact_person"
                                    name="contact_person"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., John Doe"
                                />
                            </div>

                            <div>
                                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Email
                                </label>
                                <input
                                    type="email"
                                    id="contact_email"
                                    name="contact_email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., john@acme.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    id="contact_phone"
                                    name="contact_phone"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., +91 98765 43210"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? "Creating Company..." : "Create Company"}
                        </button>
                        <Link
                            to="/admin"
                            className="flex-1 bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors text-center"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </Form>
        </div>
    );
}

import { useState, useRef, useEffect } from "react";
import { useNavigate, Form, useActionData, useLoaderData, useNavigation, useFetcher } from "@remix-run/react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import {
  ActionFunctionArgs,
  json,
  redirect,
  unstable_parseMultipartFormData,
  unstable_createMemoryUploadHandler,
  LoaderFunction,
} from "@remix-run/node";
import { createCompanyProfile } from "~/models/company.model";
import { uploadFileToS3 } from "~/lib/s3.server";
import { commitSession, getSession, requireUserSession } from "~/lib/session.server";
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  UserIcon,
  PhotoIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { updateUser } from "~/models/user.model";

interface LoaderData {
  fullName: string;
  country_iso: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const cookie_container = await requireUserSession(request);
    console.log("company ", cookie_container.onboardingStatus);
    if (cookie_container.onboardingStatus !== "Company" || cookie_container.onboardingStatus === "Completed") {
      throw new Response("Unauthorized", { status: 401 });
    }
    const fullName = `${cookie_container.first_name || ''} ${cookie_container.last_name || ''}`.trim();
    return json({
      fullName,
      country_iso: cookie_container.country_iso || 'IN' // Default to US if not set
    });
  } catch (error) {
    if (error instanceof Response && error.status === 302) {
      throw error;
    }
    console.error("Loader error during user session retrieval:", error);
    throw new Response("Unauthorized", { status: 401 });
  }
};

interface ActionData {
  error?: string;
  issues?: Array<{ path: string[]; message: string }>;
}

export async function action({ request }: ActionFunctionArgs) {
  const cookie_container = await requireUserSession(request);
  const MAX_FILE_SIZE = 5_000_000; // 5MB
  const ALLOWED_IMAGE_MIMES = ["image/avif", "image/jpeg", "image/png", "image/webp"];

  let user;
  try {
    user = await requireUserSession(request);
    console.log("User session validated for action:", user.userId);
  } catch (error) {
    console.error("Action: User session validation failed.", error);
    if (error instanceof Response) {
      throw error;
    }
    return json({ error: "Authentication required." }, { status: 401 });
  }

  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: MAX_FILE_SIZE,
    filter({ name, contentType, filename }) {
      if (name === "companyLogo") {
        if (!filename) return false; // Skip empty uploads
        if (!contentType || !ALLOWED_IMAGE_MIMES.includes(contentType)) {
          console.warn(`Rejected file upload for ${name}: Invalid content type ${contentType}. Allowed: ${ALLOWED_IMAGE_MIMES.join(', ')}`);
          throw new Error("Invalid image file type. Only AVIF, JPEG, PNG, WEBP are allowed.");
        }
      }
      return true;
    },
  });

  let formData;
  try {
    formData = await unstable_parseMultipartFormData(request, uploadHandler);
    console.log("Form Data Parsed. Keys received:", Array.from(formData.keys()));
  } catch (error: unknown) {
    console.error("Error parsing multipart form data:", error);
    if (error instanceof Error && error.message.includes("Invalid image file type")) {
      return json({ error: error.message }, { status: 400 });
    }
    return json({ error: "Failed to process form data, possibly due to large file size or invalid format." }, { status: 400 });
  }

  const companyName = formData.get("companyName")?.toString() || "";
  const brandName = formData.get("brandName")?.toString() || "";
  const companyAddress = formData.get("companyAddress")?.toString() || "";
  const pincode = formData.get("pincode")?.toString() || "";
  const personName = formData.get("personName")?.toString() || "";
  const role = formData.get("role")?.toString() || "";
  const department = formData.get("department")?.toString() || "";
  const websiteUrl = formData.get("websiteUrl")?.toString() || "";
  const industry = formData.get("industry")?.toString() || "";

  if (!companyName || !companyAddress || !pincode || !personName) {
    console.error("Missing required form fields.");
    return json({ error: "Please fill in all required company and contact details." }, { status: 400 });
  }

  const createdByObject = {
    userId: user.userId,
    name: personName,
    role: role,
    department: department,
  };

  const idTypeField = formData.get("idType")?.toString();
  let panGstAadhaar = "";
  let id_type = "";

  // ENHANCED: Only process Indian business IDs if country is India
  if (user.country_iso === "IN") {
    if (idTypeField === "GST") {
      panGstAadhaar = formData.get("gst")?.toString() || "";
      id_type = "GST";
    } else if (idTypeField === "PAN") {
      panGstAadhaar = formData.get("pan")?.toString() || "";
      id_type = "PAN";
    } else if (idTypeField === "Aadhaar") {
      panGstAadhaar = formData.get("aadhaar")?.toString() || "";
      id_type = "AADHAAR";
    }
  } else {
    // For non-Indian companies, we might handle other ID types or skip this
    console.log(`User country ${user.country_iso} - skipping Indian business ID validation`);
  }

  const logoFile = formData.get("companyLogo");
  let logoUrl = "";

  if (logoFile instanceof File && logoFile.size > 0) {
    console.log(`Attempting to upload logo file: ${logoFile.name} (${logoFile.size} bytes, ${logoFile.type})`);
    try {
      logoUrl = await uploadFileToS3(logoFile, "company-logos");
      console.log("S3 upload successful. Logo URL:", logoUrl);
    } catch (s3Error) {
      console.error("S3 upload failed:", s3Error);
      return json({ error: `Failed to upload logo: ${(s3Error as Error).message}` }, { status: 500 });
    }
  } else if (logoFile instanceof File && logoFile.size === 0) {
    console.warn("User attempted to upload an empty logo file.");
  } else {
    console.log("No logo file provided or invalid file type.");
  }

  let newCompanyId: string;
  try {
    const result = await createCompanyProfile({
      company_name: companyName,
      brand_name: brandName,
      govid_type: id_type,
      pan_gst_adhaar: panGstAadhaar,
      address: companyAddress,
      pin_code: pincode,
      logo_url: logoUrl,
      premises_image_url: "",
      website_url: websiteUrl, // ADDED: Website URL
      industry: industry, // ADDED: Industry
      is_onboarding_completed: false,
      employee_count: 0,
      country_iso: cookie_container.country_iso,
      createdBy: createdByObject,
    });

    // FIX: Extract the id from the result object
    newCompanyId = typeof result === 'string' ? result : result.id;
    console.log("Company profile creation successful. ID:", newCompanyId);
  } catch (error) {
    console.error("Company profile creation failed:", error);
    if (error instanceof Error && error.message.startsWith("Validation Failed:")) {
      try {
        const issues = JSON.parse(error.message.replace("Validation Failed: ", ""));
        return json({ error: "Validation failed. Please check your inputs.", issues }, { status: 400 });
      } catch (parseError) {
        return json({ error: (error as Error).message }, { status: 400 });
      }
    }
    return json({ error: (error as Error).message || "An unexpected error occurred." }, { status: 400 });
  }

  try {
    const session = await getSession(request.headers.get("Cookie"));

    // 🔍 DEBUG STEP 2 → Check what organisationId you are passing
    console.log("DEBUG organisationId passed to updateUser:", newCompanyId);


    await updateUser(user.userId, {
      organisationId: newCompanyId, onboardingStatus: "Assessment",

      // ✅ ADD THESE (this is what dashboard needs)
      name: personName,
      role: role || "Admin",
    });




    // Update the onboarding status
    session.set("onboardingStatus", "Assessment");
    session.set("organisationId", `${newCompanyId}`);

    // Commit the session and redirect
    return redirect("/onboarding/profilingAssessment", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (membershipError) {
    console.error("Failed to create owner membership records:", membershipError);
    return json({ error: "Company created, but failed to establish owner membership. Please contact support." }, { status: 500 });
  }
}

// Enhanced Hover Input Component
const HoverInput = ({
  id,
  name,
  type = "text",
  placeholder,
  required = false,
  value,
  onChange,
  className = "",
}: {
  id: string;
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) => {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = 80;

  return (
    <motion.div
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
            rgba(59, 130, 246, 0.15),
            transparent 80%
          )
        `,
      }}
      className={`relative rounded-lg p-[2px] transition duration-300 ${className}`}
    >
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
        />
      </div>
    </motion.div>
  );
};

// Enhanced Hover Select Component
const HoverSelect = ({
  id,
  name,
  value,
  onChange,
  children,
  className = "",
  disabled = false,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) => {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = 80;

  return (
    <motion.div
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
            rgba(59, 130, 246, 0.15),
            transparent 80%
          )
        `,
      }}
      className={`relative rounded-lg p-[2px] transition duration-300 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default function CompanyBasics() {
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIdType, setSelectedIdType] = useState<"GST" | "PAN" | "Aadhaar" | "CIN">("GST");
  const [idValue, setIdValue] = useState("");
  const { fullName, country_iso } = useLoaderData<LoaderData>();
  const [personName, setPersonName] = useState<string>(fullName);
  const [companyData, setCompanyData] = useState({
    companyName: "",
    brandName: "",
    companyAddress: "",
    pincode: "",
    role: "",
    department: "",
    websiteUrl: "",
    industry: "",
  });

  // Check if user is in India for business ID features
  const isIndianUser = country_iso === "IN";

  useEffect(() => {
    if (actionData?.error && navigation.state === 'idle') {
      setUploadProgress('error');
    }
  }, [actionData, navigation.state]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const ALLOWED_MIMES = ["image/avif", "image/jpeg", "image/png", "image/webp"];

    if (file) {
      if (!ALLOWED_MIMES.includes(file.type)) {
        alert(`Invalid file type. Only AVIF, JPEG, PNG, WEBP images are allowed.`);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setLogoPreview(null);
        setUploadProgress('idle');
        return;
      }
      setLogoPreview(URL.createObjectURL(file));
      setUploadProgress('uploading');
      setTimeout(() => {
        setUploadProgress('uploaded');
      }, 1500);
    } else {
      setLogoPreview(null);
      setUploadProgress('idle');
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setUploadProgress('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add Fetcher for verification
  const verificationFetcher = useFetcher<{ success?: boolean; error?: string; mapped?: any }>();
  const isVerifying = verificationFetcher.state === "submitting" || verificationFetcher.state === "loading";

  // Watch for verification results
  useEffect(() => {
    if (verificationFetcher.data?.success && verificationFetcher.data?.mapped) {
      const mapped = verificationFetcher.data.mapped;
      setCompanyData((prev) => ({
        ...prev,
        companyName: mapped.companyName || prev.companyName,
        companyAddress: mapped.companyAddress || prev.companyAddress,
        pincode: mapped.pincode || prev.pincode,
      }));
    } else if (verificationFetcher.data?.error) {
      // Optional: Show toast or alert
      alert(verificationFetcher.data.error);
    }
  }, [verificationFetcher.data]);

  const fetchFromId = () => {
    if (!idValue) {
      alert("Please enter a valid ID number");
      return;
    }

    // Only works for Indian IDs currently supported by our backend
    if (isIndianUser) {
      // Trigger the verification API
      verificationFetcher.submit(
        { type: selectedIdType, id: idValue },
        { method: "post", action: "/api/verify-business" }
      );
    }
  };

  const isSubmitting = navigation.state === 'submitting';

  // Industry options
  const industryOptions = [
    "Energy",
    "Materials",
    "Industrials",
    "Consumer Discretionary",
    "Consumer Staples",
    "Health Care",
    "Financials",
    "Information Technology",
    "Communication Services",
    "Utilities",
    "Agriculture & Farming",
    "Government & Public Sector",
    "Non-Profit & NGO",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Company Setup</h1>
              <p className="text-sm text-gray-600 mt-1">Set up your company profile to get started</p>
            </div>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Country: {country_iso}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {actionData?.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{actionData.error}</p>
                {actionData.issues && (
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {actionData.issues.map((issue: any, index: number) => (
                      <li key={index}>
                        <strong>{issue.path.join(".")}</strong>: {issue.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <Form method="post" encType="multipart/form-data" className="space-y-8">
          {/* Business Registration Section - ONLY FOR INDIA */}
          {isIndianUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Business Registration (India)</h2>
                  <p className="text-sm text-gray-600">Provide your Indian business identification details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-2">
                    ID Type
                  </label>
                  <HoverSelect
                    id="idType"
                    name="idType"
                    value={selectedIdType}
                    onChange={(e) => setSelectedIdType(e.target.value as "GST" | "PAN" | "Aadhaar")}
                  >
                    <option value="GST">GST Number</option>
                    <option value="PAN">PAN Number</option>
                    <option value="CIN">CIN Number</option>
                    <option value="Aadhaar">Aadhaar Number</option>
                  </HoverSelect>
                </div>

                <div>
                  <label htmlFor="idValue" className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedIdType} Number
                  </label>
                  <div className="flex space-x-2">
                    <HoverInput
                      id="idValue"
                      name={selectedIdType.toLowerCase()}
                      placeholder={`Enter ${selectedIdType}`}
                      value={idValue}
                      onChange={(e) => setIdValue(e.target.value)}
                      className="flex-1"
                    />
                    <motion.button
                      type="button"
                      onClick={fetchFromId}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Fetch
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Company Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isIndianUser ? 0.2 : 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <BuildingOfficeIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Company Information</h2>
                <p className="text-sm text-gray-600">Basic details about your company</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <HoverInput
                  id="companyName"
                  name="companyName"
                  required
                  value={companyData.companyName}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, companyName: e.target.value })
                  }
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <HoverInput
                  id="brandName"
                  name="brandName"
                  value={companyData.brandName}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, brandName: e.target.value })
                  }
                  placeholder="Your product/brand"
                />
              </div>

              <div>
                <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Address <span className="text-red-500">*</span>
                </label>
                <HoverInput
                  id="companyAddress"
                  name="companyAddress"
                  required
                  value={companyData.companyAddress}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, companyAddress: e.target.value })
                  }
                  placeholder="Street, City, State"
                />
              </div>

              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <HoverInput
                  id="pincode"
                  name="pincode"
                  required
                  value={companyData.pincode}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, pincode: e.target.value })
                  }
                  placeholder="123456"
                />
              </div>
            </div>
          </motion.div>

          {/* ADDED: Website & Industry Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isIndianUser ? 0.3 : 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="bg-cyan-100 p-2 rounded-lg mr-3">
                <GlobeAltIcon className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Business Details</h2>
                <p className="text-sm text-gray-600">Additional information about your business</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <HoverInput
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  value={companyData.websiteUrl}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, websiteUrl: e.target.value })
                  }
                  placeholder="https://www.yourcompany.com"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                  Industry (optional)
                </label>
                <HoverSelect
                  id="industry"
                  name="industry"
                  value={companyData.industry}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, industry: e.target.value })
                  }
                >
                  <option value="">Select Industry</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </HoverSelect>
              </div>
            </div>
          </motion.div>

          {/* Logo and Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isIndianUser ? 0.4 : 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Logo Upload */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <PhotoIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Company Logo</h3>
                    <p className="text-sm text-gray-600">Upload your company logo (optional)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <motion.div
                    className="relative rounded-lg p-[2px] transition duration-300 border-2 border-dashed border-gray-300 hover:border-blue-400"
                    whileHover={{ scale: 1.01 }}
                  >
                    <input
                      id="companyLogo"
                      name="companyLogo"
                      type="file"
                      ref={fileInputRef}
                      accept="image/avif, image/jpeg, image/png, image/webp"
                      onChange={handleLogoChange}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-white rounded-lg cursor-pointer p-3"
                    />
                  </motion.div>

                  {logoPreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative w-20 h-20 border border-gray-300 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-sm"
                    >
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="w-full h-full object-contain p-2 rounded-lg"
                      />
                      {uploadProgress === 'uploading' && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {uploadProgress === 'uploaded' && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -top-0 -right-0 bg-red-500 text-white rounded-full p-1.5 text-xs hover:bg-red-600 transition-colors shadow-md z-10 flex items-center justify-center w-6 h-6"
                        >
                          ✕
                        </button>
                      )}
                      {uploadProgress === 'error' && (
                        <div className="absolute inset-0 bg-red-50 flex items-center justify-center p-1 text-xs text-red-600 text-center rounded-lg">
                          Upload Failed
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <UserIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Contact Person</h3>
                    <p className="text-sm text-gray-600">Primary contact for this account</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="personName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <HoverInput
                      id="personName"
                      name="personName"
                      required
                      placeholder="John Doe"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Role / Designation
                    </label>
                    <HoverInput
                      id="role"
                      name="role"
                      placeholder="Founder, HR Manager..."
                      value={companyData.role}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, role: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <HoverInput
                      id="department"
                      name="department"
                      placeholder="e.g., HR, Admin, IT"
                      value={companyData.department}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, department: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Country-specific notice */}
          {!isIndianUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>International Setup:</strong> You're setting up as a {country_iso} company.
                    Indian business ID verification (GST/PAN/Aadhaar) is not required for your location.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Privacy Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Privacy Protected:</strong> We only collect data necessary for your onboarding and legal compliance.
                  Your information is encrypted and stored securely.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-6 border-t border-gray-200"
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Previous
            </button>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[140px] justify-center"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Setting up...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRightIcon className="w-4 h-4 ml-2" />
                </>
              )}
            </motion.button>
          </motion.div>
        </Form>
      </div>
    </div>
  );
}
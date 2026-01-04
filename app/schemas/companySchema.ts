import { z } from "zod";

/**
 * PAN: 10 chars (ABCDE1234F)
 * Aadhaar: 12 digits
 * GSTIN: 15 chars
 */
export const companyProfileSchema = z.object({
  company_name: z.string().trim().min(1, "Company name is required."),
  brand_name: z.string().trim().optional().default(""),
  country_iso: z.string().min(1),
  govid_type: z.string().trim().optional().default(""),
  pan_gst_adhaar: z.string().trim().optional().default(""),
  address: z.string().trim().min(1, "Company address is required."),
  pin_code: z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits."),
  logo_url: z.string().optional().default(""),
  premises_image_url: z.string().optional().default(""),
  is_onboarding_completed: z.boolean().optional().default(false),
  website_url: z.string().trim().optional().default(""),
  industry: z.string().trim().min(1, "Industry is required."),
  employee_count: z.number().int().min(0).optional().default(0),

  createdBy: z
    .object({
      name: z.string().trim().min(1, "Person name is required."),
      userId: z.string().uuid(),
      role: z.string().trim().optional().default(""),
      department: z.string().trim().optional().default(""),
    })
    .optional(),
}).superRefine((data, ctx) => {
  const { country_iso, govid_type, pan_gst_adhaar } = data;

  if (country_iso === "IN") {
    // Validate gov ID type
    if (govid_type && !["PAN", "GST", "AADHAAR", "CIN"].includes(govid_type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["govid_type"],
        message: "Invalid ID type. Must be PAN, GST, AADHAAR, or CIN.",
      });
    }

    // Validate ID formats
    if (govid_type && pan_gst_adhaar) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      const aadhaarRegex = /^\d{12}$/;
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

      let isValid = false;
      let expected = "";

      switch (govid_type) {
        case "PAN":
          isValid = panRegex.test(pan_gst_adhaar);
          expected = "ABCDE1234F";
          break;
        case "GST":
          isValid = gstRegex.test(pan_gst_adhaar);
          expected = "12ABCDE1234F1Z5";
          break;
        case "AADHAAR":
          isValid = aadhaarRegex.test(pan_gst_adhaar);
          expected = "123456789012";
          break;
        case "CIN":
          const cinRegex = /^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
          isValid = cinRegex.test(pan_gst_adhaar);
          expected = "U12345MH2020PTC123456 (21 chars)";
          break;
      }

      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pan_gst_adhaar"],
          message: `Invalid ${govid_type} format. Expected: ${expected}`,
        });
      }
    }
  }
});

// -------------- Types --------------
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

export type CompanyProfileItem = CompanyProfileInput & {
  pk: string;
  sk: string;
  profile_type: string;
  createdAt: string;
};

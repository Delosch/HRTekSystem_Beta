import { json, type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useActionData, Form, useNavigation } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";
import { generateMeta, generateBreadcrumbSchema } from "~/utils/seo";

export const meta: MetaFunction = () => {
  return generateMeta({
    title: "Careers at HRTek System - Join Our Team",
    description: "Explore exciting career opportunities at HRTek System. Join our innovative team transforming HR technology. We're hiring talented professionals passionate about HR innovation.",
    keywords: "HRTek careers, HR tech jobs, join HRTek, HR technology careers, work at HRTek, HR transformation jobs",
    url: "https://www.hrteksystem.com/careers",
    image: "https://www.hrteksystem.com/og-careers.jpg",
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const firstName  = (formData.get("firstName")  as string)?.trim() || "";
  const lastName   = (formData.get("lastName")   as string)?.trim() || "";
  const email      = (formData.get("email")      as string)?.trim() || "";
  const phone      = (formData.get("phone")      as string)?.trim() || "";
  const jobRole    = (formData.get("jobRole")    as string)?.trim() || "";
  const location   = (formData.get("location")  as string)?.trim() || "";
  const resumeFile = formData.get("resume") as File | null;

  if (!firstName || !email || !jobRole) {
    return json({ success: false, error: "Please fill in all required fields." });
  }

  const applicationId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt     = new Date().toISOString();
  const resumeFileName = resumeFile?.name || "Not provided";

  try {
    const { getDynamoDBDocumentClient } = await import("~/lib/dynamodb.server");
    const { PutCommand } = await import("@aws-sdk/lib-dynamodb");
    const ddb = getDynamoDBDocumentClient();
    await ddb.send(new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        pk:           `CAREER#${applicationId}`,
        sk:           "APPLICATION",
        profile_type: "CAREER_APP",
        applicationId,
        firstName, lastName, email, phone, jobRole, location, resumeFileName, createdAt,
        status: "new",
      },
    }));
  } catch (err) {
    console.error("DynamoDB career save error:", err);
  }

  try {
    const nodemailer = await import("nodemailer");
    const hasSmtp  = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    const hasGmail = process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD;

    if (hasSmtp || hasGmail) {
      const transporter = hasSmtp
        ? nodemailer.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          })
        : nodemailer.default.createTransport({
            service: "Gmail",
            auth: { user: process.env.GMAIL_USER, pass: process.env.GOOGLE_APP_PASSWORD },
          });

      const from    = process.env.SMTP_FROM || '"HRTek Careers" <noreply@hrteksystem.com>';
      const support = process.env.SUPPORT_EMAIL || "support@hrteksystem.com";

      const attachments: any[] = [];
      if (resumeFile && resumeFile.size > 0) {
        const buffer = Buffer.from(await resumeFile.arrayBuffer());
        attachments.push({ filename: resumeFile.name, content: buffer });
      }

      const submittedAt = new Date(createdAt).toLocaleString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit", timeZoneName: "short",
      });

      // ── Email 1: Internal notification to support team ──
      await transporter.sendMail({
        from,
        to: support,
        subject: `[Career Application] ${firstName} ${lastName} — ${jobRole}`,
        html: `
          <div style="font-family:'Segoe UI',sans-serif;background:#f4f4f4;padding:20px;">
            <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.1);">
              <div style="background:#023e8a;padding:30px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:22px;">New Career Application</h1>
                <p style="color:#93c5fd;margin:6px 0 0;">Submitted via HRTekSystem Careers Page</p>
              </div>
              <div style="padding:32px;color:#334155;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:8px 0;color:#64748b;width:140px;">Full Name</td><td style="padding:8px 0;font-weight:600;">${firstName} ${lastName}</td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#2563eb;">${email}</a></td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;">Phone</td><td style="padding:8px 0;">${phone || "Not provided"}</td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;">Applying For</td><td style="padding:8px 0;font-weight:600;color:#023e8a;">${jobRole}</td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;">Location</td><td style="padding:8px 0;">${location || "Not specified"}</td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;">Resume</td><td style="padding:8px 0;">${resumeFileName}${attachments.length ? " (attached)" : ""}</td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;">Submitted At</td><td style="padding:8px 0;">${submittedAt}</td></tr>
                </table>
              </div>
              <div style="background:#f8fafc;padding:16px 32px;text-align:center;color:#64748b;font-size:12px;">
                © ${new Date().getFullYear()} HRTekSystem Pvt. Ltd. — HR Transformation Intelligence
              </div>
            </div>
          </div>`,
        attachments,
      });

      // ── Email 2: Confirmation to the applicant ──
      await transporter.sendMail({
        from,
        to: email,
        subject: `We've received your application — ${jobRole} | HRTek System`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
          <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
              <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#023e8a 0%,#0353a4 100%);padding:40px 48px;text-align:center;">
                      <img src="https://www.hrteksystem.com/hrtek_logo.png" alt="HRTek System" style="height:40px;width:auto;margin-bottom:20px;" />
                      <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
                        <span style="font-size:28px;">✅</span>
                      </div>
                      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Application Received!</h1>
                      <p style="color:#93c5fd;margin:8px 0 0;font-size:14px;">We're excited to learn more about you.</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 48px;">
                      <p style="font-size:16px;color:#1e293b;margin:0 0 8px;font-weight:700;">Dear ${firstName},</p>
                      <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 28px;">
                        Thank you for your interest in joining <strong style="color:#023e8a;">HRTek System</strong>. We have successfully received your application for the following position:
                      </p>

                      <!-- Role card -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:12px;margin-bottom:28px;">
                        <tr>
                          <td style="padding:24px 28px;">
                            <p style="margin:0 0 4px;font-size:11px;font-weight:800;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">Position Applied For</p>
                            <p style="margin:0 0 12px;font-size:20px;font-weight:800;color:#023e8a;">${jobRole}</p>
                            <table cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-right:20px;">
                                  <p style="margin:0;font-size:12px;color:#64748b;">📍 &nbsp;Location</p>
                                  <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#334155;">Lucknow, Uttar Pradesh</p>
                                </td>
                                <td>
                                  <p style="margin:0;font-size:12px;color:#64748b;">🕐 &nbsp;Submitted On</p>
                                  <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#334155;">${submittedAt}</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- What happens next -->
                      <p style="font-size:14px;font-weight:800;color:#1e293b;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.5px;">What happens next?</p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        ${[
                          ["🔍", "Profile Review", "Our hiring team will carefully review your application and resume against the role requirements."],
                          ["📞", "Initial Screening", "If your profile is a strong match, we'll reach out within <strong>5–7 business days</strong> to schedule an introductory call."],
                          ["🤝", "Interview Process", "Shortlisted candidates will be guided through our structured interview rounds at a mutually convenient time."],
                        ].map(([icon, title, desc]) => `
                        <tr>
                          <td style="padding:0 0 16px;">
                            <table cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="width:44px;vertical-align:top;padding-top:2px;">
                                  <div style="width:36px;height:36px;background:#f0f7ff;border-radius:8px;text-align:center;line-height:36px;font-size:18px;">${icon}</div>
                                </td>
                                <td style="padding-left:12px;">
                                  <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#1e293b;">${title}</p>
                                  <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">${desc}</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>`).join("")}
                      </table>

                      <div style="border-top:1px solid #e2e8f0;margin:28px 0;"></div>

                      <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 8px;">
                        In the meantime, feel free to explore our platform at <a href="https://www.hrteksystem.com" style="color:#023e8a;font-weight:600;text-decoration:none;">www.hrteksystem.com</a> to learn more about what we're building.
                      </p>
                      <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 28px;">
                        If you have any questions, don't hesitate to write to us at <a href="mailto:support@hrteksystem.com" style="color:#023e8a;font-weight:600;text-decoration:none;">support@hrteksystem.com</a>.
                      </p>
                      <p style="font-size:15px;color:#1e293b;margin:0;">
                        Warm regards,<br/>
                        <strong style="color:#023e8a;">The HRTek Team</strong><br/>
                        <span style="font-size:12px;color:#94a3b8;">HR Transformation Intelligence · Lucknow, India</span>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8fafc;padding:24px 48px;text-align:center;border-top:1px solid #e2e8f0;">
                      <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">
                        © ${new Date().getFullYear()} HRTekSystem Pvt. Ltd. (Delosch Technologies Pvt. Ltd.)
                      </p>
                      <p style="margin:0;font-size:11px;color:#cbd5e1;">
                        This email was sent because you submitted an application at hrteksystem.com.<br/>
                        Please do not reply directly to this email.
                      </p>
                    </td>
                  </tr>

                </table>
              </td></tr>
            </table>
          </body>
          </html>`,
      });
    }
  } catch (err) {
    console.error("Career email send error:", err);
  }

  return json({ success: true });
}

// ── Open Positions ────────────────────────────────────────────────────────────
const OPEN_ROLES = [
  {
    title: "HR Transformation Sales",
    department: "Sales & Growth",
    type: "Full-time",
    location: "Lucknow, UP",
    tag: "Hot",
    tagColor: "bg-rose-100 text-rose-700",
    desc: "Drive enterprise sales cycles, build CXO relationships, and champion our platform across India's top HR departments.",
  },
  {
    title: "HR Tech Business Manager",
    department: "Business",
    type: "Full-time",
    location: "Lucknow, UP",
    tag: "New",
    tagColor: "bg-emerald-100 text-emerald-700",
    desc: "Own client success, coordinate cross-functional delivery, and scale our service partnerships.",
  },
  {
    title: "HR Product Head",
    department: "Product",
    type: "Full-time",
    location: "Hybrid",
    tag: "Senior",
    tagColor: "bg-indigo-100 text-indigo-700",
    desc: "Shape the product vision for our AI-powered HR intelligence suite. You'll work directly with leadership to define the roadmap.",
  },
  {
    title: "HR Tech Advisory",
    department: "Consulting",
    type: "Contract / Full-time",
    location: "Remote",
    tag: "Open",
    tagColor: "bg-amber-100 text-amber-700",
    desc: "Guide enterprises through HR digital transformation. You'll deliver assessments, strategic roadmaps, and vendor recommendations.",
  },
  {
    title: "Software Engineer",
    department: "Engineering",
    type: "Full-time",
    location: "Hybrid",
    tag: "Multiple",
    tagColor: "bg-blue-100 text-blue-700",
    desc: "Build and scale our Remix/Node platform, integrating AWS DynamoDB, Bedrock AI, and real-time analytics.",
  },
  {
    title: "Product Designer",
    department: "Design",
    type: "Full-time",
    location: "Remote",
    tag: "New",
    tagColor: "bg-purple-100 text-purple-700",
    desc: "Craft intuitive experiences for complex enterprise workflows. Own UX research, design systems, and prototyping.",
  },
];

const PERKS = [
  { icon: "🌍", title: "Remote-Friendly", desc: "Work from anywhere with async-first culture and flexible hours." },
  { icon: "🧘", title: "Wellness First", desc: "Mental health support, gym reimbursements, and real time off." },
  { icon: "📚", title: "Learning Budget", desc: "Courses, books, and conferences — we invest in your growth." },
  { icon: "🎉", title: "Team Culture", desc: "Offsites, celebrations, and a community where every voice matters." },
  { icon: "⚡", title: "Fast Execution", desc: "Ship real products fast. No bureaucracy, no endless meetings." },
];

const VALUES = [
  { icon: "💡", title: "Innovation", desc: "We challenge the status quo and embrace bold ideas, constantly pushing the boundaries of what's possible in HR tech." },
  { icon: "🤝", title: "Empathy", desc: "People are at the heart of everything we do — our users, colleagues, and community all guide our decisions." },
  { icon: "🛠", title: "Ownership", desc: "Everyone is a founder here. We trust each other to be proactive, accountable, and driven by shared mission." },
  { icon: "🌍", title: "Diversity", desc: "Our greatest strength is our varied backgrounds, perspectives, and experiences — reflecting the world we serve." },
  { icon: "🔍", title: "Transparency", desc: "Openness is the foundation of our trust. We share information honestly across the entire organization." },
  { icon: "📈", title: "Growth", desc: "Our company's growth is directly tied to the growth of each individual. We build careers, not just teams." },
];

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function CareerPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [selectedRole, setSelectedRole] = useState("");
  const [fileName, setFileName] = useState("");

  const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";

  // show success modal
  useEffect(() => {
    if ((actionData as any)?.success) {
      setShowModal(true);
      setFormKey(k => k + 1);
      setFileName("");
      setSelectedRole("");
    }
  }, [actionData]);

  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = (role = "") => {
    setSelectedRole(role);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Careers", url: "/careers" },
  ]);

  return (
    <>
      <link rel="canonical" href="https://www.hrteksystem.com/careers" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── Success Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Received!</h2>
              <p className="text-gray-600 leading-relaxed mb-2">Thank you for your interest in joining the HRTek team.</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Our team will review your profile and reach out if your qualifications match our current needs.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="px-8 py-3.5 bg-[#023e8a] text-white font-bold rounded-2xl hover:bg-[#022e6a] transition-all shadow-lg shadow-blue-900/20"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white">
        <div className="bg-[#023e8a]">
          <Navbar />
        </div>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative bg-[#023e8a] overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-[#01266a]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-indigo-400/10 blur-3xl" />
            {/* Dot grid */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">We're Hiring</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                Build the future<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                  of HR Tech
                </span>
              </h1>

              <p className="text-lg text-blue-100/80 max-w-lg leading-relaxed font-medium">
                Join a team rewriting how enterprises think about HR. We move fast, care deeply, and build things that matter — from AI-powered assessments to transformation roadmaps used by top Indian businesses.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToForm()}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#023e8a] font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-black/20 text-base"
                >
                  Apply Now
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <a
                  href="#open-roles"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/20 text-base"
                >
                  View Open Roles
                </a>
              </div>
            </motion.div>

            {/* Right — stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: "6+", label: "Open Positions", sub: "Across all functions" },
                { value: "100%", label: "Growth Culture", sub: "Learning-first environment" },
                { value: "AI", label: "First Principles", sub: "Bedrock & DeepSeek powered" },
                { value: "LKO", label: "Headquartered", sub: "Lucknow, Uttar Pradesh" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 space-y-1"
                >
                  <div className="text-3xl font-black text-white">{s.value}</div>
                  <div className="text-sm font-bold text-white/90">{s.label}</div>
                  <div className="text-xs text-blue-200/70">{s.sub}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom curve */}
          <div className="relative h-16 bg-[#023e8a]">
            <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,64 C360,0 1080,0 1440,64 L1440,64 L0,64 Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ── OPEN ROLES ───────────────────────────────────────────────────── */}
        <section id="open-roles" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <FadeIn className="text-center mb-14">
              <div className="inline-block px-4 py-1.5 bg-blue-50 rounded-full mb-4">
                <span className="text-xs font-black text-[#023e8a] uppercase tracking-widest">Open Positions</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Find your role</h2>
              <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
                We're building across every function. If you're passionate about transforming HR, there's a place for you here.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {OPEN_ROLES.map((role, i) => (
                <FadeIn key={i} delay={i * 0.06}>
                  <div className="group h-full flex flex-col bg-white border border-gray-100 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${role.tagColor}`}>
                        {role.tag}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">
                        {role.department}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-gray-900 group-hover:text-[#023e8a] transition-colors mb-2">
                      {role.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5">{role.desc}</p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {role.location}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {role.type}
                        </span>
                      </div>
                      <button
                        onClick={() => scrollToForm(role.title)}
                        className="text-xs font-black text-[#023e8a] hover:underline flex items-center gap-1 group-hover:gap-2 transition-all"
                      >
                        Apply
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY HRTEK ────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-[#f8faff]">
          <div className="max-w-7xl mx-auto">
            <FadeIn className="text-center mb-14">
              <div className="inline-block px-4 py-1.5 bg-indigo-50 rounded-full mb-4">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Why HRTek</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">More than just a job</h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                  title: "Real Impact, Real Fast",
                  desc: "You won't be a cog in a machine. Your work ships to real enterprise clients in weeks, not years. We operate with the speed of a startup and the ambition of a category leader.",
                  color: "from-blue-500 to-indigo-600",
                  bg: "bg-blue-50",
                  text: "text-blue-600",
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  title: "World-Class Team",
                  desc: "Work alongside people who've built products, led transformations, and advised Fortune 500 companies. You'll learn more here in one year than most roles offer in five.",
                  color: "from-emerald-500 to-teal-600",
                  bg: "bg-emerald-50",
                  text: "text-emerald-600",
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: "Cutting-Edge Technology",
                  desc: "Build with AWS Bedrock, DeepSeek AI, and modern full-stack infrastructure. We don't use legacy systems — everything we ship is designed from first principles.",
                  color: "from-violet-500 to-purple-600",
                  bg: "bg-violet-50",
                  text: "text-violet-600",
                },
              ].map((card, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow h-full">
                    <div className={`w-14 h-14 ${card.bg} ${card.text} rounded-2xl flex items-center justify-center mb-6`}>
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-3">{card.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{card.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── PERKS ────────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <div className="inline-block px-4 py-1.5 bg-amber-50 rounded-full mb-4">
                  <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Benefits</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Perks that matter</h2>
              </div>
              <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
                We build for our people the same way we build for our customers — with intention and care.
              </p>
            </FadeIn>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {PERKS.map((perk, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <div className="group bg-gray-50 hover:bg-[#023e8a] rounded-2xl p-6 text-center transition-all duration-300 cursor-default">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">
                      {perk.icon}
                    </div>
                    <h4 className="text-sm font-black text-gray-900 group-hover:text-white transition-colors mb-1.5">
                      {perk.title}
                    </h4>
                    <p className="text-xs text-gray-500 group-hover:text-blue-200 transition-colors leading-relaxed">
                      {perk.desc}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── VALUES ───────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-[#f8faff]">
          <div className="max-w-7xl mx-auto">
            <FadeIn className="text-center mb-14">
              <div className="inline-block px-4 py-1.5 bg-rose-50 rounded-full mb-4">
                <span className="text-xs font-black text-rose-600 uppercase tracking-widest">Our Values</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">What drives us every day</h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {VALUES.map((v, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-4">{v.icon}</div>
                    <h3 className="text-lg font-black text-[#023e8a] mb-2">{v.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── APPLICATION FORM ─────────────────────────────────────────────── */}
        <section id="join-form" ref={formRef} className="py-24 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <FadeIn className="text-center mb-12">
              <div className="inline-block px-4 py-1.5 bg-blue-50 rounded-full mb-4">
                <span className="text-xs font-black text-[#023e8a] uppercase tracking-widest">Apply Now</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Start your journey</h2>
              <p className="mt-4 text-gray-500 max-w-md mx-auto">
                Tell us about yourself. We review every application personally and get back within 5 business days.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Form header */}
                <div className="bg-gradient-to-r from-[#023e8a] to-[#0353a4] px-10 py-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Application Form</h3>
                    <p className="text-blue-200 text-sm mt-0.5">All fields marked * are required</p>
                  </div>
                </div>

                <div className="p-10">
                  <Form key={formKey} method="post" encType="multipart/form-data" className="space-y-7">

                    {/* Name row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text" name="firstName" required placeholder="e.g. Priya"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#023e8a] focus:border-[#023e8a] bg-gray-50 text-gray-900 placeholder-gray-400 transition outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text" name="lastName" required placeholder="e.g. Sharma"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#023e8a] focus:border-[#023e8a] bg-gray-50 text-gray-900 placeholder-gray-400 transition outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Contact row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email" name="email" required placeholder="priya@example.com"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#023e8a] focus:border-[#023e8a] bg-gray-50 text-gray-900 placeholder-gray-400 transition outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel" name="phone" required placeholder="+91 98765 43210"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#023e8a] focus:border-[#023e8a] bg-gray-50 text-gray-900 placeholder-gray-400 transition outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Role row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                          Applying For <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="jobRole" required
                          value={selectedRole}
                          onChange={e => setSelectedRole(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#023e8a] focus:border-[#023e8a] bg-gray-50 text-gray-900 transition outline-none text-sm"
                        >
                          <option value="" disabled>Select a role</option>
                          {OPEN_ROLES.map(r => (
                            <option key={r.title} value={r.title}>{r.title}</option>
                          ))}
                          <option value="Other">Other / Open Application</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                          Location
                        </label>
                        <div className="w-full border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-100 text-gray-600 flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Lucknow, Uttar Pradesh
                        </div>
                        <input type="hidden" name="location" value="Lucknow" />
                      </div>
                    </div>

                    {/* Resume Upload */}
                    <div>
                      <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                        Resume / CV <span className="text-red-500">*</span>
                        <span className="ml-2 text-[10px] font-normal text-gray-400 normal-case">(PDF only · max 5MB)</span>
                      </label>
                      <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50 hover:border-[#023e8a] hover:bg-blue-50/30 transition-all cursor-pointer group">
                        <div className={`w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center transition-colors ${fileName ? 'border-emerald-200 bg-emerald-50' : 'group-hover:border-blue-200'}`}>
                          <svg className={`w-6 h-6 transition-colors ${fileName ? 'text-emerald-500' : 'text-gray-400 group-hover:text-[#023e8a]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            {fileName ? (
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            )}
                          </svg>
                        </div>
                        <div>
                          {fileName ? (
                            <p className="text-sm font-semibold text-[#023e8a]">
                              {fileName}
                            </p>
                          ) : (
                            <p className="text-sm font-semibold text-gray-700 group-hover:text-[#023e8a] transition-colors">
                              Drop your PDF here or <span className="underline">browse</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {fileName ? "Click to change file" : "Only PDF files accepted"}
                          </p>
                        </div>
                        <input
                          type="file" name="resume" accept=".pdf" required
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setFileName(file.name);
                            else setFileName("");
                          }}
                        />
                      </label>
                    </div>

                    {/* Error */}
                    {(actionData as any)?.error && (
                      <div className="flex items-center gap-3 text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {(actionData as any).error}
                      </div>
                    )}

                    {/* Submit */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 bg-[#023e8a] text-white font-black rounded-2xl transition-all shadow-lg text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 group ${isSubmitting ? 'opacity-70 cursor-not-allowed shadow-none' : 'hover:bg-[#022e6a] shadow-blue-900/20'}`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Application
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </>
                        )}
                      </button>
                      <p className="text-center text-xs text-gray-400 mt-4">
                        By submitting, you agree to our{" "}
                        <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
                        We'll never share your data.
                      </p>
                    </div>

                  </Form>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── CTA STRIP ────────────────────────────────────────────────────── */}
        <section className="bg-[#023e8a] py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Don't see the right fit?</h2>
            <p className="text-blue-200/80 mb-8 leading-relaxed">
              We're always looking for exceptional people. Send us an open application and tell us what you'd bring to the team.
            </p>
            <button
              onClick={() => scrollToForm("Other")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#023e8a] font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-black/20"
            >
              Send Open Application
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

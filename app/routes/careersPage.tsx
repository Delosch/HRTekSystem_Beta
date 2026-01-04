//Careers page

import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const resume = formData.get("resume");

  console.log("Received application:", { name, email, resume });

  return json({ success: true });
}

export default function CareerPage() {
  const actionData = useActionData<typeof action>();
  return (
    <>
      <link rel="canonical" href="https://yourdomain.com/careers" />
      <div className="bg-[#023e8a] text-justify">
        <Navbar />
        {/* Top Ribbon */}
        <div className="relative w-full bg-[#023e8a] text-white overflow-hidden">
          <div className="w-full flex items-center justify-center px-4 py-12 sm:py-12">
            <div className="bg-[#023e8a] text-white py-2 px-6">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                {/* Left Side: Text and CTA */}
                <div className="space-y-8">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white mt-20">
                      <span className="text-9xl text-white">Careers</span>
                      <br />
                      <span className="font-light text-[#D4E1F4]">
                        Find Your Place with Us
                      </span>
                    </h2>
                  </div>
                  <p className="text-lg italic text-[#C5D5EC] max-w-xl">
                    At the heart of our success is our people. We believe in
                    fostering a culture where every team member is empowered to
                    grow, innovate, and make a real impact. Join us and discover
                    a place where your professional development is our priority,
                    and together, we can build something truly remarkable.{" "}
                  </p>
                </div>

                {/* Right Side: Static UI Image */}
                <div className="flex justify-center">
                  <img
                    src="/assets/careersAssets/careerArt.png"
                    alt="AI Powered HCM UI"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Life at  */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-[#023e8a]">
                Life at HRTek System
              </h2>
              <p className="text-lg text-gray-600">
                We're building a place where work feels meaningful and fun.
                Here's what you can expect when you join us.
              </p>
            </div>

            {/* Top image banner */}
            <div className="w-full rounded-xl overflow-hidden shadow-lg">
              <img
                src="/assets/careersAssets/life.png"
                alt="Illustration showing team culture"
                className="w-full object-contain h-64 md:h-96"
              />
            </div>

            {/* Perks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "🌍",
                  title: "Remote-Friendly",
                  desc: "Work from anywhere, we support async work styles and flexible hours.",
                },
                {
                  icon: "🧘",
                  title: "Wellness First",
                  desc: "We cover mental health, gym reimbursements, and real time-off.",
                },
                {
                  icon: "📚",
                  title: "Learning Budget",
                  desc: "Courses, books, conferences, we invest in your growth.",
                },
                {
                  icon: "🎉",
                  title: "Celebrations",
                  desc: "Virtual game nights, offsites, and birthday surprises.",
                },
                {
                  icon: "🚀",
                  title: "Equity Options",
                  desc: "We win together. Everyone shares in the upside.",
                },
                {
                  icon: "🍱",
                  title: "Community",
                  desc: "Fostering a supportive and collaborative environment where every voice is heard and valued.",
                },
              ].map((perk, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-tr from-[#cfe9ff] to-[#e8f4ff] rounded-xl p-6 shadow-md transition hover:scale-[1.02]"
                >
                  <div className="text-4xl mb-2">{perk.icon}</div>
                  <h4 className="text-lg font-semibold text-[#023e8a]">
                    {perk.title}
                  </h4>
                  <p className="text-sm text-gray-700">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: What Drives Us */}
        <section className="bg-[#f4faff] py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
                What Drives Us
              </h3>
              <div className="w-16 h-1 bg-[#ffbe0b] mt-2 rounded"></div>
            </div>

            <div className="space-y-16">
              {/* Value 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <img
                  src="/assets/careersAssets/innovation.png"
                  alt="Abstract illustration of Innovation"
                  className="w-full md:w-1/2 h-auto md:h-[300px] object-contain rounded-xl"
                />
                <div className="md:w-1/2 space-y-4">
                  <h3 className="text-2xl font-semibold text-[#023e8a]">
                    💡 Innovation
                  </h3>
                  <p className="text-gray-700">
                    We're not just building an HR product, we're building the
                    future. We challenge the status quo and embrace bold ideas,
                    constantly seeking new and better ways to solve problems.
                    Our team thrives on curiosity, and we encourage everyone to
                    experiment, learn from failures, and push the boundaries of
                    what's possible. We believe that true innovation comes from
                    a collaborative environment where every voice is heard and
                    every idea is given a chance to shine.
                  </p>
                </div>
              </div>

              {/* Value 2 */}
              <div className="flex flex-col-reverse md:flex-row items-center gap-8">
                <div className="md:w-1/2 space-y-4">
                  <h3 className="text-2xl font-semibold text-[#023e8a]">
                    🤝 Empathy
                  </h3>
                  <p className="text-gray-700">
                    At the heart of everything we do are "people". We're
                    committed to understanding the needs and challenges of our
                    users, our colleagues, and our community. Empathy guides our
                    decisions, from product design to team collaboration,
                    ensuring we create solutions that are not only effective but
                    also compassionate and inclusive. We believe that by
                    genuinely connecting with others, we can build a more
                    supportive and meaningful company culture and create a
                    product that truly makes a difference.
                  </p>
                </div>
                <img
                  src="/assets/careersAssets/empathy.png"
                  alt="Abstract illustration of Empathy"
                  className="w-full md:w-1/2 h-auto md:h-[300px] object-contain rounded-xl"
                />
              </div>

              {/* Value 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <img
                  src="/assets/careersAssets/ownership.png"
                  alt="Abstract illustration of Ownership"
                  className="w-full md:w-1/2 h-auto md:h-[300px] object-contain rounded-xl"
                />
                <div className="md:w-1/2 space-y-4">
                  <h3 className="text-2xl font-semibold text-[#023e8a]">
                    🛠 Ownership
                  </h3>
                  <p className="text-gray-700">
                    We're a team of founders, not just employees. Everyone is
                    empowered to take full responsibility for their work, from
                    ideation to execution. We trust each other to be proactive,
                    accountable, and driven by a shared mission. Taking
                    ownership means you have the freedom to make decisions, the
                    support to see them through, and the pride of knowing your
                    contributions directly impact our success. We celebrate
                    initiative and believe that true progress is made when every
                    individual feels a personal stake in our collective journey.
                  </p>
                </div>
              </div>

              {/* Value 4 */}
              <div className="flex flex-col-reverse md:flex-row items-center gap-8">
                <div className="md:w-1/2 space-y-4">
                  <h3 className="text-2xl font-semibold text-[#023e8a]">
                    🌍 Diversity
                  </h3>
                  <p className="text-gray-700">
                    Our greatest strength is our people, and that includes our
                    varied backgrounds, perspectives, and experiences. We are
                    dedicated to building a team that reflects the rich
                    diversity of the world we serve. We believe that a wide
                    range of voices leads to more creative solutions, a stronger
                    culture, and a more comprehensive understanding of our
                    users' needs. We're committed to fostering an inclusive
                    environment where everyone feels valued, respected, and
                    empowered to be their authentic selves.
                  </p>
                </div>
                <img
                  src="/assets/careersAssets/diversity.png"
                  alt="Abstract illustration of Empathy"
                  className="w-full md:w-1/2 h-auto md:h-[300px] object-contain rounded-xl"
                />
              </div>

              {/* Value 5 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <img
                  src="/assets/careersAssets/transparency.png"
                  alt="Abstract illustration of Ownership"
                  className="w-full md:w-1/2 h-auto md:h-[300px] object-contain rounded-xl"
                />
                <div className="md:w-1/2 space-y-4">
                  <h3 className="text-2xl font-semibold text-[#023e8a]">
                    🔍 Transparency
                  </h3>
                  <p className="text-gray-700">
                    Openness is the foundation of our trust. We operate with a
                    commitment to transparency, sharing information openly and
                    honestly across the entire organization. We believe that
                    when everyone has a clear understanding of our goals,
                    challenges, and successes, we can make better decisions and
                    work together more effectively. This culture of transparency
                    fosters a sense of trust and shared purpose, ensuring that
                    we're all aligned and working toward a common vision.
                  </p>
                </div>
              </div>

              {/* Value 6 */}
              <div className="flex flex-col-reverse md:flex-row items-center gap-8">
                <div className="md:w-1/2 space-y-4">
                  <h3 className="text-2xl font-semibold text-[#023e8a]">
                    📈 Growth
                  </h3>
                  <p className="text-gray-700">
                    We believe in a culture of continuous learning and personal
                    development. Our company's growth is directly tied to the
                    growth of each individual on our team. We provide
                    opportunities, resources, and a supportive environment for
                    you to expand your skills, explore new interests, and take
                    on new challenges. We encourage everyone to step outside
                    their comfort zone, learn from new experiences, and
                    celebrate every milestone on their journey to becoming the
                    best version of themselves.
                  </p>
                </div>
                <img
                  src="/assets/careersAssets/growth.png"
                  alt="Abstract illustration of Empathy"
                  className="w-full md:w-1/2 h-auto md:h-[300px] object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Join the Team – Application Form */}
        <div className="bg-[#edf4fb] py-16 px-4 md:px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 md:p-12 space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900">
                Join the Team
              </h2>
              <p className="mt-2 text-gray-600 text-lg">
                Interested in working with us? Submit your details and we’ll get
                in touch!
              </p>
            </div>

            <Form
              method="post"
              encType="multipart/form-data"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-black">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="mt-1 w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="mt-1 w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                  />
                </div>

                {/* Job Role Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Job Role
                  </label>
                  <select
                    name="jobRole"
                    required
                    className="mt-1 w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                  >
                    <option value="" disabled selected>
                      Select a Role
                    </option>
                    <option value="frontend-engineer">
                      HR Transformation Sales
                    </option>
                    <option value="backend-engineer">
                      HR Tech Business Manager
                    </option>
                    <option value="product-manager">HR Product Head</option>
                    <option value="hr-specialist">HR Tech Advisory</option>
                  </select>
                </div>

                {/* Location Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Preferred Location
                  </label>
                  <select
                    name="location"
                    required
                    className="mt-1 w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                  >
                    <option value="" disabled selected>
                      Select Location
                    </option>
                    <option value="remote">Remote</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="delhi">Delhi</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="mumbai">Lucknow</option>
                  </select>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Resume (PDF)
                  </label>
                  <input
                    type="file"
                    name="resume"
                    accept=".pdf"
                    required
                    className="mt-1 w-full border border-gray-300 rounded-md p-3 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="mt-6 inline-block px-6 py-3 bg-[#023e8a] text-white font-semibold rounded-lg hover:bg-[#022e6a] transition duration-300"
                >
                  Submit Application
                </button>
              </div>

              {/* Success Message */}
              {actionData?.success && (
                <p className="text-green-600 text-center font-medium mt-4">
                  Application submitted successfully!
                </p>
              )}
            </Form>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

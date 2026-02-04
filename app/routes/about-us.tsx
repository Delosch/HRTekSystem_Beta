//about us page

import React from "react";
import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";
import { MetaFunction } from "@remix-run/node";
import { generateMeta, generateBreadcrumbSchema } from "~/utils/seo";

export const meta: MetaFunction = () => {
  return generateMeta({
    title: "About HRTek System - Transforming HR with AI",
    description: "Learn how HRTek System is revolutionizing HR transformation through AI-powered diagnostics, strategic consulting, and innovative technology solutions. Meet our team and discover our mission.",
    keywords: "about HRTek, HR technology company, AI HR solutions, HR transformation experts, Atul Dixit, HR consulting",
    url: "https://hrteksystem.com/about-us",
    image: "https://hrteksystem.com/og-about.jpg",
  });
};

export default function AboutUs() {
  // Breadcrumb Schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about-us" }
  ]);

  return (
    <>
      <link rel="canonical" href="https://hrteksystem.com/about-us" />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="flex flex-col w-full bg-[#023e8a]">
        <Navbar />
        {/* Top Ribbon */}
        <div className="bg-[#023e8a]">
          <div className="relative w-full bg-[#023e8a] text-white overflow-hidden">
            <div className="w-full flex items-center justify-center px-4 py-12 sm:py-12">
              <div className="bg-[#023e8a] text-white py-2 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                  {/* Left Side: Text and CTA */}
                  <div className="space-y-8">
                    <div>
                      <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-white mt-10 md:mt-20">
                        <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-white whitespace-normal md:whitespace-nowrap">About Us</span>
                        <br />
                        <span className="font-light text-[#D4E1F4] text-lg sm:text-xl md:text-3xl mt-4 block">
                          Driven by purpose, powered by people and innovation
                        </span>
                      </h1>
                    </div>
                    <p className="text-lg italic text-[#C5D5EC] max-w-xl text-justify">
                      At our core, we believe purposeful transformation begins
                      with people. As a next-generation HR transformation
                      partner, we align technology with business strategy.
                      Through human-centered design and innovative solutions, we
                      help organizations evolve their HR function into a driver
                      of agility, growth, and lasting impact.
                    </p>
                  </div>

                  {/* Right Side: Static UI Image */}
                  <div className="flex justify-center">
                    <img
                      src="/assets/aboutUsAssets/ribbonArt.png"
                      alt="Office illustration representing the collaborative spirit of our team"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Outer Large Card */}
        <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden my-12 p-6 md:p-12 space-y-12">
          <div className="mb-8">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
              About Us
            </h3>
            <div className="w-16 h-1 bg-[#48cae4] mt-2 rounded"></div>
          </div>
          {/* Section 1 */}
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            {/* Left Card */}
            <div className="flex-1 bg-[#48cae4] shadow-lg rounded-lg p-6 flex items-center">
              <div className="flex flex-col items-center md:items-start text-center md:text-left w-full space-y-4">
                <h3 className="text-4xl md:text-5xl font-semibold text-white">
                  Our Story
                </h3>
                <p className="text-white text-base leading-relaxed text-justify">
                  HRTek System started as a small group of Tech HR enthusiasts
                  dedicated to helping small businesses and organizations
                  overcome their technology challenges. Today, we have grown
                  into a leading provider of HR Digital Automation Products and
                  services.
                </p>
                {/* Image Placeholder */}
                <div className="w-full h-48 sm:h-64 md:h-96 bg-white rounded-lg flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-300">
                  <img
                    src="/assets/aboutUsAssets/aboutUs1aa.png"
                    alt="Team brainstorming and building a startup product in a collaborative setting"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </div>
            </div>

            {/* Right: Two stacked cards */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-[#caf0f8] rounded-lg shadow-lg overflow-hidden flex items-center justify-center p-4 bg-white">
                <img
                  src="/assets/aboutUsAssets/aboutUs1a.png"
                  alt="Team tackling a challenge collaboratively, representing our service-oriented approach"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
              <div className="bg-[#90e0ef] shadow-lg rounded-lg p-6 flex items-center">
                <div className="text-center md:text-left">
                  <h3 className="text-4xl md:text-5xl font-semibold text-gray-700 mb-4">
                    Our Services
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed text-justify">
                    We provide an array of HR digital IT services, such as HR
                    tech advisory, HCM/SAAS selection, HR shared services, and
                    various other HR automation services. Our offerings are
                    tailored to assist both small businesses and enterprises in
                    excelling within the modern digital landscape.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 (flipped) */}
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            {/* Left: Two stacked cards */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-[#caf0f8] rounded-lg shadow-lg overflow-hidden flex items-center justify-center p-4 bg-white">
                <img
                  src="/assets/aboutUsAssets/aboutUs1b.png"
                  alt="Client-focused conversation between team and customers, symbolizing personalized service delivery"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
              <div className="bg-[#90e0ef] shadow-lg rounded-lg p-6 flex items-center">
                <div className="text-center md:text-left">
                  <h3 className="text-4xl md:text-5xl font-semibold text-gray-700 mb-4">
                    Our Clients
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed text-justify">
                    At HRTek System, we take pride in serving a wide array of
                    clients, from burgeoning startups to established
                    enterprises, intending to enrich the employee experience. We
                    engage intimately with each client to grasp their distinct
                    requirements and deliver tailored HR solutions.{" "}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="flex-1 bg-[#48cae4] shadow-lg rounded-lg p-6 flex items-center">
              <div className="flex flex-col items-center md:items-start text-center md:text-left w-full space-y-4">
                <h3 className="text-4xl md:text-5xl font-semibold text-white">
                  Our Team
                </h3>
                <p className="text-white text-base leading-relaxed text-justify">
                  Our team, consisting of IT and HR digital specialists, is
                  dedicated to providing exceptional service and support to our
                  clients. We have the expertise and experience required to
                  tackle the most complex technological challenges in the HR
                  technology industry.
                </p>
                {/* Image Placeholder */}
                <div className="w-full h-48 sm:h-64 md:h-96 bg-white rounded-lg flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-300">
                  <img
                    src="/assets/aboutUsAssets/aboutUs1bb.png"
                    alt="Our team focused on innovation and problem-solving in a collaborative workspace"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Alternating grid */}
        <div className="p-6 md:p-12">
          <div className="bg-white shadow-xl rounded-2xl p-8 md:p-12">
            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
                Who We Are
              </h3>
              <div className="w-16 h-1 bg-[#ffbe0b] mt-2 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="bg-[#ffbe0b] shadow-lg rounded-lg p-6 flex flex-col justify-center min-h-[220px] md:min-h-[280px]">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                  Our Mission - Revolutionizing HR through technology for a
                  smarter and agile workforce
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed text-justify">
                  Our mission is to enable businesses to achieve their utmost
                  capabilities by offering specialized advice and cutting-edge
                  solutions in HR Technology and Transformation.
                </p>
              </div>

              {/* Image 1 */}
              <div className="bg-white shadow-lg rounded-lg border border-[#ffbe0b] flex items-center justify-center p-4 order-2 md:order-none">
                <img
                  src="/assets/aboutUsAssets/aboutUs2a.png"
                  alt="Inefficient manual HR process contrasted with modern automated HR system"
                  className="w-full h-auto max-h-48 md:max-h-full object-contain"
                />
              </div>

              {/* Card 2 - Swapped order for mobile flow */}
              <div className="bg-[#fb5607] shadow-lg rounded-lg p-6 flex flex-col justify-center min-h-[220px] md:min-h-[280px] order-4 md:order-none">
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                  Our Claim for Fame
                </h3>
                <p className="text-gray-100 text-sm leading-relaxed text-justify">
                  At HRTek System, we believe in transforming the way
                  organizations manage their human resources. Our vision is to
                  empower businesses with innovative HR technology solutions
                  that drive efficiency and enhance employee engagement.
                </p>
              </div>

              {/* Image 2 */}
              <div className="bg-white shadow-lg rounded-lg border border-[#fb5607] flex items-center justify-center p-4 order-3 md:order-none">
                <img
                  src="/assets/aboutUsAssets/aboutUs2b.png"
                  alt="Improved business processes due to streamlined workforce management"
                  className="w-full h-auto max-h-48 md:max-h-full object-contain"
                />
              </div>

              {/* Card 3 */}
              <div className="bg-[#ff006e] shadow-lg rounded-lg p-6 flex flex-col justify-center min-h-[220px] md:min-h-[280px] order-5 md:order-none">
                <h3 className="text-xl md:text-2xl font-semibold text-black mb-2">
                  Our Vision - To redefine the future of HR Technology
                </h3>
                <p className="text-black text-sm leading-relaxed text-justify">
                  Transform HR technology by becoming the global leader in
                  delivering innovative, ROI-driven solutions that empower
                  organizations to build smarter, more agile, and
                  employee-focused workplaces on global scale.
                </p>
              </div>

              {/* Image 3 */}
              <div className="bg-white shadow-lg rounded-lg border border-[#ff006e] flex items-center justify-center p-4 order-6 md:order-none">
                <img
                  src="/assets/aboutUsAssets/aboutUs2c.png"
                  alt="Employees collaborating toward a unified organizational vision"
                  className="w-full h-auto max-h-48 md:max-h-full object-contain"
                />
              </div>

              {/* Card 4 - Swapped order for mobile flow */}
              <div className="bg-[#8338ec] shadow-lg rounded-lg p-6 flex flex-col justify-center min-h-[220px] md:min-h-[280px] order-8 md:order-none">
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                  Our Values - Transform HR with innovative tech that empowers
                  people and drives growth.
                </h3>
                <p className="text-gray-100 text-sm leading-relaxed text-justify">
                  At HRTek System, our core values are integrity, excellence,
                  and collaboration. We commit to fostering robust relationships
                  with our clients and providing outstanding service that
                  surpasses their expectations.
                </p>
              </div>

              {/* Image 4 */}
              <div className="bg-white shadow-lg rounded-lg border border-[#8338ec] flex items-center justify-center p-4 order-7 md:order-none">
                <img
                  src="/assets/aboutUsAssets/aboutUs2d.png"
                  alt="Visual representation of core values including streamlined automation and operational simplicity"
                  className="w-full h-auto max-h-48 md:max-h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Heading + Leadership Team */}
        <div className="p-6 md:p-12">
          <div className="bg-[#ece4db] rounded-lg shadow-lg p-6">
            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
                Our Leadership Team
              </h3>
              <div className="w-32 h-1 bg-[#0a9396] mt-2 rounded"></div>
            </div>

            <div className="space-y-12">
              {/* Atul Dixit Section */}
              <div className="flex flex-col md:flex-row items-stretch gap-6">
                <div className="flex-1 bg-[#ffe5d9] shadow-lg rounded-xl w-full border border-white p-6 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-orange-200 pb-2">
                    About Atul Dixit
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed text-justify">
                    Welcome to my Digital HR portfolio! I'm Atul Dixit, Founder
                    of HRTek System, a seasoned HR Transformation Leader and a
                    Project Management Expert, with over two decades of proven
                    success in driving HR technology innovation, process
                    optimization, and organizational excellence.
                  </p>
                </div>
                <div className="flex-1 bg-white shadow-lg rounded-xl w-full border border-gray-200 p-6 flex flex-col justify-center">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                    His Journey
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed text-justify">
                    Throughout my career, I have had the privilege of working
                    with leading organizations such as SpiceJet, CMS
                    Infosystems, Hindustan Field Services, Eureka Forbes, and
                    more. I ventured into business to bridge the gap between HR
                    Technology and real business impact.
                  </p>
                </div>
                <div className="flex-1 flex justify-center w-full min-w-[200px]">
                  <div className="flex flex-col items-center space-y-3 p-4">
                    <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gray-100 shadow-xl overflow-hidden border-4 border-[#0a9396]">
                      <img
                        src="/assets/aboutUsAssets/founderImg.webp"
                        alt="Atul Dixit - Founder & CEO"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-gray-800">
                        Atul Dixit
                      </h2>
                      <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">Founder & CEO</p>
                      <a
                        href="https://www.linkedin.com/in/atul-dixit/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0077b5] text-white hover:bg-[#005582] transition-colors"
                        title="Connect on LinkedIn"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Piyush Jaiswal Section */}
              <div className="flex flex-col md:flex-row-reverse items-stretch gap-6">
                <div className="flex-1 bg-[#e0f2f1] shadow-lg rounded-xl w-full border border-white p-6 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-teal-200 pb-2">
                    About Piyush Jaiswal
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed text-justify">
                    Piyush Jaiswal is the Co-Founder & CMO of HRTek System, bringing a wealth of strategic marketing expertise in driving HR digital transformation. With a strong background in brand management and a passion for market innovation, he leads our growth vision to deliver state-of-the-art HR solutions.
                  </p>
                </div>
                <div className="flex-1 bg-white shadow-lg rounded-xl w-full border border-gray-200 p-6 flex flex-col justify-center">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                    His Vision
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed text-justify">
                    Dedicated to bridging the gap between brand values and user-centric HR tools, Piyush focuses on market presence, client engagement, and strategic positioning. His leadership ensures that HRTek System remains the preferred choice in the HR tech industry.
                  </p>
                </div>
                <div className="flex-1 flex justify-center w-full min-w-[200px]">
                  <div className="flex flex-col items-center space-y-3 p-4">
                    <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gray-100 shadow-xl overflow-hidden border-4 border-[#0077b6]">
                      <img
                        src="/assets/aboutUsAssets/piyushImg.png"
                        alt="Piyush Jaiswal - Co-Founder & CMO"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-gray-800">
                        Piyush Jaiswal
                      </h2>
                      <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-2">Co-Founder & CMO</p>
                      <a
                        href="https://www.linkedin.com/in/piyush-jaiswal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0077b5] text-white hover:bg-[#005582] transition-colors"
                        title="Connect on LinkedIn"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logos Section */}
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              HR Transformation Projects Completed
            </h2>
            <p className="text-gray-600 font-medium italic mb-8">
              Delivering excellence through every milestone
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-items-center">
              <img
                src="/assets/aboutUsAssets/client1.webp"
                alt="Vandana Global logo – past work experience of our founder"
                className="h-16 object-contain"
              />
              <img
                src="/assets/aboutUsAssets/client2.webp"
                alt="SpiceJet logo – past work experience of our founder"
                className="h-16 object-contain"
              />
              <img
                src="/assets/aboutUsAssets/client3.webp"
                alt="Simpa logo – past work experience of our founder"
                className="h-16 object-contain"
              />
              <img
                src="/assets/aboutUsAssets/client4.webp"
                alt="Eureka Forbes logo – past work experience of our founder"
                className="h-16 object-contain"
              />
              <img
                src="/assets/aboutUsAssets/client5.webp"
                alt="CMS Info Systems logo – past work experience of our founder "
                className="h-16 object-contain"
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

//about us page

import React from "react";
import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";
import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  const title = "HRTek System – About Us";
  const description =
    "Revolutionize your HR. Our AI-driven software provides diagnostics and a strategic roadmap, empowering your team to transform operations and save you money.";
  const image = "/landingPage-Preview.jpg"; // replace with actual image URL
  const url = ""; // replace with actual domain

  return [
    // Standard meta
    { title },
    { name: "description", content: description },

    // Open Graph (Facebook, LinkedIn, etc.)
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:site_name", content: "HRTek System" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
};

export default function AboutUs() {
  return (
    <>
      <link rel="canonical" href="/aboutUsPage" />
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
                      <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-white mt-10 md:mt-20">
                        <span className="text-6xl md:text-7xl lg:text-9xl text-white whitespace-nowrap">About Us</span>
                        <br />
                        <span className="font-light text-[#D4E1F4] text-xl md:text-3xl">
                          Driven by purpose, powered by people and innovation
                        </span>
                      </h2>
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
                <div className="w-full h-96 bg-white rounded-lg flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-300">
                  <img
                    src="/assets/aboutUsAssets/aboutUs1aa.png"
                    alt="Team brainstorming and building a startup product in a collaborative setting"
                    className="w-full h-full object-contain"
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
                <div className="w-full h-96 bg-white rounded-lg flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-300">
                  <img
                    src="/assets/aboutUsAssets/aboutUs1bb.png"
                    alt="Our team focused on innovation and problem-solving in a collaborative workspace"
                    className="w-full h-full object-contain"
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
              <div className="bg-[#ffbe0b] shadow-lg rounded-lg p-6 flex flex-col justify-center min-h-[280px]">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
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
              <div className="bg-white shadow-lg rounded-lg border border-[#ffbe0b] flex items-center justify-center p-4">
                <img
                  src="/assets/aboutUsAssets/aboutUs2a.png"
                  alt="Inefficient manual HR process contrasted with modern automated HR system"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Image 2 */}
              <div className="bg-white shadow-lg rounded-lg border border-[#fb5607] flex items-center justify-center p-4">
                <img
                  src="/assets/aboutUsAssets/aboutUs2b.png"
                  alt="Improved business processes due to streamlined workforce management"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Card 2 */}
              <div className="bg-[#fb5607] shadow-lg rounded-lg p-6 flex flex-col justify-center min-h-[280px]">
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Our Claim for Fame
                </h3>
                <p className="text-gray-100 text-sm leading-relaxed text-justify">
                  At HRTek System, we believe in transforming the way
                  organizations manage their human resources. Our vision is to
                  empower businesses with innovative HR technology solutions
                  that drive efficiency and enhance employee engagement.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#ff006e] shadow-lg rounded-lg p-6 flex flex-col justify-center min-h-[280px]">
                <h3 className="text-2xl font-semibold text-black mb-2">
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
              <div className="bg-white shadow-lg rounded-lg border border-[#ff006e] flex items-center justify-center p-4">
                <img
                  src="/assets/aboutUsAssets/aboutUs2c.png"
                  alt="Employees collaborating toward a unified organizational vision"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Image 4 */}
              <div className="bg-white shadow-lg rounded-lg border border-[#8338ec] flex items-center justify-center p-4">
                <img
                  src="/assets/aboutUsAssets/aboutUs2d.png"
                  alt="Visual representation of core values including streamlined automation and operational simplicity"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Card 4 */}
              <div className="bg-[#8338ec] shadow-lg rounded-lg p-6 flex flex-col justify-center min-h-[280px]">
                <h3 className="text-2xl font-semibold text-white mb-2">
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
            </div>
          </div>
        </div>

        {/* Section 4: Heading + Card + Circular Image */}
        <div className="p-6 md:p-12">
          <div className="bg-[#ece4db] rounded-lg shadow-lg p-6">
            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
                Meet The Visionary
              </h3>
              <div className="w-16 h-1 bg-gray-600 mt-2 rounded"></div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 bg-[#ffe5d9] shadow-lg rounded-lg w-full border border-white">
                <div className=" flex flex-col justify-center p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    About Me
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-justify">
                    Welcome to my Digital HR portfolio! I'm Atul Dixit, Founder
                    of HRTek System, a seasoned HR Transformation Leader and a
                    Project Management Expert, with over two decades of proven
                    success in driving HR technology innovation, process
                    optimization, and organizational excellence.
                    <br />
                    <br />
                    <br />
                  </p>
                </div>
              </div>
              <div className="flex-1 bg-white shadow-lg rounded-lg w-full border border-gray-300">
                <div className=" flex flex-col justify-center p-6">
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    My journey
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed text-justify">
                    Throughout my career, I have had the privilege of working
                    with leading organizations such as SpiceJet, CMS
                    Infosystems, Hindustan Field Services, Eureka Forbes, and
                    more. I ventured into business to bridge the gap between HR
                    Technology and real business impact. After leading HR
                    transformations for top firms, I saw the need for
                    Expert-led, Tailored HR Tech Solutions.
                  </p>
                </div>
              </div>
              <div className="flex-1 flex justify-center w-full">
                <div className="flex flex-col items-center space-y-2">
                  {/* Circular Image with Border */}
                  <div className="w-48 h-48 rounded-full bg-gray-300 shadow-lg overflow-hidden border-4 border-[#0a9396]">
                    <img
                      src="/assets/aboutUsAssets/founderImg.webp"
                      alt="Founder and CEO of the company HRTek System"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name */}
                  <h2 className="text-lg font-semibold text-gray-800">
                    Atul Dixit
                  </h2>

                  {/* Position */}
                  <p className="text-gray-500 text-sm">Founder & CEO</p>
                </div>
              </div>
            </div>
            <div className="max-w-5xl mx-auto p-6">
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Completion of System Diagnosis By HR-TEK System
                </h2>

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
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

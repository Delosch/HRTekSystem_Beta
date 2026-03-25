import { useState } from "react";
import {
  ArrowPathIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon,
  AdjustmentsHorizontalIcon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";

export default function HomePageContent() {
  const [heroTitle, setHeroTitle] = useState("Empowering B2B Growth with AI-Driven Insights");
  const [heroSubtitle, setHeroSubtitle] = useState("Unlock unparalleled efficiency and strategic clarity with our advanced platform.");
  const [ctaText, setCtaText] = useState("Book a Free Demo");
  const [ctaLink, setCtaLink] = useState("/contact");
  const [videoEmbedCode, setVideoEmbedCode] = useState('<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=..." title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>');

  const [sectionToggles, setSectionToggles] = useState({
    whoWeHelp: true,
    ourProcess: true,
    enginesWeOffer: true,
    valueProposition: true,
    testimonials: true,
    homepageFAQs: true,
  });

  const [faqs, setFaqs] = useState([
    { id: 1, question: "What is your core offering?", answer: "We provide AI-powered tools for B2B process optimization and data analysis." },
    { id: 2, question: "How can I get started?", answer: "Simply book a demo with our team, and we'll guide you through the setup." },
  ]);

  const [sectionOrder, setSectionOrder] = useState([
    "hero", "clientLogos", "video", "whoWeHelp", "ourProcess", "enginesWeOffer", "valueProposition", "testimonials", "homepageFAQs"
  ]);

  // Dummy function for reordering (actual implementation would involve drag-and-drop libraries)
  const moveSection = (fromIndex: number, toIndex: number) => {
    const newOrder = Array.from(sectionOrder);
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setSectionOrder(newOrder);
  };

  const handleSave = () => {
    alert("Home Page Content Saved!");
    // In a real application, you'd send this data to your backend API.
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Home Page Content Management</h2>

      {/* Hero Section */}
      <section className="mb-8 border-b border-gray-200 pb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
          <HomeModernIcon className="h-6 w-6 mr-2 text-indigo-500" /> Hero Section
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              id="heroTitle"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Empowering B2B Growth..."
            />
          </div>
          <div>
            <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <textarea
              id="heroSubtitle"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Unlock unparalleled efficiency..."
            />
          </div>
          <div>
            <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
            <input
              type="text"
              id="ctaText"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Book a Free Demo"
            />
          </div>
          <div>
            <label htmlFor="ctaLink" className="block text-sm font-medium text-gray-700 mb-1">CTA Button Link</label>
            <input
              type="text"
              id="ctaLink"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="/contact"
            />
          </div>
        </div>
      </section>

      {/* Video Embed */}
      <section className="mb-8 border-b border-gray-200 pb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
          <VideoCameraIcon className="h-6 w-6 mr-2 text-indigo-500" /> Video Embed (Optional)
        </h3>
        <div>
          <label htmlFor="videoEmbedCode" className="block text-sm font-medium text-gray-700 mb-1">Video Embed Code (e.g., YouTube iframe)</label>
          <textarea
            id="videoEmbedCode"
            value={videoEmbedCode}
            onChange={(e) => setVideoEmbedCode(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs"
            placeholder="<iframe width='...' src='...'></iframe>"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">Paste the embed code directly from your video hosting service.</p>
      </section>

      {/* Section Toggles */}
      <section className="mb-8 border-b border-gray-200 pb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
          <AdjustmentsHorizontalIcon className="h-6 w-6 mr-2 text-indigo-500" /> Section Visibility
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(sectionToggles).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-base text-gray-700">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('F A Qs', 'FAQs')}
              </span>
              <label htmlFor={`toggle-${key}`} className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id={`toggle-${key}`}
                  checked={value}
                  onChange={() => setSectionToggles({ ...sectionToggles, [key]: !value })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Homepage FAQs */}
      <section className="mb-8 border-b border-gray-200 pb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
          <QuestionMarkCircleIcon className="h-6 w-6 mr-2 text-indigo-500" /> Homepage FAQs
        </h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <label htmlFor={`faq-q-${faq.id}`} className="block text-sm font-medium text-gray-700 mb-1">Question {index + 1}</label>
                <button
                  type="button"
                  onClick={() => setFaqs(faqs.filter(f => f.id !== faq.id))}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                id={`faq-q-${faq.id}`}
                value={faq.question}
                onChange={(e) => {
                  const newFaqs = [...faqs];
                  newFaqs[index].question = e.target.value;
                  setFaqs(newFaqs);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                placeholder="Enter question"
              />
              <label htmlFor={`faq-a-${faq.id}`} className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
              <textarea
                id={`faq-a-${faq.id}`}
                value={faq.answer}
                onChange={(e) => {
                  const newFaqs = [...faqs];
                  newFaqs[index].answer = e.target.value;
                  setFaqs(newFaqs);
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter answer"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFaqs([...faqs, { id: faqs.length + 1, question: "", answer: "" }])}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add FAQ
        </button>
      </section>

      {/* Section Order (Drag-and-Drop Placeholder) */}
      <section className="mb-8 border-b border-gray-200 pb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
          <ArrowPathIcon className="h-6 w-6 mr-2 text-indigo-500" /> Section Order
        </h3>
        <p className="text-gray-600 mb-3">Drag and drop to reorder homepage sections. (Placeholder for actual drag & drop UI)</p>
        <div className="space-y-2">
          {sectionOrder.map((section, index) => (
            <div key={section} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-4 py-2">
              <span className="text-gray-700">
                {section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('F A Qs', 'FAQs').replace('C T A', 'CTA')}
              </span>
              <div className="flex space-x-2">
                {index > 0 && (
                  <button type="button" onClick={() => moveSection(index, index - 1)} className="text-gray-400 hover:text-gray-600" title="Move up">↑</button>
                )}
                {index < sectionOrder.length - 1 && (
                  <button type="button" onClick={() => moveSection(index, index + 1)} className="text-gray-400 hover:text-gray-600" title="Move down">↓</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="pt-6">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Home Page Content
        </button>
      </div>
    </div>
  );
}
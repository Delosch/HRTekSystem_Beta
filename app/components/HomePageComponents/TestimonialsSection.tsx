import { useState } from "react";
import { ChevronDown } from "lucide-react"; // Make sure lucide-react is installed

type Testimonial = {
  quote: string;
  name: string;
  title: string;
  image?: string;
};

interface Props {
  testimonials: Testimonial[];
}

export default function TestimonialSection({ testimonials }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Show first 6 if not expanded, else show all
  const visibleTestimonials = expanded ? testimonials : testimonials.slice(0, 6);

  return (
    <section className="bg-blue-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-black">
          Hear from our customers
        </h2>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {visibleTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 break-inside-avoid"
            >
              <p className="text-gray-800 font-medium mb-6">
                {testimonial.quote}
              </p>
              <div className="flex items-center gap-4 mt-auto">
                {testimonial.image && (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show Expand button if not expanded and there are more testimonials */}
        {!expanded && testimonials.length > 6 && (
          <div className="flex items-center justify-center mt-10">
            <button
              onClick={() => setExpanded(true)}
              className="relative w-full max-w-xl text-gray-600 group"
            >
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <span className="relative bg-blue-50 px-4 text-sm font-medium flex items-center gap-2 justify-center hover:text-black">
                Expand <ChevronDown className="w-4 h-4" />
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

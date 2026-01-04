import { useState } from "react";
import Navbar from "~/components/HomePageComponents/Navbar";
import Footer from "../components/Footer";

export default function BlogPage() {
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);

  // Sample blog data — extend 'content' for full post body
  const blogs = [
    {
      id: 1,
      title: "HR Trends in 2025",
      excerpt:
        "Explore the key HR trends shaping the future of work in 2025 — from AI-driven hiring to employee well-being strategies. Discover what forward-thinking teams are doing to stay ahead.",
      imageUrl: "/assets/blogAssets/blogThumb1.png",
      content: `
        13 November 2024

        Stay Ahead with the Latest HR Tech Trends: What You Need to Know in 2025

In the rapidly evolving landscape of Human Resources, staying up to date with the latest technology trends is no longer a luxury—it's a necessity. As organizations strive to remain competitive, leveraging the latest HR tech innovations is critical to optimizing workforce management, enhancing employee experience, and driving organizational success.

Our website serves as your go-to hub for insights, trends, and innovations in the world of HR technology. In this blog, we dive into some of the most impactful HR tech trends shaping the industry in 2024 and how your organization can benefit from them.

1. Generative AI for HR: The Next Frontier

The rise of Generative AI is transforming HR processes across the board. Tools like ChatGPT and other AI-powered platforms are enabling HR teams to automate tasks such as candidate screening, employee engagement surveys, and even personalized learning recommendations. These tools help organizations save time, reduce biases, and enhance the overall employee experience.

Trend Insight: AI-based chatbots and virtual assistants are now more sophisticated, handling complex HR inquiries, onboarding, and real-time employee support with a human-like touch.

Practical Tip: Implement AI-powered tools to streamline repetitive tasks, freeing up HR teams to focus on strategic initiatives like talent development and culture-building.


2.The Rise of People Analytics for Data-Driven Decision Making.

People Analytics is not just a buzzword—it's becoming the backbone of strategic HR decision-making. Organizations are increasingly leveraging data analytics to gain insights into employee performance, turnover rates, and engagement levels.

Trend Insight: Advanced People Analytics tools now integrate seamlessly with HRIS systems, providing predictive analytics to identify potential talent gaps and retention risks.

Practical Tip: Use data-driven insights to build robust talent management strategies, improve workforce planning, and drive higher employee satisfaction.


3. Hybrid Work Models and Digital Workspaces.

The shift to hybrid work models continues to dominate the HR landscape. As organizations adapt to the flexible work environment, the need for digital workspaces that foster collaboration, engagement, and productivity has become more critical than ever.

Trend Insight: The latest HR platforms are equipped with features to manage hybrid workforces, such as remote team collaboration tools, virtual wellness programs, and digital performance management systems.

Practical Tip: Invest in cloud-based HR technology that supports seamless communication, real-time feedback, and employee engagement, regardless of location.


4. Emphasis on Employee Experience Platforms (EXP)

Employee experience (EX) has taken center stage in 2024, with organizations prioritizing platforms that offer a holistic view of the employee journey. From onboarding to performance management, the focus is on creating a seamless, engaging, and rewarding experience for employees.

Trend Insight: HR Tech solutions are now integrating AI and machine learning to personalize the employee journey, offering customized learning paths, tailored benefits, and personalized career growth recommendations.

Practical Tip: Explore EXP tools that align with your organizational culture to boost employee satisfaction and retention.


5. The Emergence of Total Workforce Management

As organizations increasingly rely on a mix of full-time employees, freelancers, and gig workers, there is a growing need for Total Workforce Management solutions. These platforms provide a unified view of all types of workers, enabling better workforce planning and resource allocation.

Trend Insight: Total Workforce Management systems integrate with existing HR platforms to optimize workforce costs, enhance compliance, and improve agility.

Practical Tip: Implement solutions that allow you to manage both permanent and contingent workers from a single platform to drive efficiency and compliance.


6. Hyper-Personalization in Learning & Development

With the rise of personalized learning experiences, organizations are shifting from one-size-fits-all training programs to **hyper-personalized learning and development(L&D) initiatives. This trend leverages AI and data analytics to deliver content tailored to individual learning styles and career aspirations.

Trend Insight: The latest L&D platforms use AI to recommend personalized learning paths, making upskilling and reskilling more efficient.

Practical Tip: Invest in platforms that support adaptive learning technologies to enhance employee growth and retention.


7. Blockchain for Secure HR Data Management

Blockchain technology is gradually making its way into HR, especially in areas like secure employee data management, verifying credentials, and streamlining payroll processes. This technology ensures transparency, security, and efficiency in managing sensitive HR information.

Trend Insight: Blockchain-based HR platforms offer decentralized data storage, reducing the risk of data breaches and enhancing trust among employees.

Practical Tip: Explore blockchain solutions to enhance the security and integrity of your HR data management.


8. Green HR Tech: Driving Sustainability in HR

Sustainability is now a core business strategy, and HR is no exception. **Green HR Tech** focuses on tools and platforms that support sustainable workforce practices, such as reducing paper usage, promoting remote work, and enabling digital onboarding processes.

Trend Insight: Platforms that support sustainability initiatives are gaining traction, helping organizations reduce their carbon footprint and enhance their employer brand.

Practical Tip: Implement eco-friendly HR technologies to support your organization’s sustainability goals.


Stay Informed, Stay Ahead

The HR technology landscape is evolving faster than ever, and staying ahead of the curve is crucial for organizational success. Our website offers the latest insights, case studies, and best practices to help you navigate the dynamic world of HR tech.


Visit us regularly to explore how you can leverage these trends to transform your HR function, boost employee engagement, and drive business growth. Let's take your HR strategy to the next level together.

**Ready to transform your HR processes?**  

Explore our resources, stay updated with the latest trends, and let us guide you on your journey toward HR excellence.
      `,
    },
    {
      id: 2,
      title: "HCM Solutions: The Choice for a Future-Ready HR Transformation",
      excerpt:
        "Uncover how modern Human Capital Management (HCM) solutions are empowering organizations to streamline operations, enhance workforce engagement, and lead the way in digital HR transformation.",
      imageUrl: "/assets/blogAssets/blogThumb2.png",
      content: `
        25 October 2024


        Here’s a structured outline with content ideas for your blog on “HCM Solutions: The Choice for a Future-Ready HR Transformation”:  

HCM Solutions: The Choice for a Future-Ready HR Transformation


Introduction

- In today’s fast-changing business landscape, Human Capital Management (HCM) solutions are no longer optional—they’re essential.  

- With increasing emphasis on HR automation, data-driven decision-making, and enhancing employee experience, HCM solutions are becoming the backbone of future-ready organizations.  

This blog explores why HCM solutions are crucial for companies that aim to thrive in the modern HR landscape.  


1. What is HCM and Why It Matters?

HCM*encompasses the end-to-end processes for managing an organization’s workforce, including **recruitment, onboarding, payroll, performance management, learning, and analytics.


2. The Role of HR Automation in Driving Transformation

Automation minimizes manual tasks, allowing HR teams to focus on strategic initiatives.  

Tasks like payroll processing, performance reviews, and employee data management** are automated for seamless operations.    


3. HCM Solutions as a Catalyst for HR Transformation  

HR transformation is more than just adopting new tools—it’s about reimagining HR to meet future needs.  

HCM platforms enable HR teams to shift from administrative tasks to strategic functions, such as:  

Workforce planning and development  

Reskilling and upskilling employees to align with business goals  

Creating a data-driven culture for better people management  


4. Preparing for the Future with HCM: A Strategic Necessity 

Adaptability is key in today’s environment of rapid technological and workforce changes.  

Future-ready organizations rely on HCM solutions to:  

Stay compliant with evolving labor laws  

Manage remote or hybrid workforces effectively  

 Foster an agile workplace with continuous feedback and performance tracking  


5. Why Choose HCM Solutions for Your Business?

An HCM solution isn’t just a software—it’s a **strategic partner** for long-term HR success.  
      `,
    },
  ];

  const handleToggle = (id: number) => {
    setSelectedBlogId((prevId) => (prevId === id ? null : id));
  };

  return (
    <>
      <link rel="canonical" href="/blogPage" />
      <main className="bg-white">
        <Navbar />
        <div className="bg-[#023e8a]">
          <div className="relative w-full bg-[#023e8a] text-white overflow-hidden">
            <div className="w-full flex items-center justify-center px-4 py-12 sm:py-12">
              <div className="bg-[#023e8a] text-white py-2 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                  {/* Left Side: Text and CTA */}
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white mt-20">
                        <span className="text-9xl text-white">Blogs</span>
                        <br />
                        <span className="font-light text-[#D4E1F4]">
                          Insights, Ideas, and Innovation in HR
                        </span>
                      </h2>
                    </div>
                    <p className="text-lg italic text-[#C5D5EC] max-w-xl">
                      Stay ahead of the curve with expert insights, strategic
                      advice, and real-world stories from the evolving world of
                      Human Resources. Whether you're a growing startup or an
                      established enterprise, our blog offers curated content to
                      help you navigate digital transformation, enhance employee
                      experience, and build a future-ready HR function.
                    </p>
                  </div>

                  {/* Right Side: Static UI Image */}
                  <div className="flex justify-center">
                    <img
                      src="/assets/blogAssets/blogArt.png"
                      alt="AI Powered HCM UI"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Header */}
        <section className="py-12 px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Insights & Resources
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest in HR technology, strategy, and digital
            transformation.
          </p>
        </section>

        {/* Blog Grid */}
        <section className="px-6 py-12">
          <div className="max-w-6xl mx-auto space-y-12">
            {blogs.map((blog) => (
              <div key={blog.id}>
                {/* Blog Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition hover:shadow-xl">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                    <button
                      onClick={() => handleToggle(blog.id)}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      {selectedBlogId === blog.id
                        ? "Hide Details"
                        : "Read More →"}
                    </button>
                  </div>
                </div>

                {/* Expanded Blog Content */}
                {selectedBlogId === blog.id && (
                  <div className="mt-6 bg-gray-50 rounded-xl p-6 shadow-inner text-gray-700 whitespace-pre-line">
                    {blog.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-100 py-12 px-6 text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Get the Latest Updates
          </h3>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter for fresh HR insights and tips.
          </p>
          <form className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-300"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Subscribe
            </button>
          </form>
        </section>
        <Footer />
      </main>
    </>
  );
}

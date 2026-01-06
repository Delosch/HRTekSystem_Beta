import React, { useState, useEffect } from "react";
import Sidebar from "../components/DashboardComponents/Sidebar";
import {
  CheckCircle,
  Download,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  Clock,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { json, LoaderFunction } from "@remix-run/node";
import { getEnhancedUser } from "~/utils/user.server";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getEnhancedUser(request);
  return json({ user });
};

export default function UpdatesDashboard() {
  const { user } = useLoaderData<typeof loader>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updates = [
    {
      title: "Project Started",
      date: "2025-06-01",
      description: "Initial kickoff meeting held and requirements gathered from client.",
      attendees: "Rajeev Kapoor, Swapnil Tiwari, Pragati Sharma",
      status: "completed",
      category: "Kickoff"
    },
    {
      title: "HR Tech Maturity Analysis Initiated",
      date: "2025-06-05",
      description: "Preliminary assessment of HR systems and tech readiness underway.",
      attendees: "Rajeev Kapoor, Swapnil Tiwari, Pragati Sharma",
      status: "completed",
      category: "Analysis"
    },
    {
      title: "Stakeholder Interviews Conducted",
      date: "2025-06-10",
      description: "Key HR personnel interviewed to understand business processes.",
      attendees: "Rajeev Kapoor, Swapnil Tiwari, Pragati Sharma",
      status: "completed",
      category: "Research"
    },
    {
      title: "Gap Analysis Completed",
      date: "2025-06-15",
      description: "Compared current HR processes with industry best practices.",
      attendees: "Rajeev Kapoor, Swapnil Tiwari, Pragati Sharma",
      status: "completed",
      category: "Analysis"
    },
    {
      title: "Roadmap Draft Created",
      date: "2025-06-20",
      description: "Initial HR transformation roadmap shared with internal team for review.",
      attendees: "Rajeev Kapoor, Swapnil Tiwari, Pragati Sharma",
      status: "completed",
      category: "Planning"
    },
    {
      title: "Tool Evaluation Session Scheduled",
      date: "2025-06-25",
      description: "Session planned to evaluate suitable HCM tools with the client.",
      attendees: "Rajeev Kapoor, Swapnil Tiwari, Pragati Sharma",
      status: "in-progress",
      category: "Evaluation"
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Kickoff": "bg-purple-100 text-purple-700 border-purple-300",
      "Analysis": "bg-blue-100 text-blue-700 border-blue-300",
      "Research": "bg-green-100 text-green-700 border-green-300",
      "Planning": "bg-orange-100 text-orange-700 border-orange-300",
      "Evaluation": "bg-pink-100 text-pink-700 border-pink-300"
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const handleDownloadTimeline = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the timeline');
      return;
    }

    const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>HR Transformation Timeline</title>
                    <style>
                        @page { margin: 20mm; }
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 3px solid #2563eb;
                            padding-bottom: 20px;
                            margin-bottom: 30px;
                        }
                        .header h1 {
                            color: #1e40af;
                            margin: 0;
                            font-size: 28px;
                        }
                        .timeline-item {
                            position: relative;
                            padding-left: 40px;
                            margin-bottom: 30px;
                            border-left: 2px solid #e5e7eb;
                        }
                        .timeline-item::before {
                            content: '';
                            position: absolute;
                            left: -6px;
                            top: 5px;
                            width: 10px;
                            height: 10px;
                            border-radius: 50%;
                            background: #2563eb;
                            border: 2px solid white;
                            box-shadow: 0 0 0 2px #2563eb;
                        }
                        .timeline-item h2 {
                            color: #1e40af;
                            font-size: 18px;
                            margin: 0 0 5px 0;
                        }
                        @media print {
                            .timeline-item { page-break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>HR Digital Transformation Timeline</h1>
                        <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
                    </div>
                    <div class="timeline">
                        ${updates.map((update, index) => `
                            <div class="timeline-item">
                                <h2>${index + 1}. ${update.title}</h2>
                                <div><strong>Date:</strong> ${formatDate(update.date)}</div>
                                <div><strong>Description:</strong> ${update.description}</div>
                                <div><strong>Attendees:</strong> ${update.attendees}</div>
                            </div>
                        `).join('')}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 100);
                        };
                    </script>
                </body>
            </html>
        `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {!isSidebarCollapsed && <Sidebar user={user} />}

      <main className="flex-1 md:ml-64 p-4 sm:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Project Updates</h1>
              <p className="text-gray-600">Track your HR transformation journey</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Updates</p>
                  <p className="text-3xl font-bold text-gray-900">{updates.length}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {updates.filter(u => u.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {updates.filter(u => u.status === 'in-progress').length}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-orange-600 opacity-20" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleDownloadTimeline}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Download className="w-5 h-5" />
              Download Timeline
            </button>
            <button
              onClick={() => {
                const bottom = document.getElementById("latest-updates-anchor");
                bottom?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium"
            >
              <Sparkles className="w-5 h-5" />
              See Latest Updates
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 hidden md:block" />

          {/* Updates */}
          <div className="space-y-6">
            {updates.map((update, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setSelectedUpdate(index)}
                onMouseLeave={() => setSelectedUpdate(null)}
              >
                {/* Timeline Dot */}
                <div className="absolute left-6 top-6 w-5 h-5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full border-4 border-white shadow-lg hidden md:block z-10" />

                {/* Update Card */}
                <div className={`ml-0 md:ml-20 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 ${selectedUpdate === index ? 'scale-[1.02] border-blue-400' : ''
                  }`}>
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(update.category)}`}>
                            {update.category}
                          </span>
                          {update.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {update.status === 'in-progress' && (
                            <Clock className="w-5 h-5 text-orange-600 animate-pulse" />
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{update.title}</h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">{formatDate(update.date)}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-6 h-6 text-gray-400 transition-transform ${selectedUpdate === index ? 'rotate-90' : ''
                        }`} />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Conclusion
                        </p>
                        <p className="text-gray-700 leading-relaxed">{update.description}</p>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-start gap-2">
                          <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Attendees
                            </p>
                            <p className="text-gray-700">{update.attendees}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  {update.status === 'in-progress' && (
                    <div className="bg-orange-50 px-6 py-3 border-t border-orange-200">
                      <div className="flex items-center gap-2 text-orange-700">
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span className="text-sm font-medium">Currently in progress</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="latest-updates-anchor" className="mt-8" />
      </main>
    </div>
  );
}

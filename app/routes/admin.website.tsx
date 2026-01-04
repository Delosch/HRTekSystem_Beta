// app/routes/admin.website._layout.tsx
import { NavLink, Outlet } from "@remix-run/react";
import {
  HomeModernIcon,
  ChatBubbleBottomCenterTextIcon,
  MegaphoneIcon,
  MagnifyingGlassCircleIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";

// Define navigation items for the website settings sidebar
const websiteNavItems = [
  { name: "Home Page Content", href: "/admin/website/home", icon: HomeModernIcon },
  { name: "Testimonials", href: "/admin/website/testimonials", icon: ChatBubbleBottomCenterTextIcon },
  { name: "Announcements & Banners", href: "/admin/website/banners", icon: MegaphoneIcon },
  { name: "SEO & Metadata", href: "/admin/website/seo", icon: MagnifyingGlassCircleIcon },
  { name: "Blog / Insights", href: "/admin/website/blogs", icon: PencilSquareIcon },
  { name: "Integrations", href: "/admin/website/integrations", icon: PuzzlePieceIcon },
  { name: "Analytics Dashboard", href: "/admin/website/analytics", icon: ChartBarIcon }, // Optional / Phase 2
  { name: "Brand Assets", href: "/admin/website/branding", icon: PaintBrushIcon }, // Optional
];

// Helper for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function WebsiteSettingsLayout() {
  return (
    <div className="bg-gray-100 min-h-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Website Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Website Settings Sub-Navigation Sidebar */}
        <nav className="lg:w-60 flex-shrink-0 bg-white shadow-md rounded-lg p-4">
          <ul className="space-y-2">
            {websiteNavItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    classNames(
                      "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )
                  }
                  // `end` prop for NavLink ensures it's only active for exact match.
                  // For /blogs, it should be active for /blogs and /blogs/new
                  // Adjusting for blogs to make /blogs the active link for any blog sub-route
                  end={item.href !== "/admin/website/blogs"}
                >
                  <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content area for nested website settings routes */}
        <div className="flex-1">
          <Outlet /> {/* This will render the specific website settings page */}
        </div>
      </div>
    </div>
  );
}
import {
  House,
  FileChartPie,
  RefreshCw,
  Map,
  Puzzle,
  DraftingCompass,
  Shapes,
  FileChartColumn,
  CreditCard,
  LogOut,
  ShoppingCart,
  Rocket,
  Brain,
  FileText,
  LucideIcon
} from "lucide-react";

export interface SidebarItem {
  label: string;
  path: string;
  icon: LucideIcon;
  isLogout?: boolean; // optional
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const sidebarSections: SidebarSection[] = [
  {
    title: "Home",
    items: [
      { label: "Home", path: "/dashboard", icon: House },
    ],
  },
  {
    title: "Inbox",
    items: [
      { label: "Status", path: "/statusDashboard", icon: FileChartPie },
      { label: "Updates", path: "/updatesDashboard", icon: RefreshCw },
    ],
  },
  {
    title: "Reports",
    items: [
      { label: "My Reports", path: "/reports", icon: FileText },
    ],
  },
  {
    title: "Assessment Engines",
    items: [
      { label: "Auto-generated HR Digital Roadmap & ROI", path: "/roadmapDashboard", icon: Map },
      { label: "Cognitive HCM Vendor Fit Engine", path: "/vendorDashboard", icon: Puzzle },
      { label: "AI-driven HR Tech Diagnostics", path: "/ai-maturity/dashboard", icon: FileChartColumn },
      { label: "Shared Services Operating Model Planner", path: "/sharedDashboard", icon: DraftingCompass },
      { label: "Change Management Intelligence Engine", path: "/changeDashboard", icon: Shapes },
    ],
  },
  {
    title: "HTI Advisory",
    items: [
      { label: "HR Transformation Intelligence", path: "/hti", icon: Brain },
    ],
  },
  {
    title: "HR Transformation",
    items: [
      { label: "Get Started", path: "/startTransformationDashboard", icon: Rocket },
    ],
  },
  {
    title: "Billing",
    items: [
      { label: "Payment Requests", path: "/user-payment-dashboard", icon: CreditCard },
      { label: "Cart", path: "/cartDashboard", icon: ShoppingCart },
      { label: "Receipts", path: "/receiptsDashboard", icon: CreditCard },
    ],
  },
  {
    title: "Logout",
    items: [
      { label: "Logout", path: "/auth/logout", icon: LogOut, isLogout: true },
    ],
  },
];

import Sidebar from "./DashboardComponents/Sidebar";
import Navbar from "./HomePageComponents/Navbar";

export function Layout({ children, user }: { children: React.ReactNode; user?: any }) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar user={user} />
        <div style={{
          flex: 1,
          padding: '2rem',
          marginLeft: '256px' // md:w-64 is 256px
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
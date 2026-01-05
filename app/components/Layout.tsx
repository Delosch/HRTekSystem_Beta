import Sidebar from "./DashboardComponents/Sidebar";

export function Layout({ children, user }: { children: React.ReactNode; user?: any }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'sans-serif'
    }}>
      <Sidebar user={user} />
      <div style={{
        flex: 1,
        padding: '0rem 2rem 0rem 2rem',
        marginLeft: '256px' // md:w-64 is 256px
      }}>
        {children}
      </div>
    </div>
  );
}
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'sans-serif'
    }}>
      <Sidebar />
      <div style={{
        flex: 1,
        padding: '0rem 2rem 0rem 2rem',
        marginLeft: '50px' // Match this with your sidebar's expanded width
      }}>
        {children}
      </div>
    </div>
  );
}
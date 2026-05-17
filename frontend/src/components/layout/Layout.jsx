import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} IET Gorakhpur University · Lost &amp; Found</p>
          <p className="text-xs text-muted-foreground">A campus-only utility for students, faculty &amp; staff</p>
        </div>
      </footer>
    </div>
  );
}

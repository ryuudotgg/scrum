import { Link } from "react-router";

export function Header() {
  return (
    <header className="flex items-center justify-between border-input border-b px-6 py-4">
      <Link to="/">
        <h1 className="font-bold text-3xl text-foreground tracking-tight">
          Scrum
        </h1>
      </Link>
    </header>
  );
}

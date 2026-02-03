import { type JSX } from "react";
type Props = {
  children: JSX.Element;
  role?: string;
};

const RequireAuth = ({ children, role }: Props) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <div>Login required</div>;
  if (role && role !== userRole) return <div>Access denied</div>;

  return children;
};

export default RequireAuth;

import { UsersTable, type UserRow } from "@/components/tables/UsersTable";

const SKELETON_USERS: UserRow[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `skeleton-${i}`,
  name: null,
  email: "",
  role: "USER",
  phone: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export default function Loading() {
  return <UsersTable rows={SKELETON_USERS} loading pageSize={10} />;
}

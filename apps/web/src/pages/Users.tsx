import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  Mail,
  PenIcon,
  Plus,
  Users as UsersIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { api, Department, OrgUser } from "../lib/api";
import Tabs from "../components/ui/Tabs";
import Badge from "../components/ui/Badge";
import DataTable, {
  DataTableColumn,
} from "../components/ui/Datatable";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import { formatDateTime } from "../utils/formatDateTime";

type UserRole = "ADMIN" | "USER";

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId: string;
};

type OrgUserWithDepartment = OrgUser & {
  department?: Department | null;
};

const EMPTY_FORM: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "USER",
  departmentId: "",
};

export default function Users() {
  const [users, setUsers] = useState<OrgUser[]>([]);

  // Departments are only loaded when modal opens.
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");

  const [showUserModal, setShowUserModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<OrgUser | null>(null);

  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [error, setError] = useState("");


const PAGE_SIZE = 25;

const [page, setPage] = useState(1);
const [totalUsers, setTotalUsers] = useState(0);

async function loadUsers(
  requestedPage = page
) {
  try {
    setLoading(true);
    setError("");

    const response = await api.get("/users", {
      params: {
        page: requestedPage,
        pageSize: PAGE_SIZE,
      },
    });

    setUsers(response.data.items ?? []);
    setTotalUsers(response.data.total ?? 0);
  } catch (err: any) {
    console.error("Failed to load users:", err);

    setError(
      err?.response?.data?.error ??
        err?.response?.data?.message ??
        "Failed to load users."
    );
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadUsers(1);
  }, []);


  async function loadDepartments() {
    try {
      setDepartmentsLoading(true);

      const response = await api.get("/departments");

      setDepartments(response.data.items ?? response.data ?? []);
    } catch (err: any) {
      console.error("Failed to load departments:", err);

      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to load departments."
      );
    } finally {
      setDepartmentsLoading(false);
    }
  }


  function openCreateModal() {
    setError("");
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setShowUserModal(true);
    loadDepartments();
  }

  function openEditModal(user: OrgUser) {
    setError("");
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role === "ADMIN" ? "ADMIN" : "USER",
      departmentId: user.departmentId ?? "",
    });
    setShowUserModal(true);
    loadDepartments();
  }

  function closeModal() {
    if (saving) return;

    setShowUserModal(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  function updateForm<K extends keyof UserForm>(
    key: K,
    value: UserForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSaveUser(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!editingUser && form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.role === "USER" && !form.departmentId) {
      setError("Select a department for this user.");
      return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        await api.patch(`/users/${editingUser.id}`, {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          departmentId:
            form.role === "USER"
              ? form.departmentId
              : null,
        });
      } else {
        await api.post("/users", {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          departmentId:
            form.role === "USER"
              ? form.departmentId
              : undefined,
        });
      }

      closeModal();

      await loadUsers();
    } catch (err: any) {
      console.error("Failed to save user:", err);

      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to save user."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDepartmentChange(
    userId: string,
    departmentId: string
  ) {
    try {
      setError("");

      await api.patch(`/users/${userId}`, {
        departmentId: departmentId || null,
      });

      await loadUsers();
    } catch (err: any) {
      console.error("Failed to update department:", err);

      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to update department."
      );
    }
  }

  const totalUser = users.length;
  const adminCount = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  const userCount = users.filter(
    (user) => user.role === "USER"
  ).length;

  const roleTabs = [
    {
      value: "",
      label: "All",
      count: totalUser,
    },
    {
      value: "ADMIN",
      label: "Admins",
      count: adminCount,
    },
    {
      value: "USER",
      label: "Users",
      count: userCount,
    },
  ];

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      const matchesRole =
        !roleFilter || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);


  const columns: DataTableColumn<OrgUser>[] = [
    {
      key: "user",
      header: "User",
      className: "min-w-[220px]",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {user.name}
            </p>

            <p className="truncate text-xs text-slate-400">
              ID: {user.id}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "email",
      header: "Email",
      className: "min-w-[240px]",
      render: (user) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Mail
            size={15}
            className="shrink-0 text-slate-400"
          />

          <span className="truncate">
            {user.email}
          </span>
        </div>
      ),
    },

    {
      key: "role",
      header: "Role",
      className: "whitespace-nowrap",
      render: (user) =>
        user.role === "ADMIN" ? (
          <Badge variant="success">
            {user.role}
          </Badge>
        ) : (
          <Badge variant="info">
            {user.role}
          </Badge>
        ),
    },

    {
      key: "department",
      header: "Department",
      className: "min-w-[190px]",
      render: (user) => {
        const userWithDepartment =
          user as OrgUserWithDepartment;
        if (userWithDepartment.department?.name) {
          return (
            <div className="flex items-center gap-2">
              <Building2
                size={14}
                className="shrink-0 text-slate-400"
              />

              <span className="text-sm text-slate-600">
                {userWithDepartment.department.name}
              </span>
            </div>
          );
        }

        return (
          <span className="text-xs text-slate-400">
            Unassigned
          </span>
        );
      },
    },

    {
      key: "createdAt",
      header: "Created",
      className: "text-slate-500 whitespace-nowrap",
      render: (user) =>
       formatDateTime(user.createdAt)
    },

    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (user) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openEditModal(user);
            }}
            className="inline-flex rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Edit user"
          >
            <PenIcon size={14} />
          </button>

          <Link
            to={`/users/${user.id}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="View user"
          >
            <ArrowUpRight size={17} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-5 sm:p-6 lg:p-8">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-slate-500">
              Organization workspace
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Users
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Manage admins and department users in your
              organization.
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreateModal}
          >
            <Plus size={16} />
            Add user
          </Button>
        </div>

        <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <Tabs
            items={roleTabs}
            value={roleFilter}
            onChange={setRoleFilter}
          />
        </div>

       

        {error && !showUserModal && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

       <DataTable
          columns={columns}
          data={filteredUsers}
          rowKey={(user) => user.id}
          loading={loading}
          loadingText="Loading users..."
          emptyIcon={<UsersIcon size={20} />}
          emptyTitle="No users found"
          emptyDescription="Try changing your search or user type filter."
          minWidth="950px"
          page={page}
          pageSize={PAGE_SIZE}
          total={totalUsers}
          onPageChange={(nextPage) => {
            setPage(nextPage);
            loadUsers(nextPage);
          }}
        />
      </div>
      <Modal
        open={showUserModal}
        onClose={closeModal}
        title={
          editingUser
            ? "Edit user"
            : "Add user"
        }
        description={
          editingUser
            ? "Update user information and department."
            : "Create an admin or a department user."
        }
        loading={saving}
        closeOnOverlayClick={false}
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="user-form"
              loading={saving}
              loadingText={
                editingUser
                  ? "Saving..."
                  : "Creating..."
              }
            >
              {editingUser
                ? "Save changes"
                : "Create user"}
            </Button>
          </>
        }
      >
        <form
          id="user-form"
          onSubmit={handleSaveUser}
          className="space-y-4"
        >

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            id="user-name"
            label="Full name"
            type="text"
            value={form.name}
            onChange={(event) =>
              updateForm(
                "name",
                event.target.value
              )
            }
            placeholder="Enter full name"
            disabled={saving}
            autoComplete="name"
          />

          <Input
            id="user-email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) =>
              updateForm(
                "email",
                event.target.value
              )
            }
            placeholder="user@example.com"
            disabled={saving}
            autoComplete="email"
          />

          {!editingUser && (
            <Input
              id="user-password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) =>
                updateForm(
                  "password",
                  event.target.value
                )
              }
              placeholder="Minimum 8 characters"
              hint="Password must contain at least 8 characters."
              disabled={saving}
              autoComplete="new-password"
            />
          )}

          <Select
            id="user-role"
            label="User type"
            value={form.role}
            onChange={(event) => {
              const role =
                event.target.value as UserRole;

              setForm((prev) => ({
                ...prev,
                role,
                departmentId:
                  role === "USER"
                    ? prev.departmentId
                    : "",
              }));
            }}
            disabled={saving}
            options={[
              {
                value: "USER",
                label: "User (department-scoped)",
              },
              {
                value: "ADMIN",
                label: "Admin (org-wide)",
              },
            ]}
          />

          {form.role === "USER" && (
            <div>
              <Select
                id="user-department"
                label="Department"
                value={form.departmentId}
                onChange={(event) =>
                  updateForm(
                    "departmentId",
                    event.target.value
                  )
                }
                disabled={
                  saving || departmentsLoading
                }
              >
                <option value="">
                  {departmentsLoading
                    ? "Loading departments..."
                    : "Select a department"}
                </option>

                {departments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.name}
                  </option>
                ))}
              </Select>

              {!departmentsLoading &&
                departments.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-600">
                    No departments yet — create one
                    on the Departments page first.
                  </p>
                )}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
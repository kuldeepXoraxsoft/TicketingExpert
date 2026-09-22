import { useEffect, useState } from "react";
import {
  Edit3,
  FileText,
  Mail,
  Plus,
  Trash2,
} from "lucide-react";

import { api, Department } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/input";
import Button from "../components/ui/Button";
import DataTable, {
  DataTableColumn,
} from "../components/ui/Datatable";
import SearchInput from "../components/ui/SearchInput";
import useDebounce from "../hooks/useDebounce";
import ConfirmModal from "../components/confirmModal";

interface EmailTemplate {
  id: string;
  title: string;
  subject: string | null;
  body: string;
  departmentId: string;
  department?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface TemplateForm {
  title: string;
  subject: string;
  body: string;
  departmentId: string;
}

const EMPTY_FORM: TemplateForm = {
  title: "",
  subject: "",
  body: "",
  departmentId: "",
};

const TEMPLATE_VARIABLES = [
  "{{customer_name}}",
  "{{ticket_id}}",
  "{{ticket_subject}}",
  "{{agent_name}}",
  "{{department_name}}",
];

export default function EmailTemplates() {
  const { user } = useAuth();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] =
    useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<EmailTemplate | null>(null);

  const [form, setForm] = useState<TemplateForm>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [deleteTemplate, setDeleteTemplate] =
    useState<EmailTemplate | null>(null);

  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  const isAdmin =
    user?.role === "ADMIN"

  async function loadDepartments() {
    try {
      setDepartmentsLoading(true);

      const response = await api.get("/departments");

      setDepartments(
        response.data.items ??
          response.data.departments ??
          response.data ??
          [],
      );
    } catch (err) {
      console.error(
        "Failed to load departments:",
        err,
      );

      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  }

  async function loadTemplates(
    requestedPage = page,
    requestedSearch = debouncedSearch,
  ) {
    try {
      setLoading(true);
      setError("");

      const params: Record<string, string | number> = {
        page: requestedPage,
        pageSize: 25,
      };

      if (requestedSearch.trim()) {
        params.search = requestedSearch.trim();
      }

      const response = await api.get(
        "/email-templates",
        {
          params,
        },
      );

      const data = response.data;

      setTemplates(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (err: any) {
      console.error(
        "Failed to load email templates:",
        err,
      );

      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to load email templates.",
      );

      setTemplates([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates(1, debouncedSearch);
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (page === 1) return;

    loadTemplates(page, debouncedSearch);
  }, [page]);

  useEffect(() => {
    loadDepartments();
  }, []);

  function getDefaultDepartmentId() {
    if (user?.departmentId) {
      return user.departmentId;
    }

    return "";
  }

  function openCreateModal() {
    setEditingTemplate(null);

    setForm({
      ...EMPTY_FORM,
      departmentId: getDefaultDepartmentId(),
    });

    setModalError("");
    setShowModal(true);
  }

  function openEditModal(
    template: EmailTemplate,
  ) {
    setEditingTemplate(template);

    setForm({
      title: template.title,
      subject: template.subject ?? "",
      body: template.body,
      departmentId: template.departmentId,
    });

    setModalError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingTemplate(null);
    setForm(EMPTY_FORM);
    setModalError("");
  }

  function updateField(
    field: keyof TemplateForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function insertVariable(variable: string) {
    setForm((current) => ({
      ...current,
      body: `${current.body}${
        current.body ? "\n" : ""
      }${variable}`,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setModalError("");

    if (!form.title.trim()) {
      setModalError(
        "Template title is required.",
      );
      return;
    }

    if (!form.departmentId) {
      setModalError(
        "Please select a department.",
      );
      return;
    }

    if (!form.body.trim()) {
      setModalError(
        "Template message is required.",
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        departmentId: form.departmentId,
        title: form.title.trim(),
        subject:
          form.subject.trim() || null,
        body: form.body.trim(),
      };

      if (editingTemplate) {
        await api.patch(
          `/email-templates/${editingTemplate.id}`,
          payload,
        );
      } else {
        await api.post(
          "/email-templates",
          payload,
        );
      }

      setShowModal(false);
      setEditingTemplate(null);
      setForm(EMPTY_FORM);

      await loadTemplates(
        page,
        debouncedSearch,
      );
    } catch (err: any) {
      console.error(
        "Failed to save email template:",
        err,
      );

      setModalError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to save email template.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openDeleteConfirm(
    template: EmailTemplate,
  ) {
    setDeleteTemplate(template);
  }

  function closeDeleteConfirm() {
    if (deletingId) return;

    setDeleteTemplate(null);
  }

  async function handleDelete() {
    if (!deleteTemplate) return;

    const template = deleteTemplate;

    try {
      setDeletingId(template.id);
      setError("");

      await api.delete(
        `/email-templates/${template.id}`,
      );

      setDeleteTemplate(null);

      if (
        templates.length === 1 &&
        page > 1
      ) {
        setPage(
          (current) => current - 1,
        );
      } else {
        await loadTemplates(
          page,
          debouncedSearch,
        );
      }
    } catch (err: any) {
      console.error(
        "Failed to delete email template:",
        err,
      );

      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to delete email template.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<EmailTemplate>[] =
    [
      {
        key: "template",
        header: "Template",
        className: "min-w-[280px]",
        render: (template) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Mail
                size={14}
                className="text-slate-600"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {template.title}
              </p>

              <p
                className="mt-1 max-w-[330px] truncate text-xs text-slate-400"
                title={template.body}
              >
                {template.body}
              </p>
            </div>
          </div>
        ),
      },

      {
        key: "subject",
        header: "Subject",
        className:
          "max-w-[260px] whitespace-nowrap",
        render: (template) => (
          <span
            className="block max-w-[240px] truncate text-slate-600"
            title={
              template.subject ?? "No subject"
            }
          >
            {template.subject ||
              "No subject"}
          </span>
        ),
      },

      {
        key: "department",
        header: "Department",
        className:
          "whitespace-nowrap",
        render: (template) => (
          <Badge variant="default">
            {template.department?.name ??
              "Unassigned"}
          </Badge>
        ),
      },

      {
        key: "updatedAt",
        header: "Updated",
        className:
          "whitespace-nowrap",
        render: (template) => (
          <span className="text-slate-500">
            {formatDate(
              template.updatedAt,
            )}
          </span>
        ),
      },

      {
        key: "actions",
        header: "Actions",
        headerClassName: "text-right",
        className:
          "whitespace-nowrap text-right",
        render: (template) => (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() =>
                openEditModal(template)
              }
              disabled={
                deletingId ===
                template.id
              }
              className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              title="Edit template"
            >
              <Edit3 size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                openDeleteConfirm(template)
              }
              disabled={
                deletingId ===
                template.id
              }
              className="rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              title="Delete template"
            >
              {deletingId ===
              template.id ? (
                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        ),
      },
    ];

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-5 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Workspace</span>

              <span className="text-slate-300">
                /
              </span>

              <span className="text-slate-700">
                Email Templates
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Email Templates
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Create reusable email messages
              for your department.
            </p>
          </div>

          {isAdmin && (
            <Button
              type="button"
              onClick={openCreateModal}
            >
              <Plus size={16} />
              Create Template
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search templates..."
            className="w-full max-w-xs"
          />
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={templates}
          rowKey={(template) =>
            template.id
          }
          loading={loading}
          loadingText="Loading email templates..."
          emptyIcon={
            <FileText size={21} />
          }
          emptyTitle={
            search
              ? "No templates found"
              : "No email templates yet"
          }
          emptyDescription={
            search
              ? "Try changing your search query."
              : "Create reusable email messages that your department can use while replying to tickets."
          }
          page={page}
          pageSize={25}
          total={total}
          onPageChange={setPage}
          minWidth="900px"
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={
          editingTemplate
            ? "Edit Email Template"
            : "Create Email Template"
        }
        description="Reusable messages for your support team."
        maxWidth="max-w-2xl"
        loading={saving}
        closeOnOverlayClick={false}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Modal Error */}
            {modalError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {modalError}
              </div>
            )}

            {/* Department */}
            <div>
              <label
                htmlFor="template-department"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Department
              </label>

              {isAdmin ? (
                <select
                  id="template-department"
                  value={form.departmentId}
                  onChange={(event) =>
                    updateField(
                      "departmentId",
                      event.target.value,
                    )
                  }
                  disabled={
                    saving ||
                    departmentsLoading
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">
                    Select department
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    ),
                  )}
                </select>
              ) : (
                <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                  {departments.find(
                    (department) =>
                      department.id ===
                      form.departmentId,
                  )?.name ??
                    user?.department?.name ??
                    "Your department"}
                </div>
              )}
            </div>

            {/* Title */}
            <Input
              id="template-title"
              label="Template Title"
              value={form.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value,
                )
              }
              placeholder="e.g. Request for More Information"
              disabled={saving}
              autoFocus
              hint="This name will be shown when selecting a template while replying."
            />

            {/* Subject */}
            <Input
              id="template-subject"
              label="Email Subject"
              value={form.subject}
              onChange={(event) =>
                updateField(
                  "subject",
                  event.target.value,
                )
              }
              placeholder="e.g. Regarding ticket #{{ticket_id}}"
              disabled={saving}
              hint="Optional"
            />

            {/* Message */}
            <div>
              <label
                htmlFor="template-body"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Message
              </label>

              <textarea
                id="template-body"
                value={form.body}
                onChange={(event) =>
                  updateField(
                    "body",
                    event.target.value,
                  )
                }
                placeholder={`Hello {{customer_name}},

Thank you for contacting our support team regarding ticket #{{ticket_id}}.

Regards,
{{agent_name}}`}
                disabled={saving}
                rows={12}
                className="w-full resize-y rounded-lg border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
              />

              <p className="mt-1 text-xs text-slate-400">
                You can use variables below.
                They will be replaced
                automatically when replying to
                a ticket.
              </p>
            </div>

            {/* Variables */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Available Variables
              </p>

              <div className="flex flex-wrap gap-2">
                {TEMPLATE_VARIABLES.map(
                  (variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() =>
                        insertVariable(
                          variable,
                        )
                      }
                      disabled={saving}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {variable}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
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
              loading={saving}
              loadingText={
                editingTemplate
                  ? "Saving..."
                  : "Creating..."
              }
            >
              {editingTemplate
                ? "Save Changes"
                : "Create Template"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTemplate}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete Email Template"
        description={
          deleteTemplate
            ? `Are you sure you want to delete "${deleteTemplate.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this email template?"
        }
        confirmText="Delete Template"
        cancelText="Cancel"
        variant="warning"
        loading={!!deletingId}
        loadingText="Deleting..."
      />
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

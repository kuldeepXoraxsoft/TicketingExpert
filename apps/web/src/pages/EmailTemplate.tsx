import { useEffect, useState } from "react";

import {
  Edit3,
  Eye,
  FileText,
  Mail,
  Plus,
  Trash2,
} from "lucide-react";

import { api, Department } from "../lib/api";
import { useAuth } from "../context/AuthContext";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import DataTable, {
  DataTableColumn,
} from "../components/ui/Datatable";
import SearchInput from "../components/ui/SearchInput";
import ConfirmModal from "../components/confirmModal";

import useDebounce from "../hooks/useDebounce";
import EmailTemplateModal from "../components/email-templates/EmailTemplateModal";
import { formatDateTime } from "../utils/formatDateTime";

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

export default function EmailTemplates() {
  const { user } = useAuth();

  const [templates, setTemplates] = useState<
    EmailTemplate[]
  >([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [loading, setLoading] = useState(true);

  const [departmentsLoading, setDepartmentsLoading] =
    useState(false);

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(
    search,
    500,
  );

  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] =
    useState(false);

  const [editingTemplate, setEditingTemplate] =
    useState<EmailTemplate | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [deleteTemplate, setDeleteTemplate] =
    useState<EmailTemplate | null>(null);

  const [error, setError] = useState("");

  const isAdmin =
    user?.role === "ADMIN"

  async function loadDepartments() {
    try {
      setDepartmentsLoading(true);

      const response = await api.get(
        "/departments",
      );

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

      const params: Record<
        string,
        string | number
      > = {
        page: requestedPage,
        pageSize: 25,
      };

      if (requestedSearch.trim()) {
        params.search =
          requestedSearch.trim();
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
    loadTemplates(
      1,
      debouncedSearch,
    );

    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (page === 1) return;

    loadTemplates(
      page,
      debouncedSearch,
    );
  }, [page]);

  useEffect(() => {
    loadDepartments();
  }, []);

  function openCreateModal() {
    setEditingTemplate(null);
    setShowModal(true);
  }

  function openEditModal(
    template: EmailTemplate,
  ) {
    setEditingTemplate(template);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingTemplate(null);
  }

  async function handleModalSuccess() {
    await loadTemplates(
      page,
      debouncedSearch,
    );
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
        className: "max-w-[280px]",

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
              template.subject ??
              "No subject"
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
            {formatDateTime(
              template.updatedAt,
            )}
          </span>
        ),
      },

      {
        key: "actions",
        header: "Actions",
        headerClassName:
          "text-right",

        className:
          "whitespace-nowrap text-right",

        render: (template) => (
          <div className="flex justify-end gap-1">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    openEditModal(
                      template,
                    )
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
                    openDeleteConfirm(
                      template,
                    )
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
              </>
            )}
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
      <EmailTemplateModal
        open={showModal}
        template={editingTemplate}
        departments={departments}
        departmentsLoading={
          departmentsLoading
        }
        onClose={closeModal}
        onSuccess={handleModalSuccess}
      />

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


import { useEffect, useState } from "react";

import Modal from "../ui/Modal";
import Input from "../ui/input";
import Button from "../ui/Button";

import { api, Department } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

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

interface EmailTemplateModalProps {
  open: boolean;
  template?: EmailTemplate | null;
  departments: Department[];
  departmentsLoading?: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
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

export default function EmailTemplateModal({
  open,
  template,
  departments,
  departmentsLoading = false,
  onClose,
  onSuccess,
}: EmailTemplateModalProps) {
  const { user } = useAuth();

  const [form, setForm] =
    useState<TemplateForm>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const isEditing = !!template;

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!open) return;

    setModalError("");

    if (template) {
      setForm({
        title: template.title,
        subject: template.subject ?? "",
        body: template.body,
        departmentId: template.departmentId,
      });

      return;
    }

    setForm({
      ...EMPTY_FORM,
      departmentId: user?.departmentId ?? "",
    });
  }, [
    open,
    template,
    user?.departmentId,
  ]);

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

  function handleClose() {
    if (saving) return;

    setModalError("");
    setForm(EMPTY_FORM);
    onClose();
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

      if (template) {
        await api.patch(
          `/email-templates/${template.id}`,
          payload,
        );
      } else {
        await api.post(
          "/email-templates",
          payload,
        );
      }

      await onSuccess();

      setForm(EMPTY_FORM);
      setModalError("");
      onClose();
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

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        isEditing
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
          {/* Error */}
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
                      insertVariable(variable)
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
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={saving}
            loadingText={
              isEditing
                ? "Saving..."
                : "Creating..."
            }
          >
            {isEditing
              ? "Save Changes"
              : "Create Template"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";

interface Department {
  id: string;
  name: string;
}

interface EmailTemplate {
  id: string;
  title: string;
  subject?: string | null;
  body: string;
  departmentId: string;
  department?: {
    id: string;
    name: string;
  };
}

export default function NewTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    requesterName: "",
    requesterEmail: "",
    departmentId: user?.departmentId ?? "",
    templateId: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoadingData(true);
      setError("");

      const requests = [
        api.get("/email-templates", {
          params: {
            page: 1,
            pageSize: 100,
          },
        }),
      ];

      // USER normally only needs their department.
      // ADMIN/SUPER_ADMIN can see departments.
      if (
        user?.role === "ADMIN" ||
        user?.role === "SUPER_ADMIN"
      ) {
        requests.push(
          api.get("/departments", {
            params: {
              page: 1,
              pageSize: 100,
            },
          }),
        );
      }

      const responses = await Promise.all(requests);

      const templateResponse = responses[0];

      setTemplates(
        templateResponse.data.items ??
          templateResponse.data.templates ??
          templateResponse.data ??
          [],
      );

      if (responses[1]) {
        setDepartments(
          responses[1].data.items ??
            responses[1].data.departments ??
            responses[1].data ??
            [],
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to load ticket data.",
      );
    } finally {
      setLoadingData(false);
    }
  }

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleTemplateChange(templateId: string) {
    const template = templates.find(
      (item) => item.id === templateId,
    );

    if (!template) {
      setForm((prev) => ({
        ...prev,
        templateId: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      templateId,
      subject: template.subject ?? "",
      body: template.body ?? "",
      departmentId:
        template.departmentId || prev.departmentId,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.requesterEmail.trim()) {
      setError("Requester email is required.");
      return;
    }

    if (!form.subject.trim()) {
      setError("Subject is required.");
      return;
    }

    if (!form.departmentId) {
      setError("Department is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.post("/tickets", {
        requesterName: form.requesterName.trim() || undefined,
        requesterEmail: form.requesterEmail.trim(),
        departmentId: form.departmentId,
        subject: form.subject.trim(),
        body: form.body,
        source: "MANUAL",
      });

      const ticketId =
        response.data?.ticket?.id ??
        response.data?.id;

      if (ticketId) {
        navigate(`/tickets/${ticketId}`);
      } else {
        navigate("/intickets");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to create ticket.",
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredTemplates = form.departmentId
    ? templates.filter(
        (template) =>
          template.departmentId === form.departmentId,
      )
    : templates;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-5 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/intickets"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            Back to tickets
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            New Ticket
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a new support ticket and send a response.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Customer */}
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Customer Details
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Customer Name
                  </label>

                  <input
                    type="text"
                    value={form.requesterName}
                    onChange={(e) =>
                      updateField(
                        "requesterName",
                        e.target.value,
                      )
                    }
                    placeholder="Customer name"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Customer Email
                  </label>

                  <input
                    type="email"
                    required
                    value={form.requesterEmail}
                    onChange={(e) =>
                      updateField(
                        "requesterEmail",
                        e.target.value,
                      )
                    }
                    placeholder="customer@example.com"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Ticket */}
            <div className="p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Ticket Details
              </h2>

              <div className="mt-4 space-y-4">
                {/* Department + Template */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Department"
                    value={form.departmentId}
                    onChange={(e) =>
                      updateField(
                        "departmentId",
                        e.target.value,
                      )
                    }
                    disabled={
                      loadingData ||
                      user?.role === "USER"
                    }
                    options={[
                      {
                        value: "",
                        label: "Select department",
                      },
                      ...departments.map((department) => ({
                        value: department.id,
                        label: department.name,
                      })),
                    ]}
                  />

                  <Select
                    label="Email Template"
                    value={form.templateId}
                    onChange={(e) =>
                      handleTemplateChange(
                        e.target.value,
                      )
                    }
                    disabled={loadingData}
                    options={[
                      {
                        value: "",
                        label: "Select template",
                      },
                      ...filteredTemplates.map(
                        (template) => ({
                          value: template.id,
                          label: template.title,
                        }),
                      ),
                    ]}
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Subject
                  </label>

                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) =>
                      updateField(
                        "subject",
                        e.target.value,
                      )
                    }
                    placeholder="Ticket subject"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Message
                  </label>

                  <textarea
                    rows={10}
                    value={form.body}
                    onChange={(e) =>
                      updateField(
                        "body",
                        e.target.value,
                      )
                    }
                    placeholder="Write your message..."
                    className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <Link
                to="/intickets"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <Button
                type="submit"
                disabled={saving || loadingData}
              >
                <Send size={16} />
                {saving ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
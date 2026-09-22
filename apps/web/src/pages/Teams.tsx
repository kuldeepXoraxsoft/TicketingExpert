import { useMemo, useState } from "react";
import {
  Building2,
  ChevronRight,
  Plus,
  Search,
  Users,
  Ticket,
  MoreHorizontal,
} from "lucide-react";

type Team = {
  id: number;
  name: string;
  department: string;
  description: string;
  lead: string;
  members: number;
  openTickets: number;
  workload: number;
};

const MOCK_TEAMS: Team[] = [
  {
    id: 1,
    name: "Customer Support",
    department: "Support",
    description: "Handles customer queries, issues and general support requests.",
    lead: "Rahul Sharma",
    members: 8,
    openTickets: 24,
    workload: 72,
  },
  {
    id: 2,
    name: "Technical Support",
    department: "Engineering",
    description: "Handles technical issues, integrations and troubleshooting.",
    lead: "Amit Kumar",
    members: 6,
    openTickets: 18,
    workload: 58,
  },
  {
    id: 3,
    name: "Billing & Finance",
    department: "Finance",
    description: "Handles invoices, payments and billing-related requests.",
    lead: "Priya Singh",
    members: 4,
    openTickets: 9,
    workload: 41,
  },
  {
    id: 4,
    name: "Enterprise Support",
    department: "Support",
    description: "Dedicated support for enterprise and priority customers.",
    lead: "Vikas Verma",
    members: 5,
    openTickets: 13,
    workload: 64,
  },
];

const DEPARTMENTS = ["All Departments", "Support", "Engineering", "Finance"];

function getWorkloadLabel(workload: number) {
  if (workload >= 80) return "High";
  if (workload >= 60) return "Moderate";
  return "Healthy";
}

export default function Teams() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");

  const filteredTeams = useMemo(() => {
    return MOCK_TEAMS.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(search.toLowerCase()) ||
        team.lead.toLowerCase().includes(search.toLowerCase()) ||
        team.department.toLowerCase().includes(search.toLowerCase());

      const matchesDepartment =
        department === "All Departments" ||
        team.department === department;

      return matchesSearch && matchesDepartment;
    });
  }, [search, department]);

  const totalMembers = MOCK_TEAMS.reduce(
    (total, team) => total + team.members,
    0
  );

  const totalOpenTickets = MOCK_TEAMS.reduce(
    (total, team) => total + team.openTickets,
    0
  );

  const averageWorkload = Math.round(
    MOCK_TEAMS.reduce((total, team) => total + team.workload, 0) /
      MOCK_TEAMS.length
  );

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <span className="text-slate-700">Teams</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Teams
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage support teams, members and workload.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={17} />
            Create Team
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <Users size={18} className="text-slate-600" />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Teams
              </span>
            </div>

            <p className="text-2xl font-semibold text-slate-900">
              {MOCK_TEAMS.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Active support teams
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <Users size={18} className="text-slate-600" />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Members
              </span>
            </div>

            <p className="text-2xl font-semibold text-slate-900">
              {totalMembers}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Across all teams
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <Ticket size={18} className="text-slate-600" />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Open Tickets
              </span>
            </div>

            <p className="text-2xl font-semibold text-slate-900">
              {totalOpenTickets}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Currently assigned
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <Building2 size={18} className="text-slate-600" />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Workload
              </span>
            </div>

            <p className="text-2xl font-semibold text-slate-900">
              {averageWorkload}%
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Average team workload
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teams, departments or team leads..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              {DEPARTMENTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Team List */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              All Teams
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredTeams.length}{" "}
              {filteredTeams.length === 1 ? "team" : "teams"} found
            </p>
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Users size={22} className="text-slate-500" />
            </div>

            <h3 className="text-sm font-semibold text-slate-900">
              No teams found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or department filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredTeams.map((team) => {
              const workloadLabel = getWorkloadLabel(team.workload);

              return (
                <div
                  key={team.id}
                  className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  {/* Team Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <Users size={20} className="text-slate-600" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {team.name}
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {team.department}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`More options for ${team.name}`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="mt-5 min-h-[40px] text-sm leading-5 text-slate-500">
                    {team.description}
                  </p>

                  {/* Team Lead */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-400">Team Lead</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {team.lead}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Members</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {team.members}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Ticket size={15} />
                        <span className="text-xs">Open Tickets</span>
                      </div>

                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {team.openTickets}
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Workload
                        </span>

                        <span className="text-xs font-medium text-slate-600">
                          {workloadLabel}
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-slate-700 transition-all"
                          style={{ width: `${team.workload}%` }}
                        />
                      </div>

                      <p className="mt-2 text-xs font-medium text-slate-700">
                        {team.workload}%
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                    >
                      View members
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm font-medium text-slate-900 transition hover:text-slate-600"
                    >
                      Manage team
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

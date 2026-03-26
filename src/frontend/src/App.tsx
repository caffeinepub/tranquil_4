import "./backend-patch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Building2,
  ChevronRight,
  Lock,
  LogOut,
  Plus,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import type { backendInterface as FullBackendInterface } from "./backend.d";
import type {
  Class,
  Employee,
  Institution,
  Section,
  Student,
} from "./backend.d";
import { useDirectActor } from "./hooks/useDirectActor";

// Actor context
const ActorCtx = createContext<FullBackendInterface | null>(null);
function useBackend() {
  const ctx = useContext(ActorCtx);
  return ctx;
}

type Page =
  | "login"
  | "ma-dashboard"
  | "ea-dashboard"
  | "institution"
  | "class"
  | "section"
  | "student";
type Session =
  | { role: "master"; pin: string }
  | { role: "employee"; employee: Employee };
interface NavState {
  institutionId?: bigint;
  institutionName?: string;
  classId?: bigint;
  className?: string;
  sectionId?: bigint;
  sectionName?: string;
  studentId?: bigint;
}

function BlinkCount({ count }: { count: bigint | number }) {
  return (
    <span className="blink font-bold text-sm ml-1">({String(count)})</span>
  );
}

function AppHeader({
  session,
  onLogout,
  breadcrumb,
}: {
  session: Session;
  onLogout: () => void;
  breadcrumb?: { label: string; onClick?: () => void }[];
}) {
  return (
    <header className="bg-white shadow-sm border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-wrap">
        <img
          src="/assets/uploads/img_1439-019d2a37-f670-71a8-8838-cabda6d239ed-1.png"
          alt="Tranquil"
          className="h-9 w-9 object-contain"
        />
        <span className="font-bold text-primary text-lg">Tranquil</span>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1 ml-2 text-sm flex-wrap">
            {breadcrumb.map((crumb) => (
              <span key={crumb.label} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                {crumb.onClick ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="text-primary hover:underline font-medium"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-muted-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="text-xs">
          {session.role === "master" ? (
            <>
              <Shield className="h-3 w-3 mr-1" />
              Master Access
            </>
          ) : (
            <>
              <User className="h-3 w-3 mr-1" />
              Employee Access
            </>
          )}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          data-ocid="nav.button"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      </div>
    </header>
  );
}

const FOOTER_YEAR = new Date().getFullYear();
const FOOTER_URL = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;
function Footer() {
  return (
    <footer
      className="py-4 text-center text-xs"
      style={{ color: "#0F6F73", opacity: 0.6 }}
    >
      &copy; {FOOTER_YEAR}. Built with &hearts; using{" "}
      <a
        href={FOOTER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        caffeine.ai
      </a>
    </footer>
  );
}

// ── Login Page ──────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: (s: Session) => void }) {
  const backend = useBackend();
  const [pin, setPin] = useState("");

  const [eaPassword, setEaPassword] = useState("");
  const [maLoading, setMaLoading] = useState(false);
  const [eaLoading, setEaLoading] = useState(false);

  const handleMaLogin = async () => {
    if (pin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }
    if (!backend) {
      toast.error("Not connected");
      return;
    }
    setMaLoading(true);
    try {
      const ok = await backend.verifyMasterPin(pin);
      if (ok) onLogin({ role: "master", pin });
      else toast.error("Invalid Master PIN");
    } catch (_err) {
      toast.error("Login failed. Check connection and try again.");
    } finally {
      setMaLoading(false);
    }
  };

  const handleEaLogin = async () => {
    if (!eaPassword.trim()) {
      toast.error("Enter password");
      return;
    }
    if (!backend) {
      toast.error("Not connected");
      return;
    }
    setEaLoading(true);
    try {
      const result = await backend.employeeLogin(eaPassword.trim());
      const emp = result[0];
      if (emp) onLogin({ role: "employee", employee: emp });
      else toast.error("Invalid credentials");
    } catch (_err) {
      toast.error("Login failed. Check connection and try again.");
    } finally {
      setEaLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(135deg, #D7EFE6 0%, #CFE6DD 100%)",
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 5 Q50 25 30 55 Q10 25 30 5Z' fill='%230F6F73'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="mb-3 relative z-10">
        <img
          src="/assets/uploads/img_1439-019d2a37-f670-71a8-8838-cabda6d239ed-1.png"
          alt="Tranquil Logo"
          className="h-28 w-28 object-contain"
        />
      </div>
      <h1
        className="fade-slide-up fade-slide-up-delay-1 text-4xl font-bold mb-1 relative z-10"
        style={{ color: "#0F6F73" }}
      >
        Tranquil
      </h1>
      <p
        className="fade-slide-up fade-slide-up-delay-1 text-center text-sm mb-8 relative z-10"
        style={{ color: "#0F6F73", opacity: 0.8 }}
      >
        Welcome back, manage with tranquility
      </p>
      <div className="fade-slide-up fade-slide-up-delay-2 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <Card className="shadow-card border-0 overflow-hidden">
          <CardHeader className="py-4 px-5" style={{ background: "#E6F3EE" }}>
            <CardTitle
              className="flex items-center gap-2 text-base"
              style={{ color: "#0F6F73" }}
            >
              <Shield className="h-5 w-5" />
              Master Access
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 pb-5 px-5 space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block">
                4-Digit PIN
              </Label>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoComplete="off"
                placeholder="\u2022\u2022\u2022\u2022"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                onKeyDown={(e) => e.key === "Enter" && handleMaLogin()}
                className="text-center text-2xl tracking-[0.5em] font-mono h-12"
                data-ocid="ma.input"
              />
            </div>
            <Button
              className="w-full font-semibold"
              style={{ background: "#0F6F73", color: "white" }}
              onClick={handleMaLogin}
              disabled={maLoading || pin.length !== 4 || !backend}
              data-ocid="ma.submit_button"
            >
              {maLoading ? "Verifying..." : "Login as Master"}
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0 overflow-hidden">
          <CardHeader className="py-4 px-5" style={{ background: "#E6F3EE" }}>
            <CardTitle
              className="flex items-center gap-2 text-base"
              style={{ color: "#0F6F73" }}
            >
              <User className="h-5 w-5" />
              Employee Access
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 pb-5 px-5 space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block">
                Password
              </Label>
              <Input
                type="password"
                placeholder="Enter password"
                value={eaPassword}
                onChange={(e) => setEaPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEaLogin()}
                data-ocid="ea.input"
              />
            </div>
            <Button
              className="w-full font-semibold"
              style={{ background: "#0F6F73", color: "white" }}
              onClick={handleEaLogin}
              disabled={eaLoading || !backend}
              data-ocid="ea.submit_button"
            >
              {eaLoading ? "Logging in..." : "Login as Employee"}
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

// ── MA Dashboard ─────────────────────────────────────────────────────────────
function MADashboard({
  session,
  onLogout,
  onNavigate,
}: {
  session: { role: "master"; pin: string };
  onLogout: () => void;
  onNavigate: (page: Page, state: NavState) => void;
}) {
  const backend = useBackend();
  const [activeTab, setActiveTab] = useState<"institutions" | "employees">(
    "institutions",
  );
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newInstName, setNewInstName] = useState("");
  const [newEmpUser, setNewEmpUser] = useState("");
  const [newEmpPass, setNewEmpPass] = useState("");
  const [newEmpInst, setNewEmpInst] = useState("");

  const loadData = useCallback(async () => {
    if (!backend) return;
    const [insts, empRes] = await Promise.all([
      backend.getInstitutions(),
      backend.getEmployees(session.pin),
    ]);
    setInstitutions(insts);
    const empList = empRes[0];
    if (empList) setEmployees(empList);
    else setEmployees([]);
  }, [backend, session.pin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddInst = async () => {
    if (!newInstName.trim() || !backend) return;
    try {
      const r = await backend.addInstitution(session.pin, newInstName.trim());
      if (r.length > 0) {
        setNewInstName("");
        toast.success("Institution added");
        await loadData();
      } else toast.error("Failed");
    } catch {
      toast.error("Error");
    }
  };

  const handleDelInst = async (id: bigint) => {
    if (!backend) return;
    try {
      await backend.deleteInstitution(session.pin, id);
      toast.success("Deleted");
      await loadData();
    } catch {
      toast.error("Failed");
    }
  };

  const handleCreateEmp = async () => {
    if (!newEmpUser.trim() || !newEmpPass.trim() || !newEmpInst || !backend) {
      toast.error("Fill all fields");
      return;
    }
    try {
      const r = await backend.createEmployee(
        session.pin,
        newEmpUser.trim(),
        newEmpPass.trim(),
        BigInt(newEmpInst),
      );
      if (r.length > 0) {
        setNewEmpUser("");
        setNewEmpPass("");
        setNewEmpInst("");
        toast.success("Employee created");
        await loadData();
      } else toast.error("Failed");
    } catch {
      toast.error("Error");
    }
  };

  const handleDelEmp = async (id: bigint) => {
    if (!backend) return;
    try {
      await backend.deleteEmployee(session.pin, id);
      toast.success("Deleted");
      await loadData();
    } catch {
      toast.error("Failed");
    }
  };

  const instName = (id: bigint) =>
    institutions.find((i) => i.id === id)?.name ?? "Unknown";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #D7EFE6 0%, #CFE6DD 100%)",
      }}
    >
      <AppHeader
        session={session}
        onLogout={onLogout}
        breadcrumb={[{ label: "Dashboard" }]}
      />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="flex gap-2 mb-6">
          {(["institutions", "employees"] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors ${activeTab === tab ? "text-white shadow" : "bg-white text-primary hover:bg-secondary"}`}
              style={activeTab === tab ? { background: "#0F6F73" } : {}}
              data-ocid={`ma.${tab}.tab`}
            >
              {tab === "institutions" ? (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  Institutions
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Employees
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "institutions" && (
          <div className="space-y-4">
            <Card className="shadow-card border-0">
              <CardContent className="pt-5 pb-4 px-5">
                <Label className="font-semibold mb-2 block">
                  Add New Institution
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Institution name"
                    value={newInstName}
                    onChange={(e) => setNewInstName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddInst()}
                    data-ocid="institution.input"
                  />
                  <Button
                    onClick={handleAddInst}
                    disabled={!newInstName.trim()}
                    style={{ background: "#0F6F73", color: "white" }}
                    data-ocid="institution.primary_button"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border-0">
              <CardContent className="pt-5 pb-4 px-5">
                <Label className="font-semibold mb-3 block">
                  Institutions ({institutions.length})
                </Label>
                {institutions.length === 0 ? (
                  <p
                    className="text-muted-foreground text-sm text-center py-8"
                    data-ocid="institution.empty_state"
                  >
                    No institutions yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {institutions.map((inst, i) => (
                      <li
                        key={String(inst.id)}
                        className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3"
                        data-ocid={`institution.item.${i + 1}`}
                      >
                        <button
                          type="button"
                          className="text-primary font-semibold hover:underline"
                          onClick={() =>
                            onNavigate("institution", {
                              institutionId: inst.id,
                              institutionName: inst.name,
                            })
                          }
                          data-ocid="institution.link"
                        >
                          {inst.name}
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelInst(inst.id)}
                          className="text-destructive hover:text-destructive"
                          data-ocid={`institution.delete_button.${i + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "employees" && (
          <div className="space-y-4">
            <Card className="shadow-card border-0">
              <CardContent className="pt-5 pb-4 px-5">
                <Label className="font-semibold mb-3 block">
                  Create Employee Account
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <Input
                    placeholder="Username"
                    value={newEmpUser}
                    onChange={(e) => setNewEmpUser(e.target.value)}
                    data-ocid="employee.input"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={newEmpPass}
                    onChange={(e) => setNewEmpPass(e.target.value)}
                    data-ocid="employee.input"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={newEmpInst} onValueChange={setNewEmpInst}>
                    <SelectTrigger
                      className="flex-1"
                      data-ocid="employee.select"
                    >
                      <SelectValue placeholder="Assign institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((inst) => (
                        <SelectItem
                          key={String(inst.id)}
                          value={String(inst.id)}
                        >
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleCreateEmp}
                    style={{ background: "#0F6F73", color: "white" }}
                    data-ocid="employee.submit_button"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border-0">
              <CardContent className="pt-5 pb-4 px-5">
                <Label className="font-semibold mb-3 block">
                  Employees ({employees.length})
                </Label>
                {employees.length === 0 ? (
                  <p
                    className="text-muted-foreground text-sm text-center py-8"
                    data-ocid="employee.empty_state"
                  >
                    No employees yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {employees.map((emp, i) => (
                      <li
                        key={String(emp.id)}
                        className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3"
                        data-ocid={`employee.item.${i + 1}`}
                      >
                        <div>
                          <span className="font-semibold text-primary">
                            {emp.username}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            &rarr; {instName(emp.institutionId)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelEmp(emp.id)}
                          className="text-destructive hover:text-destructive"
                          data-ocid={`employee.delete_button.${i + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// ── EA Dashboard ─────────────────────────────────────────────────────────────
function EADashboard({
  session,
  onLogout,
  onNavigate,
}: {
  session: { role: "employee"; employee: Employee };
  onLogout: () => void;
  onNavigate: (page: Page, state: NavState) => void;
}) {
  const backend = useBackend();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [studentCount, setStudentCount] = useState<bigint>(0n);

  useEffect(() => {
    if (!backend) return;
    const load = async () => {
      const insts = await backend.getInstitutions();
      const inst = insts.find((i) => i.id === session.employee.institutionId);
      if (inst) {
        setInstitution(inst);
        const count = await backend.getStudentCountByInstitution(inst.id);
        setStudentCount(count);
      }
    };
    load();
  }, [backend, session.employee.institutionId]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #D7EFE6 0%, #CFE6DD 100%)",
      }}
    >
      <AppHeader
        session={session}
        onLogout={onLogout}
        breadcrumb={[{ label: "Dashboard" }]}
      />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <h2 className="text-xl font-bold mb-4" style={{ color: "#0F6F73" }}>
          Welcome, {session.employee.username}
        </h2>
        {institution ? (
          <Card
            className="shadow-card border-0 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() =>
              onNavigate("institution", {
                institutionId: institution.id,
                institutionName: institution.name,
              })
            }
            data-ocid="ea.institution.card"
          >
            <CardContent className="pt-6 pb-6 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ background: "#E6F3EE" }}
                >
                  <Building2 className="h-5 w-5" style={{ color: "#0F6F73" }} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">
                    Assigned Institution
                  </div>
                  <div
                    className="font-bold text-lg"
                    style={{ color: "#0F6F73" }}
                  >
                    {institution.name}
                    <BlinkCount count={studentCount} />
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      students
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card border-0">
            <CardContent
              className="pt-6 pb-6 text-center text-muted-foreground"
              data-ocid="ea.loading_state"
            >
              Loading...
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}

// ── Institution Page ─────────────────────────────────────────────────────────
function InstitutionPage({
  session,
  navState,
  onLogout,
  onNavigate,
}: {
  session: Session;
  navState: NavState;
  onLogout: () => void;
  onNavigate: (page: Page, state: NavState) => void;
}) {
  const backend = useBackend();
  const [classes, setClasses] = useState<Class[]>([]);
  const [classCounts, setClassCounts] = useState<Record<string, bigint>>({});
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);
  const isMaster = session.role === "master";
  const dashPage: Page =
    session.role === "master" ? "ma-dashboard" : "ea-dashboard";

  const load = useCallback(async () => {
    if (!backend || !navState.institutionId) return;
    const list = await backend.getClasses(navState.institutionId);
    setClasses(list);
    const counts = await Promise.all(
      list.map(
        async (c) =>
          [String(c.id), await backend.getStudentCountByClass(c.id)] as [
            string,
            bigint,
          ],
      ),
    );
    setClassCounts(Object.fromEntries(counts));
  }, [backend, navState.institutionId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!newName.trim() || !navState.institutionId || !backend) return;
    try {
      await backend.addClass(newName.trim(), navState.institutionId);
      setNewName("");
      setOpen(false);
      toast.success("Class added");
      await load();
    } catch {
      toast.error("Failed");
    }
  };

  const handleDel = async (id: bigint) => {
    if (session.role !== "master" || !backend) return;
    try {
      await backend.deleteClass(session.pin, id);
      toast.success("Deleted");
      await load();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #D7EFE6 0%, #CFE6DD 100%)",
      }}
    >
      <AppHeader
        session={session}
        onLogout={onLogout}
        breadcrumb={[
          { label: "Dashboard", onClick: () => onNavigate(dashPage, {}) },
          { label: navState.institutionName ?? "Institution" },
        ]}
      />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#0F6F73" }}>
            {navState.institutionName}
          </h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                style={{ background: "#0F6F73", color: "white" }}
                data-ocid="class.open_modal_button"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="class.dialog">
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Class name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                data-ocid="class.input"
              />
              <div className="flex gap-2 justify-end mt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="class.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  style={{ background: "#0F6F73", color: "white" }}
                  data-ocid="class.confirm_button"
                >
                  Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {classes.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent
              className="pt-8 pb-8 text-center text-muted-foreground"
              data-ocid="class.empty_state"
            >
              No classes yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls, i) => (
              <Card
                key={String(cls.id)}
                className="shadow-card border-0"
                data-ocid={`class.item.${i + 1}`}
              >
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-start justify-between mb-1">
                    <button
                      type="button"
                      className="font-bold text-base hover:underline text-left"
                      style={{ color: "#0F6F73" }}
                      onClick={() =>
                        onNavigate("class", {
                          ...navState,
                          classId: cls.id,
                          className: cls.name,
                        })
                      }
                      data-ocid="class.link"
                    >
                      {cls.name}
                    </button>
                    {isMaster && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDel(cls.id)}
                        className="text-destructive hover:text-destructive -mt-1 -mr-2"
                        data-ocid={`class.delete_button.${i + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Students:{" "}
                    <BlinkCount count={classCounts[String(cls.id)] ?? 0n} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// ── Class Page ────────────────────────────────────────────────────────────────
function ClassPage({
  session,
  navState,
  onLogout,
  onNavigate,
}: {
  session: Session;
  navState: NavState;
  onLogout: () => void;
  onNavigate: (page: Page, state: NavState) => void;
}) {
  const backend = useBackend();
  const [sections, setSections] = useState<Section[]>([]);
  const [secCounts, setSecCounts] = useState<Record<string, bigint>>({});
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);
  const isMaster = session.role === "master";
  const dashPage: Page =
    session.role === "master" ? "ma-dashboard" : "ea-dashboard";

  const load = useCallback(async () => {
    if (!backend || !navState.classId) return;
    const list = await backend.getSections(navState.classId);
    setSections(list);
    const counts = await Promise.all(
      list.map(
        async (s) =>
          [String(s.id), await backend.getStudentCountBySection(s.id)] as [
            string,
            bigint,
          ],
      ),
    );
    setSecCounts(Object.fromEntries(counts));
  }, [backend, navState.classId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!newName.trim() || !navState.classId || !backend) return;
    try {
      await backend.addSection(newName.trim(), navState.classId);
      setNewName("");
      setOpen(false);
      toast.success("Section added");
      await load();
    } catch {
      toast.error("Failed");
    }
  };

  const handleDel = async (id: bigint) => {
    if (session.role !== "master" || !backend) return;
    try {
      await backend.deleteSection(session.pin, id);
      toast.success("Deleted");
      await load();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #D7EFE6 0%, #CFE6DD 100%)",
      }}
    >
      <AppHeader
        session={session}
        onLogout={onLogout}
        breadcrumb={[
          { label: "Dashboard", onClick: () => onNavigate(dashPage, {}) },
          {
            label: navState.institutionName ?? "Institution",
            onClick: () =>
              onNavigate("institution", {
                institutionId: navState.institutionId,
                institutionName: navState.institutionName,
              }),
          },
          { label: navState.className ?? "Class" },
        ]}
      />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#0F6F73" }}>
            {navState.className}
          </h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                style={{ background: "#0F6F73", color: "white" }}
                data-ocid="section.open_modal_button"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="section.dialog">
              <DialogHeader>
                <DialogTitle>Add New Section</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Section name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                data-ocid="section.input"
              />
              <div className="flex gap-2 justify-end mt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="section.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  style={{ background: "#0F6F73", color: "white" }}
                  data-ocid="section.confirm_button"
                >
                  Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {sections.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent
              className="pt-8 pb-8 text-center text-muted-foreground"
              data-ocid="section.empty_state"
            >
              No sections yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((sec, i) => (
              <Card
                key={String(sec.id)}
                className="shadow-card border-0"
                data-ocid={`section.item.${i + 1}`}
              >
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-start justify-between mb-1">
                    <button
                      type="button"
                      className="font-bold text-base hover:underline text-left"
                      style={{ color: "#0F6F73" }}
                      onClick={() =>
                        onNavigate("section", {
                          ...navState,
                          sectionId: sec.id,
                          sectionName: sec.name,
                        })
                      }
                      data-ocid="section.link"
                    >
                      {sec.name}
                    </button>
                    {isMaster && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDel(sec.id)}
                        className="text-destructive hover:text-destructive -mt-1 -mr-2"
                        data-ocid={`section.delete_button.${i + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Students:{" "}
                    <BlinkCount count={secCounts[String(sec.id)] ?? 0n} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// ── Section Page ──────────────────────────────────────────────────────────────
function SectionPage({
  session,
  navState,
  onLogout,
  onNavigate,
}: {
  session: Session;
  navState: NavState;
  onLogout: () => void;
  onNavigate: (page: Page, state: NavState) => void;
}) {
  const backend = useBackend();
  const [students, setStudents] = useState<Student[]>([]);
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState("");
  const [open, setOpen] = useState(false);
  const isMaster = session.role === "master";
  const empId = session.role === "employee" ? session.employee.id : 0n;
  const dashPage: Page =
    session.role === "master" ? "ma-dashboard" : "ea-dashboard";

  const load = useCallback(async () => {
    if (!backend || !navState.sectionId) return;
    setStudents(await backend.getStudents(navState.sectionId));
  }, [backend, navState.sectionId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!newName.trim() || !newGender || !navState.sectionId || !backend)
      return;
    try {
      await backend.addStudent(
        newName.trim(),
        newGender,
        navState.sectionId,
        empId,
      );
      setNewName("");
      setNewGender("");
      setOpen(false);
      toast.success("Student added");
      await load();
    } catch {
      toast.error("Failed");
    }
  };

  const handleDel = async (id: bigint) => {
    if (session.role !== "master" || !backend) return;
    try {
      await backend.deleteStudent(session.pin, id);
      toast.success("Deleted");
      await load();
    } catch {
      toast.error("Failed");
    }
  };

  const studentStyle = (gender: string): React.CSSProperties =>
    gender.toLowerCase() === "male"
      ? { background: "#1B3A6B", color: "#FFFACD" }
      : { background: "#FFB6C1", color: "#FFFACD" };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #D7EFE6 0%, #CFE6DD 100%)",
      }}
    >
      <AppHeader
        session={session}
        onLogout={onLogout}
        breadcrumb={[
          { label: "Dashboard", onClick: () => onNavigate(dashPage, {}) },
          {
            label: navState.institutionName ?? "Institution",
            onClick: () =>
              onNavigate("institution", {
                institutionId: navState.institutionId,
                institutionName: navState.institutionName,
              }),
          },
          {
            label: navState.className ?? "Class",
            onClick: () =>
              onNavigate("class", {
                institutionId: navState.institutionId,
                institutionName: navState.institutionName,
                classId: navState.classId,
                className: navState.className,
              }),
          },
          { label: navState.sectionName ?? "Section" },
        ]}
      />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#0F6F73" }}>
            {navState.sectionName}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              <BlinkCount count={students.length} /> students
            </span>
          </h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                style={{ background: "#0F6F73", color: "white" }}
                data-ocid="student.open_modal_button"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="student.dialog">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Student name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  data-ocid="student.input"
                />
                <Select value={newGender} onValueChange={setNewGender}>
                  <SelectTrigger data-ocid="student.select">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="student.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  style={{ background: "#0F6F73", color: "white" }}
                  data-ocid="student.confirm_button"
                >
                  Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {students.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent
              className="pt-8 pb-8 text-center text-muted-foreground"
              data-ocid="student.empty_state"
            >
              No students yet.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-3">
            {students.map((s, i) => (
              <div
                key={String(s.id)}
                className="relative group"
                data-ocid={`student.item.${i + 1}`}
              >
                <button
                  type="button"
                  className="px-4 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                  style={studentStyle(s.gender)}
                  onClick={() =>
                    onNavigate("student", { ...navState, studentId: s.id })
                  }
                  data-ocid="student.link"
                >
                  {s.name}
                  {s.locked && <Lock className="h-3 w-3 opacity-70" />}
                </button>
                {isMaster && (
                  <button
                    type="button"
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDel(s.id)}
                    data-ocid={`student.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// ── Student Detail Page ───────────────────────────────────────────────────────
function StudentDetailPage({
  session,
  navState,
  onLogout,
  onNavigate,
}: {
  session: Session;
  navState: NavState;
  onLogout: () => void;
  onNavigate: (page: Page, state: NavState) => void;
}) {
  const backend = useBackend();
  const [student, setStudent] = useState<Student | null>(null);
  const [initNotes, setInitNotes] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [updDate, setUpdDate] = useState("");
  const [updNotes, setUpdNotes] = useState("");
  const [savingInit, setSavingInit] = useState(false);
  const [savingUpd, setSavingUpd] = useState(false);
  const isMaster = session.role === "master";
  const dashPage: Page =
    session.role === "master" ? "ma-dashboard" : "ea-dashboard";

  const load = useCallback(async () => {
    if (!backend || !navState.studentId) return;
    const r = await backend.getStudent(navState.studentId);
    const stu = r[0];
    if (stu) {
      setStudent(stu);
      setInitNotes(stu.initialAssessmentNotes);
    }
  }, [backend, navState.studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const canEdit = isMaster || (student !== null && !student.locked);

  const handleSaveInit = async () => {
    if (!student || !backend) return;
    setSavingInit(true);
    try {
      await backend.updateInitialAssessment(student.id, initNotes, isMaster);
      toast.success("Saved");
      await load();
    } catch {
      toast.error("Failed");
    } finally {
      setSavingInit(false);
    }
  };

  const handleAddUpd = async () => {
    if (!student || !updDate || !updNotes.trim() || !backend) {
      toast.error("Fill date and notes");
      return;
    }
    setSavingUpd(true);
    try {
      await backend.addWeeklyUpdate(
        student.id,
        updDate,
        updNotes.trim(),
        isMaster,
      );
      setUpdDate("");
      setUpdNotes("");
      setShowAdd(false);
      toast.success("Update added");
      await load();
    } catch {
      toast.error("Failed");
    } finally {
      setSavingUpd(false);
    }
  };

  const studentStyle: React.CSSProperties = student
    ? student.gender.toLowerCase() === "male"
      ? { background: "#1B3A6B", color: "#FFFACD" }
      : { background: "#FFB6C1", color: "#FFFACD" }
    : {};

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #D7EFE6 0%, #CFE6DD 100%)",
      }}
    >
      <AppHeader
        session={session}
        onLogout={onLogout}
        breadcrumb={[
          { label: "Dashboard", onClick: () => onNavigate(dashPage, {}) },
          {
            label: navState.institutionName ?? "Institution",
            onClick: () =>
              onNavigate("institution", {
                institutionId: navState.institutionId,
                institutionName: navState.institutionName,
              }),
          },
          {
            label: navState.className ?? "Class",
            onClick: () =>
              onNavigate("class", {
                institutionId: navState.institutionId,
                institutionName: navState.institutionName,
                classId: navState.classId,
                className: navState.className,
              }),
          },
          {
            label: navState.sectionName ?? "Section",
            onClick: () =>
              onNavigate("section", {
                institutionId: navState.institutionId,
                institutionName: navState.institutionName,
                classId: navState.classId,
                className: navState.className,
                sectionId: navState.sectionId,
                sectionName: navState.sectionName,
              }),
          },
          { label: student?.name ?? "Student" },
        ]}
      />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        {student ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg"
                style={studentStyle}
              >
                {student.name[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#0F6F73" }}>
                  {student.name}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {student.gender.toLowerCase() === "male"
                      ? "\u2642 Male"
                      : "\u2640 Female"}
                  </Badge>
                  {student.locked && !isMaster && (
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Card className="shadow-card border-0 mb-4">
              <CardHeader
                className="py-4 px-5"
                style={{ background: "#E6F3EE" }}
              >
                <CardTitle className="text-base" style={{ color: "#0F6F73" }}>
                  1. Upon Initial Assessment:
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-5 px-5 space-y-3">
                {canEdit ? (
                  <>
                    <Textarea
                      placeholder="Enter initial assessment notes..."
                      value={initNotes}
                      onChange={(e) => setInitNotes(e.target.value)}
                      className="min-h-[120px] resize-none"
                      data-ocid="student.editor"
                    />
                    <Button
                      onClick={handleSaveInit}
                      disabled={savingInit}
                      style={{ background: "#0F6F73", color: "white" }}
                      data-ocid="student.save_button"
                    >
                      {savingInit ? "Saving..." : "Save Notes"}
                    </Button>
                  </>
                ) : (
                  <div className="bg-muted rounded-lg p-3 text-sm whitespace-pre-wrap">
                    {initNotes || (
                      <span className="text-muted-foreground italic">
                        No notes yet.
                      </span>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      <span>Locked &mdash; only Master can edit</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardHeader
                className="py-4 px-5"
                style={{ background: "#E6F3EE" }}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base" style={{ color: "#0F6F73" }}>
                    2. Weekly Updates:
                  </CardTitle>
                  {canEdit && (
                    <Button
                      size="sm"
                      onClick={() => setShowAdd((v) => !v)}
                      style={{ background: "#0F6F73", color: "white" }}
                      data-ocid="student.primary_button"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-5 px-5 space-y-3">
                {showAdd && canEdit && (
                  <div className="bg-secondary rounded-lg p-4 space-y-3 border border-border">
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">
                        Date
                      </Label>
                      <Input
                        type="date"
                        value={updDate}
                        onChange={(e) => setUpdDate(e.target.value)}
                        data-ocid="student.input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">
                        Notes
                      </Label>
                      <Textarea
                        placeholder="Weekly update notes..."
                        value={updNotes}
                        onChange={(e) => setUpdNotes(e.target.value)}
                        className="min-h-[80px] resize-none"
                        data-ocid="student.textarea"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddUpd}
                        disabled={savingUpd}
                        style={{ background: "#0F6F73", color: "white" }}
                        data-ocid="student.submit_button"
                      >
                        {savingUpd ? "Saving..." : "Save Update"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAdd(false);
                          setUpdDate("");
                          setUpdNotes("");
                        }}
                        data-ocid="student.cancel_button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                {student.weeklyUpdates.length === 0 && !showAdd ? (
                  <p
                    className="text-sm text-muted-foreground text-center py-4"
                    data-ocid="student.empty_state"
                  >
                    No weekly updates yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {[...student.weeklyUpdates].reverse().map((upd, i) => (
                      <div
                        key={`${upd.date}-${upd.notes.slice(0, 8)}-${i}`}
                        className="bg-secondary rounded-lg p-3"
                        data-ocid={`student.item.${i + 1}`}
                      >
                        <div className="text-xs font-semibold text-primary mb-1">
                          {upd.date}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {upd.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="shadow-card border-0">
            <CardContent
              className="pt-8 pb-8 text-center text-muted-foreground"
              data-ocid="student.loading_state"
            >
              Loading...
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
const queryClient = new QueryClient();

function AppInner() {
  const { actor: rawActor } = useDirectActor();
  const actor = rawActor as unknown as FullBackendInterface | null;
  const [page, setPage] = useState<Page>("login");
  const [session, setSession] = useState<Session | null>(null);
  const [navState, setNavState] = useState<NavState>({});
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("tranquil_session");
      if (stored) {
        const s = JSON.parse(stored) as Session;
        if (s.role === "employee" && s.employee) {
          s.employee.id = BigInt(s.employee.id as unknown as string);
          s.employee.institutionId = BigInt(
            s.employee.institutionId as unknown as string,
          );
        }
        setSession(s);
        setPage(s.role === "master" ? "ma-dashboard" : "ea-dashboard");
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleLogin = (s: Session) => {
    const toStore =
      s.role === "employee"
        ? {
            ...s,
            employee: {
              ...s.employee,
              id: String(s.employee.id),
              institutionId: String(s.employee.institutionId),
            },
          }
        : s;
    sessionStorage.setItem("tranquil_session", JSON.stringify(toStore));
    setSession(s);
    setPage(s.role === "master" ? "ma-dashboard" : "ea-dashboard");
    setNavState({});
  };

  const handleLogout = async () => {
    if (session?.role === "employee" && actor) {
      try {
        await actor.employeeLogout(session.employee.id);
      } catch {
        /* ignore */
      }
    }
    sessionStorage.removeItem("tranquil_session");
    setSession(null);
    setPage("login");
    setNavState({});
  };

  const navigate = (newPage: Page, newNavState: NavState) => {
    setPage(newPage);
    setNavState(newNavState);
  };

  if (!session || page === "login") {
    return (
      <ActorCtx.Provider value={actor}>
        <LoginPage onLogin={handleLogin} />
      </ActorCtx.Provider>
    );
  }

  return (
    <ActorCtx.Provider value={actor}>
      {page === "ma-dashboard" && session.role === "master" && (
        <MADashboard
          session={session}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      )}
      {page === "ea-dashboard" && session.role === "employee" && (
        <EADashboard
          session={session}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      )}
      {page === "institution" && (
        <InstitutionPage
          session={session}
          navState={navState}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      )}
      {page === "class" && (
        <ClassPage
          session={session}
          navState={navState}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      )}
      {page === "section" && (
        <SectionPage
          session={session}
          navState={navState}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      )}
      {page === "student" && (
        <StudentDetailPage
          session={session}
          navState={navState}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      )}
    </ActorCtx.Provider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster />
    </QueryClientProvider>
  );
}

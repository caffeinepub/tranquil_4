import { Backend } from "./backend";

// Patch Backend prototype to satisfy _initializeAccessControlWithSecret
// called in useActor.ts. The actual method is a no-op since the backend
// canister does not expose this endpoint.
(Backend.prototype as any)._initializeAccessControlWithSecret = async (
  _adminToken: string,
): Promise<void> => {
  // no-op
};

// Wire all backend methods directly to the underlying Motoko actor.
// The auto-generated backend.ts / backend.did.js are empty stubs,
// so we patch every method here.
(Backend.prototype as any).verifyMasterPin = async function (
  pin: string,
): Promise<boolean> {
  return (this as any).actor.verifyMasterPin(pin);
};

(Backend.prototype as any).changeMasterPin = async function (
  oldPin: string,
  newPin: string,
): Promise<boolean> {
  return (this as any).actor.changeMasterPin(oldPin, newPin);
};

(Backend.prototype as any).addInstitution = async function (
  pin: string,
  name: string,
) {
  return (this as any).actor.addInstitution(pin, name);
};

(Backend.prototype as any).deleteInstitution = async function (
  pin: string,
  id: bigint,
): Promise<boolean> {
  return (this as any).actor.deleteInstitution(pin, id);
};

(Backend.prototype as any).getInstitutions = async function () {
  return (this as any).actor.getInstitutions();
};

(Backend.prototype as any).createEmployee = async function (
  pin: string,
  username: string,
  password: string,
  institutionId: bigint,
) {
  return (this as any).actor.createEmployee(
    pin,
    username,
    password,
    institutionId,
  );
};

(Backend.prototype as any).deleteEmployee = async function (
  pin: string,
  id: bigint,
): Promise<boolean> {
  return (this as any).actor.deleteEmployee(pin, id);
};

(Backend.prototype as any).getEmployees = async function (pin: string) {
  return (this as any).actor.getEmployees(pin);
};

(Backend.prototype as any).employeeLogin = async function (password: string) {
  return (this as any).actor.employeeLogin(password);
};

(Backend.prototype as any).employeeLogout = async function (
  employeeId: bigint,
): Promise<void> {
  return (this as any).actor.employeeLogout(employeeId);
};

(Backend.prototype as any).addClass = async function (
  name: string,
  institutionId: bigint,
) {
  return (this as any).actor.addClass(name, institutionId);
};

(Backend.prototype as any).deleteClass = async function (
  pin: string,
  id: bigint,
): Promise<boolean> {
  return (this as any).actor.deleteClass(pin, id);
};

(Backend.prototype as any).getClasses = async function (institutionId: bigint) {
  return (this as any).actor.getClasses(institutionId);
};

(Backend.prototype as any).addSection = async function (
  name: string,
  classId: bigint,
) {
  return (this as any).actor.addSection(name, classId);
};

(Backend.prototype as any).deleteSection = async function (
  pin: string,
  id: bigint,
): Promise<boolean> {
  return (this as any).actor.deleteSection(pin, id);
};

(Backend.prototype as any).getSections = async function (classId: bigint) {
  return (this as any).actor.getSections(classId);
};

(Backend.prototype as any).addStudent = async function (
  name: string,
  gender: string,
  sectionId: bigint,
  employeeId: bigint,
) {
  return (this as any).actor.addStudent(name, gender, sectionId, employeeId);
};

(Backend.prototype as any).deleteStudent = async function (
  pin: string,
  id: bigint,
): Promise<boolean> {
  return (this as any).actor.deleteStudent(pin, id);
};

(Backend.prototype as any).getStudents = async function (sectionId: bigint) {
  return (this as any).actor.getStudents(sectionId);
};

(Backend.prototype as any).getStudent = async function (id: bigint) {
  return (this as any).actor.getStudent(id);
};

(Backend.prototype as any).getStudentCountByInstitution = async function (
  institutionId: bigint,
) {
  return (this as any).actor.getStudentCountByInstitution(institutionId);
};

(Backend.prototype as any).getStudentCountByClass = async function (
  classId: bigint,
) {
  return (this as any).actor.getStudentCountByClass(classId);
};

(Backend.prototype as any).getStudentCountBySection = async function (
  sectionId: bigint,
) {
  return (this as any).actor.getStudentCountBySection(sectionId);
};

(Backend.prototype as any).updateInitialAssessment = async function (
  studentId: bigint,
  notes: string,
  isMaster: boolean,
): Promise<boolean> {
  return (this as any).actor.updateInitialAssessment(
    studentId,
    notes,
    isMaster,
  );
};

(Backend.prototype as any).addWeeklyUpdate = async function (
  studentId: bigint,
  date: string,
  notes: string,
  isMaster: boolean,
): Promise<boolean> {
  return (this as any).actor.addWeeklyUpdate(studentId, date, notes, isMaster);
};

(Backend.prototype as any).editWeeklyUpdate = async function (
  studentId: bigint,
  index: bigint,
  date: string,
  notes: string,
): Promise<boolean> {
  return (this as any).actor.editWeeklyUpdate(studentId, index, date, notes);
};

// Augment both the class and interface so TypeScript is satisfied
declare module "./backend" {
  interface Backend {
    _initializeAccessControlWithSecret(adminToken: string): Promise<void>;
  }
  interface backendInterface {
    _initializeAccessControlWithSecret(adminToken: string): Promise<void>;
  }
}

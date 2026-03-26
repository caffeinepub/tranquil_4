import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface Institution {
    id: bigint;
    name: string;
}

export interface Employee {
    id: bigint;
    username: string;
    password: string;
    institutionId: bigint;
}

export interface WeeklyUpdate {
    date: string;
    notes: string;
}

export interface Student {
    id: bigint;
    name: string;
    gender: string;
    sectionId: bigint;
    initialAssessmentNotes: string;
    weeklyUpdates: WeeklyUpdate[];
    locked: boolean;
    addedByEmployee: bigint;
}

export interface Class {
    id: bigint;
    name: string;
    institutionId: bigint;
}

export interface Section {
    id: bigint;
    name: string;
    classId: bigint;
}

export interface backendInterface {
    _initializeAccessControlWithSecret(adminToken: string): Promise<void>;
    verifyMasterPin(pin: string): Promise<boolean>;
    changeMasterPin(oldPin: string, newPin: string): Promise<boolean>;
    addInstitution(pin: string, name: string): Promise<[Institution] | []>;
    deleteInstitution(pin: string, id: bigint): Promise<boolean>;
    getInstitutions(): Promise<Institution[]>;
    createEmployee(pin: string, username: string, password: string, institutionId: bigint): Promise<[Employee] | []>;
    deleteEmployee(pin: string, id: bigint): Promise<boolean>;
    getEmployees(pin: string): Promise<[Employee[]] | []>;
    employeeLogin(password: string): Promise<[Employee] | []>;
    employeeLogout(employeeId: bigint): Promise<void>;
    addClass(name: string, institutionId: bigint): Promise<Class>;
    deleteClass(pin: string, id: bigint): Promise<boolean>;
    getClasses(institutionId: bigint): Promise<Class[]>;
    addSection(name: string, classId: bigint): Promise<Section>;
    deleteSection(pin: string, id: bigint): Promise<boolean>;
    getSections(classId: bigint): Promise<Section[]>;
    addStudent(name: string, gender: string, sectionId: bigint, employeeId: bigint): Promise<Student>;
    deleteStudent(pin: string, id: bigint): Promise<boolean>;
    getStudents(sectionId: bigint): Promise<Student[]>;
    getStudent(id: bigint): Promise<[Student] | []>;
    getStudentCountByInstitution(institutionId: bigint): Promise<bigint>;
    getStudentCountByClass(classId: bigint): Promise<bigint>;
    getStudentCountBySection(sectionId: bigint): Promise<bigint>;
    updateInitialAssessment(studentId: bigint, notes: string, isMaster: boolean): Promise<boolean>;
    addWeeklyUpdate(studentId: bigint, date: string, notes: string, isMaster: boolean): Promise<boolean>;
    editWeeklyUpdate(studentId: bigint, index: bigint, date: string, notes: string): Promise<boolean>;
}

/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

const Institution = IDL.Record({
  id: IDL.Nat,
  name: IDL.Text,
});

const WeeklyUpdate = IDL.Record({
  date: IDL.Text,
  notes: IDL.Text,
});

const Student = IDL.Record({
  id: IDL.Nat,
  name: IDL.Text,
  gender: IDL.Text,
  sectionId: IDL.Nat,
  initialAssessmentNotes: IDL.Text,
  weeklyUpdates: IDL.Vec(WeeklyUpdate),
  locked: IDL.Bool,
  addedByEmployee: IDL.Nat,
});

const Employee = IDL.Record({
  id: IDL.Nat,
  username: IDL.Text,
  password: IDL.Text,
  institutionId: IDL.Nat,
});

const Class = IDL.Record({
  id: IDL.Nat,
  name: IDL.Text,
  institutionId: IDL.Nat,
});

const Section = IDL.Record({
  id: IDL.Nat,
  name: IDL.Text,
  classId: IDL.Nat,
});

export const idlService = IDL.Service({
  verifyMasterPin: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  changeMasterPin: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
  addInstitution: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(Institution)], []),
  deleteInstitution: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
  getInstitutions: IDL.Func([], [IDL.Vec(Institution)], ['query']),
  createEmployee: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [IDL.Opt(Employee)], []),
  deleteEmployee: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
  getEmployees: IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(Employee))], ['query']),
  employeeLogin: IDL.Func([IDL.Text], [IDL.Opt(Employee)], []),
  employeeLogout: IDL.Func([IDL.Nat], [], []),
  addClass: IDL.Func([IDL.Text, IDL.Nat], [Class], []),
  deleteClass: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
  getClasses: IDL.Func([IDL.Nat], [IDL.Vec(Class)], ['query']),
  addSection: IDL.Func([IDL.Text, IDL.Nat], [Section], []),
  deleteSection: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
  getSections: IDL.Func([IDL.Nat], [IDL.Vec(Section)], ['query']),
  addStudent: IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Nat], [Student], []),
  deleteStudent: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
  getStudents: IDL.Func([IDL.Nat], [IDL.Vec(Student)], ['query']),
  getStudent: IDL.Func([IDL.Nat], [IDL.Opt(Student)], ['query']),
  getStudentCountByInstitution: IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
  getStudentCountByClass: IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
  getStudentCountBySection: IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
  updateInitialAssessment: IDL.Func([IDL.Nat, IDL.Text, IDL.Bool], [IDL.Bool], []),
  addWeeklyUpdate: IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Bool], [IDL.Bool], []),
  editWeeklyUpdate: IDL.Func([IDL.Nat, IDL.Nat, IDL.Text, IDL.Text], [IDL.Bool], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const WeeklyUpdate = IDL.Record({
    date: IDL.Text,
    notes: IDL.Text,
  });
  const Student = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    gender: IDL.Text,
    sectionId: IDL.Nat,
    initialAssessmentNotes: IDL.Text,
    weeklyUpdates: IDL.Vec(WeeklyUpdate),
    locked: IDL.Bool,
    addedByEmployee: IDL.Nat,
  });
  const Institution = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
  });
  const Employee = IDL.Record({
    id: IDL.Nat,
    username: IDL.Text,
    password: IDL.Text,
    institutionId: IDL.Nat,
  });
  const Class = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    institutionId: IDL.Nat,
  });
  const Section = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    classId: IDL.Nat,
  });
  return IDL.Service({
    verifyMasterPin: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    changeMasterPin: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    addInstitution: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(Institution)], []),
    deleteInstitution: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    getInstitutions: IDL.Func([], [IDL.Vec(Institution)], ['query']),
    createEmployee: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [IDL.Opt(Employee)], []),
    deleteEmployee: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    getEmployees: IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(Employee))], ['query']),
    employeeLogin: IDL.Func([IDL.Text], [IDL.Opt(Employee)], []),
    employeeLogout: IDL.Func([IDL.Nat], [], []),
    addClass: IDL.Func([IDL.Text, IDL.Nat], [Class], []),
    deleteClass: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    getClasses: IDL.Func([IDL.Nat], [IDL.Vec(Class)], ['query']),
    addSection: IDL.Func([IDL.Text, IDL.Nat], [Section], []),
    deleteSection: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    getSections: IDL.Func([IDL.Nat], [IDL.Vec(Section)], ['query']),
    addStudent: IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Nat], [Student], []),
    deleteStudent: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    getStudents: IDL.Func([IDL.Nat], [IDL.Vec(Student)], ['query']),
    getStudent: IDL.Func([IDL.Nat], [IDL.Opt(Student)], ['query']),
    getStudentCountByInstitution: IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
    getStudentCountByClass: IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
    getStudentCountBySection: IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
    updateInitialAssessment: IDL.Func([IDL.Nat, IDL.Text, IDL.Bool], [IDL.Bool], []),
    addWeeklyUpdate: IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Bool], [IDL.Bool], []),
    editWeeklyUpdate: IDL.Func([IDL.Nat, IDL.Nat, IDL.Text, IDL.Text], [IDL.Bool], []),
  });
};

export const init = ({ IDL }) => { return []; };

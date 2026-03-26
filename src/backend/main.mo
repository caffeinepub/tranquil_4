import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Bool "mo:base/Bool";

actor {

  type Institution = { id: Nat; name: Text };
  type Employee    = { id: Nat; username: Text; password: Text; institutionId: Nat };
  type Class       = { id: Nat; name: Text; institutionId: Nat };
  type Section     = { id: Nat; name: Text; classId: Nat };
  type WeeklyUpdate = { date: Text; notes: Text };
  type Student     = {
    id: Nat; name: Text; gender: Text; sectionId: Nat;
    initialAssessmentNotes: Text; weeklyUpdates: [WeeklyUpdate];
    locked: Bool; addedByEmployee: Nat;
  };

  stable var masterPin : Text = "1234";
  stable var institutions : [Institution] = [];
  stable var employees : [Employee] = [];
  stable var classes : [Class] = [];
  stable var sections : [Section] = [];
  stable var students : [Student] = [];
  stable var nextId : Nat = 1;

  func newId() : Nat { let id = nextId; nextId += 1; id };

  public query func verifyMasterPin(pin: Text) : async Bool {
    pin == masterPin
  };

  public func changeMasterPin(oldPin: Text, newPin: Text) : async Bool {
    if (oldPin != masterPin) return false;
    masterPin := newPin;
    true
  };

  public func addInstitution(pin: Text, name: Text) : async ?Institution {
    if (pin != masterPin) return null;
    let inst : Institution = { id = newId(); name = name };
    institutions := Array.append(institutions, [inst]);
    ?inst
  };

  public func deleteInstitution(pin: Text, id: Nat) : async Bool {
    if (pin != masterPin) return false;
    institutions := Array.filter(institutions, func(i: Institution) : Bool { i.id != id });
    true
  };

  public query func getInstitutions() : async [Institution] { institutions };

  public func createEmployee(pin: Text, username: Text, password: Text, institutionId: Nat) : async ?Employee {
    if (pin != masterPin) return null;
    let emp : Employee = { id = newId(); username = username; password = password; institutionId = institutionId };
    employees := Array.append(employees, [emp]);
    ?emp
  };

  public func deleteEmployee(pin: Text, id: Nat) : async Bool {
    if (pin != masterPin) return false;
    employees := Array.filter(employees, func(e: Employee) : Bool { e.id != id });
    true
  };

  public query func getEmployees(pin: Text) : async ?[Employee] {
    if (pin != masterPin) return null;
    ?employees
  };

  public func employeeLogin(password: Text) : async ?Employee {
    Array.find(employees, func(e: Employee) : Bool { e.password == password })
  };

  public func employeeLogout(employeeId: Nat) : async () {
    students := Array.map(students, func(s: Student) : Student {
      if (s.addedByEmployee == employeeId) {
        { id = s.id; name = s.name; gender = s.gender; sectionId = s.sectionId;
          initialAssessmentNotes = s.initialAssessmentNotes; weeklyUpdates = s.weeklyUpdates;
          locked = true; addedByEmployee = s.addedByEmployee }
      } else { s }
    });
  };

  public func addClass(name: Text, institutionId: Nat) : async Class {
    let cls : Class = { id = newId(); name = name; institutionId = institutionId };
    classes := Array.append(classes, [cls]);
    cls
  };

  public func deleteClass(pin: Text, id: Nat) : async Bool {
    if (pin != masterPin) return false;
    classes := Array.filter(classes, func(c: Class) : Bool { c.id != id });
    true
  };

  public query func getClasses(institutionId: Nat) : async [Class] {
    Array.filter(classes, func(c: Class) : Bool { c.institutionId == institutionId })
  };

  public func addSection(name: Text, classId: Nat) : async Section {
    let sec : Section = { id = newId(); name = name; classId = classId };
    sections := Array.append(sections, [sec]);
    sec
  };

  public func deleteSection(pin: Text, id: Nat) : async Bool {
    if (pin != masterPin) return false;
    sections := Array.filter(sections, func(s: Section) : Bool { s.id != id });
    true
  };

  public query func getSections(classId: Nat) : async [Section] {
    Array.filter(sections, func(s: Section) : Bool { s.classId == classId })
  };

  public func addStudent(name: Text, gender: Text, sectionId: Nat, employeeId: Nat) : async Student {
    let stu : Student = {
      id = newId(); name = name; gender = gender; sectionId = sectionId;
      initialAssessmentNotes = ""; weeklyUpdates = []; locked = false; addedByEmployee = employeeId
    };
    students := Array.append(students, [stu]);
    stu
  };

  public func deleteStudent(pin: Text, id: Nat) : async Bool {
    if (pin != masterPin) return false;
    students := Array.filter(students, func(s: Student) : Bool { s.id != id });
    true
  };

  public query func getStudents(sectionId: Nat) : async [Student] {
    Array.filter(students, func(s: Student) : Bool { s.sectionId == sectionId })
  };

  public query func getStudent(id: Nat) : async ?Student {
    Array.find(students, func(s: Student) : Bool { s.id == id })
  };

  public query func getStudentCountByInstitution(institutionId: Nat) : async Nat {
    let instClasses = Array.filter(classes, func(c: Class) : Bool { c.institutionId == institutionId });
    let classIds = Array.map(instClasses, func(c: Class) : Nat { c.id });
    let instSections = Array.filter(sections, func(s: Section) : Bool {
      Array.find(classIds, func(id: Nat) : Bool { id == s.classId }) != null
    });
    let sectionIds = Array.map(instSections, func(s: Section) : Nat { s.id });
    Array.filter(students, func(st: Student) : Bool {
      Array.find(sectionIds, func(id: Nat) : Bool { id == st.sectionId }) != null
    }).size()
  };

  public query func getStudentCountByClass(classId: Nat) : async Nat {
    let classSections = Array.filter(sections, func(s: Section) : Bool { s.classId == classId });
    let sectionIds = Array.map(classSections, func(s: Section) : Nat { s.id });
    Array.filter(students, func(st: Student) : Bool {
      Array.find(sectionIds, func(id: Nat) : Bool { id == st.sectionId }) != null
    }).size()
  };

  public query func getStudentCountBySection(sectionId: Nat) : async Nat {
    Array.filter(students, func(s: Student) : Bool { s.sectionId == sectionId }).size()
  };

  public func updateInitialAssessment(studentId: Nat, notes: Text, isMaster: Bool) : async Bool {
    var updated = false;
    students := Array.map(students, func(s: Student) : Student {
      if (s.id == studentId) {
        if (s.locked and not isMaster) { s } else {
          updated := true;
          { id = s.id; name = s.name; gender = s.gender; sectionId = s.sectionId;
            initialAssessmentNotes = notes; weeklyUpdates = s.weeklyUpdates;
            locked = s.locked; addedByEmployee = s.addedByEmployee }
        }
      } else { s }
    });
    updated
  };

  public func addWeeklyUpdate(studentId: Nat, date: Text, notes: Text, isMaster: Bool) : async Bool {
    var updated = false;
    students := Array.map(students, func(s: Student) : Student {
      if (s.id == studentId) {
        if (s.locked and not isMaster) { s } else {
          updated := true;
          let newUpdate : WeeklyUpdate = { date = date; notes = notes };
          { id = s.id; name = s.name; gender = s.gender; sectionId = s.sectionId;
            initialAssessmentNotes = s.initialAssessmentNotes;
            weeklyUpdates = Array.append(s.weeklyUpdates, [newUpdate]);
            locked = s.locked; addedByEmployee = s.addedByEmployee }
        }
      } else { s }
    });
    updated
  };

  public func editWeeklyUpdate(studentId: Nat, index: Nat, date: Text, notes: Text) : async Bool {
    var updated = false;
    students := Array.map(students, func(s: Student) : Student {
      if (s.id == studentId) {
        updated := true;
        let newUpdates = Array.tabulate(s.weeklyUpdates.size(), func(i: Nat) : WeeklyUpdate {
          if (i == index) { { date = date; notes = notes } }
          else { s.weeklyUpdates[i] }
        });
        { id = s.id; name = s.name; gender = s.gender; sectionId = s.sectionId;
          initialAssessmentNotes = s.initialAssessmentNotes;
          weeklyUpdates = newUpdates;
          locked = s.locked; addedByEmployee = s.addedByEmployee }
      } else { s }
    });
    updated
  };

};

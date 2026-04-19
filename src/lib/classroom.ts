import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

type TeacherClassDocument = {
  name?: string;
  teacherId?: string;
  teacherName?: string;
  inviteCode?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type UserProfileDocument = {
  uid?: string;
  email?: string;
  role?: string;
  fullName?: string;
  name?: string;
  avatar?: string;
  classId?: string | null;
  className?: string | null;
  teacherId?: string | null;
  updatedAt?: unknown;
};

export type TeacherClass = {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
};

export type ClassroomStudent = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  classId: string | null;
  className: string | null;
  teacherId: string | null;
};

function ensureDb() {
  if (!db) {
    throw new Error("Firestore chưa sẵn sàng. Hãy kiểm tra cấu hình Firebase.");
  }

  return db;
}

function toIsoString(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "object" && value && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return new Date(0).toISOString();
}

function resolveStudentName(data: UserProfileDocument) {
  return data.fullName?.trim() || data.name?.trim() || data.email?.split("@")[0] || "Học sinh";
}

function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function listTeacherClasses(teacherId: string): Promise<TeacherClass[]> {
  const database = ensureDb();
  const snapshot = await getDocs(query(collection(database, "classes"), where("teacherId", "==", teacherId)));

  return snapshot.docs
    .map((item) => {
      const data = item.data() as TeacherClassDocument;
      return {
        id: item.id,
        name: data.name?.trim() || "Lớp chưa đặt tên",
        teacherId: data.teacherId?.trim() || teacherId,
        teacherName: data.teacherName?.trim() || "Giáo viên",
        inviteCode: data.inviteCode?.trim() || createInviteCode(),
        createdAt: toIsoString(data.createdAt),
        updatedAt: toIsoString(data.updatedAt),
      } satisfies TeacherClass;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function listStudents(): Promise<ClassroomStudent[]> {
  const database = ensureDb();
  const snapshot = await getDocs(collection(database, "users"));

  return snapshot.docs
    .map((item) => {
      const data = item.data() as UserProfileDocument;
      return {
        role: data.role?.toLowerCase() || "",
        id: item.id,
        email: data.email?.trim() || "",
        name: resolveStudentName(data),
        avatar: data.avatar?.trim() || "👨‍🎓",
        classId: typeof data.classId === "string" && data.classId.trim() ? data.classId.trim() : null,
        className: typeof data.className === "string" && data.className.trim() ? data.className.trim() : null,
        teacherId: typeof data.teacherId === "string" && data.teacherId.trim() ? data.teacherId.trim() : null,
      };
    })
    .filter((student) => student.role === "student")
    .map(({ role: _role, ...student }) => student as ClassroomStudent)
    .sort((left, right) => left.name.localeCompare(right.name, "vi"));
}

export async function createTeacherClass(input: {
  teacherId: string;
  teacherName: string;
  name: string;
}) {
  const database = ensureDb();
  const classRef = doc(collection(database, "classes"));
  const timestamp = new Date().toISOString();

  const nextClass = {
    id: classRef.id,
    name: input.name.trim(),
    teacherId: input.teacherId,
    teacherName: input.teacherName.trim() || "Giáo viên",
    inviteCode: createInviteCode(),
    createdAt: timestamp,
    updatedAt: timestamp,
  } satisfies TeacherClass;

  await setDoc(doc(database, "classes", classRef.id), {
    name: nextClass.name,
    teacherId: nextClass.teacherId,
    teacherName: nextClass.teacherName,
    inviteCode: nextClass.inviteCode,
    createdAt: nextClass.createdAt,
    updatedAt: nextClass.updatedAt,
  });

  return nextClass;
}

export async function assignStudentToClass(input: {
  studentId: string;
  classId: string;
  className: string;
  teacherId: string;
}) {
  const database = ensureDb();

  await setDoc(
    doc(database, "users", input.studentId),
    {
      classId: input.classId,
      className: input.className,
      teacherId: input.teacherId,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function removeStudentFromClass(studentId: string) {
  const database = ensureDb();

  await setDoc(
    doc(database, "users", studentId),
    {
      classId: null,
      className: null,
      teacherId: null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function deleteTeacherClass(classId: string) {
  const database = ensureDb();
  const batch = writeBatch(database);
  const studentsSnapshot = await getDocs(query(collection(database, "users"), where("classId", "==", classId)));
  const timestamp = new Date().toISOString();

  studentsSnapshot.forEach((studentDoc) => {
    batch.set(
      studentDoc.ref,
      {
        classId: null,
        className: null,
        teacherId: null,
        updatedAt: timestamp,
      },
      { merge: true },
    );
  });

  batch.delete(doc(database, "classes", classId));
  await batch.commit();
}
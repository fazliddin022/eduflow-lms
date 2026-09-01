import {
  pgTable, uuid, text, integer,
  boolean, timestamp, pgEnum, doublePrecision,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "teacher", "student"]);
export const levelEnum = pgEnum("level", ["beginner", "intermediate", "advanced"]);
export const questionTypeEnum = pgEnum("question_type", ["multiple_choice", "true_false"]);

// Allowed emails — teacher/admin uchun
export const allowedEmails = pgTable("allowed_emails", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  image: text("image"),
  role: roleEnum("role").default("student").notNull(),
  bio: text("bio"),
  isActive: boolean("is_active").default(true),
  theme: text("theme").default("light"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses
export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image"),
  category: text("category").notNull(),
  level: levelEnum("level").default("beginner").notNull(),
  price: integer("price").default(0),
  isPublished: boolean("is_published").default(false),
  totalLessons: integer("total_lessons").default(0),
  totalDuration: integer("total_duration").default(0),
  rating: doublePrecision("rating").default(0),
  totalReviews: integer("total_reviews").default(0),
  totalStudents: integer("total_students").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lessons
export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  content: text("content"),
  duration: integer("duration").default(0),
  order: integer("order").default(0),
  isFree: boolean("is_free").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enrollments
export const enrollments = pgTable("enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  certificateIssued: boolean("certificate_issued").default(false),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Lesson progress
export const lessonProgress = pgTable("lesson_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  lessonId: uuid("lesson_id").references(() => lessons.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
});

// Quizzes
export const quizzes = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  passingScore: integer("passing_score").default(70),
  timeLimit: integer("time_limit").default(30),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz questions
export const quizQuestions = pgTable("quiz_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }).notNull(),
  question: text("question").notNull(),
  type: questionTypeEnum("type").default("multiple_choice").notNull(),
  options: text("options").array(),
  correctAnswer: text("correct_answer").notNull(),
  points: integer("points").default(1),
  order: integer("order").default(0),
});

// Quiz attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  quizId: uuid("quiz_id").references(() => quizzes.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  score: integer("score").default(0),
  totalPoints: integer("total_points").default(0),
  isPassed: boolean("is_passed").default(false),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

// Certificates
export const certificates = pgTable("certificates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  certificateNumber: text("certificate_number").notNull().unique(),
  issuedAt: timestamp("issued_at").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type AllowedEmail = typeof allowedEmails.$inferSelect;
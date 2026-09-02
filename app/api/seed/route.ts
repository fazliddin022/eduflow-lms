import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, allowedEmails, courses, lessons, quizzes, quizQuestions } from "@/lib/schema";
import bcrypt from "bcryptjs";

export async function GET() {
  const [admin] = await db.insert(users).values({
    name: "Admin User",
    email: "admin@eduflow.com",
    password: await bcrypt.hash("admin123", 10),
    role: "admin",
    bio: "Platform administrator",
  }).returning().onConflictDoNothing();

  if (!admin) return NextResponse.json({ message: "Already seeded" });

  // Allowed emails
  await db.insert(allowedEmails).values([
    { email: "admin@eduflow.com", role: "admin" },
    { email: "teacher@eduflow.com", role: "teacher" },
    { email: "teacher2@eduflow.com", role: "teacher" },
    { email: "john.teacher@eduflow.com", role: "teacher" },
  ]).onConflictDoNothing();

  // Teachers
  const [teacher1] = await db.insert(users).values({
    name: "John Smith",
    email: "teacher@eduflow.com",
    password: await bcrypt.hash("teacher123", 10),
    role: "teacher",
    bio: "10+ years of experience in web development",
  }).returning();

  const [teacher2] = await db.insert(users).values({
    name: "Sarah Johnson",
    email: "teacher2@eduflow.com",
    password: await bcrypt.hash("teacher123", 10),
    role: "teacher",
    bio: "Data scientist and ML engineer",
  }).returning();

  // Students
  await db.insert(users).values([
    { name: "Alice Student", email: "student@eduflow.com", password: await bcrypt.hash("student123", 10), role: "student" },
    { name: "Bob Learner", email: "student2@eduflow.com", password: await bcrypt.hash("student123", 10), role: "student" },
  ]);

  // Courses
  const insertedCourses = await db.insert(courses).values([
    {
      teacherId: teacher1.id,
      title: "Complete React & Next.js Course",
      description: "Master React and Next.js from scratch. Build real-world projects with TypeScript, Tailwind CSS, and more.",
      category: "Web Development",
      level: "beginner",
      price: 299000,
      isPublished: true,
      totalLessons: 5,
      rating: 4.8,
      totalReviews: 234,
      totalStudents: 1205,
    },
    {
      teacherId: teacher1.id,
      title: "TypeScript Mastery",
      description: "Deep dive into TypeScript. Learn types, generics, decorators and advanced patterns.",
      category: "Programming",
      level: "intermediate",
      price: 199000,
      isPublished: true,
      totalLessons: 4,
      rating: 4.7,
      totalReviews: 189,
      totalStudents: 876,
    },
    {
      teacherId: teacher2.id,
      title: "Python for Data Science",
      description: "Learn Python for data analysis, visualization and machine learning with real datasets.",
      category: "Data Science",
      level: "beginner",
      price: 249000,
      isPublished: true,
      totalLessons: 4,
      rating: 4.9,
      totalReviews: 312,
      totalStudents: 2103,
    },
    {
      teacherId: teacher2.id,
      title: "Machine Learning Fundamentals",
      description: "Understand ML algorithms, model training, and deployment with scikit-learn and TensorFlow.",
      category: "Data Science",
      level: "advanced",
      price: 349000,
      isPublished: true,
      totalLessons: 4,
      rating: 4.6,
      totalReviews: 145,
      totalStudents: 543,
    },
    {
      teacherId: teacher1.id,
      title: "UI/UX Design Fundamentals",
      description: "Learn design principles, Figma, prototyping and user research for modern interfaces.",
      category: "Design",
      level: "beginner",
      price: 0,
      isPublished: true,
      totalLessons: 3,
      rating: 4.5,
      totalReviews: 98,
      totalStudents: 3421,
    },
    {
      teacherId: teacher2.id,
      title: "Node.js & Express API Development",
      description: "Build scalable REST APIs with Node.js, Express, and PostgreSQL.",
      category: "Backend",
      level: "intermediate",
      price: 279000,
      isPublished: false,
      totalLessons: 4,
      rating: 0,
      totalReviews: 0,
      totalStudents: 0,
    },
  ]).returning();

  // Lessons for course 1
  await db.insert(lessons).values([
    { courseId: insertedCourses[0].id, title: "Introduction to React", description: "What is React and why use it?", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "React is a JavaScript library for building user interfaces...", duration: 15, order: 1, isFree: true },
    { courseId: insertedCourses[0].id, title: "Components & Props", description: "Learn about React components and props", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "Components are the building blocks of React apps...", duration: 20, order: 2 },
    { courseId: insertedCourses[0].id, title: "State & Hooks", description: "Managing state with useState and useEffect", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "Hooks are functions that let you use React features...", duration: 25, order: 3 },
    { courseId: insertedCourses[0].id, title: "Next.js Routing", description: "File-based routing in Next.js App Router", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "Next.js uses a file-based routing system...", duration: 18, order: 4 },
    { courseId: insertedCourses[0].id, title: "Building & Deploying", description: "Build and deploy your Next.js app to Vercel", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "Deploying to Vercel is simple and fast...", duration: 22, order: 5 },
  ]);

  // Lessons for course 2
  await db.insert(lessons).values([
    { courseId: insertedCourses[1].id, title: "TypeScript Basics", description: "Types, interfaces and type annotations", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "TypeScript adds static typing to JavaScript...", duration: 20, order: 1, isFree: true },
    { courseId: insertedCourses[1].id, title: "Generics", description: "Using generics for reusable code", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "Generics allow creating reusable components...", duration: 25, order: 2 },
    { courseId: insertedCourses[1].id, title: "Advanced Types", description: "Union, intersection and conditional types", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "Advanced TypeScript types help model complex data...", duration: 30, order: 3 },
    { courseId: insertedCourses[1].id, title: "TypeScript with React", description: "Using TypeScript in React projects", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "TypeScript makes React components type-safe...", duration: 22, order: 4 },
  ]);

  // Lessons for course 3
  await db.insert(lessons).values([
    { courseId: insertedCourses[2].id, title: "Python Basics", description: "Variables, data types and control flow", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "Python is a beginner-friendly language...", duration: 18, order: 1, isFree: true },
    { courseId: insertedCourses[2].id, title: "NumPy & Pandas", description: "Data manipulation with NumPy and Pandas", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "NumPy and Pandas are essential data science tools...", duration: 28, order: 2 },
    { courseId: insertedCourses[2].id, title: "Data Visualization", description: "Charts with Matplotlib and Seaborn", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "Visualizing data helps find patterns...", duration: 22, order: 3 },
    { courseId: insertedCourses[2].id, title: "Intro to ML", description: "Your first machine learning model", videoUrl: "https://www.youtube.com/embed/dGcsHjTXT8o", content: "Machine learning models learn from data...", duration: 35, order: 4 },
  ]);

  // Quiz for course 1
  const [quiz1] = await db.insert(quizzes).values({
    courseId: insertedCourses[0].id,
    title: "React & Next.js Final Quiz",
    description: "Test your React and Next.js knowledge",
    passingScore: 70,
    timeLimit: 15,
  }).returning();

  await db.insert(quizQuestions).values([
    { quizId: quiz1.id, question: "What is React?", type: "multiple_choice", options: ["A database", "A JavaScript library for UI", "A backend framework", "A CSS framework"], correctAnswer: "A JavaScript library for UI", points: 1, order: 1 },
    { quizId: quiz1.id, question: "React uses a virtual DOM.", type: "true_false", options: ["True", "False"], correctAnswer: "True", points: 1, order: 2 },
    { quizId: quiz1.id, question: "Which hook manages state in React?", type: "multiple_choice", options: ["useEffect", "useRef", "useState", "useContext"], correctAnswer: "useState", points: 1, order: 3 },
    { quizId: quiz1.id, question: "Next.js supports server-side rendering.", type: "true_false", options: ["True", "False"], correctAnswer: "True", points: 1, order: 4 },
    { quizId: quiz1.id, question: "What is the file-based routing folder in Next.js App Router?", type: "multiple_choice", options: ["pages/", "routes/", "app/", "src/"], correctAnswer: "app/", points: 1, order: 5 },
  ]);

  // Quiz for course 2
  const [quiz2] = await db.insert(quizzes).values({
    courseId: insertedCourses[1].id,
    title: "TypeScript Knowledge Check",
    description: "Test your TypeScript skills",
    passingScore: 60,
    timeLimit: 10,
  }).returning();

  await db.insert(quizQuestions).values([
    { quizId: quiz2.id, question: "TypeScript is a superset of JavaScript.", type: "true_false", options: ["True", "False"], correctAnswer: "True", points: 1, order: 1 },
    { quizId: quiz2.id, question: "Which keyword defines an interface in TypeScript?", type: "multiple_choice", options: ["type", "class", "interface", "struct"], correctAnswer: "interface", points: 1, order: 2 },
    { quizId: quiz2.id, question: "What do generics provide in TypeScript?", type: "multiple_choice", options: ["Faster code", "Type reusability", "Better UI", "Database access"], correctAnswer: "Type reusability", points: 1, order: 3 },
  ]);

  return NextResponse.json({ success: true, message: "Database seeded!" });
}
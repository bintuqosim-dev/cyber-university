import { Redis } from '@upstash/redis'

// Upstash Redis ulanishi. Vercel'da "Upstash for Redis" integratsiyasini ulaganingizda
// KV_REST_API_URL va KV_REST_API_TOKEN muhit o'zgaruvchilari avtomatik qo'shiladi
// (integratsiya nomiga qarab UPSTASH_REDIS_REST_URL/TOKEN ham bo'lishi mumkin,
// shuning uchun ikkalasini ham tekshiramiz).
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

if (!url || !token) {
  console.error('[db] Redis muhit o\'zgaruvchilari topilmadi: KV_REST_API_URL / KV_REST_API_TOKEN')
}

const redis = new Redis({ url: url ?? '', token: token ?? '' })

async function getList<T>(key: string): Promise<T[]> {
  const data = await redis.get<T[]>(key)
  return data ?? []
}

async function setList<T>(key: string, data: T[]): Promise<void> {
  await redis.set(key, data)
}

function nextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map(i => i.id)) + 1
}

// ────────────────────────────────── Types ──────────────────────────────────
export type User = { id: number; name: string; email: string; password: string; role: 'student' | 'teacher'; created_at: string }
export type Course = { id: string; title: string; description: string; icon: string; color: string; order_num: number }
export type Topic = { id: number; course_id: string; title: string; content: string; cpp_example: string; python_example: string; kotlin_example: string; order_num: number; created_by: number; created_at: string }
export type Test = { id: number; topic_id: number; question: string; options: string; correct_index: number; created_by: number; created_at: string }
export type Problem = { id: number; course_id: string; title: string; difficulty: 'easy' | 'medium' | 'hard'; description: string; examples: string; constraints: string; starter_cpp: string; starter_python: string; starter_kotlin: string; solution_cpp: string; solution_python: string; created_by: number; created_at: string }

// ────────────────────────────────── DB ──────────────────────────────────
export const db = {
  // Users
  getUsers: () => getList<User>('users'),
  saveUsers: (u: User[]) => setList('users', u),
  getUserByEmail: async (email: string) => (await getList<User>('users')).find(u => u.email === email),
  getUserById: async (id: number) => (await getList<User>('users')).find(u => u.id === id),
  createUser: async (data: Omit<User, 'id' | 'created_at'>): Promise<User> => {
    const users = await getList<User>('users')
    const user: User = { ...data, id: nextId(users), created_at: new Date().toISOString() }
    await setList('users', [...users, user])
    return user
  },

  // Courses
  getCourses: () => getList<Course>('courses'),
  saveCourses: (c: Course[]) => setList('courses', c),

  // Topics
  getTopics: () => getList<Topic>('topics'),
  getTopicsByCourse: async (course_id: string) => (await getList<Topic>('topics')).filter(t => t.course_id === course_id).sort((a, b) => a.order_num - b.order_num),
  getTopicById: async (id: number) => (await getList<Topic>('topics')).find(t => t.id === id),
  createTopic: async (data: Omit<Topic, 'id' | 'created_at'>): Promise<Topic> => {
    const topics = await getList<Topic>('topics')
    const topic: Topic = { ...data, id: nextId(topics), created_at: new Date().toISOString() }
    await setList('topics', [...topics, topic])
    return topic
  },
  deleteTopic: async (id: number) => {
    const topics = await getList<Topic>('topics')
    await setList('topics', topics.filter(t => t.id !== id))
  },

  // Tests
  getTests: () => getList<Test>('tests'),
  getTestsByTopic: async (topic_id: number) => (await getList<Test>('tests')).filter(t => t.topic_id === topic_id),
  createTest: async (data: Omit<Test, 'id' | 'created_at'>): Promise<Test> => {
    const tests = await getList<Test>('tests')
    const test: Test = { ...data, id: nextId(tests), created_at: new Date().toISOString() }
    await setList('tests', [...tests, test])
    return test
  },
  deleteTest: async (id: number) => {
    const tests = await getList<Test>('tests')
    await setList('tests', tests.filter(t => t.id !== id))
  },

  // Problems
  getProblems: () => getList<Problem>('problems'),
  getProblemsByCourse: async (course_id: string) => (await getList<Problem>('problems')).filter(p => p.course_id === course_id),
  getProblemById: async (id: number) => (await getList<Problem>('problems')).find(p => p.id === id),
  createProblem: async (data: Omit<Problem, 'id' | 'created_at'>): Promise<Problem> => {
    const problems = await getList<Problem>('problems')
    const problem: Problem = { ...data, id: nextId(problems), created_at: new Date().toISOString() }
    await setList('problems', [...problems, problem])
    return problem
  },
}

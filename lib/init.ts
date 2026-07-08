import { db } from './db'
import bcrypt from 'bcryptjs'

// Eslatma: bu funksiya har bir serverless chaqiruvda ishga tushishi mumkin
// (xotiradagi flag'ga tayanib bo'lmaydi), shuning uchun asosiy himoya —
// bazada allaqachon ma'lumot bor-yo'qligini tekshirish.
export async function ensureInitialized() {
  const courses = await db.getCourses()
  if (courses.length > 0) return // allaqachon to'ldirilgan

  // Kurslar
  await db.saveCourses([
    { id: 'cpp',          title: 'C++ Programming',             description: "C++ dasturlash tili asoslaridan professional darajagacha", icon: '⚡', color: 'from-blue-600 to-cyan-500',    order_num: 1 },
    { id: 'python',       title: 'Python Programming',          description: "Python bilan zamonaviy dasturlash va sun'iy intellekt",     icon: '🐍', color: 'from-yellow-500 to-green-500', order_num: 2 },
    { id: 'kotlin',       title: 'Kotlin Development',          description: 'Kotlin bilan Android va backend ilovalar yaratish',         icon: '🚀', color: 'from-purple-600 to-pink-500',  order_num: 3 },
    { id: 'cybersecurity',title: 'Cybersecurity',               description: 'Kiberxavfsizlik asoslari va amaliy himoya usullari',        icon: '🔐', color: 'from-red-600 to-orange-500',   order_num: 4 },
    { id: 'dsa',          title: 'Data Structures & Algorithms',description: "Ma'lumotlar tuzilmasi va algoritmlar",                      icon: '🧩', color: 'from-green-600 to-teal-500',   order_num: 5 },
  ])

  // Demo foydalanuvchilar
  const password = bcrypt.hashSync('password123', 10)
  if (!(await db.getUserByEmail('teacher@cyber.uz'))) {
    await db.createUser({ name: 'Admin Teacher', email: 'teacher@cyber.uz', password, role: 'teacher' })
  }
  if (!(await db.getUserByEmail('student@cyber.uz'))) {
    await db.createUser({ name: 'Test Student', email: 'student@cyber.uz', password, role: 'student' })
  }

  const teacher = await db.getUserByEmail('teacher@cyber.uz')
  const teacherId = teacher!.id

  if ((await db.getTopics()).length === 0) {
    await db.createTopic({ course_id: 'cpp', title: "C++ga Kirish", order_num: 1, created_by: teacherId,
      content: `## C++ nima?\n\nC++ — bu **tizim dasturlash** uchun kuchli, tez va moslashuvchan dasturlash tili.\n\n### Afzalliklari:\n- **Yuqori tezlik**\n- **OOP qo'llab-quvvatlash**\n- **Keng qo'llanilishi**\n\n### Tuzilma:\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n\`\`\``,
      cpp_example: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    cout << "Ismingizni kiriting: ";\n    cin >> name;\n    cout << "Salom, " << name << "!" << endl;\n    return 0;\n}`,
      python_example: `name = input("Ismingizni kiriting: ")\nprint(f"Salom, {name}!")`,
      kotlin_example: `fun main() {\n    print("Ismingizni kiriting: ")\n    val name = readLine() ?: ""\n    println("Salom, \$name!")\n}` })

    await db.createTopic({ course_id: 'python', title: "Python'ga Kirish", order_num: 1, created_by: teacherId,
      content: `## Python nima?\n\nPython — 1991-yilda yaratilgan **yuqori darajali** dasturlash tili.\n\n### Nima uchun Python?\n- **Oson o'rganish**\n- **Keng qo'llanish** — Web, AI/ML, Data Science\n- **Katta jamoa**\n\n### Birinchi dastur:\n\`\`\`python\nprint("Hello!")\nname = input("Ismingiz: ")\nprint(f"Salom, {name}!")\n\`\`\``,
      cpp_example: `#include <iostream>\nusing namespace std;\nint main() {\n    string name;\n    cout << "Ismingiz: ";\n    cin >> name;\n    cout << "Salom, " << name << endl;\n}`,
      python_example: `name = input("Ismingizni kiriting: ")\nage = int(input("Yoshingizni kiriting: "))\nprint(f"Salom, {name}! Siz {age} yoshdasiz.")`,
      kotlin_example: `fun main() {\n    print("Ismingiz: ")\n    val name = readLine() ?: ""\n    println("Salom, \$name!")\n}` })

    await db.createTopic({ course_id: 'dsa', title: 'Massivlar (Arrays)', order_num: 1, created_by: teacherId,
      content: `## Massivlar\n\nMassiv — **bir xil turdagi** elementlar ketma-ketligi.\n\n### Murakkablik:\n| Amal | Vaqt |\n|------|------|\n| Kirish | O(1) |\n| Qidirish | O(n) |\n| Qo'shish | O(1) |\n\n### Turlari:\n- **1D** — oddiy ro'yxat\n- **2D** — jadval\n- **Dinamik** — vector/list`,
      cpp_example: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() {\n    vector<int> v = {64, 34, 25, 12};\n    sort(v.begin(), v.end());\n    for (int x : v) cout << x << " ";\n    cout << endl;\n    return 0;\n}`,
      python_example: `arr = [64, 34, 25, 12]\nprint("Asl:", arr)\narr.sort()\nprint("Saralangan:", arr)\nprint("Max:", max(arr), "Min:", min(arr))`,
      kotlin_example: `fun main() {\n    val arr = intArrayOf(64, 34, 25, 12)\n    val sorted = arr.sorted()\n    println("Saralangan: \$sorted")\n    println("Max: \${arr.max()}")\n}` })
  }

  if ((await db.getProblems()).length === 0) {
    await db.createProblem({ course_id: 'dsa', title: "Ikki Sonni Yig'indisi", difficulty: 'easy', created_by: teacherId,
      description: `Massiv \`nums\` va son \`target\` berilgan.\nYig'indisi \`target\`ga teng bo'lgan **ikki elementning indeksini** toping.`,
      examples: JSON.stringify([
        { input: "nums=[2,7,11,15], target=9", output: "[0,1]", explanation: "2+7=9" },
        { input: "nums=[3,2,4], target=6", output: "[1,2]", explanation: "2+4=6" },
      ]),
      constraints: "2 <= nums.length <= 10^4",
      starter_cpp: `#include <vector>\n#include <iostream>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Kodingizni yozing\n    }\n};\nint main() {\n    Solution sol;\n    vector<int> nums = {2,7,11,15};\n    auto r = sol.twoSum(nums, 9);\n    cout << r[0] << " " << r[1] << endl;\n}`,
      starter_python: `from typing import List\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass  # Kodingizni yozing\n\nsol = Solution()\nprint(sol.twoSum([2,7,11,15], 9))`,
      starter_kotlin: `class Solution {\n    fun twoSum(nums: IntArray, target: Int): IntArray {\n        return intArrayOf() // Kodingizni yozing\n    }\n}\nfun main() {\n    println(Solution().twoSum(intArrayOf(2,7,11,15), 9).toList())\n}`,
      solution_cpp: '', solution_python: '' })
  }
}

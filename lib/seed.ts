import { db } from './db'
import bcrypt from 'bcryptjs'

// Seed courses
const courses = [
  { id: 'cpp',          title: 'C++ Programming',             description: 'C++ dasturlash tili asoslaridan professional darajagacha',    icon: '⚡', color: 'from-blue-600 to-cyan-500',    order_num: 1 },
  { id: 'python',       title: 'Python Programming',          description: "Python bilan zamonaviy dasturlash va sun'iy intellekt",       icon: '🐍', color: 'from-yellow-500 to-green-500', order_num: 2 },
  { id: 'kotlin',       title: 'Kotlin Development',          description: 'Kotlin bilan Android va backend ilovalar yaratish',           icon: '🚀', color: 'from-purple-600 to-pink-500',  order_num: 3 },
  { id: 'cybersecurity',title: 'Cybersecurity',               description: 'Kiberxavfsizlik asoslari va amaliy himoya usullari',          icon: '🔐', color: 'from-red-600 to-orange-500',   order_num: 4 },
  { id: 'dsa',          title: 'Data Structures & Algorithms',description: "Ma'lumotlar tuzilmasi va algoritmlar",                        icon: '🧩', color: 'from-green-600 to-teal-500',   order_num: 5 },
]
await db.saveCourses(courses)

// Seed users
const password = bcrypt.hashSync('password123', 10)
const existingUsers = await db.getUsers()
if (!existingUsers.find(u => u.email === 'teacher@cyber.uz')) {
  await db.createUser({ name: 'Admin Teacher', email: 'teacher@cyber.uz', password, role: 'teacher' })
}
if (!existingUsers.find(u => u.email === 'student@cyber.uz')) {
  await db.createUser({ name: 'Test Student', email: 'student@cyber.uz', password, role: 'student' })
}

const teacherId = (await db.getUserByEmail('teacher@cyber.uz'))!.id

// Seed topics
const existingTopics = await db.getTopics()
if (existingTopics.length === 0) {
  // C++ topics
  await db.createTopic({ course_id: 'cpp', title: "C++ga Kirish", order_num: 1, created_by: teacherId,
    content: `## C++ nima?\n\nC++ — bu **tizim dasturlash** uchun kuchli, tez va moslashuvchan dasturlash tili. 1979-yilda Bjarne Stroustrup tomonidan yaratilgan.\n\n### C++ afzalliklari:\n- **Yuqori tezlik** — to'g'ridan-to'g'ri apparat bilan ishlash\n- **OOP qo'llab-quvvatlash** — Obyektga yo'naltirilgan dasturlash\n- **Keng qo'llanilishi** — O'yinlar, tizim dasturlash, AI\n\n### C++ dastur tuzilmasi:\n\`\`\`cpp\n#include <iostream>  // Kutubxona\nusing namespace std; // Nom maydoni\n\nint main() {         // Asosiy funksiya\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n\`\`\``,
    cpp_example: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    int age;\n\n    cout << "Ismingizni kiriting: ";\n    cin >> name;\n    cout << "Yoshingizni kiriting: ";\n    cin >> age;\n\n    cout << "Salom, " << name << "!" << endl;\n    cout << "Siz " << age << " yoshdasiz." << endl;\n\n    return 0;\n}`,
    python_example: `name = input("Ismingizni kiriting: ")\nage = int(input("Yoshingizni kiriting: "))\n\nprint(f"Salom, {name}!")\nprint(f"Siz {age} yoshdasiz.")`,
    kotlin_example: `fun main() {\n    print("Ismingizni kiriting: ")\n    val name = readLine() ?: ""\n    print("Yoshingizni kiriting: ")\n    val age = readLine()?.toIntOrNull() ?: 0\n\n    println("Salom, \$name!")\n    println("Siz \$age yoshdasiz.")\n}` })

  await db.createTopic({ course_id: 'cpp', title: "O'zgaruvchilar va Ma'lumot Turlari", order_num: 2, created_by: teacherId,
    content: `## O'zgaruvchilar (Variables)\n\nO'zgaruvchi — bu ma'lumotni saqlash uchun mo'ljallangan xotira joyi.\n\n### C++ ma'lumot turlari:\n\n| Tur | Hajm | Misol |\n|-----|------|-------|\n| \`int\` | 4 bayt | 42, -10 |\n| \`double\` | 8 bayt | 3.14, -0.5 |\n| \`char\` | 1 bayt | 'A', 'z' |\n| \`bool\` | 1 bayt | true, false |\n| \`string\` | o'zgaruvchan | "Salom" |\n\n### O'zgaruvchi e'lon qilish:\n\`\`\`cpp\nint yosh = 20;\ndouble narx = 15.99;\nchar harf = 'A';\nbool faol = true;\nstring ism = "Alisher";\n\`\`\`\n\n### Arifmetik amallar:\n- \`+\` qo'shish\n- \`-\` ayirish\n- \`*\` ko'paytirish\n- \`/\` bo'lish\n- \`%\` qoldiq`,
    cpp_example: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    int son = 42;\n    double haqiqiy = 3.14;\n    char harf = 'A';\n    bool rost = true;\n    string matn = "Salom Dunyo";\n\n    cout << "Int: " << son << endl;\n    cout << "Double: " << haqiqiy << endl;\n    cout << "Char: " << harf << endl;\n    cout << "Bool: " << rost << endl;\n    cout << "String: " << matn << endl;\n\n    int a = 10, b = 3;\n    cout << "\\nQo'shish: " << a + b << endl;\n    cout << "Qoldiq: " << a % b << endl;\n\n    return 0;\n}`,
    python_example: `son = 42\nhaqiqiy = 3.14\nmatn = "Salom Dunyo"\nrost = True\n\nprint(f"Int: {son}")\nprint(f"Float: {haqiqiy}")\nprint(f"String: {matn}")\nprint(f"Bool: {rost}")\n\na, b = 10, 3\nprint(f"Qo'shish: {a+b}")\nprint(f"Qoldiq: {a%b}")`,
    kotlin_example: `fun main() {\n    val son: Int = 42\n    val haqiqiy: Double = 3.14\n    val matn: String = "Salom"\n    val rost: Boolean = true\n\n    println("Int: \$son")\n    println("Double: \$haqiqiy")\n    println("String: \$matn")\n    println("Bool: \$rost")\n}` })

  await db.createTopic({ course_id: 'cpp', title: 'Shartli Operatorlar', order_num: 3, created_by: teacherId,
    content: `## Shartli Operatorlar (Conditionals)\n\nDasturda qaror qabul qilish uchun shartli operatorlar ishlatiladi.\n\n### if-else:\n\`\`\`cpp\nif (shart) {\n    // to'g'ri\n} else if (boshqa) {\n    // boshqa\n} else {\n    // aks holda\n}\n\`\`\`\n\n### Taqqoslash operatorlari:\n| Operator | Ma'no |\n|----------|-------|\n| \`==\` | teng |\n| \`!=\` | teng emas |\n| \`>\` | katta |\n| \`<\` | kichik |\n\n### Mantiqiy operatorlar:\n- \`&&\` — VA (AND)\n- \`||\` — YOKI (OR)\n- \`!\` — EMAS (NOT)`,
    cpp_example: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int ball;\n    cout << "Bahoni kiriting (0-100): ";\n    cin >> ball;\n\n    if (ball >= 90) {\n        cout << "A'lo (5)" << endl;\n    } else if (ball >= 75) {\n        cout << "Yaxshi (4)" << endl;\n    } else if (ball >= 55) {\n        cout << "Qoniqarli (3)" << endl;\n    } else {\n        cout << "Qoniqarsiz (2)" << endl;\n    }\n\n    return 0;\n}`,
    python_example: `ball = int(input("Bahoni kiriting (0-100): "))\n\nif ball >= 90:\n    print("A'lo (5)")\nelif ball >= 75:\n    print("Yaxshi (4)")\nelif ball >= 55:\n    print("Qoniqarli (3)")\nelse:\n    print("Qoniqarsiz (2)")`,
    kotlin_example: `fun main() {\n    print("Bahoni kiriting (0-100): ")\n    val ball = readLine()?.toIntOrNull() ?: 0\n\n    val baho = when {\n        ball >= 90 -> "A'lo (5)"\n        ball >= 75 -> "Yaxshi (4)"\n        ball >= 55 -> "Qoniqarli (3)"\n        else -> "Qoniqarsiz (2)"\n    }\n    println(baho)\n}` })

  // Python topics
  await db.createTopic({ course_id: 'python', title: "Python'ga Kirish", order_num: 1, created_by: teacherId,
    content: `## Python nima?\n\nPython — 1991-yilda Guido van Rossum tomonidan yaratilgan **yuqori darajali**, **umumiy maqsadli** dasturlash tili.\n\n### Nima uchun Python?\n- **Oson o'rganish** — ingliz tiliga yaqin sintaksis\n- **Keng qo'llanish** — Web, AI/ML, Data Science\n- **Katta jamoa** — Millionlab kutubxonalar\n\n### Birinchi dastur:\n\`\`\`python\nprint("Hello, World!")\nname = input("Ismingiz: ")\nprint(f"Salom, {name}!")\n\`\`\``,
    cpp_example: `#include <iostream>\nusing namespace std;\nint main() {\n    string name;\n    cout << "Ismingiz: ";\n    cin >> name;\n    cout << "Salom, " << name << "!" << endl;\n    return 0;\n}`,
    python_example: `print("Python'ga xush kelibsiz!")\nname = input("Ismingizni kiriting: ")\nage = int(input("Yoshingizni kiriting: "))\nprint(f"Salom, {name}! Siz {age} yoshdasiz.")`,
    kotlin_example: `fun main() {\n    println("Kotlin'ga xush kelibsiz!")\n    print("Ismingizni kiriting: ")\n    val name = readLine() ?: "Foydalanuvchi"\n    println("Salom, \$name!")\n}` })

  // DSA topics
  await db.createTopic({ course_id: 'dsa', title: 'Massivlar (Arrays)', order_num: 1, created_by: teacherId,
    content: `## Massivlar (Arrays)\n\nMassiv — bu **bir xil turdagi** elementlar ketma-ketligi.\n\n### Murakkablik:\n| Amal | Murakkablik |\n|------|-------------|\n| Kirish | O(1) |\n| Qidirish | O(n) |\n| Qo'shish (oxirga) | O(1) |\n| O'chirish | O(n) |\n\n### Massiv turlari:\n1. **1D massiv** — oddiy ro'yxat\n2. **2D massiv** — jadval (matritsa)\n3. **Dinamik massiv** — \`vector\` (C++), \`list\` (Python)`,
    cpp_example: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> v = {64, 34, 25, 12, 22};\n\n    cout << "Asl massiv: ";\n    for (int x : v) cout << x << " ";\n    cout << endl;\n\n    sort(v.begin(), v.end());\n\n    cout << "Saralangan: ";\n    for (int x : v) cout << x << " ";\n    cout << endl;\n\n    cout << "Max: " << v.back() << endl;\n    cout << "Min: " << v.front() << endl;\n\n    return 0;\n}`,
    python_example: `arr = [64, 34, 25, 12, 22]\n\nprint("Asl massiv:", arr)\nprint("Uzunlik:", len(arr))\nprint("Max:", max(arr))\nprint("Min:", min(arr))\nprint("Yig'indi:", sum(arr))\n\narr.sort()\nprint("Saralangan:", arr)\n\njuft = [x for x in arr if x % 2 == 0]\nprint("Juft sonlar:", juft)`,
    kotlin_example: `fun main() {\n    val arr = intArrayOf(64, 34, 25, 12, 22)\n\n    println("Massiv: \${arr.toList()}")\n    println("Max: \${arr.max()}")\n    println("Min: \${arr.min()}")\n    println("Yig'indi: \${arr.sum()}")\n\n    val sorted = arr.sorted()\n    println("Saralangan: \$sorted")\n}` })
}

// Seed problems
const existingProblems = await db.getProblems()
if (existingProblems.length === 0) {
  await db.createProblem({ course_id: 'dsa', title: "Ikki Sonni Yig'indisi (Two Sum)", difficulty: 'easy', created_by: teacherId,
    description: `Butun sonlar massivi \`nums\` va butun son \`target\` berilgan.\n\nMassivdan shunday **ikki elementning indekslarini** toping, ularning yig'indisi \`target\`ga teng bo'lsin.\n\nHar bir masalaning **aynan bitta yechimi** bor.`,
    examples: JSON.stringify([
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "nums[1] + nums[2] = 2 + 4 = 6" },
    ]),
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9",
    starter_cpp: `#include <vector>\n#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Kodingizni shu yerga yozing\n        \n    }\n};\n\nint main() {\n    Solution sol;\n    vector<int> nums = {2, 7, 11, 15};\n    auto result = sol.twoSum(nums, 9);\n    cout << "[" << result[0] << ", " << result[1] << "]" << endl;\n    return 0;\n}`,
    starter_python: `from typing import List\n\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Kodingizni shu yerga yozing\n        pass\n\nsol = Solution()\nprint(sol.twoSum([2, 7, 11, 15], 9))  # [0, 1]\nprint(sol.twoSum([3, 2, 4], 6))       # [1, 2]`,
    starter_kotlin: `class Solution {\n    fun twoSum(nums: IntArray, target: Int): IntArray {\n        // Kodingizni shu yerga yozing\n        return intArrayOf()\n    }\n}\n\nfun main() {\n    val sol = Solution()\n    println(sol.twoSum(intArrayOf(2, 7, 11, 15), 9).toList())\n}`,
    solution_cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int,int> map;\n        for (int i = 0; i < nums.size(); i++) {\n            int c = target - nums[i];\n            if (map.count(c)) return {map[c], i};\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
    solution_python: `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target-num], i]\n        seen[num] = i` })

  await db.createProblem({ course_id: 'dsa', title: 'Palindrom Tekshirish', difficulty: 'easy', created_by: teacherId,
    description: `Butun son \`x\` berilgan. Agar \`x\` palindrom bo'lsa \`true\`, aks holda \`false\` qaytaring.\n\n**Palindrom** — o'ngdan o'qilganda ham, chapdan o'qilganda ham bir xil bo'lgan son.\n\nMasalan, \`121\` palindrom, lekin \`123\` emas.`,
    examples: JSON.stringify([
      { input: "x = 121", output: "true", explanation: "121 ni chapdan va o'ngdan o'qisak 121 bo'ladi." },
      { input: "x = -121", output: "false", explanation: "Manfiy sonlar palindrom emas." },
    ]),
    constraints: "-2^31 <= x <= 2^31 - 1",
    starter_cpp: `class Solution {\npublic:\n    bool isPalindrome(int x) {\n        // Kodingizni shu yerga yozing\n        \n    }\n};\n\n#include <iostream>\nusing namespace std;\nint main() {\n    Solution sol;\n    cout << sol.isPalindrome(121) << endl;   // 1 (true)\n    cout << sol.isPalindrome(-121) << endl;  // 0 (false)\n    return 0;\n}`,
    starter_python: `class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        # Kodingizni shu yerga yozing\n        pass\n\nsol = Solution()\nprint(sol.isPalindrome(121))   # True\nprint(sol.isPalindrome(-121))  # False`,
    starter_kotlin: `class Solution {\n    fun isPalindrome(x: Int): Boolean {\n        // Kodingizni shu yerga yozing\n        return false\n    }\n}\n\nfun main() {\n    val sol = Solution()\n    println(sol.isPalindrome(121))   // true\n    println(sol.isPalindrome(-121))  // false\n}`,
    solution_cpp: `class Solution {\npublic:\n    bool isPalindrome(int x) {\n        if (x < 0) return false;\n        string s = to_string(x);\n        return s == string(s.rbegin(), s.rend());\n    }\n};`,
    solution_python: `def isPalindrome(x):\n    if x < 0: return False\n    s = str(x)\n    return s == s[::-1]` })

  await db.createProblem({ course_id: 'cpp', title: 'Fibonacci Ketma-ketligi', difficulty: 'easy', created_by: teacherId,
    description: `**n** soni berilgan. Fibonacci ketma-ketligining **n-chi** elementini toping.\n\n\`0, 1, 1, 2, 3, 5, 8, 13, 21, ...\`\n\n- F(0) = 0\n- F(1) = 1\n- F(n) = F(n-1) + F(n-2)`,
    examples: JSON.stringify([
      { input: "n = 2", output: "1", explanation: "F(2) = F(1) + F(0) = 1 + 0 = 1" },
      { input: "n = 4", output: "3", explanation: "F(4) = F(3) + F(2) = 2 + 1 = 3" },
    ]),
    constraints: "0 <= n <= 30",
    starter_cpp: `class Solution {\npublic:\n    int fib(int n) {\n        // Kodingizni shu yerga yozing\n        \n    }\n};\n\n#include <iostream>\nusing namespace std;\nint main() {\n    Solution sol;\n    for (int i = 0; i <= 10; i++)\n        cout << "F(" << i << ") = " << sol.fib(i) << endl;\n    return 0;\n}`,
    starter_python: `class Solution:\n    def fib(self, n: int) -> int:\n        # Kodingizni shu yerga yozing\n        pass\n\nsol = Solution()\nfor i in range(11):\n    print(f"F({i}) = {sol.fib(i)}")`,
    starter_kotlin: `class Solution {\n    fun fib(n: Int): Int {\n        // Kodingizni shu yerga yozing\n        return 0\n    }\n}\n\nfun main() {\n    val sol = Solution()\n    for (i in 0..10) println("F(\$i) = \${sol.fib(i)}")\n}`,
    solution_cpp: `int fib(int n) {\n    if (n<=1) return n;\n    int a=0,b=1;\n    for(int i=2;i<=n;i++){int c=a+b;a=b;b=c;}\n    return b;\n}`,
    solution_python: `def fib(n):\n    if n<=1: return n\n    a,b=0,1\n    for _ in range(2,n+1): a,b=b,a+b\n    return b` })
}

console.log('✅ Database seeded!')
console.log('📧 O\'qituvchi: teacher@cyber.uz / password123')
console.log('📧 Talaba:     student@cyber.uz / password123')

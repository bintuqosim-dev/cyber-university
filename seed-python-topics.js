#!/usr/bin/env node
/**
 * Python kursi uchun 15 ta mavzuni Upstash Redis bazasiga bir yo'la qo'shadi.
 * Ishga tushirish: cyber-university loyiha papkasida (.env.local mavjud joyda):
 *   node seed-python-topics.js
 */
const fs = require('fs')
const path = require('path')

// .env.local faylini qo'lda o'qib, process.env ga yuklaymiz
function loadEnvLocal() {
  const envPath = path.join(__dirname, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('XATO: .env.local topilmadi. Bu skriptni cyber-university loyiha papkasida ishga tushiring.')
    process.exit(1)
  }
  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

const { Redis } = require('@upstash/redis')

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

if (!url || !token) {
  console.error('XATO: KV_REST_API_URL / KV_REST_API_TOKEN .env.local ichida topilmadi.')
  process.exit(1)
}

const redis = new Redis({ url, token })

const NEW_TOPICS = [
  {
    "title": "Dasturlash tiliga kirish va algoritmik fikrlash",
    "content": "Kompyuter faqat ikkilik kodni (0 va 1) tushunadi, shuning uchun inson yozgan dasturlash tilidagi kodni mashina kodiga o'giruvchi maxsus dasturlar kerak bo'ladi. Bu vazifani ikki xil vosita bajaradi: kompilyator kodni to'liq o'qib, bir yo'la mashina kodiga aylantiradi (C++, Go); interpretator esa kodni satr-satr o'qib, darhol bajaradi (Python, JavaScript).\n\n## Kompilyator va interpretator taqqoslash\n\n| Xususiyat | Kompilyator | Interpretator |\n|---|---|---|\n| Tarjima usuli | To'liq, bir yo'la | Satr-satr |\n| Bajariladigan fayl | Hosil bo'ladi | Hosil bo'lmaydi |\n| Ishlash tezligi | Yuqori | Nisbatan past |\n| Xatoni aniqlash | Kompilyatsiyada | Bajarish paytida |\n\nPython — interpretatsiyalanadigan, yuqori darajali til bo'lib, sodda sintaksisi tufayli dasturlashni o'rganish uchun keng tarqalgan. print() funksiyasi ekranga ma'lumot chiqaradi, input() esa foydalanuvchidan matn shaklida ma'lumot qabul qiladi. Har uchala tilda ham dastur asosiy kirish nuqtasidan (Python — fayl boshidan, C++/Kotlin — main() funksiyasidan) boshlab bajariladi.",
    "cpp_example": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    int age;\n    cout << \"Ismingizni kiriting: \";\n    cin >> name;\n    cout << \"Yoshingizni kiriting: \";\n    cin >> age;\n\n    cout << \"Salom, \" << name << \"!\" << endl;\n    cout << \"Siz \" << age << \" yoshdasiz.\" << endl;\n    cout << \"Yig'indi: \" << (15 + 27) << endl;\n    return 0;\n}",
    "python_example": "# Foydalanuvchidan ma'lumot olish va ekranga chiqarish\nname = input(\"Ismingizni kiriting: \")\nage = int(input(\"Yoshingizni kiriting: \"))\n\nprint(f\"Salom, {name}!\")\nprint(f\"Siz {age} yoshdasiz.\")\nprint(\"Yig'indi:\", 15 + 27)",
    "kotlin_example": "fun main() {\n    print(\"Ismingizni kiriting: \")\n    val name = readLine() ?: \"\"\n    print(\"Yoshingizni kiriting: \")\n    val age = readLine()?.toInt() ?: 0\n\n    println(\"Salom, $name!\")\n    println(\"Siz $age yoshdasiz.\")\n    println(\"Yig'indi: ${15 + 27}\")\n}",
    "order_num": 1
  },
  {
    "title": "O'zgaruvchilar va ma'lumot turlari",
    "content": "O'zgaruvchi — qiymatni xotirada saqlash uchun ishlatiladigan nom. Python'da o'zgaruvchi turi avtomatik aniqlanadi (dinamik tiplash), C++ va Kotlin'da esa turi aniq ko'rsatiladi yoki chiqarib olinadi (statik tiplash).\n\n## Asosiy ma'lumot turlari\n\n| Tur | Tavsif | Misol |\n|---|---|---|\n| int | Butun son | 25, -7 |\n| float / double | O'nli kasr son | 3.14 |\n| str / string | Matn | \"Salom\" |\n| bool | Mantiqiy (rost/yolg'on) | True, False |\n\nTur konversiyasi (type casting) — bir turdagi qiymatni boshqasiga aylantirish. Python'da int(), float(), str() funksiyalari, C++ va Kotlin'da esa mos konstruktorlar yoki .toInt()/.toDouble() kabi metodlar ishlatiladi.",
    "cpp_example": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int price = 25000;\n    double discount = 0.15;\n    string name = \"Noutbuk\";\n    bool inStock = true;\n\n    double finalPrice = price * (1 - discount);\n    cout << name << \": \" << finalPrice << \" so'm\" << endl;\n\n    string textNumber = \"42\";\n    int number = stoi(textNumber) + 8;\n    cout << number << endl;\n    return 0;\n}",
    "python_example": "price = 25000       # int\ndiscount = 0.15     # float\nname = \"Noutbuk\"    # str\nin_stock = True     # bool\n\nfinal_price = price * (1 - discount)\nprint(f\"{name}: {final_price:.0f} so'm\")\nprint(\"Turi:\", type(final_price))\n\n# Tur konversiyasi\ntext_number = \"42\"\nnumber = int(text_number) + 8\nprint(number)",
    "kotlin_example": "fun main() {\n    val price = 25000\n    val discount = 0.15\n    val name = \"Noutbuk\"\n    val inStock = true\n\n    val finalPrice = price * (1 - discount)\n    println(\"$name: $finalPrice so'm\")\n\n    val textNumber = \"42\"\n    val number = textNumber.toInt() + 8\n    println(number)\n}",
    "order_num": 2
  },
  {
    "title": "Satrlar bilan ishlash",
    "content": "Satr (string) — belgilar ketma-ketligi bo'lib, Python'da har bir belgi 0 dan boshlab indekslanadi. Indekslash (indexing) orqali bitta belgi, kesish (slicing) orqali esa satrning bir qismi olinadi.\n\n## Ko'p ishlatiladigan satr metodlari\n\n| Metod | Vazifasi |\n|---|---|\n| upper() / lower() | Katta/kichik harfga o'tkazish |\n| strip() | Bo'sh joylarni olib tashlash |\n| replace(a, b) | Qidirish va almashtirish |\n| split(sep) | Belgi bo'yicha bo'laklarga ajratish |\n| join(list) | Ro'yxatni satrga birlashtirish |\n\nZamonaviy Python'da satrlarni formatlash uchun f-string (f\"...{o'zgaruvchi}...\") eng qulay va tavsiya etiladigan usul hisoblanadi — u o'zgaruvchini to'g'ridan-to'g'ri satr ichiga joylashtirish imkonini beradi.",
    "cpp_example": "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string text = \"Dasturlash Asoslari\";\n    string upper = text;\n    transform(upper.begin(), upper.end(), upper.begin(), ::toupper);\n    cout << upper << endl;\n\n    string name = \"Aziz\";\n    int score = 92;\n    cout << name << \" natijasi: \" << score << \" ball\" << endl;\n\n    cout << text.substr(0, 11) << endl;  // kesish\n    return 0;\n}",
    "python_example": "text = \"  Dasturlash Asoslari  \"\n\nclean = text.strip()\nprint(clean.upper())\nprint(clean.lower())\n\nwords = clean.split()\nprint(words)\nprint(\"-\".join(words))\n\nname, score = \"Aziz\", 92\nprint(f\"{name} natijasi: {score} ball\")\nprint(clean[0:11])   # kesish (slicing)",
    "kotlin_example": "fun main() {\n    val text = \"  Dasturlash Asoslari  \"\n    val clean = text.trim()\n\n    println(clean.uppercase())\n    println(clean.lowercase())\n\n    val words = clean.split(\" \")\n    println(words)\n    println(words.joinToString(\"-\"))\n\n    val name = \"Aziz\"; val score = 92\n    println(\"$name natijasi: $score ball\")\n    println(clean.substring(0, 11))\n}",
    "order_num": 3
  },
  {
    "title": "Mantiqiy va taqqoslash operatorlari",
    "content": "Taqqoslash operatorlari (==, !=, <, >, <=, >=) ikkita qiymatni solishtirib, mantiqiy natija (True/False) qaytaradi. Mantiqiy operatorlar esa bir nechta shartni birlashtirish uchun ishlatiladi.\n\n## Mantiqiy operatorlar\n\n| Operator | Ma'nosi | Natija True bo'lishi uchun |\n|---|---|---|\n| and | VA | Ikkala shart ham to'g'ri bo'lsa |\n| or | YOKI | Kamida bittasi to'g'ri bo'lsa |\n| not | EMAS | Shartni teskarisiga aylantiradi |\n\nPython'da and/or operatorlari qisqa baholash (short-circuit evaluation) prinsipi bilan ishlaydi — agar birinchi shart natijani aniqlab bersa, ikkinchi shart tekshirilmaydi. Bu C++ va Kotlin'da mos ravishda && va || operatorlari orqali amalga oshadi.",
    "cpp_example": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int age = 20;\n    bool hasId = true;\n\n    bool canVote = (age >= 18) && hasId;\n    cout << \"Ovoz bera oladimi: \" << canVote << endl;\n\n    bool isWeekend = false, isHoliday = true;\n    bool dayOff = isWeekend || isHoliday;\n    cout << \"Dam olish kunimi: \" << dayOff << endl;\n\n    cout << \"Kattami: \" << !(age < 18) << endl;\n    return 0;\n}",
    "python_example": "age = 20\nhas_id = True\n\ncan_vote = age >= 18 and has_id\nprint(\"Ovoz bera oladimi:\", can_vote)\n\nis_weekend = False\nis_holiday = True\nday_off = is_weekend or is_holiday\nprint(\"Dam olish kunimi:\", day_off)\n\nprint(\"Kattami:\", not (age < 18))",
    "kotlin_example": "fun main() {\n    val age = 20\n    val hasId = true\n\n    val canVote = age >= 18 && hasId\n    println(\"Ovoz bera oladimi: $canVote\")\n\n    val isWeekend = false; val isHoliday = true\n    val dayOff = isWeekend || isHoliday\n    println(\"Dam olish kunimi: $dayOff\")\n\n    println(\"Kattami: ${!(age < 18)}\")\n}",
    "order_num": 4
  },
  {
    "title": "Shartli operatorlar",
    "content": "Shartli operatorlar dasturga qaror qabul qilish imkonini beradi — shart to'g'ri bo'lsa bir blok, noto'g'ri bo'lsa boshqa blok bajariladi. Python'da bloklar chekinish (indentation) orqali, C++ va Kotlin'da esa figurali qavslar {} orqali belgilanadi.\n\n## if-elif-else tuzilmasi\n\nBir nechta shartni ketma-ket tekshirish uchun if-elif-else (Python) yoki if-else if-else (C++/Kotlin) zanjiri ishlatiladi — birinchi to'g'ri kelgan shart bajariladi, qolganlari tekshirilmaydi.\n\nIchma-ich shartlar (nested if) — bir shart ichida boshqa shart joylashtirish, murakkabroq mantiqni ifodalash uchun ishlatiladi. Qisqa shartlar uchun bir qatorli shartli ifoda (ternary operator) qulay: Python'da `x if shart else y`, C++/Kotlin'da esa `shart ? x : y`.",
    "cpp_example": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 78;\n    string grade;\n\n    if (score >= 90) grade = \"A\";\n    else if (score >= 70) grade = \"B\";\n    else if (score >= 50) grade = \"C\";\n    else grade = \"F\";\n\n    cout << \"Baho: \" << grade << endl;\n\n    string status = (score >= 50) ? \"O'tdi\" : \"Yiqildi\";\n    cout << status << endl;\n    return 0;\n}",
    "python_example": "score = 78\n\nif score >= 90:\n    grade = \"A\"\nelif score >= 70:\n    grade = \"B\"\nelif score >= 50:\n    grade = \"C\"\nelse:\n    grade = \"F\"\n\nprint(f\"Baho: {grade}\")\n\n# Bir qatorli shartli ifoda\nstatus = \"O'tdi\" if score >= 50 else \"Yiqildi\"\nprint(status)",
    "kotlin_example": "fun main() {\n    val score = 78\n    val grade = when {\n        score >= 90 -> \"A\"\n        score >= 70 -> \"B\"\n        score >= 50 -> \"C\"\n        else -> \"F\"\n    }\n    println(\"Baho: $grade\")\n\n    val status = if (score >= 50) \"O'tdi\" else \"Yiqildi\"\n    println(status)\n}",
    "order_num": 5
  },
  {
    "title": "Takrorlash operatorlari (Loops)",
    "content": "Sikllar (loops) bir xil amalni bir necha marta takrorlash uchun ishlatiladi. while sikli shart to'g'ri bo'lguncha, for sikli esa ma'lum diapazon yoki to'plam bo'yicha takrorlanadi.\n\n## Boshqaruv operatorlari\n\n| Operator | Vazifasi |\n|---|---|\n| break | Siklni to'liq to'xtatadi |\n| continue | Joriy iteratsiyani o'tkazib, keyingisiga o'tadi |\n| pass | Hech narsa qilmaydi (bo'sh joy to'ldiruvchi) |\n\nPython'da range(start, stop, step) funksiyasi for sikli bilan birga sonlar ketma-ketligini generatsiya qilish uchun ishlatiladi. C++ va Kotlin'da mos ravishda klassik for(;;) yoki for (i in a..b) tuzilmalari ishlatiladi.",
    "cpp_example": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int total = 0;\n    for (int i = 1; i <= 10; i++) {\n        total += i;\n    }\n    cout << \"Yig'indi: \" << total << endl;\n\n    int n = 10, count = 0;\n    while (n > 1) {\n        n = n / 2;\n        count++;\n    }\n    cout << \"Bo'linishlar soni: \" << count << endl;\n    return 0;\n}",
    "python_example": "# 1 dan 10 gacha yig'indi\ntotal = 0\nfor i in range(1, 11):\n    total += i\nprint(\"Yig'indi:\", total)\n\n# while sikli\nn = 10\ncount = 0\nwhile n > 1:\n    n = n // 2\n    count += 1\nprint(\"Bo'linishlar soni:\", count)",
    "kotlin_example": "fun main() {\n    var total = 0\n    for (i in 1..10) {\n        total += i\n    }\n    println(\"Yig'indi: $total\")\n\n    var n = 10\n    var count = 0\n    while (n > 1) {\n        n /= 2\n        count++\n    }\n    println(\"Bo'linishlar soni: $count\")\n}",
    "order_num": 6
  },
  {
    "title": "Massivlar (ro'yxatlar) bilan ishlash",
    "content": "Python'da ro'yxat (list) — tartiblangan, o'zgaruvchan (mutable) elementlar to'plami bo'lib, kvadrat qavslar [] orqali yaraladi. C++'da vector, Kotlin'da esa MutableList shu vazifani bajaradi.\n\n## Asosiy metodlar\n\n| Metod | Vazifasi |\n|---|---|\n| append(x) | Oxiriga element qo'shish |\n| remove(x) | Berilgan qiymatni o'chirish |\n| sort() | O'sish tartibida saralash |\n| len(list) | Elementlar sonini olish |\n\nRo'yxatlar indekslash ([0], [-1]) va kesish ([1:3]) orqali ham boshqariladi — bu satrlar bilan ishlash mantig'iga juda o'xshash.",
    "cpp_example": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> numbers = {64, 34, 25, 12, 22};\n\n    numbers.push_back(90);\n    numbers.erase(remove(numbers.begin(), numbers.end(), 34), numbers.end());\n    sort(numbers.begin(), numbers.end());\n\n    cout << \"Ro'yxat: \";\n    for (int x : numbers) cout << x << \" \";\n    cout << endl;\n    cout << \"Eng katta: \" << *max_element(numbers.begin(), numbers.end()) << endl;\n    return 0;\n}",
    "python_example": "numbers = [64, 34, 25, 12, 22]\n\nnumbers.append(90)\nnumbers.remove(34)\nnumbers.sort()\n\nprint(\"Ro'yxat:\", numbers)\nprint(\"Eng katta:\", max(numbers))\nprint(\"Yig'indi:\", sum(numbers))\nprint(\"Birinchi 3 ta:\", numbers[:3])",
    "kotlin_example": "fun main() {\n    val numbers = mutableListOf(64, 34, 25, 12, 22)\n\n    numbers.add(90)\n    numbers.remove(34)\n    numbers.sort()\n\n    println(\"Ro'yxat: $numbers\")\n    println(\"Eng katta: ${numbers.max()}\")\n    println(\"Yig'indi: ${numbers.sum()}\")\n    println(\"Birinchi 3 ta: ${numbers.take(3)}\")\n}",
    "order_num": 7
  },
  {
    "title": "Lug'atlar va to'plamlar",
    "content": "Lug'at (dict) — kalit-qiymat (key-value) juftliklarini saqlaydigan tuzilma bo'lib, {} qavslari orqali yaratiladi va kalit orqali tezkor qidiruvni ta'minlaydi. To'plam (set) esa faqat noyob (takrorlanmaydigan) elementlarni saqlaydi.\n\n## Lug'at va to'plam taqqoslash\n\n| Xususiyat | dict | set |\n|---|---|---|\n| Tuzilma | Kalit: qiymat | Faqat qiymatlar |\n| Takrorlanish | Kalitlar noyob | Barcha elementlar noyob |\n| Qidiruv tezligi | O(1) — kalit orqali | O(1) — element orqali |\n\nC++'da bu vazifalarni map/unordered_map (lug'at) va set/unordered_set (to'plam) bajaradi; Kotlin'da esa mos ravishda Map va Set interfeyslari ishlatiladi.",
    "cpp_example": "#include <iostream>\n#include <map>\n#include <set>\nusing namespace std;\n\nint main() {\n    map<string, string> student = {{\"name\", \"Laylo\"}, {\"grade\", \"A\"}};\n    student[\"city\"] = \"Toshkent\";\n\n    for (auto& [key, value] : student) {\n        cout << key << \": \" << value << endl;\n    }\n\n    set<string> uniqueGrades = {\"A\", \"B\", \"A\", \"C\", \"B\"};\n    cout << \"Noyob baholar soni: \" << uniqueGrades.size() << endl;\n    cout << \"Bormi 'A'? \" << uniqueGrades.count(\"A\") << endl;\n    return 0;\n}",
    "python_example": "student = {\"name\": \"Laylo\", \"age\": 20, \"grade\": \"A\"}\nstudent[\"city\"] = \"Toshkent\"\n\nfor key, value in student.items():\n    print(f\"{key}: {value}\")\n\n# To'plam — faqat noyob elementlar\nunique_grades = {\"A\", \"B\", \"A\", \"C\", \"B\"}\nprint(\"Noyob baholar:\", unique_grades)\nprint(\"Bormi 'A'?\", \"A\" in unique_grades)",
    "kotlin_example": "fun main() {\n    val student = mutableMapOf(\"name\" to \"Laylo\", \"grade\" to \"A\")\n    student[\"city\"] = \"Toshkent\"\n\n    for ((key, value) in student) {\n        println(\"$key: $value\")\n    }\n\n    val uniqueGrades = setOf(\"A\", \"B\", \"A\", \"C\", \"B\")\n    println(\"Noyob baholar: $uniqueGrades\")\n    println(\"Bormi 'A'? ${\"A\" in uniqueGrades}\")\n}",
    "order_num": 8
  },
  {
    "title": "Funksiyalar",
    "content": "Funksiya — bir necha marta qayta ishlatilishi mumkin bo'lgan, ma'lum vazifani bajaruvchi kod bo'lagi. Python'da def kalit so'zi, C++ va Kotlin'da esa qaytariladigan tur ko'rsatilgan holda e'lon qilinadi.\n\n## Parametr turlari\n\n| Tur | Tavsif |\n|---|---|\n| Pozitsion | Tartib bo'yicha uzatiladi |\n| Kalit so'z (keyword) | Nomi orqali uzatiladi |\n| Standart (default) | Qiymat berilmasa, standart qiymat ishlatiladi |\n\nreturn operatori funksiya natijasini qaytaradi va funksiyani darhol tugatadi. Python'da qisqa, bir qatorli funksiyalar uchun lambda ifodalari ham qo'llaniladi.",
    "cpp_example": "#include <iostream>\nusing namespace std;\n\ndouble calculateTotal(double price, int quantity, double discount = 0) {\n    double subtotal = price * quantity;\n    return subtotal * (1 - discount);\n}\n\nint main() {\n    double result = calculateTotal(15000, 3, 0.1);\n    cout << \"Jami: \" << result << \" so'm\" << endl;\n\n    auto square = [](int x) { return x * x; };\n    cout << square(5) << endl;\n    return 0;\n}",
    "python_example": "def calculate_total(price, quantity, discount=0):\n    subtotal = price * quantity\n    total = subtotal * (1 - discount)\n    return total\n\nresult = calculate_total(15000, 3, discount=0.1)\nprint(f\"Jami: {result:.0f} so'm\")\n\n# Lambda funksiya\nsquare = lambda x: x * x\nprint(square(5))",
    "kotlin_example": "fun calculateTotal(price: Double, quantity: Int, discount: Double = 0.0): Double {\n    val subtotal = price * quantity\n    return subtotal * (1 - discount)\n}\n\nfun main() {\n    val result = calculateTotal(15000.0, 3, 0.1)\n    println(\"Jami: $result so'm\")\n\n    val square = { x: Int -> x * x }\n    println(square(5))\n}",
    "order_num": 9
  },
  {
    "title": "Modullar va ularni dasturga yuklash",
    "content": "Modul — qayta ishlatish mumkin bo'lgan kod (funksiya, klass, o'zgaruvchi) saqlangan alohida fayl. Python'da import kalit so'zi orqali standart yoki o'z modullaringizni dasturga ulash mumkin.\n\n## Foydali standart modullar\n\n| Modul | Vazifasi |\n|---|---|\n| math | Matematik funksiyalar (sqrt, pow, pi) |\n| random | Tasodifiy son/tanlov generatsiyasi |\n| os | Fayl tizimi va operatsion tizim bilan ishlash |\n| sys | Dastur argumentlari va tizim sozlamalari |\n\nif __name__ == \"__main__\": konstruksiyasi fayl to'g'ridan-to'g'ri ishga tushirilganda (import qilinmaganda) bajariladigan kodni ajratib beradi — bu Python'ga xos, lekin C++/Kotlin'da har bir dastur allaqachon aniq main() nuqtasiga ega.",
    "cpp_example": "#include <iostream>\n#include <cmath>\n#include <cstdlib>\n#include <ctime>\nusing namespace std;\n\nint main() {\n    double radius = 5;\n    double area = M_PI * pow(radius, 2);\n    cout << \"Doira yuzi: \" << area << endl;\n\n    srand(time(0));\n    int diceRoll = rand() % 6 + 1;\n    cout << \"Tashlangan kub: \" << diceRoll << endl;\n    return 0;\n}",
    "python_example": "import math\nimport random\n\nradius = 5\narea = math.pi * radius ** 2\nprint(f\"Doira yuzi: {area:.2f}\")\n\ndice_roll = random.randint(1, 6)\nprint(\"Tashlangan kub:\", dice_roll)\n\nif __name__ == \"__main__\":\n    print(\"Dastur to'g'ridan-to'g'ri ishga tushirildi\")",
    "kotlin_example": "import kotlin.math.PI\nimport kotlin.math.pow\nimport kotlin.random.Random\n\nfun main() {\n    val radius = 5.0\n    val area = PI * radius.pow(2)\n    println(\"Doira yuzi: $area\")\n\n    val diceRoll = Random.nextInt(1, 7)\n    println(\"Tashlangan kub: $diceRoll\")\n}",
    "order_num": 10
  },
  {
    "title": "Fayllar bilan ishlash",
    "content": "Fayllar bilan ishlash dasturga ma'lumotlarni doimiy saqlash (dastur yopilgandan keyin ham) imkonini beradi. Python'da open() funksiyasi fayl rejimini belgilaydi: \"r\" — o'qish, \"w\" — yozish (mavjudini o'chiradi), \"a\" — qo'shish.\n\n## with kontekst menejeri\n\nwith open(...) as f: konstruksiyasi tavsiya etiladigan usul, chunki u faylni ishlatib bo'lgach avtomatik yopadi — hatto xatolik yuz bersa ham. Bu C++'dagi RAII (ifstream/ofstream destruktori) va Kotlin'dagi use{} funksiyasiga mos keladi.\n\nFayl o'qishning bir necha usuli bor: read() — butun matnni, readline() — bitta qatorni, readlines() — barcha qatorlarni ro'yxat sifatida qaytaradi.",
    "cpp_example": "#include <iostream>\n#include <fstream>\nusing namespace std;\n\nint main() {\n    ofstream outFile(\"hisobot.txt\");\n    outFile << \"Talaba: Aziz\" << endl;\n    outFile << \"Ball: 92\" << endl;\n    outFile.close();\n\n    ifstream inFile(\"hisobot.txt\");\n    string line;\n    while (getline(inFile, line)) {\n        cout << line << endl;\n    }\n    inFile.close();\n    return 0;\n}",
    "python_example": "# Faylga yozish\nwith open(\"hisobot.txt\", \"w\") as f:\n    f.write(\"Talaba: Aziz\\n\")\n    f.write(\"Ball: 92\\n\")\n\n# Fayldan o'qish\nwith open(\"hisobot.txt\", \"r\") as f:\n    for line in f:\n        print(line.strip())\n\n# Qo'shish rejimida\nwith open(\"hisobot.txt\", \"a\") as f:\n    f.write(\"Sana: 2026-07-16\\n\")",
    "kotlin_example": "import java.io.File\n\nfun main() {\n    val file = File(\"hisobot.txt\")\n    file.writeText(\"Talaba: Aziz\\n\")\n    file.appendText(\"Ball: 92\\n\")\n\n    file.forEachLine { line ->\n        println(line)\n    }\n}",
    "order_num": 11
  },
  {
    "title": "Ma'lumotlar bazasi asoslari. SQLite bilan ishlash",
    "content": "Ma'lumotlar bazasi — tartiblangan, tez qidiruv va saqlashni ta'minlaydigan ma'lumotlar to'plami. Relyatsion model ma'lumotlarni jadvallar (qator va ustunlar) shaklida ifodalaydi, jadvallar esa umumiy kalitlar orqali bog'lanadi.\n\n## SQLite haqida\n\nSQLite — alohida server talab qilmaydigan, bitta faylda saqlanadigan yengil ma'lumotlar bazasi bo'lib, kichik va o'rta loyihalar uchun juda qulay. Python'ning standart kutubxonasida sqlite3 moduli mavjud bo'lib, u orqali bazaga ulanish, jadval yaratish va SQL so'rovlarini bajarish mumkin.\n\n## Asosiy amallar\n\n| Amal | SQL buyrug'i |\n|---|---|\n| Jadval yaratish | CREATE TABLE |\n| Ma'lumot qo'shish | INSERT INTO |\n| Ma'lumot o'qish | SELECT |\n| O'zgarishlarni saqlash | commit() |",
    "cpp_example": "#include <iostream>\n#include <sqlite3.h>\nusing namespace std;\n\nint main() {\n    sqlite3* db;\n    sqlite3_open(\"universitet.db\", &db);\n\n    const char* createSql = \"CREATE TABLE IF NOT EXISTS talabalar (\"\n                             \"id INTEGER PRIMARY KEY, ism TEXT, ball INTEGER)\";\n    sqlite3_exec(db, createSql, nullptr, nullptr, nullptr);\n\n    const char* insertSql = \"INSERT INTO talabalar (ism, ball) VALUES ('Aziz', 92)\";\n    sqlite3_exec(db, insertSql, nullptr, nullptr, nullptr);\n\n    sqlite3_close(db);\n    return 0;\n}",
    "python_example": "import sqlite3\n\nconn = sqlite3.connect(\"universitet.db\")\ncursor = conn.cursor()\n\ncursor.execute(\"\"\"\nCREATE TABLE IF NOT EXISTS talabalar (\n    id INTEGER PRIMARY KEY,\n    ism TEXT,\n    ball INTEGER\n)\n\"\"\")\n\ncursor.execute(\"INSERT INTO talabalar (ism, ball) VALUES (?, ?)\", (\"Aziz\", 92))\nconn.commit()\n\ncursor.execute(\"SELECT * FROM talabalar\")\nfor row in cursor.fetchall():\n    print(row)\n\nconn.close()",
    "kotlin_example": "import java.sql.DriverManager\n\nfun main() {\n    val conn = DriverManager.getConnection(\"jdbc:sqlite:universitet.db\")\n    val stmt = conn.createStatement()\n\n    stmt.execute(\"CREATE TABLE IF NOT EXISTS talabalar (id INTEGER PRIMARY KEY, ism TEXT, ball INTEGER)\")\n    stmt.execute(\"INSERT INTO talabalar (ism, ball) VALUES ('Aziz', 92)\")\n\n    val rs = stmt.executeQuery(\"SELECT * FROM talabalar\")\n    while (rs.next()) {\n        println(\"${rs.getString(\"ism\")}: ${rs.getInt(\"ball\")}\")\n    }\n    conn.close()\n}",
    "order_num": 12
  },
  {
    "title": "CRUD amallari: Create, Read, Update, Delete",
    "content": "CRUD — har qanday ma'lumotlar bazasi bilan ishlashning to'rtta asosiy amali: Create (yaratish/qo'shish), Read (o'qish), Update (yangilash) va Delete (o'chirish). Bu amallar SQL'da mos ravishda INSERT, SELECT, UPDATE va DELETE buyruqlari orqali bajariladi.\n\n## CRUD va SQL buyruqlari\n\n| CRUD | SQL buyrug'i | Misol |\n|---|---|---|\n| Create | INSERT INTO | Yangi talaba qo'shish |\n| Read | SELECT | Talabalar ro'yxatini olish |\n| Update | UPDATE ... SET | Ballni yangilash |\n| Delete | DELETE FROM | Talabani o'chirish |\n\nUPDATE va DELETE buyruqlarida WHERE sharti muhim — u bo'lmasa, jadvaldagi BARCHA qatorlar o'zgartiriladi yoki o'chiriladi. Tranzaksiya (commit/rollback) — bir nechta amalni bir butun sifatida bajarish, xato yuz bersa hammasini bekor qilish imkonini beradi.",
    "cpp_example": "#include <sqlite3.h>\nusing namespace std;\n\nint main() {\n    sqlite3* db;\n    sqlite3_open(\"universitet.db\", &db);\n\n    sqlite3_exec(db, \"INSERT INTO talabalar (ism, ball) VALUES ('Laylo', 88)\", 0, 0, 0);\n    sqlite3_exec(db, \"UPDATE talabalar SET ball = 95 WHERE ism = 'Aziz'\", 0, 0, 0);\n    sqlite3_exec(db, \"DELETE FROM talabalar WHERE ball < 50\", 0, 0, 0);\n\n    sqlite3_close(db);\n    return 0;\n}",
    "python_example": "import sqlite3\nconn = sqlite3.connect(\"universitet.db\")\ncursor = conn.cursor()\n\n# CREATE\ncursor.execute(\"INSERT INTO talabalar (ism, ball) VALUES (?, ?)\", (\"Laylo\", 88))\n\n# UPDATE\ncursor.execute(\"UPDATE talabalar SET ball = ? WHERE ism = ?\", (95, \"Aziz\"))\n\n# DELETE\ncursor.execute(\"DELETE FROM talabalar WHERE ball < 50\")\n\nconn.commit()\n\n# READ\ncursor.execute(\"SELECT ism, ball FROM talabalar\")\nfor ism, ball in cursor.fetchall():\n    print(f\"{ism}: {ball}\")\n\nconn.close()",
    "kotlin_example": "import java.sql.DriverManager\n\nfun main() {\n    val conn = DriverManager.getConnection(\"jdbc:sqlite:universitet.db\")\n    val stmt = conn.createStatement()\n\n    stmt.execute(\"INSERT INTO talabalar (ism, ball) VALUES ('Laylo', 88)\")\n    stmt.execute(\"UPDATE talabalar SET ball = 95 WHERE ism = 'Aziz'\")\n    stmt.execute(\"DELETE FROM talabalar WHERE ball < 50\")\n\n    conn.close()\n}",
    "order_num": 13
  },
  {
    "title": "SQL so'rovlari yordamida ma'lumotlarni filtrlash",
    "content": "Murakkab SQL so'rovlari ma'lumotlarni filtrlash, saralash va guruhlash imkonini beradi. WHERE sharti qatorlarni filtrlaydi, ORDER BY natijani saralaydi, LIMIT esa natijalar sonini cheklaydi.\n\n## Muhim SQL kalit so'zlari\n\n| Kalit so'z | Vazifasi |\n|---|---|\n| WHERE | Shartga mos qatorlarni tanlash |\n| BETWEEN / IN / LIKE | Diapazon, ro'yxat, andoza bo'yicha qidirish |\n| GROUP BY | Qatorlarni guruhlarga bo'lish |\n| HAVING | Guruhlangan natijani filtrlash |\n| JOIN | Bir nechta jadvalni birlashtirish |\n\nMuhim farq: WHERE guruhlashdan OLDIN, HAVING esa guruhlashdan KEYIN filtrlaydi — shu sababli agregat funksiya (COUNT, AVG, SUM) natijasi bo'yicha filtrlash uchun faqat HAVING ishlatiladi.",
    "cpp_example": "#include <sqlite3.h>\n#include <iostream>\nusing namespace std;\n\nstatic int callback(void*, int argc, char** argv, char**) {\n    for (int i = 0; i < argc; i++) cout << argv[i] << \" \";\n    cout << endl;\n    return 0;\n}\n\nint main() {\n    sqlite3* db;\n    sqlite3_open(\"universitet.db\", &db);\n\n    const char* sql = \"SELECT ism, ball FROM talabalar WHERE ball >= 70 \"\n                       \"ORDER BY ball DESC LIMIT 5\";\n    sqlite3_exec(db, sql, callback, 0, 0);\n\n    sqlite3_close(db);\n    return 0;\n}",
    "python_example": "import sqlite3\nconn = sqlite3.connect(\"universitet.db\")\ncursor = conn.cursor()\n\n# Filtrlash va saralash\ncursor.execute(\"\"\"\n    SELECT ism, ball FROM talabalar\n    WHERE ball >= 70\n    ORDER BY ball DESC\n    LIMIT 5\n\"\"\")\nfor row in cursor.fetchall():\n    print(row)\n\n# Guruhlash va agregat funksiya\ncursor.execute(\"\"\"\n    SELECT COUNT(*) as soni, AVG(ball) as ortacha\n    FROM talabalar\n    WHERE ball >= 60\n\"\"\")\nprint(cursor.fetchone())\nconn.close()",
    "kotlin_example": "import java.sql.DriverManager\n\nfun main() {\n    val conn = DriverManager.getConnection(\"jdbc:sqlite:universitet.db\")\n    val stmt = conn.createStatement()\n\n    val rs = stmt.executeQuery(\n        \"SELECT ism, ball FROM talabalar WHERE ball >= 70 ORDER BY ball DESC LIMIT 5\"\n    )\n    while (rs.next()) {\n        println(\"${rs.getString(\"ism\")}: ${rs.getInt(\"ball\")}\")\n    }\n    conn.close()\n}",
    "order_num": 14
  },
  {
    "title": "Kutubxona tushunchasi. Ma'lumotlar tahlili (pandas)",
    "content": "Kutubxona (library) — tayyor funksiya va vositalar to'plami bo'lib, dasturchiga murakkab vazifalarni noldan yozmasdan hal qilish imkonini beradi. pandas — Python'da ma'lumotlar tahlili uchun eng mashhur kutubxona bo'lib, jadval ko'rinishidagi ma'lumotlar (DataFrame) bilan qulay ishlash imkonini beradi.\n\n## pandas'ning asosiy tuzilmalari\n\n| Tuzilma | Tavsif |\n|---|---|\n| Series | Bir o'lchamli, indekslangan ma'lumotlar qatori |\n| DataFrame | Ikki o'lchamli jadval (qator + ustun) |\n\nDataFrame CSV fayldan (pd.read_csv), lug'atdan yoki ro'yxatdan yaratilishi mumkin. Statistik tahlil uchun .describe(), .mean(), .groupby() kabi metodlar, vizualizatsiya uchun esa matplotlib kutubxonasi (import matplotlib.pyplot as plt) ishlatiladi.\n\nBu mavzu Python ekotizimiga xos bo'lgani uchun C++ va Kotlin'da to'g'ridan-to'g'ri pandas analogi mavjud emas — quyida shu tilarda jadval ma'lumotlarini qo'lda qayta ishlashning soddalashtirilgan namunasi keltirilgan.",
    "cpp_example": "#include <iostream>\n#include <vector>\n#include <string>\n#include <numeric>\nusing namespace std;\n\nstruct Student { string name; int score; };\n\nint main() {\n    vector<Student> data = {{\"Aziz\", 92}, {\"Laylo\", 88}, {\"Bobur\", 76}};\n\n    double sum = 0;\n    for (auto& s : data) {\n        cout << s.name << \": \" << s.score << endl;\n        sum += s.score;\n    }\n    cout << \"O'rtacha ball: \" << sum / data.size() << endl;\n    return 0;\n}",
    "python_example": "import pandas as pd\n\ndata = {\n    \"ism\": [\"Aziz\", \"Laylo\", \"Bobur\"],\n    \"ball\": [92, 88, 76],\n}\ndf = pd.DataFrame(data)\n\nprint(df)\nprint(\"O'rtacha ball:\", df[\"ball\"].mean())\nprint(df[df[\"ball\"] >= 80])\n\ndf.to_csv(\"natijalar.csv\", index=False)",
    "kotlin_example": "data class Student(val name: String, val score: Int)\n\nfun main() {\n    val data = listOf(Student(\"Aziz\", 92), Student(\"Laylo\", 88), Student(\"Bobur\", 76))\n\n    data.forEach { println(\"${it.name}: ${it.score}\") }\n\n    val average = data.map { it.score }.average()\n    println(\"O'rtacha ball: $average\")\n\n    val topStudents = data.filter { it.score >= 80 }\n    println(topStudents)\n}",
    "order_num": 15
  }
]

async function main() {
  console.log('Joriy ma\'lumotlar bazasidan o\'qilmoqda...')

  const existingTopics = (await redis.get('topics')) || []
  const users = (await redis.get('users')) || []

  const teacher = users.find(u => u.role === 'teacher')
  if (!teacher) {
    console.error('XATO: bazada o\'qituvchi (teacher) topilmadi. Avval kamida bitta o\'qituvchi hisobi yarating.')
    process.exit(1)
  }

  const existingPythonTopics = existingTopics.filter(t => t.course_id === 'python')
  const existingTitles = new Set(existingPythonTopics.map(t => t.title))

  const alreadyAdded = NEW_TOPICS.filter(t => existingTitles.has(t.title))
  if (alreadyAdded.length === NEW_TOPICS.length) {
    console.log('Barcha 15 mavzu allaqachon bazada mavjud — qayta qo\'shilmadi (skript ilgari muvaffaqiyatli ishga tushirilgan).')
    return
  }
  const toInsert = NEW_TOPICS.filter(t => !existingTitles.has(t.title))
  if (alreadyAdded.length > 0) {
    console.log('Diqqat: ' + alreadyAdded.length + " ta mavzu allaqachon mavjud, ular qayta qo'shilmaydi.")
  }

  const startOrder = existingPythonTopics.length > 0
    ? Math.max(...existingPythonTopics.map(t => t.order_num)) 
    : 0
  const nextId = existingTopics.length > 0
    ? Math.max(...existingTopics.map(t => t.id)) + 1
    : 1

  const now = new Date().toISOString()
  const topicsToAdd = toInsert.map((t, i) => ({
    id: nextId + i,
    course_id: 'python',
    title: t.title,
    content: t.content,
    cpp_example: t.cpp_example,
    python_example: t.python_example,
    kotlin_example: t.kotlin_example,
    order_num: startOrder + t.order_num,
    created_by: teacher.id,
    created_at: now,
  }))

  const updatedTopics = [...existingTopics, ...topicsToAdd]
  await redis.set('topics', updatedTopics)

  console.log(`✅ ${topicsToAdd.length} ta mavzu muvaffaqiyatli qo'shildi (Python kursi):`)
  topicsToAdd.forEach(t => console.log(`   ${t.order_num}. ${t.title}`))
  console.log('Saytni yangilab (F5), Python kursini oching — mavzular ko\'rinishi kerak.')
}

main().catch(err => {
  console.error('Kutilmagan xatolik:', err)
  process.exit(1)
})

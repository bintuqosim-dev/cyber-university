#!/usr/bin/env node
/**
 * C++ kursi uchun C2-C5 mavzularini va ularga tegishli amaliyot masalalarini
 * Upstash Redis bazasiga qo'shadi.
 *
 * Ishga tushirish: cyber-university loyiha papkasida (.env.local mavjud joyda):
 *   node seed-cpp-c2-c5.js
 *
 * Xavfsizlik: bu skriptni qayta-qayta ishga tushirish mumkin —
 *  - Mavzular: agar C2/C3/C4/C5 prefiksli mavzu allaqachon mavjud bo'lsa, u o'chirilib,
 *    yangi (shu skriptdagi) versiya bilan almashtiriladi (takrorlanish bo'lmaydi).
 *  - Masalalar: agar bir xil sarlavhali masala allaqachon mavjud bo'lsa, o'tkazib yuboriladi.
 */
const fs = require('fs')
const path = require('path')

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

const COURSE_ID = 'cpp'
const NEW_TOPICS = [
  {
    "code": "C2",
    "title": "C2. Kirish/chiqish oqimlari va klasslarga kirish",
    "content": "\"C++ga Kirish\" mavzusida biz `cin` va `cout` yordamida oddiy kiritish-chiqarishni ko'rgan edik. Bu mavzuda esa chiqishni **formatlashni**, **fayllar bilan ishlashni** o'rganamiz — va aynan shu yerda C++'ning eng muhim tushunchasi — **klass (class)** va **obyekt (object)** — bilan birinchi marta amaliy tanishamiz.\n\n## Formatlangan chiqish (iomanip)\n\n`<iomanip>` kutubxonasi sonlarni chiroyli ko'rinishda chiqarish uchun **manipulyatorlar** taqdim etadi:\n\n| Manipulyator | Vazifasi |\n|---|---|\n| `setw(n)` | Keyingi chiqariladigan qiymat uchun kamida `n` ta belgi joy ajratadi (o'ngga tekislaydi) |\n| `setprecision(n)` | O'nli kasr sonlar uchun `n` ta raqamgacha aniqlik belgilaydi |\n| `fixed` | Sonni doim o'nlik kasr shaklida chiqarishga majbur qiladi (masalan, 3.10, ilmiy shaklda emas) |\n| `showpoint` | Butun songa ham o'nlik nuqta va nollarni ko'rsatadi |\n\nMasalan, `cout << fixed << setprecision(2) << 3.14159;` natijasi: `3.14` bo'ladi — bu pul miqdorlarini yoki o'lchov natijalarini chiqarishda juda muhim.\n\n## Fayllar bilan ishlash: ifstream va ofstream\n\nHozirgacha dastur ma'lumotlarni faqat klaviaturadan (`cin`) olib, ekranga (`cout`) chiqargan. Amaliyotda ma'lumotlar ko'pincha **fayllarda** saqlanadi. C++'da fayl bilan ishlash uchun ikkita maxsus tur ishlatiladi:\n\n- **`ifstream`** (\"input file stream\") — fayldan o'qish uchun\n- **`ofstream`** (\"output file stream\") — faylga yozish uchun\n\n```cpp\n#include <fstream>\nifstream fin;\nfin.open(\"malumot.txt\");\n// yoki qisqacha: ifstream fin(\"malumot.txt\");\n```\n\nFayl bilan ishlash tugagach, uni albatta `fin.close()` orqali yopish kerak.\n\n## Bu yerda \"klass\" nima uchun paydo bo'ladi?\n\nE'tibor bering: `ifstream` va `ofstream` — bu oddiy o'zgaruvchi turlari (`int`, `double` kabi) emas! Ular **klass** — ya'ni o'z ichida ham ma'lumot (masalan, fayl qayerda ochilgani, qayerigacha o'qilgani), ham funksiyalar (`open()`, `close()`, `eof()`, `fail()`) birlashtirilgan murakkab turdir. `fin` — bu `ifstream` klassining bitta **obyekti** (nusxasi).\n\nAslida, siz \"C++ga Kirish\" mavzusidanoq klasslar bilan ishlab kelasiz — `cin` va `cout`ning o'zi ham `istream` va `ostream` klasslarining tayyor obyektlari! `cin.get()`, `cin.ignore()`, `cin.fail()` — bularning barchasi **member function** (klassga tegishli funksiya) chaqiruvlaridir, xuddi `nuqta (.)` orqali chaqirilgani kabi.\n\n| Tushuncha | Ta'rifi | Misol |\n|---|---|---|\n| Klass (class) | Ma'lumot va funksiyalarni birlashtiruvchi foydalanuvchi belgilagan tur | `ifstream`, `ofstream`, `string` |\n| Obyekt (object) | Klassning aniq bir nusxasi (instance) | `fin`, `fout`, `cin` |\n| Member function | Obyektga tegishli, nuqta orqali chaqiriladigan funksiya | `fin.eof()`, `fin.close()` |\n\nBu — obyektga yo'naltirilgan dasturlash (OOP) sari birinchi qadam. DSA kursimizda `istream`/`ostream`ni \"tayyor klass\" sifatida ishlatib kelgan bo'lsak, C++ kursining keyingi bosqichlarida **o'zimiz klass yaratishni** o'rganamiz.\n\n## Fayl oxirini aniqlash: eof()\n\nFayldan qancha ma'lumot borligini oldindan bilmasak, `while (!fin.eof())` yoki, yanada to'g'rirog'i, o'qish amalining o'zini shart sifatida tekshirish (`while (fin >> son)`) orqali fayl oxirigacha o'qishimiz mumkin.\n\n> **Diqqat! Odatiy xato:** `while (!fin.eof())` shaklidagi tekshiruv ko'pincha oxirgi qiymatni ikki marta o'qib qo'yishga (yoki bo'sh qiymatni qayta ishlashga) sabab bo'ladi, chunki `eof()` fayl oxiriga **yetilgandan keyingina** `true` qaytaradi. To'g'ri usul: `while (fin >> qiymat) { ... }` — bu o'qish muvaffaqiyatli bo'lgandagina davom etadi.\n\n> **Professional maslahat:** Faylni ochgandan so'ng har doim `if (fin.fail())` yoki `if (!fin.is_open())` orqali fayl muvaffaqiyatli ochilganini tekshiring — fayl mavjud bo'lmasa, dastur \"jim\" ishlamay qolishi mumkin, xato xabarisiz.",
    "cpp_example": "# 1-namuna — Formatlangan chiqish (setw, setprecision, fixed)\n\n#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double narx = 15000.5;\n    double som = 3.14159;\n\n    cout << fixed << setprecision(2);\n    cout << \"Narx: \" << setw(10) << narx << \" so'm\" << endl;\n    cout << \"Pi:   \" << setw(10) << som << endl;\n\n    cout << setprecision(4);\n    cout << \"Pi (4 xona): \" << som << endl;\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Faylga yozish va fayldan o'qish (ofstream / ifstream)\n\n#include <iostream>\n#include <fstream>\nusing namespace std;\n\nint main() {\n    ofstream fout(\"talabalar.txt\");\n    fout << \"Ali 85\" << endl;\n    fout << \"Vali 92\" << endl;\n    fout << \"Guli 78\" << endl;\n    fout.close();\n\n    ifstream fin(\"talabalar.txt\");\n    if (!fin.is_open()) {\n        cout << \"Faylni ochib bo'lmadi!\" << endl;\n        return 1;\n    }\n\n    string ism;\n    int ball;\n    while (fin >> ism >> ball) {\n        cout << ism << \" ning bali: \" << ball << endl;\n    }\n    fin.close();\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — cin obyekti bilan member function'lardan foydalanish\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Yoshingizni kiriting: \";\n    int yosh;\n    cin >> yosh;\n\n    if (cin.fail()) {\n        cout << \"Xato! Butun son kiritilishi kerak edi.\" << endl;\n        cin.clear();\n        cin.ignore(1000, '\\n');\n        return 1;\n    }\n\n    cin.ignore(); // qolgan '\\n' belgisini tashlab yuborish\n    cout << \"To'liq ismingizni kiriting: \";\n    string ism;\n    getline(cin, ism);\n\n    cout << ism << \", siz \" << yosh << \" yoshdasiz.\" << endl;\n    return 0;\n}",
    "python_example": "# 1-namuna — Formatlangan chiqish\n\nnarx = 15000.5\nsom = 3.14159\n\nprint(f\"Narx: {narx:10.2f} so'm\")\nprint(f\"Pi:   {som:10.2f}\")\nprint(f\"Pi (4 xona): {som:.4f}\")\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Faylga yozish va fayldan o'qish\n\nwith open(\"talabalar.txt\", \"w\") as fout:\n    fout.write(\"Ali 85\\n\")\n    fout.write(\"Vali 92\\n\")\n    fout.write(\"Guli 78\\n\")\n\ntry:\n    with open(\"talabalar.txt\", \"r\") as fin:\n        for line in fin:\n            ism, ball = line.split()\n            print(f\"{ism} ning bali: {ball}\")\nexcept FileNotFoundError:\n    print(\"Faylni ochib bo'lmadi!\")\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Kiritishni tekshirish (Python'da try/except C++'ning cin.fail()'iga mos keladi)\n\ntry:\n    yosh = int(input(\"Yoshingizni kiriting: \"))\nexcept ValueError:\n    print(\"Xato! Butun son kiritilishi kerak edi.\")\n    exit(1)\n\nism = input(\"To'liq ismingizni kiriting: \")\nprint(f\"{ism}, siz {yosh} yoshdasiz.\")",
    "kotlin_example": "# 1-namuna — Formatlangan chiqish\n\nfun main() {\n    val narx = 15000.5\n    val som = 3.14159\n\n    println(\"Narx: \" + String.format(\"%10.2f\", narx) + \" so'm\")\n    println(\"Pi:   \" + String.format(\"%10.2f\", som))\n    println(\"Pi (4 xona): \" + String.format(\"%.4f\", som))\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Faylga yozish va fayldan o'qish\n\nimport java.io.File\n\nfun main() {\n    val file = File(\"talabalar.txt\")\n    file.writeText(\"Ali 85\nVali 92\nGuli 78\n\")\n\n    if (!file.exists()) {\n        println(\"Faylni ochib bo'lmadi!\")\n        return\n    }\n\n    file.forEachLine { line ->\n        val (ism, ball) = line.split(\" \")\n        println(\"$ism ning bali: $ball\")\n    }\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Kiritishni tekshirish\n\nfun main() {\n    print(\"Yoshingizni kiriting: \")\n    val yosh = readLine()?.toIntOrNull()\n    if (yosh == null) {\n        println(\"Xato! Butun son kiritilishi kerak edi.\")\n        return\n    }\n\n    print(\"To'liq ismingizni kiriting: \")\n    val ism = readLine() ?: \"\"\n    println(\"$ism, siz $yosh yoshdasiz.\")\n}"
  },
  {
    "code": "C3",
    "title": "C3. Massivlar (Arrays)",
    "content": "Massiv (array) — bir xil turdagi elementlarni bitta nom ostida, ketma-ket xotirada saqlovchi ma'lumotlar tuzilmasidir. Agar sizga 5 ta, 100 ta yoki 1000 ta bir xil turdagi qiymatni saqlash kerak bo'lsa (masalan, talabalar bali), har biriga alohida o'zgaruvchi nomi berish (`ball1, ball2, ball3...`) amaliy emas — massiv aynan shu muammoni yechadi.\n\n## Deklaratsiya va indekslash\n\n```cpp\nint ball[5]; // 5 ta int qiymatni saqlovchi massiv\n```\n\nBu `ball[0]`, `ball[1]`, `ball[2]`, `ball[3]`, `ball[4]` — beshta \"indekslangan o'zgaruvchi\" yaratishga teng. **C++'da indekslar har doim 0 dan boshlanadi**, oxirgi indeks esa `o'lcham - 1` ga teng.\n\n> **Diqqat! Odatiy xato (\"Pitfall\"):** `int ball[5]` deklaratsiya qilingan massivda `ball[5]`ga murojaat qilish — bu massiv chegarasidan tashqariga chiqish (index out of range). C++ bu xatoni kompilyatsiya vaqtida ushlamaydi — dastur noto'g'ri natija berishi yoki qulashi mumkin (\"undefined behavior\"). Har doim `0` dan `o'lcham-1`gacha bo'lgan oraliqni qat'iy nazorat qiling.\n\n## Massivni initsializatsiya qilish\n\n```cpp\nint ball[5] = {85, 92, 78, 90, 88};      // barcha elementlar berilgan\nint nollar[5] = {0};                       // birinchisi 0, qolganlari avtomatik 0\nint son[] = {1, 2, 3};                     // o'lcham avtomatik aniqlanadi (3)\n```\n\n## Massivlarni funksiyalarga uzatish\n\nC++'da massiv funksiyaga uzatilganda, u **avtomatik ravishda havola (reference) orqali** uzatiladi — massivning nusxasi emas, balki asl massivning o'zi funksiya ichida o'zgartiriladi. Shuning uchun, agar funksiya massivni **o'zgartirmasligi kerak** bo'lsa, buni aniq bildirish uchun `const` kalit so'zi ishlatiladi:\n\n```cpp\nvoid chiqar(const int arr[], int hajmi); // arr o'zgartirilmasligi kafolatlanadi\nvoid toldir(int arr[], int hajmi);         // arr o'zgartirilishi mumkin\n```\n\n> **Diqqat!** Massiv funksiyaga uzatilganda uning **hajmini** ham alohida parametr sifatida uzatish kerak — chunki funksiya ichida `sizeof` orqali massiv hajmini bilib bo'lmaydi (u faqat bitta pointerga aylanadi).\n\n## Qisman to'ldirilgan massivlar (Partially Filled Arrays)\n\nKo'pincha massivning maksimal hajmi bilan unda **haqiqatda nechta element borligi** boshqa-boshqa bo'ladi (masalan, foydalanuvchi nechta son kiritishini oldindan bilmaymiz). Bunday holda ikkita narsani birga saqlash kerak: massivning o'zi va undagi **haqiqiy elementlar soni** (alohida `int` o'zgaruvchida).\n\n```cpp\nconst int MAX = 100;\nint royxat[MAX];\nint royxatHajmi = 0; // hozircha bo'sh\n\nwhile (cin >> son && royxatHajmi < MAX) {\n    royxat[royxatHajmi] = son;\n    royxatHajmi++;\n}\n// Endi faqat royxat[0] dan royxat[royxatHajmi-1] gacha bo'lgan qism haqiqiy ma'lumot\n```\n\n## Massivda qidirish va saralash — qisqacha eslatma\n\nDSA kursimizning A7 (qidirish/saralash) va A8 (Bubble/Selection/Insertion Sort) mavzularida bu algoritmlarni chuqur o'rgangan edik. Massiv — aynan shu algoritmlarning \"ishlash maydoni\". Agar hali DSA kursini boshlamagan bo'lsangiz, bu yerda faqat asosiy g'oyani eslatib o'tamiz: **chiziqli qidirish** massivni boshidan oxirigacha aylanib chiqadi (O(n)), **Bubble Sort** esa qo'shni elementlarni taqqoslab almashtirish orqali massivni saralaydi (O(n²)).\n\n## Ko'p o'lchovli massivlar (2D array)\n\nJadval shaklidagi ma'lumotlar (masalan, sinf jurnali: har bir talaba uchun bir necha baho) uchun ikki o'lchovli massiv ishlatiladi:\n\n```cpp\nint jadval[3][4]; // 3 qator, 4 ustun (masalan, 3 talaba, har biri uchun 4 baho)\njadval[0][0] = 85; // 1-talabaning 1-bahosi\n```\n\nIkki o'lchovli massiv ustida ishlashda ichma-ich `for` sikllari ishlatiladi: tashqi sikl qatorlar bo'yicha, ichki sikl esa har bir qatordagi ustunlar bo'yicha yuradi.\n\n> **Professional maslahat:** Zamonaviy C++'da statik massivlar o'rniga ko'pincha `std::vector` (keyingi mavzuda ko'ramiz) ishlatiladi, chunki u dinamik hajmga ega va hajmini o'z ichida saqlaydi (`size()` orqali). Lekin klassik massivning mantiqini tushunish — `vector`, `string` va boshqa barcha chiziqli tuzilmalarning negizini tushunish demakdir.",
    "cpp_example": "# 1-namuna — Massiv bilan asosiy ishlar: to'ldirish, yig'indi, o'rtacha\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    const int HAJM = 5;\n    int ball[HAJM] = {85, 92, 78, 90, 88};\n\n    int yigindi = 0;\n    for (int i = 0; i < HAJM; i++) {\n        yigindi += ball[i];\n    }\n    double ortacha = static_cast<double>(yigindi) / HAJM;\n\n    cout << \"Yig'indi: \" << yigindi << endl;\n    cout << \"O'rtacha: \" << ortacha << endl;\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Massivni funksiyaga uzatish (const bilan) va eng kattasini topish\n\n#include <iostream>\nusing namespace std;\n\nint findMax(const int arr[], int hajmi) {\n    int max = arr[0];\n    for (int i = 1; i < hajmi; i++) {\n        if (arr[i] > max) max = arr[i];\n    }\n    return max;\n}\n\nvoid chiqar(const int arr[], int hajmi) {\n    for (int i = 0; i < hajmi; i++) cout << arr[i] << \" \";\n    cout << endl;\n}\n\nint main() {\n    int ball[] = {85, 92, 78, 90, 88};\n    int hajmi = 5;\n\n    chiqar(ball, hajmi);\n    cout << \"Eng yuqori ball: \" << findMax(ball, hajmi) << endl;\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Qisman to'ldirilgan massiv va ikki o'lchovli massiv\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Qisman to'ldirilgan massiv\n    const int MAX = 10;\n    int royxat[MAX];\n    int royxatHajmi = 0;\n    int son;\n\n    cout << \"Sonlarni kiriting (to'xtatish uchun -1): \";\n    while (cin >> son && son != -1 && royxatHajmi < MAX) {\n        royxat[royxatHajmi] = son;\n        royxatHajmi++;\n    }\n\n    cout << \"Kiritilgan \" << royxatHajmi << \" ta son: \";\n    for (int i = 0; i < royxatHajmi; i++) cout << royxat[i] << \" \";\n    cout << endl;\n\n    // Ikki o'lchovli massiv\n    int jadval[2][3] = { {85, 90, 78}, {92, 88, 95} };\n    cout << \"Jadval:\" << endl;\n    for (int i = 0; i < 2; i++) {\n        for (int j = 0; j < 3; j++) cout << jadval[i][j] << \" \";\n        cout << endl;\n    }\n    return 0;\n}",
    "python_example": "# 1-namuna — Ro'yxat (Python'da massiv o'rnini list bosadi): yig'indi, o'rtacha\n\nball = [85, 92, 78, 90, 88]\n\nyigindi = sum(ball)\nortacha = yigindi / len(ball)\n\nprint(\"Yig'indi:\", yigindi)\nprint(\"O'rtacha:\", ortacha)\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Ro'yxatni funksiyaga uzatish va eng kattasini topish\n\ndef find_max(arr):\n    maximum = arr[0]\n    for x in arr[1:]:\n        if x > maximum:\n            maximum = x\n    return maximum\n\ndef chiqar(arr):\n    print(\" \".join(str(x) for x in arr))\n\nball = [85, 92, 78, 90, 88]\nchiqar(ball)\nprint(\"Eng yuqori ball:\", find_max(ball))\n# Eslatma: Python'da list o'z hajmini o'zi biladi (len()), C++dagi kabi\n# alohida hajm parametri uzatish shart emas.\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Dinamik to'ldirilgan ro'yxat va ikki o'lchovli ro'yxat\n\nroyxat = []\nprint(\"Sonlarni kiriting (to'xtatish uchun -1):\")\nwhile True:\n    son = int(input())\n    if son == -1:\n        break\n    royxat.append(son)\n\nprint(f\"Kiritilgan {len(royxat)} ta son:\", royxat)\n\n# Ikki o'lchovli ro'yxat (jadval)\njadval = [[85, 90, 78], [92, 88, 95]]\nprint(\"Jadval:\")\nfor qator in jadval:\n    print(\" \".join(str(x) for x in qator))",
    "kotlin_example": "# 1-namuna — Massiv bilan asosiy ishlar: to'ldirish, yig'indi, o'rtacha\n\nfun main() {\n    val ball = intArrayOf(85, 92, 78, 90, 88)\n\n    val yigindi = ball.sum()\n    val ortacha = yigindi.toDouble() / ball.size\n\n    println(\"Yig'indi: $yigindi\")\n    println(\"O'rtacha: $ortacha\")\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Massivni funksiyaga uzatish va eng kattasini topish\n\nfun findMax(arr: IntArray): Int {\n    var max = arr[0]\n    for (x in arr) if (x > max) max = x\n    return max\n}\n\nfun chiqar(arr: IntArray) {\n    println(arr.joinToString(\" \"))\n}\n\nfun main() {\n    val ball = intArrayOf(85, 92, 78, 90, 88)\n    chiqar(ball)\n    println(\"Eng yuqori ball: ${findMax(ball)}\")\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Dinamik to'ldirilgan ro'yxat va ikki o'lchovli massiv\n\nfun main() {\n    val royxat = mutableListOf<Int>()\n    println(\"Sonlarni kiriting (to'xtatish uchun -1):\")\n    while (true) {\n        val son = readLine()!!.toInt()\n        if (son == -1) break\n        royxat.add(son)\n    }\n    println(\"Kiritilgan ${royxat.size} ta son: $royxat\")\n\n    // Ikki o'lchovli massiv (jadval)\n    val jadval = arrayOf(intArrayOf(85, 90, 78), intArrayOf(92, 88, 95))\n    println(\"Jadval:\")\n    for (qator in jadval) println(qator.joinToString(\" \"))\n}"
  },
  {
    "code": "C4",
    "title": "C4. Satrlar va Vector: C-string, std::string va std::vector",
    "content": "C++'da matn va dinamik ro'yxatlar bilan ishlash uchun uchta yondashuv mavjud: eski, C tilidan meros bo'lib qolgan **C-string**, zamonaviy **std::string** klassi, hamda dinamik massiv o'rnini bosuvchi **std::vector**. Bu mavzuda barcha uchtasini, ularning farqlarini va qachon qaysi birini ishlatishni o'rganamiz.\n\n## 1. C-string — belgilar massivi\n\nC-string — bu, aslida, oddiy `char` massivi, faqat oxirida maxsus **null-belgi `'\\0'`** (nol-terminator) bilan tugaydi. Masalan, `\"Hi\"` so'zi xotirada quyidagicha saqlanadi:\n\n| Indeks | 0 | 1 | 2 |\n|---|---|---|---|\n| Qiymat | 'H' | 'i' | '\\0' |\n\n```cpp\nchar ism[10] = \"Ali\";       // 10 ta joy ajratiladi, \"Ali\" + '\\0' = 4 tasi ishlatiladi\nchar qisqa[] = \"Vali\";       // hajm avtomatik: 5 (4 harf + '\\0')\n```\n\n`'\\0'` belgisi qatorning **qayerda tugashini** bildiradi — shuning uchun `char ism[5]` massivida ko'pi bilan 4 ta haqiqiy belgi saqlash mumkin (5-chisi `'\\0'`ga ajratiladi).\n\n> **Diqqat! Odatiy xato:** `char ism[] = \"abc\";` bilan `char ism[] = {'a','b','c'};` **bir xil emas**! Birinchisida `'\\0'` avtomatik qo'shiladi, ikkinchisida — yo'q. `'\\0'`siz C-string funksiyalari (masalan, `strlen`) qayerda to'xtashni bilmay, xotiraning tasodifiy joylarini o'qib ketishi mumkin.\n\n## 2. std::string — zamonaviy va xavfsiz\n\nC-stringning cheklovlari (qattiq belgilangan hajm, qo'lda `'\\0'` nazorati) tufayli zamonaviy C++'da deyarli har doim `<string>` kutubxonasidagi **std::string** klassi ishlatiladi:\n\n```cpp\n#include <string>\nstring ism = \"Ali\";\nism = ism + \" Valiyev\";       // qatorlarni \"+\" bilan birlashtirish (concatenation)\ncout << ism.length();          // uzunligini bilish — hech qanday '\\0' bilan ovora bo'lish shart emas\n```\n\n`string` klassi o'z ichida hajmni **avtomatik** boshqaradi — massiv to'lib qolishidan yoki `'\\0'`ni unutib qo'yishdan qo'rqish shart emas.\n\n## 3. std::vector — dinamik massiv\n\nMassivlarning asosiy kamchiligi — o'lchami dastur ishga tushgandan keyin o'zgarmasligi edi (C3-mavzuda ko'rgan edik). **std::vector** — aynan shu muammoni yechuvchi, hajmi runtime'da o'zgarib turadigan \"aqlli massiv\":\n\n```cpp\n#include <vector>\nvector<int> royxat;         // bo'sh vector\nroyxat.push_back(10);        // oxiriga element qo'shish — hajm avtomatik o'sadi\nroyxat.push_back(20);\ncout << royxat.size();        // haqiqiy elementlar soni — alohida o'zgaruvchida saqlash shart emas!\nroyxat[0] = 99;               // oddiy massiv kabi indekslash ham ishlaydi\n```\n\nC3-mavzudagi \"qisman to'ldirilgan massiv\" texnikasini eslaysizmi — u yerda hajmni alohida o'zgaruvchida qo'lda kuzatishimiz kerak edi. `vector` bilan bu **shart emas**: `push_back()` avtomatik ravishda hajmni oshiradi va `.size()` doim haqiqiy son qaytaradi.\n\n## Uchtasini solishtirish\n\n| Xususiyat | C-string (`char[]`) | `std::string` | `std::vector` |\n|---|---|---|---|\n| Hajmi | Qat'iy belgilangan | Dinamik (avtomatik o'sadi) | Dinamik (avtomatik o'sadi) |\n| Xavfsizlik | Past ('\\0'ni nazorat qilish kerak) | Yuqori | Yuqori |\n| Element turi | Faqat `char` | Faqat belgilar (matn) | **Istalgan tur** (`int`, `double`, `string`...) |\n| Qo'shish/olib tashlash | Qo'lda, qiyin | `+=`, `append()` orqali oson | `push_back()`, `pop_back()` orqali oson |\n| Qachon ishlatiladi | Kamdan-kam (eski kod, C bilan mos ishlash) | Har doim matn uchun | Har doim dinamik ro'yxat kerak bo'lganda |\n\n> **Professional maslahat:** Amaliy loyihalarda C-string deyarli hech qachon to'g'ridan-to'g'ri ishlatilmaydi — u faqat C tili bilan mos ishlash yoki eski kutubxonalar uchun zarur bo'ladi. Yangi kod yozayotganda har doim `std::string` (matn uchun) va `std::vector` (ro'yxat uchun) ni tanlang — bu zamonaviy C++ dasturlashning \"oltin qoidasi\" hisoblanadi.",
    "cpp_example": "# 1-namuna — C-string bilan ishlash va uning cheklovi\n\n#include <iostream>\n#include <cstring>\nusing namespace std;\n\nint main() {\n    char ism[10] = \"Ali\";\n    cout << \"Ism: \" << ism << endl;\n    cout << \"Uzunligi (strlen): \" << strlen(ism) << endl;\n\n    strcat(ism, \"jon\"); // \"Ali\" ga \"jon\" qo'shiladi -> \"Alijon\"\n    cout << \"Qo'shilgandan keyin: \" << ism << endl;\n\n    // Diqqat: agar natija massiv hajmidan (10) oshib ketsa, xotira buziladi!\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — std::string bilan ishlash\n\n#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string ism = \"Ali\";\n    string familiya = \"Valiyev\";\n\n    string toliqIsm = ism + \" \" + familiya; // oson birlashtirish\n    cout << \"To'liq ism: \" << toliqIsm << endl;\n    cout << \"Uzunligi: \" << toliqIsm.length() << endl;\n    cout << \"Bosh harfi: \" << toliqIsm[0] << endl;\n\n    if (toliqIsm.find(\"Vali\") != string::npos) {\n        cout << \"\\\"Vali\\\" so'zi topildi!\" << endl;\n    }\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — std::vector bilan dinamik ro'yxat\n\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> royxat; // bo'sh boshlaymiz, hajm haqida o'ylash shart emas\n\n    int son;\n    cout << \"Sonlarni kiriting (to'xtatish uchun -1): \";\n    while (cin >> son && son != -1) {\n        royxat.push_back(son); // avtomatik kengayadi\n    }\n\n    cout << \"Kiritilgan \" << royxat.size() << \" ta son: \";\n    for (int i = 0; i < royxat.size(); i++) cout << royxat[i] << \" \";\n    cout << endl;\n\n    royxat.pop_back(); // oxirgi elementni olib tashlash\n    cout << \"Oxirgisini olib tashlagandan keyin hajm: \" << royxat.size() << endl;\n    return 0;\n}",
    "python_example": "# 1-namuna — Python'da satrlar tabiiy ravishda xavfsiz (C-string muammosi yo'q)\n\nism = \"Ali\"\nprint(\"Ism:\", ism)\nprint(\"Uzunligi:\", len(ism))\n\nism = ism + \"jon\"  # Python'da satrlarni birlashtirish hech qanday xavf tug'dirmaydi\nprint(\"Qo'shilgandan keyin:\", ism)\n# Eslatma: Python'da '\\0' terminator yoki hajm cheklovi haqida umuman\n# o'ylash shart emas — bu C-stringning C++'ga xos muammosi.\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Python string metodlari (std::string'ning analogi)\n\nism = \"Ali\"\nfamiliya = \"Valiyev\"\n\ntoliq_ism = ism + \" \" + familiya\nprint(\"To'liq ism:\", toliq_ism)\nprint(\"Uzunligi:\", len(toliq_ism))\nprint(\"Bosh harfi:\", toliq_ism[0])\n\nif \"Vali\" in toliq_ism:\n    print('\"Vali\" so\\'zi topildi!')\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Python list (std::vector'ning analogi)\n\nroyxat = []  # Python'da list har doim dinamik — vector kabi maxsus tur kerak emas\n\nprint(\"Sonlarni kiriting (to'xtatish uchun -1):\")\nwhile True:\n    son = int(input())\n    if son == -1:\n        break\n    royxat.append(son)  # C++'dagi push_back() ga mos keladi\n\nprint(f\"Kiritilgan {len(royxat)} ta son:\", royxat)\n\nroyxat.pop()  # oxirgi elementni olib tashlash (pop_back() ga mos)\nprint(\"Oxirgisini olib tashlagandan keyin hajm:\", len(royxat))",
    "kotlin_example": "# 1-namuna — Kotlin'da String o'zgarmas (immutable), C-string muammosi yo'q\n\nfun main() {\n    var ism = \"Ali\"\n    println(\"Ism: $ism\")\n    println(\"Uzunligi: ${ism.length}\")\n\n    ism = ism + \"jon\" // yangi String obyekti yaratiladi\n    println(\"Qo'shilgandan keyin: $ism\")\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Kotlin String metodlari (std::string'ning analogi)\n\nfun main() {\n    val ism = \"Ali\"\n    val familiya = \"Valiyev\"\n\n    val toliqIsm = \"$ism $familiya\"\n    println(\"To'liq ism: $toliqIsm\")\n    println(\"Uzunligi: ${toliqIsm.length}\")\n    println(\"Bosh harfi: ${toliqIsm[0]}\")\n\n    if (toliqIsm.contains(\"Vali\")) {\n        println(\"\\\"Vali\\\" so'zi topildi!\")\n    }\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Kotlin MutableList (std::vector'ning analogi)\n\nfun main() {\n    val royxat = mutableListOf<Int>() // ArrayList — C++'dagi vector'ga to'g'ridan-to'g'ri mos\n\n    println(\"Sonlarni kiriting (to'xtatish uchun -1):\")\n    while (true) {\n        val son = readLine()!!.toInt()\n        if (son == -1) break\n        royxat.add(son) // C++'dagi push_back() ga mos keladi\n    }\n\n    println(\"Kiritilgan ${royxat.size} ta son: $royxat\")\n\n    royxat.removeAt(royxat.size - 1) // oxirgi elementni olib tashlash (pop_back())\n    println(\"Oxirgisini olib tashlagandan keyin hajm: ${royxat.size}\")\n}"
  },
  {
    "code": "C5",
    "title": "C5. Ko'rsatkichlar va dinamik massivlar (Pointers and Dynamic Arrays)",
    "content": "**Ko'rsatkich (pointer)** — C++'ning eng kuchli, ammo boshlang'ich dasturchilar uchun eng qiyin tushunchalaridan biri. Ko'rsatkich — bu boshqa o'zgaruvchining **xotiradagi manzilini** saqlovchi o'zgaruvchidir. Bu mavzuni tushunish DSA kursimizdagi Bog'langan ro'yxat (A10), Stek/Navbat (A11) va undan keyingi barcha tuzilmalarning (\"Node\" nima ekanligi) negizini tashkil qiladi.\n\n## Xotira manzili va & operatori\n\nHar bir o'zgaruvchi xotirada ma'lum bir **manzilga** ega. `&` operatori (address-of operator) o'zgaruvchining manzilini olish uchun ishlatiladi:\n\n```cpp\nint son = 42;\ncout << &son; // son o'zgaruvchisining xotiradagi manzilini chiqaradi (masalan, 0x7ffee3a4)\n```\n\n## Ko'rsatkich o'zgaruvchisi deklaratsiyasi\n\nKo'rsatkich o'zgaruvchisi `*` belgisi bilan e'lon qilinadi:\n\n```cpp\nint *p;        // p — int turidagi o'zgaruvchiga ko'rsatkich\nint son = 42;\np = &son;       // p endi son'ning manzilini saqlaydi (\"p son'ga ko'rsatadi\")\n```\n\n## Dereferensiya operatori (*)\n\n`*` belgisi ikkinchi ma'noga ega: agar u deklaratsiyada ishlatilsa — \"bu ko'rsatkich\" degani; agar mavjud ko'rsatkich oldida ishlatilsa — **\"ko'rsatkich ko'rsatayotgan o'zgaruvchining o'zi\"** degani (dereferensiya):\n\n```cpp\nint son = 0;\nint *p = &son;\n*p = 42;              // \"p ko'rsatayotgan o'zgaruvchiga 42 yoz\" — bu aslida son = 42 bilan bir xil!\ncout << son;           // 42\ncout << *p;             // 42 — ikkalasi ham bir xil xotira joyini ifodalaydi\n```\n\n### p1 = p2 va *p1 = *p2 orasidagi muhim farq\n\n| Ifoda | Ma'nosi |\n|---|---|\n| `p1 = p2;` | p1 endi **p2 ko'rsatayotgan bir xil manzilga** ko'rsatadi (ikkalasi bir xil narsani \"ko'rsatadi\") |\n| `*p1 = *p2;` | p1 ko'rsatayotgan **o'zgaruvchining qiymati**, p2 ko'rsatayotgan o'zgaruvchining qiymatiga tenglashtiriladi (manzillar o'zgarmaydi, faqat qiymat nusxalanadi) |\n\nBu farqni chalkashtirib yuborish — ko'rsatkichlar bilan ishlashdagi eng keng tarqalgan xato manbai.\n\n> **Diqqat!** Ko'rsatkich — bu manzil, u sonning o'zi emas. `int *p = 100;` kabi kodni yozib bo'lmaydi (100 — bu manzil emas). Ko'rsatkichlar ustida oddiy arifmetik amallar (`+`, `-`) bajarish mumkin, lekin ular \"manzil arifmetikasi\" bo'lib, oddiy sonlar arifmetikasidan farq qiladi.\n\n## Dinamik massivlar: new va delete\n\nC3-mavzuda ko'rganimizdek, oddiy massivning hajmi kompilyatsiya vaqtida qat'iy belgilanadi (`int arr[100]`). Ammo ko'p hollarda hajm faqat dastur ishlab turganda (runtime'da), masalan foydalanuvchi kiritgandan keyin, ma'lum bo'ladi. Bunday holatda **dinamik massiv** kerak bo'ladi:\n\n```cpp\nint hajmi;\ncin >> hajmi;\nint *arr = new int[hajmi]; // runtime'da aniq hajmda massiv yaratiladi\n\n// ... arr bilan oddiy massiv kabi ishlash mumkin: arr[0], arr[1], ...\n\ndelete[] arr; // ishlatib bo'lgach, ajratilgan xotirani albatta bo'shatish kerak!\n```\n\n`new` operatori xotirada joy ajratadi va unga ko'rsatkich qaytaradi; `delete[]` esa o'sha xotirani operatsion tizimga qaytaradi.\n\n> **Diqqat! Odatiy xato:** `new` bilan ajratilgan xotirani `delete` qilishni unutish — **xotira sizib chiqishi (memory leak)** deb ataladi. Dastur uzoq ishlagan sari bunday \"unutilgan\" xotira bloklari to'planib, oxir-oqibat tizim xotirasini tugatib qo'yishi mumkin. Har bir `new` — albatta bitta `delete` (yoki `new[]` — `delete[]`) bilan juftlashishi shart.\n\n> **Professional maslahat:** Zamonaviy C++'da xom `new`/`delete`dan qochish tavsiya etiladi — ular o'rniga **smart pointer**lar (`std::unique_ptr`, `std::shared_ptr`, `<memory>` kutubxonasidan) yoki oddiygina `std::vector` ishlatiladi, chunki ular xotirani **avtomatik** boshqaradi (obyekt \"scope\"dan chiqqanda o'zi bo'shatadi). Ko'rsatkichlarning ichki mantiqini tushunish esa — DSA kursidagi Bog'langan ro'yxat, Daraxt kabi barcha \"pointer-based\" tuzilmalarni tushunish uchun zarur bo'lgan fundamental bilim bo'lib qoladi.",
    "cpp_example": "# 1-namuna — Ko'rsatkich asoslari: manzil, dereferensiya\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int son = 42;\n    int *p = &son;\n\n    cout << \"son ning qiymati: \" << son << endl;\n    cout << \"son ning manzili: \" << &son << endl;\n    cout << \"p ning qiymati (manzil): \" << p << endl;\n    cout << \"*p (p ko'rsatayotgan qiymat): \" << *p << endl;\n\n    *p = 100; // son'ni bilvosita o'zgartiramiz\n    cout << \"*p=100 dan keyin son: \" << son << endl;\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — p1=p2 va *p1=*p2 orasidagi farq\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 10, b = 20;\n    int *p1 = &a;\n    int *p2 = &b;\n\n    cout << \"Boshlang'ich: a=\" << a << \", b=\" << b << endl;\n\n    *p1 = *p2; // a ning qiymati b ning qiymatiga o'zgaradi (a=20)\n    cout << \"*p1 = *p2 dan keyin: a=\" << a << \", b=\" << b << endl;\n\n    a = 10; // qayta tiklaymiz\n    p1 = p2; // endi p1 ham b ga ko'rsatadi (a o'zgarmaydi!)\n    cout << \"p1 = p2 dan keyin: a=\" << a << \", *p1=\" << *p1 << endl;\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Dinamik massiv: new va delete\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int hajmi;\n    cout << \"Massiv hajmini kiriting: \";\n    cin >> hajmi;\n\n    int *arr = new int[hajmi]; // runtime'da aniqlangan hajmda massiv\n\n    for (int i = 0; i < hajmi; i++) arr[i] = (i + 1) * 10;\n\n    cout << \"Massiv: \";\n    for (int i = 0; i < hajmi; i++) cout << arr[i] << \" \";\n    cout << endl;\n\n    delete[] arr; // xotirani bo'shatish — MAJBURIY!\n    arr = nullptr; // \"osilib qolgan\" ko'rsatkichning oldini olish\n\n    return 0;\n}",
    "python_example": "# 1-namuna — Python'da o'zgaruvchilar aslida \"havola\" (reference) orqali ishlaydi\n\nson = 42\nprint(\"son ning qiymati:\", son)\nprint(\"son ning obyekt id'si (C++dagi manzilga o'xshash):\", id(son))\n# Eslatma: Python'da C++'dagi kabi qo'lda ko'rsatkich yaratib bo'lmaydi —\n# lekin har bir o'zgaruvchi \"qutidagi qiymatga havola\" ekanligini tushunish foydali.\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — O'zgaruvchan (mutable) va o'zgarmas (immutable) obyektlar farqi\n\n# Python'da list (mutable) ko'rsatkichga o'xshab ishlaydi:\na = [10]\nb = a          # b endi a bilan BIR XIL ro'yxatga \"ko'rsatadi\" (C++dagi p1=p2 kabi)\nb[0] = 99\nprint(\"a:\", a)  # a ham o'zgargan! chunki ular bitta obyektga ishora qiladi\n\n# Lekin oddiy sonlar (immutable) uchun bunday emas:\nx = 10\ny = x           # y ga x ning QIYMATI nusxalanadi\ny = 20\nprint(\"x:\", x, \" y:\", y)  # x o'zgarmaydi (10), chunki int - immutable\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Dinamik ro'yxat (Python'da massiv hajmi haqida qayg'urish shart emas)\n\nhajmi = int(input(\"Massiv hajmini kiriting: \"))\n\narr = [(i + 1) * 10 for i in range(hajmi)]  # C++'dagi new int[hajmi] ga mos\n\nprint(\"Massiv:\", arr)\n# Eslatma: Python avtomatik \"garbage collector\"ga ega — delete[] kabi\n# qo'lda xotira bo'shatish umuman kerak emas.",
    "kotlin_example": "# 1-namuna — Kotlin'da xom ko'rsatkichlar yo'q, lekin \"havola\" tushunchasi mavjud\n\nfun main() {\n    val son = 42\n    println(\"son ning qiymati: $son\")\n    // Kotlin JVM ustida ishlaydi va xom ko'rsatkichlarga ruxsat bermaydi —\n    // xotira avtomatik boshqariladi (garbage collector).\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — O'zgaruvchan (mutable) va o'zgarmas (immutable) obyektlar farqi\n\nfun main() {\n    // Kotlin'da MutableList (masalan ArrayList) ko'rsatkichga o'xshab ishlaydi:\n    val a = mutableListOf(10)\n    val b = a          // b endi a bilan BIR XIL ro'yxatga \"ko'rsatadi\"\n    b[0] = 99\n    println(\"a: $a\")    // a ham o'zgargan!\n\n    // Lekin oddiy Int (immutable qiymat) uchun bunday emas:\n    var x = 10\n    var y = x           // y ga x ning QIYMATI nusxalanadi\n    y = 20\n    println(\"x: $x, y: $y\") // x o'zgarmaydi (10)\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Dinamik massiv (Kotlin'da hajm haqida qayg'urish shart emas)\n\nfun main() {\n    print(\"Massiv hajmini kiriting: \")\n    val hajmi = readLine()!!.toInt()\n\n    val arr = IntArray(hajmi) { (it + 1) * 10 } // C++'dagi new int[hajmi] ga mos\n\n    println(\"Massiv: \" + arr.joinToString(\" \"))\n    // Eslatma: Kotlin (JVM) avtomatik garbage collector'ga ega —\n    // delete[] kabi qo'lda xotira bo'shatish kerak emas.\n}"
  }
]
const NEW_PROBLEMS = [
  {
    "title": "Ikki sonni formatlab chiqarish",
    "difficulty": "easy",
    "description": "Ikkita o'nlik kasr son kiritiladi. Ularning yig'indisini va bo'linmasini **aynan 2 xona aniqlik** bilan (o'nlik kasr shaklida) chiqaring.",
    "examples": [
      {
        "input": "10.0\n4.0",
        "output": "14.00\n2.50",
        "explanation": "10.0+4.0=14.00, 10.0/4.0=2.50"
      },
      {
        "input": "7.5\n2.0",
        "output": "9.50\n3.75",
        "explanation": ""
      }
    ],
    "constraints": "0.01 <= a, b <= 10^6\nb != 0",
    "starter_cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double a, b;\n    cin >> a >> b;\n    // Kodingizni shu yerga yozing (fixed va setprecision(2) dan foydalaning)\n    \n    return 0;\n}",
    "starter_python": "a = float(input())\nb = float(input())\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val a = readLine()!!.toDouble()\n    val b = readLine()!!.toDouble()\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double a, b;\n    cin >> a >> b;\n    cout << fixed << setprecision(2);\n    cout << (a + b) << endl;\n    cout << (a / b) << endl;\n    return 0;\n}",
    "solution_python": "a = float(input())\nb = float(input())\nprint(f\"{a+b:.2f}\")\nprint(f\"{a/b:.2f}\")"
  },
  {
    "title": "Sonlarni ustun qilib chiqarish",
    "difficulty": "easy",
    "description": "N ta butun son kiritiladi. Har birini **kamida 5 ta belgi kengligida**, o'ngga tekislangan holda, har birini alohida qatorda chiqaring (`setw(5)` dan foydalaning).",
    "examples": [
      {
        "input": "3\n1\n22\n333",
        "output": "    1\n   22\n  333",
        "explanation": "Har bir son 5 ta joy ichida o'ngga tekislangan"
      }
    ],
    "constraints": "1 <= N <= 100\n0 <= son <= 99999",
    "starter_cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Kodingizni shu yerga yozing (setw(5) dan foydalaning)\n    \n    return 0;\n}",
    "starter_python": "n = int(input())\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val n = readLine()!!.toInt()\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    for (int i = 0; i < n; i++) {\n        int son;\n        cin >> son;\n        cout << setw(5) << son << endl;\n    }\n    return 0;\n}",
    "solution_python": "n = int(input())\nfor _ in range(n):\n    son = int(input())\n    print(f\"{son:>5}\")"
  },
  {
    "title": "Qatorlarni sanash",
    "difficulty": "medium",
    "description": "Bir nechta qatordan iborat matn kiritiladi (fayldan o'qishga o'xshatilgan holat). Kiritish tugagunga (EOF) qadar barcha qatorlarni o'qing va jami nechta qator kiritilganini chiqaring.",
    "examples": [
      {
        "input": "Salom\nDunyo\nCyberEdu",
        "output": "3",
        "explanation": "3 ta qator kiritilgan"
      }
    ],
    "constraints": "0 <= qatorlar soni <= 1000\nHar bir qator 200 belgidan oshmaydi",
    "starter_cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string line;\n    int count = 0;\n    // Kodingizni shu yerga yozing (getline bilan EOF gacha o'qing)\n    \n    cout << count << endl;\n    return 0;\n}",
    "starter_python": "count = 0\n# Kodingizni shu yerga yozing (EOF gacha o'qing)\n",
    "starter_kotlin": "fun main() {\n    var count = 0\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string line;\n    int count = 0;\n    while (getline(cin, line)) {\n        count++;\n    }\n    cout << count << endl;\n    return 0;\n}",
    "solution_python": "import sys\ncount = 0\nfor line in sys.stdin:\n    count += 1\nprint(count)"
  },
  {
    "title": "Kiritishni tekshirish",
    "difficulty": "medium",
    "description": "Bitta qator matn kiritiladi. Agar u to'liq butun songa aylantirilsa (masalan \"42\"), \"Togri: \" va o'sha sonning ikki barobarini chiqaring. Aks holda \"Xato kiritish!\" chiqaring.",
    "examples": [
      {
        "input": "42",
        "output": "Togri: 84",
        "explanation": "42 butun son, 2 barobari 84"
      },
      {
        "input": "abc",
        "output": "Xato kiritish!",
        "explanation": "abc butun songa aylanmaydi"
      }
    ],
    "constraints": "Kiritilgan qator 1 dan 20 belgigacha",
    "starter_cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    // Kodingizni shu yerga yozing (stringstream yordamida tekshiring)\n    \n    return 0;\n}",
    "starter_python": "s = input()\n# Kodingizni shu yerga yozing (try/except dan foydalaning)\n",
    "starter_kotlin": "fun main() {\n    val s = readLine()!!\n    // Kodingizni shu yerga yozing (toIntOrNull dan foydalaning)\n}",
    "solution_cpp": "#include <iostream>\n#include <sstream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    stringstream ss(s);\n    int son;\n    if ((ss >> son) && ss.eof()) {\n        cout << \"Togri: \" << (son * 2) << endl;\n    } else {\n        cout << \"Xato kiritish!\" << endl;\n    }\n    return 0;\n}",
    "solution_python": "s = input()\ntry:\n    son = int(s)\n    print(f\"Togri: {son*2}\")\nexcept ValueError:\n    print(\"Xato kiritish!\")"
  },
  {
    "title": "Pivot indeksni topish",
    "difficulty": "easy",
    "description": "Butun sonlardan iborat massiv berilgan. Shunday indeks (pivot) toping, unda chap tomondagi barcha elementlar yig'indisi o'ng tomondagi barcha elementlar yig'indisiga teng bo'lsin. Agar bunday indeks bo'lmasa, -1 qaytaring.",
    "examples": [
      {
        "input": "1 7 3 6 5 6",
        "output": "3",
        "explanation": "index=3: chap (1+7+3=11) = o'ng (5+6=11)"
      },
      {
        "input": "1 2 3",
        "output": "-1",
        "explanation": "Bunday pivot mavjud emas"
      }
    ],
    "constraints": "1 <= massiv uzunligi <= 10^4\n-1000 <= element <= 1000",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n    // Kodingizni shu yerga yozing\n    \n    return 0;\n}",
    "starter_python": "arr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val arr = readLine()!!.trim().split(\" \").map { it.toInt() }\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n\n    int total = 0;\n    for (int v : arr) total += v;\n\n    int leftSum = 0;\n    for (int i = 0; i < (int)arr.size(); i++) {\n        if (leftSum == total - leftSum - arr[i]) {\n            cout << i << endl;\n            return 0;\n        }\n        leftSum += arr[i];\n    }\n    cout << -1 << endl;\n    return 0;\n}",
    "solution_python": "arr = list(map(int, input().split()))\ntotal = sum(arr)\nleft_sum = 0\nresult = -1\nfor i, v in enumerate(arr):\n    if left_sum == total - left_sum - v:\n        result = i\n        break\n    left_sum += v\nprint(result)"
  },
  {
    "title": "Paskal uchburchagi",
    "difficulty": "easy",
    "description": "Musbat butun son N kiritiladi. Paskal uchburchagining birinchi N ta qatorini chiqaring — har bir qatordagi sonlar bo'sh joy bilan ajratilgan holda.",
    "examples": [
      {
        "input": "5",
        "output": "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1",
        "explanation": ""
      }
    ],
    "constraints": "1 <= N <= 20",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Kodingizni shu yerga yozing (2 o'lchovli vector dan foydalaning)\n    \n    return 0;\n}",
    "starter_python": "n = int(input())\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val n = readLine()!!.toInt()\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<vector<long long>> triangle(n);\n    for (int i = 0; i < n; i++) {\n        triangle[i].resize(i + 1);\n        triangle[i][0] = triangle[i][i] = 1;\n        for (int j = 1; j < i; j++) {\n            triangle[i][j] = triangle[i-1][j-1] + triangle[i-1][j];\n        }\n        for (int j = 0; j <= i; j++) {\n            cout << triangle[i][j] << (j < i ? \" \" : \"\");\n        }\n        cout << endl;\n    }\n    return 0;\n}",
    "solution_python": "n = int(input())\ntriangle = []\nfor i in range(n):\n    row = [1] * (i + 1)\n    for j in range(1, i):\n        row[j] = triangle[i-1][j-1] + triangle[i-1][j]\n    triangle.append(row)\n    print(\" \".join(map(str, row)))"
  },
  {
    "title": "Eng katta qism-yig'indi (Maximum Subarray)",
    "difficulty": "medium",
    "description": "Butun sonlardan iborat massiv berilgan. Uning **ketma-ket** joylashgan elementlaridan tuzilgan qism-massiv (subarray) yig'indisining eng kattasini toping.",
    "examples": [
      {
        "input": "-2 1 -3 4 -1 2 1 -5 4",
        "output": "6",
        "explanation": "[4,-1,2,1] qism-massiv yig'indisi 6 ga teng va bu eng katta"
      },
      {
        "input": "1",
        "output": "1",
        "explanation": ""
      }
    ],
    "constraints": "1 <= massiv uzunligi <= 10^5\n-10^4 <= element <= 10^4",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n    // Kodingizni shu yerga yozing (Kadane algoritmi)\n    \n    return 0;\n}",
    "starter_python": "arr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val arr = readLine()!!.trim().split(\" \").map { it.toInt() }\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n\n    int maxSum = arr[0], currentSum = arr[0];\n    for (int i = 1; i < (int)arr.size(); i++) {\n        currentSum = max(arr[i], currentSum + arr[i]);\n        maxSum = max(maxSum, currentSum);\n    }\n    cout << maxSum << endl;\n    return 0;\n}",
    "solution_python": "arr = list(map(int, input().split()))\nmax_sum = current_sum = arr[0]\nfor x in arr[1:]:\n    current_sum = max(x, current_sum + x)\n    max_sum = max(max_sum, current_sum)\nprint(max_sum)"
  },
  {
    "title": "Matritsani transpozitsiya qilish",
    "difficulty": "easy",
    "description": "M x N o'lchamli matritsa berilgan. Uning transpozitsiyasini (qator va ustunlarni almashtirilgan holini, N x M o'lchamda) chiqaring.",
    "examples": [
      {
        "input": "2 3\n1 2 3\n4 5 6",
        "output": "1 4\n2 5\n3 6",
        "explanation": "2x3 matritsa 3x2 ga aylandi"
      }
    ],
    "constraints": "1 <= M, N <= 100",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int m, n;\n    cin >> m >> n;\n    vector<vector<int>> mat(m, vector<int>(n));\n    for (int i = 0; i < m; i++)\n        for (int j = 0; j < n; j++)\n            cin >> mat[i][j];\n    // Kodingizni shu yerga yozing\n    \n    return 0;\n}",
    "starter_python": "m, n = map(int, input().split())\nmat = [list(map(int, input().split())) for _ in range(m)]\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val (m, n) = readLine()!!.split(\" \").map { it.toInt() }\n    val mat = Array(m) { readLine()!!.split(\" \").map { it.toInt() } }\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int m, n;\n    cin >> m >> n;\n    vector<vector<int>> mat(m, vector<int>(n));\n    for (int i = 0; i < m; i++)\n        for (int j = 0; j < n; j++)\n            cin >> mat[i][j];\n\n    for (int j = 0; j < n; j++) {\n        for (int i = 0; i < m; i++) {\n            cout << mat[i][j] << (i < m - 1 ? \" \" : \"\");\n        }\n        cout << endl;\n    }\n    return 0;\n}",
    "solution_python": "m, n = map(int, input().split())\nmat = [list(map(int, input().split())) for _ in range(m)]\nfor j in range(n):\n    print(\" \".join(str(mat[i][j]) for i in range(m)))"
  },
  {
    "title": "Ketma-ket birlar",
    "difficulty": "easy",
    "description": "Faqat 0 va 1 lardan iborat massiv berilgan. Ketma-ket kelgan 1 lar sonining eng kattasini toping.",
    "examples": [
      {
        "input": "1 1 0 1 1 1",
        "output": "3",
        "explanation": "Oxirgi uchta 1 ketma-ket keladi"
      }
    ],
    "constraints": "1 <= massiv uzunligi <= 10^5\nElementlar faqat 0 yoki 1",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n    // Kodingizni shu yerga yozing\n    \n    return 0;\n}",
    "starter_python": "arr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val arr = readLine()!!.trim().split(\" \").map { it.toInt() }\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n\n    int maxCount = 0, current = 0;\n    for (int v : arr) {\n        if (v == 1) { current++; maxCount = max(maxCount, current); }\n        else current = 0;\n    }\n    cout << maxCount << endl;\n    return 0;\n}",
    "solution_python": "arr = list(map(int, input().split()))\nmax_count = current = 0\nfor v in arr:\n    if v == 1:\n        current += 1\n        max_count = max(max_count, current)\n    else:\n        current = 0\nprint(max_count)"
  },
  {
    "title": "Satrni teskari chiqarish",
    "difficulty": "easy",
    "description": "Berilgan satrni teskari tartibda chiqaring.",
    "examples": [
      {
        "input": "hello",
        "output": "olleh",
        "explanation": ""
      }
    ],
    "constraints": "1 <= satr uzunligi <= 10^5",
    "starter_cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    // Kodingizni shu yerga yozing\n    \n    return 0;\n}",
    "starter_python": "s = input()\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val s = readLine()!!\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    reverse(s.begin(), s.end());\n    cout << s << endl;\n    return 0;\n}",
    "solution_python": "s = input()\nprint(s[::-1])"
  },
  {
    "title": "Palindrom tekshirish",
    "difficulty": "easy",
    "description": "Berilgan satr faqat harf va raqamlarni hisobga olgan holda (katta-kichik harflarni farqlamasdan) palindrommi yoki yo'qmi, tekshiring.",
    "examples": [
      {
        "input": "A man a plan a canal Panama",
        "output": "true",
        "explanation": "Bo'sh joy va katta-kichiklikni e'tiborsiz qoldirsak, bu palindrom"
      },
      {
        "input": "race a car",
        "output": "false",
        "explanation": ""
      }
    ],
    "constraints": "1 <= satr uzunligi <= 2*10^5",
    "starter_cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    // Kodingizni shu yerga yozing\n    \n    return 0;\n}",
    "starter_python": "s = input()\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val s = readLine()!!\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <string>\n#include <cctype>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    string clean;\n    for (char c : s) if (isalnum(c)) clean += tolower(c);\n\n    int i = 0, j = (int)clean.size() - 1;\n    bool ok = true;\n    while (i < j) {\n        if (clean[i] != clean[j]) { ok = false; break; }\n        i++; j--;\n    }\n    cout << boolalpha << ok << endl;\n    return 0;\n}",
    "solution_python": "s = input()\nclean = [c.lower() for c in s if c.isalnum()]\nprint(str(clean == clean[::-1]).lower())"
  },
  {
    "title": "Satrlarni almashtirib birlashtirish",
    "difficulty": "easy",
    "description": "Ikkita satr kiritiladi. Ularning belgilarini navbat bilan (birinchi satrdan bitta, ikkinchisidan bitta, va h.k.) birlashtirib, natijani chiqaring. Agar bir satr tugab, ikkinchisi davom etsa, qolganini oxiriga qo'shing.",
    "examples": [
      {
        "input": "abc\npqr",
        "output": "apbqcr",
        "explanation": ""
      },
      {
        "input": "ab\npqrs",
        "output": "apbqrs",
        "explanation": "ab tugagach, rs qolganicha qo'shiladi"
      }
    ],
    "constraints": "1 <= har bir satr uzunligi <= 100",
    "starter_cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string a, b;\n    cin >> a >> b;\n    // Kodingizni shu yerga yozing\n    \n    return 0;\n}",
    "starter_python": "a = input()\nb = input()\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val a = readLine()!!\n    val b = readLine()!!\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string a, b;\n    cin >> a >> b;\n    string result;\n    int i = 0;\n    while (i < (int)a.size() || i < (int)b.size()) {\n        if (i < (int)a.size()) result += a[i];\n        if (i < (int)b.size()) result += b[i];\n        i++;\n    }\n    cout << result << endl;\n    return 0;\n}",
    "solution_python": "a = input()\nb = input()\nresult = []\nfor i in range(max(len(a), len(b))):\n    if i < len(a): result.append(a[i])\n    if i < len(b): result.append(b[i])\nprint(\"\".join(result))"
  },
  {
    "title": "Oxirgi so'z uzunligi",
    "difficulty": "easy",
    "description": "Bo'sh joylar bilan ajratilgan so'zlardan iborat satr berilgan. Uning oxirgi so'zining uzunligini chiqaring.",
    "examples": [
      {
        "input": "Hello World",
        "output": "5",
        "explanation": "\"World\" so'zi 5 ta harfdan iborat"
      },
      {
        "input": "   fly me   to   the moon  ",
        "output": "4",
        "explanation": "\"moon\" - 4 ta harf"
      }
    ],
    "constraints": "1 <= satr uzunligi <= 10^4",
    "starter_cpp": "#include <iostream>\n#include <string>\n#include <sstream>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    // Kodingizni shu yerga yozing (stringstream bilan so'zlarga bo'ling)\n    \n    return 0;\n}",
    "starter_python": "s = input()\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val s = readLine()!!\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <string>\n#include <sstream>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    stringstream ss(s);\n    string word, last;\n    while (ss >> word) last = word;\n    cout << last.size() << endl;\n    return 0;\n}",
    "solution_python": "s = input()\nwords = s.split()\nprint(len(words[-1]))"
  },
  {
    "title": "Ost-ketma-ketlik ekanligini tekshirish",
    "difficulty": "easy",
    "description": "Ikkita satr — `s` va `t` — beriladi. `s` ning `t` ning ost-ketma-ketligi (subsequence) ekanligini tekshiring — ya'ni `s` ning barcha belgilari `t` da o'z tartibida (lekin ketma-ket bo'lishi shart emas) uchraydimi.",
    "examples": [
      {
        "input": "abc\nahbgdc",
        "output": "true",
        "explanation": "a,b,c harflari ahbgdc ichida shu tartibda uchraydi"
      },
      {
        "input": "axc\nahbgdc",
        "output": "false",
        "explanation": ""
      }
    ],
    "constraints": "0 <= s.uzunligi <= 100\n0 <= t.uzunligi <= 10^4",
    "starter_cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s, t;\n    cin >> s >> t;\n    // Kodingizni shu yerga yozing (ikkita pointer/indeks bilan)\n    \n    return 0;\n}",
    "starter_python": "s = input()\nt = input()\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val s = readLine()!!\n    val t = readLine()!!\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s, t;\n    cin >> s >> t;\n    int i = 0;\n    for (int j = 0; j < (int)t.size() && i < (int)s.size(); j++) {\n        if (s[i] == t[j]) i++;\n    }\n    cout << boolalpha << (i == (int)s.size()) << endl;\n    return 0;\n}",
    "solution_python": "s = input()\nt = input()\ni = 0\nfor c in t:\n    if i < len(s) and s[i] == c:\n        i += 1\nprint(str(i == len(s)).lower())"
  },
  {
    "title": "Ko'rsatkichlar bilan almashtirish (swap)",
    "difficulty": "easy",
    "description": "Ikkita butun son kiritiladi. **Ko'rsatkichlardan foydalangan holda** ularning qiymatlarini almashtiruvchi funksiya yozing va natijani chiqaring (avval ikkinchi son, keyin birinchi son).",
    "examples": [
      {
        "input": "5 10",
        "output": "10 5",
        "explanation": ""
      }
    ],
    "constraints": "-10^9 <= a, b <= 10^9",
    "starter_cpp": "#include <iostream>\nusing namespace std;\n\nvoid mySwap(int *a, int *b) {\n    // Kodingizni shu yerga yozing\n}\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    mySwap(&a, &b);\n    cout << a << \" \" << b << endl;\n    return 0;\n}",
    "starter_python": "a, b = map(int, input().split())\n# Kodingizni shu yerga yozing (Python'da ko'rsatkich yo'q, lekin natijani\n# almashtirilgan holda chiqaring)\n",
    "starter_kotlin": "fun main() {\n    var (a, b) = readLine()!!.split(\" \").map { it.toInt() }\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\nusing namespace std;\n\nvoid mySwap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    mySwap(&a, &b);\n    cout << a << \" \" << b << endl;\n    return 0;\n}",
    "solution_python": "a, b = map(int, input().split())\na, b = b, a\nprint(a, b)"
  },
  {
    "title": "Dinamik massiv yig'indisi",
    "difficulty": "easy",
    "description": "Avval massiv hajmi N, keyin N ta butun son kiritiladi. **Dinamik massiv (`new`/`delete`)** yordamida ularni saqlab, yig'indisini chiqaring.",
    "examples": [
      {
        "input": "4\n1 2 3 4",
        "output": "10",
        "explanation": ""
      }
    ],
    "constraints": "1 <= N <= 10^5\n-1000 <= element <= 1000",
    "starter_cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int *arr = new int[n];\n    // Kodingizni shu yerga yozing\n    \n    delete[] arr;\n    return 0;\n}",
    "starter_python": "n = int(input())\narr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val n = readLine()!!.toInt()\n    val arr = readLine()!!.trim().split(\" \").map { it.toInt() }\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int *arr = new int[n];\n    for (int i = 0; i < n; i++) cin >> arr[i];\n\n    int sum = 0;\n    for (int i = 0; i < n; i++) sum += arr[i];\n    cout << sum << endl;\n\n    delete[] arr;\n    return 0;\n}",
    "solution_python": "n = int(input())\narr = list(map(int, input().split()))\nprint(sum(arr))"
  },
  {
    "title": "Ko'rsatkich orqali massivni teskari chiqarish",
    "difficulty": "medium",
    "description": "N ta butun son kiritiladi. **Ko'rsatkich arifmetikasidan** foydalanib (indeks operatoridan emas), massivni teskari tartibda chiqaring.",
    "examples": [
      {
        "input": "5\n1 2 3 4 5",
        "output": "5 4 3 2 1",
        "explanation": ""
      }
    ],
    "constraints": "1 <= N <= 10^4",
    "starter_cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int *arr = new int[n];\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    // Kodingizni shu yerga yozing (ko'rsatkich arifmetikasi bilan: *(arr+i))\n    \n    delete[] arr;\n    return 0;\n}",
    "starter_python": "n = int(input())\narr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val n = readLine()!!.toInt()\n    val arr = readLine()!!.trim().split(\" \").map { it.toInt() }\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int *arr = new int[n];\n    for (int i = 0; i < n; i++) cin >> arr[i];\n\n    for (int i = n - 1; i >= 0; i--) {\n        cout << *(arr + i) << (i > 0 ? \" \" : \"\");\n    }\n    cout << endl;\n\n    delete[] arr;\n    return 0;\n}",
    "solution_python": "n = int(input())\narr = list(map(int, input().split()))\nprint(\" \".join(map(str, reversed(arr))))"
  },
  {
    "title": "Ikkita natijani ko'rsatkich orqali qaytarish",
    "difficulty": "medium",
    "description": "N ta butun son kiritiladi. Massivdagi eng katta va eng kichik elementlarni **ko'rsatkich parametrlar** orqali (funksiya ikkita natijani \"qaytarishi\" uchun) hisoblovchi funksiya yozing. Avval eng katta, keyin eng kichik qiymatni chiqaring.",
    "examples": [
      {
        "input": "5\n3 7 1 9 4",
        "output": "9 1",
        "explanation": "Eng katta 9, eng kichigi 1"
      }
    ],
    "constraints": "1 <= N <= 10^5",
    "starter_cpp": "#include <iostream>\nusing namespace std;\n\nvoid findMinMax(int arr[], int n, int *maxOut, int *minOut) {\n    // Kodingizni shu yerga yozing\n}\n\nint main() {\n    int n;\n    cin >> n;\n    int *arr = new int[n];\n    for (int i = 0; i < n; i++) cin >> arr[i];\n\n    int maxVal, minVal;\n    findMinMax(arr, n, &maxVal, &minVal);\n    cout << maxVal << \" \" << minVal << endl;\n\n    delete[] arr;\n    return 0;\n}",
    "starter_python": "n = int(input())\narr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val n = readLine()!!.toInt()\n    val arr = readLine()!!.trim().split(\" \").map { it.toInt() }\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\nusing namespace std;\n\nvoid findMinMax(int arr[], int n, int *maxOut, int *minOut) {\n    *maxOut = arr[0];\n    *minOut = arr[0];\n    for (int i = 1; i < n; i++) {\n        if (arr[i] > *maxOut) *maxOut = arr[i];\n        if (arr[i] < *minOut) *minOut = arr[i];\n    }\n}\n\nint main() {\n    int n;\n    cin >> n;\n    int *arr = new int[n];\n    for (int i = 0; i < n; i++) cin >> arr[i];\n\n    int maxVal, minVal;\n    findMinMax(arr, n, &maxVal, &minVal);\n    cout << maxVal << \" \" << minVal << endl;\n\n    delete[] arr;\n    return 0;\n}",
    "solution_python": "n = int(input())\narr = list(map(int, input().split()))\nprint(max(arr), min(arr))"
  }
]

async function getList(key) {
  const raw = await redis.get(key)
  if (!raw) return []
  return Array.isArray(raw) ? raw : []
}

async function setList(key, list) {
  await redis.set(key, list)
}

function nextId(list) {
  if (list.length === 0) return 1
  return Math.max(...list.map(x => x.id)) + 1
}

async function seedTopics() {
  const existingTopics = await getList('topics')
  const newCodes = NEW_TOPICS.map(t => t.code) // ['C2','C3','C4','C5']

  // Shu kurs (cpp) ichida, sarlavhasi "C2.", "C3." ... bilan boshlanadigan eski mavzularni ajratib olamiz
  const keptTopics = existingTopics.filter(t => {
    if (t.course_id !== COURSE_ID) return true
    const prefixMatch = t.title.match(/^([A-Z]\d+)\./)
    if (!prefixMatch) return true // masalan "C++ga Kirish" - prefiksi yo'q, tegilmaydi
    return !newCodes.includes(prefixMatch[1])
  })

  const removedCount = existingTopics.length - keptTopics.length
  if (removedCount > 0) {
    console.log(`${removedCount} ta eski mavzu (qayta yozilayotgan) olib tashlandi.`)
  }

  let list = keptTopics
  let maxOrder = list.filter(t => t.course_id === COURSE_ID).reduce((m, t) => Math.max(m, t.order_num || 0), 0)

  for (const t of NEW_TOPICS) {
    maxOrder++
    const topic = {
      id: nextId(list),
      course_id: COURSE_ID,
      title: t.title,
      content: t.content,
      cpp_example: t.cpp_example,
      python_example: t.python_example,
      kotlin_example: t.kotlin_example,
      order_num: maxOrder,
      created_by: 1,
      created_at: new Date().toISOString(),
    }
    list = [...list, topic]
    console.log(`  + Mavzu qo'shildi: ${t.title}`)
  }

  await setList('topics', list)
  console.log(`Jami mavzular bazada: ${list.length}`)
}

async function seedProblems() {
  const existingProblems = await getList('problems')
  const existingTitles = new Set(existingProblems.map(p => p.title))

  let list = existingProblems
  let addedCount = 0

  for (const p of NEW_PROBLEMS) {
    if (existingTitles.has(p.title)) {
      console.log(`  - O'tkazib yuborildi (allaqachon mavjud): ${p.title}`)
      continue
    }
    const problem = {
      id: nextId(list),
      course_id: COURSE_ID,
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      examples: JSON.stringify(p.examples),
      constraints: p.constraints,
      starter_cpp: p.starter_cpp,
      starter_python: p.starter_python,
      starter_kotlin: p.starter_kotlin,
      solution_cpp: p.solution_cpp,
      solution_python: p.solution_python,
      created_by: 1,
      created_at: new Date().toISOString(),
    }
    list = [...list, problem]
    existingTitles.add(p.title)
    addedCount++
    console.log(`  + Masala qo'shildi: ${p.title} [${p.difficulty}]`)
  }

  await setList('problems', list)
  console.log(`Jami yangi masala qo'shildi: ${addedCount}. Bazadagi jami masalalar: ${list.length}`)
}

async function main() {
  console.log('=== C++ kursi (C2-C5) mavzularini qo\'shish ===')
  await seedTopics()
  console.log('')
  console.log('=== C++ kursi amaliyot masalalarini qo\'shish ===')
  await seedProblems()
  console.log('')
  console.log('Tayyor! Saytni yangilab ko\'ring: /courses/cpp va /practice')
}

main().catch(err => {
  console.error('XATO:', err)
  process.exit(1)
})

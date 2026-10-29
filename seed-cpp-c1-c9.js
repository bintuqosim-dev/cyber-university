#!/usr/bin/env node
/**
 * C++ kursi uchun TO'LIQ C1-C9 mavzular ro'yxatini bazaga yozadi:
 *  - C1-C5 (YANGI): IDE/Hello World, Turlar/O'zgaruvchilar, Shartlar, Sikllar, Funksiyalar
 *    (manba: "Modern C++ for Absolute Beginners")
 *  - C6-C9 (avval "C2-C5" deb nomlangan, ENDI QAYTA RAQAMLANGAN): Kirish/chiqish oqimlari,
 *    Massivlar, Satrlar/Vector, Ko'rsatkichlar (manba: "Problem Solving with C++", Savitch)
 *
 * Bu skript eski "C++ga Kirish" (prefiksiz) mavzusini va ilgari yozilgan C2/C3/C4/C5
 * mavzularini olib tashlab, o'rniga to'g'ri tartiblangan C1...C9 ni yozadi. Agar
 * ilgari "seed-cpp-c2-c5.js" ishga tushirilmagan bo'lsa ham, bu skript baribir
 * to'g'ri ishlaydi (C6-C9 shu skriptning o'zida ham mavjud).
 *
 * Ishga tushirish: cyber-university loyiha papkasida (.env.local mavjud joyda):
 *   node seed-cpp-c1-c9.js
 *
 * Xavfsizlik: bu skriptni qayta-qayta ishga tushirish mumkin — takrorlanish bo'lmaydi.
 * Amaliyot masalalari (C6-C9 uchun, ilgari "problems_cpp_c2_c5.js"da tayyorlangan)
 * ham shu skript bilan birga qo'shiladi/yangilanadi.
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

// C1-C5: yangi mavzular (allaqachon "C1.".."C5." prefiksi bilan sarlavhalangan)
const NEW_C1_C5 = [
  {
    "code": "C1",
    "title": "C1. IDE o'rnatish, \"Hello World\" dasturi, C++ sintaksisi",
    "content": "C++ — 1985-yilda Bjarne Stroustrup tomonidan yaratilgan, tezkor va kuchli dasturlash tili. U operatsion tizimlar, o'yinlar, moliyaviy tizimlar, real vaqtda ishlovchi dasturlar va hatto kosmik kemalarni boshqarish tizimlarida ishlatiladi. Bu kursda siz C++ tilini noldan, amaliy misollar orqali o'rganasiz.\n\n## Ishchi muhitni sozlash\n\nC++ dasturini yozish uchun ikkita narsa kerak: **matn muharriri** (kodni yozish uchun) va **kompilyator** (yozilgan kodni kompyuter tushunadigan dasturga aylantirish uchun). Boshlang'ich bosqichda quyidagi variantlardan birini tanlash tavsiya etiladi:\n\n| Muhit | Tavsif | Kimga mos |\n|---|---|---|\n| Visual Studio Code + MinGW/GCC | Yengil, tezkor, sozlash biroz vaqt talab qiladi | O'rta va ilg'or foydalanuvchilar |\n| CLion | To'liq IDE, avtomatik sozlanadi, lekin og'ir | Jiddiy loyihalar uchun |\n| Online kompilyatorlar (masalan, CyberEdu'ning o'z compileri) | Hech narsa o'rnatish shart emas, brauzerda ishlaydi | Boshlang'ich va tez sinov uchun |\n\n**Muhim:** Ushbu kursda siz CyberEdu platformasining **o'rnatilgan online kompilyatoridan** foydalanasiz — bu shuni anglatadiki, kompyuteringizga hech narsa o'rnatmasdan, to'g'ridan-to'g'ri brauzerda kod yozib, ishga tushirib ko'rishingiz mumkin. Shu bilan birga, uyda ishlash uchun VS Code + kompilyator o'rnatishni ham tavsiya qilamiz — bu amaliy ko'nikmalaringizni mustahkamlaydi.\n\n## Kompilyatsiya jarayoni nima?\n\nKompyuter faqat 0 va 1 lardan (mashina kodidan) iborat buyruqlarni tushunadi. Biz yozgan C++ kodi esa inson uchun tushunarli matn. **Kompilyator** — bizning matn ko'rinishidagi kodimizni (`.cpp` fayl) mashina kodiga aylantiruvchi maxsus dastur. Bu jarayon ikki bosqichdan iborat:\n\n1. **Kompilyatsiya** — kod tekshiriladi (sintaktik xatolar bormi) va mashina kodiga aylantiriladi (`.obj` yoki `.o` fayl)\n2. **Linklash (bog'lash)** — turli qismlar (bizning kod + kutubxonalar) birlashtirilib, bitta ishga tushiriladigan fayl (`.exe`) hosil qilinadi\n\n## Birinchi dastur: \"Hello, World!\"\n\nHar qanday dasturlash tilini o'rganish an'anaviy ravishda ekranga \"Hello, World!\" matnini chiqarishdan boshlanadi:\n\n```cpp\n#include <iostream>\n\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}\n```\n\nBu dasturni qator-baqator tahlil qilaylik:\n\n| Qator | Vazifasi |\n|---|---|\n| `#include <iostream>` | Kiritish-chiqarish (input/output) uchun kerakli kutubxonani dasturga qo'shadi. `cout` va `cin` aynan shu kutubxonada joylashgan |\n| `int main() {` | Har bir C++ dasturi **main() funksiyasidan** boshlanadi — bu dasturning \"kirish nuqtasi\" (entry point) |\n| `std::cout << \"...\"` | `cout` (console output) — ekranga matn chiqaruvchi obyekt. `<<` operatori chiqarilayotgan qiymatni `cout`ga \"yo'naltiradi\" |\n| `std::endl` | Qatorni tugatib, yangi qatorga o'tkazadi (`'\\n'` bilan deyarli bir xil) |\n| `return 0;` | Dastur muvaffaqiyatli tugaganini operatsion tizimga bildiradi (0 — xatosiz yakunlanish belgisi) |\n| `}` | `main` funksiyasining tanasi shu yerda tugaydi |\n\n> **Diqqat!** `std::cout` o'rniga ko'plab darsliklar va loyihalarda `using namespace std;` qatorini qo'shib, keyin shunchaki `cout` deb yozishadi. Ikkalasi ham to'g'ri — `std::` prefiksi `cout`ning `std` nomlar fazosiga (namespace) tegishli ekanini bildiradi.\n\n## Izohlar (Comments)\n\nIzohlar — kompilyator e'tiborsiz qoldiradigan, faqat dasturchilar uchun tushuntirish matnlari. Ular kod nima qilishini eslab qolish yoki boshqalarga tushuntirish uchun ishlatiladi:\n\n```cpp\n// Bu bir qatorli izoh — shu qatorning oxirigacha e'tiborga olinmaydi\n\n/* Bu esa\n   ko'p qatorli\n   izoh */\n```\n\n## Kod tuzilishi va sintaksis qoidalari\n\nC++ sintaksisining eng muhim qoidalari:\n\n- Har bir **buyruq (statement)** nuqta-vergul (`;`) bilan tugaydi\n- Kod bloklari (funksiya tanasi, shartlar, sikllar) jingalak qavslar `{ }` bilan belgilanadi\n- C++ **katta-kichik harflarni farqlaydi** (case-sensitive): `Main` va `main` — ikkita butunlay boshqa nom\n- Bo'sh joylar, tablar va yangi qatorlar (whitespace) kompilyator uchun ahamiyatsiz — ular faqat kodni odam uchun o'qishga qulay qilish uchun ishlatiladi\n\n## Eng ko'p uchraydigan sintaktik xatolar\n\n| Xato | Sabab | Yechim |\n|---|---|---|\n| `expected ';' before ...` | Buyruq oxirida `;` unutilgan | Qatorning oxiriga `;` qo'shing |\n| `'cout' was not declared` | `#include <iostream>` yozilmagan yoki `std::` unutilgan | Kutubxonani qo'shing yoki `std::cout` deb yozing |\n| `expected '}' at end of input` | Ochilgan `{` ga mos `}` yopilmagan | Qavslar sonini sanab chiqing |\n| `'Main' was not declared` | Funksiya nomi katta harf bilan yozilgan | `main` — har doim kichik harflar bilan |\n\n> **Professional maslahat:** Kompilyator xato chiqarganda, xato matnini diqqat bilan o'qing — u ko'pincha aynan qaysi qator va nima sababdan xato ekanini ko'rsatadi. Yangi dasturchilarning eng katta xatosi — xato xabarini o'qimasdan tasodifiy o'zgarishlar kiritishdir.",
    "cpp_example": "# 1-namuna — Klassik \"Hello, World!\"\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, World!\" << endl;\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Bir necha qatorli chiqish va izohlar\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Bu dastur CyberEdu platformasi haqida ma'lumot chiqaradi\n    cout << \"CyberEdu platformasiga xush kelibsiz!\" << endl;\n    cout << \"Bu yerda siz C++ tilini o'rganasiz.\" << endl;\n\n    /* Quyida ikkita qatorni bitta cout bilan\n       ham chiqarish mumkinligini ko'rsatamiz */\n    cout << \"Birinchi qator\" << endl << \"Ikkinchi qator\" << endl;\n\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Ataylab xato qilingan kod (sintaksis xatolarini tanib olish uchun)\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Bu qatorda xato bor\"   // <-- bu yerda ';' yetishmayapti!\n    cout << \"Bu qator ishlamaydi, chunki tepadagi qator tugallanmagan\" << endl;\n    return 0;\n}\n\n// Diqqat: yuqoridagi kod ataylab xato bilan yozilgan (o'qish uchun).\n// Uni compilerda ishga tushirsangiz, \"expected ';'\" degan xatoni ko'rasiz.\n// To'g'ri versiyasi: birinchi qator oxiriga ';' qo'shish kerak.",
    "python_example": "# 1-namuna — Klassik \"Hello, World!\"\n\nprint(\"Hello, World!\")\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Bir necha qatorli chiqish va izohlar\n\n# Bu dastur CyberEdu platformasi haqida ma'lumot chiqaradi\nprint(\"CyberEdu platformasiga xush kelibsiz!\")\nprint(\"Bu yerda siz C++ tilini o'rganasiz.\")\n\n\"\"\"\nPython'da ko'p qatorli izoh uchtacha qo'shtirnoq bilan yoziladi.\n\"\"\"\nprint(\"Birinchi qator\")\nprint(\"Ikkinchi qator\")\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Python va C++ sintaksisini solishtirish\n\n# C++'da har bir buyruq ';' bilan tugaydi va kod bloklari {} bilan\n# belgilanadi. Python'da esa buyruq oxirida ';' shart emas, va\n# kod bloklari {} o'rniga bo'sh joy (indentatsiya) bilan belgilanadi:\n\nyosh = 20\nif yosh >= 18:\n    print(\"Voyaga yetgan\")   # bu qator 4 ta bo'sh joy bilan \"ichkariga\" surilgan\nelse:\n    print(\"Voyaga yetmagan\")",
    "kotlin_example": "# 1-namuna — Klassik \"Hello, World!\"\n\nfun main() {\n    println(\"Hello, World!\")\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Bir necha qatorli chiqish va izohlar\n\nfun main() {\n    // Bu dastur CyberEdu platformasi haqida ma'lumot chiqaradi\n    println(\"CyberEdu platformasiga xush kelibsiz!\")\n    println(\"Bu yerda siz C++ tilini o'rganasiz.\")\n\n    /* Kotlin'da ham C++ kabi ko'p qatorli\n       izoh /* */ bilan yoziladi */\n    println(\"Birinchi qator\")\n    println(\"Ikkinchi qator\")\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Kotlin va C++ sintaksisini solishtirish\n\nfun main() {\n    // Kotlin'da ham C++ kabi kod bloklari {} bilan belgilanadi,\n    // lekin buyruq oxirida ';' ixtiyoriy (shart emas).\n    val yosh = 20\n    if (yosh >= 18) {\n        println(\"Voyaga yetgan\")\n    } else {\n        println(\"Voyaga yetmagan\")\n    }\n}"
  },
  {
    "code": "C2",
    "title": "C2. Ma'lumot turlari, o'zgaruvchilar, arifmetik operatorlar, konversiyalar",
    "content": "Har qanday dastur ma'lumotlar bilan ishlaydi — sonlar, matnlar, mantiqiy qiymatlar. C++'da har bir ma'lumot o'zining **turi (type)** bilan xotirada saqlanadi, va bu turni ishlatishdan oldin aniq belgilash kerak (C++ — **statik tiplangan** til).\n\n## Asosiy (fundamental) turlar\n\n| Tur | Tavsifi | Hajmi (odatda) | Misol qiymat |\n|---|---|---|---|\n| `bool` | Mantiqiy qiymat: `true` yoki `false` | 1 bayt | `true` |\n| `char` | Bitta belgi | 1 bayt | `'A'` |\n| `int` | Butun son | 4 bayt | `42`, `-17` |\n| `float` | O'nlik kasr son (past aniqlik) | 4 bayt | `3.14f` |\n| `double` | O'nlik kasr son (yuqori aniqlik) | 8 bayt | `3.14159` |\n| `void` | \"Tur yo'qligi\" — asosan funksiyalar hech narsa qaytarmasligini bildirish uchun | — | — |\n\n## Tur modifikatorlari\n\n`int` va boshqa butun sonli turlarni **modifikatorlar** yordamida moslashtirish mumkin:\n\n- `signed` — manfiy va musbat qiymatlarni saqlaydi (standart holat)\n- `unsigned` — faqat musbat (va nol) qiymatlarni saqlaydi, lekin shu hisobiga kattaroq musbat qiymat diapazoniga ega\n- `short` — kichikroq hajmda saqlaydi (odatda 2 bayt)\n- `long` — kattaroq hajmda saqlaydi (odatda 8 bayt)\n\n```cpp\nunsigned int yosh = 25;      // faqat musbat qiymat\nlong long katta_son = 10000000000LL;  // juda katta butun son\n```\n\n## O'zgaruvchini e'lon qilish, aniqlash va boshlang'ich qiymat berish\n\nUchta muhim tushunchani farqlash kerak:\n\n- **Deklaratsiya (declaration)** — o'zgaruvchining turi va nomini kompilyatorga \"tanishtirish\"\n- **Ta'rif (definition)** — o'zgaruvchi uchun xotirada haqiqiy joy ajratish\n- **Initsializatsiya (initialization)** — o'zgaruvchiga boshlang'ich qiymat berish\n\nAmaliyotda bu uchtasi ko'pincha bitta qatorda birlashtiriladi:\n\n```cpp\nint yosh;          // deklaratsiya + ta'rif (qiymat berilmagan — \"chalkash\" qiymat bo'lishi mumkin!)\nyosh = 20;          // endi qiymat berildi (initsializatsiya alohida)\n\nint ball = 95;      // deklaratsiya + ta'rif + initsializatsiya — bir qatorda (eng tavsiya etiladigan usul)\n```\n\n> **Diqqat! Odatiy xato:** Initsializatsiya qilinmagan o'zgaruvchi (`int yosh;` dan keyin darhol `cout << yosh;`) xotiradagi **tasodifiy \"axlat\" qiymatni** chiqaradi — bu C++'dagi eng ko'p uchraydigan yangi boshlovchilar xatosi. Har doim o'zgaruvchini e'lon qilish bilan birga qiymat bering.\n\n## Arifmetik operatorlar\n\n| Operator | Vazifasi | Misol |\n|---|---|---|\n| `+` | Qo'shish | `5 + 3` → `8` |\n| `-` | Ayirish | `5 - 3` → `2` |\n| `*` | Ko'paytirish | `5 * 3` → `15` |\n| `/` | Bo'lish | `5 / 3` → `1` (butun sonlar uchun!) |\n| `%` | Qoldiq bilan bo'lish (modulo) | `5 % 3` → `2` |\n\n## Butun sonli bo'lish — muhim nozik jihat\n\nC++'da agar ikkala operand ham **butun son (int)** bo'lsa, bo'lish natijasi ham butun songa \"kesiladi\" (kasr qismi tashlanadi):\n\n```cpp\nint a = 7, b = 2;\ncout << a / b;        // natija: 3 (7/2=3.5 emas, chunki ikkalasi ham int!)\ncout << a % b;        // natija: 1 (7 ni 2 ga bo'lganda qoldiq)\n\ndouble natija = static_cast<double>(a) / b;  // aniq (explicit) konversiya\ncout << natija;        // natija: 3.5\n```\n\n## Tur konversiyasi: implicit va explicit\n\n- **Implicit (yashirin) konversiya** — kompilyator avtomatik bajaradi (masalan, `int` qiymat `double` o'zgaruvchiga yozilganda)\n- **Explicit (aniq) konversiya** — dasturchi `static_cast<tur>(qiymat)` yordamida o'zi ko'rsatadi\n\n```cpp\nint son = 10;\ndouble narx = son;                          // implicit: int -> double (xavfsiz)\nint qisqartirilgan = static_cast<int>(3.99);  // explicit: double -> int (3.99 -> 3, kasr qismi yo'qoladi!)\n```\n\n> **Professional maslahat:** Har doim **aniq (explicit)** konversiyani afzal ko'ring — bu kodni o'qiganda \"bu yerda tur o'zgaryapti\" degan signal beradi va kutilmagan xatolarning oldini oladi.\n\n## Compound (birlashtirilgan) va increment/decrement operatorlari\n\n```cpp\nint x = 5;\nx += 3;   // x = x + 3 bilan bir xil (natija: 8)\nx -= 2;   // x = x - 2 (natija: 6)\nx *= 2;   // x = x * 2 (natija: 12)\n\nint hisoblagich = 0;\nhisoblagich++;   // post-increment: 1 ga oshiradi (natija: 1)\n++hisoblagich;   // pre-increment: yana 1 ga oshiradi (natija: 2)\n```",
    "cpp_example": "# 1-namuna — O'zgaruvchilar va asosiy turlar\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    bool aktiv = true;\n    char harf = 'A';\n    int yosh = 20;\n    double narx = 15000.75;\n\n    cout << \"Aktiv: \" << aktiv << endl;    // true -> 1 deb chiqadi\n    cout << \"Harf: \" << harf << endl;\n    cout << \"Yosh: \" << yosh << endl;\n    cout << \"Narx: \" << narx << endl;\n\n    cout << \"int hajmi: \" << sizeof(yosh) << \" bayt\" << endl;\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Arifmetik amallar va butun sonli bo'lish\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 17, b = 5;\n\n    cout << \"Yig'indi: \" << (a + b) << endl;\n    cout << \"Ayirma: \" << (a - b) << endl;\n    cout << \"Ko'paytma: \" << (a * b) << endl;\n    cout << \"Butun bo'linma: \" << (a / b) << endl;   // 3 (kasr qismi yo'qoladi)\n    cout << \"Qoldiq: \" << (a % b) << endl;             // 2\n\n    double aniqBolish = static_cast<double>(a) / b;\n    cout << \"Aniq bo'linma: \" << aniqBolish << endl;    // 3.4\n\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Compound operatorlar va increment/decrement\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int hisob = 100;\n\n    hisob += 50;   // hisob = hisob + 50\n    cout << \"Chegirmadan keyin (+50): \" << hisob << endl;\n\n    hisob -= 30;\n    cout << \"Yana ayirilgandan keyin (-30): \" << hisob << endl;\n\n    hisob *= 2;\n    cout << \"Ikki barobar (*2): \" << hisob << endl;\n\n    int hisoblagich = 0;\n    for (int i = 0; i < 5; i++) {\n        hisoblagich++;   // har bir iteratsiyada 1 ga oshadi\n    }\n    cout << \"Hisoblagich (5 marta ++): \" << hisoblagich << endl;\n\n    return 0;\n}",
    "python_example": "# 1-namuna — O'zgaruvchilar va asosiy turlar\n\naktiv = True\nharf = 'A'\nyosh = 20\nnarx = 15000.75\n\nprint(\"Aktiv:\", aktiv)\nprint(\"Harf:\", harf)\nprint(\"Yosh:\", yosh)\nprint(\"Narx:\", narx)\n\nprint(\"yosh turi:\", type(yosh))\n# Eslatma: Python'da tur avtomatik aniqlanadi (dinamik tiplash) —\n# C++'dagi kabi oldindan tur belgilash shart emas.\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Arifmetik amallar (Python'da / har doim aniq bo'ladi!)\n\na, b = 17, 5\n\nprint(\"Yig'indi:\", a + b)\nprint(\"Ayirma:\", a - b)\nprint(\"Ko'paytma:\", a * b)\nprint(\"Aniq bo'linma (/):\", a / b)     # 3.4 - Python'da / doim aniq natija beradi\nprint(\"Butun bo'linma (//):\", a // b)  # 3 - C++'dagi int/int ga mos keladi\nprint(\"Qoldiq (%):\", a % b)             # 2\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — O'zgaruvchini yangilash (Python'da += bor, lekin ++ yo'q!)\n\nhisob = 100\nhisob += 50\nprint(\"Chegirmadan keyin (+=50):\", hisob)\n\nhisob -= 30\nprint(\"Yana ayirilgandan keyin (-=30):\", hisob)\n\nhisob *= 2\nprint(\"Ikki barobar (*=2):\", hisob)\n\nhisoblagich = 0\nfor i in range(5):\n    hisoblagich += 1   # Python'da ++ operatori yo'q, shuning uchun += 1 ishlatiladi\nprint(\"Hisoblagich (5 marta +=1):\", hisoblagich)",
    "kotlin_example": "# 1-namuna — O'zgaruvchilar va asosiy turlar\n\nfun main() {\n    val aktiv = true\n    val harf = 'A'\n    val yosh = 20\n    val narx = 15000.75\n\n    println(\"Aktiv: $aktiv\")\n    println(\"Harf: $harf\")\n    println(\"Yosh: $yosh\")\n    println(\"Narx: $narx\")\n\n    println(\"Int.SIZE_BYTES: \" + Int.SIZE_BYTES)\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Arifmetik amallar va butun sonli bo'lish\n\nfun main() {\n    val a = 17\n    val b = 5\n\n    println(\"Yig'indi: \" + (a + b))\n    println(\"Ayirma: \" + (a - b))\n    println(\"Ko'paytma: \" + (a * b))\n    println(\"Butun bo'linma: \" + (a / b))   // 3 - C++'dagi Int/Int kabi\n    println(\"Qoldiq: \" + (a % b))             // 2\n\n    val aniqBolish = a.toDouble() / b\n    println(\"Aniq bo'linma: $aniqBolish\")     // 3.4\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Compound operatorlar va increment/decrement\n\nfun main() {\n    var hisob = 100\n\n    hisob += 50\n    println(\"Chegirmadan keyin (+50): $hisob\")\n\n    hisob -= 30\n    println(\"Yana ayirilgandan keyin (-30): $hisob\")\n\n    hisob *= 2\n    println(\"Ikki barobar (*2): $hisob\")\n\n    var hisoblagich = 0\n    for (i in 0 until 5) {\n        hisoblagich++   // Kotlin'da ham C++ kabi ++ operatori mavjud\n    }\n    println(\"Hisoblagich (5 marta ++): $hisoblagich\")\n}"
  },
  {
    "code": "C3",
    "title": "C3. Taqqoslash va mantiqiy operatorlar. if, else if, switch-case, ternar operatori",
    "content": "Dasturlar ko'pincha ma'lum shartga qarab har xil harakat qilishi kerak: \"agar yosh 18 dan katta bo'lsa — ruxsat ber, aks holda — rad et\". Bu mavzuda C++'da **shartli tarmoqlanish** qanday amalga oshirilishini o'rganamiz.\n\n## Taqqoslash operatorlari\n\n| Operator | Ma'nosi | Misol |\n|---|---|---|\n| `==` | Teng | `5 == 5` → `true` |\n| `!=` | Teng emas | `5 != 3` → `true` |\n| `>` | Katta | `5 > 3` → `true` |\n| `<` | Kichik | `5 < 3` → `false` |\n| `>=` | Katta yoki teng | `5 >= 5` → `true` |\n| `<=` | Kichik yoki teng | `5 <= 3` → `false` |\n\n> **Diqqat! Eng ko'p uchraydigan xato:** Tenglikni tekshirish uchun `==` (ikkita teng belgisi) ishlatiladi, `=` (bitta) esa **qiymat berish** operatori! `if (yosh = 18)` yozish — bu xato: bu `yosh`ga `18` qiymatini yozib qo'yadi va shart har doim \"to'g'ri\" (18 — nolga teng bo'lmagani uchun) deb hisoblanadi.\n\n## Mantiqiy operatorlar\n\n| Operator | Ma'nosi | Misol |\n|---|---|---|\n| `&&` | VA (AND) — ikkalasi ham to'g'ri bo'lsa `true` | `(yosh >= 18) && (balans > 0)` |\n| `\\|\\|` | YOKI (OR) — kamida bittasi to'g'ri bo'lsa `true` | `(kun == \"Shanba\") \\|\\| (kun == \"Yakshanba\")` |\n| `!` | INKOR (NOT) — teskarisiga aylantiradi | `!aktiv` (agar `aktiv` false bo'lsa, natija true) |\n\n## if, else if, else operatorlari\n\n```cpp\nif (shart) {\n    // shart TO'G'RI bo'lsa bajariladi\n} else if (boshqaShart) {\n    // birinchi shart NOTO'G'RI, lekin bu shart TO'G'RI bo'lsa\n} else {\n    // hech qaysi shart to'g'ri bo'lmasa\n}\n```\n\n**Misol** — baholash tizimi:\n\n```cpp\nint ball = 75;\nif (ball >= 90) {\n    cout << \"A'lo\";\n} else if (ball >= 70) {\n    cout << \"Yaxshi\";\n} else if (ball >= 50) {\n    cout << \"Qoniqarli\";\n} else {\n    cout << \"Qoniqarsiz\";\n}\n// Natija: \"Yaxshi\" (75 >= 70 shart bajarilgan birinchi bo'lib tekshiriladi)\n```\n\n> **Muhim:** Shartlar **yuqoridan pastga** ketma-ket tekshiriladi va **birinchi TO'G'RI kelgan** shartning bloki bajariladi, qolganlari o'tkazib yuboriladi.\n\n## switch-case operatori\n\nAgar bitta o'zgaruvchini **ko'p aniq qiymat** bilan solishtirish kerak bo'lsa, `if-else if` zanjiri o'rniga `switch` ishlatish kodni o'qishga osonlashtiradi:\n\n```cpp\nint kun = 3;\nswitch (kun) {\n    case 1:\n        cout << \"Dushanba\";\n        break;\n    case 2:\n        cout << \"Seshanba\";\n        break;\n    case 3:\n        cout << \"Chorshanba\";\n        break;\n    default:\n        cout << \"Noma'lum kun\";\n}\n// Natija: \"Chorshanba\"\n```\n\n> **Diqqat! Odatiy xato:** Har bir `case` blokining oxiriga `break;` qo'yishni unutmang! Agar `break` bo'lmasa, dastur **keyingi case blokiga ham \"quyilib\" o'tadi** (\"fall-through\" deb ataladi) — bu ko'pincha kutilmagan natijaga olib keladi.\n\n## Ternar (shartli) operator\n\nOddiy if-else'ni **bitta qatorda** yozishning qisqa usuli:\n\n```cpp\nshart ? qiymatAgarTogri : qiymatAgarNotogri\n```\n\n**Misol:**\n\n```cpp\nint yosh = 20;\nstring holat = (yosh >= 18) ? \"Voyaga yetgan\" : \"Voyaga yetmagan\";\ncout << holat;   // \"Voyaga yetgan\"\n\n// Bu yuqoridagi if-else ga teng:\n// if (yosh >= 18) { holat = \"Voyaga yetgan\"; } else { holat = \"Voyaga yetmagan\"; }\n```\n\n## Mantiqiy ifodalarni birlashtirish\n\nMurakkab shartlarni `&&`, `||`, `!` yordamida birlashtirish mumkin:\n\n```cpp\nint yosh = 20;\nbool haydashGuvohnomasiBor = true;\n\nif (yosh >= 18 && haydashGuvohnomasiBor) {\n    cout << \"Mashina haydashga ruxsat bor\";\n} else {\n    cout << \"Ruxsat yo'q\";\n}\n```\n\n> **Professional maslahat:** Murakkab shartlarni yozganda qavslardan `()` erkin foydalaning — bu operatorlar bajarilish tartibini aniq ko'rsatadi va kodni o'qishni osonlashtiradi, hatto qavslar matematik jihatdan shart bo'lmasa ham.",
    "cpp_example": "# 1-namuna — if / else if / else bilan baholash tizimi\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int ball;\n    cout << \"Ballni kiriting (0-100): \";\n    cin >> ball;\n\n    if (ball >= 90) {\n        cout << \"Baho: A'lo\" << endl;\n    } else if (ball >= 70) {\n        cout << \"Baho: Yaxshi\" << endl;\n    } else if (ball >= 50) {\n        cout << \"Baho: Qoniqarli\" << endl;\n    } else {\n        cout << \"Baho: Qoniqarsiz\" << endl;\n    }\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — switch-case bilan hafta kunini aniqlash\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int kun;\n    cout << \"Kun raqamini kiriting (1-7): \";\n    cin >> kun;\n\n    switch (kun) {\n        case 1: cout << \"Dushanba\" << endl; break;\n        case 2: cout << \"Seshanba\" << endl; break;\n        case 3: cout << \"Chorshanba\" << endl; break;\n        case 4: cout << \"Payshanba\" << endl; break;\n        case 5: cout << \"Juma\" << endl; break;\n        case 6: cout << \"Shanba\" << endl; break;\n        case 7: cout << \"Yakshanba\" << endl; break;\n        default: cout << \"Noto'g'ri kun raqami!\" << endl;\n    }\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Ternar operator va mantiqiy operatorlarni birlashtirish\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int yosh = 20;\n    bool guvohnomaBor = true;\n\n    // Ternar operator\n    string holat = (yosh >= 18) ? \"Voyaga yetgan\" : \"Voyaga yetmagan\";\n    cout << \"Holat: \" << holat << endl;\n\n    // Mantiqiy operatorlarni birlashtirish (&&)\n    if (yosh >= 18 && guvohnomaBor) {\n        cout << \"Mashina haydashga ruxsat bor\" << endl;\n    } else {\n        cout << \"Ruxsat yo'q\" << endl;\n    }\n\n    // || (YOKI) misoli\n    int kun = 6;\n    if (kun == 6 || kun == 7) {\n        cout << \"Bugun dam olish kuni!\" << endl;\n    } else {\n        cout << \"Bugun ish kuni.\" << endl;\n    }\n    return 0;\n}",
    "python_example": "# 1-namuna — if / elif / else bilan baholash tizimi\n\nball = int(input(\"Ballni kiriting (0-100): \"))\n\nif ball >= 90:\n    print(\"Baho: A'lo\")\nelif ball >= 70:\n    print(\"Baho: Yaxshi\")\nelif ball >= 50:\n    print(\"Baho: Qoniqarli\")\nelse:\n    print(\"Baho: Qoniqarsiz\")\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — match-case bilan hafta kunini aniqlash (switch'ning Python analogi)\n\nkun = int(input(\"Kun raqamini kiriting (1-7): \"))\n\nmatch kun:\n    case 1: print(\"Dushanba\")\n    case 2: print(\"Seshanba\")\n    case 3: print(\"Chorshanba\")\n    case 4: print(\"Payshanba\")\n    case 5: print(\"Juma\")\n    case 6: print(\"Shanba\")\n    case 7: print(\"Yakshanba\")\n    case _: print(\"Noto'g'ri kun raqami!\")\n# Eslatma: Python'da C++'dagi 'break' shart emas — har bir case\n# avtomatik alohida ishlaydi (fall-through muammosi yo'q).\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Ternar ifoda va mantiqiy operatorlarni birlashtirish\n\nyosh = 20\nguvohnoma_bor = True\n\n# Python'da ternar operator boshqacha yoziladi:\nholat = \"Voyaga yetgan\" if yosh >= 18 else \"Voyaga yetmagan\"\nprint(\"Holat:\", holat)\n\n# Mantiqiy operatorlar: C++'dagi && -> and, || -> or, ! -> not\nif yosh >= 18 and guvohnoma_bor:\n    print(\"Mashina haydashga ruxsat bor\")\nelse:\n    print(\"Ruxsat yo'q\")\n\nkun = 6\nif kun == 6 or kun == 7:\n    print(\"Bugun dam olish kuni!\")\nelse:\n    print(\"Bugun ish kuni.\")",
    "kotlin_example": "# 1-namuna — if / else if / else bilan baholash tizimi\n\nfun main() {\n    print(\"Ballni kiriting (0-100): \")\n    val ball = readLine()!!.toInt()\n\n    if (ball >= 90) {\n        println(\"Baho: A'lo\")\n    } else if (ball >= 70) {\n        println(\"Baho: Yaxshi\")\n    } else if (ball >= 50) {\n        println(\"Baho: Qoniqarli\")\n    } else {\n        println(\"Baho: Qoniqarsiz\")\n    }\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — when bilan hafta kunini aniqlash (switch'ning Kotlin analogi)\n\nfun main() {\n    print(\"Kun raqamini kiriting (1-7): \")\n    val kun = readLine()!!.toInt()\n\n    when (kun) {\n        1 -> println(\"Dushanba\")\n        2 -> println(\"Seshanba\")\n        3 -> println(\"Chorshanba\")\n        4 -> println(\"Payshanba\")\n        5 -> println(\"Juma\")\n        6 -> println(\"Shanba\")\n        7 -> println(\"Yakshanba\")\n        else -> println(\"Noto'g'ri kun raqami!\")\n    }\n    // Eslatma: Kotlin'da ham 'break' shart emas - fall-through muammosi yo'q.\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Ternar ifoda o'rnini bosuvchi if-ifoda va mantiqiy operatorlar\n\nfun main() {\n    val yosh = 20\n    val guvohnomaBor = true\n\n    // Kotlin'da alohida ternar operator yo'q, if o'zi ifoda sifatida ishlatiladi:\n    val holat = if (yosh >= 18) \"Voyaga yetgan\" else \"Voyaga yetmagan\"\n    println(\"Holat: $holat\")\n\n    // Mantiqiy operatorlar C++ bilan bir xil: &&, ||, !\n    if (yosh >= 18 && guvohnomaBor) {\n        println(\"Mashina haydashga ruxsat bor\")\n    } else {\n        println(\"Ruxsat yo'q\")\n    }\n\n    val kun = 6\n    if (kun == 6 || kun == 7) {\n        println(\"Bugun dam olish kuni!\")\n    } else {\n        println(\"Bugun ish kuni.\")\n    }\n}"
  },
  {
    "code": "C4",
    "title": "C4. Takrorlanuvchi jarayonlar: for, while, do-while, range-for. break va continue",
    "content": "Ko'p hollarda bir xil amalni bir necha marta takrorlash kerak bo'ladi — masalan, 1 dan 100 gacha sonlarni chiqarish yoki ro'yxatdagi barcha elementlarni ko'rib chiqish. Bunday **takrorlanuvchi jarayonlar** uchun C++'da to'rtta asosiy sikl turi mavjud.\n\n## for sikli\n\nTakrorlanishlar soni **oldindan ma'lum** bo'lganda eng qulay tanlov:\n\n```cpp\nfor (boshlang'ich_qiymat; shart; yangilanish) {\n    // takrorlanadigan kod\n}\n```\n\n**Misol** — 1 dan 5 gacha sonlarni chiqarish:\n\n```cpp\nfor (int i = 1; i <= 5; i++) {\n    cout << i << \" \";\n}\n// Natija: 1 2 3 4 5\n```\n\n`for` sikli uch qismdan iborat: `int i = 1` (bir marta bajariladi, boshlang'ich holat), `i <= 5` (har iteratsiyadan oldin tekshiriladi), `i++` (har iteratsiyadan keyin bajariladi).\n\n## while sikli\n\nTakrorlanishlar soni **oldindan noma'lum** bo'lganda, faqat shart asosida davom etadigan holatlarda ishlatiladi:\n\n```cpp\nint son = 1;\nwhile (son <= 5) {\n    cout << son << \" \";\n    son++;   // buni unutmang! aks holda cheksiz sikl hosil bo'ladi\n}\n// Natija: 1 2 3 4 5 (yuqoridagi for bilan bir xil natija)\n```\n\n> **Diqqat! Odatiy xato:** `while` siklida shartni o'zgartiruvchi qatorni (`son++`) unutish — bu **cheksiz sikl (infinite loop)** hosil qiladi, dastur to'xtamay ishlab qoladi. Har doim sikl ichida shartga ta'sir qiluvchi amal borligiga ishonch hosil qiling.\n\n## do-while sikli\n\n`while`dan farqi — shart **tekshirilishidan oldin** tana kamida **bir marta** bajariladi:\n\n```cpp\nint son = 10;\ndo {\n    cout << son << \" \";\n    son++;\n} while (son <= 5);\n// Natija: 10 (garchi shart 10<=5 noto'g'ri bo'lsa-da, bir marta bajariladi!)\n```\n\nBu, masalan, foydalanuvchidan **kamida bir marta** ma'lumot so'rash kerak bo'lgan holatlarda (menyu, parol so'rash) qulay.\n\n## Range-based for (zamonaviy C++)\n\nC++11'dan boshlab, massiv yoki boshqa to'plam elementlarini **indekssiz** aylanib chiqishning qulay usuli qo'shildi:\n\n```cpp\nint ballar[] = {85, 92, 78, 90};\nfor (int ball : ballar) {\n    cout << ball << \" \";\n}\n// Natija: 85 92 78 90\n```\n\nBu klassik `for (int i = 0; i < 4; i++) { cout << ballar[i]; }` yozuviga teng, lekin qisqaroq va indeks xatolariga (masalan, chegaradan chiqib ketish) kamroq moyil.\n\n## Sikl turlarini solishtirish\n\n| Sikl | Qachon ishlatiladi |\n|---|---|\n| `for` | Takrorlanishlar soni oldindan ma'lum |\n| `while` | Shart asosida, takrorlanishlar soni noma'lum |\n| `do-while` | Kamida bir marta bajarilishi kafolatlanishi kerak bo'lganda |\n| range-based `for` | Massiv/to'plamning barcha elementlarini indekssiz aylanib chiqishda |\n\n## break va continue\n\n- **`break`** — siklni **butunlay to'xtatadi**, undan chiqib ketadi\n- **`continue`** — joriy iteratsiyani **o'tkazib yuboradi**, sikl shartini qayta tekshirishga o'tadi (sikldan chiqmaydi!)\n\n```cpp\nfor (int i = 1; i <= 10; i++) {\n    if (i == 5) break;       // i=5 bo'lganda sikl butunlay to'xtaydi\n    cout << i << \" \";\n}\n// Natija: 1 2 3 4\n\nfor (int i = 1; i <= 5; i++) {\n    if (i == 3) continue;    // i=3 ni o'tkazib yuboradi, lekin sikl davom etadi\n    cout << i << \" \";\n}\n// Natija: 1 2 4 5 (3 yo'q!)\n```\n\n## Ichma-ich sikllar\n\nSikl ichida boshqa sikl — jadval yoki geometrik shakllar chiqarishda ishlatiladi:\n\n```cpp\nfor (int i = 1; i <= 3; i++) {          // tashqi sikl - qatorlar\n    for (int j = 1; j <= 3; j++) {      // ichki sikl - ustunlar\n        cout << i * j << \"\\t\";\n    }\n    cout << endl;\n}\n// Natija:\n// 1  2  3\n// 2  4  6\n// 3  6  9\n```\n\n> **Professional maslahat:** Ichma-ich sikllar bilan ishlaganda tashqi va ichki sikl o'zgaruvchilariga har doim boshqa-boshqa nom bering (masalan, `i` va `j`) — bir xil nom ishlatish chalkashlikka va qiyin topiladigan xatolarga olib keladi.",
    "cpp_example": "# 1-namuna — Uchta sikl turi bilan bir xil natijani olish (1 dan 5 gacha yig'indi)\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // for bilan\n    int yigindiFor = 0;\n    for (int i = 1; i <= 5; i++) yigindiFor += i;\n    cout << \"for bilan yig'indi: \" << yigindiFor << endl;\n\n    // while bilan\n    int yigindiWhile = 0, son = 1;\n    while (son <= 5) {\n        yigindiWhile += son;\n        son++;\n    }\n    cout << \"while bilan yig'indi: \" << yigindiWhile << endl;\n\n    // do-while bilan\n    int yigindiDoWhile = 0, k = 1;\n    do {\n        yigindiDoWhile += k;\n        k++;\n    } while (k <= 5);\n    cout << \"do-while bilan yig'indi: \" << yigindiDoWhile << endl;\n\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — range-based for, break va continue\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int ballar[] = {85, 92, 45, 78, 30, 90};\n\n    cout << \"Barcha ballar: \";\n    for (int ball : ballar) {\n        cout << ball << \" \";\n    }\n    cout << endl;\n\n    cout << \"O'tgan ballar (>=50), 90 topilganda to'xtaymiz: \";\n    for (int ball : ballar) {\n        if (ball < 50) continue;   // o'tmagan ballarni o'tkazib yuboramiz\n        if (ball == 90) break;      // 90 ni ko'rgach butunlay to'xtaymiz\n        cout << ball << \" \";\n    }\n    cout << endl;\n\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Ichma-ich sikllar bilan ko'paytirish jadvali va uchburchak shakl\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Ko'paytirish jadvali (5x5):\" << endl;\n    for (int i = 1; i <= 5; i++) {\n        for (int j = 1; j <= 5; j++) {\n            cout << i * j << \"\\t\";\n        }\n        cout << endl;\n    }\n\n    cout << endl << \"Yulduzcha uchburchak:\" << endl;\n    for (int i = 1; i <= 5; i++) {\n        for (int j = 1; j <= i; j++) {\n            cout << \"* \";\n        }\n        cout << endl;\n    }\n\n    return 0;\n}",
    "python_example": "# 1-namuna — Uchta sikl turi bilan bir xil natijani olish (Python'da faqat while/for bor)\n\n# for bilan (range orqali)\nyigindi_for = 0\nfor i in range(1, 6):\n    yigindi_for += i\nprint(\"for bilan yig'indi:\", yigindi_for)\n\n# while bilan\nyigindi_while = 0\nson = 1\nwhile son <= 5:\n    yigindi_while += son\n    son += 1\nprint(\"while bilan yig'indi:\", yigindi_while)\n\n# Eslatma: Python'da alohida do-while konstruksiyasi yo'q.\n# U o'rniga while True: ... if shart: break naqshi ishlatiladi:\nyigindi_do = 0\nk = 1\nwhile True:\n    yigindi_do += k\n    k += 1\n    if k > 5:\n        break\nprint(\"do-while o'rnini bosuvchi natija:\", yigindi_do)\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — for-in (range-based for'ning analogi), break va continue\n\nballar = [85, 92, 45, 78, 30, 90]\n\nprint(\"Barcha ballar:\", ballar)\n\nprint(\"O'tgan ballar (>=50), 90 topilganda to'xtaymiz: \", end=\"\")\nfor ball in ballar:\n    if ball < 50:\n        continue\n    if ball == 90:\n        break\n    print(ball, end=\" \")\nprint()\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Ichma-ich sikllar bilan ko'paytirish jadvali va uchburchak shakl\n\nprint(\"Ko'paytirish jadvali (5x5):\")\nfor i in range(1, 6):\n    for j in range(1, 6):\n        print(i * j, end=\"\\t\")\n    print()\n\nprint(\"\\nYulduzcha uchburchak:\")\nfor i in range(1, 6):\n    for j in range(i):\n        print(\"*\", end=\" \")\n    print()",
    "kotlin_example": "# 1-namuna — Uchta sikl turi bilan bir xil natijani olish\n\nfun main() {\n    // for bilan\n    var yigindiFor = 0\n    for (i in 1..5) yigindiFor += i\n    println(\"for bilan yig'indi: $yigindiFor\")\n\n    // while bilan\n    var yigindiWhile = 0\n    var son = 1\n    while (son <= 5) {\n        yigindiWhile += son\n        son++\n    }\n    println(\"while bilan yig'indi: $yigindiWhile\")\n\n    // do-while bilan (Kotlin'da ham C++ kabi mavjud)\n    var yigindiDoWhile = 0\n    var k = 1\n    do {\n        yigindiDoWhile += k\n        k++\n    } while (k <= 5)\n    println(\"do-while bilan yig'indi: $yigindiDoWhile\")\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — for-in (range-based for'ning analogi), break va continue\n\nfun main() {\n    val ballar = intArrayOf(85, 92, 45, 78, 30, 90)\n\n    println(\"Barcha ballar: \" + ballar.joinToString(\" \"))\n\n    print(\"O'tgan ballar (>=50), 90 topilganda to'xtaymiz: \")\n    for (ball in ballar) {\n        if (ball < 50) continue\n        if (ball == 90) break\n        print(\"$ball \")\n    }\n    println()\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Ichma-ich sikllar bilan ko'paytirish jadvali va uchburchak shakl\n\nfun main() {\n    println(\"Ko'paytirish jadvali (5x5):\")\n    for (i in 1..5) {\n        for (j in 1..5) {\n            print(\"${i * j}\\t\")\n        }\n        println()\n    }\n\n    println(\"\\nYulduzcha uchburchak:\")\n    for (i in 1..5) {\n        for (j in 1..i) {\n            print(\"* \")\n        }\n        println()\n    }\n}"
  },
  {
    "code": "C5",
    "title": "C5. Built-in va user defined funksiyalar. Parametrlar va qaytariladigan qiymat",
    "content": "Dastur kattalashgan sari, bir xil kodni bir necha marta yozish o'rniga, uni **funksiyalarga** ajratish kerak bo'ladi. Funksiya — ma'lum bir vazifani bajaruvchi, nomlangan va qayta ishlatiladigan kod bo'lagi.\n\n## Built-in (tayyor) va user-defined (o'z) funksiyalar\n\n- **Built-in funksiyalar** — C++ kutubxonalarida allaqachon yozilgan, tayyor funksiyalar. Masalan, `sqrt()` (kvadrat ildiz, `<cmath>`), `max()` va `min()` (`<algorithm>`), `pow()` (darajaga ko'tarish).\n- **User-defined (foydalanuvchi yozgan) funksiyalar** — dasturchi o'zi yozgan, o'ziga xos vazifani bajaruvchi funksiyalar.\n\n```cpp\n#include <cmath>\ndouble natija = sqrt(25.0);   // built-in funksiya — natija: 5.0\n```\n\n## Funksiya deklaratsiyasi va ta'rifi\n\nFunksiyaning **deklaratsiyasi** (prototip) — uning nomi, qaytaradigan turi va parametrlarini e'lon qiladi. **Ta'rifi** esa funksiyaning haqiqiy tanasini (bajaradigan amallarini) beradi:\n\n```cpp\n// Deklaratsiya (prototip) - odatda faylning yuqori qismida\nint kvadrat(int son);\n\n// Ta'rif - funksiyaning to'liq tanasi\nint kvadrat(int son) {\n    return son * son;\n}\n```\n\nFunksiyaning umumiy sintaksisi:\n\n```cpp\nqaytariladiganTur funksiyaNomi(parametrTuri parametrNomi, ...) {\n    // funksiya tanasi\n    return qiymat;   // agar qaytariladiganTur 'void' bo'lmasa, majburiy\n}\n```\n\n## return statement (qaytarish buyrug'i)\n\n`return` — funksiyaning ishini tugatib, natijani chaqirgan joyga qaytaradi. Agar funksiya hech narsa qaytarmasa, uning turi `void` bo'ladi:\n\n```cpp\nvoid salomlash(string ism) {\n    cout << \"Salom, \" << ism << \"!\" << endl;\n    // return; -- void funksiyada return shart emas (yoki bo'sh return yozish mumkin)\n}\n\nint ikkiBarobar(int son) {\n    return son * 2;   // int funksiyada return MAJBURIY\n}\n```\n\n## Parametrlarni uzatish usullari\n\nFunksiyaga ma'lumot uch xil usulda uzatilishi mumkin:\n\n| Usul | Sintaksis | Xususiyati |\n|---|---|---|\n| **Qiymat bo'yicha (by value/copy)** | `void f(int x)` | Argumentning **nusxasi** uzatiladi — funksiya ichida o'zgartirish asl qiymatga ta'sir qilmaydi |\n| **Havola bo'yicha (by reference)** | `void f(int &x)` | Argumentning **o'zi** uzatiladi — funksiya ichidagi o'zgarish asl o'zgaruvchiga ham ta'sir qiladi |\n| **Const havola bo'yicha (by const reference)** | `void f(const int &x)` | Havola orqali uzatiladi (nusxalash yo'q — samarali), lekin funksiya uni **o'zgartira olmaydi** |\n\n```cpp\nvoid qiymatBoyicha(int x) { x = x + 100; }     // asl o'zgaruvchiga ta'sir qilmaydi\nvoid havolaBoyicha(int &x) { x = x + 100; }     // asl o'zgaruvchini o'zgartiradi!\n\nint son = 5;\nqiymatBoyicha(son);\ncout << son;   // hali ham 5\n\nhavolaBoyicha(son);\ncout << son;   // endi 105\n```\n\n> **Professional maslahat:** Kichik turlar (`int`, `double`, `char`, `bool`) uchun odatda **qiymat bo'yicha** uzatish yetarli. Katta obyektlar (`string`, `vector`, massivlar) uchun esa, keraksiz nusxalashdan qochish uchun **const havola** (`const string &nom`) ishlatish tavsiya etiladi.\n\n## Funksiya ortiqcha yuklanishi (Function Overloading)\n\nC++'da **bir xil nomli**, lekin **turli parametrlarga ega** bir nechta funksiya yozish mumkin — kompilyator chaqiruv vaqtida qaysi birini ishlatishni parametrlar soniga va turiga qarab avtomatik aniqlaydi:\n\n```cpp\nint qoshish(int a, int b) {\n    return a + b;\n}\n\ndouble qoshish(double a, double b) {\n    return a + b;\n}\n\ncout << qoshish(2, 3);        // int versiyasi chaqiriladi -> 5\ncout << qoshish(2.5, 3.5);    // double versiyasi chaqiriladi -> 6.0\n```\n\n> **Diqqat!** Funksiyalarni faqat qaytariladigan tur bilan farqlab bo'lmaydi — kompilyator faqat **parametrlar ro'yxati** (soni va turi) orqali farqlaydi.\n\n## Nima uchun funksiyalarga ajratish kerak?\n\n- **Qayta ishlatish** — bir marta yozilgan funksiyani dastur bo'ylab necha marta chaqirish mumkin\n- **O'qishga qulaylik** — `main()` funksiyasi qisqa va tushunarli bo'lib qoladi\n- **Testlash va xato tuzatish osonligi** — har bir funksiyani alohida tekshirish mumkin\n- **Jamoaviy ish** — turli dasturchilar turli funksiyalar ustida parallel ishlashi mumkin",
    "cpp_example": "# 1-namuna — Oddiy funksiyalar: deklaratsiya, ta'rif, return\n\n#include <iostream>\nusing namespace std;\n\n// Deklaratsiya (prototip)\nint kvadrat(int son);\nvoid salomlash(string ism);\n\nint main() {\n    salomlash(\"Ali\");\n\n    int natija = kvadrat(7);\n    cout << \"7 ning kvadrati: \" << natija << endl;\n\n    return 0;\n}\n\n// Ta'riflar\nvoid salomlash(string ism) {\n    cout << \"Salom, \" << ism << \"! CyberEdu'ga xush kelibsiz.\" << endl;\n}\n\nint kvadrat(int son) {\n    return son * son;\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Qiymat bo'yicha va havola bo'yicha parametr uzatish farqi\n\n#include <iostream>\nusing namespace std;\n\nvoid qiymatBoyicha(int x) {\n    x = x + 100;   // faqat lokal nusxa o'zgaradi\n}\n\nvoid havolaBoyicha(int &x) {\n    x = x + 100;   // asl o'zgaruvchining o'zi o'zgaradi\n}\n\nint main() {\n    int son = 5;\n\n    qiymatBoyicha(son);\n    cout << \"qiymatBoyicha() dan keyin: \" << son << endl;   // hali ham 5\n\n    havolaBoyicha(son);\n    cout << \"havolaBoyicha() dan keyin: \" << son << endl;    // endi 105\n\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Funksiya ortiqcha yuklanishi (overloading) va built-in funksiyalar\n\n#include <iostream>\n#include <cmath>\nusing namespace std;\n\nint qoshish(int a, int b) {\n    return a + b;\n}\n\ndouble qoshish(double a, double b) {\n    return a + b;\n}\n\nint main() {\n    cout << \"int versiyasi: \" << qoshish(2, 3) << endl;         // 5\n    cout << \"double versiyasi: \" << qoshish(2.5, 3.5) << endl;   // 6.0\n\n    // Built-in funksiyalar (<cmath> kutubxonasidan)\n    cout << \"sqrt(25): \" << sqrt(25.0) << endl;\n    cout << \"pow(2,10): \" << pow(2, 10) << endl;\n    cout << \"max(4,9): \" << max(4, 9) << endl;\n\n    return 0;\n}",
    "python_example": "# 1-namuna — Oddiy funksiyalar: ta'rif va qaytarish (Python'da deklaratsiya shart emas)\n\ndef salomlash(ism):\n    print(f\"Salom, {ism}! CyberEdu'ga xush kelibsiz.\")\n\ndef kvadrat(son):\n    return son * son\n\nsalomlash(\"Ali\")\nnatija = kvadrat(7)\nprint(\"7 ning kvadrati:\", natija)\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Python'da barcha argumentlar \"havola orqali obyektga\" uzatiladi\n\ndef qiymat_boyicha(x):\n    x = x + 100   # x - lokal nom, tashqaridagi o'zgaruvchiga ta'sir qilmaydi (int - immutable)\n\ndef royxatni_ozgartirish(royxat):\n    royxat.append(100)   # list - mutable, shuning uchun asl ro'yxat o'zgaradi!\n\nson = 5\nqiymat_boyicha(son)\nprint(\"qiymat_boyicha() dan keyin:\", son)   # hali ham 5\n\nmening_royxatim = [1, 2, 3]\nroyxatni_ozgartirish(mening_royxatim)\nprint(\"royxatni_ozgartirish() dan keyin:\", mening_royxatim)  # [1, 2, 3, 100]\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Python'da \"overloading\" o'rnini bosuvchi yondashuv va built-in funksiyalar\n\n# Python'da C++'dagi kabi funksiya overloading yo'q - bitta funksiya nomi\n# turli parametrlarni o'zi ichida tekshirib ishlaydi:\ndef qoshish(a, b):\n    return a + b   # ham int, ham float uchun ishlaydi\n\nprint(\"Butun sonlar bilan:\", qoshish(2, 3))         # 5\nprint(\"Kasr sonlar bilan:\", qoshish(2.5, 3.5))       # 6.0\n\nimport math\nprint(\"sqrt(25):\", math.sqrt(25))\nprint(\"pow(2,10):\", math.pow(2, 10))\nprint(\"max(4,9):\", max(4, 9))",
    "kotlin_example": "# 1-namuna — Oddiy funksiyalar: ta'rif va qaytarish\n\nfun salomlash(ism: String) {\n    println(\"Salom, $ism! CyberEdu'ga xush kelibsiz.\")\n}\n\nfun kvadrat(son: Int): Int {\n    return son * son\n}\n\nfun main() {\n    salomlash(\"Ali\")\n    val natija = kvadrat(7)\n    println(\"7 ning kvadrati: $natija\")\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Kotlin'da parametrlar standart holda o'zgarmas (val kabi)\n\nfun qiymatBoyicha(x: Int): Int {\n    return x + 100   // asl argumentga ta'sir qilmaydi, yangi qiymat qaytariladi\n}\n\nfun main() {\n    val son = 5\n    val yangiSon = qiymatBoyicha(son)\n    println(\"son o'zgarmadi: $son\")\n    println(\"qiymatBoyicha natijasi: $yangiSon\")\n    // Eslatma: Kotlin'da C++'dagi kabi to'g'ridan-to'g'ri \"havola orqali\" parametr\n    // uzatish yo'q - buning o'rniga funksiya yangi qiymat qaytaradi.\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Funksiya ortiqcha yuklanishi (overloading) va built-in funksiyalar\n\nfun qoshish(a: Int, b: Int): Int = a + b\nfun qoshish(a: Double, b: Double): Double = a + b\n\nfun main() {\n    println(\"Int versiyasi: \" + qoshish(2, 3))          // 5\n    println(\"Double versiyasi: \" + qoshish(2.5, 3.5))    // 6.0\n\n    println(\"sqrt(25): \" + Math.sqrt(25.0))\n    println(\"pow(2,10): \" + Math.pow(2.0, 10.0))\n    println(\"max(4,9): \" + maxOf(4, 9))\n}"
  }
]

// C2-C5 (eski nom) -> C6-C9 (yangi nom) ga qayta raqamlanadi
const OLD_C2_C5 = [
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
const RENUMBER_MAP = { C2: 'C6', C3: 'C7', C4: 'C8', C5: 'C9' }
const RENUMBERED_C6_C9 = OLD_C2_C5.map(t => {
  const newCode = RENUMBER_MAP[t.code]
  const newTitle = t.title.replace(/^C\d+\./, newCode + '.')
  return { ...t, code: newCode, title: newTitle }
})

const ALL_TOPICS = [...NEW_C1_C5, ...RENUMBERED_C6_C9] // C1..C9, to'g'ri tartibda
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
  const allCodes = ALL_TOPICS.map(t => t.code) // ['C1',...,'C9']

  // Shu kurs (cpp) ichida quyidagilarni olib tashlaymiz:
  //  - prefiksi C1..C9 bo'lgan har qanday eski mavzu (qayta yozilmoqda)
  //  - prefiksi bo'lmagan eski "C++ga Kirish" placeholder mavzusi
  const keptTopics = existingTopics.filter(t => {
    if (t.course_id !== COURSE_ID) return true
    const prefixMatch = t.title.match(/^([A-Z]\d+)\./)
    if (!prefixMatch) return false // "C++ga Kirish" kabi prefiksiz eski mavzu - endi C1-C9 bilan almashtiriladi
    return !allCodes.includes(prefixMatch[1])
  })

  const removedCount = existingTopics.length - keptTopics.length
  if (removedCount > 0) {
    console.log(`${removedCount} ta eski mavzu (qayta yozilayotgan/almashtirilayotgan) olib tashlandi.`)
  }

  let list = keptTopics
  let maxOrder = list.filter(t => t.course_id === COURSE_ID).reduce((m, t) => Math.max(m, t.order_num || 0), 0)

  for (const t of ALL_TOPICS) {
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
  console.log("=== C++ kursi (C1-C9, to'liq va qayta raqamlangan) mavzularini qo'shish ===")
  await seedTopics()
  console.log('')
  console.log('=== C++ kursi amaliyot masalalarini qo\'shish (C6-C9 uchun) ===')
  await seedProblems()
  console.log('')
  console.log('Tayyor! Saytni yangilab ko\'ring: /courses/cpp va /practice')
}

main().catch(err => {
  console.error('XATO:', err)
  process.exit(1)
})

#!/usr/bin/env node
/**
 * DSA kursining A3 mavzusini ("Massivlarda ma'lumot saqlash va amallar
 * algoritmlari. Dinamik massiv implementatsiyasi. Iteratorlar") TO'LIQ,
 * chuqurlashtirilgan versiya bilan almashtiradi, va unga tegishli 8 ta
 * LeetCode uyga vazifa masalasini "Amaliyot" bo'limiga qo'shadi.
 *
 * Ishga tushirish: cyber-university loyiha papkasida (.env.local mavjud joyda):
 *   node seed-dsa-a3.js
 *
 * Xavfsizlik: bu skriptni qayta-qayta ishga tushirish mumkin —
 *  - Mavzu: eski "A3." bilan boshlanadigan DSA mavzusi topilib, o'chirilib,
 *    yangi versiya bilan bir xil order_num (3) da almashtiriladi (A1,A2,A4-A7ga tegilmaydi).
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

const COURSE_ID = 'dsa'
const NEW_TOPIC = {
  "code": "A3",
  "title": "A3. Massivlarda ma'lumot saqlash va amallar algoritmlari. Dinamik massiv implementatsiyasi. Iteratorlar",
  "content": "Oldingi mavzuda massivning nima ekanini va uning xotirada qanday joylashishini ko'rib chiqdik. Bu mavzuda ikki qadam oldinga o'tamiz: birinchidan, massiv ustida bajariladigan **asosiy algoritmlarni** (aylanib chiqish, qidirish, qo'shish, o'chirish) chuqur tahlil qilamiz; ikkinchidan, **dinamik massivni noldan o'zimiz yozamiz** — bu C++'dagi `std::vector`, Python'dagi `list`, Kotlin'dagi `ArrayList` ichida aynan qanday ishlashini tushunish uchun eng yaxshi yo'l; uchinchidan, **iterator pattern** — ma'lumotlar tuzilmasi ichki tuzilishini bilmasdan uni aylanib chiqishning universal usuli bilan tanishamiz.\n\n## Massiv ustidagi asosiy amallar va ularning murakkabligi\n\nHar qanday chiziqli ma'lumotlar tuzilmasi (massiv shu jumladan) ustida to'rtta klassik amal bajariladi. Har birining vaqt murakkabligini (Big-O) bilish — DSA'ning markazida turadigan bilim:\n\n| Amal | Tavsifi | Vaqt murakkabligi | Izoh |\n|---|---|---|---|\n| **Traverse (aylanib chiqish)** | Har bir elementni ketma-ket ko'rib chiqish | O(n) | Har doim barcha elementlarga bir marta tegish kerak |\n| **Search (qidirish)** | Berilgan qiymatni topish | O(n) — tartiblanmagan; O(log n) — tartiblangan (binary search) | Tartiblangan massivda ikkiga bo'lib qidirish mumkin |\n| **Insert (qo'shish)** | Ma'lum indeksga yangi element joylashtirish | O(n) | O'sha indeksdan keyingi barcha elementlarni bittaga \"surish\" kerak |\n| **Delete (o'chirish)** | Ma'lum indeksdagi elementni olib tashlash | O(n) | O'chirilgandan keyingi elementlarni bittaga \"orqaga surish\" kerak |\n\n> **Diqqat!** Massivning oxiriga qo'shish/o'chirish (`push_back`/`pop_back`) — O(1), chunki suriladigan element yo'q. Lekin boshiga yoki o'rtasiga qo'shish/o'chirish har doim O(n), chunki qolgan barcha elementlarni bitta joyga surish kerak. Bu — massivning eng katta kamchiligi (bog'langan ro'yxatlar, keyingi mavzularda, bu muammoni boshqacha yechadi).\n\n### Insert va Delete algoritmi qanday ishlaydi (qadam-baqadam)\n\nMassivga `[10, 20, 30, 40]` ichiga 2-indeksga `99` ni qo'shish kerak bo'lsin:\n\n1. Massiv oxiridan boshlab, 2-indeksgacha bo'lgan har bir elementni bitta o'ngga suramiz: `[10, 20, 30, 30, 40]` (40 o'zini takrorladi, chunki hali surilmagan)\n2. Aslida oxiridan boshlash kerak: avval `arr[4] = arr[3]` (40 → 5-joyga), keyin `arr[3] = arr[2]` (30 → 4-joyga), so'ng `arr[2] = 99`\n3. Natija: `[10, 20, 99, 30, 40]`\n\nO'chirish teskari yo'nalishda ishlaydi: o'chirilgan indeksdan boshlab, keyingi barcha elementlarni bittaga chapga suramiz.\n\n## Dinamik massiv: nazariy asos\n\nStatik massiv (`int arr[10]`) hajmi qat'iy — dastur ishga tushgandan keyin uni o'zgartirib bo'lmaydi. Ammo amaliyotda hajmni oldindan bilmaymiz. **Dinamik massiv** shu muammoni hal qiladi: u statik massivni \"ichida yashiradi\" va kerak bo'lganda avtomatik kattaroq statik massivga \"ko'chib o'tadi\".\n\nUchta muhim tushuncha:\n\n| Tushuncha | Ma'nosi |\n|---|---|\n| **size** | Hozir massivda nechta HAQIQIY element borligi |\n| **capacity** | Qayta xotira ajratmasdan sig'diradigan MAKSIMAL hajm |\n| **growth factor** | Capacity to'lganda necha barobarga o'sishi (odatda 2x) |\n\n### Dinamik massivga element qo'shish (push_back) algoritmi\n\n1. Agar `size < capacity` bo'lsa — shunchaki `data[size] = yangiQiymat; size++` (tezkor, O(1))\n2. Agar `size == capacity` bo'lsa (joy tugagan):\n   a. Yangi, 2 barobar kattaroq statik massiv ajratiladi (`new int[capacity * 2]`)\n   b. Eski massivdagi barcha elementlar yangisiga ko'chiriladi — bu O(n) operatsiya\n   c. Eski massiv xotiradan bo'shatiladi (`delete[]`)\n   d. Yangi element qo'shiladi, `capacity` yangilanadi\n\n### Nega bu \"amortized O(1)\" deb ataladi?\n\nKo'pchilik `push_back` chaqiruvlari O(1) (tez), lekin capacity to'lganda bittasi O(n) (sekin, nusxalash kerak) bo'ladi. Agar N ta elementni ketma-ket qo'shsak, umumiy nusxalash ishlari 1+2+4+8+...+N ≈ 2N bo'ladi — bu N ta amal uchun jami O(N), demak **har bir amalga o'rtacha (amortized) O(1)** to'g'ri keladi.\n\n| push_back chaqiruvi | size | capacity (2x o'sish) |\n|---|---|---|\n| 1-chaqiruv | 1 | 1 |\n| 2-chaqiruv | 2 | 2 |\n| 3-chaqiruv | 3 | 4 |\n| 4-chaqiruv | 4 | 4 |\n| 5-chaqiruv | 5 | 8 |\n| 9-chaqiruv | 9 | 16 |\n\n> **Professional maslahat:** Agar oldindan taxminan nechta element saqlanishini bilsangiz, `vector::reserve(n)` (C++) yoki ekvivalent usul bilan capacity'ni bir martada ajratib qo'ying — bu keraksiz nusxalashlarning oldini oladi va dasturni tezlashtiradi.\n\n## Dinamik massivni noldan yozish (implementatsiya)\n\nEndi `std::vector` ichida nima bo'layotganini o'zimiz qo'lda yozib ko'ramiz — pastdagi kod misolida to'liq `DynamicArray` klassi berilgan: u xom `int*` ko'rsatkich, `size` va `capacity` maydonlaridan iborat, `push_back`, `get`, `set` metodlari va o'sish algoritmini o'z ichiga oladi.\n\n## Iterator pattern (Iterator andozasi)\n\n**Iterator** — bu dizayn andozasi (design pattern): u ma'lumotlar tuzilmasining **ichki tuzilishini ochib bermasdan**, uning elementlarini ketma-ket aylanib chiqish imkonini beradi. Nega bu muhim?\n\n- Massiv, bog'langan ro'yxat, daraxt — barchasi butunlay boshqacha ichki tuzilishga ega, lekin ularning barchasini **bir xil sintaksis** bilan aylanib chiqish mumkin bo'lishi kerak\n- Foydalanuvchi kod `arr[i]` kabi indeksga bog'lanib qolmasdan, umumiy `begin()`/`end()` interfeysidan foydalanadi\n- Bu **range-based for** siklining (`for (int x : arr)`) qanday ishlashini tushuntiradi — kompilyator uni orqada `begin()`/`end()` va `++`/`*` chaqiruvlariga aylantiradi\n\n### Iteratorning minimal interfeysi\n\nHar qanday iterator quyidagi amallarni qo'llab-quvvatlashi kerak:\n\n| Amal | Vazifasi |\n|---|---|\n| `operator*()` (yoki `current()`) | Joriy elementga murojaat qilish |\n| `operator++()` (yoki `next()`) | Keyingi elementga o'tish |\n| `operator!=()` (yoki `hasNext()`) | Aylanish tugaganini tekshirish |\n| `begin()` / `end()` | To'plamning boshi va \"oxiridan keyingi\" nuqtasini qaytarish |\n\n```cpp\n// Iterator yordamida aylanib chiqishning umumiy shakli:\nfor (auto it = royxat.begin(); it != royxat.end(); ++it) {\n    cout << *it << \" \";   // *it - joriy elementga murojaat\n}\n\n// Bu range-based for'ga teng (kompilyator avtomatik shu kodga aylantiradi):\nfor (auto qiymat : royxat) {\n    cout << qiymat << \" \";\n}\n```\n\n> **Diqqat!** Iterator — faqat C++'ga xos emas. Python'da `__iter__`/`__next__` metodlari, Kotlin'da `Iterator` interfeysi (`hasNext()`/`next()`) — barchasi bir xil g'oyani amalga oshiradi: \"menga keyingi elementni ber, men uning ichida qanday saqlanganini bilishim shart emas\".\n\n## Darsda birga yechamiz: amaliy masala\n\n**Masala:** O'zingizning `DynamicArray` klassingizga (pastdagi kod misolidagi kabi) ikkita yangi funksiya qo'shing:\n1. `insertAt(index, qiymat)` — berilgan indeksga yangi qiymatni joylashtirish (qolgan elementlarni o'ngga surib)\n2. `removeAt(index)` — berilgan indeksdagi elementni o'chirish (qolgan elementlarni chapga surib)\n\n**Yechim yo'li:**\n\n1. `insertAt` uchun: avval `size == capacity` bo'lsa, massivni kattalashtiramiz (`push_back` dagi kabi). Keyin oxiridan `index`gacha bo'lgan elementlarni bittaga o'ngga suramiz (oxiridan boshlash **shart** — aks holda ma'lumot ustidan yozib yuboriladi). So'ng `data[index] = qiymat` va `size++`.\n2. `removeAt` uchun: `index+1`dan `size-1`gacha bo'lgan elementlarni bittaga chapga suramiz, so'ng `size--` (xotirani darhol qisqartirish shart emas — bu \"lazy shrink\" deb ataladi).\n\nTo'liq ishlaydigan yechim quyidagi kod misolida (C++ bo'limi, `DynamicArray` klassi ichida `insertAt`/`removeAt` metodlari sifatida) keltirilgan — buni darsda birga qadam-baqadam yozib chiqamiz va har bir qadamdan keyin massiv holatini `cout` bilan chiqarib tekshiramiz.\n\n> **Uyga vazifa sifatida o'ylab ko'ring:** `insertAt` va `removeAt`ning vaqt murakkabligi nima (eng yomon holatda)? Javob: ikkalasi ham **O(n)**, chunki eng yomon holatda (0-indeksga qo'shish/o'chirish) barcha qolgan elementlarni surish kerak bo'ladi.",
  "cpp_example": "# 1-namuna — DynamicArray klassini noldan yozish (push_back, get, capacity o'sishi)\n\n#include <iostream>\nusing namespace std;\n\nclass DynamicArray {\nprivate:\n    int* data;\n    int size;\n    int capacity;\n\n    void grow() {\n        capacity *= 2;\n        int* newData = new int[capacity];\n        for (int i = 0; i < size; i++) newData[i] = data[i];\n        delete[] data;\n        data = newData;\n        cout << \"  [capacity \" << capacity / 2 << \" -> \" << capacity << \" ga oshirildi]\" << endl;\n    }\n\npublic:\n    DynamicArray() {\n        capacity = 1;\n        size = 0;\n        data = new int[capacity];\n    }\n\n    ~DynamicArray() {\n        delete[] data;\n    }\n\n    void push_back(int value) {\n        if (size == capacity) grow();\n        data[size] = value;\n        size++;\n    }\n\n    int get(int index) const {\n        return data[index];\n    }\n\n    int getSize() const { return size; }\n    int getCapacity() const { return capacity; }\n\n    // Darsda birga yechiladigan masala: insertAt va removeAt\n    void insertAt(int index, int value) {\n        if (size == capacity) grow();\n        for (int i = size; i > index; i--) {\n            data[i] = data[i - 1];   // o'ngga surish, OXIRIDAN boshlab!\n        }\n        data[index] = value;\n        size++;\n    }\n\n    void removeAt(int index) {\n        for (int i = index; i < size - 1; i++) {\n            data[i] = data[i + 1];   // chapga surish\n        }\n        size--;\n    }\n\n    void print() const {\n        cout << \"[ \";\n        for (int i = 0; i < size; i++) cout << data[i] << \" \";\n        cout << \"] (size=\" << size << \", capacity=\" << capacity << \")\" << endl;\n    }\n};\n\nint main() {\n    DynamicArray arr;\n    for (int i = 1; i <= 5; i++) {\n        arr.push_back(i * 10);\n        arr.print();\n    }\n\n    cout << endl << \"insertAt(2, 99) chaqirilmoqda:\" << endl;\n    arr.insertAt(2, 99);\n    arr.print();\n\n    cout << endl << \"removeAt(0) chaqirilmoqda:\" << endl;\n    arr.removeAt(0);\n    arr.print();\n\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Iterator pattern: DynamicArray uchun o'z iteratorimizni yozish\n\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass SimpleIterator {\nprivate:\n    int* ptr;\npublic:\n    SimpleIterator(int* p) : ptr(p) {}\n\n    int operator*() const { return *ptr; }            // joriy elementga murojaat\n    SimpleIterator& operator++() { ptr++; return *this; }  // keyingi elementga o'tish\n    bool operator!=(const SimpleIterator& other) const { return ptr != other.ptr; }\n};\n\nclass Royxat {\nprivate:\n    int arr[5] = {100, 200, 300, 400, 500};\npublic:\n    SimpleIterator begin() { return SimpleIterator(arr); }\n    SimpleIterator end() { return SimpleIterator(arr + 5); }\n};\n\nint main() {\n    Royxat royxat;\n\n    cout << \"O'z iteratorimiz bilan (begin/end, operator++):\" << endl;\n    for (auto it = royxat.begin(); it != royxat.end(); ++it) {\n        cout << *it << \" \";\n    }\n    cout << endl;\n\n    cout << \"Range-based for bilan (aynan shu narsa, qisqa yozuv):\" << endl;\n    for (int qiymat : royxat) {\n        cout << qiymat << \" \";\n    }\n    cout << endl;\n\n    // std::vector'ning o'z iteratori bilan solishtirish\n    vector<int> stdRoyxat = {1, 2, 3};\n    cout << \"std::vector iteratori: \";\n    for (vector<int>::iterator it = stdRoyxat.begin(); it != stdRoyxat.end(); ++it) {\n        cout << *it << \" \";\n    }\n    cout << endl;\n\n    return 0;\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Massiv amallari: chiziqli qidirish va binary search taqqoslash\n\n#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint linearSearch(int arr[], int size, int target) {\n    for (int i = 0; i < size; i++) {\n        if (arr[i] == target) return i;   // O(n) - har birini tekshirish kerak\n    }\n    return -1;\n}\n\nint binarySearch(int arr[], int size, int target) {\n    int left = 0, right = size - 1;\n    while (left <= right) {               // O(log n) - faqat TARTIBLANGAN massivda ishlaydi!\n        int mid = left + (right - left) / 2;\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}\n\nint main() {\n    int arr[] = {2, 5, 8, 12, 16, 23, 38, 45, 56, 72};\n    int size = 10;\n\n    cout << \"Massiv: \";\n    for (int i = 0; i < size; i++) cout << arr[i] << \" \";\n    cout << endl;\n\n    int target = 23;\n    cout << \"linearSearch(\" << target << \") natijasi: indeks \" << linearSearch(arr, size, target) << endl;\n    cout << \"binarySearch(\" << target << \") natijasi: indeks \" << binarySearch(arr, size, target) << endl;\n\n    return 0;\n}",
  "python_example": "# 1-namuna — DynamicArray klassini noldan yozish (Python o'zining list'ini yashirib turadi)\n\nclass DynamicArray:\n    def __init__(self):\n        self.capacity = 1\n        self.size = 0\n        self.data = [None] * self.capacity   # Python darajasida \"xom massiv\" o'rnini bosadi\n\n    def _grow(self):\n        old_capacity = self.capacity\n        self.capacity *= 2\n        new_data = [None] * self.capacity\n        for i in range(self.size):\n            new_data[i] = self.data[i]\n        self.data = new_data\n        print(f\"  [capacity {old_capacity} -> {self.capacity} ga oshirildi]\")\n\n    def push_back(self, value):\n        if self.size == self.capacity:\n            self._grow()\n        self.data[self.size] = value\n        self.size += 1\n\n    def get(self, index):\n        return self.data[index]\n\n    def insert_at(self, index, value):\n        if self.size == self.capacity:\n            self._grow()\n        for i in range(self.size, index, -1):\n            self.data[i] = self.data[i - 1]   # o'ngga surish, oxiridan boshlab\n        self.data[index] = value\n        self.size += 1\n\n    def remove_at(self, index):\n        for i in range(index, self.size - 1):\n            self.data[i] = self.data[i + 1]   # chapga surish\n        self.size -= 1\n\n    def __str__(self):\n        elems = [str(self.data[i]) for i in range(self.size)]\n        return f\"[{' '.join(elems)}] (size={self.size}, capacity={self.capacity})\"\n\n\narr = DynamicArray()\nfor i in range(1, 6):\n    arr.push_back(i * 10)\n    print(arr)\n\nprint(\"\\ninsert_at(2, 99) chaqirilmoqda:\")\narr.insert_at(2, 99)\nprint(arr)\n\nprint(\"\\nremove_at(0) chaqirilmoqda:\")\narr.remove_at(0)\nprint(arr)\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Iterator pattern: Python'ning __iter__ / __next__ protokoli\n\nclass Royxat:\n    def __init__(self):\n        self.elementlar = [100, 200, 300, 400, 500]\n\n    def __iter__(self):\n        return RoyxatIterator(self.elementlar)\n\n\nclass RoyxatIterator:\n    def __init__(self, elementlar):\n        self.elementlar = elementlar\n        self.index = 0\n\n    def __next__(self):\n        if self.index >= len(self.elementlar):\n            raise StopIteration       # \"hasNext() == false\" ning Python'dagi ekvivalenti\n        qiymat = self.elementlar[self.index]\n        self.index += 1\n        return qiymat\n\n\nroyxat = Royxat()\n\nprint(\"O'z iteratorimiz bilan (for...in avtomatik __iter__/__next__ chaqiradi):\")\nfor qiymat in royxat:\n    print(qiymat, end=\" \")\nprint()\n\n# Python list'ining o'zi ham xuddi shu protokol orqali ishlaydi:\npython_royxat = [1, 2, 3]\nprint(\"Python list iteratori: \", end=\"\")\nit = iter(python_royxat)\nwhile True:\n    try:\n        print(next(it), end=\" \")\n    except StopIteration:\n        break\nprint()\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Massiv amallari: chiziqli qidirish va binary search taqqoslash\n\ndef linear_search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:          # O(n) - har birini tekshirish kerak\n            return i\n    return -1\n\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:              # O(log n) - faqat TARTIBLANGAN massivda ishlaydi!\n        mid = left + (right - left) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\narr = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72]\nprint(\"Massiv:\", arr)\n\ntarget = 23\nprint(f\"linear_search({target}) natijasi: indeks {linear_search(arr, target)}\")\nprint(f\"binary_search({target}) natijasi: indeks {binary_search(arr, target)}\")",
  "kotlin_example": "# 1-namuna — DynamicArray klassini noldan yozish\n\nclass DynamicArray {\n    private var capacity = 1\n    private var size = 0\n    private var data = arrayOfNulls<Int>(capacity)\n\n    private fun grow() {\n        val oldCapacity = capacity\n        capacity *= 2\n        val newData = arrayOfNulls<Int>(capacity)\n        for (i in 0 until size) newData[i] = data[i]\n        data = newData\n        println(\"  [capacity $oldCapacity -> $capacity ga oshirildi]\")\n    }\n\n    fun pushBack(value: Int) {\n        if (size == capacity) grow()\n        data[size] = value\n        size++\n    }\n\n    fun get(index: Int): Int = data[index]!!\n\n    fun insertAt(index: Int, value: Int) {\n        if (size == capacity) grow()\n        for (i in size downTo index + 1) {\n            data[i] = data[i - 1]   // o'ngga surish, oxiridan boshlab\n        }\n        data[index] = value\n        size++\n    }\n\n    fun removeAt(index: Int) {\n        for (i in index until size - 1) {\n            data[i] = data[i + 1]   // chapga surish\n        }\n        size--\n    }\n\n    override fun toString(): String {\n        val elems = (0 until size).map { data[it] }.joinToString(\" \")\n        return \"[ $elems ] (size=$size, capacity=$capacity)\"\n    }\n}\n\nfun main() {\n    val arr = DynamicArray()\n    for (i in 1..5) {\n        arr.pushBack(i * 10)\n        println(arr)\n    }\n\n    println(\"\\ninsertAt(2, 99) chaqirilmoqda:\")\n    arr.insertAt(2, 99)\n    println(arr)\n\n    println(\"\\nremoveAt(0) chaqirilmoqda:\")\n    arr.removeAt(0)\n    println(arr)\n}\n\n\n# ────────────────────────────────────────\n\n# 2-namuna — Iterator pattern: Kotlin'ning Iterator interfeysi (hasNext/next)\n\nclass Royxat : Iterable<Int> {\n    private val elementlar = listOf(100, 200, 300, 400, 500)\n\n    override fun iterator(): Iterator<Int> {\n        return RoyxatIterator(elementlar)\n    }\n}\n\nclass RoyxatIterator(private val elementlar: List<Int>) : Iterator<Int> {\n    private var index = 0\n\n    override fun hasNext(): Boolean = index < elementlar.size\n\n    override fun next(): Int {\n        val qiymat = elementlar[index]\n        index++\n        return qiymat\n    }\n}\n\nfun main() {\n    val royxat = Royxat()\n\n    println(\"O'z iteratorimiz bilan (for-in avtomatik hasNext()/next() chaqiradi):\")\n    for (qiymat in royxat) {\n        print(\"$qiymat \")\n    }\n    println()\n\n    // Kotlin'ning o'z ArrayList'i ham xuddi shu Iterator interfeysi orqali ishlaydi\n    val kotlinRoyxat = arrayListOf(1, 2, 3)\n    print(\"Kotlin ArrayList iteratori: \")\n    val it = kotlinRoyxat.iterator()\n    while (it.hasNext()) {\n        print(\"${it.next()} \")\n    }\n    println()\n}\n\n\n# ────────────────────────────────────────\n\n# 3-namuna — Massiv amallari: chiziqli qidirish va binary search taqqoslash\n\nfun linearSearch(arr: IntArray, target: Int): Int {\n    for (i in arr.indices) {\n        if (arr[i] == target) return i    // O(n) - har birini tekshirish kerak\n    }\n    return -1\n}\n\nfun binarySearch(arr: IntArray, target: Int): Int {\n    var left = 0\n    var right = arr.size - 1\n    while (left <= right) {                // O(log n) - faqat TARTIBLANGAN massivda ishlaydi!\n        val mid = left + (right - left) / 2\n        when {\n            arr[mid] == target -> return mid\n            arr[mid] < target -> left = mid + 1\n            else -> right = mid - 1\n        }\n    }\n    return -1\n}\n\nfun main() {\n    val arr = intArrayOf(2, 5, 8, 12, 16, 23, 38, 45, 56, 72)\n    println(\"Massiv: \" + arr.joinToString(\" \"))\n\n    val target = 23\n    println(\"linearSearch($target) natijasi: indeks ${linearSearch(arr, target)}\")\n    println(\"binarySearch($target) natijasi: indeks ${binarySearch(arr, target)}\")\n}"
}
const NEW_PROBLEMS = [
  {
    "title": "Nollarni takrorlash (Duplicate Zeros)",
    "difficulty": "easy",
    "leetcode": "https://leetcode.com/problems/duplicate-zeros/",
    "description": "Butun sonlardan iborat massiv berilgan. Massivdagi har bir 0 ni yana bir marta takrorlab, qolgan elementlarni o'ngga suring — lekin massivning umumiy uzunligi o'zgarmasligi kerak (oxiridan chiqib ketgan elementlar shunchaki tashlab yuboriladi). Natijaviy massivni chiqaring.",
    "examples": [
      {
        "input": "1 0 2 3 0 4 5 0",
        "output": "1 0 0 2 3 0 0 4",
        "explanation": "Har bir 0 takrorlanadi, oxirgi ikkita element (5, 0) massivdan chiqib ketadi"
      },
      {
        "input": "1 2 3",
        "output": "1 2 3",
        "explanation": "0 yo'q, massiv o'zgarmaydi"
      }
    ],
    "constraints": "1 <= massiv uzunligi <= 10^4\n0 <= element <= 9",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n    // Kodingizni shu yerga yozing\n\n    return 0;\n}",
    "starter_python": "arr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val arr = readLine()!!.trim().split(\" \").map { it.toInt() }.toMutableList()\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n\n    int n = arr.size();\n    vector<int> result;\n    for (int i = 0; i < n && (int)result.size() < n; i++) {\n        result.push_back(arr[i]);\n        if (arr[i] == 0 && (int)result.size() < n) {\n            result.push_back(0);\n        }\n    }\n\n    for (int i = 0; i < n; i++) cout << result[i] << (i + 1 < n ? \" \" : \"\\n\");\n    return 0;\n}",
    "solution_python": "arr = list(map(int, input().split()))\nn = len(arr)\nresult = []\nfor v in arr:\n    if len(result) >= n:\n        break\n    result.append(v)\n    if v == 0 and len(result) < n:\n        result.append(0)\n\nprint(' '.join(map(str, result)))"
  },
  {
    "title": "Aksiyada eng katta foyda (Best Time to Buy and Sell Stock)",
    "difficulty": "easy",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "description": "Har bir kundagi aksiya narxlaridan iborat massiv berilgan (arr[i] — i-kundagi narx). Bitta marta aksiyani sotib olib, keyinroq (boshqa bir kunda) sotish orqali olish mumkin bo'lgan ENG KATTA foydani toping. Agar hech qanday foyda olib bo'lmasa, 0 qaytaring.",
    "examples": [
      {
        "input": "7 1 5 3 6 4",
        "output": "5",
        "explanation": "1-kunda sotib olib (narx=1), 4-kunda sotish (narx=6): foyda = 6-1 = 5"
      },
      {
        "input": "7 6 4 3 1",
        "output": "0",
        "explanation": "Narxlar faqat kamayadi, foyda olib bo'lmaydi"
      }
    ],
    "constraints": "1 <= massiv uzunligi <= 10^5\n0 <= narx <= 10^4",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n    // Kodingizni shu yerga yozing\n\n    return 0;\n}",
    "starter_python": "arr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val arr = readLine()!!.trim().split(\" \").map { it.toInt() }\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n\n    int minPrice = arr[0];\n    int maxProfit = 0;\n    for (int i = 1; i < (int)arr.size(); i++) {\n        maxProfit = max(maxProfit, arr[i] - minPrice);\n        minPrice = min(minPrice, arr[i]);\n    }\n    cout << maxProfit << endl;\n    return 0;\n}",
    "solution_python": "arr = list(map(int, input().split()))\nmin_price = arr[0]\nmax_profit = 0\nfor price in arr[1:]:\n    max_profit = max(max_profit, price - min_price)\n    min_price = min(min_price, price)\nprint(max_profit)"
  },
  {
    "title": "Uchinchi eng katta son (Third Maximum Number)",
    "difficulty": "easy",
    "leetcode": "https://leetcode.com/problems/third-maximum-number/",
    "description": "Butun sonlardan iborat massiv berilgan. Massivdagi UCHINCHI eng katta NOYOB (takrorlanmagan) sonni toping. Agar noyob sonlar soni 3 tadan kam bo'lsa, eng katta sonni qaytaring.",
    "examples": [
      {
        "input": "3 2 1",
        "output": "1",
        "explanation": "Noyob sonlar: 3,2,1 -> uchinchi eng katta = 1"
      },
      {
        "input": "1 2",
        "output": "2",
        "explanation": "Noyob sonlar 2 ta, uchinchisi yo'q -> eng katta (2) qaytariladi"
      },
      {
        "input": "2 2 3 1",
        "output": "1",
        "explanation": "Noyob sonlar: 3,2,1 -> uchinchi eng katta = 1 (takrorlangan 2 bir marta hisoblanadi)"
      }
    ],
    "constraints": "1 <= massiv uzunligi <= 10^4\n-2^31 <= element <= 2^31 - 1",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<long long> arr;\n    long long x;\n    while (cin >> x) arr.push_back(x);\n    // Kodingizni shu yerga yozing\n\n    return 0;\n}",
    "starter_python": "arr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val arr = readLine()!!.trim().split(\" \").map { it.toLong() }\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\n#include <set>\nusing namespace std;\n\nint main() {\n    vector<long long> arr;\n    long long x;\n    while (cin >> x) arr.push_back(x);\n\n    set<long long, greater<long long>> distinctVals(arr.begin(), arr.end());\n\n    int count = 0;\n    for (long long v : distinctVals) {\n        count++;\n        if (count == 3) {\n            cout << v << endl;\n            return 0;\n        }\n    }\n    // 3 ta noyob son yo'q - eng kattasini qaytaramiz\n    cout << *distinctVals.begin() << endl;\n    return 0;\n}",
    "solution_python": "arr = list(map(int, input().split()))\ndistinct_vals = sorted(set(arr), reverse=True)\nif len(distinct_vals) >= 3:\n    print(distinct_vals[2])\nelse:\n    print(distinct_vals[0])"
  },
  {
    "title": "Aylantirilgan massivda minimal elementni topish (Find Minimum in Rotated Sorted Array)",
    "difficulty": "medium",
    "leetcode": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    "description": "Avval o'sish tartibida saralangan, so'ngra noma'lum miqdorda \"aylantirilgan\" (rotated) massiv berilgan (barcha elementlar noyob). Massivdagi ENG KICHIK elementni O(log n) vaqt murakkabligida (binary search) toping.",
    "examples": [
      {
        "input": "3 4 5 1 2",
        "output": "1",
        "explanation": "Massiv [1,2,3,4,5] dan 2 marta chapga aylantirilgan, minimal = 1"
      },
      {
        "input": "4 5 6 7 0 1 2",
        "output": "0",
        "explanation": "Minimal element = 0"
      },
      {
        "input": "11 13 15 17",
        "output": "11",
        "explanation": "Massiv umuman aylantirilmagan bo'lishi ham mumkin"
      }
    ],
    "constraints": "n == massiv uzunligi\n1 <= n <= 5000\nBarcha elementlar noyob (takrorlanmaydi)",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n    // Kodingizni shu yerga yozing (binary search bilan O(log n))\n\n    return 0;\n}",
    "starter_python": "arr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing (binary search bilan O(log n))\n",
    "starter_kotlin": "fun main() {\n    val arr = readLine()!!.trim().split(\" \").map { it.toInt() }\n    // Kodingizni shu yerga yozing (binary search bilan O(log n))\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n\n    int left = 0, right = arr.size() - 1;\n    while (left < right) {\n        int mid = left + (right - left) / 2;\n        if (arr[mid] > arr[right]) {\n            left = mid + 1;   // minimal o'ng yarmida\n        } else {\n            right = mid;       // minimal mid yoki chap yarmida\n        }\n    }\n    cout << arr[left] << endl;\n    return 0;\n}",
    "solution_python": "arr = list(map(int, input().split()))\nleft, right = 0, len(arr) - 1\nwhile left < right:\n    mid = left + (right - left) // 2\n    if arr[mid] > arr[right]:\n        left = mid + 1\n    else:\n        right = mid\nprint(arr[left])"
  },
  {
    "title": "Keyingi permutatsiya (Next Permutation)",
    "difficulty": "medium",
    "leetcode": "https://leetcode.com/problems/next-permutation/",
    "description": "Butun sonlar massivi berilgan — uni sonlarning bitta \"permutatsiyasi\" (joylashuvi) deb hisoblang. Shu massivni lug'aviy (lexicographic) tartibda KEYINGI permutatsiyasiga, JOYIDA (in-place, qo'shimcha massivsiz) o'zgartiring. Agar bu eng katta mumkin bo'lgan permutatsiya bo'lsa, uni eng kichik permutatsiyaga (o'sish tartibiga) aylantiring. Natijaviy massivni chiqaring.",
    "examples": [
      {
        "input": "1 2 3",
        "output": "1 3 2",
        "explanation": "[1,2,3] dan keyingi permutatsiya [1,3,2]"
      },
      {
        "input": "3 2 1",
        "output": "1 2 3",
        "explanation": "[3,2,1] - eng katta permutatsiya, shuning uchun eng kichigiga qaytadi"
      },
      {
        "input": "1 1 5",
        "output": "1 5 1",
        "explanation": "[1,1,5] dan keyingi permutatsiya [1,5,1]"
      }
    ],
    "constraints": "1 <= massiv uzunligi <= 100\n0 <= element <= 100",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n    // Kodingizni shu yerga yozing\n\n    return 0;\n}",
    "starter_python": "arr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val arr = readLine()!!.trim().split(\" \").map { it.toInt() }.toMutableList()\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n\n    int n = arr.size();\n    int i = n - 2;\n    while (i >= 0 && arr[i] >= arr[i + 1]) i--;   // o'ngdan o'sishni buzuvchi joyni topamiz\n\n    if (i >= 0) {\n        int j = n - 1;\n        while (arr[j] <= arr[i]) j--;              // arr[i]dan katta, eng o'ngdagi elementni topamiz\n        swap(arr[i], arr[j]);\n    }\n    reverse(arr.begin() + i + 1, arr.end());        // qolgan qismni o'sish tartibiga aylantiramiz\n\n    for (int k = 0; k < n; k++) cout << arr[k] << (k + 1 < n ? \" \" : \"\\n\");\n    return 0;\n}",
    "solution_python": "arr = list(map(int, input().split()))\nn = len(arr)\ni = n - 2\nwhile i >= 0 and arr[i] >= arr[i + 1]:\n    i -= 1\n\nif i >= 0:\n    j = n - 1\n    while arr[j] <= arr[i]:\n        j -= 1\n    arr[i], arr[j] = arr[j], arr[i]\n\narr[i + 1:] = reversed(arr[i + 1:])\nprint(' '.join(map(str, arr)))"
  },
  {
    "title": "Tartiblangan massivda takrorlanishlarni cheklash (Remove Duplicates from Sorted Array II)",
    "difficulty": "medium",
    "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/",
    "description": "O'sish tartibida saralangan massiv berilgan. Har bir qiymat massivda KO'PI BILAN 2 MARTA qolishi uchun ortiqcha takrorlanishlarni joyida (in-place) olib tashlang. Natijaviy (qisqartirilgan) massivning faqat yaroqli qismini chiqaring.",
    "examples": [
      {
        "input": "1 1 1 2 2 3",
        "output": "1 1 2 2 3",
        "explanation": "1 uchta bor edi -> ikkitasi qoldirildi"
      },
      {
        "input": "0 0 1 1 1 1 2 3 3",
        "output": "0 0 1 1 2 3 3",
        "explanation": "1 to'rtta bor edi -> ikkitasi qoldirildi"
      }
    ],
    "constraints": "1 <= massiv uzunligi <= 3*10^4\nMassiv o'sish tartibida saralangan",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n    // Kodingizni shu yerga yozing\n\n    return 0;\n}",
    "starter_python": "arr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing\n",
    "starter_kotlin": "fun main() {\n    val arr = readLine()!!.trim().split(\" \").map { it.toInt() }\n    // Kodingizni shu yerga yozing\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr;\n    int x;\n    while (cin >> x) arr.push_back(x);\n\n    int n = arr.size();\n    if (n <= 2) {\n        for (int i = 0; i < n; i++) cout << arr[i] << (i + 1 < n ? \" \" : \"\\n\");\n        return 0;\n    }\n\n    int writeIdx = 2;   // birinchi ikkita element har doim saqlanadi\n    for (int i = 2; i < n; i++) {\n        if (arr[i] != arr[writeIdx - 2]) {\n            arr[writeIdx] = arr[i];\n            writeIdx++;\n        }\n    }\n\n    for (int i = 0; i < writeIdx; i++) cout << arr[i] << (i + 1 < writeIdx ? \" \" : \"\\n\");\n    return 0;\n}",
    "solution_python": "arr = list(map(int, input().split()))\nn = len(arr)\nif n <= 2:\n    print(' '.join(map(str, arr)))\nelse:\n    write_idx = 2\n    for i in range(2, n):\n        if arr[i] != arr[write_idx - 2]:\n            arr[write_idx] = arr[i]\n            write_idx += 1\n    print(' '.join(map(str, arr[:write_idx])))"
  },
  {
    "title": "Konfetlarni taqsimlash (Candy)",
    "difficulty": "hard",
    "leetcode": "https://leetcode.com/problems/candy/",
    "description": "n ta bola qatorda turibdi, har birining reyting bahosi (ratings[i]) berilgan. Har bir bolaga KAMIDA 1 ta konfet berilishi kerak. Agar ikkita qo'shni bolaning reytingi solishtirilganda biri kattaroq bo'lsa, o'sha bola qo'shnisidan KO'PROQ konfet olishi kerak. Barcha shartlarni qanoatlantiradigan ENG KAM umumiy konfetlar sonini toping.",
    "examples": [
      {
        "input": "1 0 2",
        "output": "5",
        "explanation": "Taqsimot: [2,1,2] -> jami 5"
      },
      {
        "input": "1 2 2",
        "output": "4",
        "explanation": "Taqsimot: [1,2,1] -> jami 4 (ikkinchi va uchinchi bola reytingi teng, shart yo'q)"
      }
    ],
    "constraints": "n == ratings uzunligi\n1 <= n <= 2*10^4\n0 <= ratings[i] <= 2*10^4",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> ratings;\n    int x;\n    while (cin >> x) ratings.push_back(x);\n    // Kodingizni shu yerga yozing (ikki o'tishli greedy algoritm)\n\n    return 0;\n}",
    "starter_python": "ratings = list(map(int, input().split()))\n# Kodingizni shu yerga yozing (ikki o'tishli greedy algoritm)\n",
    "starter_kotlin": "fun main() {\n    val ratings = readLine()!!.trim().split(\" \").map { it.toInt() }\n    // Kodingizni shu yerga yozing (ikki o'tishli greedy algoritm)\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> ratings;\n    int x;\n    while (cin >> x) ratings.push_back(x);\n\n    int n = ratings.size();\n    vector<int> candies(n, 1);\n\n    // Chapdan o'ngga: agar o'ng qo'shnisidan reytingi yuqori bo'lsa, undan ko'proq bo'lishi kerak\n    for (int i = 1; i < n; i++) {\n        if (ratings[i] > ratings[i - 1]) candies[i] = candies[i - 1] + 1;\n    }\n    // O'ngdan chapga: agar chap qo'shnisidan reytingi yuqori bo'lsa, undan ko'proq bo'lishi kerak\n    for (int i = n - 2; i >= 0; i--) {\n        if (ratings[i] > ratings[i + 1]) candies[i] = max(candies[i], candies[i + 1] + 1);\n    }\n\n    long long total = 0;\n    for (int c : candies) total += c;\n    cout << total << endl;\n    return 0;\n}",
    "solution_python": "ratings = list(map(int, input().split()))\nn = len(ratings)\ncandies = [1] * n\n\nfor i in range(1, n):\n    if ratings[i] > ratings[i - 1]:\n        candies[i] = candies[i - 1] + 1\n\nfor i in range(n - 2, -1, -1):\n    if ratings[i] > ratings[i + 1]:\n        candies[i] = max(candies[i], candies[i + 1] + 1)\n\nprint(sum(candies))"
  },
  {
    "title": "Teskari juftliklarni sanash (Reverse Pairs)",
    "difficulty": "hard",
    "leetcode": "https://leetcode.com/problems/reverse-pairs/",
    "description": "Butun sonlar massivi berilgan. Shunday (i, j) juftliklar sonini toping, bunda i < j VA arr[i] > 2 * arr[j] shartlari bajarilsin (\"teskari juftlik\"). Oddiy ikki-ichma-ich sikl bilan O(n^2) yechish mumkin, lekin samarali yechim merge sort asosida O(n log n) vaqtda ishlaydi.",
    "examples": [
      {
        "input": "1 3 2 3 1",
        "output": "2",
        "explanation": "Juftliklar: (1,4) chunki arr[1]=3 > 2*arr[4]=2; (3,4) chunki arr[3]=3 > 2*arr[4]=2"
      },
      {
        "input": "2 4 3 5 1",
        "output": "3",
        "explanation": "Juftliklar: (1,4), (2,4), (3,4)"
      }
    ],
    "constraints": "1 <= massiv uzunligi <= 5*10^4\n-2^31 <= element <= 2^31 - 1",
    "starter_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<long long> arr;\n    long long x;\n    while (cin >> x) arr.push_back(x);\n    // Kodingizni shu yerga yozing (merge sort asosida O(n log n), yoki oddiy O(n^2))\n\n    return 0;\n}",
    "starter_python": "arr = list(map(int, input().split()))\n# Kodingizni shu yerga yozing (merge sort asosida O(n log n), yoki oddiy O(n^2))\n",
    "starter_kotlin": "fun main() {\n    val arr = readLine()!!.trim().split(\" \").map { it.toLong() }\n    // Kodingizni shu yerga yozing (merge sort asosida O(n log n), yoki oddiy O(n^2))\n}",
    "solution_cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nlong long countAndMerge(vector<long long>& arr, int left, int mid, int right) {\n    long long count = 0;\n    int j = mid + 1;\n    for (int i = left; i <= mid; i++) {\n        while (j <= right && arr[i] > 2LL * arr[j]) j++;\n        count += (j - (mid + 1));\n    }\n\n    vector<long long> merged;\n    int i = left, k = mid + 1;\n    while (i <= mid && k <= right) {\n        if (arr[i] <= arr[k]) merged.push_back(arr[i++]);\n        else merged.push_back(arr[k++]);\n    }\n    while (i <= mid) merged.push_back(arr[i++]);\n    while (k <= right) merged.push_back(arr[k++]);\n    for (int t = 0; t < (int)merged.size(); t++) arr[left + t] = merged[t];\n\n    return count;\n}\n\nlong long mergeSortCount(vector<long long>& arr, int left, int right) {\n    if (left >= right) return 0;\n    int mid = left + (right - left) / 2;\n    long long count = mergeSortCount(arr, left, mid) + mergeSortCount(arr, mid + 1, right);\n    count += countAndMerge(arr, left, mid, right);\n    return count;\n}\n\nint main() {\n    vector<long long> arr;\n    long long x;\n    while (cin >> x) arr.push_back(x);\n\n    cout << mergeSortCount(arr, 0, (int)arr.size() - 1) << endl;\n    return 0;\n}",
    "solution_python": "import sys\n\ndef count_and_merge(arr, left, mid, right):\n    count = 0\n    j = mid + 1\n    for i in range(left, mid + 1):\n        while j <= right and arr[i] > 2 * arr[j]:\n            j += 1\n        count += (j - (mid + 1))\n\n    merged = []\n    i, k = left, mid + 1\n    while i <= mid and k <= right:\n        if arr[i] <= arr[k]:\n            merged.append(arr[i]); i += 1\n        else:\n            merged.append(arr[k]); k += 1\n    merged.extend(arr[i:mid + 1])\n    merged.extend(arr[k:right + 1])\n    arr[left:right + 1] = merged\n    return count\n\ndef merge_sort_count(arr, left, right):\n    if left >= right:\n        return 0\n    mid = left + (right - left) // 2\n    count = merge_sort_count(arr, left, mid) + merge_sort_count(arr, mid + 1, right)\n    count += count_and_merge(arr, left, mid, right)\n    return count\n\narr = list(map(int, input().split()))\nprint(merge_sort_count(arr, 0, len(arr) - 1))"
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

async function seedTopic() {
  const existingTopics = await getList('topics')
  const users = await getList('users')
  const teacher = users.find(u => u.role === 'teacher')

  // Eski A3 mavzusining order_num'ini saqlab qolamiz (topilmasa, standart 3 ishlatiladi)
  const oldA3 = existingTopics.find(t => t.course_id === COURSE_ID && /^A3\./.test(t.title))
  const orderNum = oldA3 ? oldA3.order_num : 3

  const keptTopics = existingTopics.filter(t => {
    if (t.course_id !== COURSE_ID) return true
    return !/^A3\./.test(t.title)   // faqat eski A3'ni olib tashlaymiz, A1/A2/A4-A7ga tegmaymiz
  })

  if (oldA3) {
    console.log(`Eski A3 mavzusi topildi va olib tashlandi: "${oldA3.title}"`)
  } else {
    console.log('Eski A3 mavzusi topilmadi (birinchi marta qo\'shilmoqda).')
  }

  const newTopic = {
    id: nextId(existingTopics),
    course_id: COURSE_ID,
    title: NEW_TOPIC.title,
    content: NEW_TOPIC.content,
    cpp_example: NEW_TOPIC.cpp_example,
    python_example: NEW_TOPIC.python_example,
    kotlin_example: NEW_TOPIC.kotlin_example,
    order_num: orderNum,
    created_by: teacher ? teacher.id : 1,
    created_at: new Date().toISOString(),
  }

  const updatedTopics = [...keptTopics, newTopic]
  await setList('topics', updatedTopics)
  console.log(`+ Yangi A3 mavzusi qo'shildi (order_num=${orderNum}): "${newTopic.title}"`)
  console.log(`Jami mavzular bazada: ${updatedTopics.length}`)
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
  console.log('=== DSA kursi A3 mavzusini yangilash ===')
  await seedTopic()
  console.log('')
  console.log('=== DSA kursi A3 uchun LeetCode masalalarini qo\'shish ===')
  await seedProblems()
  console.log('')
  console.log('Tayyor! Saytni yangilab ko\'ring: /courses/dsa va /practice')
}

main().catch(err => {
  console.error('XATO:', err)
  process.exit(1)
})

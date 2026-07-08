@echo off
echo ===================================
echo   CyberUniversity - Ishga tushirish
echo ===================================
echo.

echo [1/3] node_modules tozalanmoqda...
if exist node_modules (
  rmdir /s /q node_modules
)
if exist package-lock.json del package-lock.json

echo [2/3] Paketlar o'rnatilmoqda...
call npm install
if errorlevel 1 (
  echo XATO: npm install muvaffaqiyatsiz tugadi
  pause
  exit /b 1
)

echo.
echo [3/3] Server ishga tushirilmoqda...
echo.
echo ===================================
echo   http://localhost:3000 da oching
echo   Demo: teacher@cyber.uz / password123
echo   Demo: student@cyber.uz / password123
echo ===================================
echo.
call npm run dev

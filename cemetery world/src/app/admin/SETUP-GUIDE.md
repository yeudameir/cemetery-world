# 📋 הוראות הקמה — שלב אחר שלב

## שלב 1: הקמת מסד הנתונים ב-Supabase (5 דקות)

### 1.1 פתח חשבון Supabase
1. לך ל-https://supabase.com
2. לחץ "Start your project" ← הירשם עם Gmail
3. לחץ "New Project"
4. בחר שם לפרויקט: `cemetery-world` (למשל)
5. בחר סיסמה חזקה — שמור אותה!
6. בחר אזור: `Europe (Frankfurt)` — הכי קרוב לישראל
7. המתן 2-3 דקות עד שהפרויקט מוכן

### 1.2 הפעלת הסכמה (מבנה מסד הנתונים)
1. בתפריט השמאלי לחץ על **SQL Editor**
2. לחץ **New query**
3. פתח את הקובץ `supabase-schema.sql` מהפרויקט
4. העתק את כל התוכן ← הדבק בחלון ה-SQL Editor
5. לחץ **Run** (הכפתור הירוק)
6. אמור לראות "Success" ✅

### 1.3 יצירת Storage Bucket לתמונות
1. בתפריט לחץ **Storage**
2. לחץ **New bucket**
3. שם: `grave-images`
4. סמן **Public bucket** ✅
5. לחץ **Create bucket**

### 1.4 קבלת המפתחות
1. בתפריט לחץ **Settings** (גלגל שיניים) → **API**
2. העתק את:
   - **Project URL** (נראה כמו `https://xxxx.supabase.co`)
   - **anon public** key (מפתח ארוך)

---

## שלב 2: הגדרת קובץ הסביבה

1. בתיקיית הפרויקט, צור קובץ בשם `.env.local`
2. הדבק בתוכו:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

(החלף בערכים האמיתיים מהשלב הקודם)

---

## שלב 3: הרצה מקומית לבדיקה (אופציונלי)

אם יש לך Node.js מותקן:
```bash
npm install
npm run dev
```
פתח בדפדפן: http://localhost:3000

---

## שלב 4: העלאה ל-Vercel (5 דקות)

### 4.1 העלאה ל-GitHub
1. פתח חשבון GitHub בחינם: https://github.com
2. צור Repository חדש בשם `cemetery-world`
3. העלה את כל תיקיית הפרויקט

### 4.2 חיבור ל-Vercel
1. פתח חשבון Vercel: https://vercel.com (התחבר עם GitHub)
2. לחץ **New Project**
3. בחר את ה-Repository שיצרת
4. לחץ **Import**

### 4.3 הוספת משתני הסביבה ב-Vercel
1. לפני הלחיצה על Deploy, פתח **Environment Variables**
2. הוסף:
   - `NEXT_PUBLIC_SUPABASE_URL` = הכתובת שלך
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = המפתח שלך
3. לחץ **Deploy**
4. המתן 2-3 דקות

### 4.4 הכתובת שלך מוכנה!
האתר יהיה זמין בכתובת: `https://cemetery-world.vercel.app`
(או שם דומה שVercel ייתן)

---

## שלב 5: הוספת תוכן ראשון

1. גש ל-`yoursite.vercel.app/admin`
2. לחץ **הוסף בית עלמין** — הוסף את שפו, מרוקו
3. לחץ **הוסף מצבה** — הוסף את המצבה הראשונה
4. בדוק שהכל מופיע בעמוד הבית

---

## 🆘 עזרה ותמיכה

אם נתקלת בבעיה, שלח לי את הודעת השגיאה ואעזור לתקן.

---

## 🔒 אבטחת פאנל הניהול (שלב מתקדם)

כרגע פאנל הניהול פתוח — כל אחד שיודע את הכתובת יכול להיכנס.
לאחר שהאתר עובד, נוסיף סיסמה על `/admin` — זה 10 דקות עבודה.

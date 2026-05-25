const SUPABASE_URL = 'https://vsurgimkuuxdmalxawfr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdXJnaW1rdXV4ZG1hbHhhd2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDg1NTUsImV4cCI6MjA5MDY4NDU1NX0.N6BHHblAiwsZQ09LZaphrqqNCkpCbomDX1orZSkBLg0';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const phoneInput = document.getElementById('phoneInput');
const checkBtn = document.getElementById('checkBtn');
const loginStep = document.getElementById('loginStep');
const previewStep = document.getElementById('previewStep');

let currentStudent = null;

// 1. ฟังก์ชันตรวจสอบเบอร์โทร (Preview)
checkBtn.addEventListener('click', async () => {
    const phone = phoneInput.value.trim();

    if (phone.length < 10) {
        return Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกเบอร์โทรให้ครบ 10 หลัก', 'warning');
    }

    checkBtn.disabled = true;
    checkBtn.textContent = '⏳ กำลังค้นหา...';

    try {
        // แก้ไข: ดึงค่า is_active มาจากตาราง courses ด้วย
        const { data, error } = await db
            .from('students')
            .select(`
                id, nickname, full_name, school,
                enrollments (
                    course_code,
                    courses (course_name, is_active)
                )
            `)
            .eq('phone', phone)
            .single();

        if (error || !data) {
            throw new Error('ไม่พบข้อมูลเบอร์โทรศัพท์นี้ในระบบ');
        }

        // เก็บข้อมูลลงตัวแปร global
        currentStudent = data;
        
        // ส่งข้อมูลไปแสดงผล
        showPreview(data);

    } catch (err) {
        Swal.fire('ไม่พบข้อมูล', err.message, 'error');
    } finally {
        checkBtn.disabled = false;
        checkBtn.textContent = 'ตรวจสอบข้อมูล';
    }
});

// 2. แสดงผล Preview (กรองเฉพาะคอร์สที่เปิดอยู่)
function showPreview(student) {
    document.getElementById('studentName').textContent = `น้อง${student.nickname} (${student.full_name})`;
    
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';

    // แก้ไข: กรองเอาเฉพาะคอร์สที่ courses.is_active เป็น true เท่านั้น
    const activeEnrollments = student.enrollments.filter(item => 
        item.courses && item.courses.is_active === true
    );

    if (activeEnrollments.length > 0) {
        activeEnrollments.forEach(item => {
            const badge = document.createElement('span');
            badge.className = 'px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold border border-blue-200';
            badge.textContent = item.courses.course_name;
            courseList.appendChild(badge);
        });
        
        // เปิดปุ่มยืนยันถ้ามีคอร์สที่เข้าเรียนได้
        document.getElementById('confirmBtn').disabled = false;
        document.getElementById('confirmBtn').classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        // กรณีไม่มีคอร์สที่เปิดอยู่เลย
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'text-slate-400 text-xs italic';
        emptyMsg.textContent = 'ไม่มีคอร์สที่กำลังเปิดเรียนในขณะนี้';
        courseList.appendChild(emptyMsg);

        // ปิดปุ่มยืนยัน (optional)
        document.getElementById('confirmBtn').disabled = true;
        document.getElementById('confirmBtn').classList.add('opacity-50', 'cursor-not-allowed');
    }

    loginStep.classList.add('hidden');
    previewStep.classList.remove('hidden');
}

// 3. ปุ่มยกเลิก
document.getElementById('cancelBtn').addEventListener('click', () => {
    currentStudent = null;
    phoneInput.value = '';
    previewStep.classList.add('hidden');
    loginStep.classList.remove('hidden');
});

// 4. ปุ่มยืนยันเข้าเรียน
document.getElementById('confirmBtn').addEventListener('click', () => {
    if (!currentStudent) return;

    // กรองคอร์สอีกครั้งก่อนเซฟลง Session เพื่อความถูกต้อง
    const activeEnrollments = currentStudent.enrollments.filter(item => 
        item.courses && item.courses.is_active === true
    );

    // สร้าง Object ใหม่สำหรับเก็บใน Session ที่มีเฉพาะคอร์สที่ Active
    const sessionData = {
        ...currentStudent,
        enrollments: activeEnrollments
    };

    sessionStorage.setItem('student_user', JSON.stringify(sessionData));
    
    Swal.fire({
        title: 'สำเร็จ!',
        text: 'กำลังพาไปที่หน้าบทเรียน...',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false
    }).then(() => {
        window.location.href = 'dashboard.html';
    });
});
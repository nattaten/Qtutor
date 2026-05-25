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
        // ดึงข้อมูลนักเรียนพร้อมกับคอร์สที่ลงทะเบียน (เชื่อมตาราง)
        const { data, error } = await db
            .from('students')
            .select(`
                id, nickname, full_name, school,
                enrollments (
                    course_code,
                    courses (course_name)
                )
            `)
            .eq('phone', phone)
            .single();

        if (error || !data) {
            throw new Error('ไม่พบข้อมูลเบอร์โทรศัพท์นี้ในระบบ');
        }

        currentStudent = data;
        showPreview(data);

    } catch (err) {
        Swal.fire('ไม่พบข้อมูล', err.message, 'error');
    } finally {
        checkBtn.disabled = false;
        checkBtn.textContent = 'ตรวจสอบข้อมูล';
    }
});

// 2. แสดงผล Preview
function showPreview(student) {
    document.getElementById('studentName').textContent = `น้อง${student.nickname} (${student.full_name})`;
    
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';

    student.enrollments.forEach(item => {
        const badge = document.createElement('span');
        badge.className = 'px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold border border-blue-200';
        badge.textContent = item.courses.course_name;
        courseList.appendChild(badge);
    });

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
    // เก็บข้อมูลลง Session และไปที่หน้า Dashboard
    sessionStorage.setItem('student_user', JSON.stringify(currentStudent));
    
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
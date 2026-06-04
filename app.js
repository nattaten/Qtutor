const SUPABASE_URL = 'https://vsurgimkuuxdmalxawfr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdXJnaW1rdXV4ZG1hbHhhd2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDg1NTUsImV4cCI6MjA5MDY4NDU1NX0.N6BHHblAiwsZQ09LZaphrqqNCkpCbomDX1orZSkBLg0';
const db = window.supabase ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const phoneInput = document.getElementById('phoneInput');
const checkBtn = document.getElementById('checkBtn');
const loginStep = document.getElementById('loginStep');
const previewStep = document.getElementById('previewStep');

let currentStudent = null;

checkBtn.addEventListener('click', async () => {
    const phone = phoneInput.value.trim();

    if (!db) {
        return Swal.fire('ระบบยังไม่พร้อม', 'ไม่สามารถโหลด Supabase ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วรีเฟรชหน้าอีกครั้ง', 'error');
    }

    if (phone.length < 10) {
        return Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกเบอร์โทรให้ครบ 10 หลัก', 'warning');
    }

    checkBtn.disabled = true;
    checkBtn.textContent = 'กำลังค้นหา...';

    try {
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

        currentStudent = data;
        showPreview(data);
    } catch (err) {
        Swal.fire('ไม่พบข้อมูล', err.message, 'error');
    } finally {
        checkBtn.disabled = false;
        checkBtn.textContent = 'ตรวจสอบข้อมูล';
    }
});

function showPreview(student) {
    document.getElementById('studentName').textContent = `น้อง${student.nickname} (${student.full_name})`;

    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';

    const activeEnrollments = (student.enrollments || []).filter(item =>
        item.courses && item.courses.is_active === true
    );

    if (activeEnrollments.length > 0) {
        activeEnrollments.forEach(item => {
            const badge = document.createElement('span');
            badge.className = 'rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm';
            badge.textContent = item.courses.course_name;
            courseList.appendChild(badge);
        });

        document.getElementById('confirmBtn').disabled = false;
        document.getElementById('confirmBtn').classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-500';
        emptyMsg.textContent = 'ไม่มีคอร์สที่กำลังเปิดเรียนในขณะนี้';
        courseList.appendChild(emptyMsg);

        document.getElementById('confirmBtn').disabled = true;
        document.getElementById('confirmBtn').classList.add('opacity-50', 'cursor-not-allowed');
    }

    loginStep.classList.add('hidden');
    previewStep.classList.remove('hidden');
}

document.getElementById('cancelBtn').addEventListener('click', () => {
    currentStudent = null;
    phoneInput.value = '';
    previewStep.classList.add('hidden');
    loginStep.classList.remove('hidden');
});

document.getElementById('confirmBtn').addEventListener('click', () => {
    if (!currentStudent) return;

    const activeEnrollments = (currentStudent.enrollments || []).filter(item =>
        item.courses && item.courses.is_active === true
    );

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

// 1. ตั้งค่าการเชื่อมต่อ (ใช้ชื่อ db ตามที่คุณต้องการ)
const SUPABASE_URL = 'https://vsurgimkuuxdmalxawfr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdXJnaW1rdXV4ZG1hbHhhd2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDg1NTUsImV4cCI6MjA5MDY4NDU1NX0.N6BHHblAiwsZQ09LZaphrqqNCkpCbomDX1orZSkBLg0'; // (คีย์เดิมของคุณ)

// สร้าง Client
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const levelSelect = document.getElementById('levelSelect');
const nicknameSelect = document.getElementById('nicknameSelect');
const loginBtn = document.getElementById('loginBtn');

// 1. เมื่อเลือกระดับชั้น (คอร์ส) ให้ไปดึงชื่อนักเรียนในคอร์สนั้นมาโชว์
levelSelect.addEventListener('change', async (e) => {
    const courseCode = e.target.value;
    
    if (!courseCode) {
        nicknameSelect.disabled = true;
        nicknameSelect.innerHTML = '<option value="">-- กรุณาเลือกระดับชั้นก่อน --</option>';
        return;
    }

    // เปลี่ยนจาก supabase เป็น db ให้ตรงกับที่ประกาศไว้ข้างบน
    const { data, error } = await db
        .from('students')
        .select('nickname')
        .eq('course_code', courseCode); 

    if (error) {
        console.error("Error fetching students:", error);
        return;
    }

    if (data) {
        nicknameSelect.disabled = false;
        nicknameSelect.innerHTML = '<option value="">-- เลือกชื่อของคุณ --</option>';
        data.forEach(student => {
            nicknameSelect.innerHTML += `<option value="${student.nickname}">${student.nickname}</option>`;
        });
    }
});

// 2. ฟังก์ชัน Login
loginBtn.addEventListener('click', async () => {
    const course = levelSelect.value;
    const nick = nicknameSelect.value;
    const phone = document.getElementById('phoneInput').value.trim();

    if (!course || !nick || !phone) {
        return Swal.fire('กรอกข้อมูลไม่ครบ', 'กรุณาเลือกคอร์ส ชื่อ และเบอร์โทร', 'warning');
    }

    // เปลี่ยนจาก supabase เป็น db
    const { data, error } = await db
        .from('students')
        .select('*')
        .eq('course_code', course)
        .eq('nickname', nick)
        .eq('phone', phone)
        .single();

    if (data) {
        // เก็บข้อมูลนักเรียนไว้ใช้ในหน้า Dashboard
        sessionStorage.setItem('student_user', JSON.stringify(data));
        
        Swal.fire({
            title: 'เข้าสู่ระบบสำเร็จ!',
            text: `ยินดีต้อนรับน้อง ${data.nickname}`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            window.location.href = 'dashboard.html'; 
        });
    } else {
        Swal.fire('ข้อมูลไม่ถูกต้อง', 'ไม่พบชื่อนี้ในคอร์ส หรือเบอร์โทรไม่ตรง', 'error');
    }
});
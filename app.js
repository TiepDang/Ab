// Khởi tạo bộ nhớ dữ liệu
let attendanceLogs = JSON.parse(localStorage.getItem('attendanceLogs')) || [];
let userCode = localStorage.getItem('userCode') || '121221';

// 1. Đồng hồ thời gian thực
function updateClock() {
    const nowTime = new Date();
    const hours = String(nowTime.getHours()).padStart(2, '0');
    const minutes = String(nowTime.getMinutes()).padStart(2, '0');
    const seconds = String(nowTime.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.innerText = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);

// 2. Chấm công nhanh Hôm nay
function quickCheck(type) {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const workValue = parseFloat(document.getElementById('today-work-type').value);

    let logIndex = attendanceLogs.findIndex(item => item.date === dateKey);
    if (logIndex > -1) {
        if (type === 'Vào') attendanceLogs[logIndex].inTime = timeStr;
        if (type === 'Về') attendanceLogs[logIndex].outTime = timeStr;
        attendanceLogs[logIndex].work = workValue;
    } else {
        attendanceLogs.push({
            date: dateKey,
            inTime: type === 'Vào' ? timeStr : '--:--',
            outTime: type === 'Về' ? timeStr : '--:--',
            work: workValue
        });
    }
    saveAndRender();
    alert(`Đã ghi nhận ${type} ca lúc ${timeStr}`);
}

// 3. Chấm công ngày bất kỳ
function saveCustomDate() {
    const selectedDate = document.getElementById('custom-date').value;
    const workValue = parseFloat(document.getElementById('custom-work-type').value);
    const inTime = document.getElementById('custom-in').value || '--:--';
    const outTime = document.getElementById('custom-out').value || '--:--';

    if (!selectedDate) return alert("Vui lòng chọn ngày!");

    let logIndex = attendanceLogs.findIndex(item => item.date === selectedDate);
    if (logIndex > -1) {
        attendanceLogs[logIndex].inTime = inTime;
        attendanceLogs[logIndex].outTime = outTime;
        attendanceLogs[logIndex].work = workValue;
    } else {
        attendanceLogs.push({ date: selectedDate, inTime, outTime, work: workValue });
    }
    saveAndRender();
    alert("Đã lưu thành công!");
}

// 4. Các hàm bổ trợ hiển thị danh sách
function getVietnameseDayName(dateString) {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[new Date(dateString).getDay()];
}

function formatDateVN(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function deleteLog(index) {
    if (confirm("Xóa ngày chấm công này?")) {
        attendanceLogs.splice(index, 1);
        saveAndRender();
    }
}

function saveAndRender() {
    attendanceLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('attendanceLogs', JSON.stringify(attendanceLogs));
    renderLogs();
}

// 5. Hiển thị bảng dữ liệu lên màn hình
function renderLogs() {
    const tableBody = document.getElementById('log-table-body');
    const filterFrom = document.getElementById('filter-from').value;
    const filterTo = document.getElementById('filter-to').value;
    
    if (!tableBody) return;
    tableBody.innerHTML = '';
    let totalWork = 0;

    attendanceLogs.forEach((log, index) => {
        if (filterFrom && log.date < filterFrom) return;
        if (filterTo && log.date > filterTo) return;

        totalWork += log.work;
        const row = document.createElement('tr');
        row.className = "border-b border-slate-100";
        row.innerHTML = `
            <td class="py-3 font-medium">
                <div class="font-bold text-slate-800">${getVietnameseDayName(log.date)}</div>
                <div class="text-[10px] text-slate-400">${formatDateVN(log.date)}</div>
            </td>
            <td class="py-3 text-center text-green-600 font-semibold">${log.inTime}</td>
            <td class="py-3 text-center text-red-500 font-semibold">${log.outTime}</td>
            <td class="py-3 text-center font-bold text-indigo-600">${log.work}</td>
            <td class="py-3 text-center">
                <button onclick="deleteLog(${index})" class="text-red-500">❌</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('total-work').innerText = `${totalWork} công`;
    document.getElementById('user-code-btn').innerText = `Mã của bạn: ${userCode} (Bấm để tải lại hoặc tự đặt mã mới)`;
}

// 6. Xuất báo cáo CSV và Đổi mã cá nhân
function exportToCSV() {
    if (attendanceLogs.length === 0) return alert("Không có dữ liệu!");
    let csvContent = "\uFEFFThu,Ngay,Gio Vao,Gio Ve,So Cong\n";
    attendanceLogs.forEach(log => {
        csvContent += `"${getVietnameseDayName(log.date)}","${formatDateVN(log.date)}","${log.inTime}","${log.outTime}","${log.work}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Bang_Cong_${userCode}.csv`;
    link.click();
}

function regenerateUserCode() {
    let newCode = prompt("Nhập mã số cá nhân mới:", userCode);
    if (newCode && newCode.trim() !== "") {
        userCode = newCode.trim();
        localStorage.setItem('userCode', userCode);
        renderLogs();
    }
}

// Khởi chạy khi tải trang
window.onload = function() {
    const customDateInput = document.getElementById('custom-date');
    if (customDateInput) customDateInput.value = new Date().toISOString().split('T')[0];
    updateClock();
    renderLogs();
};

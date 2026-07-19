// Khởi tạo mảng dữ liệu từ bộ nhớ localStorage của thiết bị
let attendanceLogs = JSON.parse(localStorage.getItem('attendanceLogs')) || [];
let userCode = localStorage.getItem('userCode') || '121221';

// 1. Chạy đồng hồ hiển thị thời gian thực theo từng giây
function updateClock() {
    const nowTime = new Date();
    const hours = String(nowTime.getHours()).padStart(2, '0');
    const minutes = String(nowTime.getMinutes()).padStart(2, '0');
    const seconds = String(nowTime.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.innerText = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);

// Hàm lấy ngày hôm nay định dạng chuẩn YYYY-MM-DD cho hệ thống máy hiểu
function getTodayYYYYMMDD() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 2. Hàm Chấm công nhanh cho nút Vào Làm / Tan Làm Hôm Nay
function quickCheck(type) {
    const dateKey = getTodayYYYYMMDD(); 
    const nowTime = new Date();
    const timeStr = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}`;
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

// 3. Hàm lưu dữ liệu cho khối "Chấm công ngày bất kỳ"
function saveCustomDate() {
    const selectedDate = document.getElementById('custom-date').value;
    const workValue = parseFloat(document.getElementById('custom-work-type').value);
    const inTime = document.getElementById('custom-in').value || '--:--';
    const outTime = document.getElementById('custom-out').value || '--:--';

    if (!selectedDate) {
        alert("Vui lòng chọn ngày trước khi bấm lưu!");
        return;
    }

    let logIndex = attendanceLogs.findIndex(item => item.date === selectedDate);
    if (logIndex > -1) {
        attendanceLogs[logIndex].inTime = inTime;
        attendanceLogs[logIndex].outTime = outTime;
        attendanceLogs[logIndex].work = workValue;
    } else {
        attendanceLogs.push({ date: selectedDate, inTime, outTime, work: workValue });
    }
    saveAndRender();
    alert("Đã lưu dữ liệu chấm công thành công!");
}

// 4. Các hàm định dạng hiển thị tiếng Việt trên giao diện bảng công
function getVietnameseDayName(dateString) {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[new Date(dateString).getDay()];
}

// Định dạng hiển thị ngày phụ dạng DD/MM/YYYY
function formatDateSub(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Hàm bổ trợ định dạng xuất file excel ngày dạng DD.M.YYYY
function formatDateVN(dateString) {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

// 5. Hàm sửa dữ liệu dòng khi bấm nút Bút chì (Đồng bộ điền ngược thông tin)
function editLog(index) {
    const log = attendanceLogs[index];
    document.getElementById('custom-date').value = log.date;
    document.getElementById('custom-work-type').value = log.work;
    document.getElementById('custom-in').value = log.inTime === '--:--' ? '08:00' : log.inTime;
    document.getElementById('custom-out').value = log.outTime === '--:--' ? '17:00' : log.outTime;
    document.getElementById('custom-date').scrollIntoView({ behavior: 'smooth' });
}

// 6. Hàm xử lý xóa một dòng chấm công
function deleteLog(index) {
    if (confirm("Bạn có chắc chắn muốn xóa ngày chấm công này không?")) {
        attendanceLogs.splice(index, 1);
        saveAndRender();
    }
}

// 7. Hàm đồng bộ lưu trữ vào LocalStorage và sắp xếp ngày mới nhất lên trên
function saveAndRender() {
    attendanceLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('attendanceLogs', JSON.stringify(attendanceLogs));
    renderLogs();
}

// 8. ĐÃ SỬA: Tách rời 2 nút hành động độc lập, tạo không gian chạm nút bấm siêu nhạy
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
            <td class="py-3 text-left">
                <div style="font-weight: 800; color: #1e293b;">${getVietnameseDayName(log.date)}</div>
                <div style="font-size: 10px; color: #94a3b8; font-weight: 500;">${formatDateSub(log.date)}</div>
            </td>
            <td class="py-3 text-center" style="color: #2ecc71;">${log.inTime}</td>
            <td class="py-3 text-center" style="color: #ff4757;">${log.outTime}</td>
            <td class="py-3 text-center" style="color: #546de5;">${log.work}</td>
            <td class="py-3 text-center" style="white-space: nowrap;">
                <button onclick="editLog(${index})" class="action-btn" style="margin-right: 10px;">✏️</button>
                <button onclick="deleteLog(${index})" class="action-btn">❌</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    const totalWorkEl = document.getElementById('total-work');
    if (totalWorkEl) totalWorkEl.innerText = `${totalWork} công`;
    
    const userCodeBtn = document.getElementById('user-code-btn');
    if (userCodeBtn) userCodeBtn.innerText = `Mã của bạn: ${userCode} (Bấm để tải lại hoặc tự đặt mã mới)`;
}

// 9. Xuất file báo cáo dạng Excel (CSV)
function exportToCSV() {
    if (attendanceLogs.length === 0) {
        alert("Không có dữ liệu để xuất file!");
        return;
    }
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

// 10. Đổi mã số cá nhân
function regenerateUserCode() {
    let newCode = prompt("Nhập mã số cá nhân mới của bạn:", userCode);
    if (newCode && newCode.trim() !== "") {
        userCode = newCode.trim();
        localStorage.setItem('userCode', userCode);
        renderLogs();
    }
}

// 11. Đảm bảo toàn bộ cấu trúc giao diện HTML đã tải xong mới khởi tạo dữ liệu mặc định
document.addEventListener("DOMContentLoaded", function() {
    const customDateInput = document.getElementById('custom-date');
    if (customDateInput) {
        customDateInput.value = getTodayYYYYMMDD(); 
    }
    updateClock();
    renderLogs();
});

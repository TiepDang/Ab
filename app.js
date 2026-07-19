// Khởi tạo mảng dữ liệu từ bộ nhớ localStorage của thiết bị
let attendanceLogs = JSON.parse(localStorage.getItem('attendanceLogs')) || [];
let userCode = localStorage.getItem('userCode') || '121221';

// 1. Chạy đồng hồ hiển thị thời gian thực theo từng giây giống ảnh
function updateClock() {
    const nowTime = new Date();
    const hours = String(nowTime.getHours()).padStart(2, '0');
    const minutes = String(nowTime.getMinutes()).padStart(2, '0');
    const seconds = String(nowTime.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.innerText = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);

// 2. Hàm Chấm công nhanh cho nút Vào Làm / Tan Làm Hôm Nay
function quickCheck(type) {
    const now = new Date();
    // Lấy ngày theo định dạng YYYY-MM-DD làm Key lưu trữ hệ thống
    const dateKey = now.toLocaleDateString('sv').split(' ')[0]; 
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

// Định dạng hiển thị ngày dạng DD.M.YYYY giống hệt trong ảnh mẫu của bạn (19.7.2026)
function formatDateVN(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Định dạng hiển thị ngày phụ dạng DD/MM/YYYY nằm nhỏ ở dưới tên Thứ (19/07/2026)
function formatDateSub(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// 5. Hàm xử lý sửa đổi dữ liệu dòng khi bấm nút Bút chì
function editLog(index) {
    const log = attendanceLogs[index];
    document.getElementById('custom-date').value = log.date;
    document.getElementById('custom-work-type').value = log.work;
    document.getElementById('custom-in').value = log.inTime === '--:--' ? '08:00' : log.inTime;
    document.getElementById('custom-out').value = log.outTime === '--:--' ? '17:00' : log.outTime;
    
    // Cuộn màn hình lên khối nhập liệu để người dùng sửa tiện lợi
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

// 8. Hàm hiển thị danh sách dữ liệu lên màn hình bảng công chi tiết
function renderLogs() {
    const tableBody = document.getElementById('log-table-body');
    const filterFrom = document.getElementById('filter-from').value;
    const filterTo = document.getElementById('filter-to').value;
    
    if (!tableBody) return;
    tableBody.innerHTML = '';
    let totalWork = 0;

    attendanceLogs.forEach((log, index) => {
        // Lọc dữ liệu theo khoảng ngày nếu người dùng chọn bộ lọc
        if (filterFrom && log.date < filterFrom) return;
        if (filterTo && log.date > filterTo) return;

        totalWork += log.work;
        const row = document.createElement('tr');
        row.className = "border-b border-slate-100 hover:bg-slate-50";
        row.innerHTML = `
            <td class="py-3 font-medium">
                <div class="font-bold text-slate-800">${getVietnameseDayName(log.date)}</div>
                <div class="text-[10px] text-slate-400">${formatDateSub(log.date)}</div>
            </td>
            <td class="py-3 text-center text-green-600 font-semibold">${log.inTime}</td>
            <td class="py-3 text-center text-red-500 font-semibold">${log.outTime}</td>
            <td class="py-3 text-center font-bold text-indigo-600">${log.work}</td>
            <td class="py-3 text-center space-x-2">
                <!-- Nút sửa hình cây bút chì giống ảnh -->
                <button onclick="editLog(${index})" class="text-blue-500 hover:text-blue-700 text-sm p-1 transition" title="Sửa">✏️</button>
                <!-- Nút xóa hình dấu X màu đỏ giống ảnh -->
                <button onclick="deleteLog(${index})" class="text-red-500 hover:text-red-700 text-sm p-1 transition" title="Xóa">❌</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Cập nhật lại số công tích lũy hiển thị ở khối trên cùng
    const totalWorkEl = document.getElementById('total-work');
    if (totalWorkEl) totalWorkEl.innerText = `${totalWork} công`;
    
    const userCodeBtn = document.getElementById('user-code-btn');
    if (userCodeBtn) userCodeBtn.innerText = `Mã của bạn: ${userCode} (Bấm để tải lại hoặc tự đặt mã mới)`;
}

// 9. Xuất file báo cáo dạng Excel (CSV) không lỗi font tiếng Việt
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

// 11. Đảm bảo toàn bộ cấu trúc giao diện HTML đã tải xong mới bắt đầu dựng dữ liệu
document.addEventListener("DOMContentLoaded", function() {
    const customDateInput = document.getElementById('custom-date');
    if (customDateInput) {
        // Khởi tạo ngày hiển thị mặc định trên ô nhập liệu
        const today = new Date();
        customDateInput.value = today.toLocaleDateString('sv').split(' ')[0];
    }
    updateClock();
    renderLogs(); // Đọc dữ liệu từ bộ nhớ LocalStorage hiển thị lên bảng công
});

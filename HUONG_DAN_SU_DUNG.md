# 📘 CẨM NANG SỬ DỤNG DÀNH CHO GIÁO VIÊN
**Dự án: Trò Chơi Hóa Học (Không Gian Giáo Viên)**

Chào mừng thầy/cô đến với nền tảng **Trò Chơi Hóa Học**! Hệ thống này được xây dựng giúp giáo viên dễ dàng số hóa giáo án, tạo ra các trò chơi trắc nghiệm (Đúng/Sai, 4 Lựa chọn) và trực tiếp giao bài để tăng tương tác với học sinh.

Dưới đây là hướng dẫn từng bước để làm chủ hệ thống "Không Gian Giáo Viên".

---

## 🛑 Mở Đầu: Cách Đăng Nhập
Hệ thống linh hoạt hỗ trợ 3 chế độ đăng nhập dành cho Giáo Viên:
1. Đăng nhập bằng Email/Pass thông qua hệ thống **Firebase Authentication** thật.
2. Dùng chức năng **Đăng ký** mới (khi chưa có tài khoản) trong hệ thống và chọn đúng ô vai trò Giáo Viên.
3. Đăng nhập trải nghiệm cực nhanh qua danh sách **Tài Khoản Demo (Không cần cài đặt gì thêm):**
   * **Tài khoản 1:** `nvxo@gmail.com` | **Mật khẩu:** `123456`
   * **Tài khoản 2:** `ntmb@gmail.com` | **Mật khẩu:** `123456`
   * **Tài khoản 3:** `giaovien@app.com` | **Mật khẩu:** `123456`

*(Lưu ý: Mọi dự liệu trên Demo có thể được dùng chung, nếu muốn độc lập hoàn toàn, thầy/cô cần phải gắn Firebase vào mã nguồn hoặc Đăng ký tài khoản khác)*

---

## 🛠 QUY TRÌNH CHUẨN 4 BƯỚC SỬ DỤNG CHO GIÁO VIÊN

### BƯỚC 1: Xây Dựng "Lớp Học" Của Bạn
Trước khi giao bài tập hay trò chơi cho học sinh, thầy/cô cần phải tạo trước các tập thể lớp.
- **Nơi thực hiện:** Cột tính năng `Quản lý` -> Menu **Lớp học** (`/teacher/classes`).
- **Cách thao tác:** 
  1. Nhấn nút màu tím `+ Thêm Lớp Mới`.
  2. Đặt tên Lớp (VD: 12A1), Cấp độ, Ghi chú năm học.
  3. Lớp học sinh ra sẽ có một **Mã Lớp Học (Class ID)**. Thầy cô copy gửi mã này cho học sinh lớp đó. Khi học sinh đăng nhập, các em chỉ cần nhập mã này là sẽ được ghi danh dưới trướng quản lý của thầy/cô!

### BƯỚC 2: Kiến Tạo "Ngân Hàng Câu Hỏi"
Đây là khối tài sản quý giá nhất của thầy/cô. Tại đây, thầy/cô có thể tạo ra các câu hỏi trắc nghiệm tương tác mới.
- **Nơi thực hiện:** Nút `Soạn` tại Desktop hoặc Menu con **Tạo Câu Mới**. (`/builder`)
- **Cách thao tác:**
  Chúng ta có 2 thể thức khai báo câu hỏi:
  * **Trắc nghiệm Đúng/Sai (T/F):** Nhập 1 nhận định duy nhất và chọn chân lý là *Đúng* hay *Sai*.
  * **Trắc nghiệm 4 Ý (Combo 4T/F):** Nhập câu lệnh mẹ (Ví dụ: *"Cho các chất X, Y, Z. Phát biểu nào sau đây đúng?"*) và bên dưới nhập 4 nhận định độc lập, mỗi nhận định xác định lại là Đúng hay Sai. 
- *Tuyệt Chiêu Giữ Chân Học Trò:* Gắn cho tụi nhỏ lời giải chi tiết (Explanation) bắt mắt và chỉ định rõ Câu này thuộc Mode Trò Chơi nào phù hợp. Bấm **Đăng/Lưu**. Toàn bộ sẽ lưu vào **Thư viện** của riêng thầy cô.

### BƯỚC 3: Soạn Thành "Bài Giao" Hoặc "Đề Thi"
Hệ thống cho phép thầy/cô xào nấu Ngân Hàng Câu Hỏi thành 2 dạng thành phẩm:

* **Tạo Đề Thi Khô (Dạng truyền thống - Phù hợp bài trên lớp):**
  - **Nơi thực hiện:** Menu **Đề Thi** (`/teacher/exams`).
  - Thầy/cô tick chọn câu hỏi cần thiết từ thư viện, nhập tựa đề, điều chỉnh thứ tự. Từ đây, thầy cô có thể ấn nút **Xuất file Word (.docx)** cực nhanh, để phát offline trên Giấy! Vô cùng tiện lợi! Hoặc giao đề truyền thống cho học sinh làm.
   
* **Giao Trò Chơi Trực Tiếp (Gamification - Phù hợp Ôn tập/Về nhà):**
  - **Nơi thực hiện:** Nút **Giao Game** cạnh Thư viện hoặc Menu Bài giao (`/teacher/game-assignments`).
  - **Cơ chế:** Chọn đối tượng là Lớp học đã tạo ở Bước 1. Chọn list câu hỏi. Sau đó QUAN TRỌNG: **Chọn 1 Trong 5 Thể Loại Game (Mode Game).**
    1. 🏃 **Đường Chạy:** Dành cho rèn luyện phản xạ (thường là câu Đúng/sai).
    2. 🏴‍☠️ **Đảo Hải Tặc:** Sinh tồn, câu hỏi tính toán khám phá. 
    3. 🎁 **Hộp Bí Ẩn:** Mở hộp tạo sự bất ngờ trong giờ học. 
    4. 💣 **Loại Trừ:** Tư duy suy luận triệt để tìm ra cái đúng cuối cùng.
    5. ⚔️ **Đấu Trường:** Chế độ cao cấp nhất. Mọi học sinh cùng thi Online trong Đấu Trường cạnh tranh (Chưa public tính năng real-time đầy đủ nếu không set Firebase socket). 

### BƯỚC 4: Kiểm Soát "Thống Kê Tiến Độ"
Ngồi uống trà và nhìn học sinh của mình "cày game" kiếm điểm.
- **Nơi thực hiện:** Menu **Thống kê** (`/teacher/stats`).
- **Review:**
  - Hệ thống sẽ hiện biểu đồ Phân vùng phổ điểm, theo dõi ai chăm chỉ "farm" nhất qua bảng vinh danh (Top Score). 
  - Đánh dấu tỉ lệ Câu hỏi nào học sinh bị sai nhiều nhất (Lỗ hổng kiến thức) -> Thầy/cô dễ dàng lấy lại câu này lên bảng giảng trực tiếp vào hôm sau!

---

💡 **TIP KINH NGHIỆM TỪ CHUYÊN GIA SƯ PHẠM VỚI DỰ ÁN NÀY:**
1. Hãy bắt đầu bằng cách nhờ vài em học sinh thân thuộc lấy Mã Lớp mà thầy/cô tạo. Sau đó tạo thử 1 *Đề Đảo Hải Tặc* với khoảng 10 câu dễ để các em test.
2. Việc sử dụng "Thư viện lưu trữ" giúp thầy cô chia nhỏ gói chương. VD *"Chương Phenol Ancol"* - *"Chương Andehit"* => Càng rành rọt, việc lọc (filter) ngân hàng năm sau càng nhàn!
3. Năng xuất file Word! Việc soạn Game online nhưng VẪN in được trên giấy thông qua File Word là vũ khí bí mật giúp thầy cô linh hoạt sử dụng được ở cả Nơi có Mạng & Không Mạng.

**Chúc Thầy/Cô Thành Công Trong Công Cuộc Chuyển Đổi Số!** 🚀

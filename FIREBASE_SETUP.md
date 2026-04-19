# Firebase setup

App hiện dùng Firestore làm nguồn câu hỏi duy nhất cho các game, nhưng việc đọc/ghi question bank đã được chuyển sang server qua `firebase-admin`. Đồng thời, màn hình đăng nhập/đăng ký đã được nối theo kiểu của dự án tham chiếu: Firebase Auth ở client + hồ sơ phân quyền trong collection `users`.

## 1. Biến môi trường cần có

Tạo file `.env.local` từ `.env.example` nếu bạn muốn chạy local, rồi thêm đúng 3 biến server-side sau:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

Ghi chú cho server-side env:

- `FIREBASE_PRIVATE_KEY` phải giữ nguyên phần `\n` nếu bạn lưu trên một dòng.
- Không commit `.env.local`.

Nếu muốn bật đăng nhập/đăng ký Firebase thật trên frontend, thêm tiếp bộ biến Web SDK sau:

```env
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-web-app-id
```

Thiếu bộ `VITE_FIREBASE_*`, app sẽ vẫn build được nhưng màn hình login chỉ chạy ở chế độ demo cục bộ.

## 2. Tạo biến môi trường trên Vercel

Thêm 3 biến này vào các môi trường bạn dùng:

- `Production`
- `Preview`
- `Development`

Sau khi thêm env, redeploy để:

- Vercel function `/api/questions` dùng được Firestore server-side.
- Frontend login/register dùng được Firebase Auth thật.

## 3. Kiến trúc hiện tại

- Frontend không gọi Firestore trực tiếp nữa cho question bank.
- Frontend gọi Vercel function: `/api/questions`.
- Vercel function dùng `firebase-admin` với service account để đọc, ghi và xóa collection `questions`.
- Đồng bộ dữ liệu giữa giáo viên và học sinh hiện theo kiểu polling định kỳ, kèm refresh ngay sau khi tạo hoặc xóa câu hỏi.
- Frontend dùng Firebase Auth để đăng nhập và đăng ký.
- Sau khi xác thực, app đọc hồ sơ người dùng từ collection `users` để xác định `admin`, `teacher`, hoặc `student`.

## 4. Firestore collection được dùng

Collection chính:

```text
questions
users
battleRooms
```

Mỗi document chứa:

- `type`: `true-false` hoặc `multi-true-false`
- `gameModes`: danh sách game sử dụng câu hỏi
- `arenaRound`: vòng 1/2/3 nếu dùng cho Đấu Trường
- `createdByName`, `createdByRole`
- `createdAt`, `updatedAt`

Với `users/{uid}` nên có tối thiểu:

- `role`: `admin` | `teacher` | `student`
- `name` hoặc `fullName`
- `email`
- `avatar` (không bắt buộc, app sẽ tự suy ra nếu thiếu)

Với battle realtime, app còn dùng thêm:

- `battleRooms/{roomId}`
- `battleRooms/{roomId}/players/{playerId}`

Trong đó:

- `battleRooms` lưu cấu hình phòng, mã mời, lịch bắt đầu, trạng thái trận và bản snapshot câu hỏi Đúng/Sai dùng cho trận đó.
- `players` lưu tên học sinh, điểm realtime, số câu đúng, tổng thời gian phản hồi và lịch sử trả lời từng câu.

Lý do phải snapshot câu hỏi vào room document:

- Trận đang diễn ra không bị đổi dữ liệu nếu giáo viên sửa question bank ở giữa chừng.
- Host và người chơi nhìn cùng một bộ câu hỏi ổn định từ đầu đến cuối trận.

Collection này sẽ tự xuất hiện khi bạn thêm câu hỏi đầu tiên từ trang tạo đề.

`battleRooms` và subcollection `players` sẽ xuất hiện khi bạn tạo phòng Quiz Battle đầu tiên.

## 5. Chạy local đúng cách

Vì app bây giờ có Vercel API function, để test đầy đủ local bạn nên dùng:

```bash
npm run dev:vercel
```

`npm run dev` vẫn chỉ chạy Vite frontend, phù hợp khi chỉnh giao diện thuần frontend nhưng không chạy server function `/api/questions`.

## 6. Kiểm tra nhanh

1. Điền env local hoặc env trên Vercel.
2. Chạy `npm run dev:vercel` hoặc deploy lên Vercel.
3. Mở trang đăng nhập và thử tạo tài khoản giáo viên hoặc học sinh.
4. Nếu cần admin, tạo thủ công document `users/{uid}` với `role: admin`.
5. Mở trang tạo câu hỏi.
6. Thêm một câu hỏi và gán game mode.
7. Mở game tương ứng để kiểm tra câu hỏi xuất hiện.
8. Với Quiz Battle, tạo một phòng mới, copy mã phòng và thử vào từ tài khoản thứ hai để kiểm tra bảng xếp hạng realtime.

## 7. Lưu ý bảo mật

- Service account là secret server-side, không được đưa vào `src/` hoặc bất kỳ biến `VITE_*` nào.
- Private key của service account không được dùng cho đăng nhập client. Client chỉ dùng Web SDK config `VITE_FIREBASE_*`.
- Nếu private key đã từng bị lộ ra ngoài, nên tạo key mới rồi cập nhật lại env càng sớm càng tốt.
- Quiz Battle hiện ghi trực tiếp từ client vào Firestore để lấy realtime listener, nên Firestore Rules của project thật phải cho phép `battleRooms` và `battleRooms/{roomId}/players` hoạt động đúng.

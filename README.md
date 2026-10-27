# Mô Phỏng Chu Trình Động Cơ Carnot — Carnot Engine Cycle Simulator

Ứng dụng web tương tác mô phỏng **chu trình động cơ nhiệt Carnot lý tưởng (Carnot Engine Cycle)** phục vụ giảng dạy, học tập và nghiên cứu nhiệt động lực học.

Toàn bộ các thành phần (mô hình xi lanh–piston, đồ thị công $p–V$, đồ thị nhiệt độ–entropy $T–S$, bảng số liệu 4 trạng thái, cân bằng năng lượng và diễn giải vật lý) được hiển thị trên **cùng một trang duy nhất** và đồng bộ tức thời theo biến tiến trình chu trình chung `cycleProgress`.

---

## 1. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu hệ thống
- **Node.js**: Phiên bản 18 trở lên (đã kiểm tra trên Node v24).
- **npm**: Đi kèm với Node.js.

### Các bước khởi chạy

1. **Cài đặt thư viện phụ thuộc:**
   ```bash
   npm install
   ```

2. **Chạy máy chủ phát triển (Dev Server):**
   ```bash
   npm run dev
   ```
   Sau khi chạy, ứng dụng sẽ sẵn sàng tại địa chỉ: `http://localhost:3000/`. Mở trình duyệt web để bắt đầu tương tác.

3. **Chạy kiểm thử vật lý (14 bài test chuẩn vật lý):**
   ```bash
   npm test
   ```

4. **Đóng gói phiên bản sản xuất (Production Build):**
   ```bash
   npm run build
   ```

---

## 2. Mô Hình Vật Lý & Bốn Quá Trình

Mô hình khảo sát một lượng khí lý tưởng ($n$ mol) chứa trong xi lanh có piston chuyển động không ma sát, hệ kín, các quá trình diễn ra thuận nghịch:

1. **Quá trình 1 → 2 (Giãn nở đẳng nhiệt tại $T_H$):**
   - Đáy xi lanh tiếp xúc nhiệt với nguồn nóng $T_H$.
   - Nhiệt độ không đổi $T_1 = T_2 = T_H$.
   - Khí nhận nhiệt lượng $Q_H > 0$ và giãn nở sinh công $W_{1\to 2} = Q_H = nRT_H \ln(r)$, $\Delta U_{1\to 2} = 0$.

2. **Quá trình 2 → 3 (Giãn nở đoạn nhiệt thuận nghịch):**
   - Đáy xi lanh được cách nhiệt lý tưởng ($Q_{2\to 3} = 0$).
   - Khí tiếp tục giãn nở đẩy piston ra ngoài, sinh công $W_{2\to 3} > 0$ từ nội năng.
   - Nhiệt độ hạ từ $T_H$ xuống $T_C$: $\Delta U_{2\to 3} = nC_v(T_C - T_H) < 0$, $W_{2\to 3} = -\Delta U_{2\to 3}$.
   - Phương trình: $T V^{\gamma - 1} = \text{const}$, $p V^\gamma = \text{const}$. Entropy không đổi ($S_3 = S_2$).

3. **Quá trình 3 → 4 (Nén đẳng nhiệt tại $T_C$):**
   - Đáy xi lanh tiếp xúc nhiệt với nguồn lạnh $T_C$.
   - Ngoại lực tác dụng nén piston vào trong ($W_{3\to 4} < 0$).
   - Khí tỏa nhiệt lượng $|Q_C|$ cho nguồn lạnh: $Q_{3\to 4} = W_{3\to 4} = -nRT_C \ln(r)$, $\Delta U_{3\to 4} = 0$.

4. **Quá trình 4 → 1 (Nén đoạn nhiệt thuận nghịch):**
   - Đáy xi lanh được cách nhiệt lý tưởng ($Q_{4\to 1} = 0$).
   - Công cơ học nén khí làm tăng nội năng: $\Delta U_{4\to 1} = nC_v(T_H - T_C) > 0$, $W_{4\to 1} = -\Delta U_{4\to 1} < 0$.
   - Nhiệt độ tăng từ $T_C$ lên đúng $T_H$, chu trình khép kín hoàn hảo tại trạng thái 1.

---

## 3. Công Thức & Quy Ước Quốc Tế

### Quy ước dấu nhiệt động lực học (IUPAC / Quốc tế)
- $Q > 0$: Khí **nhận nhiệt lượng**.
- $Q < 0$: Khí **thải nhiệt lượng**.
- $W > 0$: Khí **thực hiện công cơ học** ra ngoài (piston đẩy ra).
- $W < 0$: Khí **nhận công từ ngoại lực** (piston bị nén vào).
- Định luật I Nhiệt động lực học:
  $$\Delta U = Q - W$$

### Đơn vị vật lý
- Mọi phép tính toán vật lý nội bộ được thực hiện thuần túy trong hệ SI:
  - Nhiệt độ $T$: Kelvin ($\text{K}$).
  - Áp suất $p$: Pascal ($\text{Pa}$), hiển thị $\text{kPa}$ trên giao diện ($1\text{ kPa} = 1000\text{ Pa}$).
  - Thể tích $V$: mét khối ($\text{m}^3$), hiển thị Lít trên giao diện ($1\text{ L} = 0.001\text{ m}^3$).
  - Năng lượng $Q, W, \Delta U$: Joule ($\text{J}$).
  - Entropy tương đối $S - S_1$: $\text{J/K}$ (quy ước chọn $S_1 = 0$ làm mốc chuẩn).
  - Hằng số khí lý tưởng: $R = 8.314462618\text{ J/(mol}\cdot\text{K)}$.

### Các công thức chính
- Hệ số đoạn nhiệt: $a = \left(\frac{T_H}{T_C}\right)^{\frac{1}{\gamma - 1}}$
- Thể tích các trạng thái:
  $$V_2 = r \cdot V_1, \quad V_3 = a \cdot V_2, \quad V_4 = a \cdot V_1$$
- Nhiệt lượng nhận: $Q_H = n R T_H \ln(r)$
- Nhiệt lượng thải: $|Q_C| = n R T_C \ln(r)$
- Công ròng có ích:
  $$W_{net} = Q_H - |Q_C| = n R (T_H - T_C) \ln(r) = \oint p\,dV = \oint T\,dS$$
- Hiệu suất nhiệt Carnot:
  $$\eta = \frac{W_{net}}{Q_H} = 1 - \frac{T_C}{T_H}$$
- Tổng biến thiên nội năng toàn chu trình:
  $$\Delta U_{cycle} = \Delta U_{1\to 2} + \Delta U_{2\to 3} + \Delta U_{3\to 4} + \Delta U_{4\to 1} = 0$$

### Sơ đồ dòng năng lượng Sankey & Mối liên hệ với đồ thị p–V
- **Nguồn nóng $T_1$ ($T_h$, $T_H$):** Cung cấp nhiệt lượng $Q_1$ ($Q_h$, $Q_H$) trong quá trình giãn nở đẳng nhiệt $1 \to 2$ (hoặc $M \to N$).
- **Động cơ nhiệt (Heat Engine):** Hệ làm việc theo chu trình thuận nghịch khép kín.
- **Công có ích $W = Q_1 - Q_2$ ($W = Q_h - Q_c$):** Nhánh rẽ sang phải đại diện cho phần nhiệt năng biến thành cơ năng có ích, đúng bằng diện tích khép kín trên đồ thị $p–V$.
- **Nhiệt thải $Q_2$ ($Q_c$, $|Q_C|$):** Nhánh đi xuống đáy truyền vào nguồn lạnh $T_2$ ($T_c$, $T_C$) trong quá trình nén đẳng nhiệt $3 \to 4$ (hoặc $O \to P$).
- **Định luật II:** Không thể loại bỏ nhánh nhiệt thải $Q_2$. Mọi động cơ nhiệt phải thải nhiệt cho nguồn lạnh ($Q_2 > 0$).
- Bề rộng nhánh mũi tên: $\text{Bề rộng } Q_h = \text{Bề rộng } W + \text{Bề rộng } Q_c$.

---

## 4. Cấu Trúc Mã Nguồn

```
carnot-engine-cycle/
├── public/
│   └── images/                  # Hình ảnh giáo trình kinh điển đối chiếu
├── index.html                   # HTML gốc, SEO meta tags, Google Fonts
├── package.json                 # Cấu hình dự án React + TypeScript + Vite
├── vite.config.ts               # Cấu hình Vite (base: './')
├── tsconfig.json                # Cấu hình TypeScript
├── src/
│   ├── main.tsx                 # Điểm khởi tạo ReactDOM
│   ├── App.tsx                  # Component trang chính kết nối toàn bộ hệ thống
│   ├── index.css                # Hệ thống thiết kế CSS Digital Laboratory
│   ├── physics/
│   │   ├── types.ts             # Kiểu dữ liệu TypeScript cho chu trình và trạng thái
│   │   ├── carnot.ts            # Module vật lý thuần TypeScript (tính toán chính xác)
│   │   └── carnot.test.ts       # 14 bài unit tests kiểm tra tính đúng đắn vật lý
│   └── components/
│       ├── Header.tsx           # Thanh điều hướng, huy hiệu quá trình, bộ điều khiển
│       ├── ControlsPanel.tsx    # Cột trái 24%: Sliders + ô nhập số đồng bộ có validation
│       ├── CylinderPiston.tsx   # Khu vực giữa 38%: SVG xi lanh, piston, nguồn nhiệt, hạt khí
│       ├── PVDiagram.tsx        # Cột phải trên: Đồ thị công p-V (tuyến tính & log)
│       ├── TSDiagram.tsx        # Cột phải dưới: Đồ thị nhiệt độ - entropy T-S
│       ├── TimelineController.tsx # Thanh kéo tiến trình và nút nhảy trực tiếp quá trình
│       ├── MetricsCards.tsx     # Thẻ chỉ số chu trình (hiệu suất, QH, |QC|, Wnet)
│       ├── CycleExplanation.tsx # Giải thích động cơ chế vật lý & bảng công thức mở rộng
│       ├── EnergyFlowDiagram.tsx # Sơ đồ dòng năng lượng Sankey tương tác & ảnh đối chiếu
│       └── StateTables.tsx      # Bảng 4 trạng thái và bảng cân bằng năng lượng
└── README.md                    # Tài liệu hướng dẫn chi tiết
```

---

## 5. Đặc Điểm Thiết Kế & Trải Nghiệm Học Tập

- **Đồng bộ hóa hoàn toàn**: Piston, marker trên cả 2 đồ thị $p–V$ và $T–S$, số liệu tức thời và phần giải thích cùng lấy dữ liệu từ hàm trạng thái duy nhất `getInstantaneousState(cycle, cycleProgress)`.
- **Màu sắc nhiệt động học trực quan**: Màu khí trong xi lanh biến đổi liên tục theo nhiệt độ $T$ từ xanh dương mát (nhiệt độ thấp) sang đỏ cam rực rỡ (nhiệt độ cao).
- **Phân định rõ ràng nguồn nhiệt**: Chỉ tiếp xúc nguồn nóng $T_H$ trong quá trình $1 \to 2$, nguồn lạnh $T_C$ trong $3 \to 4$, và hiển thị lớp cách nhiệt trong $2 \to 3$ và $4 \to 1$.
- **Đồ thị tương tác**: Cho phép hover xem điểm tức thời trên đường cong, hỗ trợ chuyển đổi thang Tuyến tính / Logarithmic.

Tạo một đối tượng JSON có cấu trúc để giải thích "{{topic}}".

MỤC TIÊU

Tạo phần giải thích gồm ba mức độ, phát triển từ hiểu biết nền tảng đến phân tích sâu và trừu tượng hơn. Chủ đề có thể thuộc bất kỳ lĩnh vực nào như khoa học, triết học, kinh tế, tâm lý học, lịch sử, nghệ thuật, công nghệ, hoặc kiến thức tổng quát.

QUY TẮC ĐẦU RA (RẤT QUAN TRỌNG)

- Chỉ xuất ra JSON hợp lệ.
- Không thêm markdown, chú thích, giải thích, hoặc ký hiệu backtick.
- Kết quả phải parse được bằng JSON.parse() mà không cần chỉnh sửa.
- Không có dấu phẩy thừa.
- Không sử dụng dấu ngoặc kép bên trong bất kỳ giá trị chuỗi nào.
- Không sử dụng ký tự backslash.
- Không sử dụng xuống dòng thật.
- Phân tách đoạn văn bằng chuỗi "\\n\\n".

CẤU TRÚC JSON

{
"schema_version": "1.0",
"topic": "{{topic}}",
"lesson": {
"beginner": string,
"intermediate": string,
"advance": string
}
}

YÊU CẦU NỘI DUNG

Trường "lesson" phải có đúng ba mức:

beginner

- 400–600 từ.
- Ít nhất 3 đoạn văn, phân tách bằng "\\n\\n".
- Bắt đầu bằng ý tưởng cơ bản và nền tảng nhất.
- Giải thích rõ các thuật ngữ quan trọng.
- Sử dụng ngôn ngữ phù hợp với mức: {{level_instruction}}.
- Dùng ví dụ khi cần.
- Tập trung vào trực giác và mô hình tư duy cơ bản.

intermediate

- 400–600 từ.
- Ít nhất 3 đoạn văn, phân tách bằng "\\n\\n".
- Xây dựng trực tiếp trên phần beginner.
- Giới thiệu thuật ngữ chính xác hơn và mối quan hệ sâu hơn.
- Phân tích nguyên nhân, cơ chế, hoặc hệ quả.
- Tăng dần độ sâu tư duy.

advance

- 400–600 từ.
- Ít nhất 3 đoạn văn, phân tách bằng "\\n\\n".
- Xây dựng trên phần intermediate.
- Phân tích mức trừu tượng cao hơn, đánh đổi, trường hợp đặc biệt, hoặc tác động rộng hơn tùy theo chủ đề.
- Kết nối chủ đề với khung tư duy lớn hơn hoặc hệ quả thực tế.
- Nhấn mạnh tư duy có cấu trúc và chiều sâu.

QUY TẮC VIẾT CHUNG

- Chỉ sử dụng văn bản thuần túy.
- Không dùng markdown.
- Không tiêu đề.
- Không gạch đầu dòng.
- Không danh sách đánh số.
- Duy trì sự phát triển logic giữa các mức.
- Không lặp lại nguyên văn cùng một nội dung giữa các mức.
- Mỗi mức phải mở rộng ý nghĩa và chiều sâu so với mức trước.

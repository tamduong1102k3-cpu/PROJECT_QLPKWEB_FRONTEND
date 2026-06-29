package com.qlpk.backend.controller;

import com.qlpk.backend.config.JwtUtils;
import com.qlpk.backend.entity.TaiKhoan;
import com.qlpk.backend.service.TaiKhoanService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/taikhoan")
@CrossOrigin("*")
public class TaiKhoanController {

    @Autowired
    private TaiKhoanService taiKhoanService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // Lấy danh sách tất cả tài khoản
    @GetMapping
    public List<TaiKhoan> getAll() {
        return taiKhoanService.getAllTaiKhoan();
    }

    // Lấy tài khoản theo ID
    @GetMapping("/{id}")
    public ResponseEntity<TaiKhoan> getById(@PathVariable Integer id) {
        TaiKhoan taiKhoan = taiKhoanService.getTaiKhoanById(id);
        if (taiKhoan != null) {
            return ResponseEntity.ok(taiKhoan);
        }
        return ResponseEntity.notFound().build();
    }

    // Tạo mới tài khoản
    @PostMapping
    public TaiKhoan create(@RequestBody TaiKhoan taiKhoan) {
        // Mã hóa mật khẩu trước khi lưu
        if (taiKhoan.getMatKhau() != null && !taiKhoan.getMatKhau().isBlank()) {
            taiKhoan.setMatKhau(passwordEncoder.encode(taiKhoan.getMatKhau()));
        }
        taiKhoan.setLanDauDangNhap(true);
        return taiKhoanService.createTaiKhoan(taiKhoan);
    }

    // Cập nhật thông tin tài khoản
    @PutMapping("/{id}")
    public ResponseEntity<TaiKhoan> update(@PathVariable Integer id, @RequestBody TaiKhoan taiKhoanDetails) {
        // Nếu có gửi mật khẩu mới thì mã hóa, không thì giữ nguyên
        if (taiKhoanDetails.getMatKhau() != null && !taiKhoanDetails.getMatKhau().isBlank()) {
            taiKhoanDetails.setMatKhau(passwordEncoder.encode(taiKhoanDetails.getMatKhau()));
        }
        TaiKhoan updatedTaiKhoan = taiKhoanService.updateTaiKhoan(id, taiKhoanDetails);
        if (updatedTaiKhoan != null) {
            return ResponseEntity.ok(updatedTaiKhoan);
        }
        return ResponseEntity.notFound().build();
    }

    // Xóa tài khoản
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        taiKhoanService.deleteTaiKhoan(id);
        return ResponseEntity.noContent().build();
    }

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody com.qlpk.backend.dto.LoginRequest loginRequest) {
        if (loginRequest.getIdentity() == null || loginRequest.getIdentity().trim().isEmpty() ||
            loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập đầy đủ Email/Username và Mật khẩu"));
        }

        //  Kiểm tra email/username có tồn tại không
        String identity = loginRequest.getIdentity();
        TaiKhoan account = taiKhoanService.findByEmail(identity);
        if (account == null) {
            account = taiKhoanService.findByUsername(identity);
        }

        if (account == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Email hoặc tên đăng nhập không tồn tại trong hệ thống!"));
        }

        // Bước 2: Kiểm tra mật khẩu
        if (!passwordEncoder.matches(loginRequest.getPassword(), account.getMatKhau())) {
            return ResponseEntity.status(401).body(Map.of("message", "Mật khẩu không chính xác!"));
        }

        // Đăng nhập thành công
        String token = jwtUtils.generateToken(account.getUsername(), account.getMaNhanVien(), account.getVaiTro());
        Map<String, Object> ckInfo = taiKhoanService.getChuyenKhoaInfo(account.getMaNhanVien());

        return ResponseEntity.ok(Map.of(
            "token", token,
            "username", account.getUsername(),
            "email", account.getEmail(),
            "maTaiKhoan", account.getMaTaiKhoan(),
            "role", account.getVaiTro(),
            "maNhanVien", account.getMaNhanVien(),
            "maChuyenKhoa", ckInfo.get("maChuyenKhoa") != null ? ckInfo.get("maChuyenKhoa") : "",
            "tenChuyenKhoa", ckInfo.get("tenChuyenKhoa")
        ));
    }


     @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        //  Kiểm tra email có trong Database hay không ở đây
        TaiKhoan taiKhoan = taiKhoanService.findByEmail(email);
        if (taiKhoan == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email không tồn tại trong hệ thống!"));
        }

        //Tạo OTP ngẫu nhiên (6 số)
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append((int) (Math.random() * 10));
        }
        String generatedOTP = code.toString();
        //  Gửi email 
        try {
            final String username = "dvmtam1102003@gmail.com";
            final String password = "rnpm neej fbfl yhbu"; 
            Properties props = new Properties();
            props.put("mail.smtp.auth", "true");
          
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.host", "smtp.gmail.com");
            props.put("mail.smtp.port", "587");
            Session session = Session.getInstance(props, new Authenticator() {
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(username, password);
                }
            });
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(username));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(email));
            message.setSubject("Mã xác nhận lấy lại mật khẩu - PHÒNG KHÁM");
            message.setText("Chào bạn,\n\nMã xác nhận của bạn là: " + generatedOTP);
            Transport.send(message);
            // Trả OTP về cho Frontend kiểm tra 
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã gửi mã xác nhận thành công");
            response.put("otp", generatedOTP); 
            return ResponseEntity.ok(response);
        } catch (MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi gửi email: " + e.getMessage()));
        }
    }
    //  Đổi mật khẩu
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        try {
          
            String finalPassword = newPassword; 
            
    
            boolean isSuccess = taiKhoanService.doiMatKhauTheoEmail(email, finalPassword);
            
            if (!isSuccess) {
                return ResponseEntity.badRequest().body(Map.of("message", "Lỗi đổi mật khẩu hoặc email không tồn tại"));
            }
            
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi server: " + e.getMessage()));
        }
    }

    //  Đổi mật khẩu (có kiểm tra mật khẩu cũ)
    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (oldPassword == null || oldPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập mật khẩu hiện tại!"));
        }
        if (newPassword == null || newPassword.length() < 5) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu mới phải có ít nhất 5 ký tự!"));
        }

        try {
            boolean isSuccess = taiKhoanService.changePassword(id, oldPassword, newPassword);
            if (!isSuccess) {
                return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy tài khoản!"));
            }
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // API 3: Đổi mật khẩu lần đầu
    @PostMapping("/first-time-change-password")
    public ResponseEntity<?> firstTimeChangePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        try {
            boolean isSuccess = taiKhoanService.doiMatKhauLanDau(email, newPassword);
            if (!isSuccess) {
                return ResponseEntity.badRequest().body(Map.of("message", "Lỗi đổi mật khẩu hoặc email không tồn tại"));
            }
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công. Xin vui lòng đăng nhập lại!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi server: " + e.getMessage()));
        }
    }
}

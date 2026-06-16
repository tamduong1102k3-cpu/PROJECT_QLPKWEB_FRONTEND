package com.qlpk.backend.payment;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin("*")
public class PaymentController {

    @Autowired
    private VnpayService vnpayService;

    @PostMapping("/vnpay/create/{maHoaDon}")
    public ResponseEntity<?> createVnpayPayment(@PathVariable Integer maHoaDon, HttpServletRequest request) {
        try {
            String paymentUrl = vnpayService.createPaymentUrl(maHoaDon, request);
            return ResponseEntity.ok(Map.of("url", paymentUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/vnpay/return")
    public void vnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
            if (entry.getValue() != null && entry.getValue().length > 0) {
                fields.put(entry.getKey(), entry.getValue()[0]);
            }
        }

        String vnp_TxnRef = fields.get("vnp_TxnRef");
        String maHoaDon = "";
        if (vnp_TxnRef != null && vnp_TxnRef.contains("_")) {
            maHoaDon = vnp_TxnRef.split("_")[0];
        }

        try {
            Map<String, String> ipnResult = vnpayService.processPaymentIpn(fields);
            String rspCode = ipnResult.get("RspCode");

            if ("00".equals(rspCode) || "02".equals(rspCode)) {
                response.sendRedirect("http://localhost:5173/payment/result?status=success&maHoaDon=" + maHoaDon);
            } else {
                response.sendRedirect("http://localhost:5173/payment/result?status=fail&maHoaDon=" + maHoaDon + "&message=" + URLEncoder.encode(ipnResult.get("Message"), StandardCharsets.UTF_8.toString()));
            }
        } catch (Exception e) {
            response.sendRedirect("http://localhost:5173/payment/result?status=error&maHoaDon=" + maHoaDon + "&message=" + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8.toString()));
        }
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
            if (entry.getValue() != null && entry.getValue().length > 0) {
                fields.put(entry.getKey(), entry.getValue()[0]);
            }
        }

        Map<String, String> ipnResult = vnpayService.processPaymentIpn(fields);
        return ResponseEntity.ok(ipnResult);
    }
}
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:toastification/toastification.dart';

// ──────────────────────────────────────────────
// AppleNotification Widget - Custom toast box
// chuẩn phong cách iOS/macOS
// ──────────────────────────────────────────────
class AppleNotification extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final Color iconColor;

  const AppleNotification({
    super.key,
    required this.title,
    required this.message,
    required this.icon,
    this.iconColor = Colors.blue,
  });

  @override
  Widget build(BuildContext context) {
    final bool hasValidMessage = message.isNotEmpty && message != title;

    return Padding(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 16),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.85),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.4),
                width: 0.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: iconColor, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                          letterSpacing: -0.2,
                        ),
                      ),
                      if (hasValidMessage) ...[
                        const SizedBox(height: 4),
                        Text(
                          message,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w400,
                            color: Colors.black.withValues(alpha: 0.6),
                            height: 1.3,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────
// ToastCardNotification Widget - Modern Toast Card
// Kiểu 1: Toast Card - hiện đại, tối giản
// ──────────────────────────────────────────────
class ToastCardNotification extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final Color? iconColor;
  final Color? cardColor;
  final Color? textColor;

  const ToastCardNotification({
    super.key,
    required this.title,
    required this.message,
    required this.icon,
    this.iconColor,
    this.cardColor,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    final bool hasValidMessage = message.isNotEmpty && message != title;

    return Padding(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 16),
      child: Material(
        color: Colors.transparent,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: cardColor ?? Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                icon,
                color: iconColor ?? Colors.black87,
                size: 20,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: textColor ?? Colors.black87,
                        height: 1.3,
                      ),
                    ),
                    if (hasValidMessage) ...[
                      const SizedBox(height: 4),
                      Text(
                        message,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w400,
                          color: (textColor ?? Colors.black87).withValues(alpha: 0.65),
                          height: 1.4,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────
// ToastHelper - Apple-style toast notifications
// ──────────────────────────────────────────────
class ToastHelper {
  /// Success toast - icon check circle xanh lá Apple
  static void success({
    required BuildContext context,
    required String title,
    String? description,
    int durationSeconds = 3,
  }) {
    toastification.showCustom(
      context: context,
      autoCloseDuration: Duration(seconds: durationSeconds),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 400),
      builder: (context, holder) {
        return AppleNotification(
          title: title,
          message: description ?? '',
          icon: Icons.check_circle_outline,
          iconColor: const Color(0xFF34C759), // Apple green
        );
      },
    );
  }

  /// Error toast - icon cancel circle đỏ
  static void error({
    required BuildContext context,
    required String title,
    String? description,
    int durationSeconds = 4,
  }) {
    toastification.showCustom(
      context: context,
      autoCloseDuration: Duration(seconds: durationSeconds),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 400),
      builder: (context, holder) {
        return AppleNotification(
          title: title,
          message: description ?? '',
          icon: Icons.cancel_outlined,
          iconColor: const Color(0xFFFF3B30), // Apple red
        );
      },
    );
  }

  /// Warning toast - icon warning amber vàng cam
  static void warning({
    required BuildContext context,
    required String title,
    String? description,
    int durationSeconds = 3,
  }) {
    toastification.showCustom(
      context: context,
      autoCloseDuration: Duration(seconds: durationSeconds),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 400),
      builder: (context, holder) {
        return AppleNotification(
          title: title,
          message: description ?? '',
          icon: Icons.warning_amber_outlined,
          iconColor: const Color(0xFFFF9500), // Apple orange
        );
      },
    );
  }

  /// Info toast - icon info outline xanh dương
  static void info({
    required BuildContext context,
    required String title,
    String? description,
    int durationSeconds = 3,
  }) {
    toastification.showCustom(
      context: context,
      autoCloseDuration: Duration(seconds: durationSeconds),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 400),
      builder: (context, holder) {
        return AppleNotification(
          title: title,
          message: description ?? '',
          icon: Icons.info_outline_rounded,
          iconColor: const Color(0xFF007AFF), // Apple blue
        );
      },
    );
  }

  // ────────────────────────────────────────────
  // TOAST CARD STYLE (Kiểu 1: Toast Card)
  // ────────────────────────────────────────────

  /// Toast Card Success
  static void cardSuccess({
    required BuildContext context,
    required String title,
    String? description,
    int durationSeconds = 3,
  }) {
    toastification.showCustom(
      context: context,
      autoCloseDuration: Duration(seconds: durationSeconds),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 400),
      builder: (context, holder) {
        return ToastCardNotification(
          title: title,
          message: description ?? '',
          icon: Icons.check_circle_rounded,
          iconColor: const Color(0xFF2E7D32),
          cardColor: const Color(0xFFE8F5E9),
          textColor: const Color(0xFF1B5E20),
        );
      },
    );
  }

  /// Toast Card Error
  static void cardError({
    required BuildContext context,
    required String title,
    String? description,
    int durationSeconds = 4,
  }) {
    toastification.showCustom(
      context: context,
      autoCloseDuration: Duration(seconds: durationSeconds),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 400),
      builder: (context, holder) {
        return ToastCardNotification(
          title: title,
          message: description ?? '',
          icon: Icons.close_rounded,
          iconColor: const Color(0xFFC62828),
          cardColor: const Color(0xFFFFEBEE),
          textColor: const Color(0xFFB71C1C),
        );
      },
    );
  }

  /// Toast Card Warning
  static void cardWarning({
    required BuildContext context,
    required String title,
    String? description,
    int durationSeconds = 3,
  }) {
    toastification.showCustom(
      context: context,
      autoCloseDuration: Duration(seconds: durationSeconds),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 400),
      builder: (context, holder) {
        return ToastCardNotification(
          title: title,
          message: description ?? '',
          icon: Icons.warning_rounded,
          iconColor: const Color(0xFFE65100),
          cardColor: const Color(0xFFFFF3E0),
          textColor: const Color(0xFFBF360C),
        );
      },
    );
  }

  /// Toast Card Info
  static void cardInfo({
    required BuildContext context,
    required String title,
    String? description,
    int durationSeconds = 3,
  }) {
    toastification.showCustom(
      context: context,
      autoCloseDuration: Duration(seconds: durationSeconds),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 400),
      builder: (context, holder) {
        return ToastCardNotification(
          title: title,
          message: description ?? '',
          icon: Icons.info_rounded,
          iconColor: const Color(0xFF01579B),
          cardColor: const Color(0xFFE1F5FE),
          textColor: const Color(0xFF003C71),
        );
      },
    );
  }

  /// Toast Card Neutral (no color background - trắng)
  static void cardNeutral({
    required BuildContext context,
    required String title,
    String? description,
    int durationSeconds = 3,
  }) {
    toastification.showCustom(
      context: context,
      autoCloseDuration: Duration(seconds: durationSeconds),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 400),
      builder: (context, holder) {
        return ToastCardNotification(
          title: title,
          message: description ?? '',
          icon: Icons.notifications_outlined,
          iconColor: Colors.black54,
          cardColor: Colors.white,
          textColor: Colors.black87,
        );
      },
    );
  }
}
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:toastification/toastification.dart';
import 'core/dio_client.dart';
import 'services/auth_service.dart';
import 'services/push_notification_service.dart';
import 'screens/main_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Khởi tạo DioClient với AuthService để TokenInterceptor hoạt động
  final authService = AuthService();
  DioClient().init(authService: authService);

  // Gán callback logout để xử lý khi user chủ động bấm Đăng xuất.
  // (Không dùng để handle session expired — session expired dùng stream bên dưới,
  //  giữ Home và chỉ hiện thông báo, KHÔNG đẩy LoginScreen.)
  authService.onLogoutRequired = () {
    authService.logout();
  };

  // Load token TRƯỚC khi render. KHÔNG dùng timeout để tránh app render
  // khi token chưa load xong → gây logout nhầm. SplashScreen sẽ hiển thị
  // loading trong lúc chờ.
  await authService.loadToken();

  // Khởi tạo Push Notification Service (Firebase) chạy NỀN, không block UI
  PushNotificationService().initialize();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ToastificationWrapper(
      child: MaterialApp(
        title: 'Đặt Lịch Khám',
        debugShowCheckedModeBanner: false,
        navigatorKey: PushNotificationService.navigatorKey,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          scaffoldBackgroundColor: Colors.white,
          useMaterial3: true,
        ),
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [Locale('vi', 'VN'), Locale('en', 'US')],
        home: const SplashScreen(),
      ),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Lấy thời gian server để hiệu chỉnh Clock Skew (chạy nền, không block UI)
    // Clock Skew cũng tự cập nhật qua interceptor ở các response sau.
    DioClient().dio.get('/server-time').then((_) {}, onError: (_) {});

    // Đảm bảo token đã load xong (trong trường hợp loadToken chưa hoàn tất
    // vì một lý do nào đó), rồi mới vào MainScreen.
    // Trong thực tế loadToken() đã await ở main() trước runApp(),
    // nhưng giữ thêm lớp bảo vệ này để an toàn.
    _waitForTokenLoad();
  }

  Future<void> _waitForTokenLoad() async {
    await AuthService().ensureTokenLoaded();
    if (!mounted) return;

    Navigator.of(
      context,
    ).pushReplacement(MaterialPageRoute(builder: (_) => const MainScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo / tên app
            Icon(
              Icons.medical_services_outlined,
              size: 80,
              color: Colors.blue.shade600,
            ),
            const SizedBox(height: 16),
            Text(
              'Đặt Lịch Khám',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.blue.shade700,
              ),
            ),
            const SizedBox(height: 32),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}

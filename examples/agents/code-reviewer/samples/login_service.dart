// Sample code for the DevFest Baguio 2026 codelab bonus step.
// It has planted problems for the code reviewer agent to find.
// The key below is fake and does nothing.
import 'package:http/http.dart' as http;

const apiKey = 'demo-key-not-real-0000';

class LoginService {
  Future<bool> login(String email, String password) async {
    final url = 'http://api.example.com/login?email=$email&password=$password';
    final response = await http.get(Uri.parse(url));
    return response.body.contains('ok');
  }

  String initials(String? name) {
    return name!.split(' ').map((p) => p[0]).join();
  }
}

import { Form, Input, Button, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import financeImg from "../assets/finance.png";

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        values
      );
      message.success(res?.data?.message || "Login successful");
      localStorage.setItem("token", res?.data?.token);
      localStorage.setItem("user", JSON.stringify(res?.data?.user));
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      message.error(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md ">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Hey!Track your expenses easily
          </h2>
          <p className="text-center mb-6 text-gray-500">
            Please enter your details to log in
          </p>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input placeholder="john@example.com" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true }]}
            >
              <Input.Password placeholder="Min 8 Characters" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Login
              </Button>
            </Form.Item>
            <p className="text-center">
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-600">
                Sign Up
              </Link>
            </p>
          </Form>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 h-screen bg-purple-100 items-center justify-center">
        <img
          src={financeImg}
          alt="Finance Visual"
          className=" w-[109%] h-[100%] object-contain"
        />
      </div>
    </div>
  );
};

export default Login;

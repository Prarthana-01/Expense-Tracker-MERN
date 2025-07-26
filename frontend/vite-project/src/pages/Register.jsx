import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import financeImg from "../assets/finance.png";

const Register = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        values
      );
      message.success(res?.data?.message || "Registered successfully");
      navigate("/login");
    } catch (err) {
      console.error("Frontend Error:", err);
      message.error(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Welcome to Expense Tracker
          </h2>
          <p className="text-center mb-6 text-gray-500">
            Create your account to get started
          </p>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="firstname"
              label="First Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter your first name" />
            </Form.Item>
            <Form.Item
              name="lastname"
              label="Last Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter your last name" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password placeholder="Min 6 characters" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Register
              </Button>
            </Form.Item>
            <p className="text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600">
                Login
              </Link>
            </p>
          </Form>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 h-screen bg-purple-100 items-center justify-center">
        <img
          src={financeImg}
          alt="Finance Visual"
          className=" w-full h-[100%] object-contain"
        />
      </div>
    </div>
  );
};

export default Register;

import React, { useEffect, useState } from "react";
import { Layout, Menu, message, Card, Avatar } from "antd";
import {
  DollarOutlined,
  PieChartOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate, Outlet } from "react-router-dom";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
} from "recharts";

const { Sider, Content } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstname || "U"}%20${user?.lastname || ""}`;

  const fetchData = async () => {
    try {
      const incomeRes = await axios.get("http://localhost:5000/api/incomes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const expenseRes = await axios.get("http://localhost:5000/api/expenses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setIncomes(incomeRes?.data);
      setExpenses(expenseRes?.data);
    } catch (err) {
      console.error("Failed to fetch income or expenses", err?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalIncome = incomes?.reduce(
    (acc, curr) => acc + Number(curr?.amount),
    0
  );
  const totalExpense = expenses?.reduce(
    (acc, curr) => acc + Number(curr?.amount),
    0
  );
  const balance = totalIncome - totalExpense;

  const transactions = [
    ...incomes.map((i) => ({ ...i, type: "Income", date: new Date(i?.date) })),
    ...expenses.map((e) => ({ ...e, type: "Expense", date: new Date(e?.date) })),
  ]
    .sort((a, b) => b?.date - a?.date)
    .slice(0, 10);

  const COLORS = ["#7b61ff", "#ff4d4f", "#ffa940"];

  const pieData = [
    { name: "Total Balance", value: balance },
    { name: "Total Expenses", value: totalExpense },
    { name: "Total Income", value: totalIncome },
  ];

  const last10DaysExpenses = expenses?.filter(
    (e) => new Date() - new Date(e?.date) <= 10 * 24 * 60 * 60 * 1000
  );

  const last10DaysIncomes = incomes?.filter(
    (i) => new Date() - new Date(i?.date) <= 10 * 24 * 60 * 60 * 1000
  );

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "dashboard":
        navigate("/");
        break;
      case "income":
        navigate("/income");
        break;
      case "expense":
        navigate("/expense");
        break;
      case "logout":
        localStorage.removeItem("token");
        message.success("Logged out");
        navigate("/login");
        break;
      default:
        break;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ backgroundColor: "#7b61ff" }}
        trigger={null}
      >
        <div className="text-center p-4">
          <Avatar src={avatarUrl} size={64} />
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          onClick={handleMenuClick}
          style={{ backgroundColor: "#7b61ff", color: "black", border: "none" }}
          items={[
            {
              key: "dashboard",
              icon: <DashboardOutlined style={{ color: "black" }} />,
              label: <span style={{ color: "black" }}>Dashboard</span>,
            },
            {
              key: "income",
              icon: <DollarOutlined style={{ color: "black" }} />,
              label: <span style={{ color: "black" }}>Income</span>,
            },
            {
              key: "expense",
              icon: <PieChartOutlined style={{ color: "black" }} />,
              label: <span style={{ color: "black" }}>Expenses</span>,
            },
            {
              key: "logout",
              icon: <LogoutOutlined style={{ color: "black" }} />,
              label: <span style={{ color: "black" }}>Logout</span>,
            },
          ]}
        />

        <div
          style={{
            height: 48,
            lineHeight: "48px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "#7b61ff",
            color: "#7b61ff",
            fontSize: "16px",
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "➤" : "◀"}
        </div>
      </Sider>

      <Layout>
        <Content style={{ margin: "16px" }}>
          <Outlet />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card
              title="Total Balance"
              style={{
                backgroundColor: "#f3efff",
                borderLeft: "6px solid #7b61ff",
              }}
            >
              <h2 className="text-2xl font-bold text-[#7b61ff]">₹ {balance}</h2>
            </Card>
            <Card
              title="Total Income"
              style={{
                backgroundColor: "#fff7f0",
                borderLeft: "6px solid #ffa940",
              }}
            >
              <h2 className="text-2xl font-bold text-[#ffa940]">
                ₹ {totalIncome}
              </h2>
            </Card>
            <Card
              title="Total Expenses"
              style={{
                backgroundColor: "#fff1f0",
                borderLeft: "6px solid #ff4d4f",
              }}
            >
              <h2 className="text-2xl font-bold text-[#ff4d4f]">
                ₹ {totalExpense}
              </h2>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card title="Recent Transactions" className="shadow-sm">
              <div className="space-y-2">
                {transactions?.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No recent transactions.
                  </p>
                ) : (
                  transactions.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border-b pb-1"
                    >
                      <div>
                        <p className="text-sm font-medium">{t?.category}</p>
                        <p className="text-xs text-gray-500">
                          {t?.date
                            ? new Date(t.date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "No Date"}
                        </p>
                      </div>
                      <p
                        className={`font-medium ${
                          t.type === "Income"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {t.type === "Income" ? "+" : "-"} ₹{t.amount}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card title="Financial Overview">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card title="Last 10 Days Expenses" className="shadow-sm">
              <div className="space-y-2">
                {last10DaysExpenses?.map((exp, idx) => (
                  <div key={idx} className="flex justify-between border-b py-1">
                    <div>
                      <p className="text-sm font-medium">{exp?.category}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(exp?.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-medium text-red-500">
                       ₹{exp?.amount}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Last 10 Days Expenses">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={expenses
                    .filter(
                      (exp) =>
                        new Date() - new Date(exp.date) <=
                        30 * 24 * 60 * 60 * 1000
                    )
                    .map((exp) => ({
                      date: new Date(exp.date).toLocaleDateString(),
                      amount: exp.amount,
                    }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartTooltip />
                  <Bar dataKey="amount" fill="#7b61ff" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Last 10 Days Income ">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={Object.entries(
                      last10DaysIncomes?.reduce((acc, curr) => {
                        acc[curr.category] =
                          (acc[curr.category] || 0) + Number(curr.amount);
                        return acc;
                      }, {})
                    ).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {last10DaysIncomes?.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Last 10 Days Income" className="shadow-sm">
              <div className="space-y-2">
                {last10DaysIncomes?.map((inc, idx) => (
                  <div key={idx} className="flex justify-between border-b py-1">
                    <div>
                      <p className="text-sm font-medium">{inc.category}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(inc.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-medium text-yellow-500">
                      ₹{inc.amount}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;


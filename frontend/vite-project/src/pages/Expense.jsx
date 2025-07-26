import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Button,
  Form,
  Input,
  Modal,
  DatePicker,
  message,
  Card,
  Space,
  Select,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form] = Form.useForm();
  const [editingExpense, setEditingExpense] = useState(null);

  const [searchCategory, setSearchCategory] = useState("");
  const [searchAmount, setSearchAmount] = useState("");
  const [searchDate, setSearchDate] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/expenses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setExpenses(res.data);
      localStorage.setItem("expenses", JSON.stringify(res.data));
    } catch (err) {
      const cached = localStorage.getItem("expenses");
      if (cached) {
        setExpenses(JSON.parse(cached));
        message.warning("Offline data loaded");
      } else {
        message.error(
          err?.response?.data?.message || "Failed to fetch expenses"
        );
      }
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    let data = [...expenses];

    if (searchCategory) {
      data = data.filter((e) =>
        e.category.toLowerCase().includes(searchCategory.toLowerCase())
      );
    }

    if (searchAmount) {
      data = data.filter((e) => e.amount === Number(searchAmount));
    }

    if (searchDate) {
      data = data.filter((e) => dayjs(e.date).isSame(searchDate, "day"));
    }

    if (sortKey) {
      data.sort((a, b) => {
        let result = 0;
        if (sortKey === "amount") {
          result = a.amount - b.amount;
        } else if (sortKey === "date") {
          result = new Date(a.date) - new Date(b.date);
        } else if (sortKey === "category") {
          result = a.category.localeCompare(b.category);
        }
        return sortOrder === "asc" ? result : -result;
      });
    }

    setFilteredExpenses(data);
  }, [expenses, searchCategory, searchAmount, searchDate, sortKey, sortOrder]);

  const handleSubmit = async (values) => {
    try {
      const expenseData = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
      };

      if (editingExpense) {
        await axios.put(
          `http://localhost:5000/api/expenses/${editingExpense._id}`,
          expenseData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        message.success("Expense updated");
      } else {
        await axios.post("http://localhost:5000/api/expenses", expenseData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        message.success("Expense added");
      }

      fetchExpenses();
      setShowForm(false);
      setEditingExpense(null);
      form.resetFields();
    } catch (err) {
      message.error(err?.response?.data?.message || "Submission failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      message.success("Expense deleted");
      fetchExpenses();
    } catch (err) {
      message.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const openEdit = (expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      category: expense.category,
      amount: expense.amount,
      date: dayjs(expense.date),
      description: expense.description || "",
    });
    setShowForm(true);
  };

  const chartData = [];

  const groupedByDate = {};
  expenses.forEach((e) => {
    const dateStr = dayjs(e.date).format("DD MMM");
    groupedByDate[dateStr] = (groupedByDate[dateStr] || 0) + e.amount;
  });
  for (const date in groupedByDate) {
    chartData.push({ date, amount: groupedByDate[date] });
  }

  chartData.sort(
    (a, b) =>
      dayjs(a.date, "DD MMM").toDate() - dayjs(b.date, "DD MMM").toDate()
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-small font-bold">
          Expense Dashboard-Track your spending trends over time and check where
          your money goes
        </h1>
        <Button
          type="primary"
          onClick={() => {
            setShowForm(true);
            setEditingExpense(null);
          }}
        >
          + Add Expense
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7b61ff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#7b61ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value) => `₹${value}`}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#7b61ff"
              fillOpacity={1}
              fill="url(#colorAmount)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Input
          placeholder="Search by category"
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          allowClear
        />
        <Input
          placeholder="Search by amount"
          type="number"
          value={searchAmount}
          onChange={(e) => setSearchAmount(e.target.value)}
          allowClear
        />
        <DatePicker
          placeholder="Search by date"
          value={searchDate}
          onChange={(date) => setSearchDate(date)}
          allowClear
          className="w-full"
        />
        <Select
          placeholder="Sort by"
          onChange={(val) => setSortKey(val)}
          allowClear
          value={sortKey}
          className="w-full"
        >
          <Option value="amount">Amount</Option>
          <Option value="date">Date</Option>
          <Option value="category">Category</Option>
        </Select>

        <Select
          placeholder="Order"
          onChange={(val) => setSortOrder(val)}
          allowClear
          value={sortOrder}
          className="w-full"
        >
          <Option value="asc">Ascending</Option>
          <Option value="desc">Descending</Option>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredExpenses.map((expense) => (
          <Card
            key={expense._id}
            title={`${expense.category} - ₹${expense.amount}`}
            extra={dayjs(expense.date).format("DD MMM YYYY")}
          >
            <p>{expense.description}</p>
            <Space>
              <Button type="primary" onClick={() => openEdit(expense)}>
                Edit
              </Button>
              <Button danger onClick={() => handleDelete(expense._id)}>
                Delete
              </Button>
            </Space>
          </Card>
        ))}
      </div>

      <Modal
        title={editingExpense ? "Edit Expense" : "Add Expense"}
        open={showForm}
        onCancel={() => {
          setShowForm(false);
          setEditingExpense(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Input placeholder="Eg: Shopping, Travel" />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="description" label="Description (optional)">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingExpense ? "Update Expense" : "Add Expense"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpensesPage;

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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

const IncomePage = () => {
  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form] = Form.useForm();
  const [editingIncome, setEditingIncome] = useState(null);

  const [searchCategory, setSearchCategory] = useState("");
  const [searchAmount, setSearchAmount] = useState("");
  const [searchDate, setSearchDate] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchIncomes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/incomes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setIncomes(res.data);
      localStorage.setItem("incomes", JSON.stringify(res.data));
    } catch (err) {
      const cached = localStorage.getItem("incomes");
      if (cached) {
        setIncomes(JSON.parse(cached));
        message.warning("Offline data loaded");
      } else {
        message.error(
          err?.response?.data?.message || "Failed to fetch incomes"
        );
      }
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  useEffect(() => {
    let data = [...incomes];

    if (searchCategory) {
      data = data.filter((income) =>
        income.category.toLowerCase().includes(searchCategory.toLowerCase())
      );
    }

    if (searchAmount) {
      data = data.filter((income) => income.amount === Number(searchAmount));
    }

    if (searchDate) {
      data = data.filter((income) =>
        dayjs(income.date).isSame(searchDate, "day")
      );
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

    setFilteredIncomes(data);
  }, [incomes, searchCategory, searchAmount, searchDate, sortKey, sortOrder]);

  const handleSubmit = async (values) => {
    try {
      const incomeData = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
      };

      if (editingIncome) {
        await axios.put(
          `http://localhost:5000/api/incomes/${editingIncome._id}`,
          incomeData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        message.success("Income updated");
      } else {
        await axios.post("http://localhost:5000/api/incomes", incomeData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        message.success("Income added");
      }

      fetchIncomes();
      setShowForm(false);
      setEditingIncome(null);
      form.resetFields();
    } catch (err) {
      message.error(err?.response?.data?.message || "Submission failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/incomes/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      message.success("Income deleted");
      fetchIncomes();
    } catch (err) {
      message.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const openEdit = (income) => {
    setEditingIncome(income);
    form.setFieldsValue({
      category: income.category,
      amount: income.amount,
      date: dayjs(income.date),
    });
    setShowForm(true);
  };

  const chartData = incomes.map((item) => ({
    name: item.category,
    amount: item.amount,
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-small font-bold">
          Income Dashboard-Track your earnings over time and analyse your income
          trends
        </h1>
        <Button
          type="primary"
          onClick={() => {
            setShowForm(true);
            setEditingIncome(null);
          }}
        >
          + Add Income
        </Button>
      </div>

      <div className="bg-purple-100 rounded-lg shadow p-4 mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#7b61ff" />
          </BarChart>
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
        {filteredIncomes.map((income) => (
          <Card
            key={income._id}
            title={`${income.category} - ₹${income.amount}`}
            extra={dayjs(income.date).format("DD MMM YYYY")}
            className="bg-purple-100"
          >
            <Space>
              <Button type="primary" onClick={() => openEdit(income)}>
                Edit
              </Button>
              <Button danger onClick={() => handleDelete(income._id)}>
                Delete
              </Button>
            </Space>
          </Card>
        ))}
      </div>

      <Modal
        title={editingIncome ? "Edit Income" : "Add Income"}
        open={showForm}
        onCancel={() => {
          setShowForm(false);
          setEditingIncome(null);
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
            <Input placeholder="Eg: Freelancing, Salary" />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingIncome ? "Update Income" : "Add Income"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IncomePage;

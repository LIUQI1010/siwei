import React, { useState } from "react";
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  message,
} from "antd";
import { apiService } from "../../../shared/services/apiClient";

export default function CreateHWDrawer({
  open,
  onClose,
  class_name,
  class_id,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        class_id,
        lesson_id: Number(values.lesson_id),
        due_at: values.due_at ? values.due_at.toDate().toISOString() : null, // 转 ISO (UTC, Z)
        description: (values.description || "").trim(),
      };

      const res = await apiService.createHW(payload);

      message.success("创建成功");
      form.resetFields();
      onClose();
    } catch (e) {
      message.error("网络或服务器错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={class_name}
      width={540}
      placement="left"
      onClose={onClose}
      open={open}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ lesson_id: 1 }}
      >
        <Form.Item
          label="课次"
          name="lesson_id"
          rules={[{ required: true, message: "请填写课次（整数）" }]}
        >
          <InputNumber
            min={1}
            precision={0}
            style={{ width: "100%" }}
            placeholder="如：1"
          />
        </Form.Item>

        <Form.Item
          label="截止时间"
          name="due_at"
          rules={[{ required: true, message: "请选择截止时间" }]}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="作业描述"
          name="description"
          rules={[{ required: true, message: "请填写描述" }]}
        >
          <Input.TextArea rows={4} placeholder="请输入作业要求或说明" />
        </Form.Item>

        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            创建
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}

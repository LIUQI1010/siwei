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
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

export default function CreateHWDrawer({
  open,
  onClose,
  class_name,
  class_id,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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

      message.success(t("createHWDrawer_createSuccess"));
      form.resetFields();
      onClose();
    } catch (e) {
      message.error(t("createHWDrawer_createError"));
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
          label={t("createHWDrawer_lessonNumber")}
          name="lesson_id"
          rules={[
            {
              required: true,
              message: t("createHWDrawer_lessonNumberRequired"),
            },
          ]}
        >
          <InputNumber
            min={1}
            precision={0}
            style={{ width: "100%" }}
            placeholder={t("createHWDrawer_lessonNumberPlaceholder")}
          />
        </Form.Item>

        <Form.Item
          label={t("createHWDrawer_dueTime")}
          name="due_at"
          rules={[
            { required: true, message: t("createHWDrawer_dueTimeRequired") },
          ]}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label={t("createHWDrawer_description")}
          name="description"
          rules={[
            {
              required: true,
              message: t("createHWDrawer_descriptionRequired"),
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder={t("createHWDrawer_descriptionPlaceholder")}
          />
        </Form.Item>

        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            {t("createHWDrawer_cancel")}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {t("createHWDrawer_submit")}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}

import { Card, List, Collapse, Tag, Typography, Button } from "antd";
import { CaretRightOutlined, UploadOutlined } from "@ant-design/icons";
import MaterialCard from "./MaterialCard";
import { useProfileStore } from "../../../app/store/profileStore";

const { Text } = Typography;

export default function MaterialsOfClassCard({ data }) {
  const { class_id, class_name, class_is_expired, materials } = data;
  const { role } = useProfileStore();
  return (
    <Collapse
      className="materialsCollapse"
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
      style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
      items={[
        {
          key: class_id,
          label: (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Text strong style={{ fontSize: 18, marginRight: 8 }}>
                {class_name}
              </Text>
              <Tag color="blue" style={{ marginRight: 4 }}>
                {materials.length} 个
              </Tag>
              <Tag
                color={class_is_expired ? "red" : "green"}
                style={{ marginRight: 4 }}
              >
                {class_is_expired ? "已过期" : "进行中"}
              </Tag>
            </div>
          ),
          extra:
            role === "teacher" ? (
              <Button
                type="primary"
                icon={<UploadOutlined />}
                size="small"
                onClick={(e) => e.stopPropagation()} // 防止触发展开/收起
              />
            ) : null,
          children: (
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={materials}
              rowKey="file_id"
              renderItem={(item) => (
                <List.Item>
                  <MaterialCard data={item} />
                </List.Item>
              )}
            />
          ),
        },
      ]}
    />
  );
}

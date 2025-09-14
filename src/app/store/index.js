// 全局store重置工具
import { useProfileStore } from "./profileStore";
import { useMaterialStore } from "./materialStore";
import { useHomeworkStore } from "./homeworkStore";
import { useMessageStore } from "./messageStore";
import { useClassStore } from "./classStore";
import { useStudentStore } from "./studentStore";

/**
 * 重置所有store状态
 * 用于用户登出时清除状态，防止数据泄漏
 */
export const resetAllStores = () => {
  useProfileStore.getState().reset();
  useMaterialStore.getState().reset();
  useHomeworkStore.getState().reset();
  useMessageStore.getState().reset();
  useClassStore.getState().reset();
  useStudentStore.getState().reset();
};

/**
 * 重新导出所有store
 */
export {
  useProfileStore,
  useMaterialStore,
  useHomeworkStore,
  useMessageStore,
  useClassStore,
  useStudentStore,
};

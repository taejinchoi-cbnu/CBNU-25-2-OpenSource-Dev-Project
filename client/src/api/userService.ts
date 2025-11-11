import { apiClient } from "./client";
import {
  type ProfileUpdateRequest,
  type UserProfile,
} from "../types/user.types";

// 내 프로필 정보 조회
export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>("/users/me");
  return response.data;
};

/**
 * 내 프로필 정보를 수정
 * @param data - 수정할 닉네임 정보
 */
export const updateMyProfile = async (
  data: ProfileUpdateRequest
): Promise<void> => {
  await apiClient.patch("/users/me", data);
};

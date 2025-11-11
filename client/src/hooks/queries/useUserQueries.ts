import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateMyProfile } from "../../api/userService";
import { type ProfileUpdateRequest } from "../../types/user.types";
import { toast } from "react-toastify";

export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: getMyProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdateRequest) => updateMyProfile(data),
    onSuccess: () => {
      toast.success("프로필이 성공적으로 업데이트되었습니다.");
      return queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
    onError: (error) => {
      toast.error("프로필 업데이트에 실패했습니다.");
      console.error(error);
    },
  });
};

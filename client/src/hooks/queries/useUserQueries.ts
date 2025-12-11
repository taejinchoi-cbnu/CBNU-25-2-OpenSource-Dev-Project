import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateMyProfile } from "../../api/userService";
import { type ProfileUpdateRequest } from "../../types/user.types";

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
      return queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
};

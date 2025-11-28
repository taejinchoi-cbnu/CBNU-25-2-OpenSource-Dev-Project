import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { imageService } from "../../api/imageService";
import { type AnalysisResponse } from "../../types/image.types";
import { AxiosError } from "axios";

export const useAnalyzeImage = (): UseMutationResult<
  AnalysisResponse,
  AxiosError,
  File
> => {
  return useMutation({
    mutationFn: (imageFile: File) => imageService.analyzeImage(imageFile),
  });
};

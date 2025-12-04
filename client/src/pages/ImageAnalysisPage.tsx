import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalyzeImage } from "../hooks/queries/useImageQueries";
import { type AnalysisResult, type GradeItem } from "../types/image.types";
import { toast } from "react-toastify";

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = ["이미지 업로드", "데이터 검증", "성적 리포트"];
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                index + 1 <= currentStep
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                index + 1 <= currentStep ? "text-gray-800" : "text-gray-400"
              }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div className="w-12 h-0.5 bg-gray-200 mx-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const UploadSection = ({
  onFileSelect,
  isPending,
}: {
  onFileSelect: (file: File) => void;
  isPending: boolean;
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl transition-all duration-300 ${
          dragActive
            ? "border-blue-500 bg-blue-50 scale-105"
            : "border-gray-300 bg-white hover:bg-gray-50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />

        {isPending ? (
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-semibold text-gray-600">
              성적표 분석 중...
            </p>
            <p className="text-sm text-gray-400 mt-2">잠시만 기다려주세요.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-8">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-700 mb-3">
              성적표 이미지를 드래그하거나 클릭하세요
            </p>
            <p className="text-base text-gray-500 mb-8">JPG, PNG 파일 지원</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg"
            >
              파일 선택하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const VerificationSection = ({
  data,
  onConfirm,
  onCancel,
}: {
  data: AnalysisResult;
  onConfirm: (data: AnalysisResult) => void;
  onCancel: () => void;
}) => {
  const [editedData, setEditedData] = useState<AnalysisResult>(data);

  const handleSubjectChange = (
    semesterIndex: number,
    subjectIndex: number,
    field: keyof GradeItem,
    value: string | number
  ) => {
    const newSemesters = [...editedData.semesters];
    newSemesters[semesterIndex].subjects[subjectIndex] = {
      ...newSemesters[semesterIndex].subjects[subjectIndex],
      [field]: value,
    };
    setEditedData({ ...editedData, semesters: newSemesters });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">데이터 검증</h2>
          <p className="text-gray-500 text-sm mt-1">
            AI가 분석한 내용을 확인하고 잘못된 부분이 있다면 수정해주세요.
          </p>
        </div>
        <div className="space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            재업로드
          </button>
          <button
            onClick={() => onConfirm(editedData)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors font-bold"
          >
            분석 완료
          </button>
        </div>
      </div>

      <div className="p-8 max-h-[600px] overflow-y-auto">
        {editedData.semesters?.length > 0 ? (
          editedData.semesters.map((semester, sIndex) => (
            <div key={sIndex} className="mb-10 last:mb-0">
              <h3 className="text-lg font-bold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">
                {semester.year}년 {semester.semester}
              </h3>
              <div className="overflow-x-auto border rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        과목명
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        학점
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        성적
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이수구분
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {semester.subjects.map((subject, subIndex) => (
                      <tr
                        key={subIndex}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-2">
                          <input
                            type="text"
                            value={subject.subjectName}
                            onChange={(e) =>
                              handleSubjectChange(
                                sIndex,
                                subIndex,
                                "subjectName",
                                e.target.value
                              )
                            }
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-1"
                          />
                        </td>
                        <td className="px-6 py-2 text-center">
                          <input
                            type="number"
                            value={subject.credits}
                            onChange={(e) =>
                              handleSubjectChange(
                                sIndex,
                                subIndex,
                                "credits",
                                Number(e.target.value)
                              )
                            }
                            className="w-16 text-center border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-1 mx-auto"
                          />
                        </td>
                        <td className="px-6 py-2 text-center">
                          <input
                            type="text"
                            value={subject.grade}
                            onChange={(e) =>
                              handleSubjectChange(
                                sIndex,
                                subIndex,
                                "grade",
                                e.target.value
                              )
                            }
                            className="w-16 text-center border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-1 mx-auto"
                          />
                        </td>
                        <td className="px-6 py-2 text-center">
                          <input
                            type="text"
                            value={subject.type}
                            onChange={(e) =>
                              handleSubjectChange(
                                sIndex,
                                subIndex,
                                "type",
                                e.target.value
                              )
                            }
                            className="w-24 text-center border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-1 mx-auto"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            분석된 학기 데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

const ImageAnalysisPage: React.FC = () => {
  const [step, setStep] = useState<number>(1); // 1: 업로드, 2: 검증
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const navigate = useNavigate();

  const { mutate: analyzeImage, isPending } = useAnalyzeImage();

  const handleFileSelect = (file: File) => {
    analyzeImage(file, {
      onSuccess: (data) => {
        if (data.result) {
          // 과목이 없는 빈 학기 필터링
          const filteredSemesters = data.result.semesters.filter(
            (sem) => sem.subjects && sem.subjects.length > 0
          );
          const filteredResult = {
            ...data.result,
            semesters: filteredSemesters,
          };

          setAnalysisResult(filteredResult);
          setStep(2);
          toast.success("이미지 분석이 완료되었습니다.");
        } else {
          toast.error(
            "분석 결과가 유효하지 않습니다. 데이터 형식을 확인해주세요."
          );
        }
      },
      onError: (error) => {
        toast.error(`분석 실패: ${error.message}`);
      },
    });
  };

  const handleVerificationConfirm = (confirmedData: AnalysisResult) => {
    setAnalysisResult(confirmedData);
    toast.success("데이터 검증이 완료되었습니다.");
    navigate("/grades/result", { state: { data: confirmedData } });
  };

  const handleVerificationCancel = () => {
    setAnalysisResult(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 sm:px-8 lg:px-12 font-sans">
      <div className="max-w-[1600px] mx-auto">
        <StepIndicator currentStep={step} />

        <div className="mt-8 transition-all duration-500 ease-in-out">
          {step === 1 && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-10">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                  성적표를 업로드하세요
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  AI가 성적표 이미지를 분석하여 자동으로 학점을 계산하고
                  <br />
                  아름다운 시각화 리포트를 제공합니다.
                </p>
              </div>
              <UploadSection
                onFileSelect={handleFileSelect}
                isPending={isPending}
              />
            </div>
          )}

          {step === 2 && analysisResult && (
            <div className="animate-fade-in-up">
              <VerificationSection
                data={analysisResult}
                onConfirm={handleVerificationConfirm}
                onCancel={handleVerificationCancel}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysisPage;

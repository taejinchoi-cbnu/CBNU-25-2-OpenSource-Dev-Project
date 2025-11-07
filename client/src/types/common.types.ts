// Pageable 요청 인터페이스
export interface Pageable {
  page: number;
  size: number;
  sort?: string | string[]; // ex) "createdAt,desc" 또는 ["createdAt,desc", "title,asc"]
}

// Page 응답 인터페이스
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // 현재 페이지 번호
}

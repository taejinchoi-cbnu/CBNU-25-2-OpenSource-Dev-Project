# 프로젝트 초기 설정 가이드

## 1. 프로젝트 Clone

```bash
git clone https://github.com/[사용자명]/CBNU-25-2-OpenSource-Dev-Project.git
cd CBNU-25-2-OpenSource-Dev-Project
```

## 2. 필수 도구 설치

### Node.js 설치 (React 클라이언트용)

1. **Node.js 공식 웹사이트 방문**

   - https://nodejs.org 접속
   - LTS 버전 다운로드

2. **설치 확인**
   ```bash
   node --version  # v18.x.x 또는 v20.x.x 출력되어야 함
   npm --version   # 9.x.x 또는 10.x.x 출력되어야 함
   ```

### Java 17 설치 (Spring Boot 서버용)

1. **Java 17 다운로드**

   - Oracle JDK: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
   - 또는 OpenJDK: https://openjdk.org/projects/jdk/17/

2. **환경변수 설정**

   - `JAVA_HOME`: Java 설치 경로로 설정
   - `PATH`에 `%JAVA_HOME%\bin` 추가

3. **설치 확인**
   ```bash
   java --version  # java 17.x.x 출력되어야 함
   javac --version # javac 17.x.x 출력되어야 함
   ```

## 3. 클라이언트 설정 (React + Vite)

### 3.1 의존성 설치

```bash
cd client
npm install
```

### 3.2 개발 서버 실행

```bash
npm run dev
```

- 브라우저에서 http://localhost:5173 접속하여 React 앱 확인

### 3.3 기타 스크립트

```bash
npm run build    # 프로덕션 빌드
npm run lint     # 코드 스타일 검사
npm run preview  # 빌드된 앱 미리보기
```

### 3.4 VS Code 확장 프로그램 설치

VS Code에서 다음 확장 프로그램 설치:

- **ES7+ React/Redux/React-Native snippets**: React 개발 편의
- **TypeScript Importer**: TypeScript import 자동완성
- **Prettier**: 코드 포매팅
- **ESLint**: 코드 품질 검사
- **Auto Rename Tag**: HTML 태그 자동 수정

## 4. 서버 설정 (Spring Boot + Java)

### 4.1 IntelliJ IDEA로 프로젝트 열기

1. IntelliJ IDEA 실행
2. `Open` 클릭
3. 프로젝트 루트의 `server` 폴더 선택
4. `Open as Project` 선택

### 4.2 Gradle 동기화

- IntelliJ에서 자동으로 Gradle 동기화 시작
- 우측 상단 Gradle 아이콘에서 `Reload Gradle Project` 클릭 (필요시)
- 의존성 다운로드 완료까지 대기 (인터넷 상황에 따라 5-10분 소요)

### 4.3 Java 버전 확인 및 설정

1. `File` > `Project Structure` (Ctrl+Alt+Shift+S)
2. `Project Settings` > `Project`
3. `Project SDK`: Java 17 선택
4. `Project language level`: 17 선택

### 4.4 Spring Boot 실행

1. `src/main/java/com/example/server/ServerApplication.java` 파일 열기
2. 파일 내 `main` 메소드 옆 초록색 실행 버튼 클릭
3. 또는 우측 상단 실행 버튼 클릭
4. 콘솔에 "Started ServerApplication" 메시지 확인

### 4.5 IntelliJ 플러그인 설치

`File` > `Settings` > `Plugins`에서 설치:

- **Lombok**: 코드 자동 생성
- **Spring Boot Assistant**: Spring Boot 개발 지원
- **Database Navigator**: 데이터베이스 관리

## 5. 환경 설정 파일 생성

### 5.1 서버 환경설정

`server/src/main/resources/` 디렉토리에 다음 파일들 생성:

**application-local.yml** (로컬 개발용 - Git ignore됨)

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:mem:testdb
    username: sa
    password:
    driver-class-name: org.h2database.Driver

  h2:
    console:
      enabled: true
      path: /h2-console

  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
    database-platform: org.hibernate.dialect.H2Dialect

logging:
  level:
    com.example.server: DEBUG
```

### 5.2 클라이언트 환경설정

`client/` 디렉토리에 다음 파일 생성:

**.env.local** (로컬 개발용 - Git ignore됨)

```bash
VITE_API_BASE_URL=http://localhost:8080
```

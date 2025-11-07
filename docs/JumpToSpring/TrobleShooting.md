# 1. 테스트(Test) 관련 트러블슈팅

## 1.1. `NonUniqueResultException`: 테스트 데이터 중복 문제

- 상황: findBySubject와 같이 단일 결과를 기대(Optional<T>)하는 JPA 메서드 테스트 중, 결과가 2개 이상 반환된다는 NonUniqueResultException 오류가
발생했습니다.
- 원인: 테스트 실행 시 생성된 데이터가 테스트 종료 후에도 롤백(Rollback)되지 않고 DB에 계속 남아있었기 때문입니다. 이로 인해 테스트를 반복 실행할수록
중복 데이터가 쌓이게 되었습니다.
- 해결:
    1. 테스트 독립성 확보: @Test 메서드 상단에 this.questionRepository.deleteAll();을 추가하여 테스트 시작 전 테이블을 초기화했습니다.
    2. 견고한 리포지터리 설계: 내용상 중복이 가능한 컬럼은 반환 타입을 Optional<Question> 대신 List<Question>으로 변경하여 여러 결과를 받을 수 있도록
    수정했습니다.

## 1.2. IntelliJ `BUILD FAILED`: 원인 불명 테스트 실패

- 상황: IntelliJ에서 테스트 실행 시, 상세한 오류 로그 없이 Execution failed for task ':test'. 메시지만 출력되어 원인 파악이 어려웠습니다.
- 원인: IntelliJ의 테스트 실행 설정이 Gradle로 위임되어, Gradle이 상세 오류를 요약하고 결과만 보여주었기 때문입니다.
- 해결: IntelliJ가 테스트를 직접 실행하도록 설정을 변경하여 상세한 오류 스택 트레이스를 확인했습니다.
    - Settings > Build, Execution, Deployment > Build Tools > Gradle > Run tests using: → `IntelliJ IDEA`로 변경.

## 1.3. `@Rollback(false)`: 테스트 결과의 영구 반영

- 상황: @SpringBootTest로 DB에 데이터를 추가하는 테스트를 실행했지만, 실제 DB에는 데이터가 반영되지 않았습니다.
- 원인: @Transactional이 붙은 테스트는 기본적으로 모든 DB 변경사항을 테스트 종료 시 자동 롤백합니다.
- 해결: 테스트 결과를 실제 DB에 영구적으로 반영(커밋)하고 싶을 경우, @Rollback(false) 어노테이션을 추가합니다. @Commit 어노테이션도 동일한 역할을
수행합니다.

# 2. Spring Security 및 Thymeleaf 관련 트러블슈팅

## 2.1. Spring Security 6.x 버전 호환성 문제

- 상황: SecurityConfig.java에서 new AntPathRequestMatcher("/**") 코드가 구식(deprecated) 경고를 발생시켰습니다.
- 원인: Spring Security 버전이 6.x로 올라가면서 API가 더 간결하게 변경되었습니다.
- 해결: new AntPathRequestMatcher(...) 객체 생성 대신, URL 패턴 문자열을 직접 인자로 전달하는 방식으로 수정했습니다. (e.g., .requestMatchers("/**"))

## 2.2. Thymeleaf: `<a>` 태그를 이용한 로그아웃 실패

- 상황: <a> 태그로 구현한 로그아웃 링크가 동작하지 않았습니다.
- 원인: Spring Security의 기본 로그아웃은 CSRF 공격 방지를 위해 POST 요청으로만 동작하지만, <a> 태그는 GET 요청을 보내기 때문입니다.
- 해결: JavaScript를 이용해 <a> 태그 클릭 시 숨겨진 <form>을 submit 하도록 구현하여 POST 요청을 생성했습니다.

# 3. 기타 개발 환경 트러블슈팅

## 3.1. IntelliJ: `enum` 생성 시 Groovy 파일로 잘못 생성

- 상황: IntelliJ에서 enum을 생성했으나, 의도와 다르게 .groovy 파일이 생성되었습니다.
- 원인: IntelliJ의 일시적인 버그 또는 특정 플러그인과의 충돌로 추정됩니다.
- 해결: New -> Java Class 대신, `New` -> `Enum`을 직접 선택하여 생성하거나, 파일 생성 후 확장자를 수동으로 변경하여 해결했습니다.

## 3.2. `JAVA_HOME` 환경 변수 불일치

- 상황: 터미널(Gradle)과 IntelliJ가 사용하는 Java 버전이 달라 잠재적인 문제가 있었습니다.
- 원인: 시스템의 JAVA_HOME 환경 변수가 프로젝트와 다른 버전의 JDK를 가리키고 있었습니다.
- 해결: JAVA_HOME과 Path 환경 변수를 프로젝트 JDK 경로로 통일하여 개발 환경의 일관성을 확보했습니다.

---

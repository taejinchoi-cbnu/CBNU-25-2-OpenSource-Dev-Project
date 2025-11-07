# structure

스프링은 config, controller, dto, entity, exception, repository ,service, util 등등이 핵심 뼈대가 되고,
이를 관리하는 방법은 기능(도메인)별 구조와 계층별 구조가 있다.

- **`Controller`**: 외부 요청(API)을 받는 진입점
- **`Service`**: 핵심 비즈니스 로직 처리
- **`Repository`**: 데이터베이스 통신(CRUD) 담당
- **`Entity`**: 데이터베이스 테이블과 1:1로 매핑되는 객체
- **`DTO` / `Form`**: 계층 간 데이터 전송 및 입력 값 검증용 객체
- **`Config`**: 보안(Security) 등 프로젝트 전반의 핵심 설정
- **`Exception`**: 프로젝트 전역의 예외(오류) 처리
- **`Util`**: 특정 계층에 속하지 않는 공통 기능 (예: Markdown 변환)

이렇게 나누는 이유는 관심사의 분리(Separation of Concerns, SoC) 라는 소프트웨어 설계 원칙 때문이다.

나누면 유지보수성향상, 테스트 용이성 증가, 코드 재사용성 및 확장성, 가독성 및 협업 효율 증가등의 효과가 있다.
(하나에 다 때려박는 것보다 낫긴한듯)

## package manage
관리 방법은

```bash
com
└─ mysite
   └─ sbb
      ├─ controller
      │  ├─ QuestionController.java
      │  └─ UserController.java
      ├─ service
      │  ├─ QuestionService.java
      │  └─ UserService.java
      ├─ repository
      │  ├─ QuestionRepository.java
      │  └─ UserRepository.java
```

위와 같이 같은 파일들끼리 모아두는 계층별 구조와

```bash
com
└─ mysite
   └─ sbb
      ├─ question  // "질문" 기능
      │  ├─ QuestionController.java
      │  ├─ QuestionService.java
      │  ├─ QuestionRepository.java
      │  ├─ Question.java (Entity)
      │  └─ QuestionDto.java
      └─ user      // "회원" 기능
         ├─ UserController.java
         ├─ UserService.java
         ├─ UserRepository.java
         ├─ User.java (Entity)
         └─ UserDto.java
```

도메인으로 나누는 구조가 있다.

---

# 개발 방법

이렇게 구조를 나누고 코드를 짜야하는데 이것도 방식이 있다.

## Bottom-up

> 엔티티 -> 리포지토리 -> 서비스 -> 컨트롤러 순서의 개발 방식

### 개발 흐름
- Entity/DB 설계: 기능에 필요한 데이터 모델을 정의
- Repository 개발: Entity를 데이터베이스와 연결할 Repository 인터페이스 개발
- Service 개발: Repository를 이용해 실제 비즈니스 로직을 구현
- Controller 개발: Service의 기능을 외부에서 호출할 수 있도록 API 엔드포인트 생성

### 주의

- 프론트엔드 개발자는 백엔드 API가 완전히 개발될 때까지 기다려야 할 수 있음
(컨트롤러가 제일 마지막에 만들어져서 FE에서 테스트로 날려볼 수 없음)

## Top-down

> 컨트롤러 -> 서비스 -> 리포지토리 -> 엔티티 순서

### 개발 흐름

- Controller/API 설계: POST /questions 같은 API 엔드포인트와 요청/응답 DTO의 모양을 먼저 정의
- Service 개발: Controller가 호출할 Service의 메서드 시그니처(이름, 파라미터 등)를 정의
- Service 개발: Service의 실제 로직을 구현
- Repository/Entity 개발: Service 로직을 완성하는 데 필요한 Repository와 Entity를 생성

### 장점
API 명세가 먼저 나오므로, 프론트엔드와 백엔드가 병렬적으로 작업 가능

### 주의
- 초기 API 설계 시 데이터 구조를 잘못 예측하면, 나중에 DB 설계를 크게 변경해야 할 수도...

---

# Entity

엔티티는 DB의 테이블과 1ㄷ1로 매핑되는 객체이다.
패키지에서 new -> java class -> class로 파일 생성하면 됨

## Core Annotation
`@Entity` 어노테이션 붙이기

`@Id` 해당 필드가 테이블의 PK임을 나타낸다. (필수)

`@GeneratedValue` 키 값을 자동으로 생성하는 방법을 지정

- `strategy = GenerationType.IDENTITY` DB에 자동 증가 기능을 위임하는 방식

`@Column` 필드와 테이블의 컬럼을 매핑한다. (세부 설정용)

- `name`: 컬럼 이름을 직접 지정
- `lenght`: VARCHAR 타입의 길이를 지정 (default: 255)
- `nullalbe = true/false` : NOT NULL 제약 조건을 설정
- `unique= true/false` : UNIQUE 제약 조건을 설정
- `columnDefinition` : “TEXT”, “TIMESTAMPE” 등 컬럼의 data type을 직접 정의할 때 사용

## Mapping Annotation

`@ManyToOne` : Nㄷ1 관계
- 하나의 부모를 가진다는 의미
- ex) 여러개의 게시글은 하나의 작성자를 가진다. 게시글 엔티티에 `pricate User author;` 와 같은 필드를 두고 그 위에 `@ManyToOne`을 붙임
- DB의 FK 관계를 생성

`@OneToMany`: 1ㄷN 관계
- 여러개의 자식을 가진다는 의미
- ex) 하나의 게시글을 여러개의 댓글을 가진다. 게시글 엔티티에 `pricate List<commnet> commentList;` 와 같은 필드를 두고 그 위에 `@OneToMany`를 붙임
- mappedBy 속성이 필수
- `cascade = CascadeType.REMOVE` : 부모 엔티티(Question)가 삭제될 때, 관련된 자식 엔티티(Answer)들도 함께 삭제되도록 하는 중요한 옵션

## Lombok

`@Getter`와 `@Setter` 둘 다 사용하면 매우 편리하지만 `@Setter`의 경우 클래스 레벨에 선언하면, 엔티티의 모들 필드를 아무런 제약없이 외부에서 변경할 수 있게되고, 이는 객체의 상태가 언제 어디서 변하는지추적되기 어렵게 만들어 버그의 원인이 될 수 있다.

(DTO나 Form에서는 상관없음 핵심 비즈니스 로직을 담고 있지 않다면 `@Setter`를 사용해 편의성을 높여도 아무런 문제가 없다.)

### 다른 방법
`@Setter`를 사용하지 않고 data 변경이 필요할 때 명확한 의도를 가진 메서드를 엔티티 내부에 직접 만들기.
```java
// 엔티티 클래스 내부
public void updateSubject(String newSubject) {
    this.subject = newSubject;
}

```

### 예시
교재에서 엔티티에 그냥 `@Setter` 박아버리는데

```java
@Getter
@Setter
@Entity
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 200)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createDate;

    @OneToMany(mappedBy = "question", cascade = CascadeType.REMOVE)
    private List<Answer> answerList;

    @ManyToOne
    private SiteUser author;

    private LocalDateTime modifyDate;

    @ManyToMany
    Set<SiteUser> voter;
}

```

위 코드에서 아래와 같이 변경한다.

**수정된 엔티티**
```java
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 기본 생성자 접근 제한
@Entity
public class Question {
    // ... 필드 ...

    @Builder // 빌더 패턴으로 객체 생성
    public Question(String subject, String content, SiteUser author, LocalDateTime createDate) {
        this.subject = subject;
        this.content = content;
        this.author = author;
        this.createDate = createDate;
    }

    // 수정 메서드
    public void modify(String subject, String content) {
        this.subject = subject;
        this.content = content;
        this.modifyDate = LocalDateTime.now();
    }
}

```

이렇게 엔티티를 수정해주면 서비스계층에서 더 간단하게 할 수 있다.

**기존 코드**

```java
public void create(String subject, String content, SiteUser user) {
    Question q = new Question(); // 1. 빈 객체 생성
    q.setSubject(subject);       // 2. Setter로 값 설정
    q.setContent(content);       // 3. Setter로 값 설정
    q.setAuthor(user);
    q.setCreateDate(LocalDateTime.now());
    this.questionRepository.save(q);
}

public void modify(Question question, String subject, String content) {
    question.setSubject(subject); // 1. Setter로 값 변경
    question.setContent(content); // 2. Setter로 값 변경
    question.setModifyDate(LocalDateTime.now());
    this.questionRepository.save(question);
}

```

**변경된 코드**

```java
public void create(String subject, String content, SiteUser user) {
    Question q = Question.builder() // 빌더로 객체 생성
            .subject(subject)
            .content(content)
            .author(user)
            .createDate(LocalDateTime.now())
            .build();
    this.questionRepository.save(q);
}

public void modify(Question question, String subject, String content) {
    question.modify(subject, content); // 엔티티에게 직접 수정을 명령
    this.questionRepository.save(question);
}
```

---

# Repository

DB에 직접 접근하여 데이터를 처리하는 인터페이스 서비스와 DB 사이를 연결해준다.
패키지에서 new -> java class -> interface로 파일 생성하면 됨

## 기본 구조
```java
import org.springframework.data.jpa.repository.JpaRepository;

// JpaRepository<사용할 엔티티 클래스, 해당 엔티티의 ID(PK) 타입>
public interface Repository extends JpaRepository<T, ID> {
    // 이 안은 비어있어도 기본적인 CRUD 메서드를 모두 사용 가능
}
```

레포지토리는 Class가 아니라 Interface로 만들고, JpaRepository 인터페이스를 상속 하기만 하면 된다.
(extends)

- `JpaRepository<T, ID>`: 제네릭 타입으로 T에는 리포지토리가 다룰 엔티티를, ID에는 해당 엔티티의 기본 키(PK) 타입(ex. Integer)을 지정
- `@Repository` Annotation과 함께 선언하면 자동으로 이 인터페이스의 구현체를 생성하여 Bean으로 등록해줌. (`@Repository` Annotation 생략 가능)

## 기본 제공 CRUD Method

- `save(S entity)`: 주어진 엔티티를 저장(INSERT)하거나 수정(UPDATE)
- `findById(ID id)`: 주어진 ID에 해당하는 엔티티 1개를 Optional 객체로 반환
- `findAll()`: 해당 엔티티의 모든 데이터를 List 형태로 반환
- `delete(T entity)`: 주어진 엔티티를 데이터베이스에서 삭제
- `count()`: 해당 엔티티의 전체 데이터 개수를 반환

서비스 계층에서 레포지토리 가져오고 .method()로 쓰면 된다.

## Query Method

JPA의 기능으로 정해진 큐칙에 따라 메서드 이름만 작성하면, 스프링이 그 이름을 분석해서 자동으로 SQL Query를 만들고 실행해준다.

### 예시
- findBy[엔티티 속성 이름](...타입 파라미터): 가장 기본적인 조회 메서드
  - Question findBySubject(String subject);
  - -> `SELECT * FROM question WHERE subject = ?`
  - List<Question> findByAuthor(SiteUser author);
  - -> `SELECT * FROM question WHERE author_id = ?`
  
## `@Query`를 이용한 직접 쿼리 작성
메서드 이름만으로 만들기 어려운 복잡한 쿼리는 `@Query` Annotation을 사용해서 직접 쿼리문을 만들 수 있다.
  
- JPQL(Java Persistence Query Language): SQL과 유사하지만, 테이블이 아닌 엔티티 객체를 대상으로 하는 객체지향 쿼리 언어
- nativeQuery = true: 순수한 SQL(Native SQL)을 직접 사용하고 싶을 때 사용하는 옵션

### 예시
  ```java
  import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuestionRepository extends JpaRepository<Question, Integer> {

    // JPQL 사용 예시
    @Query("SELECT q FROM Question q WHERE q.subject LIKE %:keyword% OR q.content LIKE %:keyword%")
    List<Question> searchByKeyword(@Param("keyword") String keyword);

    // Native SQL 사용 예시
    @Query(value = "SELECT * FROM question ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Question findRandomQuestion();
}
  ```
  
## Pagination && Sorting
  Pageable 인터페이스를 파라미터로 사용하면 페이징과 정렬 처리를 간단하게 할 수 있다.
  
  ```java
  public interface QuestionRepository extends JpaRepository<Question, Integer> {
    // 이 메서드 하나로 페이징과 정렬을 모두 처리 가능
    Page<Question> findAll(Pageable pageable);

    // 검색 조건이 포함된 페이징
    Page<Question> findBySubjectContaining(String keyword, Pageable pageable);
}
  ```
  
- `Pageable`: 페이지 번호(page), 페이지 당 데이터 개수(size), 정렬(sort) 정보를 담고 있는 객체

- `Page<T>`: 페이징된 데이터 목록과 함께 전체 페이지 수, 전체 데이터 개수 등 추가적인 페이징 정보를 포함하는 객체
  
---
  
# DTO / Form

DTO는 Layer 간 데이터 전송을 위해 사용하는 객체로
특히 클라이언트와 Controller 사이에서 데이터를 주고받을 때, 각 상황에 맞는 '데이터 운반용 그릇' 역할을 한다.

Form은 그중에서도 사용자의 Request을 받고, 그 값의 유효성을 Validation하기 위해 특화된 DTO라고 할 수 있다.
  
## 사용하는 이유

엔티티를 컨트롤러에서 바로 사용하지 않고 DTO를 거쳐서 사용하는 이유는 다음과 같다.

### 계층 간 역할 분리
컨트롤러는 사용자의 요청과 응답에만 집중하고, 데이터베이스와 직접 연결된 엔티티의 상세한 구조는 몰라도 되도록 역할을 분리한다.

### Validation
DTO는 사용자의 입력값이 비어있는지(`@NotEmpty`), 글자 수 제한(`@Size`)을 만족하는지, 이메일 형식(`@Email`)에 맞는지 등 비즈니스 로직이 실행되기 전에 데이터의 유효성을 검증한다.

### 화면에 필요한 데이터만 선택적 노출
엔티티는 DB 테이블의 모든 컬럼(민감 정보 포함)을 가지고 있을 수 있다.
이때 응답용 DTO를 사용하면, 사용자에게 보여줄 필요가 있는 데이터만 선택하여 안전하게 전달할 수 있다.

### 보안 강화
엔티티를 컨트롤러에서 직접 매개변수로 받을 경우, 사용자가 악의적으로 요청 데이터에 포함시킨 필드(예: role="ADMIN")가 엔티티에 그대로 바인딩되어 저장되는 '대량 할당 취약점(Mass Assignment Vulnerability)'이 발생할 수 있다.
하지만 DTO를 사용하면 DTO에 정의된 필드만 안전하게 전달받을 수 있습니다.

## Validation Annotations

`@NotEmpty`: null과 빈 문자열("")을 허용 X

`@NotBlank`: null, 빈 문자열, 그리고 공백만으로 이루어진 문자열(" ")을 허용 X (문자열 검증에 더 엄격)

`@Size(min, max)`: 문자열의 길이, 배열 또는 컬렉션의 크기를 제한

`@NotNull`: null을 허용 X (모든 타입에 사용 가능)

`@Email`: 이메일 형식을 검증합니다.

@Valid: 컨트롤러 메서드의 DTO/Form 매개변수 앞에 붙여, 해당 객체에 정의된 Validation 애너테이션들을 실제로 검증하도록 스프링에 지시하는 트리거 역할을 합니다.
  
## DTO <-> Entity
  
- Request 흐름: Controller는 `@Valid`와 함께 Request DTO를 받는다.
  - Service는 이 DTO를 전달받아 Entity로 변환한 뒤 Repository에 저장을 요청한다.

- Response 흐름: Service는 Repository로부터 Entity를 전달받는다.
  - Service는 이 Entity를 Response DTO로 변환하여 Controller에 반환
  - Controller는 이 DTO를 JSON 형태로 사용자에게 응답
  
---

# Service
  
핵심 비즈니스 로직을 처리하는 계층 컨트롤러로부터 요청을 전달받아 레포지토리를 통해 DB에 접근하고 가공된 데이터를 다시 컨트롤러에 반환하는 역할을 수행한다.
  
- **비즈니스 로직 구현**: "회원가입 시 사용자의 등급을 부여한다", "게시글을 저장할 때 작성 시간을 기록한다", "주문 금액에 따라 배송비를 계산한다" 와 같은 애플리케이션의 고유한 규칙과 처리 과정을 구현
- **트랜잭션(Transaction) 관리**: 여러 개의 데이터베이스 작업을 하나의 원자적인 단위로 묶어서 처리한다.
  예를 들어, '계좌 이체'라는 작업은 'A 계좌 출금'과 'B 계좌 입금'이 모두 성공하거나 모두 실패해야 한다. (한쪽만 성공하면 안됨)
  서비스 계층에서 이러한 트랜잭션을 관리하여 데이터의 일관성을 보장한다.
- **데이터 변환 (Entity ↔ DTO)**: 리포지토리로부터 받은 엔티티(Entity) 객체를 컨트롤러가 사용하기 좋은 DTO(Data Transfer Object)로 변환하거나, 컨트롤러로부터 받은 DTO를 엔티티로 변환하여 리포지터리에 전달하는 역할을 한다.
  
## Core Annotation
  
- `@Service`
  클래스 위에 붙여 **"이 클래스는 비즈니스 로직을 담당하는 서비스 컴포넌트임"**이라고 스프링 컨테이너에 알려준다.

> 스프링은 이 Annotation이 붙은 클래스를 자동으로 찾아 Bean으로 등록하고 관리

- `@RequiredArgsConstructor (Lombok)`
final 키워드가 붙은 필드를 포함하는 생성자를 자동으로 만들어주는 Lombok Annotation이다.

> service는 보통 repository를 필요로 하므로, 생성자를 통한 DI를 구현하기 위해 거의 항상 사용됨
  (코드에서 `private final QuestionRepository  questionRepository;` 부분에 해당)

- `@Transactional`
이 Annotation이 붙은 메서드는 전체가 하나의 트랜잭션 단위로 묶여 실행된다.

> 메서드 실행 중에 Exception가 발생하면, 그 안에서 실행된 모든 데이터베이스 작업(INSERT, UPDATE, DELETE 등)이 **자동으로 취소(Rollback)**되어 데이터 일관성을 지켜준다.
`@Transactional(readOnly = true)`: 조회(SELECT)만 하는 메서드에 이 옵션을 주면, 데이터베이스의 부하를 줄여 성능을 최적화할 수 있다.

---
  
# Controller
  
클라이언트로부터 들어오는 HTTP Request을 받아, 어떤 Service를 호출할지 결정하고, 그 결과를 사용자에게 Response하는 계층
(endpoint 만들고 요청이 들어오는 진입점? 이라고 생각)

## 컨트롤러의 핵심 역할
- **HTTP 요청 접수 및 URL 매핑**
  `/question/list` 같은 특정 URL과 GET, POST 같은 HTTP Method에 맞는 처리 메서드를 연결

- **사용자 입력 처리 및 검증**
  URL 경로의 값(`@PathVariable`), 쿼리 파라미터(`@RequestParam`), 또는 요청 본문(`@RequestBody`)에 담긴 사용자 데이터를 DTO나 Form 객체로 전달받고, `@Valid`를 통해 유효성을 검증

- **서비스 계층 호출**
 실제 비즈니스 로직 처리를 서비스 계층에 Toss한다.
  컨트롤러는 "어떻게" 처리할지 고민하지 않고, "누구(어떤 서비스)에게" 일을 시킬지만 결정

- **응답(View 또는 Data) 결정**
서비스로부터 받은 결과를 어떤 형태 `return` 할 지 결정한다.
HTML 페이지를 보여줄지(View 렌더링), 아니면 raw data(JSON)를 전달할지 결정

## Core Annotation

- **`@Controller`**
이 클래스가 웹 요청을 처리하는 컨트롤러임을 나타낸다. (SSR에서 사용)

- **`@RestController`**
`@Controller`와 `@ResponseBody`가 합쳐진 애너테이션
이 컨트롤러의 모든 메서드는 뷰를 반환하는 대신, **데이터(주로 JSON)**를 직접 반환 (CSR에서 사용)

## Mapping Annotation
  
- **`@RequestMapping("/prefix")`**
클래스 레벨에 붙여, 해당 컨트롤러의 모든 메서드에 공통적인 URL 접두사를 부여 (예: @RequestMapping("/api"))
(중복되는 부분 줄여줄 수 있음)

- **`@GetMapping()`** , **`@PostMapping()`** , **`@PutMapping()`** , **`@DeleteMapping()`**
 GET, POST, PUT, DELETE HTTP 메서드 요청을 처리하는 메서드에 붙이는 Annotation, ()에 endpoint를 넣어야한다.

- **`RequestMapping()`**
  괄호안에 endpoint와 HTTP method를 넣어서 Mapping하는 방식이다.
  (`value="/api", method=RequestMethod.GET`)
컨트롤러 내의 모든 메서드에 **공통적인 URL 접두사(prefix)**를 부여하여 코드 중복을 줄이기 위해 보통 클래스 레벨에서 사용한다.
  

## Method Security Annotation (메서드 보안 애너테이션)
  
`@PreAuthorize`
**메서드가 실행되기 전(Pre)**에 권한(Authorize)을 검사하는 스프링 시큐리티 애너테이션

괄호 안에 SpEL(Spring Expression Language)이라는 표현식을 사용하여 매우 강력하고 동적인 접근 제어 규칙을 만들 수 있다.
이 표현식의 결과가 true이면 메서드가 실행되고, false이면 접근이 거부된다.
(인증 관련에서 사용하면 될듯?)

이 기능을 사용하려면 SecurityConfig 클래스에 `@EnableMethodSecurity(prePostEnabled = true)` 애너테이션을 반드시 추가해야 합니다.

### Ex)

#### **`@PreAuthorize("isAuthenticated()")`**

가장 기본적이고 널리 사용되는 표현식
현재 사용자가 로그인(인증)된 상태인지 확인
로그인하지 않은 Anonymous User가 이 애너테이션이 붙은 메서드를 호출하려고 하면 접근이 차단됨

#### **`@PreAuthorize("hasRole('ADMIN')")`**

현재 사용자가 **'ADMIN' 역할(Role)**을 가지고 있는지 확인
ROLE_ 접두사는 자동으로 처리됩니다.

예시: @PreAuthorize("hasRole('ADMIN') or hasRole('USER')") 와 같이 or, and 연산자도 사용 가능

#### `@PreAuthorize("#id == principal.username")`

`#id` : 메서드의 파라미터 이름이 id인 값을 가리킵니다.

`principal.username` : 현재 로그인한 사용자의 아이디를 가리킵니다.

"이 메서드의 id 파라미터 값과 현재 로그인한 사용자의 아이디가 같을 때만 메서드를 실행하라."
즉, '자기 자신의 글만 수정/삭제할 수 있다' 와 같은 기능을 구현할 때 사용된다.

## Parameter Annotation

- **`@PathVariable`**
URL 경로의 일부를 변수로 받을 때 사용합니다.
(예: /question/detail/{id}의 {id} 값을 받음)
`@PathVariable("id") Integer id` 이렇게 사용하는 변수와 타입을 알려줘야한다.

- **`@RequestParam`**
URL의 Query Parameter를 받을 때 사용 (예: /question/list?page=0의 page 값을 받음)
defaultValue 속성을 통해 기본값을 지정 가능

- **`@RequestBody`**
 POST나 PUT 요청의 body에 담겨오는 JSON 데이터를 DTO 객체로 변환할 때 사용합
(@RestController에서 주로 사용)

- **`@Valid`**
DTO/Form 객체에 정의된 유효성 검증(Validation) 규칙을 실행하도록 지시한다.
BindingResult 객체와 함께 사용하여 검증 결과를 처리

### Parameters

- **`BindingResult`**
`@Valid` 애너테이션 바로 뒤에 위치해야 하는 파라미터이다.
`@Valid`의 검증 결과를 담는 객체로, 유효성 검증에 실패한 경우 오류 정보를 담고 있다.
`bindingResult.hasErrors()` 메서드를 통해 오류 발생 여부를 확인할 수 있다.
  
- **`Principal`**
현재 로그인한 사용자의 정보를 담고 있는 객체
Spring Security가 자동으로 현재 인증된(로그인된) 사용자의 정보를 주입해 준다.
주로 principal.getName()을 통해 현재 사용자의 아이디(username)를 가져올 때 사용한다.

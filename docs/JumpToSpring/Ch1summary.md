## Controller

컨트롤러는 서버에 전달된 클라이언트의 요청을 처리하는 자바 클래스이다.

패키지에 java Class file 생성으로 컨트롤러를 만들면 되고, 생성만 하면 아래와 같은 파일만 생성되고 여기에 코드를 작성해서 컨트롤러를 만든다.

```Java
package com.mysite.sbb;

public class HelloController {

}

```

먼저 public class 위 라인에 @Controller Annotation을 추가해야 스프링 부트 프레임워크가 컨트롤러로 인식한다.

```Java
package com.mysite.sbb;

import org.springframework.stereotype.Controller;

@Controller
public class HelloController {

}

```

그리고 이제 엔드포인트를 만들어야한다.

```Java
package com.mysite.sbb;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HelloController {
    @GetMapping("/hello")
    @ResponseBody
    public String hello() {
        return "Hello World";
    }
}

```

- `@GetMapping(”/url”)`  Annotation은 `BASE_URL/url` 로 URL 요청이 발생하면 `@Controller` 중에서 이 endpoint를 가진 url() 메서드를 찾아서 실행해준다.

- `@ResponseBody` 는 "HTML 파일 찾지 말고, 이 메서드의 return 값을 그대로 응답하세요" 라는 뜻이다.

### 만약 `@ResponseBody`가 없다면?
Spring Boot는 `hello()` 메서드가 반환하는 "Hello World"라는 이름의 **HTML 파일(템플릿)**을 찾으려고 시도하고.
당연히 그런 파일이 없으니 오류가 발생한다.

### `@ResponseBody`가 있다면?
"템플릿 파일 같은 거 찾지 말고, 그냥 이 메서드가 반환하는 값을 데이터 그대로 브라우저에 보내라." 라는 강력한 지시

물론 다른 HTTP 프로토콜인 POST, PUT, DELETE 등도 가능하다.

- `@GetMapping`: 데이터 조회 (GET)

- `@PostMapping`: 데이터 생성/전송 (POST)

- `@PutMapping`: 데이터 수정 (PUT)

- `@DeleteMapping`: 데이터 삭제 (DELETE)

(더 있긴 한데 일단 4개정도만)

그래서 1-03의 내용을 전부 작성하고 server를 켜고 /hello로 이동하면 입력된 값이 브라우저에 출력되는 것을 확인할 수 있다.

## Spring Boot Devtools
코드 수정하면 서버를 껏다켜야하는 귀찮음이 있다.
하지만 이를 해결하는 방법이 있는데 이를 위해서는 Spring Boot Devtools를 설치해야 한다.
Spring Boot Devtools를 설치하면 서버를 재시작하지 않아도 클래스를 변경할 때 서버가 자동으로 재가동된다.
사용하려면 build.gradle 파일을 찾아 수정하자.

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

```

그리고 인텔리제이를 쓴다면 2가지 설정을 체크해줘야한다.
(window 기준)

**1단계: Build project automatically 활성화**

이 설정은 IntelliJ가 변경사항을 감지하면 자동으로 프로젝트를 컴파일하도록 만들어준다.

1. File → Settings -> Build, Execution, Deployment → Compiler 로 이동

2. Build project automatically 항목 체크

3. Apply → OK 버튼을 눌러 적용

**2단계: Advanced Settings 변경**

1. File → Settings -> Advanced Settings -> Compiler 섹션

2. Allow auto-make to start even if developed application is currently running 항목 체크

이제 클래스 파일을 수정하고 기다리면 서버가 자동으로 재시작 된다.
(웹 브라우저도 새로고침하면 수정된 내용이 적용됨)

## Lombok

롬복(Lombok) 라이브러리는 소스 코드를 작성할 때 자바 클래스에 애너테이션을 사용하여 자주 쓰는 `Getter`, `Setter` 메서드, 생성자 등을 자동으로 만들어 주는 도구이다.

데이터 처리와 관련해서 entity class나 DTO class등을 사용해야 하는데 그 전에 먼저 이 클래스들의 프로퍼티를 읽고 저장하는 `Getter`, `Setter` 메서드를 만들어야 하는데, 이때 getter setter를 조금 더 간결하게 작성할 수 있게 해준다.

### build.gradle에 의존성 추가

```gradle
compileOnly 'org.projectlombok:lombok'
annotationProcessor 'org.projectlombok:lombok'
testCompileOnly 'org.projectlombok:lombok'
testAnnotationProcessor 'org.projectlombok:lombok'

```

### 비교

얼마나 간결해지냐면

**사용 전**

```java
public class HelloLombok {
    private String hello;
    private int lombok;

    public void setHello(String hello) {
        this.hello = hello;
    }

    public void setLombok(int lombok) {
        this.lombok = lombok;
    }

    public String getHello() {
        return this.hello;
    }

    public int getLombok() {
        return this.lombok;
    }

    public static void main(String[] args) {
        HelloLombok helloLombok = new HelloLombok();
        helloLombok.setHello("헬로");
        helloLombok.setLombok(5);

        System.out.println(helloLombok.getHello());
        System.out.println(helloLombok.getLombok());
    }
}

```

**Lombok 사용 후**

```java
package com.mysite.sbb;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HelloLombok {
    private String hello;
    private int lombok;

    public static void main(String[] args) {
        HelloLombok helloLombok = new HelloLombok();
        helloLombok.setHello("헬로");
        helloLombok.setLombok(5);

        System.out.println(helloLombok.getHello());
        System.out.println(helloLombok.getLombok());
    }
}

```

1장 끝

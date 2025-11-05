package com.mysite.sbb;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HelloController {
    @GetMapping("/sbb")/*요청된 Url과의 mapping 즉, 여기에서는 sbb와의 맵핑 */
    @ResponseBody
    public String index() {
        return "안녕하세요 sbb에 오신 것을 환영합니다.";/*이런식으로 return 값이 있어야 하는데
        @ResponseBody가 있어야 함 */
    }
}
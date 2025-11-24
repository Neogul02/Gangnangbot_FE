# 📚 Services 폴더 구조 및 설계 원칙

## 🎯 폴더 구조

```
src/services/
├── api/                    # 📡 순수 API 요청 레이어
│   ├── auth.ts            # 인증 관련 API
│   ├── session.ts         # 세션 관리 API
│   ├── message.ts         # 메시지 송수신 API
│   ├── profile.ts         # 프로필 관리 API
│   └── types.ts           # TypeScript 타입 정의
│
├── hooks/                  # 🎣 React Query 훅 레이어
│   └── index.ts           # TanStack Query 커스텀 훅
│
├── api.ts                  # 🔧 Axios 설정 및 인터셉터
├── index.ts               # 📦 통합 Export
└── api.json               # 📄 Swagger/OpenAPI 문서
```

---

## 🏗️ 레이어 분리 원칙 (Separation of Concerns)

### 1️⃣ **API 레이어** (`api/`)

**역할**: HTTP 요청을 보내고 응답을 받는 순수 함수들

```typescript
// api/session.ts
export async function createSession(): Promise<CreateSessionResponse> {
  const response = await api.post<CreateSessionResponse>('/sessions/')
  return response.data
}
```

**특징**:

- ✅ 비즈니스 로직 없음 (단순 HTTP 통신)
- ✅ React에 의존하지 않음 (순수 TypeScript)
- ✅ 재사용 가능 (다른 프레임워크에서도 사용 가능)
- ✅ 테스트하기 쉬움

**왜 분리했나?**

- API 호출 로직과 상태 관리 로직을 분리하여 **단일 책임 원칙(SRP)** 준수
- React 없이도 API를 테스트하거나 다른 곳에서 재사용 가능

---

### 2️⃣ **Hooks 레이어** (`hooks/`)

**역할**: React Query를 사용한 데이터 페칭 및 캐싱 관리

```typescript
// hooks/index.ts
export function useListSessions() {
  return useQuery({
    queryKey: ['sessions', 'list'],
    queryFn: sessionAPI.listSessions, // ← api 레이어 사용
    // TanStack Query가 자동으로 캐싱, 재검증, 로딩 상태 관리
  })
}
```

**특징**:

- ✅ React 컴포넌트에서 사용하는 **인터페이스**
- ✅ 캐싱, 자동 재검증, 낙관적 업데이트 제공
- ✅ 로딩, 에러 상태를 자동으로 관리
- ✅ 서버 상태(Server State)를 React 상태로 동기화

**왜 분리했나?**

- API 호출 로직(비즈니스 로직)과 상태 관리 로직(UI 로직)을 분리
- TanStack Query의 강력한 캐싱 기능을 활용하면서도 API 함수는 독립적으로 유지

---

### 3️⃣ **설정 레이어** (`api.ts`)

**역할**: Axios 인스턴스 설정, 인터셉터, 토큰 관리

```typescript
// api.ts
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Request 인터셉터: 자동으로 토큰 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response 인터셉터: 401 에러 시 로그아웃
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

**특징**:

- ✅ 모든 API 요청에 공통으로 적용되는 설정
- ✅ 인증 토큰 자동 추가
- ✅ 에러 처리 중앙화
- ✅ SSE 스트리밍 지원

---

## 📚 사용 라이브러리 원리

### 🔹 Axios (HTTP 클라이언트)

**왜 Axios를 사용하나?**

- 브라우저 기본 `fetch`보다 사용하기 편리
- 인터셉터로 공통 로직 처리 가능
- 자동 JSON 변환
- 타임아웃, 취소 기능 내장

**핵심 개념**:

```typescript
// 1. 인스턴스 생성
const api = axios.create({ baseURL: 'http://api.com' })

// 2. 인터셉터 (모든 요청/응답을 가로채서 처리)
api.interceptors.request.use((config) => {
  // 요청 전에 실행 (토큰 추가 등)
  config.headers.Authorization = 'Bearer token'
  return config
})

api.interceptors.response.use(
  (response) => response, // 성공 응답
  (error) => {
    // 에러 응답
    if (error.response?.status === 401) {
      // 로그아웃 처리
    }
    return Promise.reject(error)
  }
)

// 3. 실제 요청
await api.get('/users')
await api.post('/sessions', { data: '...' })
```

**동작 흐름**:

```
컴포넌트
  ↓ api.get('/users')
Request 인터셉터 (토큰 추가)
  ↓
서버로 요청 전송
  ↓
서버 응답
  ↓
Response 인터셉터 (에러 처리)
  ↓
컴포넌트로 데이터 반환
```

---

### 🔹 TanStack Query (React Query v5)

**왜 TanStack Query를 사용하나?**

- 서버 상태(Server State)를 관리하는 최고의 라이브러리
- 캐싱으로 불필요한 API 호출 최소화
- 로딩/에러 상태를 자동으로 관리
- 백그라운드 자동 재검증 (Stale-While-Revalidate)

**핵심 개념**:

#### 1. **Query** (데이터 읽기)

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['sessions', 'list'], // 캐시 키 (고유 식별자)
  queryFn: listSessions, // 데이터를 가져오는 함수
  staleTime: 5000, // 5초간 데이터를 신선하다고 간주
})
```

**동작 원리**:

```
1. 컴포넌트 마운트
   ↓
2. queryKey로 캐시 확인
   ↓
3-A. 캐시 있음 → 즉시 캐시 반환 → 백그라운드에서 재검증
3-B. 캐시 없음 → queryFn 실행 → 데이터 가져오기
   ↓
4. 데이터를 캐시에 저장
   ↓
5. 컴포넌트에 데이터 전달
```

#### 2. **Mutation** (데이터 변경)

```typescript
const { mutate } = useMutation({
  mutationFn: createSession,
  onSuccess: () => {
    // 세션 목록 캐시 무효화 → 자동 재검증
    queryClient.invalidateQueries({ queryKey: ['sessions'] })
  },
})
```

**동작 원리**:

```
1. mutate() 호출
   ↓
2. mutationFn 실행 (API 요청)
   ↓
3. 성공 시 onSuccess 콜백
   ↓
4. invalidateQueries로 캐시 무효화
   ↓
5. 해당 queryKey를 사용하는 모든 쿼리 자동 재실행
```

#### 3. **Query Key** (캐시 식별자)

```typescript
// 계층적 키 구조
export const queryKeys = {
  sessions: {
    all: ['sessions'], // 모든 세션 관련
    list: (inactive) => ['sessions', 'list', { inactive }], // 세션 목록
    messages: (id) => ['sessions', id, 'messages'], // 특정 세션의 메시지
  },
}

// 사용 예시
useQuery({ queryKey: queryKeys.sessions.list(false) })
// → ['sessions', 'list', { inactive: false }]
```

**왜 계층적 키가 중요한가?**

```typescript
// 세션 생성 후 모든 세션 관련 캐시 무효화
queryClient.invalidateQueries({ queryKey: ['sessions'] })

// 이렇게 하면:
// ✅ ['sessions', 'list', { inactive: false }] 무효화
// ✅ ['sessions', 'list', { inactive: true }] 무효화
// ✅ ['sessions', 'abc-123', 'messages'] 무효화
// → 'sessions'로 시작하는 모든 쿼리가 재검증됨!
```

---

### 🔹 SSE (Server-Sent Events) 스트리밍

**왜 SSE를 사용하나?**

- 챗봇 응답을 실시간으로 받기 위해
- WebSocket보다 간단하고 HTTP 기반
- 서버 → 클라이언트 단방향 통신 (챗봇에 적합)

**동작 원리**:

```typescript
// api.ts
export async function streamSSE(endpoint: string, data: unknown, onMessage: (chunk: { text: string; done: boolean }) => void) {
  const response = await fetch(endpoint, { method: 'POST', body: JSON.stringify(data) })
  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6))
        onMessage(data) // ← 실시간으로 UI 업데이트
      }
    }
  }
}
```

**실제 사용**:

```typescript
// 챗봇 응답을 실시간으로 받기
const [response, setResponse] = useState('')

await sendMessage({ session_id: 'abc', message: '안녕?' }, (chunk) => {
  if (!chunk.done) {
    setResponse((prev) => prev + chunk.text) // 한 글자씩 추가
  }
})
```

**서버 응답 예시**:

```
data: {"text": "안", "done": false}
data: {"text": "녕", "done": false}
data: {"text": "하", "done": false}
data: {"text": "세", "done": false}
data: {"text": "요", "done": false}
data: {"text": "", "done": true}
```

---

## 🔄 데이터 흐름 (전체 아키텍처)

```
┌─────────────────┐
│   React 컴포넌트  │
│  (ChatPage.tsx)  │
└────────┬─────────┘
         │ useListSessions()
         ↓
┌─────────────────────────┐
│    TanStack Query       │
│  (hooks/index.ts)       │
│  - 캐싱                  │
│  - 로딩 상태 관리         │
│  - 자동 재검증           │
└────────┬─────────────────┘
         │ sessionAPI.listSessions()
         ↓
┌─────────────────────────┐
│      API 레이어          │
│  (api/session.ts)       │
│  - 순수 HTTP 호출        │
└────────┬─────────────────┘
         │ api.get('/sessions/')
         ↓
┌─────────────────────────┐
│    Axios 인스턴스        │
│    (api.ts)             │
│  - 토큰 자동 추가        │
│  - 에러 인터셉터         │
└────────┬─────────────────┘
         │ HTTP Request
         ↓
┌─────────────────────────┐
│     백엔드 서버          │
│  (FastAPI)              │
└─────────────────────────┘
```

---

## 💡 사용 예시

### 기본 사용법

```typescript
import { useListSessions, useCreateSession } from '@/services'

function ChatPage() {
  // 1. 세션 목록 자동 로딩
  const { data: sessions, isLoading, error } = useListSessions()

  // 2. 세션 생성
  const { mutate: createSession } = useCreateSession({
    onSuccess: (newSession) => {
      console.log('세션 생성됨:', newSession.session_id)
      // TanStack Query가 자동으로 세션 목록을 다시 불러옴!
    },
  })

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러: {error.message}</div>

  return (
    <div>
      <button onClick={() => createSession()}>새 채팅</button>
      {sessions?.sessions.map((session) => (
        <div key={session.sid}>{session.title}</div>
      ))}
    </div>
  )
}
```

### SSE 스트리밍 사용법

```typescript
import { useSendMessage } from '@/services'

function ChatInput({ sessionId }: { sessionId: string }) {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const { sendMessage } = useSendMessage()

  const handleSend = async () => {
    setResponse('') // 초기화

    await sendMessage(
      { session_id: sessionId, message },
      (chunk) => {
        if (!chunk.done) {
          setResponse((prev) => prev + chunk.text) // 실시간 추가
        } else {
          console.log('완료!')
        }
      },
      (error) => {
        console.error('에러:', error)
      }
    )
  }

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>전송</button>
      <div>{response}</div> {/* 실시간으로 업데이트됨 */}
    </div>
  )
}
```

---

## ✅ 이 구조의 장점

### 1. **관심사 분리 (Separation of Concerns)**

- API 로직 ↔ 상태 관리 ↔ UI 로직이 명확히 분리
- 각 레이어가 독립적으로 테스트 가능

### 2. **재사용성**

- `api/` 폴더는 React 없이도 사용 가능
- 다른 프로젝트(Node.js, React Native)에서도 재사용 가능

### 3. **유지보수성**

- API 엔드포인트 변경 시 `api/` 폴더만 수정
- TanStack Query 설정 변경 시 `hooks/` 폴더만 수정
- 각 파일의 책임이 명확하여 수정 범위가 제한적

### 4. **타입 안정성**

- `types.ts`에서 모든 타입을 중앙 관리
- API 응답과 UI가 항상 동기화됨

### 5. **성능 최적화**

- TanStack Query의 자동 캐싱으로 불필요한 API 호출 최소화
- 백그라운드 재검증으로 항상 최신 데이터 유지

### 6. **DX (Developer Experience)**

- 자동완성, 타입 체크로 개발 속도 향상
- 로딩/에러 상태를 자동으로 처리하여 보일러플레이트 감소

---

## 🎓 추가 학습 자료

- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [Axios 인터셉터 가이드](https://axios-http.com/docs/interceptors)
- [SSE (Server-Sent Events) MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Clean Architecture in Frontend](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

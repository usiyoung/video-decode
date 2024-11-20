
# Video Streaming Application

이 프로젝트는 **FFmpeg**를 사용하여 실시간으로 MJPEG 형식의 이미지를 스트리밍하는 간단한 비디오 스트리밍 애플리케이션입니다.  
클라이언트는 WebSocket을 통해 서버로부터 이미지를 받아와 캔버스에 렌더링합니다.

## 포트 정보

- **WebSocket 서버**: `ws://localhost:3001`

## 실행 방법

### 1. 필수 요구사항
- **Node.js** (v16 이상)
- **FFmpeg** 

    #### FFmpeg 설치(macOS)
  ```bash
  brew install ffmpeg
  ```
  
### 2. 설치 및 실행
- 패키지 설치
    ```shell
    npm install
    ```

- 서버 실행
    ```shell
    node server.js
    ```

- 클라이언트 실행
  - index.html 파일을 브라우저에서 엽니다.

## 주요 기능
- FFmpeg를 사용하여 비디오를 MJPEG 이미지로 스트리밍
- 클라이언트가 WebSocket을 통해 이미지를 수신 및 렌더링
- 캔버스에 지연 시간 표시

## 주의 사항
- FFmpeg 설치가 필요합니다.
- 스트리밍 URL이 동작하지 않을 경우, 대체 URL로(VIDEO_PATH) 설정하세요.
- 포트 충돌 시 server.js에서 포트를 변경하세요.
 

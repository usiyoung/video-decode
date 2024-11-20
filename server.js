const { spawn } = require("child_process");
const WebSocket = require("ws");
const path = require("path");

const PORT = 3001;

// URL TEST
const VIDEO_URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
// PATH TEST
const VIDEO_PATH = path.join(__dirname, '/assets/test_video.mp4');

const FRAME_OPTIONS = [
    "-vf", "fps=15,scale=640:360", // FPS 및 해상도 설정
    "-q:v", "31", // 화질 설정
    "-fflags", "+discardcorrupt",  // 손상된 프레임 건너뛰기
    "-preset", "ultrafast", // 빠른 인코딩
    "-f", "image2pipe", // MJPEG 스트림 생성
    "-vcodec", "mjpeg", // MJPEG 코덱 설정
    "pipe:1", // 파이프로 출력
];

const wss = new WebSocket.Server({ port: PORT });

wss.on("connection", (ws) => {
    console.log("클라이언트가 연결되었습니다.");

    // VIDEO_URL OR VIDEO_PATH
    const ffmpeg = startFFmpegProcess(VIDEO_URL);

    // FFmpeg 데이터 전송 처리
    handleFFmpegOutput(ffmpeg, ws);

    // 클라이언트 연결 종료 처리
    ws.on("close", () => {
        console.log("클라이언트 연결이 종료되었습니다.");
        terminateProcess(ffmpeg, "SIGINT");
    });

    // FFmpeg 종료 처리
    ffmpeg.on("close", (code) => {
        console.log(`FFmpeg 프로세스가 종료되었습니다. 종료 코드: ${code}`);
        ws.close();
    });
});

// FFmpeg 프로세스 시작 함수
function startFFmpegProcess(videoPath) {
    return spawn("ffmpeg", ["-i", videoPath, ...FRAME_OPTIONS]);
}

// FFmpeg 데이터 처리 함수
function handleFFmpegOutput(ffmpeg, ws) {
    ffmpeg.stdout.on("data", (chunk) => {
        if (chunk && chunk.length > 1024 && ws.readyState === WebSocket.OPEN) {
            if (isValidJPEG(chunk)) {
                ws.send(chunk);
                console.log(`정상적으로 처리된 청크 크기: ${chunk.length} bytes`);
            } else {
                console.warn("손상된 JPEG 청크를 건너뜁니다.");
            }
        } else {
            console.warn("유효하지 않은 청크를 받았습니다. 건너뜁니다.");
        }
    });

    function isValidJPEG(buffer) {
        // JPEG 파일은 항상 0xFFD8으로 시작하고 0xFFD9로 끝남
        return buffer[0] === 0xFF && buffer[1] === 0xD8 &&
            buffer[buffer.length - 2] === 0xFF && buffer[buffer.length - 1] === 0xD9;
    }

    ffmpeg.stderr.on("data", (data) => {
        console.error(`FFmpeg 오류: ${data}`);
    });
}

// FFmpeg 프로세스 종료 함수
function terminateProcess(process, signal) {
    if (process && !process.killed) {
        process.kill(signal);
        console.log(`FFmpeg 프로세스가 ${signal} 신호로 종료되었습니다.`);
    }
}

console.log(`WebSocket 서버가 ws://localhost:${PORT} 에서 실행 중입니다.`);
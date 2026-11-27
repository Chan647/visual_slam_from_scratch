# Visual SLAM 강의노트

**사이트 바로가기: https://chan647.github.io/visual_slam_from_scratch/**

좌표 변환부터 ORB-SLAM3까지, Visual SLAM을 처음부터 배우는 15강 강의노트다.

- 파트 1 수학 기초: 강체 변환, 회전 표현, 리 군, 확률, 최적화
- 파트 2 카메라 기하: 카메라 모델, 특징점, 에피폴라, PnP, 번들 조정
- 파트 3 SLAM 시스템: VO, 백엔드, 루프 클로저, VIO, ORB-SLAM3

## 구조

```
index.html              홈 (노선도, 커리큘럼)
lessons/lesson-NN.html  강의 페이지
assets/style.css        공용 스타일
assets/app.js           강의 목록, 진도, 연습문제 저장
assets/lesson-NN.js     강의별 시뮬레이터
```

## 새 강의 추가

1. `lessons/lesson-NN.html` 작성 (lesson-01.html 구조 복사)
2. `assets/app.js`의 `LESSONS`에서 해당 강의를 `open: true`로 변경

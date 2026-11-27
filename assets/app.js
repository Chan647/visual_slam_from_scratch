/* 공용 스크립트: 강의 목록, 진도, 코드 복사, 연습문제 저장.
   새 강의를 추가할 때는 LESSONS에서 open:true로 바꾸고 lessons/lesson-NN.html 파일을 만든다. */
window.SLAM = (() => {
  const LESSONS = [
    { n: 1, p: 1, t: "강체 변환과 좌표계", s: "강체 변환", d: "회전 행렬, 동차 좌표, T_wc 표기법과 역변환", open: true },
    { n: 2, p: 1, t: "회전 표현: 오일러각, 축-각, 쿼터니언", s: "회전 표현", d: "짐벌 락, 로드리게스 공식, 쿼터니언 곱과 보간" },
    { n: 3, p: 1, t: "리 군과 리 대수: SO(3), SE(3)", s: "리 군", d: "exp/log 사상, 섭동 모델, 최적화에서 pose 다루기" },
    { n: 4, p: 1, t: "확률, 가우시안, 베이즈 추정", s: "확률", d: "공분산, 베이즈 규칙, 칼만 필터의 뿌리" },
    { n: 5, p: 1, t: "최소제곱, 가우스-뉴턴, LM", s: "최적화", d: "야코비안, 정규방정식, Ceres와 g2o의 원리" },
    { n: 6, p: 2, t: "핀홀 카메라와 왜곡", s: "카메라 모델", d: "내부 파라미터, 투영, 왜곡 보정, optical frame" },
    { n: 7, p: 2, t: "특징점과 매칭", s: "특징점", d: "FAST, ORB, 디스크립터, 매칭과 이상치" },
    { n: 8, p: 2, t: "에피폴라 기하", s: "에피폴라", d: "기본 행렬, 필수 행렬, 8점 알고리즘" },
    { n: 9, p: 2, t: "삼각측량과 PnP", s: "PnP", d: "깊이 복원, PnP, RANSAC" },
    { n: 10, p: 2, t: "번들 조정", s: "번들 조정", d: "재투영 오차, 희소 구조, 슈어 보수" },
    { n: 11, p: 3, t: "VO 프론트엔드", s: "VO", d: "키프레임, 트래킹, 초기화" },
    { n: 12, p: 3, t: "백엔드와 포즈 그래프", s: "백엔드", d: "슬라이딩 윈도우, 마지널라이제이션, 포즈 그래프" },
    { n: 13, p: 3, t: "루프 클로저", s: "루프 클로저", d: "BoW, place recognition, 전역 최적화" },
    { n: 14, p: 3, t: "VIO", s: "VIO", d: "IMU 사전적분, 느슨한 결합과 강한 결합" },
    { n: 15, p: 3, t: "ORB-SLAM3 코드 리딩", s: "ORB-SLAM3", d: "스레드 구조, 아틀라스, 실데이터 실행" }
  ];
  const PARTS = { 1: "수학 기초", 2: "카메라 기하", 3: "SLAM 시스템" };
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = n => String(n).padStart(2, "0");
  const root = () => document.body.dataset.root || "";
  const href = L => root() + "lessons/lesson-" + pad(L.n) + ".html";
  const done = () => store.get("slam.done", {});
  const status = L => done()[L.n] ? "done" : (L.open ? "open" : "soon");
  const label = { done: "완료", open: "학습 중", soon: "예정" };

  function addCopy(scope) {
    for (const pre of scope.querySelectorAll("pre")) {
      const b = document.createElement("button");
      b.className = "btn copy"; b.type = "button"; b.textContent = "복사";
      b.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(pre.querySelector("code").textContent); b.textContent = "복사됨"; }
        catch (e) { b.textContent = "복사 안 됨"; }
        setTimeout(() => (b.textContent = "복사"), 1500);
      });
      pre.appendChild(b);
    }
  }

  function toc() {
    const box = document.getElementById("toc"); if (!box) return;
    const hs = [...document.querySelectorAll("article h2")];
    hs.forEach((h, i) => { if (!h.id) h.id = "s" + (i + 1); });
    box.innerHTML = "<b>이 강의의 내용</b>" + hs.map(h => `<a href="#${h.id}">${esc(h.textContent)}</a>`).join("");
  }

  function exercises(n) {
    const exs = [...document.querySelectorAll(".ex")]; if (!exs.length) return;
    const key = "slam.ans." + n, ans = store.get(key, {});
    exs.forEach((ex, i) => {
      const t = ex.querySelector("textarea");
      t.value = ans[i] || "";
      t.addEventListener("input", () => { ans[i] = t.value; store.set(key, ans); });
    });
    const msg = document.getElementById("ansMsg");
    document.getElementById("copyAns").addEventListener("click", async () => {
      const txt = `${n}강 연습문제 답안\n\n` + exs.map((ex, i) => `${ex.querySelector("h4").textContent}\n${(ans[i] || "").trim() || "(모르겠음)"}`).join("\n\n");
      try { await navigator.clipboard.writeText(txt); msg.textContent = "복사했다. 원하는 곳에 붙여 넣어 두자."; }
      catch (e) { msg.textContent = "복사가 막혔다. 칸의 내용을 직접 선택해 복사하자."; }
    });
    const chk = document.getElementById("doneChk");
    const d = done(); chk.checked = !!d[n];
    chk.addEventListener("change", () => { const d2 = done(); d2[n] = chk.checked; store.set("slam.done", d2); });
  }

  function prevNext(n) {
    const box = document.getElementById("pn"); if (!box) return;
    const prev = LESSONS.find(l => l.n === n - 1), next = LESSONS.find(l => l.n === n + 1);
    const cell = (L, cls, word) => !L ? "<span></span>" :
      L.open ? `<a class="${cls}" href="${href(L)}"><small>${word} · ${L.n}강</small>${esc(L.t)}</a>`
             : `<span class="${cls}"><small>${word} · ${L.n}강 (준비 중)</small>${esc(L.t)}</span>`;
    box.innerHTML = cell(prev, "pv", "이전") + cell(next, "nx", "다음");
  }

  function lessonPage(n) { addCopy(document); toc(); exercises(n); prevNext(n); }

  return { LESSONS, PARTS, store, esc, href, status, label, done, lessonPage };
})();

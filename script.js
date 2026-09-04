/* 오토지니 채용공고 - script.js */
document.addEventListener("DOMContentLoaded", function () {
  /* =========================================================
     이력서 / 지원서 접수 폼 전송
     - 화면은 빠르게 접수 완료 처리
     - Apps Script 전송은 백그라운드 진행
  ========================================================= */
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyiMES_mdI1rGSWIZJcI24h69HP1dlRxuEx5UM6BjOxSke9nKi0UW_j7hQqpwy7uZrH/exec";

  const form = document.getElementById("applyForm");
  const phoneInput = document.getElementById("phone");

  /* =========================================================
     연락처 자동 하이픈 / 숫자 11자리 제한
     - 숫자가 아닌 문자는 자동 제거
     - 최대 11자리까지만 허용
     - 010-1234-5678 형태로 자동 변환
  ========================================================= */
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      const digits = this.value.replace(/\D/g, "").slice(0, 11);

      if (digits.length <= 3) {
        this.value = digits;
      } else if (digits.length <= 7) {
        this.value = digits.slice(0, 3) + "-" + digits.slice(3);
      } else {
        this.value =
          digits.slice(0, 3) +
          "-" +
          digits.slice(3, 7) +
          "-" +
          digits.slice(7, 11);
      }
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const submitBtn =
        form.querySelector('button[type="submit"]') || form.querySelector(".af-submit");

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "접수 중...";
      }

      const formData = new FormData(form);
      formData.append("접수페이지", location.href);
      formData.append("접수시간", new Date().toLocaleString("ko-KR"));

      /*
        Apps Script의 e.parameter로 안정적으로 받기 위해
        FormData를 URLSearchParams 방식으로 변환
      */
      const bodyData = new URLSearchParams();

      for (const pair of formData.entries()) {
        bodyData.append(pair[0], pair[1]);
      }

      /*
        실제 전송은 백그라운드로 실행
        no-cors 방식이라 브라우저에서 성공/실패 응답을 정확히 읽지는 않음
      */
      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: bodyData.toString(),
      }).catch(function (error) {
        console.error("[오토지니 지원폼] fetch 오류:", error);
      });

      /*
        사용자 화면은 즉시 접수 완료로 변경
      */
      form.innerHTML =
        '<div style="text-align:center;padding:40px 0">' +
        '<div style="font-size:48px;margin-bottom:16px">✅</div>' +
        '<div style="font-size:20px;font-weight:900;color:#111;margin-bottom:8px">지원서가 접수되었습니다!</div>' +
        '<div style="font-size:14px;color:#999;line-height:1.7">인사 담당자가 순차적으로 연락을 드립니다.</div>' +
        "</div>";
    });
  }

  /* =========================================================
     스크롤 애니메이션
  ========================================================= */
  var sel =
    ".sec-label,.sec-title,.sec-desc," +
    ".hero-sub,.hero-title,.hero-quote," +
    ".about-top,.chart-wrap,.chart-bubble," +
    ".ideal-row," +
    ".why-card,.why-n,.why-t,.why-d," +
    /* 승진기회: 큰 패널이 아니라 실제 차트/단계 내용 각각 애니메이션 */
    ".career-growth__desc,.career-growth__line,.career-growth__step,.career-growth__benefit," +
    /* DB 제공: 래퍼가 아닌 내부 카피/아이콘/채널 카드 각각 애니메이션 */
    ".sales-support__featured-copy,.sales-support__db-icon,.sales-support__channel," +
    ".commission-card,.commission-card__head,.commission-chart__item," +
    ".work-process__item," +
    ".job-sec,.sidebar,.jl li,.ins-chip,.proc-s,.s-card," +
    ".ben-box,.ben-header,.ben-card," +
    ".settlement-support__content,.settlement-support__highlight," +
    ".cta-t,.cta-d,.cta-btn,.cta-c," +
    ".foot-logo,.foot-info";
  var els = Array.from(document.querySelectorAll(sel));

  if (!els.length) return;

  els.forEach(function (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.55s ease,transform 0.55s ease";
  });

  /* 섹션별 등장 순서를 미리 계산합니다. 부모/자식 중첩 여부와 무관하게 작동합니다. */
  els.forEach(function (el) {
    var section = el.closest("section") || document.body;
    var group = els.filter(function (item) {
      return (item.closest("section") || document.body) === section;
    });
    el.dataset.revealOrder = String(group.indexOf(el));
  });

  /* 승진 차트의 상승 라인은 스크롤 진입 시 왼쪽→오른쪽으로 그려지게 처리 */
  var careerPath = document.querySelector(".career-growth__line-path");
  if (careerPath && typeof careerPath.getTotalLength === "function") {
    var careerLength = careerPath.getTotalLength();
    careerPath.style.strokeDasharray = String(careerLength);
    careerPath.style.strokeDashoffset = String(careerLength);
    careerPath.style.transition = "stroke-dashoffset 1.05s cubic-bezier(.22,.61,.36,1) 0.12s";
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;

        var idx = Number(e.target.dataset.revealOrder || 0);
        var delay = Math.min(idx * 85, 520);

        setTimeout(function () {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0)";

          if (e.target.classList.contains("career-growth__line") && careerPath) {
            careerPath.style.strokeDashoffset = "0";
          }
        }, delay);

        io.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );

  els.forEach(function (el) {
    io.observe(el);
  });
});

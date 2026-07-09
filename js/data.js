// TODO: 추후 서버/DB에서 fetch 로 교체
// 지금은 통합과학 1 기초 단어 하드코딩
const WORD_POOL = [
  "빅뱅",
  "원자",
  "전자",
  "양성자",
  "중성자",
  "수소",
  "헬륨",
  "은하",
  "별",
  "핵융합",
  "규산염",
  "지각",
  "맨틀",
  "광합성",
  "세포",
  "DNA",
  "단백질",
  "이온",
  "산화",
  "환원",
  "산성비",
  "온실효과",
  "생태계",
  "에너지"
];

function getRandomWord() {
  return WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
}

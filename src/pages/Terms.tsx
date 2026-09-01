const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. 목적",
    body: "이 약관은 '선택하다'(이하 '서비스')가 제공하는 투표하기·주제추천·광고판 이용과 관련해 운영자와 이용자의 권리·의무를 정합니다.",
  },
  {
    title: "2. 서비스의 내용",
    body: "서비스는 매일 하나의 주제에 대해 회원이 하나의 보기를 선택하고, 그 결과를 실시간 집계로 보여주는 비공식 설문 서비스입니다. 통계적으로 대표성 있는 표본을 구성하지 않으며, 공직선거법상 선거에 관한 여론조사가 아닙니다. 특정 후보자·정당·선거에 관한 주제는 다루지 않습니다.",
  },
  {
    title: "3. 회원가입과 탈퇴",
    body: "이메일과 비밀번호로 가입하며, 1인 1계정을 원칙으로 합니다. 회원은 언제든 서비스 내 '계정' 화면에서 탈퇴할 수 있고, 탈퇴 시 계정 정보와 투표 기록은 지체 없이 삭제됩니다.",
  },
  {
    title: "4. 이용자의 의무",
    body: "이용자는 다음 행위를 해서는 안 됩니다.\n- 여러 계정을 만들어 중복으로 투표하는 행위\n- 자동화된 프로그램(봇)으로 계정을 만들거나 투표하는 행위\n- 타인의 계정을 무단으로 사용하는 행위\n- 허위 사실이나 타인의 권리를 침해하는 내용을 주제로 추천하는 행위",
  },
  {
    title: "5. 서비스의 변경·중단",
    body: "운영자는 서비스의 전부 또는 일부를 사전 고지 후 변경하거나 중단할 수 있습니다. 운영상 불가피한 경우 사전 고지 없이 중단될 수 있습니다.",
  },
  {
    title: "6. 면책",
    body: "서비스의 투표 결과는 참고용이며, 이를 근거로 한 의사결정에 대해 운영자는 책임지지 않습니다. 운영자는 천재지변, 서비스 제공업체(Supabase 등)의 장애 등 통제할 수 없는 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.",
  },
  {
    title: "7. 문의",
    body: "서비스 이용과 관련한 문의는 아래 개인정보처리방침에 기재된 연락처로 해주세요.",
  },
];

export default function Terms() {
  return (
    <div className="mx-auto max-w-content px-6 py-16 md:py-24">
      <p className="mb-6 text-xs tracking-[0.25em] text-muted">이용약관</p>
      <h1 className="mb-12 text-3xl font-semibold tracking-tight">이용약관</h1>

      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-base font-medium">{section.title}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <p className="mt-16 text-xs text-muted">시행일: 2026년 9월 1일</p>
    </div>
  );
}

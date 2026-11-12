const CONTACT_EMAIL = "lhsno123@gmail.com";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: "필수: 이메일 주소. 이메일/비밀번호로 가입한 경우 비밀번호(암호화 저장, 원문 미보관). 구글·카카오로 가입한 경우 해당 계정이 제공하는 이메일·식별 정보. 연령대(10대~50대 중 선택).\n선택(민감정보): 신념(정치적 성향 — 중도/보수/진보/해당없음). 별도 동의를 받은 경우에만 수집하며, 동의하지 않아도 서비스 이용에는 영향이 없습니다.",
  },
  {
    title: "2. 수집 목적",
    body: "회원 식별과 1인 1표 확인, 투표 결과를 연령대·성향별로 분석하는 통계 목적으로 사용합니다. 광고·마케팅 목적으로 이용하지 않습니다.",
  },
  {
    title: "3. 보유 및 이용 기간",
    body: "회원 탈퇴 시 지체 없이 파기합니다. 별도의 법령상 보관 의무가 있는 정보는 없습니다.",
  },
  {
    title: "4. 제3자 제공 및 처리위탁",
    body: "개인정보를 외부에 판매하거나 제공하지 않습니다. 다만 서비스 운영을 위해 인증·데이터베이스 처리를 Supabase(해외 서비스)에, 매크로(자동 가입) 방지를 위해 보안 확인 절차를 Cloudflare에 위탁하고 있으며, 각 위탁받은 범위 내에서만 정보를 처리합니다. 구글·카카오 로그인을 이용하면 해당 회사의 인증 절차를 거칩니다.",
  },
  {
    title: "5. 이용자의 권리",
    body: "이용자는 언제든 본인의 개인정보를 열람·정정할 수 있고, 서비스 내 '계정' 화면에서 직접 탈퇴(삭제)할 수 있습니다. 민감정보(신념) 수집에 동의한 뒤에도 '계정' 화면이나 아래 연락처를 통해 언제든 동의를 철회할 수 있습니다. 탈퇴 외의 방법으로 삭제를 원하는 경우 아래 연락처로 요청할 수 있습니다.",
  },
  {
    title: "6. 안전성 확보 조치",
    body: "비밀번호는 암호화하여 저장하고, 데이터베이스 접근에는 Row Level Security를 적용해 본인 정보 외에는 조회·수정할 수 없도록 제한합니다.",
  },
  {
    title: "7. 문의처",
    body: `개인정보 관련 문의는 ${CONTACT_EMAIL} 로 연락해 주세요.`,
  },
];

export default function Privacy() {
  return (
    <div className="mx-auto max-w-content px-6 py-16 md:py-24">
      <p className="mb-6 text-xs tracking-[0.25em] text-muted">개인정보처리방침</p>
      <h1 className="mb-12 text-3xl font-semibold tracking-tight">개인정보처리방침</h1>

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

      <p className="mt-16 text-xs text-muted">시행일: 2026년 11월 12일</p>
    </div>
  );
}

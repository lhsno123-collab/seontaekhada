const CONTACT_EMAIL = "lhsno123@gmail.com";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: "회원가입 시 이메일 주소와 비밀번호(암호화 저장)를 수집합니다. 비밀번호는 원문이 저장되지 않고 해시 값으로만 저장됩니다.",
  },
  {
    title: "2. 수집 목적",
    body: "회원 식별과 1인 1표 확인을 위해 사용합니다. 광고·마케팅 목적으로 이용하지 않습니다.",
  },
  {
    title: "3. 보유 및 이용 기간",
    body: "회원 탈퇴 시 지체 없이 파기합니다. 별도의 법령상 보관 의무가 있는 정보는 없습니다.",
  },
  {
    title: "4. 제3자 제공 및 처리위탁",
    body: "개인정보를 외부에 판매하거나 제공하지 않습니다. 다만 서비스 운영을 위해 인증·데이터베이스 처리를 Supabase(해외 서비스)에 위탁하고 있으며, Supabase는 위탁받은 범위 내에서만 정보를 처리합니다.",
  },
  {
    title: "5. 이용자의 권리",
    body: "이용자는 언제든 본인의 개인정보를 열람·정정할 수 있고, 서비스 내 '계정' 화면에서 직접 탈퇴(삭제)할 수 있습니다. 탈퇴 외의 방법으로 삭제를 원하는 경우 아래 연락처로 요청할 수 있습니다.",
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

      <p className="mt-16 text-xs text-muted">시행일: 2026년 9월 1일</p>
    </div>
  );
}

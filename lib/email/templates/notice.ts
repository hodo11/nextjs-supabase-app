function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

interface NoticeEmailInput {
  groupName: string;
  eventTitle: string;
  notice: string;
  eventUrl: string;
}

// 공지 메일 템플릿. 리마인드·정산 메일도 이 형식을 재사용한다.
export function renderNoticeEmail({
  groupName,
  eventTitle,
  notice,
  eventUrl,
}: NoticeEmailInput) {
  return {
    subject: `[${groupName}] ${eventTitle} 공지`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <p><strong>${escapeHtml(groupName)}</strong>의 <strong>${escapeHtml(eventTitle)}</strong> 이벤트에 새 공지가 등록되었습니다.</p>
        <p style="white-space: pre-wrap; border-left: 3px solid #ddd; padding-left: 12px;">${escapeHtml(notice)}</p>
        <p><a href="${eventUrl}">이벤트 보러 가기</a></p>
      </div>
    `,
  };
}

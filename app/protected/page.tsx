import { redirect } from "next/navigation";

// 스타터킷 튜토리얼 페이지. 실제 진입점은 /home으로 이전했다.
export default function ProtectedPage() {
  redirect("/home");
}

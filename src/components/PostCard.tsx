"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, hasLiked, isBookmarked, likePostOnce, unlikePost, toggleBookmark } from "@/lib/storage";
import { RoleBadge } from "./Badges";
import { SwipeableRow } from "./SwipeableRow";
import { showToast } from "@/lib/toast";
import type { Post } from "@/types";

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

const CATEGORY_COLOR: Record<string, string> = {
  자유: "bg-gray-100 text-gray-600",
  공동구매: "bg-rose-50 text-rose-600",
  중고거래: "bg-amber-50 text-amber-700",
  무료나눔: "bg-emerald-50 text-emerald-700",
  소모임: "bg-violet-50 text-violet-700",
  꿀팁: "bg-sky-50 text-sky-700",
  민원: "bg-orange-50 text-orange-700",
  질문: "bg-indigo-50 text-indigo-700",
};

export function PostCard({ post, channelTitle, showDM = true, swipeable = true }: { post: Post; channelTitle?: string; showDM?: boolean; swipeable?: boolean }) {
  const router = useRouter();

  const onDM = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const me = getUser();
    if (!me) {
      router.push("/onboarding");
      return;
    }
    if (me.id === post.authorId) return; // 자기 자신에게는 DM 불가
    router.push(`/dm/${encodeURIComponent(post.authorId)}`);
  };

  const onSwipeLike = () => {
    if (!hasLiked(post.id)) {
      likePostOnce(post.id);
      showToast({ kind: "success", title: "좋아요 ❤️" });
    } else {
      unlikePost(post.id);
      showToast({ kind: "info", title: "좋아요 취소" });
    }
    setTimeout(() => window.location.reload(), 100);
  };

  const onSwipeSave = () => {
    if (!isBookmarked(post.id)) {
      toggleBookmark(post.id);
      showToast({ kind: "success", title: "저장 ⭐" });
    } else {
      toggleBookmark(post.id);
      showToast({ kind: "info", title: "저장 해제" });
    }
    setTimeout(() => window.location.reload(), 100);
  };

  const card = (
    <Link
      href={`/post/${post.id}`}
      className="block bg-white border-b border-concrete-100 px-4 py-3 active:bg-concrete-50"
    >
      {channelTitle && (
        <div className="text-[11px] text-gray-400 mb-1.5">{channelTitle}</div>
      )}
      <div className="flex items-center gap-2 mb-1.5">
        <RoleBadge role={post.authorRole} size="xs" />
        <span className="text-xs font-medium text-gray-700">{post.authorNickname}</span>
        <span className="text-[11px] text-gray-400">· {timeAgo(post.createdAt)}</span>
        {showDM && (
          <button
            onClick={onDM}
            className="ml-auto text-[11px] text-officelink-primary font-semibold"
          >
            💬 DM
          </button>
        )}
      </div>
      <div className="text-[15px] font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
        {post.title}
      </div>
      <div className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-2">
        {post.content}
      </div>
      {post.images && post.images.length > 0 && (
        <div className="flex gap-1.5 mb-2">
          {post.images.slice(0, 4).map((src, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-soft overflow-hidden border border-concrete-200 bg-concrete-100 shrink-0"
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {post.images.length > 4 && (
            <div className="w-16 h-16 rounded-soft bg-concrete-100 flex items-center justify-center text-xs text-concrete-500">
              +{post.images.length - 4}
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
            CATEGORY_COLOR[post.category] || "bg-gray-100 text-gray-600"
          }`}
        >
          {post.category}
        </span>
        <span>👍 {post.likes}</span>
        <span>💬 {post.commentCount}</span>
        <span>👁 {post.views}</span>
      </div>
    </Link>
  );

  if (!swipeable) return card;

  return (
    <SwipeableRow
      onSwipeLeft={onSwipeLike}
      onSwipeRight={onSwipeSave}
      leftLabel="👍 좋아요"
      rightLabel="⭐ 저장"
    >
      {card}
    </SwipeableRow>
  );
}

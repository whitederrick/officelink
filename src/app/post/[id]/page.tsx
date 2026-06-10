"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  addComment,
  addNotification,
  getChannel,
  getComments,
  getPost,
  getUser,
  hasLiked,
  incrementView,
  isBookmarked,
  likePostOnce,
  toggleBookmark,
  uid,
  unlikePost,
} from "@/lib/storage";
import { RoleBadge } from "@/components/Badges";
import { showToast } from "@/lib/toast";
import type { Comment, Post } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function PostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [mounted, setMounted] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [channelTitle, setChannelTitle] = useState("");
  const [draft, setDraft] = useState("");
  const [bump, setBump] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    const p = getPost(params.id);
    if (!p) {
      router.replace("/");
      return;
    }
    incrementView(p.id);
    setPost({ ...p, views: p.views + 1 });
    setComments(getComments(p.id));
    setLiked(hasLiked(p.id));
    setBookmarked(isBookmarked(p.id));
    const ch = getChannel(p.channelId);
    setChannelTitle(ch?.title || "");
  }, [router, params.id]);

  const refresh = () => {
    const p = getPost(params.id);
    if (p) setPost(p);
    setComments(getComments(params.id));
    setBump((b) => b + 1);
  };

  const onLike = () => {
    const u = getUser();
    if (!u || !post) return;
    if (liked) {
      unlikePost(params.id);
      setLiked(false);
    } else {
      likePostOnce(params.id);
      setLiked(true);
      // 게시글 작성자에게 알림
      if (post.authorId !== u.id) {
        addNotification({
          id: uid(),
          type: "like",
          recipientId: post.authorId,
          actorNickname: u.nickname,
          actorRole: u.role,
          postId: post.id,
          message: `내 글 “${post.title}”을 좋아합니다.`,
          read: false,
          createdAt: Date.now(),
        });
      }
    }
    refresh();
  };

  const onBookmark = () => {
    toggleBookmark(params.id);
    const next = !bookmarked;
    setBookmarked(next);
    showToast({
      kind: next ? "success" : "info",
      title: next ? "저장 완료" : "저장 해제",
    });
  };

  const submitComment = () => {
    const u = getUser();
    if (!u || !post) return;
    if (!draft.trim()) {
      alert("댓글을 입력해주세요.");
      return;
    }
    const c: Comment = {
      id: uid(),
      postId: params.id,
      authorId: u.id,
      authorNickname: u.nickname,
      authorRole: u.role,
      content: draft.trim(),
      likes: 0,
      createdAt: Date.now(),
    };
    addComment(c);
    showToast({ kind: "success", title: "댓글 등록됨" });
    // 작성자에게 알림
    if (post.authorId !== u.id) {
      addNotification({
        id: uid(),
        type: "comment",
        recipientId: post.authorId,
        actorNickname: u.nickname,
        actorRole: u.role,
        postId: post.id,
        commentId: c.id,
        message: `내 글 “${post.title}”에 댓글을 남겼습니다.`,
        read: false,
        createdAt: Date.now(),
      });
    }
    setDraft("");
    refresh();
  };

  if (!mounted || !post) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* 헤더 */}
      <div className="sticky top-12 z-20 bg-white border-b border-gray-100 px-4 h-12 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg">‹</button>
        <div className="flex-1 text-sm font-semibold truncate">게시글</div>
      </div>

      <div className="px-4 py-4 border-b border-gray-100">
        <div className="text-[11px] text-gray-400 mb-1">{channelTitle}</div>
        <div className="flex items-center gap-2 mb-2">
          <RoleBadge role={post.authorRole} size="xs" />
          <span className="text-xs font-medium text-gray-700">{post.authorNickname}</span>
          <span className="text-[11px] text-gray-400">· {timeAgo(post.createdAt)}</span>
        </div>
        <h1 className="text-lg font-bold leading-snug mb-3">{post.title}</h1>
        <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap mb-4">
          {post.content}
        </div>
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {post.images.map((src, i) => (
              <div
                key={i}
                className="aspect-square rounded-soft overflow-hidden border border-concrete-200 bg-concrete-100"
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>👍 {post.likes}</span>
          <span>💬 {post.commentCount}</span>
          <span>👁 {post.views}</span>
          <span className="ml-auto text-[11px] px-2 py-0.5 bg-gray-100 rounded">
            #{post.category}
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={onLike}
            className={`flex-1 h-9 text-sm border rounded-lg active:bg-gray-50 ${
              liked
                ? "border-officelink-primary text-officelink-primary font-semibold"
                : "border-gray-200"
            }`}
          >
            {liked ? "❤️ 공감함" : "👍 공감"}
          </button>
          <button
            onClick={onBookmark}
            className={`flex-1 h-9 text-sm border rounded-lg active:bg-gray-50 ${
              bookmarked
                ? "border-amber-400 text-amber-600 font-semibold"
                : "border-gray-200"
            }`}
          >
            {bookmarked ? "★ 저장됨" : "☆ 저장"}
          </button>
        </div>
      </div>

      {/* 댓글 */}
      <div className="px-4 py-3">
        <div className="text-sm font-semibold mb-2">댓글 {comments.length}</div>
        {comments.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            첫 댓글을 남겨보세요.
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <RoleBadge role={c.authorRole} size="xs" />
                    <span className="text-xs font-medium text-gray-700">
                      {c.authorNickname}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      · {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-800 leading-relaxed">
                    {c.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 댓글 입력 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200">
        <div className="app-shell px-3 py-2 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitComment();
              }
            }}
            placeholder="댓글을 입력하세요."
            className="flex-1 h-10 px-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-officelink-primary"
          />
          <button
            onClick={submitComment}
            disabled={!draft.trim()}
            className={`h-10 px-4 text-sm rounded-full font-semibold ${
              draft.trim()
                ? "bg-officelink-primary text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

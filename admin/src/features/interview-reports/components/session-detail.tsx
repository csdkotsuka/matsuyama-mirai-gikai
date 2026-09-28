import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, MessageCircle } from "lucide-react";
import type { InterviewSessionDetail } from "../types";
import { formatDuration, getSessionStatus } from "../types";
import { SessionStatusBadge } from "./session-status-badge";
import { StanceBadge } from "./stance-badge";

interface SessionDetailProps {
  session: InterviewSessionDetail;
}

export function SessionDetail({ session }: SessionDetailProps) {
  const startedAt =
    session.started_at || session.created_at || new Date().toISOString();
  const status = getSessionStatus(session);
  const duration = formatDuration(startedAt, session.completed_at);
  const report = session.interview_report;
  const messages = session.interview_messages;

  return (
    <div className="space-y-6">
      {/* セッション情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">セッション情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">セッションID</div>
              <div className="font-mono text-sm">{session.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">ステータス</div>
              <div className="mt-1">
                <SessionStatusBadge status={status} />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">開始時刻</div>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                {new Date(startedAt).toLocaleString("ja-JP")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">所要時間</div>
              <div className="text-sm">{duration}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">ユーザーID</div>
              <div className="font-mono text-sm text-gray-600">
                {session.user_id || session.user_identifier || "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">メッセージ数</div>
              <div className="flex items-center gap-1 text-sm">
                <MessageCircle className="h-4 w-4 text-gray-400" />
                {messages.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* インタビューレポート */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">インタビューレポート</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">スタンス</div>
                <div>
                  <StanceBadge stance={report.stance ?? null} />
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">役割</div>
                <div className="text-sm font-medium">{report.role || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">役割の説明</div>
                <div className="text-sm text-gray-700">
                  {report.role_description || "-"}
                </div>
              </div>
            </div>

            {report.summary && (
              <div>
                <div className="text-sm text-gray-500 mb-1">要約</div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {report.summary}
                </p>
              </div>
            )}

            {report.opinions && (
              <div>
                <div className="text-sm text-gray-500 mb-1">意見詳細</div>
                <div className="bg-gray-50 p-4 rounded-md text-sm">
                  <pre className="whitespace-pre-wrap font-sans">
                    {JSON.stringify(report.opinions, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* メッセージ履歴 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">メッセージ履歴</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">送信者</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead className="w-40">送信時刻</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            message.role === "assistant"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {message.role === "assistant" ? "AI" : "ユーザー"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-pre-wrap">
                        {message.content}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {message.created_at
                          ? new Date(message.created_at).toLocaleString("ja-JP")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">メッセージはありません</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
